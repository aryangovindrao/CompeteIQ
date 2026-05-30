'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  FileUp,
  Layers,
  RotateCcw,
  Rocket,
  Settings2,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { GeneratedQuestion, QuestionType } from '@/lib/types';
import { aiApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { mockClasses } from '@/lib/mock';
import { PageHeader } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';

const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
];

const STEPS = [
  { n: 1, label: 'Setup', icon: Settings2 },
  { n: 2, label: 'Syllabus', icon: FileUp },
  { n: 3, label: 'Generate', icon: Sparkles },
  { n: 4, label: 'Publish', icon: Rocket },
] as const;

const questionTypeLabel: Record<QuestionType, string> = {
  mcq: 'Multiple choice',
  true_false: 'True / False',
  short: 'Short answer',
  long: 'Long answer',
  coding: 'Coding',
};

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        const Icon = s.icon;
        return (
          <div key={s.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  done && 'border-primary bg-primary text-white',
                  active && 'border-primary bg-primary-light text-primary',
                  !done && !active && 'border-border bg-white text-text-muted',
                )}
              >
                {done ? <Check size={16} /> : <Icon size={16} />}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  active || done ? 'text-text-primary' : 'text-text-muted',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-0.5 flex-1 rounded-full transition-colors',
                  step > s.n ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuestionReviewCard({
  q,
  index,
  onContentChange,
  onMarksChange,
  onRemove,
}: {
  q: GeneratedQuestion;
  index: number;
  onContentChange: (v: string) => void;
  onMarksChange: (v: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
            {index + 1}
          </span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary">
            {questionTypeLabel[q.type]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-text-muted">
            Marks
            <input
              type="number"
              min={1}
              max={100}
              value={q.marks}
              onChange={(e) => onMarksChange(Math.max(1, Number(e.target.value) || 1))}
              className="h-8 w-16 rounded-md border border-border px-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </label>
          <button
            onClick={onRemove}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Remove question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <Textarea
        className="mt-4"
        rows={2}
        value={q.content}
        onChange={(e) => onContentChange(e.target.value)}
      />

      {q.options && q.options.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => {
            const correct = o.id === q.correctOptionId;
            return (
              <div
                key={o.id}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  correct
                    ? 'border-success bg-success/10 font-medium text-text-primary'
                    : 'border-border text-text-secondary',
                )}
              >
                {correct ? (
                  <Check size={15} className="shrink-0 text-success" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" />
                )}
                {o.text}
              </div>
            );
          })}
        </div>
      )}

      {q.correctAnswer && (
        <p className="mt-3 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-text-secondary">
          <span className="font-medium text-success">Sample answer: </span>
          {q.correctAnswer}
        </p>
      )}

      {q.explanation && (
        <p className="mt-3 rounded-md bg-primary-light px-3 py-2 text-sm text-text-secondary">
          <span className="font-medium text-primary">Why: </span>
          {q.explanation}
        </p>
      )}
    </div>
  );
}

