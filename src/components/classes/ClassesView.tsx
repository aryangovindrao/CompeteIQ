'use client';

import { useState } from 'react';
import { BookOpen, Plus, Ticket } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useClasses } from '@/lib/hooks';
import { PageHeader } from '@/components/dashboard';
import { Button, LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClassCard } from './ClassCard';
import { CreateClassModal } from './CreateClassModal';

export function ClassesView() {
  const { user } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'institute_admin';
  const { data: classes, isLoading } = useClasses();
  const [createOpen, setCreateOpen] = useState(false);

  const subtitle = isStaff
    ? 'Create classes, share join codes, and track how each cohort is performing.'
    : 'Your enrolled classes and the competitions waiting inside them.';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        subtitle={subtitle}
        actions={
          isStaff ? (
            <Button leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Create class
            </Button>
          ) : (
            <LinkButton href="/join" leftIcon={<Ticket size={16} />}>
              Join a class
            </LinkButton>
          )
        }
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
      ) : classes && classes.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.id} classroom={c} showCode={isStaff} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={22} />}
          title={isStaff ? 'No classes yet' : "You haven't joined a class"}
          description={
            isStaff
              ? 'Create your first class to start hosting competitions for your students.'
              : 'Ask your teacher for a join code, then enter it to get started.'
          }
          action={
            isStaff ? (
              <Button leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                Create class
              </Button>
            ) : (
              <LinkButton href="/join" leftIcon={<Ticket size={16} />}>
                Enter a join code
              </LinkButton>
            )
          }
        />
      )}

      {isStaff && <CreateClassModal open={createOpen} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
