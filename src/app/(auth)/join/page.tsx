'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, BookOpen, Calendar, Trophy, User as UserIcon } from 'lucide-react';
import type { JoinPreview } from '@/lib/types';
import { authApi } from '@/lib/api';
import { formatDateTime, normalizeCode } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<JoinPreview | null>(null);

  const lookup = async () => {
    if (code.replace('-', '').length < 5) {
      toast.error('Enter a valid join code');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.joinWithCode(code);
      setPreview(result);
    } catch {
      toast.error('No competition or class found for that code');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const proceed = () => {
    if (!preview) return;
    const path = preview.kind === 'competition' ? `/competitions/${preview.id}` : `/classes/${preview.id}`;
    router.push(path);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Join with a code</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Enter the code your teacher shared to join a competition or class.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Join code</label>
          <input
            value={code}
            onChange={(e) => {
              setCode(normalizeCode(e.target.value));
              setPreview(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="ABC-12345"
            maxLength={9}
            className="h-14 w-full rounded-lg border border-border bg-white text-center font-mono text-2xl font-bold uppercase tracking-[0.3em] text-text-primary transition-shadow placeholder:tracking-normal placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>

        {!preview && (
          <Button fullWidth size="lg" loading={loading} onClick={lookup}>
            Look up code
          </Button>
        )}
      </div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 rounded-xl border border-border bg-white p-5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                preview.kind === 'competition'
                  ? 'bg-primary-light text-primary'
                  : 'bg-[#DBEAFE] text-[#1D4ED8]'
              }`}
            >
              {preview.kind === 'competition' ? <Trophy size={20} /> : <BookOpen size={20} />}
            </div>
            <div className="min-w-0">
              <span className="ui-label text-text-muted">
                {preview.kind === 'competition' ? 'Competition' : 'Class'}
              </span>
              <h3 className="text-base font-semibold text-text-primary">{preview.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <UserIcon size={14} /> {preview.teacherName} · {preview.instituteName}
              </p>
              {preview.when && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                  <Calendar size={14} /> {formatDateTime(preview.when)}
                </p>
              )}
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-4"
            onClick={proceed}
            rightIcon={<ArrowRight size={16} />}
          >
            Continue to {preview.kind === 'competition' ? 'competition' : 'class'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setCode('');
            }}
            className="mt-2 w-full text-center text-sm text-text-muted hover:text-text-secondary"
          >
            Use a different code
          </button>
        </motion.div>
      )}

      <p className="mt-6 text-center text-sm text-text-secondary">
        Have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
