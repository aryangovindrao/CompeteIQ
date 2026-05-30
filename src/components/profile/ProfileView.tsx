'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, ScrollText, Share2 } from 'lucide-react';
import type { BadgeTier } from '@/lib/types';
import { useActivity, useBadges, useCertificates, useProfile, useSkills } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { copyToClipboard } from '@/lib/utils';
import { mockResultsList } from '@/lib/mock';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ActivityFeed,
  BadgesGrid,
  CertificateCard,
  Panel,
  ResultsList,
  SkillRadarChart,
  XpProgressCard,
  tierMeta,
} from '@/components/dashboard';
import { ProfileHeader } from './ProfileHeader';
import { EditProfileModal } from './EditProfileModal';

const tierOrder: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function ProfileView({ userId, isOwner }: { userId?: string; isOwner: boolean }) {
  const { user: authUser } = useAuth();
  const { data: user, isLoading } = useProfile(userId);
  const { data: badges } = useBadges();
  const { data: certificates } = useCertificates();
  const { data: skills } = useSkills();
  const { data: activity } = useActivity();

  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);

  const profileUser = user ?? (isOwner ? authUser : null);

  if (isLoading || !profileUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-10 w-80" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const allBadges = badges ?? [];
  const earnedBadges = allBadges.filter((b) => b.earned);
  const allCerts = certificates ?? [];
  const visibleCerts = isOwner ? allCerts : allCerts.filter((c) => c.isPublic);

  const share = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${profileUser.id}`;
    const ok = await copyToClipboard(url);
    toast[ok ? 'success' : 'error'](ok ? 'Profile link copied' : 'Could not copy link');
  };

  const tierCounts = tierOrder.map((t) => ({
    tier: t,
    earned: earnedBadges.filter((b) => b.tier === t).length,
    total: allBadges.filter((b) => b.tier === t).length,
  }));

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={profileUser}
        badgesEarned={earnedBadges.length}
        certificatesCount={visibleCerts.length}
        actions={
          <>
            {isOwner && (
              <Button variant="secondary" leftIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
            )}
            <Button variant="ghost" leftIcon={<Share2 size={15} />} onClick={share}>
              Share
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'badges', label: 'Badges', count: earnedBadges.length },
          { value: 'certificates', label: 'Certificates', count: visibleCerts.length },
          { value: 'activity', label: 'Activity' },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Skill mastery" subtitle="Average score by subject">
              {skills ? <SkillRadarChart data={skills} /> : <Skeleton className="h-64 w-full" />}
            </Panel>
            <Panel title="Recent results">
              <ResultsList results={mockResultsList} />
            </Panel>
          </div>
          <div className="space-y-6">
            <XpProgressCard user={profileUser} />
            <Panel
              title="Recent badges"
              action={
                <button
                  onClick={() => setTab('badges')}
                  className="text-xs font-medium text-primary hover:text-primary-dark"
                >
                  View all
                </button>
              }
            >
              {earnedBadges.length ? (
                <BadgesGrid badges={earnedBadges.slice(0, 8)} />
              ) : (
                <p className="text-sm text-text-muted">No badges earned yet.</p>
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {tierCounts.map(({ tier, earned, total }) => {
              const meta = tierMeta[tier];
              return (
                <div key={tier} className="rounded-lg border border-border bg-white p-4 shadow-card">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: meta.tint, color: meta.hex }}
                  >
                    {meta.label}
                  </span>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {earned}
                    <span className="text-base font-medium text-text-muted">/{total}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <Panel title="All badges" subtitle={`${earnedBadges.length} of ${allBadges.length} unlocked`}>
            {allBadges.length ? (
              <BadgesGrid badges={allBadges} showDate />
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </Panel>
        </div>
      )}

      {tab === 'certificates' && (
        <>
          {visibleCerts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCerts.map((c) => (
                <CertificateCard key={c.id} certificate={c} isOwner={isOwner} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ScrollText size={22} />}
              title="No certificates yet"
              description={
                isOwner
                  ? 'Finish a competition above its pass mark to earn your first certificate.'
                  : "This user hasn't made any certificates public."
              }
            />
          )}
        </>
      )}

      {tab === 'activity' && (
        <Panel title="Activity timeline">
          {activity ? <ActivityFeed events={activity} /> : <Skeleton className="h-40 w-full" />}
        </Panel>
      )}

      {isOwner && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={profileUser} />}
    </div>
  );
}
