import type { Metadata } from 'next';
import { CTASection, Container, PricingPlans, SectionHeading } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Pricing — CompeteIQ',
  description: 'Simple, flat monthly pricing for institutes of every size. Start free, no per-student charges.',
};

const faqs = [
  {
    q: 'Do you charge per student?',
    a: 'Never. Every plan is a flat monthly (or annual) price. Add as many students as your plan allows without surprise charges.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade at any time from your billing dashboard. Changes are prorated automatically.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Absolutely. The Free plan lets you run one competition for up to 50 students with full leaderboards — no credit card required.',
  },
  {
    q: 'What happens when a competition ends?',
    a: 'Results, analytics, and certificates remain available in your dashboard. Past competitions never count against your active limits.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes — annual billing saves you roughly two months compared to paying monthly. The exact savings are shown on each plan.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards via Stripe. Enterprise customers can also pay by invoice.',
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-surface-2 py-20">
        <Container>
          <SectionHeading
            label="Pricing"
            title={
              <>
                One platform. <span className="text-primary">Flat pricing.</span>
              </>
            }
            subtitle="Choose the plan that fits your institute today and scale whenever you're ready. No per-student fees, no lock-in."
          />
          <div className="mt-12">
            <PricingPlans />
          </div>
          <p className="mt-10 text-center text-sm text-text-muted">
            All plans include a 14-day Pro trial · Cancel anytime · Secure payments by Stripe
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <Container className="max-w-3xl">
          <SectionHeading label="FAQ" title="Frequently asked questions" />
          <dl className="mt-10 divide-y divide-border">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-base font-semibold text-text-primary">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-secondary">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
