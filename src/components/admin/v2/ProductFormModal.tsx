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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess?: () => void;
}

export const ProductFormModal = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    description: "",
    short_description: "",
    size: "",
    sku: "",
    stock_quantity: "",
    compare_price: "",
    cost_price: "",
    category_id: "",
    brand_id: "",
    image_url: "",
    featured: false,
    is_active: true,
    show_compare_price: true,
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchBrands();
      if (product) {
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          price: product.price?.toString() || "",
          description: product.description || "",
          short_description: product.short_description || "",
          size: product.size || "",
          sku: product.sku || "",
          stock_quantity: product.stock_quantity?.toString() || "",
          compare_price: product.compare_price?.toString() || "",
          cost_price: product.cost_price?.toString() || "",
          category_id: product.category_id || "",
          brand_id: product.brand_id || "",
          image_url: product.image_url || "",
          featured: product.featured || false,
          is_active: product.is_active ?? true,
          show_compare_price: product.show_compare_price ?? true,
          meta_title: product.meta_title || "",
          meta_description: product.meta_description || "",
        });
      } else {
        setFormData({
          name: "",
          slug: "",
          price: "",
          description: "",
          short_description: "",
          size: "",
          sku: "",
          stock_quantity: "",
          compare_price: "",
          cost_price: "",
          category_id: "",
          brand_id: "",
          image_url: "",
          featured: false,
          is_active: true,
          show_compare_price: true,
          meta_title: "",
          meta_description: "",
        });
      }
    }
  }, [open, product]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        description: formData.description || null,
        short_description: formData.short_description || null,
        size: formData.size || null,
        sku: formData.sku || null,
        stock_quantity: formData.stock_quantity
          ? parseInt(formData.stock_quantity)
          : null,
        compare_price: formData.compare_price
          ? parseFloat(formData.compare_price)
          : null,
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : null,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        image_url: formData.image_url || null,
        featured: formData.featured,
        is_active: formData.is_active,
        show_compare_price: formData.show_compare_price,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Produit modifié avec succès");
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
        toast.success("Produit créé avec succès");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de l'enregistrement du produit"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Modifier le produit" : "Nouveau produit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSlug}
                  disabled={!formData.name}
                >
                  Générer
                </Button>
              </div>
            </div>

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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compare_price">Prix de comparaison (MAD)</Label>
              <Input
                id="compare_price"
                type="number"
                step="0.01"
                value={formData.compare_price}
                onChange={(e) =>
                  setFormData({ ...formData, compare_price: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Catégorie</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_id">Marque</Label>
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

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Taille</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Prix de revient (MAD)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Description courte</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  short_description: e.target.value,
                })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description complète</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta titre (SEO)</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) =>
                setFormData({ ...formData, meta_title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta description (SEO)</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) =>
                setFormData({ ...formData, meta_description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Actif</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured">En vedette</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_compare_price"
                checked={formData.show_compare_price}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_compare_price: checked })
                }
              />
              <Label htmlFor="show_compare_price">
                Afficher prix de comparaison
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
