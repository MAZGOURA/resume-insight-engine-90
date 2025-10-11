import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import DriverLayout from "@/components/driver/DriverLayout";

// Define interfaces for our custom tables
interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface OrderData {
  order_number: string;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
}

interface DeliveryAssignmentData {
  id: string;
  order_id: string;
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_status: string;
  cash_collected: number;
  notes: string | null;
  orders: OrderData | null;
}

interface DriverData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  license_number: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DriverDashboard = () => {
  const { t, i18n } = useTranslation();
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [assignments, setAssignments] = useState<DeliveryAssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashAmount, setCashAmount] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchDriverInfo();
  }, []);

  useEffect(() => {
    if (driver?.id) {
      fetchAssignments();
    }
  }, [driver?.id]);

  const fetchDriverInfo = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Using casting to avoid TypeScript issues with custom tables
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await supabase
        .from("delivery_drivers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!result.error && result.data) {
        setDriver(result.data);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!driver?.id) return;

    // Using casting to avoid TypeScript issues with custom tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await supabase
      .from("delivery_assignments")
      .select(
        `
        id,
        order_id,
        assigned_at,
        picked_up_at,
        delivered_at,
        delivery_status,
        cash_collected,
        notes,
        orders (
          order_number,
          total_amount,
          shipping_address,
          created_at
        )
      `
      )
      .eq("driver_id", driver.id)
      .in("delivery_status", ["assigned", "picked_up"])
      .order("assigned_at", { ascending: false });

    if (!result.error && result.data) {
      setAssignments(result.data);
    }
    setLoading(false);
  };

  const markAsPickedUp = async (assignmentId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await supabase
      .from("delivery_assignments")
      .update({
        delivery_status: "picked_up",
        picked_up_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (result.error) {
      toast({
        title: t("driver.error"),
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("driver.orderPickedUp"),
        description: t("driver.orderPickedUpSuccess"),
      });
      fetchAssignments();
    }
  };

  const markAsDelivered = async (assignmentId: string) => {
    if (!cashAmount) {
      toast({
        title: t("driver.error"),
        description: t("driver.cashAmountRequired"),
        variant: "destructive",
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await supabase
      .from("delivery_assignments")
      .update({
        delivery_status: "delivered",
        delivered_at: new Date().toISOString(),
        cash_collected: parseFloat(cashAmount),
      })
      .eq("id", assignmentId);

    if (result.error) {
      toast({
        title: t("driver.error"),
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("driver.orderDelivered"),
        description: t("driver.orderDeliveredSuccess"),
      });
      setCashAmount("");
      setSelectedAssignment(null);
      fetchAssignments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-500";
      case "picked_up":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return t("driver.assigned");
      case "picked_up":
        return t("driver.pickedUp");
      case "delivered":
        return t("driver.delivered");
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("driver.dashboard")}
            </h1>
            <p className="text-muted-foreground">{t("driver.welcome")}</p>
          </div>

          {driver && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("driver.driverInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      {t("driver.name")}
                    </Label>
                    <p className="font-medium">{driver.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      {t("driver.phone")}
                    </Label>
                    <p className="font-medium">{driver.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      {t("driver.vehicle")}
                    </Label>
                    <p className="font-medium">
                      {driver.vehicle_type} ({driver.vehicle_plate})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("driver.assignedOrders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {t("driver.noAssignedOrders")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">
                              {t("driver.order")} #
                              {assignment.orders?.order_number}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(
                                assignment.assigned_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(
                              assignment.delivery_status
                            )}
                          >
                            {getStatusText(assignment.delivery_status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {t("driver.deliveryAddress")}
                            </div>
                            {assignment.orders?.shipping_address && (
                              <div className="text-sm">
                                <p>
                                  {assignment.orders.shipping_address.fullName}
                                </p>
                                <p>
                                  {assignment.orders.shipping_address.address}
                                </p>
                                <p>
                                  {assignment.orders.shipping_address.city},{" "}
                                  {
                                    assignment.orders.shipping_address
                                      .postalCode
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Phone className="h-4 w-4 mr-1" />
                              {t("driver.contact")}
                            </div>
                            <p className="text-sm">
                              {assignment.orders?.shipping_address?.phone}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-semibold">
                                {assignment.orders?.total_amount} MAD
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t("driver.orderDate")}:{" "}
                              {assignment.orders?.created_at &&
                                new Date(
                                  assignment.orders.created_at
                                ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {assignment.delivery_status === "assigned" && (
                              <Button
                                size="sm"
                                onClick={() => markAsPickedUp(assignment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t("driver.markPickedUp")}
                              </Button>
                            )}
                            {assignment.delivery_status === "picked_up" && (
                              <>
                                {selectedAssignment === assignment.id ? (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      <Input
                                        type="number"
                                        placeholder={t("driver.cashAmount")}
                                        value={cashAmount}
                                        onChange={(e) =>
                                          setCashAmount(e.target.value)
                                        }
                                        className="w-32"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        markAsDelivered(assignment.id)
                                      }
                                    >
                                      {t("driver.confirmDelivery")}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setSelectedAssignment(null)
                                      }
                                    >
                                      {t("driver.cancel")}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setSelectedAssignment(assignment.id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {t("driver.markDelivered")}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverDashboard;
