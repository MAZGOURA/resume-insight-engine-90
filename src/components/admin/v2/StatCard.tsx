import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorClass = "bg-primary/10 text-primary",
}: StatCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-muted">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-sm font-medium flex items-center gap-1",
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground text-xs">vs mois dernier</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
            colorClass
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
