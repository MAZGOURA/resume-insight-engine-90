import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Truck,
  Receipt,
  Settings,
  ChevronLeft,
  Store,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin",
    color: "text-blue-500",
  },
  {
    id: "orders",
    label: "Commandes",
    icon: ShoppingBag,
    path: "/admin/orders",
    color: "text-emerald-500",
    badge: true,
  },
  {
    id: "products",
    label: "Produits",
    icon: Package,
    path: "/admin/products",
    color: "text-purple-500",
  },
  {
    id: "customers",
    label: "Clients",
    icon: Users,
    path: "/admin/customers",
    color: "text-orange-500",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    path: "/admin/contact-messages",
    color: "text-pink-500",
    badge: true,
  },
  {
    id: "categories",
    label: "Catégories",
    icon: Receipt,
    path: "/admin/categories",
    color: "text-cyan-500",
  },
  {
    id: "collections",
    label: "Collections",
    icon: Store,
    path: "/admin/collections",
    color: "text-indigo-500",
  },
  {
    id: "shipping",
    label: "Livraison",
    icon: Truck,
    path: "/admin/shipping-cities",
    color: "text-amber-500",
  },
];

export const AdminSidebarV2 = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    fetchNotificationCounts();

    const ordersSubscription = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchNotificationCounts();
        }
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          fetchNotificationCounts();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const fetchNotificationCounts = async () => {
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "processing"]);

    const { count: messagesCount } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    setNewOrdersCount(ordersCount || 0);
    setUnreadMessagesCount(messagesCount || 0);
  };

  const getBadgeCount = (itemId: string) => {
    if (itemId === "orders") return newOrdersCount;
    if (itemId === "messages") return unreadMessagesCount;
    return 0;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border h-full flex flex-col transition-all duration-300",
          "fixed lg:static inset-y-0 left-0 z-40",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">ANAS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badge ? getBadgeCount(item.id) : 0;

            return (
                <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-accent/50",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground"
                  )
                }
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", item.color)} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
                      >
                        {badgeCount}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center">
            Admin Panel v2.0
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
