'use client';

import { Sparkles, Ticket, UserPlus } from 'lucide-react';
import type { Role, User } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useDashboardStats } from '@/lib/hooks';
import {
  mockActivity,
  mockActivityFeed,
  mockResultsList,
  mockScoreDistribution,
  mockSkills,
  mockUpcoming,
  mockUserBadges,
} from '@/lib/mock';
import { LinkButton } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ActivityChart,
  ActivityFeed,
  BadgesGrid,
  PageHeader,
  Panel,
  PanelLink,
  QuickActions,
  ResultsList,
  ScoreDistributionChart,
  SkillRadarChart,
  StatGrid,
  UpcomingList,
  XpProgressCard,
} from '@/components/dashboard';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function RoleCTA({ role }: { role: Role }) {
  if (role === 'student')
    return (
      <LinkButton href="/join" leftIcon={<Ticket size={16} />}>
        Join competition
      </LinkButton>
    );
  if (role === 'teacher')
    return (
      <LinkButton href="/ai-generator" leftIcon={<Sparkles size={16} />}>
        Create with AI
      </LinkButton>
    );
  return (
    <LinkButton href="/teachers" leftIcon={<UserPlus size={16} />}>
      Invite teachers
    </LinkButton>
  );
}

function StudentHome({ user }: { user: User }) {
  const earned = mockUserBadges.filter((b) => b.earned).length;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <XpProgressCard user={user} />
        <Panel title="Weekly activity" subtitle="Hours studied vs. your daily target">
          <ActivityChart data={mockActivity} />
        </Panel>
        <Panel title="Recent results" action={<PanelLink href="/competitions" />}>
          <ResultsList results={mockResultsList} />
        </Panel>
        <Panel
          title="Badges"
          subtitle={`${earned} of ${mockUserBadges.length} earned`}
          action={<PanelLink href="/profile">View all</PanelLink>}
        >
          <BadgesGrid badges={mockUserBadges} showDate />
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Quick actions">
          <QuickActions role="student" />
        </Panel>
        <Panel title="Skill mastery" subtitle="Average score by subject">
          <SkillRadarChart data={mockSkills} />
        </Panel>
        <Panel title="Upcoming" action={<PanelLink href="/competitions" />}>
          <UpcomingList competitions={mockUpcoming} />
        </Panel>
        <Panel title="Recent activity">
          <ActivityFeed events={mockActivityFeed} />
        </Panel>
      </div>
    </div>
  );
}

function StaffHome({ role }: { role: Role }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Panel title="Score distribution" subtitle="Across all your competitions">
          <ScoreDistributionChart data={mockScoreDistribution} />
        </Panel>
        <Panel title="Weekly activity" subtitle="Engagement over the last 7 days">
          <ActivityChart data={mockActivity} />
        </Panel>
        <Panel title="Recent results" action={<PanelLink href="/competitions" />}>
          <ResultsList results={mockResultsList} />
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Quick actions">
          <QuickActions role={role} />
        </Panel>
        <Panel title="Upcoming" action={<PanelLink href="/competitions" />}>
          <UpcomingList competitions={mockUpcoming} />
        </Panel>
        <Panel title="Recent activity">
          <ActivityFeed events={mockActivityFeed} />
        </Panel>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role: Role = user?.role ?? 'student';
  const { data: stats, isLoading } = useDashboardStats(role);

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    );
  }

  const subtitle =
    role === 'student'
      ? "Here's how your learning is going today."
      : role === 'teacher'
        ? "Here's what's happening across your classes."
        : "Here's an overview of your institute.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle={subtitle}
        actions={<RoleCTA role={role} />}
      />
      <StatGrid stats={stats} loading={isLoading} columns={role === 'student' ? 3 : 4} />
      {role === 'student' ? <StudentHome user={user} /> : <StaffHome role={role} />}
    </div>
  );
}
