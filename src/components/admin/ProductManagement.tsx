import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getCollections,
  getProductCollections,
  getProductCategories,
  syncProductCollections,
  syncProductCategories,
} from "@/lib/database";
import { Product } from "@/lib/types";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  Upload,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { AdminLayout } from "./AdminLayout";

// Define Category interface
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    price: "",
    compare_price: "",
    image: "",
    category_id: "",
    description: "",
    notes: "",
    size: "",
    stock_quantity: "",
    collections: [] as string[],
    categories: [] as string[],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    loadCollections();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand &&
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load with a reasonable limit to improve performance
      const data = await getProducts(undefined, undefined, 100);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
      if (data.length > 0 && !formData.brand_id) {
        setFormData((prev) => ({ ...prev, brand_id: data[0].id }));
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
      toast.error("Failed to load brands");
    }
  };

  const loadCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Failed to load collections:", error);
      toast.error("Failed to load collections");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.brand_id ||
        !formData.description ||
        !formData.size ||
        !formData.category_id
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate numeric fields
      const price = parseFloat(formData.price);
      const stock_quantity = parseInt(formData.stock_quantity);

      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }

      if (isNaN(stock_quantity) || stock_quantity < 0) {
        toast.error("Please enter a valid stock quantity");
        return;
      }

      // Set submitting state for better UX
      setUploading(true);

      const productData: any = {
        name: formData.name,
        brand_id: formData.brand_id,
        price: price,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        image_url: formData.image,
        category_id: formData.category_id,
        description: formData.description,
        notes: formData.notes ? [formData.notes] : [],
        size: formData.size,
        stock_quantity: stock_quantity,
        is_active: true,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };

      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
        toast.success("Product updated successfully");
      } else {
        savedProduct = await createProduct(productData);
        toast.success("Product created successfully");
      }

      // Sync collections and categories using the new helper functions
      if (savedProduct) {
        await syncProductCollections(savedProduct.id, formData.collections);
        await syncProductCategories(savedProduct.id, formData.categories);
      }

      // Reset form and refresh products
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);

    // Load product collections
    let productCollectionIds: string[] = [];
    try {
      const productCollections = await getProductCollections(product.id);
      productCollectionIds = productCollections.map(
        (pc: any) => pc.collection_id
      );
    } catch (error) {
      console.error("Error loading product collections:", error);
    }

    // Load product categories
    let productCategoryIds: string[] = [];
    try {
      const productCategories = await getProductCategories(product.id);
      productCategoryIds = productCategories.map(
        (pc: any) => pc.category_id
      );
    } catch (error) {
      console.error("Error loading product categories:", error);
    }

    setFormData({
      name: product.name,
      brand_id: product.brand_id || "",
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      image: product.image_url || product.image || "",
      category_id: product.category_id || "",
      description: product.description || "",
      notes: Array.isArray(product.notes) ? product.notes.join(", ") : "",
      size: product.size || "",
      stock_quantity: product.stock_quantity?.toString() || "0",
      collections: productCollectionIds,
      categories: productCategoryIds,
    });
    setImagePreview(product.image_url || product.image || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      brand_id: brands.length > 0 ? brands[0].id : "",
      price: "",
      compare_price: "",
      image: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      description: "",
      notes: "",
      size: "",
      stock_quantity: "",
      collections: [],
      categories: [],
    });
    setImagePreview(null);
    setIsDialogOpen(false);
  };

  const getCategoryName = (slug: string) => {
    const category = categories.find((cat) => cat.slug === slug);
    return category ? category.name : slug;
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout
      title="Gestion des Produits"
      subtitle="Gérez tous les produits de votre boutique"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des produits..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct
                    ? "Modifier le produit"
                    : "Ajouter un produit"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Modifiez les détails du produit"
                    : "Ajoutez un nouveau produit à votre boutique"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nom du produit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marque *</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, brand_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (MAD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compare_price">Prix de Comparaison (MAD)</Label>
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_price}
                      onChange={(e) =>
                        setFormData({ ...formData, compare_price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Prix barré pour afficher une promotion
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Quantité en stock</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Taille *</Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) =>
                        setFormData({ ...formData, size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10ml">10ml</SelectItem>
                        <SelectItem value="20ml">20ml</SelectItem>
                        <SelectItem value="30ml">30ml</SelectItem>
                        <SelectItem value="50ml">50ml</SelectItem>
                        <SelectItem value="75ml">75ml</SelectItem>
                        <SelectItem value="100ml">100ml</SelectItem>
                        <SelectItem value="150ml">150ml</SelectItem>
                        <SelectItem value="200ml">200ml</SelectItem>
                        <SelectItem value="250ml">250ml</SelectItem>
                        <SelectItem value="300ml">300ml</SelectItem>
                        <SelectItem value="400ml">400ml</SelectItem>
                        <SelectItem value="500ml">500ml</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description détaillée du produit"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notes supplémentaires"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image du produit</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="product-image"
                      aria-label="Choisir une image pour le produit"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Téléchargement..." : "Choisir une image"}
                    </Button>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: "" });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Collections</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {collections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune collection disponible
                      </p>
                    ) : (
                      collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`collection-${collection.id}`}
                            checked={formData.collections.includes(
                              collection.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  collections: [
                                    ...formData.collections,
                                    collection.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  collections: formData.collections.filter(
                                    (id) => id !== collection.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`collection-${collection.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {collection.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catégories</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune catégorie disponible
                      </p>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={formData.categories.includes(
                              category.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  categories: [
                                    ...formData.categories,
                                    category.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter(
                                    (id) => id !== category.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : editingProduct ? (
                      "Mettre à jour"
                    ) : (
                      "Créer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 left-2"
                      variant="secondary"
                    >
                      {getCategoryName(product.category || "")}
                    </Badge>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {product.brand}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-medium">
                        {formatCurrency(product.price, "MAD")}
                      </span>
                      <Badge variant="outline">{product.size}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {indexOfFirstProduct + 1} à{" "}
                  {Math.min(indexOfLastProduct, filteredProducts.length)} sur{" "}
                  {filteredProducts.length} produits
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
