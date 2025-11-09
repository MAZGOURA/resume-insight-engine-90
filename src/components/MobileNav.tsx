import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const MobileNav = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: t("Shop"), href: "/shop" },
    { name: t("About"), href: "/about" },
    { name: t("FAQ"), href: "/faq" },
    { name: t("Contact"), href: "/contact" },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative z-50 border-border hover:bg-accent/10 transition-colors duration-300 focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("Open menu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[320px] p-0 bg-background border-border shadow-xl"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
              <Link
                to="/"
                className="text-xl font-bold luxury-text text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                onClick={() => setIsOpen(false)}
              >
                {t("Essence Express")}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label={t("Close menu")}
                className="hover:bg-accent/10 focus:ring-2 focus:ring-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 py-6" role="navigation">
              <div className="space-y-2 px-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-5 py-4 text-base font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-5 border-t border-border bg-secondary/30">
              <p className="text-sm text-muted-foreground mb-3">
                {t("Premium fragrances for the discerning individual")}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  onClick={() => {
                    setIsOpen(false);
                    // Dispatch event to open auth modal
                    window.dispatchEvent(
                      new CustomEvent("openAuthModal", {
                        detail: { tab: "signin" },
                      })
                    );
                  }}
                >
                  {t("Sign In")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs border-border focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  onClick={() => {
                    setIsOpen(false);
                    // Dispatch event to open auth modal
                    window.dispatchEvent(
                      new CustomEvent("openAuthModal", {
                        detail: { tab: "signup" },
                      })
                    );
                  }}
                >
                  {t("Sign Up")}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
