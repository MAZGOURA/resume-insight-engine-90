import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { InventoryManagement } from "@/components/InventoryManagement";
import { getProducts } from "@/lib/database";
import { Product } from "@/lib/types";

interface StoredOrder {
  id: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  createdAt: string;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-0 px-4">
      <SEO
        title="Admin Dashboard - ANAS FRAGRANCES"
        description="Manage products and orders for ANAS FRAGRANCES."
        keywords="admin, dashboard, management, products, orders"
      />

      <div className="container mx-auto">
        {/* Removed duplicate header and navigation since it's handled by AdminNavbar */}

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-24 h-32 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-6 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className="mb-2">{product.category}</Badge>
                              <p className="text-xs text-muted-foreground uppercase">
                                {product.brand}
                              </p>
                              <h3 className="font-semibold text-lg">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                {product.description}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Stock: {product.stock_quantity || 0} units
                              </p>
                            </div>
                            <p className="text-xl font-bold">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
