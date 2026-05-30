import Stripe from 'stripe';
import type { PlanName } from '@prisma/client';

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  : null;

export function isStripeConfigured(): boolean {
  return !!stripe;
}

/**
 * Resolves a plan + billing cycle to a Stripe price ID using the env vars
 * defined in .env.example. Returns null if not configured.
 */
export function priceIdFor(plan: PlanName, billing: 'monthly' | 'annual'): string | null {
  const map: Record<string, string | undefined> = {
    'starter:monthly': process.env.STRIPE_PRICE_STARTER_MONTHLY,
    'starter:annual':  process.env.STRIPE_PRICE_STARTER_ANNUAL,
    'pro:monthly':     process.env.STRIPE_PRICE_PRO_MONTHLY,
    'pro:annual':      process.env.STRIPE_PRICE_PRO_ANNUAL,
  };
  return map[`${plan}:${billing}`] ?? null;
}

/** The set of plans whose Stripe prices are configured. */
export function configuredPlans(): PlanName[] {
  const plans: PlanName[] = [];
  if (priceIdFor('starter', 'monthly') || priceIdFor('starter', 'annual')) plans.push('starter');
  if (priceIdFor('pro', 'monthly') || priceIdFor('pro', 'annual')) plans.push('pro');
  return plans;
}
