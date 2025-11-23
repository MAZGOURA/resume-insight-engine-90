import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { ProductFormModal } from "@/components/admin/v2/ProductFormModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Grid3X3, List, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ProductsV2() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();

    // Real-time updates
    const channel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;
      
      toast.success(
        !currentStatus ? "Produit activé" : "Produit désactivé"
      );
      fetchProducts();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayoutV2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
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
            <h1 className="text-3xl font-bold">Produits</h1>
            <p className="text-muted-foreground mt-1">
              {products.length} produits au total
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              setSelectedProduct(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </Button>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un produit..."
          actions={
            <>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['Nom', 'SKU', 'Prix', 'Stock', 'Statut'].join(','),
                  ...filteredProducts.map(p => [
                    p.name,
                    p.sku || '',
                    p.price,
                    p.stock_quantity || 0,
                    p.is_active ? 'Actif' : 'Inactif'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `produits-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                Exporter
              </Button>
            </>
          }
        />

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucun produit trouvé</p>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.is_active && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="secondary">Inactif</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.categories?.name || "Sans catégorie"}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">{product.price} MAD</p>
                      {product.stock_quantity !== null && (
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock_quantity}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </AdminLayoutV2>
  );
}
