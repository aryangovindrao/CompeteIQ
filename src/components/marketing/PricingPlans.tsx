'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { Package, PlanName } from '@/lib/types';
import { mockPackages } from '@/lib/mock';
import { cn } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';

type Billing = 'monthly' | 'annual';

interface PricingPlansProps {
  packages?: Package[];
  /** Show the monthly/annual segmented toggle. */
  showToggle?: boolean;
  defaultBilling?: Billing;
  /** Highlight the plan the institute is currently on (billing page). */
  currentPlan?: PlanName;
  /** When provided, CTAs become buttons that call this instead of linking. */
  onSelectPlan?: (plan: PlanName, billing: Billing) => void;
  /** Where marketing CTAs point. */
  ctaHref?: string;
  className?: string;
}

function priceLabel(pkg: Package, billing: Billing) {
  const value = billing === 'monthly' ? pkg.priceMonthly : pkg.priceAnnual;
  if (value < 0) return { amount: 'Custom', period: '', save: null as string | null };
  if (value === 0) return { amount: '$0', period: billing === 'monthly' ? '/mo' : '/yr', save: null };
  if (billing === 'annual') {
    const monthlyTotal = pkg.priceMonthly * 12;
    const savePct = monthlyTotal > 0 ? Math.round(((monthlyTotal - value) / monthlyTotal) * 100) : 0;
    return { amount: `$${value}`, period: '/yr', save: savePct > 0 ? `Save ${savePct}%` : null };
  }
  return { amount: `$${value}`, period: '/mo', save: null };
}

export function PricingPlans({
  packages = mockPackages,
  showToggle = true,
  defaultBilling = 'monthly',
  currentPlan,
  onSelectPlan,
  ctaHref = '/register',
  className,
}: PricingPlansProps) {
  const [billing, setBilling] = useState<Billing>(defaultBilling);

  return (
    <div className={className}>
      {showToggle && (
        <div className="mb-10 flex items-center justify-center gap-3">
          <PillTabs
            value={billing}
            onChange={(v) => setBilling(v as Billing)}
            items={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual' },
            ]}
          />
          <span className="hidden rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success sm:inline">
            2 months free
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {packages.map((pkg, i) => {
          const { amount, period, save } = priceLabel(pkg, billing);
          const isCurrent = currentPlan === pkg.name;
          const popular = !!pkg.popular;
          const isEnterprise = pkg.name === 'enterprise';

          const ctaLabel = isCurrent
            ? 'Current Plan'
            : isEnterprise
              ? 'Contact Sales'
              : pkg.priceMonthly === 0
                ? 'Get Started'
                : onSelectPlan
                  ? 'Choose Plan'
                  : 'Start Free Trial';

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-6',
                popular
                  ? 'border-primary shadow-hover ring-1 ring-primary lg:-mt-3 lg:mb-3'
                  : 'border-border shadow-card',
                isCurrent && !popular && 'ring-1 ring-primary/40',
              )}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-card">
                  <Sparkles size={12} /> Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute right-4 top-4 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Current
                </span>
              )}

              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                {pkg.label}
              </h3>

              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-text-primary">{amount}</span>
                {period && <span className="mb-1 text-sm text-text-muted">{period}</span>}
              </div>
              <div className="mt-1 h-5">
                {save && (
                  <span className="text-xs font-semibold text-success">{save}</span>
                )}
                {!save && billing === 'annual' && pkg.priceMonthly > 0 && (
                  <span className="text-xs text-text-muted">billed annually</span>
                )}
              </div>

              {onSelectPlan ? (
                <Button
                  variant={popular ? 'primary' : 'secondary'}
                  fullWidth
                  className="mt-5"
                  disabled={isCurrent}
                  onClick={() => onSelectPlan(pkg.name, billing)}
                >
                  {ctaLabel}
                </Button>
              ) : (
                <LinkButton
                  href={isEnterprise ? '/about' : ctaHref}
                  variant={popular ? 'primary' : 'secondary'}
                  fullWidth
                  className="mt-5"
                >
                  {ctaLabel}
                </LinkButton>
              )}

              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {pkg.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
