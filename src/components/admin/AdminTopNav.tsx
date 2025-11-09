import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface AdminTopNavProps {
  title: string;
  subtitle?: string;
}

export function AdminTopNav({ title, subtitle }: AdminTopNavProps) {
  const { admin, logout } = useAdminAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();

    // Set up realtime subscription for orders
    const ordersChannel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    // Set up realtime subscription for contact messages
    const messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const fetchNotificationCount = async () => {
    try {
      // Count pending/processing orders
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "processing"]);

      // Count unread messages
      const { count: messagesCount } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      setNotificationCount((ordersCount || 0) + (messagesCount || 0));
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
            <span className="text-xl font-bold text-primary-foreground">A</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">ANAS FRAGRANCES</p>
          </div>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-2xl mx-auto hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher produits, commandes, clients..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:flex"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {notificationCount}
              </Badge>
            )}
          </Button>

          <div className="hidden md:flex items-center gap-3 ml-2 px-3 py-1.5 rounded-full bg-muted/50">
            <div className="text-right">
              <p className="text-xs font-medium">
                {admin?.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Administrateur
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {admin?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hidden sm:flex"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <SidebarTrigger className="lg:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </div>

      {/* Breadcrumb / Page Title */}
      <div className="border-t bg-muted/30 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
