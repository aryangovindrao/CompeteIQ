import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

interface Stat {
  label: string;
  value: string;
  trend: number;
  spark: { value: number }[];
}

function spark(seed: number[]) {
  return seed.map((value) => ({ value }));
}

export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser(req);
  const role = (req.nextUrl.searchParams.get('role') as typeof me.role | null) ?? me.role;

  if (role === 'student') {
    const [attempts, certs] = await Promise.all([
      prisma.attempt.findMany({ where: { userId: me.id }, select: { percentage: true } }),
      prisma.certificate.count({ where: { userId: me.id } }),
    ]);
    const avg = attempts.length
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;
    const out: Stat[] = [
      { label: 'Total Attempts', value: String(attempts.length), trend: 0, spark: spark([1, 1, 2, 2, 3, 3, 4]) },
      { label: 'Certificates', value: String(certs), trend: 0, spark: spark([0, 0, 1, 1, 2, 2, certs]) },
      { label: 'Avg Test Score', value: `${avg}%`, trend: 0, spark: spark([60, 65, 70, 72, 78, 80, avg]) },
    ];
    return ok(out);
  }

  if (role === 'teacher') {
    const [classes, competitions, students] = await Promise.all([
      prisma.classRoom.count({ where: { teacherId: me.id } }),
      prisma.competition.count({ where: { createdById: me.id } }),
      prisma.classEnrollment.count({
        where: { classroom: { teacherId: me.id } },
      }),
    ]);
    const passed = await prisma.attempt.count({
      where: { passed: true, competition: { createdById: me.id } },
    });
    const total = await prisma.attempt.count({
      where: { competition: { createdById: me.id } },
    });
    const passRate = total ? Math.round((passed / total) * 100) : 0;
    const out: Stat[] = [
      { label: 'Classes Created', value: String(classes), trend: 0, spark: spark([1, 2, 2, 3, 4, 5, classes]) },
      { label: 'Competitions Hosted', value: String(competitions), trend: 0, spark: spark([2, 4, 6, 9, 14, 19, competitions]) },
      { label: 'Total Students', value: String(students), trend: 0, spark: spark([20, 40, 60, 90, 110, 150, students]) },
      { label: 'Avg Pass Rate', value: `${passRate}%`, trend: 0, spark: spark([70, 72, 71, 74, 76, 77, passRate]) },
    ];
    return ok(out);
  }

  // admin
  const [teachers, students, competitions] = await Promise.all([
    prisma.user.count({ where: { instituteId: me.instituteId, role: 'teacher' } }),
    prisma.user.count({ where: { instituteId: me.instituteId, role: 'student' } }),
    prisma.competition.count({ where: { instituteId: me.instituteId } }),
  ]);
  const passed = await prisma.attempt.count({
    where: { passed: true, competition: { instituteId: me.instituteId } },
  });
  const total = await prisma.attempt.count({
    where: { competition: { instituteId: me.instituteId } },
  });
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  const out: Stat[] = [
    { label: 'Teachers', value: String(teachers), trend: 0, spark: spark([1, 2, 4, 7, 10, 14, teachers]) },
    { label: 'Students', value: String(students), trend: 0, spark: spark([50, 120, 240, 400, 700, 1000, students]) },
    { label: 'Competitions', value: String(competitions), trend: 0, spark: spark([5, 12, 25, 50, 80, 110, competitions]) },
    { label: 'Pass Rate', value: `${passRate}%`, trend: 0, spark: spark([70, 72, 75, 77, 79, 80, passRate]) },
  ];
  return ok(out);
});
