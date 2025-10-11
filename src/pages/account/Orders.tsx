import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const AccountOrders = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user orders with items
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(
            `
            id,
            order_number,
            created_at,
            status,
            total_amount,
            order_items(
              id,
              quantity,
              price,
              product_snapshot
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Process orders data
        const processedOrders = ordersData.map((order) => {
          const items = order.order_items.map((item) => {
            // Extract product name from product_snapshot
            let productName = "Product";
            if (
              item.product_snapshot &&
              typeof item.product_snapshot === "object" &&
              !Array.isArray(item.product_snapshot)
            ) {
              productName =
                (item.product_snapshot as { name?: string }).name || "Product";
            }

            return {
              name: productName,
              quantity: item.quantity,
              price: item.price,
            };
          });

          return {
            id: order.id,
            order_number: order.order_number,
            created_at: new Date(order.created_at).toLocaleDateString(),
            status: order.status,
            total_amount: order.total_amount,
            items,
          };
        });

        setOrders(processedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/10 text-green-500";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500";
      case "Shipped":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-red-500/10 text-red-500";
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
            <p>Please sign in to access your orders.</p>
            <Link to="/login">
              <Button className="mt-4">Sign In</Button>
            </Link>
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
          <Button variant="outline" className="mb-4" asChild>
            <Link to="/account/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("header.backToProfile")}
            </Link>
          </Button>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {t("header.orders")}
          </h1>
          <p className="text-muted-foreground">
            {t("orderConfirmation.subtitle")}
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">
                {t("cart.empty")}
              </h3>
              <p className="text-muted-foreground mb-6">{t("cart.noOrders")}</p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                {t("cart.shop")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-indigo-400" />
                        {order.order_number}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        {order.created_at}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-border/20 pt-4">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {item.name}{" "}
                            {item.quantity > 1 && `x ${item.quantity}`}
                          </span>
                          <span>{item.price.toFixed(2)} MAD</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold border-t border-border/20 pt-3">
                      <span>{t("cart.total")}</span>
                      <span className="text-indigo-400">
                        {order.total_amount.toFixed(2)} MAD
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="border-indigo-400 text-indigo-400 hover:bg-indigo-500/10"
                        asChild
                      >
                        <Link to={`/order-confirmation/${order.id}`}>
                          {t("orderConfirmation.viewDetails")}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border/20 hover:bg-indigo-500/10"
                      >
                        {t("contact.reorder")}
                      </Button>
                    </div>
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

export default AccountOrders;
