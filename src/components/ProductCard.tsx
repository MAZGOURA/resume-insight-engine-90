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
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(
      t("{{productName}} added to cart", { productName: product.name })
    );
  };

  // Calculate discount percentage if compare_price exists
  const discountPercentage =
    product.compare_price && product.compare_price > product.price
      ? Math.round(
          ((product.compare_price - product.price) / product.compare_price) *
            100
        )
      : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full flex flex-col"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full border-0 shadow-md flex flex-col rounded-xl">
        <div className="relative">
          <Link
            to={`/product/${product.id}`}
            className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-t-xl block"
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
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </Link>
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <WishlistButton productId={product.id} size="sm" />
          </div>
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-t-xl">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {t("Out of Stock")}
              </Badge>
            </div>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="text-xs px-2 py-1">
                {t("Low Stock")}
              </Badge>
            </div>
          )}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="text-xs px-2 py-1">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">
                {product.brand}
              </p>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {product.category}
              </Badge>
            </div>
            <Link
              to={`/product/${product.id}`}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded block"
            >
              <h3 className="font-semibold text-base hover:text-primary transition-colors line-clamp-2 mb-3">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mb-3 mt-auto">
              <p className="text-xl font-bold text-primary">
                {formatCurrency(product.price, "MAD")}
              </p>
              {product.compare_price &&
                product.compare_price > product.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compare_price, "MAD")}
                  </p>
                )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleAddToCart}
              className="w-full py-3 text-base rounded-lg bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-accent focus:ring-offset-2"
              variant="default"
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_quantity === 0
                ? t("Out of Stock")
                : t("Add to Cart")}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
};