export function AiGeneratorView() {
  const [step, setStep] = useState(1);

  // Step 1 — setup
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [qType, setQType] = useState('mcq');
  const [count, setCount] = useState(8);

  // Step 2 — syllabus
  const [syllabus, setSyllabus] = useState<{ filename: string; chunks: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Step 3 — generation
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  // Step 4 — publish
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(mockClasses[0]?.id ?? '');
  const [startTime, setStartTime] = useState(toLocalInput(new Date(Date.now() + 86400_000)));
  const [durationMin, setDurationMin] = useState(45);
  const [passThreshold, setPassThreshold] = useState(60);
  const [publishing, setPublishing] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const res = await aiApi.uploadSyllabus(file, setProgress);
      setSyllabus(res);
      toast.success(`Indexed ${res.chunks} chunks from ${res.filename}`);
    } catch {
      toast.error('Upload failed. Please try a different file.');
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) void handleUpload(accepted[0]);
    },
    [handleUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const generate = async () => {
    setGenerating(true);
    try {
      const result = await aiApi.generate({ topic, count, difficulty, type: qType });
      setQuestions(result);
      if (!title) setTitle(`${topic} Challenge`);
      toast.success(`Generated ${result.length} questions`);
    } catch {
      toast.error('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const publish = async () => {
    if (title.trim().length < 3) {
      toast.error('Give your competition a title.');
      return;
    }
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPublishing(false);
    toast.success(`“${title}” published with ${questions.length} questions`);
    // Reset the wizard for the next competition.
    setStep(1);
    setTopic('');
    setSyllabus(null);
    setProgress(0);
    setQuestions([]);
    setTitle('');
  };

  const canContinue =
    (step === 1 && topic.trim().length >= 3) ||
    step === 2 ||
    (step === 3 && questions.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Question Generator"
        subtitle="Turn any topic or syllabus into a ready-to-run competition in minutes."
      />

      <div className="rounded-xl border border-border bg-white p-5 shadow-card">
        <Stepper step={step} />
      </div>

      {/* STEP 1 — SETUP */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <h2 className="text-base font-semibold text-text-primary">Competition setup</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Describe what you want to assess. The generator uses this to write questions.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Topic"
                placeholder="e.g. Newton’s Laws of Motion"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                hint="Be specific for sharper questions."
              />
            </div>
            <Select
              label="Subject"
              options={SUBJECTS.map((s) => ({ value: s, label: s }))}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Select
              label="Difficulty"
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
            <Select
              label="Question type"
              options={[
                { value: 'mcq', label: 'Multiple choice' },
                { value: 'true_false', label: 'True / False' },
                { value: 'mixed', label: 'Mixed' },
              ]}
              value={qType}
              onChange={(e) => setQType(e.target.value)}
            />
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Number of questions</label>
                <span className="text-sm font-semibold text-primary">{count}</span>
              </div>
              <div className="flex h-10 items-center">
                <Slider value={count} min={3} max={20} onChange={setCount} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              disabled={!canContinue}
              rightIcon={<ArrowRight size={16} />}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — SYLLABUS */}
      {step === 2 && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <h2 className="text-base font-semibold text-text-primary">
            Ground in your syllabus{' '}
            <span className="text-sm font-normal text-text-muted">(optional)</span>
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Upload course material and the generator will align questions to your curriculum.
          </p>

          {syllabus ? (
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-success/40 bg-success/5 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
                <FileText size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{syllabus.filename}</p>
                <p className="text-xs text-text-muted">
                  Indexed into {syllabus.chunks} searchable chunks
                </p>
              </div>
              <button
                onClick={() => {
                  setSyllabus(null);
                  setProgress(0);
                }}
                className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                isDragActive ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/50 hover:bg-surface-2',
                uploading && 'pointer-events-none opacity-70',
              )}
            >
              <input {...getInputProps()} />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                <UploadCloud size={24} />
              </span>
              {uploading ? (
                <div className="mt-4 w-full max-w-xs">
                  <p className="text-sm font-medium text-text-primary">Uploading & indexing…</p>
                  <div className="mt-2">
                    <Progress value={progress} max={100} />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{progress}%</p>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm font-medium text-text-primary">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop your syllabus, or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">PDF, DOCX or TXT — up to 20MB</p>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button rightIcon={<ArrowRight size={16} />} onClick={() => setStep(3)}>
              {syllabus ? 'Continue' : 'Skip for now'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — GENERATE & REVIEW */}
      {step === 3 && (
        <div className="space-y-5">
          {questions.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
              {generating ? (
                <div className="flex flex-col items-center py-6">
                  <Spinner className="h-8 w-8 text-primary" />
                  <p className="mt-4 text-sm font-medium text-text-primary">
                    Writing {count} questions on {topic}…
                  </p>
                  <p className="mt-1 text-xs text-text-muted">This usually takes a few seconds.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Sparkles size={26} />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-text-primary">
                    Ready to generate
                  </h2>
                  <p className="mt-1 max-w-md text-sm text-text-secondary">
                    {count} {difficulty} questions on <span className="font-medium">{topic}</span>
                    {syllabus ? ', grounded in your uploaded syllabus' : ''}.
                  </p>
                  <Button
                    className="mt-6"
                    leftIcon={<Sparkles size={16} />}
                    onClick={generate}
                  >
                    Generate questions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                    <Layers size={16} className="text-primary" /> {questions.length} questions
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-secondary">{totalMarks} total marks</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw size={15} />}
                  loading={generating}
                  onClick={generate}
                >
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <QuestionReviewCard
                    key={q.id}
                    q={q}
                    index={i}
                    onContentChange={(v) =>
                      setQuestions((prev) =>
                        prev.map((x) => (x.id === q.id ? { ...x, content: v } : x)),
                      )
                    }
                    onMarksChange={(v) =>
                      setQuestions((prev) =>
                        prev.map((x) => (x.id === q.id ? { ...x, marks: v } : x)),
                      )
                    }
                    onRemove={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              disabled={questions.length === 0}
              rightIcon={<ArrowRight size={16} />}
              onClick={() => setStep(4)}
            >
              Review & publish
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — PUBLISH */}
      {step === 4 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-border bg-white p-6 shadow-card">
              <h2 className="text-base font-semibold text-text-primary">Publish details</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Set when and how students take this competition.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Competition title"
                    placeholder="e.g. Newton’s Laws Sprint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <Select
                  label="Assign to class"
                  options={mockClasses.map((c) => ({ value: c.id, label: c.name }))}
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                />
                <Input
                  label="Start time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <span className="text-sm font-semibold text-primary">{durationMin} min</span>
                  </div>
                  <div className="flex h-10 items-center">
                    <Slider value={durationMin} min={10} max={180} step={5} onChange={setDurationMin} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Pass threshold</label>
                    <span className="text-sm font-semibold text-primary">{passThreshold}%</span>
                  </div>
                  <div className="flex h-10 items-center">
                    <Slider value={passThreshold} min={0} max={100} step={5} onChange={setPassThreshold} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white p-6 shadow-card">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Summary
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Topic</dt>
                  <dd className="font-medium text-text-primary">{topic}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Subject</dt>
                  <dd className="font-medium text-text-primary">{subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Difficulty</dt>
                  <dd className="font-medium capitalize text-text-primary">{difficulty}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Questions</dt>
                  <dd className="font-medium text-text-primary">{questions.length}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="text-text-secondary">Total marks</dt>
                  <dd className="font-bold text-text-primary">{totalMarks}</dd>
                </div>
              </dl>

              <Button
                fullWidth
                className="mt-6"
                leftIcon={<Rocket size={16} />}
                loading={publishing}
                onClick={publish}
              >
                Publish competition
              </Button>
              <Button
                variant="ghost"
                fullWidth
                className="mt-2"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => setStep(3)}
                disabled={publishing}
              >
                Back to questions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
