import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { getOrdersByUserId } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_address: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
  }>;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getOrdersByUserId(user.id);
      setOrders(data as unknown as Order[]);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update statusConfig to use translations
  const translatedStatusConfig = {
    pending: {
      label: t("Pending"),
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    processing: {
      label: t("Processing"),
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    shipped: {
      label: t("Shipped"),
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    delivered: {
      label: t("Delivered"),
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: t("Cancelled"),
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
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
              {t("You need to be signed in to view your orders.")}
            </p>
            <Link to="/">
              <Button>{t("Go Home")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title={`${t("My Orders")} - ANAS FRAGRANCES`}
        description={t("View your order history and track your purchases.")}
        keywords="orders, order history, tracking, purchases"
      />

      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-center items-center gap-4 mb-6">
          <h1 className="text-4xl font-bold">{t("My Orders")}</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("No orders yet")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t(
                  "You haven't placed any orders yet. Start shopping to see your orders here."
                )}
              </p>
              <Link to="/shop">
                <Button>{t("Start Shopping")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = translatedStatusConfig[order.status].icon;
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            {t("Order #")}
                            {order.id.slice(-8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {t("Placed on")}{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          className={translatedStatusConfig[order.status].color}
                        >
                          {translatedStatusConfig[order.status].label}
                        </Badge>
                        <span className="text-xl font-bold">
                          {formatCurrency(order.total_amount, "MAD")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-lg">
                          {t("Order Items")}
                        </h4>
                        <div className="space-y-4">
                          {order.order_items.map((item) => {
                            // Ensure we get the image URL correctly from the products object
                            const imageUrl = item.products?.image_url || "/placeholder.svg";

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <img
                                  src={imageUrl}
                                  alt={item.products?.name || "Product"}
                                  className="w-16 h-16 object-cover rounded"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.src !== "/placeholder.svg") {
                                      target.src = "/placeholder.svg";
                                    }
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium truncate">
                                    {item.products.name}
                                  </h5>
                                  <p className="text-sm text-muted-foreground">
                                    {t("Qty")}: {item.quantity} ×{" "}
                                    {formatCurrency(item.price, "MAD")}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <span className="text-sm">
                                      {t("Qty")}:{" "}
                                      <span className="font-medium">
                                        {item.quantity}
                                      </span>
                                    </span>
                                    <span className="text-sm">
                                      {t("Price")}:{" "}
                                      <span className="font-medium">
                                        {formatCurrency(item.price, "MAD")}
                                      </span>
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {t("Total")}:{" "}
                                      {formatCurrency(
                                        item.price * item.quantity,
                                        "MAD"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4 text-lg">
                          {t("Shipping Information")}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">
                              {t("Recipient")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("Address")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.address}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.city},{" "}
                              {order.shipping_address.zip_code}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("Contact")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.email}
                            </p>
                          </div>
                        </div>

                        {order.status === "shipped" && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              {t("Tracking Information")}
                            </h4>
                            <p className="text-sm text-blue-700">
                              {t(
                                "Your order has been shipped and is on its way to you. Tracking number will be available soon."
                              )}
                            </p>
                          </div>
                        )}

                        {order.status === "delivered" && (
                          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              {t("Order Delivered")}
                            </h4>
                            <p className="text-sm text-green-700">
                              {t(
                                "Your order has been delivered successfully on"
                              )}{" "}
                              {new Date(order.updated_at).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                              .
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
