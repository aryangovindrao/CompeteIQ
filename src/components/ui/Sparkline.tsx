'use client';

import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';
import type { SparkPoint } from '@/lib/types';

/** Tiny 7-bar sparkline for stat cards. */
export function Sparkline({
  data,
  color = '#C0392B',
  height = 40,
}: {
  data: SparkPoint[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={3}>
          <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={color}
                fillOpacity={0.35 + 0.65 * (d.value / max)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
