'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, Mail, Search, UserPlus, Users } from 'lucide-react';
import { formatDate, formatNumber, sleep, subjectIconColor } from '@/lib/utils';
import { PageHeader, Panel } from '@/components/dashboard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

interface TeacherRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  classes: number;
  students: number;
  status: 'active' | 'invited';
  joinedAt: string;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
];

const seedTeachers: TeacherRecord[] = [
  { id: 't1', name: 'Dr. Meera Nair', email: 'meera@northwood.edu', department: 'Physics', classes: 4, students: 186, status: 'active', joinedAt: daysAgo(380) },
  { id: 't2', name: 'Mr. Alan Pierce', email: 'alan@northwood.edu', department: 'History', classes: 3, students: 142, status: 'active', joinedAt: daysAgo(295) },
  { id: 't3', name: 'Ms. Lena Ford', email: 'lena@northwood.edu', department: 'Chemistry', classes: 2, students: 78, status: 'active', joinedAt: daysAgo(210) },
  { id: 't4', name: 'Mr. David Osei', email: 'david@northwood.edu', department: 'Computer Science', classes: 5, students: 221, status: 'active', joinedAt: daysAgo(160) },
  { id: 't5', name: 'Dr. Hana Suzuki', email: 'hana@northwood.edu', department: 'Mathematics', classes: 3, students: 134, status: 'active', joinedAt: daysAgo(120) },
  { id: 't6', name: 'Ms. Clara Mendez', email: 'clara@northwood.edu', department: 'Biology', classes: 2, students: 64, status: 'active', joinedAt: daysAgo(88) },
  { id: 't7', name: 'Mr. Samuel Wright', email: 'samuel@northwood.edu', department: 'English', classes: 1, students: 31, status: 'invited', joinedAt: daysAgo(4) },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold leading-none text-text-primary">{value}</p>
        <p className="mt-1 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

function InviteTeacherModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (t: TeacherRecord) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setDepartment(DEPARTMENTS[0]);
    setError('');
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (name.trim().length < 3) {
      setError('Please enter the teacher’s full name.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    await sleep(700);
    const teacher: TeacherRecord = {
      id: `t-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department,
      classes: 0,
      students: 0,
      status: 'invited',
      joinedAt: new Date().toISOString(),
    };
    onInvite(teacher);
    toast.success(`Invitation sent to ${teacher.email}`);
    setSubmitting(false);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite a teacher"
      description="They’ll receive an email to join your institute and start creating classes."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} leftIcon={<Mail size={15} />}>
            Send invite
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Full name"
          placeholder="e.g. Dr. Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="teacher@northwood.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          label="Department"
          options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}

export function TeachersView() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>(seedTeachers);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);

  const activeCount = teachers.filter((t) => t.status === 'active').length;
  const pendingCount = teachers.filter((t) => t.status === 'invited').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesQuery =
        !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
      const matchesDept = department === 'all' || t.department === department;
      return matchesQuery && matchesDept;
    });
  }, [teachers, query, department]);

  const filtersActive = query.trim() !== '' || department !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        subtitle="Manage faculty access and invite new teachers to your institute."
        actions={
          <Button leftIcon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>
            Invite teacher
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile icon={<Users size={18} />} label="Total teachers" value={`${teachers.length}`} />
        <SummaryTile icon={<CheckCircle2 size={18} />} label="Active" value={`${activeCount}`} />
        <SummaryTile icon={<Clock size={18} />} label="Pending invites" value={`${pendingCount}`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            leftIcon={<Search size={16} />}
            placeholder="Search teachers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          options={[
            { value: 'all', label: 'All departments' },
            ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
          ]}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="sm:w-52"
        />
      </div>

      <Panel
        title="Faculty directory"
        subtitle={`${filtered.length} of ${teachers.length} teachers`}
        bodyClassName="p-0"
      >
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Department</th>
                  <th className="px-5 py-3 text-right font-medium">Classes</th>
                  <th className="hidden px-5 py-3 text-right font-medium md:table-cell">Students</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="hidden px-5 py-3 text-right font-medium lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const color = subjectIconColor[t.department] ?? '#C0392B';
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-text-primary">
                              {t.name}
                            </span>
                            <span className="block truncate text-xs text-text-muted">{t.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {t.department}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-primary">
                        {t.classes}
                      </td>
                      <td className="hidden px-5 py-3 text-right text-text-secondary md:table-cell">
                        {formatNumber(t.students)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {t.status === 'active' ? (
                          <Badge tone="green" dot>
                            Active
                          </Badge>
                        ) : (
                          <Badge tone="amber" dot>
                            Invited
                          </Badge>
                        )}
                      </td>
                      <td className="hidden px-5 py-3 text-right text-text-secondary lg:table-cell">
                        {formatDate(t.joinedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<Users size={22} />}
              title="No teachers found"
              description="Try a different search term, or invite a new teacher to your institute."
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setDepartment('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button leftIcon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>
                    Invite teacher
                  </Button>
                )
              }
            />
          </div>
        )}
      </Panel>

      <InviteTeacherModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={(t) => setTeachers((prev) => [t, ...prev])}
      />
    </div>
  );
}
