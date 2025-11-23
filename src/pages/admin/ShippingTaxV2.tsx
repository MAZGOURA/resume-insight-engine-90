import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { DataTable } from "@/components/admin/v2/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ShippingTaxV2() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConfigs();

    // Real-time updates
    const channel = supabase
      .channel("shipping_tax_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipping_tax_configs" },
        () => fetchConfigs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipping_tax_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("shipping_tax_configs")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchConfigs();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredConfigs = configs.filter((config) =>
    config.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Nom",
      accessor: "name" as const,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Type",
      accessor: "type" as const,
    },
    {
      header: "Taux",
      accessor: (config: any) => {
        return config.rate_type === "percentage"
          ? `${config.rate_value}%`
          : `${config.rate_value} MAD`;
      },
    },
    {
      header: "Description",
      accessor: "description" as const,
      cell: (value: string) => value || "-",
    },
    {
      header: "Actif",
      accessor: (config: any) => (
        <Switch
          checked={config.is_active}
          onCheckedChange={() => handleToggleActive(config.id, config.is_active)}
        />
      ),
    },
  ];

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Paramètres Livraison & Taxes</h1>
          <p className="text-muted-foreground mt-1">
            Configurez les frais de livraison et les taxes
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher une configuration..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchConfigs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Config
              </Button>
            </>
          }
        />

        {/* Configs Table */}
        <DataTable
          data={filteredConfigs}
          columns={columns}
          loading={loading}
          emptyMessage="Aucune configuration trouvée"
        />
      </div>
    </AdminLayoutV2>
  );
}
