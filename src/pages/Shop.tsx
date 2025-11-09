import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";
import { trackSearch, trackCategoryFilter } from "@/components/Analytics";
import {
  searchProducts,
  getPriceRange,
  getCategories,
  getCollections,
} from "@/lib/database";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SkeletonProductCard } from "@/components/SkeletonProductCard";
import { SkeletonFilterSidebar } from "@/components/SkeletonFilterSidebar";

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

const Shop = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [minPriceError, setMinPriceError] = useState("");
  const [maxPriceError, setMaxPriceError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const collection = searchParams.get("collection") || "all";
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    const min = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : 0;
    const max = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : 500;

    setSearchTerm(search);
    setCategoryFilter(category);
    setCollectionFilter(collection);
    setSortBy(sort);
    setSortOrder(order);
    setMinPrice(min);
    setMaxPrice(max);
  }, []);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
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

    loadCategories();
  }, []);

  // Load collections from database
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setCollectionsLoading(true);
        const data = await getCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to load collections:", error);
        // Fallback to static collections if database fetch fails
        setCollections([
          {
            id: "bestsellers",
            name: t("Best Sellers"),
            slug: "bestsellers",
            description: null,
            image: null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "new-arrivals",
            name: t("New Arrivals"),
            slug: "new-arrivals",
            description: null,
            image: null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "limited-edition",
            name: t("Limited Edition"),
            slug: "limited-edition",
            description: null,
            image: null,
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

    loadCollections();
  }, []);

  // Load actual price range from database
  useEffect(() => {
    const loadPriceRange = async () => {
      try {
        const range = await getPriceRange();
        setPriceRange({
          min: Math.floor(range.minPrice),
          max: Math.ceil(range.maxPrice),
        });
        if (maxPrice === 500) {
          setMaxPrice(Math.ceil(range.maxPrice));
        }
      } catch (error) {
        console.error("Failed to load price range:", error);
      }
    };

    loadPriceRange();
  }, []);

  // Load products after price range is initialized
  useEffect(() => {
    if (priceRange.max !== 500) {
      loadProducts();
    }
  }, [priceRange]);

  // Load products on initial mount if not already loaded
  useEffect(() => {
    if (products.length === 0 && !loading) {
      loadProducts();
    }
  }, []);

  // Validate price inputs
  useEffect(() => {
    if (minPrice > 0 && minPrice < priceRange.min) {
      setMinPriceError(
        `Minimum price cannot be less than ${formatCurrency(
          priceRange.min,
          "MAD"
        )}`
      );
    } else if (minPrice > priceRange.max) {
      setMinPriceError(
        `Minimum price cannot be greater than ${formatCurrency(
          priceRange.max,
          "MAD"
        )}`
      );
    } else {
      setMinPriceError("");
    }

    if (maxPrice > 0 && maxPrice > priceRange.max) {
      setMaxPriceError(
        `Maximum price cannot be greater than ${formatCurrency(
          priceRange.max,
          "MAD"
        )}`
      );
    } else if (maxPrice < priceRange.min) {
      setMaxPriceError(
        `Maximum price cannot be less than ${formatCurrency(
          priceRange.min,
          "MAD"
        )}`
      );
    } else {
      setMaxPriceError("");
    }
  }, [minPrice, maxPrice, priceRange]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (categoryFilter && categoryFilter !== "all")
      params.set("category", categoryFilter);
    if (collectionFilter && collectionFilter !== "all")
      params.set("collection", collectionFilter);
    if (sortBy) params.set("sort", sortBy);
    if (sortOrder) params.set("order", sortOrder);
    if (minPrice > 0) params.set("minPrice", minPrice.toString());
    if (maxPrice < priceRange.max || maxPrice > 0)
      params.set("maxPrice", maxPrice.toString());

    setSearchParams(params);
  }, [
    searchTerm,
    categoryFilter,
    collectionFilter,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    priceRange.max,
  ]);

  // Load products when filters change
  useEffect(() => {
    // Only load products if price range is initialized
    if (priceRange.max !== 500 || maxPrice !== 500) {
      loadProducts();
    }
  }, [
    searchTerm,
    categoryFilter,
    collectionFilter,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    priceRange,
  ]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log("Loading products with filters:", {
        search: searchTerm || undefined,
        category:
          categoryFilter && categoryFilter !== "all"
            ? categoryFilter
            : undefined,
        collection:
          collectionFilter && collectionFilter !== "all"
            ? collectionFilter
            : undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice:
          maxPrice > 0 && maxPrice < priceRange.max ? maxPrice : undefined,
        sortBy:
          (sortBy as "price" | "rating" | "name" | "created_at") || undefined,
        sortOrder: (sortOrder as "asc" | "desc") || undefined,
      });

      let data = await searchProducts({
        search: searchTerm || undefined,
        category:
          categoryFilter && categoryFilter !== "all"
            ? categoryFilter
            : undefined,
        collection:
          collectionFilter && collectionFilter !== "all"
            ? collectionFilter
            : undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice:
          maxPrice > 0 && maxPrice < priceRange.max ? maxPrice : undefined,
        sortBy:
          (sortBy as "price" | "rating" | "name" | "created_at") || undefined,
        sortOrder: (sortOrder as "asc" | "desc") || undefined,
      });

      // If no products found with filters, try loading all products
      if (
        data.length === 0 &&
        !searchTerm &&
        categoryFilter === "all" &&
        collectionFilter === "all" &&
        minPrice === 0 &&
        maxPrice >= priceRange.max
      ) {
        console.log("No products found with filters, loading all products");
        // Reset filters to ensure we get all products
        data = await searchProducts({});
      }

      console.log("Loaded products:", data.length);
      setProducts(data as Product[]);

      if (categoryFilter && categoryFilter !== "all") {
        trackCategoryFilter(categoryFilter);
      }
      if (searchTerm) {
        trackSearch(searchTerm);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
      // Don't show error toast for empty results, only for actual errors
      if (error && (error as any).message) {
        console.error("Product load error:", (error as any).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger product reload with new search term
    loadProducts();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setCollectionFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setMinPrice(0);
    setMaxPrice(priceRange.max);
  };

  const hasActiveFilters =
    searchTerm ||
    (categoryFilter && categoryFilter !== "all") ||
    (collectionFilter && collectionFilter !== "all") ||
    minPrice > 0 ||
    maxPrice < priceRange.max;

  const pageTitle =
    categoryFilter && categoryFilter !== "all"
      ? `${
          categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
        } Fragrances`
      : "All Perfumes";

  // New state for mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen py-8 px-4">
      <SEO
        title={`${pageTitle} - ${t("Essence Express")}`}
        description={t(
          "Browse our premium collection of luxury perfumes and fragrances. Find the perfect scent for any occasion."
        )}
        keywords="parfums de luxe, fragrances, boutique de parfums, senteurs de créateurs, eau de cologne pour hommes, parfum pour femmes"
      />

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {products.length}{" "}
              {products.length === 1 ? t("product") : t("products")}{" "}
              {t("found")}
            </p>
          </div>
          {/* Mobile filter toggle button */}
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-4 w-4" />
            {t("Filters")}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Filters Sidebar - Hidden on mobile by default */}
          <div
            className={`${
              showMobileFilters ? "block" : "hidden"
            } md:block w-full lg:w-80 flex-shrink-0`}
          >
            {categoriesLoading || collectionsLoading ? (
              <SkeletonFilterSidebar />
            ) : (
              <div className="bg-card rounded-xl shadow-lg p-5 sm:p-6 sticky top-24 border border-border max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-5 sm:mb-6 pb-4 border-b border-border">
                  <h2 className="text-xl font-semibold flex items-center gap-2 luxury-text">
                    <Filter className="h-5 w-5 text-primary" />
                    {t("Filters")}
                  </h2>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      {t("Clear All")}
                    </Button>
                  )}
                  {/* Close button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden hover:bg-accent"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium mb-3 block"
                  >
                    {t("Search")}
                  </Label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder={t("Search products...")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-12 py-3 text-base rounded-xl border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                      {searchTerm && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-full px-2 hover:bg-accent/10"
                          onClick={() => setSearchTerm("")}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-3 py-3 text-base rounded-xl bg-primary hover:bg-primary/90 transition-colors duration-300"
                    >
                      {t("Search")}
                    </Button>
                  </form>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {t("Category")}
                  </Label>
                  {categoriesLoading ? (
                    <div className="h-12 bg-muted rounded-xl animate-pulse"></div>
                  ) : (
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="text-base py-3 rounded-xl border-border focus:ring-2 focus:ring-accent/20">
                        <SelectValue placeholder={t("Select category")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("All Categories")}
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Collection Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {t("Collection")}
                  </Label>
                  {collectionsLoading ? (
                    <div className="h-12 bg-muted rounded-xl animate-pulse"></div>
                  ) : (
                    <Select
                      value={collectionFilter}
                      onValueChange={setCollectionFilter}
                    >
                      <SelectTrigger className="text-base py-3 rounded-xl border-border focus:ring-2 focus:ring-accent/20">
                        <SelectValue placeholder={t("Select collection")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("All Collections")}
                        </SelectItem>
                        {collections.map((collection) => (
                          <SelectItem
                            key={collection.id}
                            value={collection.slug}
                          >
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {t("Price Range")}
                  </Label>
                  <div className="space-y-4">
                    <div className="bg-secondary rounded-xl p-4">
                      <div className="flex justify-between text-base mb-4 font-medium">
                        <span>{formatCurrency(minPrice, "MAD")}</span>
                        <span>{formatCurrency(maxPrice, "MAD")}</span>
                      </div>
                      {/* Price range inputs */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-2 block">
                              {t("Min")}
                            </Label>
                            <Input
                              type="number"
                              placeholder={t("Min")}
                              value={minPrice || ""}
                              onChange={(e) =>
                                setMinPrice(
                                  e.target.value ? Number(e.target.value) : 0
                                )
                              }
                              className="text-base py-3 rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                              min="0"
                              max={maxPrice}
                            />
                          </div>
                          <div className="flex items-center h-full pt-6">
                            <span className="text-muted-foreground">-</span>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-2 block">
                              {t("Max")}
                            </Label>
                            <Input
                              type="number"
                              placeholder={t("Max")}
                              value={maxPrice || ""}
                              onChange={(e) =>
                                setMaxPrice(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : priceRange.max
                                )
                              }
                              className="text-base py-3 rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                              min={minPrice}
                              max={priceRange.max}
                            />
                          </div>
                        </div>
                        {/* Apply button for price filter */}
                        <Button
                          onClick={loadProducts}
                          className="w-full py-3 text-base rounded-xl bg-primary hover:bg-primary/90 transition-colors duration-300"
                        >
                          {t("Apply Filters")}
                        </Button>
                      </div>
                      {minPriceError && (
                        <p className="text-xs text-red-500 mt-3">
                          {minPriceError}
                        </p>
                      )}
                      {maxPriceError && (
                        <p className="text-xs text-red-500 mt-3">
                          {maxPriceError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card rounded-xl p-5 shadow-sm border border-border">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {t("Sort by:")}
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] py-2 rounded-lg border-border focus:ring-2 focus:ring-accent/20">
                    <SelectValue placeholder={t("Sort by")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">{t("Newest")}</SelectItem>
                    <SelectItem value="price">{t("Price")}</SelectItem>
                    <SelectItem value="name">{t("Name")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[90px] py-2 rounded-lg border-border focus:ring-2 focus:ring-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">{t("Desc")}</SelectItem>
                    <SelectItem value="asc">{t("Asc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {products.length}{" "}
                {products.length === 1 ? t("item") : t("items")}
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="transition-all duration-300 hover:-translate-y-1 h-full flex"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    className="px-6 py-3 text-base rounded-xl border-border hover:bg-accent/10"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    {t("Back to Top")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
                <div className="text-muted-foreground mb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Filter className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3 luxury-text">
                    {t("No products found")}
                  </h3>
                  <p className="text-base max-w-md mx-auto px-4 text-muted-foreground">
                    {t("Try adjusting your filters or search terms in shop")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 max-w-md mx-auto">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="px-6 py-3 text-base rounded-xl border-border hover:bg-accent/10"
                  >
                    {t("Clear Filters")}
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setCollectionFilter("all");
                      setMinPrice(0);
                      setMaxPrice(priceRange.max);
                    }}
                    className="px-6 py-3 text-base rounded-xl bg-primary hover:bg-primary/90 transition-colors duration-300"
                  >
                    {t("Reset All Filters")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
