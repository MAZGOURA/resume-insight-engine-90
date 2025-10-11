import {
  ShoppingCart,
  Search,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { items } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();

  // Apply RTL styling for Arabic
  const isRTL = i18n.language === "ar";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur-xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-30 animate-pulse"></div>
              <Droplets className="h-6 w-6 sm:h-8 w-8 text-indigo-400 relative z-10" />
            </div>
            <h1 className="font-mono text-lg sm:text-2xl font-bold text-foreground">
              ANAS<span className="text-indigo-400">FRAGRANCES</span>
            </h1>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-indigo-500/10 ${
                location.pathname === "/"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "hover:text-indigo-400"
              }`}
            >
              {t("header.home")}
            </Link>
            <Link
              to="/mall"
              className={`text-sm font-medium transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-indigo-500/10 ${
                location.pathname === "/mall"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "hover:text-indigo-400"
              }`}
            >
              {t("header.discover")}
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-indigo-500/10 ${
                location.pathname === "/about"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "hover:text-indigo-400"
              }`}
            >
              {t("header.story")}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-indigo-500/10 ${
                location.pathname === "/contact"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "hover:text-indigo-400"
              }`}
            >
              {t("header.contact")}
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3" dir="ltr">
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("header.search")}
                  className="pl-10 pr-3 py-1 sm:pl-10 sm:pr-4 sm:py-2 w-40 sm:w-64 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-indigo-500/10 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <LanguageSelector />
            <ThemeToggle />

            <Link to="/account">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-indigo-500/10 transition-colors"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            {/* Removed sign in button and user dropdown as requested */}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl lg:hidden hover:bg-indigo-500/10 transition-colors"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
