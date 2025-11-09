import { useState } from "react";
import { AdminNavigation } from "./AdminNavigation";
import { AdminMobileNav } from "./AdminMobileNav";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout = ({
  children,
  title,
  subtitle,
}: AdminLayoutProps) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
      {/* Mobile Navigation */}
      <AdminMobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Navigation - Hidden on mobile when closed */}
      <div className="hidden lg:block">
        <AdminNavigation
          isCollapsed={isNavCollapsed}
          setIsCollapsed={setIsNavCollapsed}
        />
      </div>

      {/* Main Content */}
      <div
        className="pb-0 pt-0 transition-all duration-300 lg:pb-8"
        style={{
          paddingLeft: isNavCollapsed ? "5rem" : "16rem",
          paddingRight: "1rem",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
};
