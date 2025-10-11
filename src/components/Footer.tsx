import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Droplets,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <footer
      className="border-t border-border/20 bg-background/80 backdrop-blur-xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                <Droplets className="h-8 w-8 text-indigo-400 relative z-10" />
              </div>
              <h2 className="font-mono text-2xl font-bold text-foreground">
                ANAS<span className="text-indigo-400">FRAGRANCES</span>
              </h2>
            </div>
            <p className="text-muted-foreground">
              Crafting exceptional fragrances with passion and precision since
              2010.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/mall"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  {t("header.discover")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  {t("header.story")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  {t("header.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-foreground">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/account/orders"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/account/wishlist"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 text-foreground">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Perfume Street, New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" />
                <span className="text-muted-foreground">
                  hello@anasfragrances.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ANAS FRAGRANCES. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
