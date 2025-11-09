import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";

interface ShippingCity {
  id: string;
  city_name: string;
  shipping_price: number;
  is_active: boolean;
}

const ShippingCities = () => {
  const { t } = useTranslation();
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<ShippingCity | null>(null);
  const [formData, setFormData] = useState({
    city_name: "",
    shipping_price: "",
    is_active: true,
  });

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_cities")
        .select("*")
        .order("city_name");

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      toast.error(t("Failed to load shipping cities"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cityData = {
        city_name: formData.city_name,
        shipping_price: parseFloat(formData.shipping_price),
        is_active: formData.is_active,
      };

      if (editingCity) {
        const { error } = await supabase
          .from("shipping_cities")
          .update(cityData)
          .eq("id", editingCity.id);

        if (error) throw error;
        toast.success(t("City updated successfully"));
      } else {
        const { error } = await supabase
          .from("shipping_cities")
          .insert(cityData);

        if (error) throw error;
        toast.success(t("City added successfully"));
      }

      setIsDialogOpen(false);
      resetForm();
      loadCities();
    } catch (error) {
      toast.error(t("Failed to save city"));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("Are you sure you want to delete this city?"))) return;

    try {
      const { error } = await supabase
        .from("shipping_cities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success(t("City deleted successfully"));
      loadCities();
    } catch (error) {
      toast.error(t("Failed to delete city"));
      console.error(error);
    }
  };

  const handleEdit = (city: ShippingCity) => {
    setEditingCity(city);
    setFormData({
      city_name: city.city_name,
      shipping_price: city.shipping_price.toString(),
      is_active: city.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      city_name: "",
      shipping_price: "",
      is_active: true,
    });
    setEditingCity(null);
  };

  return (
    <AdminLayout title={t("Villes de livraison")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("Villes de livraison")}</h1>
            <p className="text-muted-foreground">
              {t("Gérez les prix de livraison pour différentes villes")}
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("Ajouter une ville")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCity
                    ? t("Modifier la ville")
                    : t("Ajouter une nouvelle ville")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="city_name">{t("Nom de la ville")}</Label>
                  <Input
                    id="city_name"
                    value={formData.city_name}
                    onChange={(e) =>
                      setFormData({ ...formData, city_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_price">
                    {t("Prix de livraison (MAD)")}
                  </Label>
                  <Input
                    id="shipping_price"
                    type="number"
                    step="0.01"
                    value={formData.shipping_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">{t("Actif")}</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingCity
                    ? t("Mettre à jour la ville")
                    : t("Ajouter la ville")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Nom de la ville")}</TableHead>
                <TableHead>{t("Prix de livraison")}</TableHead>
                <TableHead>{t("Statut")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {t("Chargement...")}
                  </TableCell>
                </TableRow>
              ) : cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {t("Aucune ville trouvée")}
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">
                      {city.city_name}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(city.shipping_price, "MAD")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          city.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {city.is_active ? t("Actif") : t("Inactif")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(city)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(city.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ShippingCities;
