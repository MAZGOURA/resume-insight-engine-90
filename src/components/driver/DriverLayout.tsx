import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, Wallet, LogOut } from "lucide-react";

const DriverLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const links = [
    { to: "/driver/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/driver/payments", icon: Wallet, label: "Payments" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    // Redirect to driver login page
    navigate("/driver/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold bg-gradient-luxury bg-clip-text text-transparent">
            Driver Panel
          </h2>
        </div>

        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive(link.to) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DriverLayout;
