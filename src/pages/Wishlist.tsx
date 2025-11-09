import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { getWishlist, removeFromWishlist } from "@/lib/database";
import { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    image_url?: string;
    category: string;
    stock_quantity: number;
    is_active: boolean;
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getWishlist(user.id);
      setWishlistItems(data as unknown as WishlistItem[]);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      toast.error(t("Failed to load wishlist"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await removeFromWishlist(user.id, productId);
      setWishlistItems((items) =>
        items.filter((item) => item.product_id !== productId)
      );
      toast.success(t("Removed from wishlist"));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error(t("Failed to remove from wishlist"));
    }
  };

  const handleAddToCart = (product: WishlistItem["products"]) => {
    // Convert wishlist product to full Product type
    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image_url || product.image,
      image_url: product.image_url || product.image,
      category: product.category as "men" | "women" | "unisex",
      description: "",
      notes: [],
      size: "100ml",
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
    };
    addToCart(fullProduct);
    toast.success(t("Added to cart"));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t("Please Sign In")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("You need to be signed in to view your wishlist.")}
            </p>
            <Link to="/">
              <Button>{t("Back to Home")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="aspect-square bg-muted rounded mb-3"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <SEO
        title={`${t("My Wishlist")} - ANAS FRAGRANCES`}
        description={t("View your saved favorite perfumes and fragrances.")}
        keywords="wishlist, favorites, saved items, perfumes"
      />

      <div className="container mx-auto">
        <div className="flex justify-center items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">{t("My Wishlist")}</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("Your wishlist is empty")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t(
                  "Save your favorite perfumes to your wishlist to easily find them later."
                )}
              </p>
              <Link to="/shop">
                <Button>{t("Start Shopping")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-md transition-shadow h-full"
              >
                <CardHeader className="pb-2 p-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {t(item.products.category)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-1"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <Link to={`/product/${item.products.id}`}>
                    <div className="aspect-square mb-3 overflow-hidden rounded">
                      <img
                        src={
                          item.products.image_url?.startsWith("http")
                            ? item.products.image_url
                            : item.products.image?.startsWith("http")
                            ? item.products.image
                            : "/placeholder.svg"
                        }
                        alt={item.products.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </Link>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">
                      {item.products.brand}
                    </p>
                    <Link to={`/product/${item.products.id}`}>
                      <h3 className="font-semibold text-sm hover:text-accent transition-colors line-clamp-2">
                        {item.products.name}
                      </h3>
                    </Link>
                    <p className="text-base font-bold">
                      {formatCurrency(item.products.price, "MAD")}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        className="flex-1 text-xs py-1 h-8"
                        onClick={() => handleAddToCart(item.products)}
                        disabled={item.products.stock_quantity === 0}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        {t("Cart")}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleRemoveFromWishlist(item.products.id)
                        }
                        className="h-8 w-8"
                      >
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
