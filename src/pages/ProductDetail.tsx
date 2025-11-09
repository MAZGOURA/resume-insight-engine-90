import { useParams, Link } from "react-router-dom";
import { getProductById, getProductRating } from "@/lib/database";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { SocialShare } from "@/components/SocialShare";
import { ProductReviews } from "@/components/ProductReviews";
import { WishlistButton } from "@/components/WishlistButton";
import { trackProductView, trackAddToCart } from "@/components/Analytics";
import { ShoppingCart, ArrowLeft, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { SkeletonProductDetail } from "@/components/SkeletonProductDetail";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);

      // Load rating
      const ratingData = await getProductRating(id);
      setRating(ratingData);

      // Track view
      if (data) {
        trackProductView(data.id, data.name, data.category, data.price);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      trackAddToCart(product.id, product.name, product.category, product.price);
      toast.success(`${product.name} added to cart`);
    }
  };

  if (loading) {
    return <SkeletonProductDetail />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or is no longer
            available.
          </p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <SEO
        title={`${product.name} - ANAS FRAGRANCES`}
        description={product.description}
        keywords={`${product.brand}, ${product.name}, ${product.category} perfume, luxury fragrance`}
      />

      <div className="container mx-auto max-w-6xl">
        <Link
          to="/shop"
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images Section */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden rounded-2xl shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Additional Product Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                  Brand
                </h3>
                <p className="font-medium">{product.brand}</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                  Size
                </h3>
                <p className="font-medium">{product.size}</p>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="w-fit px-3 py-1 text-sm uppercase bg-primary text-primary-foreground">
                {product.category}
              </Badge>
              {product.stock_quantity === 0 && (
                <Badge
                  variant="destructive"
                  className="w-fit px-3 py-1 text-sm"
                >
                  Out of Stock
                </Badge>
              )}
              {product.stock_quantity > 0 && product.stock_quantity < 10 && (
                <Badge
                  variant="outline"
                  className="w-fit px-3 py-1 text-sm border-orange-500 text-orange-500"
                >
                  Only {product.stock_quantity} left
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 luxury-text">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {rating.average.toFixed(1)} ({rating.count} reviews)
              </span>
            </div>

            <div className="mb-8">
              <p className="text-3xl font-bold mb-2">
                {formatCurrency(product.price, "MAD")}
              </p>
              {product.compare_price &&
                product.compare_price > product.price && (
                  <div className="flex items-center gap-3">
                    <p className="text-lg text-muted-foreground line-through">
                      {formatCurrency(product.compare_price, "MAD")}
                    </p>
                    <Badge variant="destructive" className="text-sm">
                      Save{" "}
                      {Math.round(
                        ((product.compare_price - product.price) /
                          product.compare_price) *
                          100
                      )}
                      %
                    </Badge>
                  </div>
                )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Fragrance Notes</h2>
              <div className="flex flex-wrap gap-2">
                {product.notes.map((note, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-33 py-1.5 text-sm"
                  >
                    {note}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 py-6 text-base rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <WishlistButton
                productId={product.id}
                size="lg"
                className="px-6 py-6 rounded-xl border-border"
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <ProductReviews productId={product.id} />
        </div>

        {/* Social Sharing */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">Share this fragrance</h2>
          <SocialShare
            url={window.location.href}
            title={product.name}
            description={product.description}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
