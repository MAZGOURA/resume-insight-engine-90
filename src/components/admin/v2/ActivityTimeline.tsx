import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ShoppingBag, User, Package } from "lucide-react";

interface Activity {
  id: string;
  type: "order" | "customer" | "product";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const getIcon = (type: Activity["type"]) => {
  switch (type) {
    case "order":
      return ShoppingBag;
    case "customer":
      return User;
    case "product":
      return Package;
  }
};

const getStatusColor = (status?: string) => {
  if (!status) return "default";
  
  const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    confirmed: "secondary",
    processing: "default",
    shipped: "default",
    delivered: "secondary",
    cancelled: "destructive",
  };
  
  return statusMap[status] || "default";
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Activité Récente</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  {activity.status && (
                    <Badge variant={getStatusColor(activity.status)} className="flex-shrink-0">
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
