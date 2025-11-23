import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Layers,
  Settings,
  X,
  Home,
  BarChart3,
  Bell,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const menuItems = [
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
    badge: "5",
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
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    id: "settings",
    label: "Configuration",
    icon: Settings,
    path: "/admin/shipping-tax",
  },
];

const secondaryItems = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  {
    id: "reports",
    label: "Rapports",
    icon: FileText,
    path: "/admin/reports",
  },
  {
    id: "help",
    label: "Aide",
    icon: HelpCircle,
    path: "/admin/help",
  },
];

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileNav({ isOpen, onClose }: AdminMobileNavProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Navigation Panel */}
      <div className="fixed left-0 top-0 h-full w-64 bg-background border-r z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                        "px-3 py-2"
                      )
                    }
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t my-4 mx-2"></div>

            {/* Secondary Navigation Items */}
            <div className="space-y-1 px-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                        "px-3 py-2"
                      )
                    }
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
