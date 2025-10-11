import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Truck, Package, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverPayment {
  id: string;
  full_name: string;
  total_orders: number;
  total_cash_collected: number;
  total_shipping_fees: number;
  admin_commission: number;
  driver_earnings: number;
  pending_amount: number;
}

interface OrderPayment {
  id: string;
  order_number: string;
  driver_name: string;
  cash_collected: number;
  shipping_amount: number;
  admin_commission_rate: number;
  admin_commission: number;
  driver_earnings: number;
  payment_status: string;
  delivered_at: string;
}

const AdminDriverPayments = () => {
  const { t } = useTranslation();
  const [driverPayments, setDriverPayments] = useState<DriverPayment[]>([]);
  const [orderPayments, setOrderPayments] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drivers" | "orders">("drivers");

  useEffect(() => {
    fetchDriverPayments();
    fetchOrderPayments();
  }, []);

  const fetchDriverPayments = async () => {
    // This would be a more complex query in a real implementation
    // For now, we'll simulate the data structure
    const mockData: DriverPayment[] = [
      {
        id: "1",
        full_name: "Ahmed Hassan",
        total_orders: 12,
        total_cash_collected: 2450.0,
        total_shipping_fees: 180.0,
        admin_commission: 120.0,
        driver_earnings: 2510.0,
        pending_amount: 2510.0,
      },
      {
        id: "2",
        full_name: "Karim Mohammed",
        total_orders: 8,
        total_cash_collected: 1680.0,
        total_shipping_fees: 120.0,
        admin_commission: 80.0,
        driver_earnings: 1720.0,
        pending_amount: 1720.0,
      },
    ];

    setDriverPayments(mockData);
    setLoading(false);
  };

  const fetchOrderPayments = async () => {
    // This would be a more complex query in a real implementation
    // For now, we'll simulate the data structure
    const mockData: OrderPayment[] = [
      {
        id: "1",
        order_number: "ORD-2025-001",
        driver_name: "Ahmed Hassan",
        cash_collected: 245.0,
        shipping_amount: 15.0,
        admin_commission_rate: 5,
        admin_commission: 12.25,
        driver_earnings: 247.75,
        payment_status: "pending",
        delivered_at: "2025-10-10T14:30:00Z",
      },
      {
        id: "2",
        order_number: "ORD-2025-002",
        driver_name: "Karim Mohammed",
        cash_collected: 168.0,
        shipping_amount: 15.0,
        admin_commission_rate: 5,
        admin_commission: 8.4,
        driver_earnings: 174.6,
        payment_status: "pending",
        delivered_at: "2025-10-10T16:45:00Z",
      },
    ];

    setOrderPayments(mockData);
  };

  const markAsPaid = async (driverId: string) => {
    toast({
      title: t("admin.paymentMarked"),
      description: t("admin.paymentMarkedSuccess"),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("admin.paid");
      case "pending":
        return t("admin.pending");
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("admin.driverPayments")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.manageDriverPayments")}
          </p>
        </div>

        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "drivers" ? "default" : "outline"}
            onClick={() => setActiveTab("drivers")}
          >
            {t("admin.byDriver")}
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            {t("admin.byOrder")}
          </Button>
        </div>

        {activeTab === "drivers" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t("admin.driverPaymentSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.driver")}</TableHead>
                        <TableHead>{t("admin.orders")}</TableHead>
                        <TableHead>{t("admin.cashCollected")}</TableHead>
                        <TableHead>{t("admin.shippingFees")}</TableHead>
                        <TableHead>{t("admin.adminCommission")}</TableHead>
                        <TableHead>{t("admin.driverEarnings")}</TableHead>
                        <TableHead>{t("admin.pendingAmount")}</TableHead>
                        <TableHead>{t("admin.status")}</TableHead>
                        <TableHead>{t("admin.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverPayments.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="font-medium">
                                {driver.full_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {driver.total_orders}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {driver.total_cash_collected.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {driver.total_shipping_fees.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-500">
                              -{driver.admin_commission.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {driver.driver_earnings.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {driver.pending_amount.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-500">
                              {t("admin.pending")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(driver.id)}
                            >
                              {t("admin.markAsPaid")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {driverPayments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("admin.noDriverPaymentsFound")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("admin.orderPaymentDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.order")}</TableHead>
                        <TableHead>{t("admin.driver")}</TableHead>
                        <TableHead>{t("admin.cashCollected")}</TableHead>
                        <TableHead>{t("admin.shippingFee")}</TableHead>
                        <TableHead>{t("admin.commissionRate")}</TableHead>
                        <TableHead>{t("admin.adminCommission")}</TableHead>
                        <TableHead>{t("admin.driverEarnings")}</TableHead>
                        <TableHead>{t("admin.deliveryDate")}</TableHead>
                        <TableHead>{t("admin.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderPayments.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-medium">
                              #{order.order_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.driver_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.cash_collected.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.shipping_amount.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.admin_commission_rate}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-500">
                              -{order.admin_commission.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.driver_earnings.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                order.delivered_at
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(order.payment_status)}
                            >
                              {getStatusText(order.payment_status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {orderPayments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("admin.noOrderPaymentsFound")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminDriverPayments;
