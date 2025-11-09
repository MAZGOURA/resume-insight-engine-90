import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={0}
            aria-label={t("Close cart")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
          />

          {/* Cart Panel - New Design */}
          <motion.div
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
            style={{ top: 0, right: 0, maxWidth: "28rem", height: "100vh" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-labelledby="cart-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-background to-muted/30">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h2 id="cart-title" className="text-xl font-bold luxury-text">
                  {t("Your Cart")}{" "}
                  <span className="text-primary">({items.length})</span>
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={t("Close cart")}
                className="rounded-full hover:bg-accent h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 bg-muted/5">
              {items.length === 0 ? (
                <motion.div
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative mb-6">
                    <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-muted-foreground/10">
                        0
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 luxury-text">
                    {t("Empty Cart")}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    {t("Your cart is waiting for some luxury fragrances")}
                  </p>
                  <Button
                    onClick={onClose}
                    size="lg"
                    className="px-8 py-6 text-base rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {t("Discover Fragrances")}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AnimatePresence>
                    {items.map(({ product, quantity }) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-4">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0 aspect-square w-20 h-20 overflow-hidden rounded-lg bg-muted">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    "https://placehold.co/200x200/efefef/999999?text=Perfume";
                                }}
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-base truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                                    {product.brand}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {product.size}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFromCart(product.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive rounded-full h-8 w-8 ml-2 flex-shrink-0"
                                  aria-label={t(
                                    "Remove {{productName}} from cart",
                                    { productName: product.name }
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      updateQuantity(
                                        product.id,
                                        Math.max(1, quantity - 1)
                                      )
                                    }
                                    className="rounded-full h-7 w-7 hover:bg-primary hover:text-primary-foreground"
                                    aria-label={t(
                                      "Decrease quantity of {{productName}}",
                                      { productName: product.name }
                                    )}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      updateQuantity(product.id, quantity + 1)
                                    }
                                    className="rounded-full h-7 w-7 hover:bg-primary hover:text-primary-foreground"
                                    aria-label={t(
                                      "Increase quantity of {{productName}}",
                                      { productName: product.name }
                                    )}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Price */}
                                <p className="text-base font-bold text-primary">
                                  {formatCurrency(
                                    product.price * quantity,
                                    "MAD"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer with Order Summary */}
            {items.length > 0 && (
              <motion.div
                className="border-t border-border p-5 bg-background"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Order Summary */}
                <div className="space-y-3 mb-5 bg-muted/30 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Subtotal")}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(total, "MAD")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Shipping")}
                    </span>
                    <span className="font-medium text-green-600">
                      {t("Free")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Tax")}</span>
                    <span className="font-medium">
                      {t("Calculated at checkout")}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("Total")}</span>
                      <span className="text-primary">
                        {formatCurrency(total, "MAD")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/checkout" onClick={onClose} className="block">
                    <Button
                      size="lg"
                      className="w-full py-6 text-base rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {t("Proceed to Checkout")}
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className="w-full py-6 text-base rounded-full border-border hover:bg-accent"
                  >
                    {t("Continue Shopping")}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
