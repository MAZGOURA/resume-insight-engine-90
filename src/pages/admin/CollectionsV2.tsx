import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { CollectionFormModal } from "@/components/admin/v2/CollectionFormModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CollectionsV2() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  useEffect(() => {
    fetchCollections();

    // Real-time updates
    const channel = supabase
      .channel("collections_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => fetchCollections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      // Fetch collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (collectionsError) throw collectionsError;

      // Fetch product counts for each collection
      const { data: productCounts, error: countsError } = await supabase
        .from("product_collections")
        .select("collection_id");

      if (countsError) throw countsError;

      // Add counts to collections
      const collectionsWithCounts = collectionsData?.map(collection => {
        const count = productCounts?.filter(pc => pc.collection_id === collection.id).length || 0;
        return { ...collection, productCount: count };
      });

      setCollections(collectionsWithCounts || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des collections");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("collections")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchCollections();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayoutV2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </AdminLayoutV2>
    );
  }

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">
              {collections.length} collections au total
            </p>
          </div>
          <Button className="gap-2" onClick={() => {
            setSelectedCollection(null);
            setModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Nouvelle Collection
          </Button>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher une collection..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchCollections}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['Nom', 'Description', 'Produits', 'Statut'].join(','),
                  ...filteredCollections.map(c => [
                    c.name,
                    c.description || '',
                    c.product_count || 0,
                    c.is_active ? 'Actif' : 'Inactif'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `collections-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                Exporter
              </Button>
            </>
          }
        />

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune collection trouvée</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted relative">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Pas d'image
                    </div>
                  )}
                  {!collection.is_active && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {collection.productCount || 0} produits
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={collection.is_active}
                        onCheckedChange={() =>
                          handleToggleActive(collection.id, collection.is_active)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Collection Form Modal */}
        <CollectionFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          collection={selectedCollection}
          onSuccess={fetchCollections}
        />
      </div>
    </AdminLayoutV2>
  );
}
