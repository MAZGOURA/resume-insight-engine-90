import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Layers,
  Settings,
  MapPin, // Added MapPin icon for shipping cities
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  BarChart3,
  ShoppingCart,
  UserCog,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> &
      React.RefAttributes<SVGSVGElement>
  >;
  path: string;
  badge?: string;
  separator?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "orders",
    label: "Commandes",
    icon: ShoppingBag,
    path: "/admin/orders",
  },
  {
    id: "products",
    label: "Produits",
    icon: Package,
    path: "/admin/products",
  },
  {
    id: "customers",
    label: "Clients",
    icon: Users,
    path: "/admin/customers",
  },
  {
    id: "contact-messages",
    label: "Messages Contact",
    icon: FileText,
    path: "/admin/contact-messages",
  },
  {
    id: "shipping-cities",
    label: "Shipping Cities",
    icon: MapPin,
    path: "/admin/shipping-cities",
  },
  {
    id: "categories",
    label: "Catégories",
    icon: Tag,
    path: "/admin/categories",
  },
  {
    id: "collections",
    label: "Collections",
    icon: Layers,
    path: "/admin/collections",
  },
  {
    id: "shipping-tax",
    label: "Configuration",
    icon: Settings,
    path: "/admin/shipping-tax",
  },
];

const secondaryItems: MenuItem[] = [
  {
    id: "help",
    label: "Aide",
    icon: HelpCircle,
    path: "/admin/help", // This doesn't exist yet
  },
];

interface AdminNavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function AdminNavigation({
  isCollapsed,
  setIsCollapsed,
}: AdminNavigationProps) {
  const { t } = useTranslation();
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [stats, setStats] = useState({
    sales: "2 450€",
    salesChange: "+12%",
    orders: 24,
    customers: 128,
  });

  const fetchNewOrdersCount = async () => {
    try {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "processing"]);
      setNewOrdersCount(count || 0);
    } catch (error) {
      console.error("Error fetching orders count:", error);
    }
  };

  useEffect(() => {
    fetchNewOrdersCount();
    const channel = supabase
      .channel("orders-admin-nav")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchNewOrdersCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavCls = (active: boolean, isCollapsed: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg transition-all duration-200",
      active
        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      isCollapsed ? "justify-center p-2" : "px-3 py-2"
    );

  return (
    <>
      {/* Desktop Navigation - Collapsible */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-to-b from-background to-muted/30 border-r transition-all duration-300 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Admin Profile Section */}

          {/* Logo Area */}
          <div className="border-b p-4">
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Main Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = t(item.label);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={getNavCls(active, isCollapsed)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{label}</span>
                        {item.id === "orders" && newOrdersCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-xs animate-pulse"
                          >
                            {newOrdersCount}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Divider */}
            {!isCollapsed && <div className="border-t my-4 mx-2"></div>}

            {/* Secondary Navigation Items */}
            <div className="space-y-1 px-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = t(item.label);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={getNavCls(active, isCollapsed)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="flex-1">{label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Logout Button at Bottom */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3",
                isCollapsed ? "justify-center p-2" : "justify-start px-3 py-2"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{t("Déconnexion")}</span>}
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}
