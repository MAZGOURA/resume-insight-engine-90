import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "@/hooks/use-toast";
import { Wallet, Package, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DriverLayout from "@/components/driver/DriverLayout";

interface DriverEarning {
  id: string;
  order_number: string;
  cash_collected: number;
  shipping_amount: number;
  admin_commission_rate: number;
  admin_commission: number;
  driver_earnings: number;
  payment_status: string;
  delivered_at: string;
}

interface PaymentSummary {
  total_cash_collected: number;
  total_admin_commission: number;
  total_driver_earnings: number;
  total_orders: number;
  pending_amount: number;
}

const DriverPayments = () => {
  const { t } = useTranslation();
  const [earnings, setEarnings] = useState<DriverEarning[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total_cash_collected: 0,
    total_admin_commission: 0,
    total_driver_earnings: 0,
    total_orders: 0,
    pending_amount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverEarnings();
  }, []);

  const fetchDriverEarnings = async () => {
    // This would be a more complex query in a real implementation
    // For now, we'll simulate the data structure
    const mockData: DriverEarning[] = [
      {
        id: "1",
        order_number: "ORD-2025-001",
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
        cash_collected: 168.0,
        shipping_amount: 15.0,
        admin_commission_rate: 5,
        admin_commission: 8.4,
        driver_earnings: 174.6,
        payment_status: "pending",
        delivered_at: "2025-10-10T16:45:00Z",
      },
      {
        id: "3",
        order_number: "ORD-2025-003",
        cash_collected: 320.0,
        shipping_amount: 15.0,
        admin_commission_rate: 5,
        admin_commission: 16.0,
        driver_earnings: 319.0,
        payment_status: "paid",
        delivered_at: "2025-10-09T11:20:00Z",
      },
    ];

    setEarnings(mockData);

    // Calculate summary
    const totalCash = mockData.reduce(
      (sum, earning) => sum + earning.cash_collected,
      0
    );
    const totalCommission = mockData.reduce(
      (sum, earning) => sum + earning.admin_commission,
      0
    );
    const totalEarnings = mockData.reduce(
      (sum, earning) => sum + earning.driver_earnings,
      0
    );
    const pendingAmount = mockData
      .filter((earning) => earning.payment_status === "pending")
      .reduce((sum, earning) => sum + earning.driver_earnings, 0);

    setSummary({
      total_cash_collected: totalCash,
      total_admin_commission: totalCommission,
      total_driver_earnings: totalEarnings,
      total_orders: mockData.length,
      pending_amount: pendingAmount,
    });

    setLoading(false);
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
        return t("driver.paid");
      case "pending":
        return t("driver.pending");
      default:
        return status;
    }
  };

  return (
    <DriverLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("driver.payments")}
            </h1>
            <p className="text-muted-foreground">
              {t("driver.paymentSummary")}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("driver.totalOrders")}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_orders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("driver.totalCashCollected")}
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.total_cash_collected.toFixed(2)} MAD
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("driver.adminCommission")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  -{summary.total_admin_commission.toFixed(2)} MAD
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("driver.netEarnings")}
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.total_driver_earnings.toFixed(2)} MAD
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("driver.pending")}: {summary.pending_amount.toFixed(2)} MAD
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t("driver.paymentDetails")}
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
                        <TableHead>{t("driver.order")}</TableHead>
                        <TableHead>{t("driver.cashCollected")}</TableHead>
                        <TableHead>{t("driver.shippingFee")}</TableHead>
                        <TableHead>{t("driver.commissionRate")}</TableHead>
                        <TableHead>{t("driver.adminCommission")}</TableHead>
                        <TableHead>{t("driver.yourEarnings")}</TableHead>
                        <TableHead>{t("driver.deliveryDate")}</TableHead>
                        <TableHead>{t("driver.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((earning) => (
                        <TableRow key={earning.id}>
                          <TableCell>
                            <div className="font-medium">
                              #{earning.order_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {earning.cash_collected.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {earning.shipping_amount.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {earning.admin_commission_rate}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-500">
                              -{earning.admin_commission.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {earning.driver_earnings.toFixed(2)} MAD
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                earning.delivered_at
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(earning.payment_status)}
                            >
                              {getStatusText(earning.payment_status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {earnings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("driver.noEarningsFound")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverPayments;
