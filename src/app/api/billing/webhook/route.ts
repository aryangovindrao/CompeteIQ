import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { InvoiceStatus, PlanName, SubscriptionStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';
// Stripe requires the raw body for signature verification.
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function mapSubStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case 'active':
    case 'trialing':
      return s === 'trialing' ? 'trial' : 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'active';
  }
}

function mapInvoiceStatus(s: Stripe.Invoice.Status | null): InvoiceStatus {
  if (s === 'paid') return 'paid';
  if (s === 'open' || s === 'draft' || s === 'uncollectible') return 'pending';
  return 'failed';
}

async function syncSubscription(stripeSubId: string) {
  if (!stripe) return;
  const sub = await stripe.subscriptions.retrieve(stripeSubId, { expand: ['items.data.price'] });
  const instituteId = sub.metadata?.instituteId;
  if (!instituteId) return;

  const planName = (sub.metadata?.plan as PlanName | undefined) ?? 'pro';
  const pkg = await prisma.package.findUnique({ where: { name: planName } });
  if (!pkg) return;

  const validUntil = new Date(sub.current_period_end * 1000);
  await prisma.subscription.upsert({
    where: { instituteId },
    create: {
      instituteId,
      packageId: pkg.id,
      planName,
      status: mapSubStatus(sub.status),
      validUntil,
    },
    update: {
      packageId: pkg.id,
      planName,
      status: mapSubStatus(sub.status),
      validUntil,
    },
  });

  await prisma.institute.update({
    where: { id: instituteId },
    data: { stripeSubscriptionId: sub.id, plan: planName },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          await syncSubscription(
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id,
          );
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub.id);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const inst = await prisma.institute.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (inst) {
          await prisma.subscription.update({
            where: { instituteId: inst.id },
            data: { status: 'canceled' },
          });
        }
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
      case 'invoice.finalized': {
        const inv = event.data.object as Stripe.Invoice;
        if (!inv.customer) break;
        const inst = await prisma.institute.findFirst({
          where: { stripeCustomerId: typeof inv.customer === 'string' ? inv.customer : inv.customer.id },
        });
        if (!inst) break;
        await prisma.invoice.create({
          data: {
            instituteId: inst.id,
            date: new Date((inv.created ?? Date.now() / 1000) * 1000),
            description: inv.lines.data[0]?.description ?? 'Subscription invoice',
            amount: Math.round((inv.amount_paid || inv.amount_due) / 100),
            status: mapInvoiceStatus(inv.status),
            pdfUrl: inv.invoice_pdf ?? '#',
          },
        });
        break;
      }
      default:
        // ignore everything else
        break;
    }
  } catch (err) {
    console.error('[stripe] handler error', event.type, err);
    return NextResponse.json({ received: false, error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
