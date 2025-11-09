import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  Tag,
  Layers,
  BarChart3,
  Settings,
  Zap,
  Star,
  Clock,
  Heart,
  MapPin, // Added MapPin icon for shipping cities
  User, // Added User icon for profile
  HelpCircle, // Added HelpCircle icon for help
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
}

export function AdminQuickAccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([
    "products",
    "orders",
    "customers",
  ]);

  const quickActions: QuickAction[] = [
    {
      id: "dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      label: t("Dashboard"),
      path: "/admin/dashboard",
      color: "bg-blue-500",
    },
    {
      id: "orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: t("Commandes"),
      path: "/admin/orders",
      color: "bg-green-500",
    },
    {
      id: "products",
      icon: <Package className="h-5 w-5" />,
      label: t("Produits"),
      path: "/admin/products",
      color: "bg-purple-500",
    },
    {
      id: "customers",
      icon: <Users className="h-5 w-5" />,
      label: t("Clients"),
      path: "/admin/customers",
      color: "bg-orange-500",
    },
    {
      id: "categories",
      icon: <Tag className="h-5 w-5" />,
      label: t("Categories"),
      path: "/admin/categories",
      color: "bg-yellow-500",
    },
    {
      id: "collections",
      icon: <Layers className="h-5 w-5" />,
      label: t("Collections"),
      path: "/admin/collections",
      color: "bg-pink-500",
    },
    {
      id: "shipping-cities",
      icon: <MapPin className="h-5 w-5" />,
      label: t("Shipping Cities"),
      path: "/admin/shipping-cities",
      color: "bg-green-500",
    },
    {
      id: "settings",
      icon: <Settings className="h-5 w-5" />,
      label: t("Settings"),
      path: "/admin/shipping-tax",
      color: "bg-gray-500",
    },
    {
      id: "profile",
      icon: <User className="h-5 w-5" />,
      label: t("Profil"),
      path: "/admin/profile",
      color: "bg-indigo-500",
    },
    {
      id: "help",
      icon: <HelpCircle className="h-5 w-5" />,
      label: t("Aide"),
      path: "/admin/help",
      color: "bg-cyan-500",
    },
  ];

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const favoriteActions = quickActions.filter((action) =>
    favorites.includes(action.id)
  );

  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      {favoriteActions.length > 0 && (
        <div>
                 <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t("Favorites")}
            </h3>
           
          </div>
          <div className="grid grid-cols-4 gap-2">
            {favoriteActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="flex flex-col items-center justify-center h-16 gap-1 p-2 rounded-lg"
                onClick={() => navigate(action.path)}
              >
                <div className={cn("p-2 rounded-md text-white", action.color)}>
                  {action.icon}
                </div>
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("Quick Access")}
          </h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {quickActions.map((action) => (
            <div key={action.id} className="relative group">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-16 gap-1 p-2 rounded-lg w-full"
                onClick={() => navigate(action.path)}
              >
                <div className={cn("p-2 rounded-md text-white", action.color)}>
                  {action.icon}
                </div>
                <span className="text-xs text-center">{action.label}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 transition-opacity",
                  favorites.includes(action.id)
                    ? "opacity-100 bg-red-500 hover:bg-red-600 text-white"
                    : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(action.id);
                }}
              >
                <Star
                  className={cn(
                    "h-3 w-3",
                    favorites.includes(action.id) ? "fill-current" : ""
                  )}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
