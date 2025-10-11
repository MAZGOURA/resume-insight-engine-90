import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, User } from "lucide-react";

interface Driver {
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
}

const AdminDrivers = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    license_number: "",
    vehicle_type: "",
    vehicle_plate: "",
    is_active: true,
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDrivers(data);
    }
    setLoading(false);
  };

  const handleCreateDriver = async () => {
    // In a real app, you would create a user account and then create the driver record
    // For now, we'll just show a message
    toast({
      title: t("admin.driverCreationInfo"),
      description: t("admin.driverCreationDescription"),
    });
    setIsDialogOpen(false);
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver) return;

    const { error } = await supabase
      .from("delivery_drivers")
      .update(formData)
      .eq("id", editingDriver.id);

    if (error) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("admin.driverUpdated"),
        description: t("admin.driverUpdatedSuccess"),
      });
      fetchDrivers();
      setIsDialogOpen(false);
      setEditingDriver(null);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    const { error } = await supabase
      .from("delivery_drivers")
      .delete()
      .eq("id", driverId);

    if (error) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("admin.driverDeleted"),
        description: t("admin.driverDeletedSuccess"),
      });
      fetchDrivers();
    }
  };

  const openDialog = (driver: Driver | null = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        full_name: driver.full_name,
        phone: driver.phone,
        email: driver.email,
        license_number: driver.license_number,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        is_active: driver.is_active,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        license_number: "",
        vehicle_type: "",
        vehicle_plate: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      handleUpdateDriver();
    } else {
      handleCreateDriver();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("admin.deliveryDrivers")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.manageDeliveryDrivers")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t("admin.drivers")}</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("admin.addDriver")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDriver
                        ? t("admin.editDriver")
                        : t("admin.addDriver")}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">{t("admin.fullName")}</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("admin.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("admin.phone")}</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license_number">
                          {t("admin.licenseNumber")}
                        </Label>
                        <Input
                          id="license_number"
                          value={formData.license_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              license_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_type">
                          {t("admin.vehicleType")}
                        </Label>
                        <Input
                          id="vehicle_type"
                          value={formData.vehicle_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicle_type: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_plate">
                          {t("admin.vehiclePlate")}
                        </Label>
                        <Input
                          id="vehicle_plate"
                          value={formData.vehicle_plate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicle_plate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_active: checked })
                        }
                      />
                      <Label htmlFor="is_active">{t("admin.active")}</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        {t("admin.cancel")}
                      </Button>
                      <Button type="submit">
                        {editingDriver ? t("admin.update") : t("admin.create")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                      <TableHead>{t("admin.contact")}</TableHead>
                      <TableHead>{t("admin.vehicle")}</TableHead>
                      <TableHead>{t("admin.license")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {driver.full_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {driver.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{driver.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {driver.vehicle_type} ({driver.vehicle_plate})
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{driver.license_number}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={driver.is_active ? "default" : "secondary"}
                          >
                            {driver.is_active
                              ? t("admin.active")
                              : t("admin.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog(driver)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDriver(driver.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {drivers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("admin.noDriversFound")}
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

export default AdminDrivers;
