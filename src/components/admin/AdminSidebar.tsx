import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  LogOut,
  Home,
  Settings,
  Truck,
  UserCircle,
  Wallet,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const links = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/customers", icon: Users, label: "Customers" },
    { to: "/admin/categories", icon: Tag, label: "Categories" },
    { to: "/admin/drivers", icon: Truck, label: "Drivers" },
    {
      to: "/admin/driver-assignments",
      icon: UserCircle,
      label: "Driver Assignments",
    },
    { to: "/admin/driver-payments", icon: Wallet, label: "Driver Payments" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    // Redirect to admin login page
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-6">
        <h2 className="text-2xl font-serif font-bold bg-gradient-luxury bg-clip-text text-transparent">
          Admin Panel
        </h2>
      </div>

      <nav className="space-y-1 px-3">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </Link>

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
  );
};

export default AdminSidebar;
