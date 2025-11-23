import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShippingCityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: any;
  onSuccess: () => void;
}

export const ShippingCityFormModal = ({
  open,
  onOpenChange,
  city,
  onSuccess,
}: ShippingCityFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city_name: "",
    shipping_price: 0,
    is_active: true,
  });

  useEffect(() => {
    if (city) {
      setFormData({
        city_name: city.city_name || "",
        shipping_price: city.shipping_price || 0,
        is_active: city.is_active ?? true,
      });
    } else {
      setFormData({
        city_name: "",
        shipping_price: 0,
        is_active: true,
      });
    }
  }, [city, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (city) {
        const { error } = await supabase
          .from("shipping_cities")
          .update(formData)
          .eq("id", city.id);

        if (error) throw error;
        toast.success("Ville mise à jour");
      } else {
        const { error } = await supabase
          .from("shipping_cities")
          .insert([formData]);

        if (error) throw error;
        toast.success("Ville ajoutée");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {city ? "Modifier la ville" : "Nouvelle ville"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city_name">Nom de la ville *</Label>
            <Input
              id="city_name"
              value={formData.city_name}
              onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_price">Prix de livraison (MAD) *</Label>
            <Input
              id="shipping_price"
              type="number"
              step="0.01"
              value={formData.shipping_price}
              onChange={(e) => setFormData({ ...formData, shipping_price: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
