import { LucideIcon } from 'lucide-react';
import { StatCardSkeleton } from '@/components/ui/Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'brown' | 'orange' | 'green' | 'blue' | 'red';
  loading?: boolean;
}

const colorMap = {
  brown: { bg: 'bg-[#4E342E]', icon: 'bg-[#6D4C41]', text: 'text-white' },
  orange: { bg: 'bg-[#FF8A65]', icon: 'bg-[#F4511E]', text: 'text-white' },
  green: { bg: 'bg-emerald-600', icon: 'bg-emerald-700', text: 'text-white' },
  blue: { bg: 'bg-blue-600', icon: 'bg-blue-700', text: 'text-white' },
  red: { bg: 'bg-red-500', icon: 'bg-red-600', text: 'text-white' },
};

export function StatCard({ title, value, subtitle, icon: Icon, color, loading }: StatCardProps) {
  if (loading) return <StatCardSkeleton />;

  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-6 shadow-md card-hover`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${colors.text} opacity-80`}>{title}</p>
        <div className={`${colors.icon} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</p>
      {subtitle && <p className={`text-xs ${colors.text} opacity-70`}>{subtitle}</p>}
    </div>
  );
}
