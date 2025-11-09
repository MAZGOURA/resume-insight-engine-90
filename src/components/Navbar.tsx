import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./MobileNav";
import { AuthModal } from "./auth/AuthModal";
import { CartPopup } from "./CartPopup";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const { t } = useTranslation();
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Added state for cart popup
  const [authModalTab, setAuthModalTab] = useState<
    "signin" | "signup" | "forgot"
  >("signin");
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();

  // Check for openLogin parameter in URL and open the modal if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openLogin") === "true") {
      setIsAuthModalOpen(true);
      setAuthModalTab("signin");
      // Remove the parameter from the URL
      params.delete("openLogin");
      const newSearch = params.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${
        location.hash
      }`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location]);

  // Listen for custom event to open auth modal from mobile nav
  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthModalTab(event.detail.tab || "signin");
      setIsAuthModalOpen(true);
    };

    window.addEventListener(
      "openAuthModal",
      handleOpenAuthModal as EventListener
    );
    return () => {
      window.removeEventListener(
        "openAuthModal",
        handleOpenAuthModal as EventListener
      );
    };
  }, []);

  return (
    <nav
      className="border-b bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm w-full"
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold luxury-text tracking-tight text-primary"
          >
            {t("Essence Express")}
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/shop"
              className={`text-sm font-medium hover:text-accent transition-colors relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === "/shop" ? "after:w-full" : ""
              }`}
            >
              {t("Shop")}
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium hover:text-accent transition-colors relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === "/about" ? "after:w-full" : ""
              }`}
            >
              {t("About")}
            </Link>
            <Link
              to="/faq"
              className={`text-sm font-medium hover:text-accent transition-colors relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === "/faq" ? "after:w-full" : ""
              }`}
            >
              {t("FAQ")}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium hover:text-accent transition-colors relative after:absolute after:bottom-[-10px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === "/contact" ? "after:w-full" : ""
              }`}
            >
              {t("Contact")}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-border focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.user_metadata?.first_name || t("Account")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 border-border shadow-lg"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                    >
                      <User className="h-4 w-4" />
                      {t("My Profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t("My Orders")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                    >
                      <Heart className="h-4 w-4" />
                      {t("My Wishlist")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("Sign Out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex border-border text-sm font-medium focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                {t("Sign In")}
              </Button>
            )}

            {/* Changed to button that opens popup instead of link to cart page */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="relative border-border hover:bg-accent/10 transition-colors duration-300 focus:ring-2 focus:ring-accent focus:ring-offset-2"
                onClick={() => setIsCartOpen(true)} // Open cart popup
                aria-label={t("View Cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-xs">
                      {itemCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* Added CartPopup component */}
      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};
