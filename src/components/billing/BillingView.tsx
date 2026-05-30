'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarClock,
  CreditCard,
  Download,
  ExternalLink,
  GraduationCap,
  Trophy,
  Users,
} from 'lucide-react';
import type { PlanName, SubscriptionStatus } from '@/lib/types';
import { billingApi } from '@/lib/api';
import { useInvoices, usePackages, useSubscription } from '@/lib/hooks';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { PageHeader, Panel } from '@/components/dashboard';
import { PricingPlans } from '@/components/marketing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

function statusBadge(status: SubscriptionStatus) {
  if (status === 'active') return <Badge tone="green" dot>Active</Badge>;
  if (status === 'trial') return <Badge tone="blue" dot>Trial</Badge>;
  if (status === 'past_due') return <Badge tone="amber" dot>Past due</Badge>;
  return <Badge tone="red" dot>Canceled</Badge>;
}

function invoiceBadge(status: 'paid' | 'pending' | 'failed') {
  if (status === 'paid') return <Badge tone="green">Paid</Badge>;
  if (status === 'pending') return <Badge tone="amber">Pending</Badge>;
  return <Badge tone="red">Failed</Badge>;
}

function UsageBar({
  icon,
  label,
  used,
  limit,
}: {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = limit < 0;
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const variant = !unlimited && pct >= 90 ? 'danger' : !unlimited && pct >= 70 ? 'warning' : 'primary';

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span className="text-text-muted">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-semibold text-text-primary">
          {formatNumber(used)}
          <span className="font-normal text-text-muted">
            {' '}/ {unlimited ? 'Unlimited' : formatNumber(limit)}
          </span>
        </span>
      </div>
      <div className="mt-3">
        {unlimited ? (
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-light">
            <div className="h-full w-full rounded-full bg-primary/40" />
          </div>
        ) : (
          <Progress value={used} max={limit} variant={variant} />
        )}
      </div>
    </div>
  );
}

export function BillingView() {
  const { data: subscription, isLoading } = useSubscription();
  const { data: invoices } = useInvoices();
  const { data: packages } = usePackages();
  const [redirecting, setRedirecting] = useState(false);

  const openPortal = async () => {
    setRedirecting(true);
    try {
      const url = await billingApi.portalUrl();
      toast.success('Opening secure billing portal…');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not open the billing portal. Please try again.');
    } finally {
      setRedirecting(false);
    }
  };

  const handleSelectPlan = async (plan: PlanName, billing: 'monthly' | 'annual') => {
    if (plan === 'enterprise') {
      toast('Our team will reach out about Enterprise.', { icon: '✉️' });
      return;
    }
    if (plan === 'free') return;
    try {
      const loading = toast.loading('Starting checkout…');
      const url = await billingApi.checkout(plan, billing);
      toast.dismiss(loading);
      window.location.assign(url);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not start checkout — please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & plans"
        subtitle="Manage your subscription, monitor usage, and download invoices."
        actions={
          <Button
            variant="secondary"
            leftIcon={<ExternalLink size={16} />}
            loading={redirecting}
            onClick={openPortal}
          >
            Manage billing
          </Button>
        }
      />

      {/* Current plan */}
      {isLoading || !subscription ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-primary-light to-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-card">
                <CreditCard size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold capitalize text-text-primary">
                    {subscription.planName} plan
                  </h2>
                  {statusBadge(subscription.status)}
                </div>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary">
                  <CalendarClock size={14} />
                  Renews {formatDate(subscription.validUntil)} · {subscription.daysRemaining} days left
                </p>
              </div>
            </div>
            <a href="#plans">
              <Button variant="primary">Change plan</Button>
            </a>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <UsageBar
              icon={<Trophy size={15} />}
              label="Competitions"
              used={subscription.usage.competitionsUsed}
              limit={subscription.usage.competitionsLimit}
            />
            <UsageBar
              icon={<GraduationCap size={15} />}
              label="Teachers"
              used={subscription.usage.teachersUsed}
              limit={subscription.usage.teachersLimit}
            />
            <UsageBar
              icon={<Users size={15} />}
              label="Students"
              used={subscription.usage.studentsUsed}
              limit={-1}
            />
          </div>
        </div>
      )}

      {/* Invoices */}
      <Panel title="Invoice history" subtitle="Your recent payments" bodyClassName="p-0">
        {invoices === undefined ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : invoices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                  >
                    <td className="px-5 py-3 text-text-secondary">{formatDate(inv.date)}</td>
                    <td className="px-5 py-3 font-medium text-text-primary">{inv.description}</td>
                    <td className="px-5 py-3 text-right font-semibold text-text-primary">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-5 py-3 text-center">{invoiceBadge(inv.status)}</td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={inv.pdfUrl}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
                      >
                        <Download size={14} /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<CreditCard size={22} />}
              title="No invoices yet"
              description="Invoices will appear here once your first payment is processed."
            />
          </div>
        )}
      </Panel>

      {/* Plans */}
      <div id="plans" className="scroll-mt-24 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Available plans</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Upgrade or downgrade at any time. Changes apply at your next billing cycle.
          </p>
        </div>
        <PricingPlans
          packages={packages}
          currentPlan={subscription?.planName}
          onSelectPlan={handleSelectPlan}
          defaultBilling="monthly"
        />
      </div>
    </div>
  );
}
