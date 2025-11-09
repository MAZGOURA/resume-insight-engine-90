import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function AdminBreadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to breadcrumb labels
  const routeLabels: Record<string, string> = {
    "/admin": t("Admin"),
    "/admin/dashboard": t("Dashboard"),
    "/admin/orders": t("Orders"),
    "/admin/products": t("Products"),
    "/admin/customers": t("Customers"),
    "/admin/categories": t("Categories"),
    "/admin/collections": t("Collections"),
    "/admin/analytics": t("Analytics"),
    "/admin/shipping-tax": t("Shipping & Tax"),
    "/admin/notifications": t("Notifications"),
    "/admin/reports": t("Reports"),
    "/admin/help": t("Help"),
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: t("Home"),
        path: "/admin/dashboard",
      },
    ];

    pathnames.forEach((pathname, index) => {
      const route = `/admin/${pathname}`;
      const isLast = index === pathnames.length - 1;

      breadcrumbs.push({
        label:
          routeLabels[route] ||
          pathname.charAt(0).toUpperCase() + pathname.slice(1),
        path: isLast ? undefined : route,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {breadcrumb.path ? (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => navigate(breadcrumb.path!)}
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {breadcrumb.label}
            </Button>
          ) : (
            <span className="font-medium text-foreground">
              {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
              {breadcrumb.label}
            </span>
          )}
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}
