import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { WishlistButton } from "./WishlistButton";
import { CompareButton } from "./CompareButton";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trackProductView, trackAddToCart } from "@/lib/analytics";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Track product view on mount
  useEffect(() => {
    trackProductView(product.id);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product);
    trackAddToCart(product.id, 1);
    toast.success(
      t("{{productName}} added to cart", { productName: product.name })
    );
  };

  // Calculate discount percentage if compare_price exists and show_compare_price is enabled
  const discountPercentage =
    product.compare_price && 
    product.compare_price > product.price &&
    product.show_compare_price !== false
      ? Math.round(
          ((product.compare_price - product.price) / product.compare_price) *
            100
        )
      : 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full flex flex-col"
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group h-full border-0 shadow-md flex flex-col rounded-lg hover:border-primary/20 border border-transparent">
        <div className="relative">
          <Link
            to={`/product/${product.id}`}
            className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-t-lg block"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              {!imageLoaded && (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
              <motion.img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg"; // Fallback image
                  setImageLoaded(true);
                }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </Link>
          {/* Removed top-right wishlist to avoid duplication */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-t-lg">
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {t("Out of Stock")}
              </Badge>
            </div>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="destructive"
                className="text-[0.6rem] px-1.5 py-0.5"
              >
                Stock faible
              </Badge>
            </div>
          )}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-14">
              <Badge
                variant="destructive"
                className="text-[0.6rem] px-1.5 py-0.5"
              >
                -{discountPercentage}%
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <CardContent className="p-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-1.5">
              <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wide truncate">
                {product.brand}
              </p>
              <Badge
                variant="secondary"
                className="text-[0.65rem] px-1.5 py-0.5"
              >
                {product.category}
              </Badge>
            </div>
            <Link
              to={`/product/${product.id}`}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded block"
            >
              <h3 className="font-semibold text-xs hover:text-primary transition-colors line-clamp-2 mb-1.5">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 mb-2 mt-auto">
              <p className="text-base font-bold text-primary">
                {formatCurrency(product.price, "MAD")}
              </p>
              {product.compare_price &&
                product.compare_price > product.price &&
                product.show_compare_price !== false && (
                  <p className="text-[0.65rem] text-muted-foreground line-through">
                    {formatCurrency(product.compare_price, "MAD")}
                  </p>
                )}
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex flex-col gap-2">
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <Button
                onClick={handleAddToCart}
                className="w-full py-1.5 text-xs rounded-md bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow focus:ring-2 focus:ring-accent focus:ring-offset-1"
                variant="default"
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                {product.stock_quantity === 0
                  ? t("Out of Stock")
                  : t("Add to Cart")}
              </Button>
            </motion.div>
            <div className="flex gap-2 w-full">
              <WishlistButton productId={product.id} />
              <CompareButton product={product} variant="outline" size="sm" />
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
};
