import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, badRequest, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { levelFromXp, tierFromXp, xpFromAttempt } from '@/lib/server/gamification';
import { serializeAttempt, serializeBadge } from '@/lib/server/serializers';
import { sendCertificateReadyEmail } from '@/lib/server/email';

const schema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().optional(),
      text: z.string().optional(),
    }),
  ),
});

export const POST = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireUser(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest('Invalid submission');

    const competition = await prisma.competition.findUnique({
      where: { id: params.id },
      include: { questions: { include: { options: true } } },
    });
    if (!competition) return notFound('Competition not found');

    // Idempotency: one attempt per user per competition.
    const existing = await prisma.attempt.findUnique({
      where: { userId_competitionId: { userId: user.id, competitionId: competition.id } },
    });
    if (existing) return badRequest('You’ve already submitted this competition');

    // Score it.
    const answersByQ = new Map(parsed.data.answers.map((a) => [a.questionId, a]));
    let score = 0;
    let maxScore = 0;
    const answerRows: {
      questionId: string;
      optionId?: string;
      text?: string;
      correct: boolean;
      marksAwarded: number;
    }[] = [];

    for (const q of competition.questions) {
      maxScore += q.marks;
      const a = answersByQ.get(q.id);
      let correct = false;
      let awarded = 0;
      if (a) {
        if (q.type === 'short' || q.type === 'long') {
          if (a.text && a.text.trim().length > 8) {
            correct = true;
            awarded = Math.round(q.marks * 0.8);
          }
        } else if (a.optionId && q.correctOptionId && a.optionId === q.correctOptionId) {
          correct = true;
          awarded = q.marks;
        }
      }
      score += awarded;
      answerRows.push({
        questionId: q.id,
        optionId: a?.optionId,
        text: a?.text,
        correct,
        marksAwarded: awarded,
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= competition.passThreshold;
    const xpEarned = xpFromAttempt(percentage);
    const newXpTotal = user.xpTotal + xpEarned;
    const { level, xpInLevel, xpForLevel } = levelFromXp(newXpTotal);
    const tier = tierFromXp(newXpTotal);

    // Compute rank against existing attempts.
    const cohort = await prisma.attempt.findMany({
      where: { competitionId: competition.id },
      select: { score: true, timeTakenSec: true },
    });
    const totalParticipants = cohort.length + 1;
    const rank =
      cohort.filter((a) => a.score > score || (a.score === score && a.timeTakenSec > 0)).length + 1;

    // Determine which badges to award (idempotently).
    const ownedBadgeIds = new Set(
      (await prisma.userBadge.findMany({ where: { userId: user.id } })).map((b) => b.badgeId),
    );
    const allBadges = await prisma.badge.findMany();
    const earnedSlugs: string[] = [];
    const attemptCount =
      (await prisma.attempt.count({ where: { userId: user.id } })) + 1; // including the new one
    const perfect = score === maxScore && maxScore > 0;
    const isRank1 = rank === 1;

    if (attemptCount === 1) earnedSlugs.push('first-steps');
    if (perfect) earnedSlugs.push('perfect-score');
    if (isRank1) earnedSlugs.push('top-of-class');
    if (passed) earnedSlugs.push('speed-demon');

    const toAward = allBadges.filter(
      (b) => earnedSlugs.includes(b.slug) && !ownedBadgeIds.has(b.id),
    );

    // Persist everything atomically.
    const attempt = await prisma.$transaction(async (tx) => {
      const created = await tx.attempt.create({
        data: {
          userId: user.id,
          competitionId: competition.id,
          score,
          maxScore,
          percentage,
          passed,
          rank,
          totalParticipants,
          timeTakenSec: 0,
          xpEarned,
          answers: { create: answerRows },
        },
        include: {
          competition: { select: { title: true } },
          user: { select: { name: true } },
          answers: { include: { question: true } },
        },
      });

      // Bump everyone else's totalParticipants in this competition.
      await tx.attempt.updateMany({
        where: { competitionId: competition.id, NOT: { id: created.id } },
        data: { totalParticipants },
      });

      // Update user XP / level / tier.
      const bonusXp = toAward.reduce((s, b) => s + b.xpReward, 0);
      const finalXp = newXpTotal + bonusXp;
      const { level: l, xpInLevel: x, xpForLevel: xf } = levelFromXp(finalXp);
      await tx.user.update({
        where: { id: user.id },
        data: {
          xpTotal: finalXp,
          level: l,
          xpInLevel: x,
          xpForLevel: xf,
          tier: tierFromXp(finalXp),
        },
      });

      // Award badges.
      if (toAward.length > 0) {
        await tx.userBadge.createMany({
          data: toAward.map((b) => ({ userId: user.id, badgeId: b.id })),
        });
      }

      // Activity feed event.
      await tx.activityEvent.create({
        data: {
          userId: user.id,
          type: 'score',
          text: `Scored ${percentage}% in ${competition.title}`,
        },
      });

      // Certificate if passed.
      let issuedCertificateId: string | null = null;
      if (passed) {
        const cert = await tx.certificate.upsert({
          where: {
            userId_competitionId: { userId: user.id, competitionId: competition.id },
          },
          create: {
            userId: user.id,
            competitionId: competition.id,
            score: percentage,
            rank,
            // We use the cert id as the PDF URL — the route renders on demand.
            // Updated below to the canonical URL once we know the cert id.
            pdfUrl: '',
            isPublic: false,
          },
          update: {},
        });
        issuedCertificateId = cert.id;
        if (!cert.pdfUrl) {
          await tx.certificate.update({
            where: { id: cert.id },
            data: { pdfUrl: `/api/certificates/${cert.id}` },
          });
        }
        await tx.activityEvent.create({
          data: {
            userId: user.id,
            type: 'certificate',
            text: `Received a certificate for ${competition.title}`,
          },
        });
      }

      // Stash for use after the tx (sending the email).
      (created as { _certId?: string })._certId = issuedCertificateId ?? undefined;
      return created;
    });

    // Fire-and-forget "certificate ready" email if one was issued.
    const certId = (attempt as { _certId?: string })._certId;
    if (certId) {
      void sendCertificateReadyEmail(user.email, user.name, competition.title, certId);
    }

    // Re-fetch with question relation so explanations / correct options serialize.
    const full = await prisma.attempt.findUnique({
      where: { id: attempt.id },
      include: {
        competition: { select: { title: true } },
        user: { select: { name: true } },
        answers: { include: { question: true } },
      },
    });
    void level; void xpInLevel; void xpForLevel; void tier; // silence unused warnings

    return ok(
      serializeAttempt(full!, toAward.map(serializeBadge)),
    );
  },
);
