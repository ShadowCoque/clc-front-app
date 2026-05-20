import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export function KpiCard({ label, value, icon: Icon, color = '#063E7B', subtitle }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#C2CFDB] shadow-sm p-3 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-gray-500 font-medium truncate">{label}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 md:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
