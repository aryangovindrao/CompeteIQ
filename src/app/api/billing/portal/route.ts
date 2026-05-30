import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, badRequest, ok } from '@/lib/server/http';
import { requireRole } from '@/lib/server/session';
import { stripe } from '@/lib/server/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Returns a Stripe Customer Portal URL so admins can self-serve subscription
 * changes, invoices, and payment methods. Falls back to a placeholder when
 * Stripe isn't configured (so the demo button still works).
 */
export const POST = handle(async (req: NextRequest) => {
  const admin = await requireRole(req, 'institute_admin');

  if (!stripe) {
    return ok({ url: process.env.STRIPE_PORTAL_URL ?? 'https://billing.stripe.com/p/session/test' });
  }

  const institute = await prisma.institute.findUnique({ where: { id: admin.instituteId } });
  if (!institute?.stripeCustomerId) {
    return badRequest('No billing customer yet — start a subscription first.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: institute.stripeCustomerId,
    return_url: `${APP_URL}/billing`,
  });

  return ok({ url: session.url });
});
