import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Search, Upload } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/database";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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

export const CategoryManagement = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories based on search term
    if (searchTerm) {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error(t("Failed to fetch categories"));
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory(
        formData.name,
        formData.slug,
        formData.description,
        formData.image_url,
        formData.is_active,
        formData.display_order
      );
      toast.success(t("Category created successfully"));
      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("Failed to create category");
      toast.error(errorMessage);
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image_url: formData.image_url,
        is_active: formData.is_active,
        display_order: formData.display_order,
      });
      toast.success(t("Category updated successfully"));
      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("Failed to update category");
      toast.error(errorMessage);
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !window.confirm(
        t(
          "Are you sure you want to delete this category? This action cannot be undone."
        )
      )
    )
      return;

    try {
      await deleteCategory(id);
      toast.success(t("Category deleted successfully"));
      fetchCategories();
    } catch (error) {
      toast.error(t("Failed to delete category"));
      console.error("Error deleting category:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      is_active: true,
      display_order: 0,
    });
    setEditingCategory(null);
    setImagePreview(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active,
      display_order: category.display_order,
    });
    setImagePreview(category.image_url || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      handleUpdateCategory();
    } else {
      handleCreateCategory();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("Search categories...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Category")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory
                      ? t("Edit Category")
                      : t("Create Category")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Name")} *</Label>
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
                    <Label htmlFor="slug">{t("Slug")} *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t("Description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">{t("Image")}</Label>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={triggerFileInput}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t("Upload Image")}
                      </Button>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => {
                          setFormData({ ...formData, image_url: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        placeholder={t("Or paste image URL")}
                      />
                      {imagePreview && (
                        <div className="relative w-full h-32 border rounded overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">{t("Display Order")}</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">{t("Active")}</Label>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button type="submit">
                      {editingCategory ? t("Update") : t("Create")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? t("No categories found matching your search.")
                  : t("No categories found.")}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Create your first category")}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Slug")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead className="text-center">{t("Active")}</TableHead>
                    <TableHead className="text-center">
                      {t("Display Order")}
                    </TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.description ? (
                          <div
                            className="max-w-xs truncate"
                            title={category.description}
                          >
                            {category.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("No description")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.is_active ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {t("Active")}
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {t("Inactive")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.display_order}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
