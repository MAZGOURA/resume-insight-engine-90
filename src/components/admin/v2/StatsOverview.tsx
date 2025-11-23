import { MetricCard } from "./MetricCard";
import { LucideIcon } from "lucide-react";

interface Stat {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  colorClass: string;
}

interface StatsOverviewProps {
  stats: Stat[];
  loading?: boolean;
}

export const StatsOverview = ({ stats, loading }: StatsOverviewProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          colorClass={stat.colorClass}
        />
      ))}
    </div>
  );
};
