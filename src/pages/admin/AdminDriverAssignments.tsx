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
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Truck, Package, User } from "lucide-react";

interface DriverAssignment {
  id: string;
  driver_id: string;
  order_id: string;
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_status: string;
  cash_collected: number;
  notes: string | null;
  delivery_drivers: {
    full_name: string;
  } | null;
  orders: {
    order_number: string;
    total_amount: number;
    shipping_address: any;
  } | null;
}

const AdminDriverAssignments = () => {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("delivery_assignments")
      .select(`
        *,
        delivery_drivers (full_name),
        orders (order_number, total_amount, shipping_address)
      `)
      .order("assigned_at", { ascending: false });

    if (!error && data) {
      setAssignments(data);
    } else if (error) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-yellow-500";
      case "picked_up": return "bg-blue-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned": return t("admin.assigned");
      case "picked_up": return t("admin.pickedUp");
      case "delivered": return t("admin.delivered");
      case "cancelled": return t("admin.cancelled");
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.driverAssignments")}</h1>
          <p className="text-muted-foreground">{t("admin.viewAllDriverAssignments")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t("admin.deliveryAssignments")}
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
                      <TableHead>{t("admin.deliveryAddress")}</TableHead>
                      <TableHead>{t("admin.amount")}</TableHead>
                      <TableHead>{t("admin.cashCollected")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("admin.assignedDate")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="font-medium">#{assignment.orders?.order_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(assignment.assigned_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="font-medium">
                              {assignment.delivery_drivers?.full_name || t("admin.unassigned")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {assignment.orders?.shipping_address?.fullName}
                            <div className="text-muted-foreground">
                              {assignment.orders?.shipping_address?.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {assignment.orders?.total_amount} MAD
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {assignment.cash_collected > 0 ? `${assignment.cash_collected} MAD` : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.delivery_status)}>
                            {getStatusText(assignment.delivery_status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {assignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("admin.noAssignmentsFound")}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDriverAssignments;