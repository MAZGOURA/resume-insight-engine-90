import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { supabase } from "@/integrations/supabase/client";

interface AdminTopAppBarProps {
  title: string;
  subtitle?: string;
  isNavCollapsed?: boolean;
  onMenuClick?: () => void;
}

export function AdminTopAppBar({
  title,
  subtitle,
  isNavCollapsed = false,
  onMenuClick,
}: AdminTopAppBarProps) {
  const { t } = useTranslation();
  const { admin, logout } = useAdminAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    try {
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "processing"]);

      const { count: messagesCount } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      setNotificationCount((ordersCount || 0) + (messagesCount || 0));
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();

    const ordersChannel = supabase
      .channel("orders-topappbar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("messages-topappbar")
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl"
      style={{
        paddingLeft: isNavCollapsed ? "5rem" : "16rem",
        transition: "padding-left 300ms ease",
        zIndex: 50,
      }}
    >
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {t("Panneau d'administration")}
            </h1>
          </div>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Rechercher...")}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
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
                {t("Administrateur")}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {admin?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Breadcrumb and Mobile Search Bar */}
      <div className="border-t bg-muted/30 px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Breadcrumb */}
          <div className="hidden md:block">
            <AdminBreadcrumb />
          </div>

          {/* Mobile Search Bar */}
          <div className="relative md:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Rechercher...")}
              className="pl-10 bg-background border focus-visible:ring-1"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
