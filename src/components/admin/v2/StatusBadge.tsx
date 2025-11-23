import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Package, Truck, XCircle, RotateCcw } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "message" | "product";
}

export const StatusBadge = ({ status, type = "order" }: StatusBadgeProps) => {
  const getOrderConfig = (status: string) => {
    const configs: Record<string, { variant: any; icon: any; label: string; className?: string }> = {
      pending: {
        variant: "secondary",
        icon: Clock,
        label: "En attente",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      },
      confirmed: {
        variant: "default",
        icon: CheckCircle,
        label: "Confirmée",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      processing: {
        variant: "default",
        icon: Package,
        label: "En traitement",
        className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      },
      shipped: {
        variant: "default",
        icon: Truck,
        label: "Expédiée",
        className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      delivered: {
        variant: "default",
        icon: CheckCircle,
        label: "Livrée",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        label: "Annulée",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      },
      returned: {
        variant: "secondary",
        icon: RotateCcw,
        label: "Retournée",
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentConfig = (status: string) => {
    const configs: Record<string, { variant: any; label: string; className?: string }> = {
      pending: {
        variant: "secondary",
        label: "En attente",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      },
      processing: {
        variant: "default",
        label: "En cours",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      completed: {
        variant: "default",
        label: "Payé",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      failed: {
        variant: "destructive",
        label: "Échoué",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      },
      refunded: {
        variant: "secondary",
        label: "Remboursé",
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      },
    };
    return configs[status] || configs.pending;
  };

  const getMessageConfig = (isRead: boolean) => {
    return isRead
      ? {
          variant: "secondary" as const,
          label: "Lu",
          className: "bg-muted text-muted-foreground",
        }
      : {
          variant: "default" as const,
          label: "Non lu",
          className: "bg-primary/10 text-primary border-primary/20",
        };
  };

  const getProductConfig = (isActive: boolean) => {
    return isActive
      ? {
          variant: "default" as const,
          label: "Actif",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        }
      : {
          variant: "secondary" as const,
          label: "Inactif",
          className: "bg-muted text-muted-foreground",
        };
  };

  let config;
  let Icon = null;

  if (type === "order") {
    config = getOrderConfig(status);
    Icon = config.icon;
  } else if (type === "payment") {
    config = getPaymentConfig(status);
  } else if (type === "message") {
    config = getMessageConfig(status === "true" || status === "read");
  } else if (type === "product") {
    config = getProductConfig(status === "true" || status === "active");
  }

  return (
    <Badge variant={config?.variant} className={cn("gap-1", config?.className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {config?.label || status}
    </Badge>
  );
};
