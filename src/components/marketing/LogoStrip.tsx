import { Container } from './Section';

const institutes = [
  'Northwood Academy', 'Riverside School', 'Summit College', 'Oakridge Institute',
  'Brighton High', 'Cedar Valley', 'Lakeside Prep', 'Hillcrest University',
];

export function LogoStrip() {
  return (
    <section className="border-y border-border bg-white py-10">
      <Container>
        <p className="text-center text-sm font-medium text-text-muted">
          Trusted by institutes across the country
        </p>
      </Container>
      <div className="relative mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee gap-4">
          {[...institutes, ...institutes].map((name, i) => (
            <div
              key={i}
              className="flex h-12 w-44 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-sm font-semibold text-text-muted"
            >
              {name}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
