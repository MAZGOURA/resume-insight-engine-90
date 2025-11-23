import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { CategoryFormModal } from "@/components/admin/v2/CategoryFormModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CategoriesV2() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories();

    // Real-time updates
    const channel = supabase
      .channel("categories_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch product counts for each category
      const { data: productCounts, error: countsError } = await supabase
        .from("product_categories")
        .select("category_id");

      if (countsError) throw countsError;

      // Add counts to categories
      const categoriesWithCounts = categoriesData?.map(category => {
        const count = productCounts?.filter(pc => pc.category_id === category.id).length || 0;
        return { ...category, productCount: count };
      });

      setCategories(categoriesWithCounts || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des catégories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchCategories();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayoutV2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
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
            <h1 className="text-3xl font-bold">Catégories</h1>
            <p className="text-muted-foreground mt-1">
              {categories.length} catégories au total
            </p>
          </div>
          <Button className="gap-2" onClick={() => {
            setSelectedCategory(null);
            setModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Nouvelle Catégorie
          </Button>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher une catégorie..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchCategories}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['Nom', 'Description', 'Produits', 'Statut'].join(','),
                  ...filteredCategories.map(c => [
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
                a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                Exporter
              </Button>
            </>
          }
        />

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune catégorie trouvée</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Pas d'image
                    </div>
                  )}
                  {!category.is_active && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {category.productCount || 0} produits
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() =>
                          handleToggleActive(category.id, category.is_active)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Category Form Modal */}
        <CategoryFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          category={selectedCategory}
          onSuccess={fetchCategories}
        />
      </div>
    </AdminLayoutV2>
  );
}
