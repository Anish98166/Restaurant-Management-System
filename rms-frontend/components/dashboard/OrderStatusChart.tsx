'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { OrderStatus } from '@/types';

interface OrderStatusChartProps {
  data: Array<{ status: OrderStatus; _count: { status: number } }>;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#FFB74D',
  PREPARING: '#42A5F5',
  SERVED: '#AB47BC',
  COMPLETED: '#66BB6A',
  CANCELLED: '#EF5350',
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((d) => ({
    name: d.status.charAt(0) + d.status.slice(1).toLowerCase(),
    value: d._count.status,
    color: STATUS_COLORS[d.status],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#FFF8F0', border: '1px solid #F5E6D3', borderRadius: '12px' }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#4E342E', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
