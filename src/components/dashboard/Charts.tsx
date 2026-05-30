'use client';

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivityPoint, ScoreBucket, SkillPoint } from '@/lib/types';

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  fontSize: 12,
  padding: '8px 12px',
};

const axisTick = { fontSize: 12, fill: '#9CA3AF' };

/** Weekly activity — hours studied vs target. */
export function ActivityChart({ data, height = 260 }: { data: ActivityPoint[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C0392B" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#E5E7EB' }} />
          <Area
            type="monotone"
            dataKey="value"
            name="Hours"
            stroke="#C0392B"
            strokeWidth={2.5}
            fill="url(#activityFill)"
            dot={{ r: 3, fill: '#C0392B', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Per-subject mastery radar. */
export function SkillRadarChart({ data, height = 280 }: { data: SkillPoint[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6B7280' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#C0392B"
            fill="#C0392B"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip contentStyle={tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Score distribution histogram (teacher/admin). */
export function ScoreDistributionChart({
  data,
  height = 260,
}: {
  data: ScoreBucket[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="range" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F9FAFB' }} />
          <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill="#C0392B" fillOpacity={0.4 + 0.6 * (d.count / max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
