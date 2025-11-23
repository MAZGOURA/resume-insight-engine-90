import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PolicyPopupProps {
  title: string;
  policyKey: string;
  children: React.ReactNode;
}

export const PolicyPopup = ({
  title,
  policyKey,
  children,
}: PolicyPopupProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const getPolicyContent = () => {
    switch (policyKey) {
      case "shipping":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "Our shipping policy provides detailed information about delivery options, shipping costs, and delivery times for orders placed through ANAS FRAGRANCES."
              )}
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">{t("Delivery Options")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Standard Shipping: 3-5 business days")}</li>
                <li>{t("Express Shipping: 1-2 business days")}</li>
                <li>
                  {t(
                    "Same-day Delivery: Available in select metropolitan areas"
                  )}
                </li>
              </ul>

              <h3 className="font-semibold">{t("Shipping Costs")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Free shipping on orders over 100€")}</li>
                <li>{t("Standard shipping: 5€")}</li>
                <li>{t("Express shipping: 15€")}</li>
                <li>{t("Same-day delivery: 20€")}</li>
              </ul>

              <h3 className="font-semibold">{t("International Shipping")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "We ship worldwide with delivery times varying by destination. International shipping costs are calculated at checkout."
                )}
              </p>
            </div>
          </div>
        );
      case "returns":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "Our return and exchange policy ensures your complete satisfaction with every purchase."
              )}
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">{t("Return Policy")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("30-day return period from date of delivery")}</li>
                <li>
                  {t(
                    "Items must be in original condition with packaging intact"
                  )}
                </li>
                <li>
                  {t("Return shipping costs are covered for defective items")}
                </li>
                <li>{t("Original shipping costs are non-refundable")}</li>
              </ul>

              <h3 className="font-semibold">{t("Exchange Process")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  {t("Contact customer service within 30 days of receipt")}
                </li>
                <li>{t("Provide order number and reason for exchange")}</li>
                <li>{t("Ship item back in original packaging")}</li>
                <li>
                  {t("New item will be shipped upon receipt of returned item")}
                </li>
              </ul>

              <h3 className="font-semibold">{t("Non-Returnable Items")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "Certain items such as opened fragrances, personalized items, and gift cards cannot be returned."
                )}
              </p>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "We are committed to protecting your privacy and personal information."
              )}
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">{t("Information We Collect")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  {t(
                    "Personal information (name, email, address, phone number)"
                  )}
                </li>
                <li>
                  {t(
                    "Payment information (processed securely through our payment partners)"
                  )}
                </li>
                <li>
                  {t("Browsing data (IP address, browser type, pages visited)")}
                </li>
                <li>{t("Purchase history and preferences")}</li>
              </ul>

              <h3 className="font-semibold">
                {t("How We Use Your Information")}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Process and fulfill your orders")}</li>
                <li>
                  {t("Communicate with you about your account and orders")}
                </li>
                <li>{t("Improve our website and services")}</li>
                <li>
                  {t("Send you marketing communications (with your consent)")}
                </li>
              </ul>

              <h3 className="font-semibold">{t("Data Protection")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "We implement industry-standard security measures to protect your personal information. We never sell your personal data to third parties."
                )}
              </p>
            </div>
          </div>
        );
      case "terms":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "These terms and conditions govern your use of the ANAS FRAGRANCES website and services."
              )}
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">{t("Account Terms")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  {t("You must be at least 18 years old to create an account")}
                </li>
                <li>
                  {t("You are responsible for maintaining account security")}
                </li>
                <li>{t("One account per person is allowed")}</li>
                <li>
                  {t(
                    "We reserve the right to terminate accounts that violate our policies"
                  )}
                </li>
              </ul>

              <h3 className="font-semibold">{t("Order Terms")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Prices are in EUR and include applicable taxes")}</li>
                <li>{t("We reserve the right to refuse or cancel orders")}</li>
                <li>{t("Availability of products is subject to change")}</li>
                <li>
                  {t(
                    "We are not liable for delays caused by suppliers or shipping carriers"
                  )}
                </li>
              </ul>

              <h3 className="font-semibold">{t("Intellectual Property")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "All content on this site is protected by copyright and trademark laws. Unauthorized use is prohibited."
                )}
              </p>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "Our customer support team is here to assist you with any questions or concerns."
              )}
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold">{t("Contact Methods")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Email: support@essenceexpress.com")}</li>
                <li>{t("Phone: +33 1 23 45 67 89")}</li>
                <li>
                  {t(
                    "Live Chat: Available on our website during business hours"
                  )}
                </li>
                <li>{t("Contact Form: Available on our Contact page")}</li>
              </ul>

              <h3 className="font-semibold">{t("Support Business Hours")}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("Monday - Friday: 9:00 AM - 6:00 PM (CET)")}</li>
                <li>{t("Saturday: 10:00 AM - 4:00 PM (CET)")}</li>
                <li>{t("Sunday: Closed")}</li>
              </ul>

              <h3 className="font-semibold">{t("Response Times")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "We strive to respond to all inquiries within 24 hours during business days."
                )}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "Policy content is being updated. Please check back later or contact our customer service for more information."
              )}
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {getPolicyContent()}
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>{t("Close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
