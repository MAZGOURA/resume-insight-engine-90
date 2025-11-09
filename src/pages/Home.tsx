import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";
import { getProducts, getCategories, getCollections } from "@/lib/database";
import { Product } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";
import { SkeletonCategoryCard } from "@/components/SkeletonCategoryCard";
import { SkeletonCollectionCard } from "@/components/SkeletonCollectionCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const Home = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
    loadCollections();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Get products ordered by created_at descending to get the latest products
      const products = await getProducts();
      // Filter out products that are out of stock (stock_quantity <= 0)
      const inStockProducts = products.filter(
        (product) =>
          product.stock_quantity !== undefined && product.stock_quantity > 0
      );
      // Sort by created_at descending and take only the first 4
      const sortedProducts = [...inStockProducts].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      );
      setFeaturedProducts(sortedProducts.slice(0, 4));
    } catch (error) {
      console.error("Failed to load featured products:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load featured products"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await getCategories();
      // Limit to 3 best categories (you can adjust the logic as needed)
      setCategories(data.slice(0, 3));
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load categories"
      );
      // Fallback to static categories if database fetch fails
      setCategories([
        {
          id: "men",
          name: t("Men"),
          slug: "men",
          description: null,
          image_url: null,
          is_active: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "women",
          name: t("Women"),
          slug: "women",
          description: null,
          image_url: null,
          is_active: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "unisex",
          name: t("Unisex"),
          slug: "unisex",
          description: null,
          image_url: null,
          is_active: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      const data = await getCollections();
      // Limit to 3 best collections (you can adjust the logic as needed)
      setCollections(data.slice(0, 3));
    } catch (error) {
      console.error("Failed to load collections:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load collections"
      );
      // Fallback to static collections if database fetch fails
      setCollections([
        {
          id: "bestsellers",
          name: t("Best Sellers"),
          slug: "bestsellers",
          description: t("Our most popular fragrances"),
          image:
            "https://images.unsplash.com/photo-1596462502278-27bffd403df9?w=600&h=400&fit=crop",
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "new-arrivals",
          name: t("New Arrivals"),
          slug: "new-arrivals",
          description: t("Latest additions to our collection"),
          image:
            "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=400&fit=crop",
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "limited-edition",
          name: t("Limited Edition"),
          slug: "limited-edition",
          description: t("Exclusive fragrances with limited availability"),
          image:
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop",
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Debug logging
  console.log("Rendering Home component");
  console.log("Featured products:", featuredProducts);
  console.log("Categories:", categories);
  console.log("Collections:", collections);

  if (loading || categoriesLoading || collectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("Loading...")}
      </div>
    );
  }

  // Display error if any
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("Error Loading Content")}
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            {t("Reload Page")}
          </button>
        </div>
      </div>
    );
  }

  // Check if we have data
  console.log(
    "Data check - Products:",
    featuredProducts.length,
    "Categories:",
    categories.length,
    "Collections:",
    collections.length
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${t("Essence Express")} - ${t(
          "Luxury perfumes and fragrances"
        )}`}
        description={t(
          "Discover our exclusive collection of luxury perfumes and fragrances. Premium scents for men, women, and unisex. Free shipping on orders over $100."
        )}
        keywords="parfums de luxe, fragrances, eau de cologne pour hommes, parfum pour femmes, senteurs unisexes, fragrances de créateurs, parfums premium"
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-r from-background to-secondary">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&h=1080&fit=crop')] bg-cover bg-center mix-blend-multiply opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-secondary/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 luxury-text">
              {t("Discover Your Signature Scent")}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-lg">
              {t(
                "Luxury perfumes crafted for those who appreciate the finer things"
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="px-8 py-6 text-base bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t("Explore Collection")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base border-2 hover:bg-secondary transition-all duration-300"
                >
                  {t("Our Story")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
              {t("Shop by Category")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Discover our carefully curated collections for every occasion"
              )}
            </p>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonCategoryCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="group relative h-64 overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                  <img
                    src={
                      category.image_url ||
                      `https://images.unsplash.com/photo-${
                        category.slug === "men"
                          ? "1595950653106-6c9ebd614d3a"
                          : category.slug === "women"
                          ? "1596462502278-27bffd403df9"
                          : "1615634260167-c8cdede054de"
                      }?w=600&h=400&fit=crop`
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white capitalize mb-2 luxury-text">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {t("Discover fragrances")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white/10 transition-colors duration-300"
                    >
                      {t("Explore")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Collections */}
      <section className="py-16 px-4 bg-gradient-to-br from-background to-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
              {t("Featured Collections")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Explore our exclusive collections crafted with the finest ingredients"
              )}
            </p>
          </div>
          {collectionsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonCollectionCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/shop?collection=${collection.slug}`}
                  className="group relative h-80 overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <img
                    src={
                      collection.image ||
                      `https://images.unsplash.com/photo-${
                        collection.slug === "bestsellers"
                          ? "1596462502278-27bffd403df9"
                          : collection.slug === "new-arrivals"
                          ? "1615634260167-c8cdede054de"
                          : "1595950653106-6c9ebd614d3a"
                      }?w=600&h=400&fit=crop`
                    }
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <span className="mb-3 inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      {t("Featured")}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2 luxury-text">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white/10 transition-colors duration-300"
                    >
                      {t("View Collection")}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
              {t("Parfums à la une")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Discover our most popular fragrances loved by our customers")}
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="transition-all duration-300 hover:-translate-y-1 h-full flex"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/shop">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-base bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {t("View All Products")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-16 px-4 bg-gradient-to-r from-secondary to-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
              {t("Why Choose Essence Express")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "We are committed to bringing you the finest fragrances from around the world"
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border transition-all duration-300 hover:shadow-md">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("Authentic Fragrances")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "All our perfumes are 100% authentic and sourced directly from renowned perfumers"
                )}
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border transition-all duration-300 hover:shadow-md">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("Global Selection")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "Discover rare and exclusive fragrances from the world's most prestigious perfume houses"
                )}
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border transition-all duration-300 hover:shadow-md">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("Luxury Experience")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "Premium packaging and fast delivery to ensure your fragrance arrives in perfect condition"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
            {t("Join Our Fragrance Journey")}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t(
              "Subscribe to receive exclusive offers, new arrivals, and fragrance tips"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t("Your email address")}
              className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder:text-muted-foreground"
            />
            <Button className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors duration-300">
              {t("Subscribe")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
