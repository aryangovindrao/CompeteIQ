'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Medal,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import type { AttemptAnswer, LeaderboardEntry, Question } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useCompetition, useCompetitionQuestions, useCompetitionResult } from '@/lib/hooks';
import { competeSocket } from '@/lib/ws';
import { mockScoreDistribution } from '@/lib/mock';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { CircularProgress } from '@/components/ui/Progress';
import { Panel, ScoreDistributionChart } from '@/components/dashboard';
import { RewardOverlay } from '@/components/gamification';

const rankColor = ['#D4A017', '#9CA3AF', '#CD7F32'];

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-secondary shadow-sm">
        {icon}
      </span>
      <p className="mt-2 text-lg font-bold leading-none text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  );
}

function LiveRow({ entry }: { entry: LeaderboardEntry }) {
  const color = rankColor[entry.rank - 1];
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2',
        entry.isCurrentUser ? 'bg-primary-light ring-1 ring-primary/30' : 'hover:bg-surface-2',
      )}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={
          color ? { backgroundColor: `${color}22`, color } : { backgroundColor: '#F9FAFB', color: '#6B7280' }
        }
      >
        {entry.rank}
      </span>
      <Avatar name={entry.name} src={entry.avatarUrl} size="xs" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
        {entry.name}
        {entry.isCurrentUser && <span className="ml-1 text-xs text-primary">You</span>}
      </span>
      <span className="text-sm font-semibold text-text-primary">{entry.score ?? 0}%</span>
    </motion.div>
  );
}

