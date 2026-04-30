'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'EEE'),
    revenue: Number(d.revenue.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Revenue</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF8A65" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
          <XAxis dataKey="label" tick={{ fill: '#8D6E63', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8D6E63', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#FFF8F0', border: '1px solid #F5E6D3', borderRadius: '12px' }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#FF8A65"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
