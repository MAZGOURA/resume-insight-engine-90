import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Layers,
  Settings,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  {
    id: "overview",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    badge: null,
  },
  {
    id: "orders",
    label: "Commandes",
    icon: ShoppingBag,
    path: "/admin/dashboard#orders",
    badge: null,
  },
  {
    id: "products",
    label: "Produits",
    icon: Package,
    path: "/admin/dashboard#products",
    badge: null,
  },
  {
    id: "customers",
    label: "Clients",
    icon: Users,
    path: "/admin/dashboard#customers",
    badge: null,
  },
  {
    id: "shipping-cities",
    label: "Shipping Cities",
    icon: MapPin,
    path: "/admin/shipping-cities",
    badge: null,
  },
  {
    id: "categories",
    label: "Catégories",
    icon: Tag,
    path: "/admin/categories",
    badge: null,
  },
  {
    id: "collections",
    label: "Collections",
    icon: Layers,
    path: "/admin/collections",
    badge: null,
  },
  {
    id: "shipping-tax",
    label: "Configuration",
    icon: Settings,
    path: "/admin/shipping-tax",
    badge: null,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    fetchNewOrdersCount();

    // Set up realtime subscription
    const channel = supabase
      .channel('orders-sidebar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchNewOrdersCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNewOrdersCount = async () => {
    try {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']);

      setNewOrdersCount(count || 0);
    } catch (error) {
      console.error('Error fetching orders count:', error);
    }
  };

  const isActive = (path: string) => {
    if (path.includes("#")) {
      const hash = window.location.hash.replace("#", "");
      return path.includes(hash);
    }
    return currentPath === path;
  };

  const getNavCls = (active: boolean) =>
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="border-l border-r-0 hidden lg:block w-72 bg-muted/30"
    >
      <SidebarContent className="py-6 px-3">
        {/* Quick Stats */}
        <div className="mb-6 space-y-3 px-2">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Ventes aujourd'hui
                </p>
                <p className="text-2xl font-bold mt-1">2 450€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs text-primary mt-2">↑ 12% vs hier</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = t(item.label);

                // For hash-based navigation
                if (item.path.includes("#")) {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild className="h-11">
                        <a
                          href={item.path}
                          className={`${getNavCls(
                            active
                          )} flex items-center gap-3 rounded-lg transition-all`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{label}</span>
                              {item.id === 'orders' && newOrdersCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 px-1.5 text-xs"
                                >
                                  {newOrdersCount}
                                </Badge>
                              )}
                              {item.badge && item.id !== 'orders' && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 px-1.5 text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // For route-based navigation
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild className="h-11">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `${getNavCls(
                            isActive
                          )} flex items-center gap-3 rounded-lg transition-all`
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{label}</span>
                            {item.id === 'orders' && newOrdersCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-xs"
                              >
                                {newOrdersCount}
                              </Badge>
                            )}
                            {item.badge && item.id !== 'orders' && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
