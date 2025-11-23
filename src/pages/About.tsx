import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-12 px-4">
      <SEO
        title={t("About Essence Express - Luxury Perfumes & Fragrances")}
        description={t(
          "Learn about Essence Express, your premier destination for luxury perfumes and fragrances. Discover our story, mission, and commitment to quality."
        )}
        keywords="à propos de nous, parfums de luxe, histoire des fragrances, entreprise de parfums, essence express"
      />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("About Essence Express")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("Your premier destination for luxury perfumes and fragrances")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">{t("Our Story")}</h2>
            <p className="mb-4 text-muted-foreground">
              {t(
                "Founded in 2020, Essence Express began with a simple passion for exceptional fragrances. What started as a small boutique has evolved into a curated online destination for perfume enthusiasts worldwide."
              )}
            </p>
            <p className="mb-4 text-muted-foreground">
              {t(
                "Our journey is driven by a commitment to bringing you the finest scents from renowned perfumers and emerging artisans, each telling a unique story through their compositions."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">{t("Our Mission")}</h2>
            <p className="mb-4 text-muted-foreground">
              {t(
                "We believe that fragrance is more than just a scent—it's an expression of individuality, a memory trigger, and a form of art. Our mission is to make exceptional perfumes accessible to everyone while maintaining the highest standards of quality and authenticity."
              )}
            </p>
            <p className="mb-4 text-muted-foreground">
              {t(
                "We carefully select each fragrance in our collection, ensuring it meets our rigorous standards for craftsmanship, longevity, and olfactory pleasure."
              )}
            </p>
          </div>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("Why Choose Essence Express?")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">100%</span>
                </div>
                <h3 className="font-semibold mb-2">
                  {t("Authentic Products")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "All our perfumes are 100% authentic, sourced directly from manufacturers and authorized distributors."
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">24h</span>
                </div>
                <h3 className="font-semibold mb-2">{t("Fast Shipping")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Enjoy free shipping on orders over $100 and fast delivery within 24-48 hours in metropolitan areas."
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">30d</span>
                </div>
                <h3 className="font-semibold mb-2">{t("Easy Returns")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Not satisfied? Return within 30 days for a full refund, no questions asked."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">
            {t("Ready to Discover Your Signature Scent?")}
          </h2>
          <Link to="/shop">
            <Button size="lg">{t("Explore Our Collection")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
