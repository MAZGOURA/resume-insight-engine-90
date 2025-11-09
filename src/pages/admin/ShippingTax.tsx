import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";

interface Config {
  id: string;
  name: string;
  type: string;
  rate_type: string;
  rate_value: number;
  min_order_amount: number | null;
  max_order_amount: number | null;
  is_active: boolean | null;
}

export default function ShippingTax() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCfg, setNewCfg] = useState({
    name: "",
    type: "shipping",
    rate_type: "flat",
    rate_value: "",
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shipping_tax_configs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setConfigs(data || []);
    } catch (e) {
      toast.error(t("Failed to load configs"));
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async () => {
    try {
      if (!newCfg.name || !newCfg.rate_value)
        return toast.error(t("Name and rate are required"));
      const { error } = await supabase.from("shipping_tax_configs").insert({
        name: newCfg.name,
        type: newCfg.type,
        rate_type: newCfg.rate_type,
        rate_value: Number(newCfg.rate_value),
        is_active: true,
      });
      if (error) throw error;
      toast.success(t("Config added"));
      setNewCfg({
        name: "",
        type: "shipping",
        rate_type: "flat",
        rate_value: "",
      });
      loadConfigs();
    } catch (e) {
      toast.error(t("Failed to add config"));
    }
  };

  const toggleActive = async (cfg: Config) => {
    try {
      const { error } = await supabase
        .from("shipping_tax_configs")
        .update({ is_active: !cfg.is_active })
        .eq("id", cfg.id);
      if (error) throw error;
      loadConfigs();
    } catch (e) {
      toast.error(t("Failed to update config"));
    }
  };

  return (
    <AdminLayout
      title={t("Livraison et Taxes")}
      subtitle={t("Configurer les règles de livraison et de taxes")}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 grid gap-4 md:grid-cols-5">
            <Input
              placeholder={t("Nom")}
              value={newCfg.name}
              onChange={(e) => setNewCfg({ ...newCfg, name: e.target.value })}
            />
            <Select
              value={newCfg.type}
              onValueChange={(v) => setNewCfg({ ...newCfg, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipping">{t("Livraison")}</SelectItem>
                <SelectItem value="tax">{t("Taxe")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newCfg.rate_type}
              onValueChange={(v) => setNewCfg({ ...newCfg, rate_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Type de taux")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">{t("Forfaitaire")}</SelectItem>
                <SelectItem value="percentage">{t("Pourcentage")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={t("Taux")}
              value={newCfg.rate_value}
              onChange={(e) =>
                setNewCfg({ ...newCfg, rate_value: e.target.value })
              }
            />
            <Button onClick={addConfig}>{t("Ajouter")}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Nom")}</TableHead>
                  <TableHead>{t("Type")}</TableHead>
                  <TableHead>{t("Taux")}</TableHead>
                  <TableHead>{t("Statut")}</TableHead>
                  <TableHead>{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>
                      {c.type} • {c.rate_type}
                    </TableCell>
                    <TableCell>
                      {c.rate_type === "percentage"
                        ? `${c.rate_value}%`
                        : formatCurrency(c.rate_value, "MAD")}
                    </TableCell>
                    <TableCell>
                      {c.is_active ? t("Actif") : t("Inactif")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(c)}
                      >
                        {c.is_active ? t("Désactiver") : t("Activer")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
