import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Droplets, MapPin, CreditCard, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { orderService } from "@/integrations/supabase/services/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Morocco", // Default to Morocco
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Morocco", // Default to Morocco
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Static shipping and tax configurations for Morocco
  const shippingConfigs = [
    {
      min_order_amount: 0,
      max_order_amount: 300,
      rate_type: "fixed",
      rate_value: 50, // 50 MAD
    },
    {
      min_order_amount: 300,
      max_order_amount: Infinity,
      rate_type: "fixed",
      rate_value: 0, // Free shipping for orders over 300 MAD
    },
  ];

  const taxConfigs = [
    {
      min_order_amount: 0,
      max_order_amount: Infinity,
      rate_type: "percentage",
      rate_value: 20, // 20% VAT in Morocco
    },
  ];

  // Calculate shipping fee based on configurations
  const calculateShippingFee = () => {
    const subtotal = total;

    // Find applicable shipping configuration
    const applicableShipping = shippingConfigs.find((config) => {
      const minAmount = config.min_order_amount || 0;
      const maxAmount = config.max_order_amount || Infinity;
      return subtotal >= minAmount && subtotal <= maxAmount;
    });

    if (applicableShipping) {
      if (applicableShipping.rate_type === "fixed") {
        return applicableShipping.rate_value;
      } else {
        return subtotal * (applicableShipping.rate_value / 100);
      }
    }

    // Default to 0 if no configuration found
    return 0;
  };

  // Calculate tax amount based on configurations
  const calculateTaxAmount = () => {
    const subtotal = total;

    // Sum all applicable tax configurations
    let totalTax = 0;

    taxConfigs.forEach((config) => {
      const minAmount = config.min_order_amount || 0;
      const maxAmount = config.max_order_amount || Infinity;

      if (subtotal >= minAmount && subtotal <= maxAmount) {
        if (config.rate_type === "fixed") {
          totalTax += config.rate_value;
        } else {
          totalTax += subtotal * (config.rate_value / 100);
        }
      }
    });

    return totalTax;
  };

  const deliveryFee = calculateShippingFee();
  const taxAmount = calculateTaxAmount();
  const totalAmount = total + deliveryFee + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("shipping.")) {
      const fieldName = name.split(".")[1];
      setShippingAddress({
        ...shippingAddress,
        [fieldName]: value,
      });

      if (sameAsShipping) {
        setBillingAddress({
          ...billingAddress,
          [fieldName]: value,
        });
      }
    } else if (name.startsWith("billing.")) {
      const fieldName = name.split(".")[1];
      setBillingAddress({
        ...billingAddress,
        [fieldName]: value,
      });
    }
  };

  const handleSameAsShippingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      toast({
        title: t("checkout.failedTitle"),
        description: t("checkout.missingFields"),
        variant: "destructive",
      });
      return;
    }

    if (!sameAsShipping) {
      if (
        !billingAddress.firstName ||
        !billingAddress.lastName ||
        !billingAddress.phone ||
        !billingAddress.addressLine1 ||
        !billingAddress.city ||
        !billingAddress.postalCode
      ) {
        toast({
          title: t("checkout.failedTitle"),
          description: t("checkout.missingBillingFields"),
          variant: "destructive",
        });
        return;
      }
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: t("checkout.signInRequired"),
        description: t("checkout.signInMessage"),
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Prepare shipping address data
      const shippingAddressData = {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        phone: shippingAddress.phone,
        address_line1: shippingAddress.addressLine1,
        address_line2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
      };

      // Prepare billing address data
      const billingAddressData = sameAsShipping
        ? shippingAddressData
        : {
            first_name: billingAddress.firstName,
            last_name: billingAddress.lastName,
            phone: billingAddress.phone,
            address_line1: billingAddress.addressLine1,
            address_line2: billingAddress.addressLine2,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          };

      // Create order in Supabase
      const order = await orderService.createOrder({
        user_id: user.id,
        status: "pending",
        payment_status:
          paymentMethod === "cash_on_delivery" ? "pending" : "paid",
        payment_method: paymentMethod,
        currency: "MAD", // Changed to Moroccan Dirham
        subtotal: total,
        tax_amount: taxAmount,
        shipping_amount: deliveryFee,
        discount_amount: 0,
        total_amount: totalAmount,
        shipping_address: shippingAddressData,
        billing_address: billingAddressData,
      });

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        product_snapshot: {
          name: item.name,
          image: item.image,
          category: item.category,
          price: item.price,
          sku: item.sku || "",
        },
      }));

      await orderService.createOrderItems(orderItems);

      // Create payment record
      await orderService.createPayment({
        order_id: order.id,
        payment_method: paymentMethod,
        amount: totalAmount,
        currency: "MAD", // Changed to Moroccan Dirham
        status: paymentMethod === "cash_on_delivery" ? "pending" : "completed",
      });

      toast({
        title: t("checkout.successTitle"),
        description: t("checkout.successMessage"),
      });

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      let errorMessage = t("checkout.failedTitle");

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Try to extract message from object
        const errorObj = error as Record<string, unknown>;
        if (typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        } else if (typeof errorObj.error === "string") {
          errorMessage = errorObj.error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: t("checkout.failedTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8">
          {t("checkout.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                  {t("checkout.shippingInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="shipping.firstName"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.firstName")}
                      </Label>
                      <Input
                        id="shipping.firstName"
                        name="shipping.firstName"
                        required
                        value={shippingAddress.firstName}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="shipping.lastName"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.lastName")}
                      </Label>
                      <Input
                        id="shipping.lastName"
                        name="shipping.lastName"
                        required
                        value={shippingAddress.lastName}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="shipping.phone"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.phone")}
                    </Label>
                    <Input
                      id="shipping.phone"
                      name="shipping.phone"
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="shipping.addressLine1"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.address")}
                    </Label>
                    <Input
                      id="shipping.addressLine1"
                      name="shipping.addressLine1"
                      required
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="shipping.addressLine2"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.address2")}
                    </Label>
                    <Input
                      id="shipping.addressLine2"
                      name="shipping.addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="shipping.city"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.city")}
                      </Label>
                      <Input
                        id="shipping.city"
                        name="shipping.city"
                        required
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="shipping.state"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.state")}
                      </Label>
                      <Input
                        id="shipping.state"
                        name="shipping.state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="shipping.postalCode"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.postalCode")}
                      </Label>
                      <Input
                        id="shipping.postalCode"
                        name="shipping.postalCode"
                        required
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="shipping.country"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.country")}
                      </Label>
                      <Input
                        id="shipping.country"
                        name="shipping.country"
                        required
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="sameAsShipping"
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={handleSameAsShippingChange}
                      className="h-4 w-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="sameAsShipping"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.sameAsShipping")}
                    </label>
                  </div>
                </form>
              </CardContent>
            </Card>

            {!sameAsShipping && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                    {t("checkout.billingInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="billing.firstName"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.firstName")}
                        </Label>
                        <Input
                          id="billing.firstName"
                          name="billing.firstName"
                          required
                          value={billingAddress.firstName}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="billing.lastName"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.lastName")}
                        </Label>
                        <Input
                          id="billing.lastName"
                          name="billing.lastName"
                          required
                          value={billingAddress.lastName}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="billing.phone"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.phone")}
                      </Label>
                      <Input
                        id="billing.phone"
                        name="billing.phone"
                        type="tel"
                        required
                        value={billingAddress.phone}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="billing.addressLine1"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.address")}
                      </Label>
                      <Input
                        id="billing.addressLine1"
                        name="billing.addressLine1"
                        required
                        value={billingAddress.addressLine1}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="billing.addressLine2"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.address2")}
                      </Label>
                      <Input
                        id="billing.addressLine2"
                        name="billing.addressLine2"
                        value={billingAddress.addressLine2}
                        onChange={handleInputChange}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="billing.city"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.city")}
                        </Label>
                        <Input
                          id="billing.city"
                          name="billing.city"
                          required
                          value={billingAddress.city}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="billing.state"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.state")}
                        </Label>
                        <Input
                          id="billing.state"
                          name="billing.state"
                          value={billingAddress.state}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="billing.postalCode"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.postalCode")}
                        </Label>
                        <Input
                          id="billing.postalCode"
                          name="billing.postalCode"
                          required
                          value={billingAddress.postalCode}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="billing.country"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.country")}
                        </Label>
                        <Input
                          id="billing.country"
                          name="billing.country"
                          required
                          value={billingAddress.country}
                          onChange={handleInputChange}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <CreditCard className="h-5 w-5 mr-2 text-indigo-400" />
                  {t("checkout.paymentMethod")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="cash_on_delivery"
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === "cash_on_delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="cash_on_delivery"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.cashOnDelivery")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="credit_card"
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="credit_card"
                      className="text-sm sm:text-base"
                    >
                      {t("checkout.creditCard")}
                    </label>
                  </div>
                </div>

                {paymentMethod === "credit_card" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label
                        htmlFor="cardName"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.cardName")}
                      </Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="cardNumber"
                        className="text-sm sm:text-base"
                      >
                        {t("checkout.cardNumber")}
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="expiry"
                          className="text-sm sm:text-base"
                        >
                          {t("checkout.expiry")}
                        </Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm sm:text-base">
                          {t("checkout.cvv")}
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base py-2 sm:py-3"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {paymentMethod === "cash_on_delivery"
                    ? t("checkout.placeOrderCash")
                    : t("checkout.placeOrderCard")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Truck className="h-5 w-5 mr-2 text-indigo-400" />
                  {t("checkout.orderSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-3 border-b border-border/20"
                    >
                      <div>
                        <span className="font-medium text-sm sm:text-base">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm block">
                          x {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-sm sm:text-base">
                        {(item.price * item.quantity).toFixed(2)} MAD
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t("checkout.subtotal")}</span>
                    <span>{total.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t("checkout.deliveryFee")}</span>
                    <span>{deliveryFee.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t("checkout.tax")}</span>
                    <span>{taxAmount.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg sm:text-xl mt-2">
                    <span>{t("checkout.total")}</span>
                    <span className="text-indigo-400">
                      {totalAmount.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
