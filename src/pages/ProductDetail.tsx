import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { productService } from "@/integrations/supabase/services/productService";
import { useTranslation } from "react-i18next";
import { Droplets, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import type { Product } from "@/types/product";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const productData = await productService.getProductById(id);
        setProduct(productData);

        // Set default size if available
        if (productData.size) {
          setSelectedSize(productData.size);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Parse sizes from product data
  const parseSizes = () => {
    if (!product) return [];

    // If size contains multiple sizes separated by commas
    if (product.size && product.size.includes(",")) {
      return product.size.split(",").map((s) => s.trim());
    }

    // If size is a single value
    if (product.size) {
      return [product.size];
    }

    // Default sizes
    return ["100ml", "200ml"];
  };

  const sizes = parseSizes();

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="aspect-square bg-muted rounded-xl mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-muted rounded w-1/4 mb-6"></div>
                <div className="space-y-2 mb-8">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
                <div className="h-12 bg-muted rounded mb-6"></div>
                <div className="h-10 bg-muted rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Droplets className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-2">
              {t("product.notFound")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("product.backToProducts")}
            </p>
            <Button asChild>
              <Link to="/mall">{t("product.backToCollection")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.image ? [product.image] : [];

  // Handle add to cart with selected size and quantity
  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      size: selectedSize,
    };

    // Add multiple items if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-indigo-400 hover:text-indigo-300"
          asChild
        >
          <Link to="/mall">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("product.backToCollection")}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900/10 to-purple-900/10 mb-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Droplets className="h-24 w-24 text-indigo-400" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-indigo-500"
                        : "border-border/20"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {product.category || "Fragrance"}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-indigo-500 hover:bg-indigo-600">
                  {t("mall.featured")}
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4">
              {product.name}
            </h1>
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 4)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating} ({t("product.reviews")})
              </span>
            </div>
            <div className="text-3xl font-bold mb-6">${product.price}</div>
            <p className="text-muted-foreground mb-8">{product.description}</p>

            {product.notes && product.notes.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-xl font-bold mb-3">
                  {t("product.fragranceNotes")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.notes.map((note, index) => (
                    <Badge key={index} variant="outline">
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-8">
              {sizes.length > 0 && (
                <div>
                  <label
                    htmlFor="size"
                    className="block text-sm font-medium mb-1"
                  >
                    {t("product.size")}
                  </label>
                  <select
                    id="size"
                    className="bg-background border border-border/20 rounded-lg px-3 py-2"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {sizes.map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium mb-1"
                >
                  {t("product.quantity")}
                </label>
                <select
                  id="quantity"
                  className="bg-background border border-border/20 rounded-lg px-3 py-2"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("product.addToCart")}
              </Button>
              <Button
                variant="outline"
                className="border-indigo-400 text-indigo-400 hover:bg-indigo-500/10"
              >
                {t("product.addToWishlist")}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold mb-6">
            {t("product.youMayAlsoLike")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border/20 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="aspect-square bg-gradient-to-br from-indigo-900/10 to-purple-900/10 flex items-center justify-center">
                  <Droplets className="h-12 w-12 text-indigo-400" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
                      {product.category || "Fragrance"}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    {t("product.relatedProduct")} {i + 1}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      $
                      {(product.price * (0.8 + Math.random() * 0.4)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
