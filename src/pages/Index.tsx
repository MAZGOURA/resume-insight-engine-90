import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Droplets,
  Atom,
  Zap,
  Shield,
  RotateCcw,
  FlaskConical,
  Star,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { productService } from "@/integrations/supabase/services/productService";
import type { Product } from "@/types/product";

const Index = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts(6);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group bg-card rounded-xl border border-border/20 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-900/10 to-purple-900/10">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Droplets className="h-12 w-12 text-indigo-400" />
          </div>
        )}
        <Button
          className="absolute top-2 right-2 h-7 rounded-full bg-indigo-500 hover:bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs px-2"
          onClick={() => addToCart(product)}
        >
          <Droplets className="h-3 w-3 mr-1" />
          {t("mall.addCart")}
        </Button>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
            {product.category || "Fragrance"}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground ml-1">
                {product.rating}
              </span>
            </div>
          )}
        </div>
        <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${product.price}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title="Premium Perfume Collection"
        description="Discover luxury fragrances at ANAS FRAGRANCES. Shop our curated collection of premium perfumes, colognes, and designer fragrances for men and women. Free shipping on orders over 300 MAD."
        keywords="perfume, cologne, fragrance, luxury, designer, Morocco, ANAS FRAGRANCES, oud, floral, oriental, woody, citrus"
      />
      <Hero />

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <FlaskConical className="h-4 w-4 text-indigo-400 mr-1" />
              <span className="text-indigo-300 font-medium text-sm">
                {t("index.labCrafted")}
              </span>
            </div>
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("index.featured")}{" "}
              <span className="text-indigo-500">{t("index.formulations")}</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t("index.innovative")}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border/20 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-muted" />
                  <div className="p-3">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/mall">
              <Button
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-5 text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Droplets className="h-4 w-4 mr-2" />
                {t("index.explore")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-950/50 to-purple-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("index.the")}{" "}
              <span className="text-indigo-400">{t("index.science")}</span>{" "}
              {t("index.behind")}
            </h2>
            <p className="text-base text-indigo-100 max-w-2xl mx-auto">
              {t("index.revolutionary")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-card/20 transition-all duration-300 border border-indigo-500/20">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {t("index.molecular")}
              </h3>
              <p className="text-indigo-100 text-sm">{t("index.technology")}</p>
            </div>

            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-card/20 transition-all duration-300 border border-indigo-500/20">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {t("index.pure")}
              </h3>
              <p className="text-indigo-100 text-sm">
                {t("index.ingredients")}
              </p>
            </div>

            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-card/20 transition-all duration-300 border border-indigo-500/20">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {t("index.sustainable")}
              </h3>
              <p className="text-indigo-100 text-sm">{t("index.processes")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* Removed as per client request */}
    </div>
  );
};

export default Index;
