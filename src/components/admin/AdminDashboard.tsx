import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
} from "lucide-react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { OrderManagement } from "./OrderManagement";
import { ProductManagement } from "./ProductManagement";
import { CustomerManagement } from "./CustomerManagement";
import { AdminLayout } from "./AdminLayout";
import { AdminQuickAccess } from "./AdminQuickAccess";
import { useTranslation } from "react-i18next";

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");

  // Scroll to section when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveSection(hash);

        // Scroll to the section after a short delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "orders":
        return (
          <div id="orders">
            <OrderManagement />
          </div>
        );
      case "products":
        return (
          <div id="products">
            <ProductManagement />
          </div>
        );
      case "customers":
        return (
          <div id="customers">
            <CustomerManagement />
          </div>
        );
      default:
        return (
          <div id="overview">
            <AnalyticsDashboard />
          </div>
        );
    }
  };

  return (
    <AdminLayout
      title={t("Tableau de bord")}
      subtitle={t("Vue d'ensemble des performances de votre boutique")}
    >
      <div className="space-y-6">
        {/* Quick Access Toolbar */}
        <AdminQuickAccess />
        {renderActiveSection()}
      </div>
    </AdminLayout>
  );
};
