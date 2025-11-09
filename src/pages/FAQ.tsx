import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("How do I track my order?"),
      answer: t(
        "Once your order has been shipped, you'll receive a confirmation email with tracking information. You can also view your order status in the 'My Orders' section of your account."
      ),
    },
    {
      question: t("What is your return policy?"),
      answer: t(
        "We offer a 30-day return policy for unopened products. Items must be in their original packaging. To initiate a return, please contact our customer service team."
      ),
    },
    {
      question: t("How should I store my perfumes?"),
      answer: t(
        "Store perfumes in a cool, dry place away from direct sunlight. Keep bottles upright and ensure caps are tightly closed. Proper storage can help maintain fragrance quality for years."
      ),
    },
    {
      question: t("Are your products authentic?"),
      answer: t(
        "Yes, we guarantee that all our products are 100% authentic. We source directly from manufacturers and authorized distributors to ensure product integrity."
      ),
    },
    {
      question: t("How long do perfumes last?"),
      answer: t(
        "The longevity of a perfume depends on its concentration and your skin type. Eau de Parfum typically lasts 4-6 hours, while Parfum can last 6-8 hours or more."
      ),
    },
    {
      question: t("Do you offer international shipping?"),
      answer: t(
        "Yes, we ship worldwide. International shipping costs and delivery times vary by destination. You can view shipping options at checkout."
      ),
    },
    {
      question: t("Can I change or cancel my order?"),
      answer: t(
        "Orders can be modified or canceled within 2 hours of placement. After that, please contact customer service, and we'll do our best to accommodate your request."
      ),
    },
    {
      question: t("How do I know if a perfume is right for me?"),
      answer: t(
        "We recommend trying sample sizes first. Our 'Fragrance Finder' tool can also help you discover scents based on your preferences and occasions."
      ),
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <SEO
        title={t("Frequently Asked Questions - Essence Express")}
        description={t(
          "Find answers to common questions about our luxury perfumes, shipping, returns, and more."
        )}
        keywords={t(
          "faq, frequently asked questions, perfume help, shipping, returns, fragrance"
        )}
      />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("Frequently Asked Questions")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Find answers to common questions about our products and services"
            )}
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("Still have questions?")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t(
              "Our customer service team is here to help you with any additional questions."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg">{t("Contact Us")}</Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg">
                {t("Browse Products")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
