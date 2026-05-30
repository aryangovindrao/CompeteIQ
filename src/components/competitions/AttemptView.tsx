'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
  X,
} from 'lucide-react';
import type { AnswerInput, Competition, Question } from '@/lib/types';
import { useCompetition, useCompetitionQuestions, useSubmitAttempt, useTimer } from '@/lib/hooks';
import { cn, formatClock } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';

function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-surface-2">
      <Spinner className="h-7 w-7 text-primary" />
      <p className="text-sm text-text-secondary">Loading your competition…</p>
    </div>
  );
}

function AttemptRunner({
  id,
  competition,
  questions,
}: {
  id: string;
  competition: Competition;
  questions: Question[];
}) {
  const router = useRouter();
  const submitMutation = useSubmitAttempt(id);

  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [violations, setViolations] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);

  const total = questions.length;
  const q = questions[current];

  const isAnswered = (question: Question) => {
    const a = answers[question.id];
    return !!(a && (a.optionId || (a.text && a.text.trim().length > 0)));
  };
  const answeredCount = useMemo(
    () => questions.filter(isAnswered).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, questions],
  );

  const doSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      await submitMutation.mutateAsync(Object.values(answersRef.current));
      router.push(`/competitions/${id}/results?celebrate=1`);
    } catch {
      submittedRef.current = false;
      toast.error('Could not submit — please try again');
    }
  };

  // Stable ref so the timer's onExpire always calls the latest submit.
  const submitRef = useRef(doSubmit);
  submitRef.current = doSubmit;

  const remaining = useTimer(competition.durationMin * 60, () => {
    toast('Time is up — submitting your answers', { icon: '⏱️' });
    void submitRef.current();
  });

  // Anti-cheat: record tab switches / window blur.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setViolations((v) => v + 1);
        toast.error('Leaving the test tab is recorded');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Warn on accidental refresh / close.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const setOption = (questionId: string, optionId: string) =>
    setAnswers((a) => ({ ...a, [questionId]: { questionId, optionId } }));
  const setText = (questionId: string, text: string) =>
    setAnswers((a) => ({ ...a, [questionId]: { questionId, text } }));

  const toggleFlag = (questionId: string) =>
    setFlagged((f) => {
      const next = new Set(f);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });

  const lowTime = remaining <= 60;
  const isChoice = !!(q.options && q.options.length > 0);
  const currentAnswer = answers[q.id];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setExitOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
            aria-label="Exit attempt"
          >
            <X size={18} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{competition.title}</p>
            <p className="text-xs text-text-muted">
              Question {current + 1} of {total} · {answeredCount} answered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums',
              lowTime ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-text-primary',
            )}
          >
            <Clock size={15} />
            {formatClock(remaining)}
          </div>
          <Button size="sm" leftIcon={<Send size={14} />} onClick={() => setConfirmOpen(true)}>
            Submit
          </Button>
        </div>
      </header>

      {violations > 0 && (
        <div className="flex items-center gap-2 bg-warning/15 px-4 py-2 text-xs font-medium text-[#92400E] sm:px-6">
          <AlertTriangle size={14} />
          Tab switches recorded: {violations}. Stay on this page to avoid being flagged.
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                Question {current + 1}
                <span className="text-text-muted">·</span>
                {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
              </span>
              <button
                onClick={() => toggleFlag(q.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  flagged.has(q.id)
                    ? 'border-warning/40 bg-warning/10 text-[#92400E]'
                    : 'border-border text-text-secondary hover:bg-surface-2',
                )}
              >
                <Flag size={13} />
                {flagged.has(q.id) ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-relaxed text-text-primary">
              {q.content}
            </h2>

            <div className="mt-6 space-y-3">
              {isChoice ? (
                q.options!.map((opt) => {
                  const selected = currentAnswer?.optionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setOption(q.id, opt.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary-light text-text-primary'
                          : 'border-border bg-white text-text-secondary hover:border-primary/40 hover:bg-surface-2',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border text-text-muted',
                        )}
                      >
                        {selected ? <Check size={12} /> : opt.id.toUpperCase().slice(0, 1)}
                      </span>
                      {opt.text}
                    </button>
                  );
                })
              ) : (
                <Textarea
                  rows={competition.type === 'coding' || q.type === 'coding' ? 10 : 6}
                  placeholder="Type your answer here…"
                  value={currentAnswer?.text ?? ''}
                  onChange={(e) => setText(q.id, e.target.value)}
                  className={
                    q.type === 'coding' ? 'font-mono text-[13px]' : undefined
                  }
                />
              )}
            </div>

            {/* Footer nav */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="secondary"
                leftIcon={<ChevronLeft size={16} />}
                disabled={current === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              >
                Previous
              </Button>
              {current === total - 1 ? (
                <Button leftIcon={<Send size={15} />} onClick={() => setConfirmOpen(true)}>
                  Review & submit
                </Button>
              ) : (
                <Button
                  rightIcon={<ChevronRight size={16} />}
                  onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Navigator */}
        <aside className="hidden w-64 shrink-0 border-l border-border bg-white p-5 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Question navigator
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((question, i) => {
              const answered = isAnswered(question);
              const isCurrent = i === current;
              const isFlagged = flagged.has(question.id);
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'relative flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                    isCurrent
                      ? 'bg-primary text-white'
                      : answered
                        ? 'bg-primary-light text-primary'
                        : 'bg-surface-2 text-text-secondary hover:bg-border',
                  )}
                >
                  {i + 1}
                  {isFlagged && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-warning" />
                  )}
                </button>
              );
            })}
          </div>

          <dl className="mt-6 space-y-2 text-xs text-text-secondary">
            <div className="flex items-center justify-between">
              <dt>Answered</dt>
              <dd className="font-semibold text-text-primary">
                {answeredCount}/{total}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Flagged</dt>
              <dd className="font-semibold text-text-primary">{flagged.size}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="h-3 w-3 rounded bg-primary" /> Current
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="h-3 w-3 rounded bg-primary-light" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="h-3 w-3 rounded bg-surface-2" /> Unanswered
            </div>
          </div>

          <Button
            fullWidth
            className="mt-6"
            leftIcon={<Send size={15} />}
            onClick={() => setConfirmOpen(true)}
          >
            Submit attempt
          </Button>
        </aside>
      </div>

      {/* Submit confirmation */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit your attempt?"
        description="You won't be able to change your answers after submitting."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep working
            </Button>
            <Button
              loading={submitMutation.isPending}
              leftIcon={<Send size={15} />}
              onClick={doSubmit}
            >
              Submit now
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-2xl font-bold text-text-primary">{answeredCount}</p>
            <p className="text-xs text-text-muted">Answered</p>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-2xl font-bold text-text-primary">{total - answeredCount}</p>
            <p className="text-xs text-text-muted">Unanswered</p>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-2xl font-bold text-text-primary">{flagged.size}</p>
            <p className="text-xs text-text-muted">Flagged</p>
          </div>
        </div>
        {answeredCount < total && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-[#92400E]">
            <AlertTriangle size={14} /> You still have {total - answeredCount} unanswered question
            {total - answeredCount === 1 ? '' : 's'}.
          </p>
        )}
      </Modal>

      {/* Exit confirmation */}
      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Leave the attempt?"
        description="Your progress will not be saved and the timer keeps running."
        footer={
          <>
            <Button variant="secondary" onClick={() => setExitOpen(false)}>
              Stay
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                submittedRef.current = true; // suppress beforeunload guard
                router.push(`/competitions/${id}`);
              }}
            >
              Leave attempt
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          You have answered {answeredCount} of {total} questions. If you leave now, you may not be
          able to resume.
        </p>
      </Modal>
    </div>
  );
}

export function AttemptView({ id }: { id: string }) {
  const { data: competition, isLoading: loadingComp } = useCompetition(id);
  const { data: questions, isLoading: loadingQs } = useCompetitionQuestions(id);

  if (loadingComp || loadingQs || !competition || !questions) {
    return <FullscreenLoader />;
  }

  return <AttemptRunner id={id} competition={competition} questions={questions} />;
}
