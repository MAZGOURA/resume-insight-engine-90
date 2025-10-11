import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="font-serif text-3xl font-bold">{t("cart.empty")}</h1>
            <p className="text-muted-foreground">{t("cart.discover")}</p>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                {t("cart.shop")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
          {t("cart.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="shadow-lg border-border/20 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg border border-border/20"
                    />

                    <div className="flex-1 space-y-2">
                      <h3 className="font-serif text-xl font-semibold">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.category}
                      </p>
                      <p className="text-lg font-bold text-indigo-400">
                        ${item.price}
                      </p>
                    </div>

                    <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 sm:gap-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                      <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 rounded-full"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 sm:w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-20 sm:top-24 border-border/20">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  {t("cart.summary")}
                </h2>

                <div className="space-y-2 sm:space-y-3 py-3 sm:py-4 border-y border-border">
                  <div className="flex justify-between text-muted-foreground text-sm sm:text-base">
                    <span>{t("cart.subtotal")}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm sm:text-base">
                    <span>{t("cart.shipping")}</span>
                    <span>{t("cart.free")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm sm:text-base">
                    <span>{t("cart.tax")}</span>
                    <span>${(total * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg sm:text-xl font-bold">
                  <span>{t("cart.total")}</span>
                  <span className="text-indigo-400">
                    ${(total + total * 0.08).toFixed(2)}
                  </span>
                </div>

                <Link to="/checkout">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base py-2 sm:py-3">
                    <Droplets className="h-4 w-4 mr-2" />
                    {t("cart.checkout")}
                  </Button>
                </Link>

                <Link to="/products">
                  <Button
                    variant="outline"
                    className="w-full border-border/20 text-sm sm:text-base py-2 sm:py-3"
                  >
                    {t("cart.continue")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
