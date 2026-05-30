import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, badRequest, ok, serverError } from '@/lib/server/http';
import { requireRole } from '@/lib/server/session';
import { stripe, priceIdFor } from '@/lib/server/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const schema = z.object({
  plan: z.enum(['starter', 'pro']),
  billing: z.enum(['monthly', 'annual']),
});

/**
 * Starts a Stripe Checkout session for the requested plan + billing cycle,
 * then returns the hosted checkout URL. The frontend redirects the user there.
 */
export const POST = handle(async (req: NextRequest) => {
  const admin = await requireRole(req, 'institute_admin');
  if (!stripe) return serverError('Stripe is not configured. Set STRIPE_SECRET_KEY.');

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());

  const priceId = priceIdFor(parsed.data.plan, parsed.data.billing);
  if (!priceId) {
    return badRequest(
      `That plan isn't available for purchase yet. Configure STRIPE_PRICE_${parsed.data.plan.toUpperCase()}_${parsed.data.billing.toUpperCase()} in env.`,
    );
  }

  // Ensure the institute has a linked Stripe customer.
  const institute = await prisma.institute.findUnique({ where: { id: admin.instituteId } });
  if (!institute) return badRequest('Institute not found');

  let customerId = institute.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: admin.email,
      name: institute.name,
      metadata: { instituteId: institute.id },
    });
    customerId = customer.id;
    await prisma.institute.update({
      where: { id: institute.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${APP_URL}/billing?upgraded=1`,
    cancel_url: `${APP_URL}/billing?canceled=1`,
    metadata: {
      instituteId: institute.id,
      plan: parsed.data.plan,
      billing: parsed.data.billing,
    },
  });

  return ok({ url: session.url });
});
