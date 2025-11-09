import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/database";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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

export const CollectionManagement = () => {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    // Filter collections based on search term
    if (searchTerm) {
      const filtered = collections.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          collection.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (collection.description &&
            collection.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collections);
    }
  }, [searchTerm, collections]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      toast.error(t("Failed to fetch collections"));
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      await createCollection(
        formData.name,
        formData.slug,
        formData.description,
        formData.image,
        formData.is_active,
        formData.sort_order
      );
      toast.success(t("Collection created successfully"));
      setIsDialogOpen(false);
      resetForm();
      fetchCollections();
    } catch (error) {
      toast.error(t("Failed to create collection"));
      console.error("Error creating collection:", error);
    }
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;

    try {
      await updateCollection(editingCollection.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      });
      toast.success(t("Collection updated successfully"));
      setIsDialogOpen(false);
      resetForm();
      fetchCollections();
    } catch (error) {
      toast.error(t("Failed to update collection"));
      console.error("Error updating collection:", error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (
      !window.confirm(
        t(
          "Are you sure you want to delete this collection? This action cannot be undone."
        )
      )
    )
      return;

    try {
      await deleteCollection(id);
      toast.success(t("Collection deleted successfully"));
      fetchCollections();
    } catch (error) {
      toast.error(t("Failed to delete collection"));
      console.error("Error deleting collection:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingCollection(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image: collection.image || "",
      is_active: collection.is_active,
      sort_order: collection.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection) {
      handleUpdateCollection();
    } else {
      handleCreateCollection();
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
                  placeholder={t("Rechercher collections...")}
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
                  {t("Add Collection")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCollection
                      ? t("Edit Collection")
                      : t("Create Collection")}
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
                    <Label htmlFor="image">{t("Image URL")}</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder={t("https://example.com/image.jpg")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">{t("Sort Order")}</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
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
                      {editingCollection ? t("Update") : t("Create")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? t("No collections found matching your search.")
                  : t("No collections found.")}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Create your first collection")}
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
                      {t("Sort Order")}
                    </TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        {collection.name}
                      </TableCell>
                      <TableCell>{collection.slug}</TableCell>
                      <TableCell>
                        {collection.description ? (
                          <div
                            className="max-w-xs truncate"
                            title={collection.description}
                          >
                            {collection.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("No description")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {collection.is_active ? (
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
                        {collection.sort_order}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(collection)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteCollection(collection.id)
                            }
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
