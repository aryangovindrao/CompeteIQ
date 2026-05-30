import type { Metadata } from 'next';
import {
  CTASection,
  DarkSection,
  Features,
  GamificationShowcase,
  Hero,
  HowItWorks,
  LogoStrip,
  PricingPlans,
  SectionHeading,
  StatsStrip,
  Container,
} from '@/components/marketing';

export const metadata: Metadata = {
  title: 'CompeteIQ — Host Smarter Competitions & Tests for Your School',
  description:
    'CompeteIQ gives every institute the tools to run live competitions, gamified learning, and AI-powered assessments — all in one platform.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <DarkSection />
      <GamificationShowcase />
      <StatsStrip />

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20">
        <Container>
          <SectionHeading
            label="Pricing"
            title="Plans that grow with your institute"
            subtitle="Start free, upgrade when you're ready. No per-student charges — ever."
          />
          <div className="mt-12">
            <PricingPlans />
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
