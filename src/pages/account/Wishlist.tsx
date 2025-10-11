import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingCart, Star, Droplets, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { productService } from "@/integrations/supabase/services/productService";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image_url: string;
    notes: string[];
    size: string;
    rating: number;
  };
}

const AccountWishlist = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select(
            `
            id,
            product_id,
            created_at,
            products (
              id,
              name,
              price,
              category,
              description,
              image_url,
              notes,
              size,
              rating
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setWishlistItems(data || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchWishlist();
    }
  }, [user, authLoading]);

  const handleAddToCart = (product: WishlistItem["products"]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image_url,
      notes: product.notes,
      size: product.size,
      rating: product.rating,
    });
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;

      // Update local state
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));

      // Show success message
      // You might want to add a toast notification here
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item from wishlist");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to access your wishlist.</p>
            <Button className="mt-4">Sign In</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {t("header.wishlist")}
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {t("mall.products")} {t("header.inWishlist")}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">
                {t("cart.empty")}
              </h3>
              <p className="text-muted-foreground mb-6">{t("cart.discover")}</p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                {t("cart.shop")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">
                      {item.products.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-900/10 to-purple-900/10">
                    {item.products.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Droplets className="h-12 w-12 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.products.rating || 4)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.products.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.products.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">
                      {item.products.price.toFixed(2)} MAD
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item.products)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {t("mall.addCart")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountWishlist;
