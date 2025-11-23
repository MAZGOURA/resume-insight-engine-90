import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getLowStockProducts,
  updateProductInventory,
  getProducts,
} from "@/lib/database";
import { Product } from "@/lib/types";
import { Package, AlertTriangle, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface InventoryItem extends Product {
  isLowStock?: boolean;
}

export const InventoryManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadProducts();
    loadLowStockProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error(t("Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockProducts = async () => {
    try {
      const data = await getLowStockProducts(10);
      setLowStockProducts(data);
    } catch (error) {
      console.error("Failed to load low stock products:", error);
    }
  };

  const handleEditProduct = (product: InventoryItem) => {
    setEditingProduct(product);
    setStockQuantity(product.stock_quantity);
    setIsActive(product.is_active);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingProduct) return;

    try {
      await updateProductInventory(editingProduct.id, stockQuantity, isActive);

      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? { ...product, stock_quantity: stockQuantity, is_active: isActive }
            : product
        )
      );

      toast.success(t("Inventory updated successfully"));
      setIsDialogOpen(false);
      setEditingProduct(null);
      loadLowStockProducts();
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast.error(t("Failed to update inventory"));
    }
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setStockQuantity(0);
    setIsActive(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("Inventory Management")}</h1>
        <Button onClick={loadProducts} variant="outline">
          {t("Refresh")}
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {t("Low Stock Alert")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              {t("{{count}} product", { count: lowStockProducts.length })}
              {lowStockProducts.length !== 1 ? t("s") : ""}{" "}
              {t("have low stock (≤10 units)")}
            </p>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.brand}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {t("{{count}} left", { count: product.stock_quantity })}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-orange-600">
                  {t("And {{count}} more...", {
                    count: lowStockProducts.length - 5,
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("All Products")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Product")}</TableHead>
                <TableHead>{t("Product Category")}</TableHead>
                <TableHead>{t("Product Price")}</TableHead>
                <TableHead>{t("Stock")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          product.stock_quantity <= 10
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {product.stock_quantity}
                      </span>
                      {product.stock_quantity <= 10 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Update Inventory")}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={editingProduct.image}
                  alt={editingProduct.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{editingProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {editingProduct.brand}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stockQuantity">{t("Stock Quantity")}</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">{t("Product is active")}</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveChanges} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Changes")}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  {t("Cancel")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
