import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

interface OrderItem {
  id: string;
  product_snapshot?: {
    name?: string;
  };
  quantity: number;
  price: number;
}

const AdminOrders = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Set the language to French for admin dashboard
  useEffect(() => {
    i18n.changeLanguage("fr");
  }, [i18n]);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    setOrderItems(data || []);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: t("admin.orderStatusUpdated") });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus } as Order);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const deliveryFee = 15;

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{t("admin.orders")}</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.allOrders")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => handleViewOrder(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        {order.profiles?.full_name || t("admin.unknown")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.email}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {t(`admin.${order.status}`)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      {order.total_amount} MAD
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedOrder && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t("admin.orderDetails")}</CardTitle>
                  <Button onClick={handlePrint} variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    {t("admin.print")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent ref={printRef} className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.orderId")}
                  </p>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("admin.status")}
                  </p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleStatusChange(selectedOrder.id, value)
                    }
                  >
                    <SelectTrigger className="print:hidden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t("admin.pending")}
                      </SelectItem>
                      <SelectItem value="processing">
                        {t("admin.processing")}
                      </SelectItem>
                      <SelectItem value="shipped">
                        {t("admin.shipped")}
                      </SelectItem>
                      <SelectItem value="delivered">
                        {t("admin.delivered")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("admin.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="hidden print:block">
                    {t(`admin.${selectedOrder.status}`)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("admin.deliveryAddress")}
                  </p>
                  <div className="bg-muted p-3 rounded">
                    <p className="font-semibold">
                      {selectedOrder.shipping_address.fullName}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shipping_address.phone}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shipping_address.address}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shipping_address.city},{" "}
                      {selectedOrder.shipping_address.postalCode}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shipping_address.country}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("admin.items")}
                  </p>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.product_snapshot?.name} x{item.quantity}
                        </span>
                        <span>
                          {(item.price * item.quantity).toFixed(2)} MAD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("admin.subtotal")}</span>
                    <span>
                      {(selectedOrder.total_amount - deliveryFee).toFixed(2)}{" "}
                      MAD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("admin.deliveryFee")}</span>
                    <span>{deliveryFee.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{t("admin.total")} (COD)</span>
                    <span>{selectedOrder.total_amount.toFixed(2)} MAD</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-semibold">
                    {t("admin.paymentMethod")}: {t("admin.cashOnDelivery")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
