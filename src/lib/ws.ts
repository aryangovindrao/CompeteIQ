'use client';

import type { Attempt, Badge, LeaderboardEntry } from './types';

type LeaderboardCb = (rows: LeaderboardEntry[]) => void;
type BadgeCb = (badge: Badge) => void;
type ResultCb = (attempt: Attempt) => void;
type StatusCb = (s: 'connected' | 'reconnecting' | 'disconnected') => void;

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

/**
 * Live competition events client. Uses Server-Sent Events (EventSource) so it
 * works on any HTTP host — no separate WebSocket server needed. EventSource
 * auto-reconnects after the serverless function times out.
 *
 * When NEXT_PUBLIC_USE_MOCKS=true, falls back to a simulated leaderboard so
 * the UI stays functional without a backend.
 */
export class CompeteIQSocket {
  private es: EventSource | null = null;
  private competitionId: string | null = null;
  private closedByUser = false;
  private mockTimer: ReturnType<typeof setInterval> | null = null;

  private leaderboardCbs = new Set<LeaderboardCb>();
  private badgeCbs = new Set<BadgeCb>();
  private resultCbs = new Set<ResultCb>();
  private statusCbs = new Set<StatusCb>();

  /** `token` is unused for SSE (cookie auth) but kept for API compatibility. */
  connect(competitionId: string, _token: string) {
    this.competitionId = competitionId;
    this.closedByUser = false;

    if (USE_MOCKS) {
      this.startMock();
      return;
    }
    this.open();
  }

  private open() {
    try {
      this.emitStatus('reconnecting');
      const url = `/api/competitions/${this.competitionId}/leaderboard/stream`;
      // withCredentials sends the JWT cookie so the server can identify the viewer.
      this.es = new EventSource(url, { withCredentials: true });

      this.es.addEventListener('status', () => this.emitStatus('connected'));
      this.es.onopen = () => this.emitStatus('connected');
      this.es.onmessage = (e) => {
        try {
          const rows = JSON.parse(e.data) as LeaderboardEntry[];
          this.leaderboardCbs.forEach((cb) => cb(rows));
        } catch {
          /* ignore malformed events */
        }
      };
      this.es.onerror = () => {
        this.emitStatus('reconnecting');
        // EventSource handles reconnect automatically unless we explicitly close.
      };
    } catch {
      this.emitStatus('disconnected');
    }
  }

  // --- Simulated stream (no backend) ---
  private startMock() {
    this.emitStatus('reconnecting');
    setTimeout(() => this.emitStatus('connected'), 600);
    const names = [
      'Aisha Khan', 'Liam Chen', 'Sofia Garcia', 'Noah Patel', 'Emma Wright',
      'Yuki Tanaka', 'Omar Farouk', 'Mia Rossi', 'Ethan Park', 'Ava Müller',
    ];
    const base = names.map((name, i) => ({
      rank: i + 1,
      userId: `u${i}`,
      name,
      instituteName: 'Northwood Academy',
      xpTotal: 1200 - i * 80,
      badgeCount: 8 - i,
      streakDays: 12 - i,
      score: 98 - i * 4 + Math.floor(Math.random() * 3),
      timeTakenSec: 600 + i * 30,
      isCurrentUser: i === 2,
    }));
    const tick = () => {
      const rows = base
        .map((r) => ({
          ...r,
          score: Math.min(100, Math.max(0, r.score + Math.floor(Math.random() * 5 - 2))),
        }))
        .sort((a, b) => b.score! - a.score!)
        .map((r, i) => ({ ...r, rank: i + 1 }));
      this.leaderboardCbs.forEach((cb) => cb(rows));
    };
    tick();
    this.mockTimer = setInterval(tick, 3000);
  }

  disconnect() {
    this.closedByUser = true;
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.mockTimer = null;
    this.es?.close();
    this.es = null;
    this.emitStatus('disconnected');
  }

  /**
   * Kept for API compatibility — SSE is server→client only.
   * For client→server actions, use the REST endpoints in src/lib/api.ts.
   */
  send(_type: string, _payload: unknown) {
    /* no-op for SSE */
  }

  onLeaderboardUpdate(cb: LeaderboardCb) {
    this.leaderboardCbs.add(cb);
    return () => this.leaderboardCbs.delete(cb);
  }
  onBadgeEarned(cb: BadgeCb) {
    this.badgeCbs.add(cb);
    return () => this.badgeCbs.delete(cb);
  }
  onResult(cb: ResultCb) {
    this.resultCbs.add(cb);
    return () => this.resultCbs.delete(cb);
  }
  onStatus(cb: StatusCb) {
    this.statusCbs.add(cb);
    return () => this.statusCbs.delete(cb);
  }

  private emitStatus(s: 'connected' | 'reconnecting' | 'disconnected') {
    this.statusCbs.forEach((cb) => cb(s));
  }
}

export const competeSocket = new CompeteIQSocket();