function ReviewItem({
  index,
  question,
  answer,
}: {
  index: number;
  question: Question;
  answer?: AttemptAnswer;
}) {
  const correct = answer?.correct ?? false;
  const isChoice = !!(question.options && question.options.length > 0);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2">
          <span className="text-sm font-semibold text-text-muted">{index + 1}.</span>
          <p className="text-sm font-medium text-text-primary">{question.content}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            correct ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]',
          )}
        >
          {correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {answer?.marksAwarded ?? 0}/{question.marks}
        </span>
      </div>

      {isChoice ? (
        <div className="mt-3 space-y-2">
          {question.options!.map((opt) => {
            const isCorrect = opt.id === question.correctOptionId;
            const isPicked = opt.id === answer?.optionId;
            return (
              <div
                key={opt.id}
                className={cn(
                  'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
                  isCorrect
                    ? 'border-success/40 bg-[#ECFDF5] text-[#065F46]'
                    : isPicked
                      ? 'border-danger/40 bg-[#FEF2F2] text-[#991B1B]'
                      : 'border-border text-text-secondary',
                )}
              >
                <span>{opt.text}</span>
                {isCorrect && <span className="text-xs font-medium">Correct answer</span>}
                {isPicked && !isCorrect && <span className="text-xs font-medium">Your answer</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
            <p className="text-xs font-medium text-text-muted">Your answer</p>
            <p className="mt-0.5 text-text-primary">{answer?.text?.trim() || '— No answer —'}</p>
          </div>
          {question.correctAnswer && (
            <div className="rounded-md border border-success/30 bg-[#ECFDF5] px-3 py-2">
              <p className="text-xs font-medium text-[#065F46]">Sample answer</p>
              <p className="mt-0.5 text-[#065F46]">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {question.explanation && (
        <p className="mt-3 rounded-md bg-primary-light px-3 py-2 text-xs text-text-secondary">
          <span className="font-semibold text-primary">Explanation: </span>
          {question.explanation}
        </p>
      )}
    </div>
  );
}

export function ResultsView({ id }: { id: string }) {
  const { user, token } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'institute_admin';

  const { data: attempt, isLoading } = useCompetitionResult(id);
  const { data: competition } = useCompetition(id);
  const { data: questions } = useCompetitionQuestions(id);

  const [liveRows, setLiveRows] = useState<LeaderboardEntry[]>([]);
  const [wsStatus, setWsStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>(
    'disconnected',
  );
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    competeSocket.connect(id, token ?? 'mock-token');
    const offRows = competeSocket.onLeaderboardUpdate(setLiveRows);
    const offStatus = competeSocket.onStatus(setWsStatus);
    return () => {
      offRows();
      offStatus();
      competeSocket.disconnect();
    };
  }, [id, token]);

  // Show the celebration overlay once, when arriving fresh from a submission.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('celebrate') === '1') {
      setShowReward(true);
    }
  }, []);

  const closeReward = () => {
    setShowReward(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/competitions/${id}/results`);
    }
  };

  if (isLoading || !attempt) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const passed = attempt.passed;
  const answerById = new Map((attempt.answers ?? []).map((a) => [a.questionId, a]));

  return (
    <div className="space-y-6">
      <Link
        href={`/competitions/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} /> Back to competition
      </Link>

      {/* Result hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-white p-6 shadow-card"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <CircularProgress
            value={attempt.percentage}
            size={132}
            stroke={12}
            trackClass="text-border"
            fillClass={passed ? 'text-success' : 'text-danger'}
          >
            <span className="text-3xl font-bold text-text-primary">{attempt.percentage}%</span>
            <span className="text-xs text-text-muted">Score</span>
          </CircularProgress>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-bold text-text-primary">
                {attempt.competitionTitle}
              </h1>
              <Badge tone={passed ? 'green' : 'red'} dot>
                {passed ? 'Passed' : 'Did not pass'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {passed
                ? 'Great work — you cleared the pass mark.'
                : `You needed ${competition?.passThreshold ?? 60}% to pass. Review and try again next time.`}
            </p>

            {attempt.newBadges && attempt.newBadges.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs font-medium text-text-muted">New badges:</span>
                {attempt.newBadges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    <span>{b.icon}</span> {b.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                icon={<Trophy size={16} />}
                label="Score"
                value={`${attempt.score}/${attempt.maxScore}`}
              />
              <StatTile
                icon={<Medal size={16} />}
                label="Rank"
                value={`#${attempt.rank} of ${attempt.totalParticipants}`}
              />
              <StatTile
                icon={<Clock size={16} />}
                label="Time taken"
                value={formatDuration(attempt.timeTakenSec)}
              />
              <StatTile
                icon={<Zap size={16} />}
                label="XP earned"
                value={`+${formatNumber(attempt.xpEarned)}`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Answer review */}
        <div className="lg:col-span-2">
          <Panel
            title="Answer review"
            subtitle={`${attempt.answers?.filter((a) => a.correct).length ?? 0} of ${
              attempt.answers?.length ?? 0
            } correct`}
            bodyClassName="space-y-3"
          >
            {questions && questions.length ? (
              questions.map((q, i) => (
                <ReviewItem key={q.id} index={i} question={q} answer={answerById.get(q.id)} />
              ))
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </Panel>
        </div>

        {/* Live leaderboard */}
        <div className="space-y-6">
          <Panel
            title="Live leaderboard"
            action={<LiveIndicator status={wsStatus} />}
            bodyClassName="space-y-1"
          >
            {liveRows.length ? (
              liveRows.slice(0, 10).map((e) => <LiveRow key={e.userId} entry={e} />)
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
          </Panel>

          {isStaff && (
            <Panel title="Score distribution" subtitle="All participants">
              <ScoreDistributionChart data={mockScoreDistribution} />
            </Panel>
          )}
        </div>
      </div>

      {isStaff && (
        <Panel title="Cohort summary">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              icon={<BarChart3 size={16} />}
              label="Participants"
              value={`${attempt.totalParticipants}`}
            />
            <StatTile icon={<Award size={16} />} label="Pass mark" value={`${competition?.passThreshold ?? 60}%`} />
            <StatTile icon={<Trophy size={16} />} label="Top score" value="98%" />
            <StatTile icon={<Medal size={16} />} label="Median" value="74%" />
          </div>
        </Panel>
      )}

      <RewardOverlay open={showReward} onClose={closeReward} attempt={attempt} />
    </div>
  );
}
