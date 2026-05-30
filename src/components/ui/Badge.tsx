import { cn } from '@/lib/utils';

type Tone = 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'primary';

const tones: Record<Tone, string> = {
  green: 'bg-[#D1FAE5] text-[#065F46]',
  red: 'bg-[#FEE2E2] text-[#991B1B]',
  amber: 'bg-[#FEF3C7] text-[#92400E]',
  blue: 'bg-[#DBEAFE] text-[#1E40AF]',
  gray: 'bg-[#F3F4F6] text-[#374151]',
  primary: 'bg-primary-light text-primary',
};

export function Badge({
  tone = 'gray',
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}

/** Difficulty → tone mapping helper. */
export function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'easy' | 'medium' | 'hard';
}) {
  const tone: Tone =
    difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'amber' : 'red';
  return (
    <Badge tone={tone} className="capitalize">
      {difficulty}
    </Badge>
  );
}
