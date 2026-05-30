import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// On Vercel hobby, max is 60s; EventSource auto-reconnects after disconnect.
export const maxDuration = 60;

interface Row {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  instituteName: string;
  xpTotal: number;
  badgeCount: number;
  streakDays: number;
  score: number;
  timeTakenSec: number;
  isCurrentUser?: boolean;
}

async function fetchSnapshot(competitionId: string, viewerId: string | null): Promise<Row[]> {
  const rows = await prisma.attempt.findMany({
    where: { competitionId },
    orderBy: [{ score: 'desc' }, { timeTakenSec: 'asc' }],
    take: 20,
    include: {
      user: {
        include: {
          institute: { select: { name: true } },
          _count: { select: { userBadges: true } },
        },
      },
    },
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    name: r.user.name,
    avatarUrl: r.user.avatarUrl ?? undefined,
    instituteName: r.user.institute.name,
    xpTotal: r.user.xpTotal,
    badgeCount: r.user._count.userBadges,
    streakDays: r.user.streakDays,
    score: r.percentage,
    timeTakenSec: r.timeTakenSec,
    isCurrentUser: viewerId !== null && r.userId === viewerId,
  }));
}

/**
 * Server-Sent Events stream of the live leaderboard. Emits a snapshot every
 * 3 seconds. Client uses `new EventSource(url)` and reconnects automatically
 * when the serverless function times out.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  const me = await getCurrentUser(req);
  const viewerId = me?.id ?? null;
  const competitionId = params.id;

  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendStatus = (status: 'connected') =>
        controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ status })}\n\n`));
      const sendSnapshot = async () => {
        if (closed) return;
        try {
          const rows = await fetchSnapshot(competitionId, viewerId);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(rows)}\n\n`));
        } catch (err) {
          console.error('[sse] snapshot failed', err);
        }
      };

      sendStatus('connected');
      await sendSnapshot();

      timer = setInterval(sendSnapshot, 3000);
      const heartbeat = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);

      // Tear down when the client disconnects.
      const onAbort = () => {
        closed = true;
        if (timer) clearInterval(timer);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener('abort', onAbort);
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable proxy buffering
    },
  });
}
