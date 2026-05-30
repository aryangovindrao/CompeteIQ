import {
  Award,
  BarChart3,
  Briefcase,
  ChartLine,
  CircleDot,
  CreditCard,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  Map,
  MessageCircle,
  PlusCircle,
  Settings,
  Sparkles,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react';
import type { Role } from '@/lib/types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // if omitted, visible to all
}

export interface NavGroup {
  label?: string;
  collapsible?: boolean;
  roles?: Role[];
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Journey', href: '/dashboard?view=journey', icon: Map, roles: ['student'] },
    ],
  },
  {
    label: 'Learn',
    collapsible: true,
    items: [
      { label: 'Overview', href: '/dashboard', icon: CircleDot },
      { label: 'Competitions', href: '/competitions', icon: Trophy },
      { label: 'My Classes', href: '/classes', icon: Users },
      { label: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
      { label: 'Certificates', href: '/certificates', icon: Award },
    ],
  },
  {
    label: 'Manage',
    roles: ['teacher', 'institute_admin'],
    items: [
      { label: 'My Classes', href: '/classes', icon: GraduationCap, roles: ['teacher', 'institute_admin'] },
      { label: 'Create Test', href: '/competitions?create=1', icon: PlusCircle, roles: ['teacher', 'institute_admin'] },
      { label: 'Students', href: '/students', icon: Users, roles: ['teacher', 'institute_admin'] },
      { label: 'Analytics', href: '/dashboard?view=analytics', icon: ChartLine, roles: ['teacher', 'institute_admin'] },
      { label: 'AI Generator', href: '/ai-generator', icon: Sparkles, roles: ['teacher', 'institute_admin'] },
    ],
  },
  {
    label: 'Admin',
    roles: ['institute_admin'],
    items: [
      { label: 'Teachers', href: '/teachers', icon: Briefcase, roles: ['institute_admin'] },
      { label: 'Billing', href: '/billing', icon: CreditCard, roles: ['institute_admin'] },
      { label: 'Institute Settings', href: '/dashboard?view=settings', icon: Settings, roles: ['institute_admin'] },
    ],
  },
  {
    items: [
      { label: 'Discussion', href: '/dashboard?view=discussion', icon: MessageCircle },
      { label: 'Help', href: '/dashboard?view=help', icon: HelpCircle },
    ],
  },
];

export function visibleGroups(role: Role): NavGroup[] {
  return navGroups
    .filter((g) => !g.roles || g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.roles || i.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);
}

export const roleLabels: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  institute_admin: 'Admin',
};

export { UserCog };
