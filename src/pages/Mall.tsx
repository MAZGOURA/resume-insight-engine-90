import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Droplets, Filter, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productService } from "@/integrations/supabase/services/productService";
import type { Product } from "@/types/product";

const Mall = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.category || "")
      );
    }

    // Sort
    switch (sortBy) {
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
      case "topRated":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured sorting (default)
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, priceRange, selectedCategories, sortBy]);

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ) as string[];

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceRangeChange = (value: number[]) => {
    if (value.length === 2) {
      setPriceRange([value[0], value[1]] as [number, number]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSortBy("featured");
  };

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
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-indigo-500 hover:bg-indigo-600">
            {t("mall.featured")}
          </Badge>
        )}
        <Button
          className="absolute top-2 right-2 h-7 rounded-full bg-indigo-500 hover:bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs px-2"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          {t("mall.addCart")}
        </Button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
            {product.category || "Fragrance"}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-1">
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Droplets className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-300 font-medium text-sm">
                {t("mall.collection")}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
              {t("mall.title")}
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              {t("mall.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Hidden on mobile, shown in sheet */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/20 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold">
                  {t("mall.filter")}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("mall.clear")}
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 block">
                  {t("mall.search")}
                </Label>
                <Input
                  id="search"
                  placeholder={t("mall.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-serif text-lg font-bold mb-3">
                  {t("mall.categories")}
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-serif text-lg font-bold mb-3">
                  {t("mall.price")}
                </h3>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={handlePriceRangeChange}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden mb-6 w-full border-indigo-400 text-indigo-400 hover:bg-indigo-500/10"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("mall.filter")}
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"}>
              <SheetHeader>
                <SheetTitle>{t("mall.filter")}</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {/* Search */}
                <div className="mb-6">
                  <Label htmlFor="mobile-search" className="mb-2 block">
                    {t("mall.search")}
                  </Label>
                  <Input
                    id="mobile-search"
                    placeholder={t("mall.search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold mb-3">
                    {t("mall.categories")}
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={`mobile-category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label
                          htmlFor={`mobile-category-${category}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold mb-3">
                    {t("mall.price")}
                  </h3>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$0</span>
                      <span>$500</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("mall.clear")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  {t("mall.products")}
                </h2>
                <p className="text-muted-foreground">
                  {filteredProducts.length} {t("mall.products")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-muted-foreground">
                  {t("mall.sortBy")}
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">
                      {t("mall.featured")}
                    </SelectItem>
                    <SelectItem value="priceLow">
                      {t("mall.priceLow")}
                    </SelectItem>
                    <SelectItem value="priceHigh">
                      {t("mall.priceHigh")}
                    </SelectItem>
                    <SelectItem value="topRated">
                      {t("mall.topRated")}
                    </SelectItem>
                    <SelectItem value="name">{t("mall.name")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-border/20 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-muted" />
                    <div className="p-4">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Droplets className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">
                  {t("mall.noProducts")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("mall.tryDifferentFilters")}
                </p>
                <Button onClick={clearFilters}>
                  {t("mall.clearAllFilters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mall;
