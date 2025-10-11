import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Invoice } from "@/components/Invoice";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { orderService } from "@/integrations/supabase/services/orderService";
import { useAuth } from "@/contexts/AuthContext";

// Define the order data type
interface OrderData {
  orderNumber: string;
  orderDate: string;
  invoiceNumber: string;
  billTo: {
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
  };
  shipTo: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  items: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber: string;
}

// Helper function to safely extract values from JSON objects
const extractJsonValue = (obj: any, key: string): string => {
  if (obj && typeof obj === "object" && key in obj) {
    return String(obj[key]);
  }
  return "";
};

const OrderConfirmation = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const order = await orderService.getOrderById(orderId);

        // Safely extract address information from JSON objects
        const billingFirstName = extractJsonValue(
          order.billing_address,
          "first_name"
        );
        const billingLastName = extractJsonValue(
          order.billing_address,
          "last_name"
        );
        const billingAddressLine1 = extractJsonValue(
          order.billing_address,
          "address_line1"
        );
        const billingCity = extractJsonValue(order.billing_address, "city");
        const billingState = extractJsonValue(order.billing_address, "state");
        const billingCountry = extractJsonValue(
          order.billing_address,
          "country"
        );

        const shippingFirstName = extractJsonValue(
          order.shipping_address,
          "first_name"
        );
        const shippingLastName = extractJsonValue(
          order.shipping_address,
          "last_name"
        );
        const shippingAddressLine1 = extractJsonValue(
          order.shipping_address,
          "address_line1"
        );
        const shippingCity = extractJsonValue(order.shipping_address, "city");
        const shippingState = extractJsonValue(order.shipping_address, "state");
        const shippingCountry = extractJsonValue(
          order.shipping_address,
          "country"
        );

        // Transform Supabase order data to match our UI expectations
        const transformedOrder: OrderData = {
          orderNumber: order.order_number || `ORD-${order.id.substring(0, 8)}`,
          orderDate: new Date(
            order.created_at || new Date()
          ).toLocaleDateString(),
          invoiceNumber: `INV-${order.id.substring(0, 8)}`,
          billTo: {
            name: `${billingFirstName} ${billingLastName}`.trim() || "N/A",
            address: billingAddressLine1 || "",
            city: `${billingCity} ${billingState}`.trim(),
            country: billingCountry || "",
            email: user?.email || "N/A",
          },
          shipTo: {
            name: `${shippingFirstName} ${shippingLastName}`.trim() || "N/A",
            address: shippingAddressLine1 || "",
            city: `${shippingCity} ${shippingState}`.trim(),
            country: shippingCountry || "",
          },
          items:
            order.order_items?.map((item) => ({
              id: item.id,
              name: item.product_snapshot
                ? extractJsonValue(item.product_snapshot, "name")
                : "Product",
              description: "",
              quantity: item.quantity,
              price: item.price,
            })) || [],
          subtotal: order.subtotal || 0,
          shipping: order.shipping_amount || 0,
          tax: order.tax_amount || 0,
          total: order.total_amount || 0,
          paymentMethod: order.payment_method || "N/A",
          shippingMethod: "Standard Shipping",
          trackingNumber:
            "TRK-" + Math.floor(100000000 + Math.random() * 900000000),
        };

        setOrderData(transformedOrder);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <p>Error: {error}</p>
            </div>
            <Link to="/account/orders">
              <Button>View All Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Order not found</p>
            <Link to="/account/orders">
              <Button className="mt-4">View All Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Order tracking steps
  const trackingSteps = [
    {
      id: 1,
      title: t("orderConfirmation.orderPlaced"),
      description: t("orderConfirmation.orderPlacedDesc"),
      icon: ShoppingCart,
      completed: true,
    },
    {
      id: 2,
      title: t("orderConfirmation.processing"),
      description: t("orderConfirmation.processingDesc"),
      icon: Package,
      completed: true,
    },
    {
      id: 3,
      title: t("orderConfirmation.shipped"),
      description: t("orderConfirmation.shippedDesc"),
      icon: Truck,
      completed: orderData.shipping > 0, // Only completed if shipping is set
    },
    {
      id: 4,
      title: t("orderConfirmation.delivered"),
      description: t("orderConfirmation.deliveredDesc"),
      icon: CheckCircle,
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("orderConfirmation.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("orderConfirmation.subtitle")}
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-8 border-border/20 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">
                  {t("orderConfirmation.orderNumber")}
                </h3>
                <p className="text-lg font-bold text-indigo-400">
                  {orderData.orderNumber}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {t("orderConfirmation.orderDate")}
                </h3>
                <p className="text-lg font-bold">{orderData.orderDate}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {t("orderConfirmation.total")}
                </h3>
                <p className="text-lg font-bold text-indigo-400">
                  {orderData.total.toFixed(2)} MAD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Tracking */}
        <Card className="mb-8 border-border/20 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("orderConfirmation.trackingTitle")}
            </h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-6 h-[calc(100%-3rem)] w-0.5 bg-border ml-3"></div>

              <div className="space-y-6">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="relative flex items-start">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          step.completed
                            ? "bg-indigo-500 text-white"
                            : "bg-muted border-2 border-border"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="ml-4">
                        <h3
                          className={`font-semibold ${
                            step.completed
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice */}
        <div className="mb-8 p-6 bg-card rounded-2xl border border-border shadow-lg">
          <Invoice {...orderData} />
        </div>

        {/* Actions */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/account/orders">
              <Button variant="outline" className="border-border/20">
                {t("orderConfirmation.viewOrders")}
              </Button>
            </Link>
            <Link to="/products">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("orderConfirmation.continueShopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
