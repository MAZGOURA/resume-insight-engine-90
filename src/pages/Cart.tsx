import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, LogIn, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <LogIn className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Connexion Requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour accéder à votre panier
          </p>
          <Link to="/">
            <Button size="lg">Se Connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 luxury-text">
          Your Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Discover our luxury fragrances and add them to your cart
            </p>
            <Link to="/shop">
              <Button
                size="lg"
                className="px-8 py-6 text-base rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {items.map(({ product, quantity }) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="aspect-square w-24 h-32 overflow-hidden rounded-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                                {product.brand}
                              </p>
                              <h3 className="font-semibold text-xl mb-1">
                                {product.name}
                              </h3>
                              <p className="text-muted-foreground">
                                {product.size}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(product.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    Math.max(1, quantity - 1)
                                  )
                                }
                                className="rounded-full border-border hover:bg-accent"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-semibold text-lg">
                                {quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(product.id, quantity + 1)
                                }
                                className="rounded-full border-border hover:bg-accent"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xl font-bold">
                              {formatCurrency(product.price * quantity, "MAD")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-border shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 luxury-text">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(total, "MAD")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(total, "MAD")}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/checkout" className="block mb-4">
                    <Button
                      size="lg"
                      className="w-full py-6 text-base rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link to="/shop" className="block">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full py-6 text-base rounded-xl border-border hover:bg-accent"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Product Recommendations */}
        {items.length > 0 && user && (
          <ProductRecommendations 
            userId={user.id}
            title={t("You might also like")}
            limit={4}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;
