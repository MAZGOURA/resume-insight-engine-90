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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Info, Package, DollarSign, FileText, Image as ImageIcon, Search, Settings } from "lucide-react";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {product ? "Modifier le produit" : "Créer un nouveau produit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations de base */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Informations de base</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom du produit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Eau de Parfum Lavande"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Le nom qui sera affiché au client sur le site
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug (URL) <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder="eau-de-parfum-lavande"
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
                <p className="text-xs text-muted-foreground">
                  L'URL du produit - généré automatiquement depuis le nom
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Choisir la catégorie principale du produit
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Sélectionner le fabricant du produit
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Prix et inventaire */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Prix et inventaire</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Prix de vente (MAD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="299.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Prix affiché au client sur le site
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compare_price">Prix de comparaison (MAD)</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  placeholder="399.00"
                  value={formData.compare_price}
                  onChange={(e) =>
                    setFormData({ ...formData, compare_price: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Prix barré pour afficher une promotion
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_price">Prix de revient (MAD)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Coût d'achat interne (non visible publiquement)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock disponible</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  placeholder="50"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Quantité disponible en stock
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Référence)</Label>
                <Input
                  id="sku"
                  placeholder="PARFUM-LAV-100"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Référence unique du produit pour gestion interne
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Taille / Volume</Label>
                <Input
                  id="size"
                  placeholder="100ml"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Ex: 50ml, 100ml, 150ml
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Descriptions</h3>
            </div>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="short_description">Description courte</Label>
                <Textarea
                  id="short_description"
                  placeholder="Un résumé accrocheur du produit en 1-2 phrases"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Résumé visible sur les listes de produits (max 2 lignes)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description complète</Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée du produit, ses caractéristiques, ses notes de parfum..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Description détaillée visible sur la page du produit
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Image</h3>
            </div>
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                placeholder="https://exemple.com/images/produit.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Lien vers l'image principale du produit (format JPG, PNG)
              </p>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Aperçu"
                    className="h-32 w-32 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: SEO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Référencement (SEO)</h3>
            </div>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta titre</Label>
                <Input
                  id="meta_title"
                  placeholder="Eau de Parfum Lavande 100ml | ANAS FRAGRANCES"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  Titre affiché dans les résultats Google (max 60 caractères)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta description</Label>
                <Textarea
                  id="meta_description"
                  placeholder="Découvrez notre eau de parfum à la lavande, une fragrance élégante et rafraîchissante pour homme et femme."
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  Description affichée dans Google (max 160 caractères)
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Options</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active" className="font-semibold">Produit actif</Label>
                </div>
                <p className="text-xs text-muted-foreground ml-[30px]">
                  Le produit sera visible et achetable sur le site
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                  <Label htmlFor="featured" className="font-semibold">En vedette</Label>
                </div>
                <p className="text-xs text-muted-foreground ml-[30px]">
                  Afficher dans la section "Produits en vedette"
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_compare_price"
                    checked={formData.show_compare_price}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, show_compare_price: checked })
                    }
                  />
                  <Label htmlFor="show_compare_price" className="font-semibold">Montrer prix barré</Label>
                </div>
                <p className="text-xs text-muted-foreground ml-[30px]">
                  Afficher le prix de comparaison barré sur le site
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {product ? "Modifier le produit" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};