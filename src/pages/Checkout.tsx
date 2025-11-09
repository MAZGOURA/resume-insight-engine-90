import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { getShippingCities, type ShippingCity } from "@/lib/shipping";

const Checkout = () => {
  const { t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCities, setShippingCities] = useState<ShippingCity[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load shipping cities
  useEffect(() => {
    const loadShippingCities = async () => {
      const cities = await getShippingCities();
      setShippingCities(cities);
    };

    loadShippingCities();
  }, []);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user && !profileLoaded) {
        // Load profile data regardless of shipping cities being loaded
        const profileData = {
          name: user.user_metadata?.first_name
            ? `${user.user_metadata.first_name} ${
                user.user_metadata.last_name || ""
              }`
            : "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          address: user.user_metadata?.address || "",
          city: user.user_metadata?.city || "",
          zipCode: user.user_metadata?.zip_code || "",
        };

        setShippingInfo(profileData);
        setProfileLoaded(true);
      }
    };

    loadProfile();
  }, [user, profileLoaded]);

  // Update shipping cost when shipping cities are loaded
  useEffect(() => {
    if (user && profileLoaded && shippingCities.length > 0) {
      // Check if we have a city in shippingInfo or user profile
      const cityId = shippingInfo.city || user.user_metadata?.city;

      if (cityId) {
        const selectedCity = shippingCities.find((city) => city.id === cityId);
        if (selectedCity) {
          // Update shipping info with the city ID if it's not already set
          if (!shippingInfo.city) {
            setShippingInfo((prev) => ({ ...prev, city: selectedCity.id }));
          }
          setShippingCost(selectedCity.shipping_price);
        }
      }
    }
  }, [shippingCities, user, profileLoaded, shippingInfo.city]);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (value: string) => {
    const selectedCity = shippingCities.find((city) => city.id === value);
    if (selectedCity) {
      setShippingCost(selectedCity.shipping_price);
      setShippingInfo((prev) => ({ ...prev, city: selectedCity.id }));
    } else {
      setShippingCost(0);
      setShippingInfo((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to complete your order");
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder(user.id, items, total + shippingCost, {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        zip_code: shippingInfo.zipCode,
      });

      // Send order notification emails
      try {
        await supabase.functions.invoke("send-order-notification", {
          body: {
            orderNumber: order.id.slice(-8),
            customerEmail: shippingInfo.email,
            customerName: shippingInfo.name,
            totalAmount: total + shippingCost,
            items: items.map(({ product, quantity }) => ({
              name: product.name,
              quantity: quantity,
              price: product.price,
            })),
            shippingAddress: {
              name: shippingInfo.name,
              address: shippingInfo.address,
              city: shippingInfo.city,
              zip_code: shippingInfo.zipCode,
              phone: shippingInfo.phone,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification emails:", emailError);
        // Don't fail the order if email fails
      }

      clearCart();
      toast.success(t("Order placed successfully!"));
      navigate(`/orders`);
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(t("Failed to place order. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to Cart")}
        </Button>

        <h1 className="text-4xl font-bold mb-8 luxury-text">
          {t("Secure Checkout")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-border shadow-lg">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl">
                  {t("Shipping Information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">
                        {t("Full Name")}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        required
                        className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">
                        {t("CheckoutEmail")}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                        className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-base">
                        {t("CheckoutPhone")}
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-base">
                        {t("City")}
                      </Label>
                      <Select
                        value={shippingInfo.city}
                        onValueChange={handleCityChange}
                      >
                        <SelectTrigger className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingCities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.city_name} -{" "}
                              {formatCurrency(city.shipping_price, "MAD")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base">
                      {t("CheckoutAddress")}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                      placeholder="123 Fragrance Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-base">
                        {t("Zip Code")}
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        required
                        className="py-3 px-4 text-base rounded-xl border-border focus:ring-2 focus:ring-accent/20"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full py-6 text-base rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("Processing Order...")}
                      </>
                    ) : (
                      `${t("Place Order")} - ${formatCurrency(
                        total + shippingCost,
                        "MAD"
                      )}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border shadow-lg sticky top-24">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl">{t("Order Summary")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex justify-between py-4 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="aspect-square w-16 h-16 overflow-hidden rounded-lg">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t("Qty")}: {quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium self-start">
                          {formatCurrency(product.price * quantity, "MAD")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("Subtotal")}
                      </span>
                      <span>{formatCurrency(total, "MAD")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("Shipping")}
                      </span>
                      <span>{formatCurrency(shippingCost, "MAD")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>{t("Total")}</span>
                      <span>{formatCurrency(total + shippingCost, "MAD")}</span>
                    </div>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 mt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-accent" />
                      Secure Payment
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment information is encrypted and secure. We
                      accept all major credit cards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
