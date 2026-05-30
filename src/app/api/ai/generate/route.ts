import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import type { NextRequest } from 'next/server';
import type { GeneratedQuestion, QuestionType } from '@/lib/types';
import { handle, badRequest, ok } from '@/lib/server/http';
import { requireRole } from '@/lib/server/session';
import { clientKey, limits } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';
// Allow up to 60s for the LLM call.
export const maxDuration = 60;

const schema = z.object({
  topic: z.string().min(3).max(200),
  count: z.number().int().min(1).max(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  type: z.enum(['mcq', 'true_false', 'mixed']),
});

// ---------------------------------------------------------------------------
// Provider selection: Groq first (free tier, fast), then OpenAI, then template.
// Both expose the same OpenAI-compatible chat completions API, so we use a
// single SDK with a different baseURL.
// ---------------------------------------------------------------------------

interface Provider {
  name: 'groq' | 'openai';
  client: OpenAI;
  model: string;
}

function pickProvider(): Provider | null {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      name: 'groq',
      client: new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' }),
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      name: 'openai',
      client: new OpenAI({ apiKey: openaiKey }),
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
  return null;
}

const provider = pickProvider();

// --------- LLM output schema (defensive) -----------------------------------
const llmQuestionSchema = z.object({
  type: z.enum(['mcq', 'true_false']),
  content: z.string().min(5),
  options: z
    .array(z.object({ id: z.string().min(1).max(8), text: z.string().min(1) }))
    .min(2),
  correctOptionId: z.string().min(1),
  explanation: z.string().min(5),
  marks: z.number().int().min(1).max(50).optional(),
});
const llmResponseSchema = z.object({ questions: z.array(llmQuestionSchema).min(1) });

// --------- Real LLM path ---------------------------------------------------
async function generateWithLLM(input: z.infer<typeof schema>): Promise<GeneratedQuestion[]> {
  if (!provider) throw new Error('No AI provider configured');

  const system = `You are an expert exam author for the CompeteIQ educational platform.
Generate high-quality assessment questions in strict JSON.
Rules:
- Difficulty MUST match the requested level.
- For MCQs: produce 4 options with stable ids "a","b","c","d"; exactly ONE correct.
- For true/false: produce 2 options with ids "true","false".
- Distractors must be plausible — never include "all of the above" or "none of the above".
- Explanations must be 1-2 sentences and reference the correct answer.
- Use clear academic language. Avoid trick questions.
- Return ONLY valid JSON — no prose, no markdown fences.`;

  const userPrompt = `Generate ${input.count} ${input.difficulty} questions about: "${input.topic}".
Question types: ${input.type === 'mixed' ? 'mix of mcq and true_false' : input.type}.
Respond with JSON matching this exact shape:
{
  "questions": [
    {
      "type": "mcq" | "true_false",
      "content": "string",
      "options": [{ "id": "a"|"b"|"c"|"d"|"true"|"false", "text": "string" }],
      "correctOptionId": "string",
      "explanation": "string",
      "marks": number
    }
  ]
}`;

  const response = await provider.client.chat.completions.create({
    model: provider.model,
    response_format: { type: 'json_object' },
    temperature: 0.7,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error(`Empty response from ${provider.name} (${provider.model})`);

  // Some models occasionally wrap JSON in ```json fences despite instructions.
  // Strip them defensively before parsing.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `${provider.name} returned non-JSON output: ${String(err)} (first 200 chars: "${cleaned.slice(0, 200)}")`,
    );
  }

  const parsed = llmResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Model output failed schema: ${parsed.error.message}`);
  }

  return parsed.data.questions.slice(0, input.count).map((q, i) => ({
    id: `gen-${i}`,
    type: q.type as QuestionType,
    content: q.content,
    options: q.options,
    correctOptionId: q.correctOptionId,
    marks: q.marks ?? (q.type === 'true_false' ? 5 : 10),
    explanation: q.explanation,
  }));
}

// --------- Templated fallback (no API key) ---------------------------------
function generateTemplated(input: z.infer<typeof schema>): GeneratedQuestion[] {
  const { topic, count, type } = input;
  return Array.from({ length: count }, (_, i): GeneratedQuestion => {
    const isTF = type === 'true_false' || (type === 'mixed' && i % 3 === 0);
    if (isTF) {
      return {
        id: `gen-${i}`,
        type: 'true_false',
        content: `True or False: ${topic} is governed by an inverse-square relationship. (Q${i + 1})`,
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' },
        ],
        correctOptionId: i % 2 === 0 ? 'true' : 'false',
        marks: 5,
        explanation: `This statement about ${topic} is ${i % 2 === 0 ? 'correct' : 'a common misconception'}.`,
      };
    }
    return {
      id: `gen-${i}`,
      type: 'mcq',
      content: `Which statement best describes a key principle of ${topic}? (Q${i + 1})`,
      options: [
        { id: 'a', text: `${topic} option A — distractor` },
        { id: 'b', text: `${topic} option B — the correct principle` },
        { id: 'c', text: `${topic} option C — distractor` },
        { id: 'd', text: `${topic} option D — distractor` },
      ],
      correctOptionId: 'b',
      marks: 10,
      explanation: `Option B correctly captures the core idea of ${topic}.`,
    };
  });
}

export const POST = handle(async (req: NextRequest) => {
  await requireRole(req, 'teacher', 'institute_admin');

  // Cost guardrail: cap generations per IP per hour.
  const rl = await limits.ai.limit(clientKey(req, 'ai'));
  if (!rl.success) {
    return NextResponse.json(
      { error: 'AI rate limit reached. Try again in an hour.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());

  if (provider) {
    try {
      const questions = await generateWithLLM(parsed.data);
      return ok(questions);
    } catch (err) {
      console.error(
        `[ai] ${provider.name} generation failed, falling back to template`,
        err,
      );
      return ok(generateTemplated(parsed.data));
    }
  }
  return ok(generateTemplated(parsed.data));
});
