import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { PolicyPopup } from "@/components/PolicyPopup";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{t("Essence Express")}</h3>
            <p className="text-muted-foreground mb-6">
              {t(
                "Your premier destination for luxury perfumes and fragrances from around the world."
              )}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Quick Links")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("Home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("Shop")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("About")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("Contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Customer Service")}</h4>
            <ul className="space-y-2">
              <li>
                <PolicyPopup title={t("Shipping Policy")} policyKey="shipping">
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    {t("Shipping Policy")}
                  </button>
                </PolicyPopup>
              </li>
              <li>
                <PolicyPopup
                  title={t("Returns & Exchanges")}
                  policyKey="returns"
                >
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    {t("Returns & Exchanges")}
                  </button>
                </PolicyPopup>
              </li>
              <li>
                <PolicyPopup title={t("Privacy Policy")} policyKey="privacy">
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    {t("Privacy Policy")}
                  </button>
                </PolicyPopup>
              </li>
              <li>
                <PolicyPopup title={t("Terms & Conditions")} policyKey="terms">
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    {t("Terms & Conditions")}
                  </button>
                </PolicyPopup>
              </li>
              <li>
                <PolicyPopup title={t("Support Center")} policyKey="support">
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    {t("Support Center")}
                  </button>
                </PolicyPopup>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Contact Info")}</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("Address")}</p>
                  <p className="text-sm text-muted-foreground">
                    123 Fragrance Ave, New York, NY 10001
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("Phone")}</p>
                  <p className="text-sm text-muted-foreground">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("Email")}</p>
                  <p className="text-sm text-muted-foreground">
                    support@essenceexpress.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">123 Fragrance Ave, New York</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ANAS FRAGRANCES.{" "}
            {t("All rights reserved")}.
          </div>
        </div>
      </div>
    </footer>
  );
};
