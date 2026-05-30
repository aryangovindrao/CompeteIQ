'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Container } from './Section';

export function CTASection() {
  return (
    <section className="bg-white py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-dark px-6 py-16 text-center sm:px-16"
        >
          {/* glow accents */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to run your first <span className="text-primary">competition</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
              Set up your institute, invite your students, and launch a live test today.
              No credit card required to start.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/register" size="lg" rightIcon={<ArrowRight size={16} />}>
                Start Free Trial
              </LinkButton>
              <LinkButton href="/#pricing" variant="dark" size="lg">
                View Pricing
              </LinkButton>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
