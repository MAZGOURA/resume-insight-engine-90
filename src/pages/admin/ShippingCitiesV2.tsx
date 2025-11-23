import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { DataTable } from "@/components/admin/v2/DataTable";
import { ShippingCityFormModal } from "@/components/admin/v2/ShippingCityFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ShippingCitiesV2() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  useEffect(() => {
    fetchCities();

    // Real-time updates
    const channel = supabase
      .channel("shipping_cities_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipping_cities" },
        () => fetchCities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipping_cities")
        .select("*")
        .order("city_name", { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des villes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("shipping_cities")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchCities();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredCities = cities.filter((city) =>
    city.city_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Ville",
      accessor: "city_name" as const,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Prix de livraison",
      accessor: "shipping_price" as const,
      cell: (value: number) => <span className="font-semibold">{value} MAD</span>,
    },
    {
      header: "Statut",
      accessor: (city: any) => (
        city.is_active ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        )
      ),
    },
    {
      header: "Actions",
      accessor: (city: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCity(city);
              setModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Switch
            checked={city.is_active}
            onCheckedChange={() => handleToggleActive(city.id, city.is_active)}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Villes de Livraison</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les villes et leurs frais de livraison
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher une ville..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchCities}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['Ville', 'Prix Livraison', 'Statut'].join(','),
                  ...filteredCities.map(c => [
                    c.city_name,
                    c.shipping_price,
                    c.is_active ? 'Actif' : 'Inactif'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `villes-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                Exporter
              </Button>
              <Button size="sm" className="gap-2" onClick={() => {
                setSelectedCity(null);
                setModalOpen(true);
              }}>
                <Plus className="h-4 w-4" />
                Nouvelle Ville
              </Button>
            </>
          }
        />

        {/* Cities Table */}
        <DataTable
          data={filteredCities}
          columns={columns}
          loading={loading}
          emptyMessage="Aucune ville trouvée"
        />

        {/* Shipping City Form Modal */}
        <ShippingCityFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          city={selectedCity}
          onSuccess={fetchCities}
        />
      </div>
    </AdminLayoutV2>
  );
}
