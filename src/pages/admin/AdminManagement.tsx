import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Tag,
  Building2,
  Ticket,
  Settings,
  Users,
  ShoppingCart,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & {
  categories?: { name: string };
  brands?: { name: string };
};

type Category = Tables<"categories">;
type Brand = Tables<"brands">;
type Coupon = Tables<"coupons">;
type ShippingTaxConfig = Tables<"shipping_tax_configs">;
type Order = Tables<"orders"> & {
  users?: { email: string } | null | ({ error: true } & string);
};
type Invoice = Tables<"invoices"> & {
  orders?: { order_number: string } | null;
};

// Define a union type for all possible table names
type TableName =
  | "products"
  | "categories"
  | "brands"
  | "coupons"
  | "shipping_tax_configs"
  | "orders"
  | "invoices"
  | "shipping-tax";

const AdminManagement = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("products");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Categories state
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  // Brands state
  const [brandList, setBrandList] = useState<Brand[]>([]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Shipping/Tax configs state
  const [shippingTaxConfigs, setShippingTaxConfigs] = useState<
    ShippingTaxConfig[]
  >([]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    | Product
    | Category
    | Brand
    | Coupon
    | ShippingTaxConfig
    | Order
    | Invoice
    | null
  >(null);
  const [currentSection, setCurrentSection] = useState<TableName>("products");

  // Form data
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean>
  >({});

  // Set the language to French for admin dashboard
  useEffect(() => {
    i18n.changeLanguage('fr');
  }, [i18n]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBrands(),
      fetchCategoryList(),
      fetchBrandList(),
      fetchCoupons(),
      fetchShippingTaxConfigs(),
      fetchOrders(),
      fetchInvoices(),
    ]);
  };

  // Products functions
  const fetchProducts = async () => {
    const { data, error } = await adminSupabase
      .from("products")
      .select("*, categories(name), brands(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await adminSupabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  };

  const fetchBrands = async () => {
    const { data, error } = await adminSupabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return;
    }

    setBrands(data || []);
  };

  // Categories functions
  const fetchCategoryList = async () => {
    const { data, error } = await adminSupabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching category list:", error);
      return;
    }

    setCategoryList(data || []);
  };

  // Brands functions
  const fetchBrandList = async () => {
    const { data, error } = await adminSupabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching brand list:", error);
      return;
    }

    setBrandList(data || []);
  };

  // Coupons functions
  const fetchCoupons = async () => {
    const { data, error } = await adminSupabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return;
    }

    setCoupons(data || []);
  };

  // Shipping/Tax configs functions
  const fetchShippingTaxConfigs = async () => {
    const { data, error } = await adminSupabase
      .from("shipping_tax_configs")
      .select("*")
      .order("type")
      .order("name");

    if (error) {
      console.error("Error fetching shipping/tax configs:", error);
      return;
    }

    setShippingTaxConfigs(data || []);
  };

  // Orders functions
  const fetchOrders = async () => {
    const { data, error } = await adminSupabase
      .from("orders")
      .select("*, users(email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    setOrders(data || []);
  };

  // Invoices functions
  const fetchInvoices = async () => {
    const { data, error } = await adminSupabase
      .from("invoices")
      .select("*, orders(order_number)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      return;
    }

    setInvoices(data || []);
  };

  // Handle form changes
  const handleFormChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setEditingItem(null);
    setFormData({});
  };

  // Handle create/edit
  const handleCreateEdit = async (
    table: TableName,
    data: Record<string, unknown>
  ) => {
    // Map "shipping-tax" to "shipping_tax_configs" for database operations
    const dbTable = table === "shipping-tax" ? "shipping_tax_configs" : table;

    console.log("Using adminSupabase for operation on table:", dbTable);
    console.log("Data to insert/update:", data);
    console.log("Admin Supabase client:", adminSupabase);

    try {
      let result;
      if (editingItem) {
        const { id, ...updateData } = data;
        // Use admin client for update operations to bypass RLS
        result = await adminSupabase
          .from(dbTable)
          .update(updateData)
          .eq("id", (editingItem as { id: string }).id);
      } else {
        // Use admin client for insert operations to bypass RLS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await adminSupabase.from(dbTable).insert(data as any);
      }

      console.log("Operation result:", result);

      if (result.error) {
        console.error("Database operation error:", result.error);
        throw result.error;
      }

      toast({
        title: editingItem ? "Updated successfully" : "Created successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("handleCreateEdit error:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (
    table: TableName,
    id: string,
    itemName: string
  ) => {
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;

    try {
      // Map "shipping-tax" to "shipping_tax_configs" for database operations
      const dbTable = table === "shipping-tax" ? "shipping_tax_configs" : table;

      // Use admin client for delete operations to bypass RLS
      const { error } = await adminSupabase.from(dbTable).delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Deleted successfully" });
      loadAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Render product form
  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={(formData.name as string) || ""}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={String(formData.price || "")}
            onChange={(e) =>
              handleFormChange("price", parseFloat(e.target.value) || 0)
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="compare_price">Compare Price</Label>
          <Input
            id="compare_price"
            type="number"
            step="0.01"
            value={String(formData.compare_price || "")}
            onChange={(e) =>
              handleFormChange("compare_price", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="cost_price">Cost Price</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            value={String(formData.cost_price || "")}
            onChange={(e) =>
              handleFormChange("cost_price", parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={formData.category_id ? formData.category_id.toString() : ""}
            onValueChange={(value) => handleFormChange("category_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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
        <div>
          <Label htmlFor="brand_id">Brand</Label>
          <Select
            value={formData.brand_id ? formData.brand_id.toString() : ""}
            onValueChange={(value) => handleFormChange("brand_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
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

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={(formData.description as string) || ""}
          onChange={(e) => handleFormChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={String(formData.stock_quantity || "")}
            onChange={(e) =>
              handleFormChange("stock_quantity", parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={(formData.sku as string) || ""}
            onChange={(e) => handleFormChange("sku", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={(formData.size as string) || "100ml"}
            onChange={(e) => handleFormChange("size", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => handleFormChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={!!formData.featured}
          onCheckedChange={(checked) => handleFormChange("featured", checked)}
        />
        <Label htmlFor="featured">Featured</Label>
      </div>
    </div>
  );

  // Render category form
  const renderCategoryForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name ? String(formData.name) : ""}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description ? String(formData.description) : ""}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug ? String(formData.slug) : ""}
              onChange={(e) => handleFormChange("slug", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={
                formData.display_order ? String(formData.display_order) : ""
              }
              onChange={(e) =>
                handleFormChange("display_order", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render brand form
  const renderBrandForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Brand Name *</Label>
        <Input
          id="name"
          value={formData.name ? String(formData.name) : ""}
          onChange={(e) => handleFormChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={(formData.description as string) || ""}
          onChange={(e) => handleFormChange("description", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          value={formData.logo_url ? String(formData.logo_url) : ""}
          onChange={(e) => handleFormChange("logo_url", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => handleFormChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );

  // Render coupon form
  const renderCouponForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code ? String(formData.code) : ""}
            onChange={(e) => handleFormChange("code", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="discount_type">Discount Type *</Label>
          <Select
            value={formData.discount_type ? String(formData.discount_type) : ""}
            onValueChange={(value) => handleFormChange("discount_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount_value">Discount Value *</Label>
          <Input
            id="discount_value"
            type="number"
            step="0.01"
            value={
              formData.discount_value ? String(formData.discount_value) : ""
            }
            onChange={(e) =>
              handleFormChange(
                "discount_value",
                parseFloat(e.target.value) || 0
              )
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
          <Input
            id="minimum_order_amount"
            type="number"
            step="0.01"
            value={
              formData.minimum_order_amount
                ? String(formData.minimum_order_amount)
                : ""
            }
            onChange={(e) =>
              handleFormChange(
                "minimum_order_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            type="number"
            value={formData.usage_limit ? String(formData.usage_limit) : ""}
            onChange={(e) =>
              handleFormChange("usage_limit", parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="maximum_discount_amount">
            Maximum Discount Amount
          </Label>
          <Input
            id="maximum_discount_amount"
            type="number"
            step="0.01"
            value={
              formData.maximum_discount_amount
                ? String(formData.maximum_discount_amount)
                : ""
            }
            onChange={(e) =>
              handleFormChange(
                "maximum_discount_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={String(formData.description || "")}
          onChange={(e) => handleFormChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valid_from">Valid From</Label>
          <Input
            id="valid_from"
            type="datetime-local"
            value={formData.valid_from ? String(formData.valid_from) : ""}
            onChange={(e) => handleFormChange("valid_from", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="valid_until">Valid Until</Label>
          <Input
            id="valid_until"
            type="datetime-local"
            value={formData.valid_until ? String(formData.valid_until) : ""}
            onChange={(e) => handleFormChange("valid_until", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => handleFormChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );

  // Render shipping/tax config form
  const renderShippingTaxForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name ? String(formData.name) : ""}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type ? String(formData.type) : ""}
            onValueChange={(value) => handleFormChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rate_type">Rate Type *</Label>
          <Select
            value={formData.rate_type ? String(formData.rate_type) : ""}
            onValueChange={(value) => handleFormChange("rate_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rate type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rate_value">Rate Value *</Label>
          <Input
            id="rate_value"
            type="number"
            step="0.01"
            value={formData.rate_value ? String(formData.rate_value) : ""}
            onChange={(e) =>
              handleFormChange("rate_value", parseFloat(e.target.value) || 0)
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_order_amount">Min Order Amount</Label>
          <Input
            id="min_order_amount"
            type="number"
            step="0.01"
            value={
              formData.min_order_amount ? String(formData.min_order_amount) : ""
            }
            onChange={(e) =>
              handleFormChange(
                "min_order_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="max_order_amount">Max Order Amount</Label>
          <Input
            id="max_order_amount"
            type="number"
            step="0.01"
            value={
              formData.max_order_amount ? String(formData.max_order_amount) : ""
            }
            onChange={(e) =>
              handleFormChange(
                "max_order_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={String(formData.description || "")}
          onChange={(e) => handleFormChange("description", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => handleFormChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );

  // Render order form
  const renderOrderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order_number">Order Number</Label>
          <Input
            id="order_number"
            value={formData.order_number ? String(formData.order_number) : ""}
            onChange={(e) => handleFormChange("order_number", e.target.value)}
            disabled={!!editingItem}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={String(formData.status || "pending")}
            onValueChange={(value) => handleFormChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select
            value={String(formData.payment_status || "pending")}
            onValueChange={(value) => handleFormChange("payment_status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment_method">Payment Method</Label>
          <Input
            id="payment_method"
            value={
              formData.payment_method ? String(formData.payment_method) : ""
            }
            onChange={(e) => handleFormChange("payment_method", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            value={String(formData.subtotal || "")}
            onChange={(e) =>
              handleFormChange("subtotal", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="tax_amount">Tax Amount</Label>
          <Input
            id="tax_amount"
            type="number"
            step="0.01"
            value={String(formData.tax_amount || "")}
            onChange={(e) =>
              handleFormChange("tax_amount", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="shipping_amount">Shipping Amount</Label>
          <Input
            id="shipping_amount"
            type="number"
            step="0.01"
            value={
              formData.shipping_amount ? String(formData.shipping_amount) : ""
            }
            onChange={(e) =>
              handleFormChange(
                "shipping_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount_amount">Discount Amount</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            value={String(formData.discount_amount || "")}
            onChange={(e) =>
              handleFormChange(
                "discount_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="total_amount">Total Amount</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            value={String(formData.total_amount || "")}
            onChange={(e) =>
              handleFormChange("total_amount", parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={String(formData.notes || "")}
          onChange={(e) => handleFormChange("notes", e.target.value)}
        />
      </div>
    </div>
  );

  // Render invoice form
  const renderInvoiceForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={
              formData.invoice_number ? String(formData.invoice_number) : ""
            }
            onChange={(e) => handleFormChange("invoice_number", e.target.value)}
            disabled={!!editingItem}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={String(formData.status || "draft")}
            onValueChange={(value) => handleFormChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="issue_date">Issue Date</Label>
          <Input
            id="issue_date"
            type="date"
            value={formData.issue_date ? String(formData.issue_date) : ""}
            onChange={(e) => handleFormChange("issue_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date ? String(formData.due_date) : ""}
            onChange={(e) => handleFormChange("due_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={formData.currency ? String(formData.currency) : "USD"}
            onChange={(e) => handleFormChange("currency", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            value={String(formData.subtotal || "")}
            onChange={(e) =>
              handleFormChange("subtotal", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="tax_amount">Tax Amount</Label>
          <Input
            id="tax_amount"
            type="number"
            step="0.01"
            value={String(formData.tax_amount || "")}
            onChange={(e) =>
              handleFormChange("tax_amount", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <Label htmlFor="discount_amount">Discount Amount</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            value={String(formData.discount_amount || "")}
            onChange={(e) =>
              handleFormChange(
                "discount_amount",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="total_amount">Total Amount</Label>
        <Input
          id="total_amount"
          type="number"
          step="0.01"
          value={String(formData.total_amount || "")}
          onChange={(e) =>
            handleFormChange("total_amount", parseFloat(e.target.value) || 0)
          }
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={String(formData.notes || "")}
          onChange={(e) => handleFormChange("notes", e.target.value)}
        />
      </div>
    </div>
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const table =
      currentSection === "shipping-tax"
        ? "shipping_tax_configs"
        : (currentSection as Exclude<TableName, "shipping-tax">);
    const data: Record<string, unknown> = { ...formData };

    switch (currentSection) {
      case "products":
        if (data.price) data.price = parseFloat(data.price as string);
        if (data.stock_quantity)
          data.stock_quantity = parseInt(data.stock_quantity as string);
        if (data.compare_price)
          data.compare_price = parseFloat(data.compare_price as string);
        if (data.cost_price)
          data.cost_price = parseFloat(data.cost_price as string);
        if (!editingItem) {
          data.slug = (data.name as string).toLowerCase().replace(/\s+/g, "-");
        }
        break;
      case "categories":
        if (data.display_order)
          data.display_order = parseInt(data.display_order as string);
        if (!editingItem && !data.slug) {
          data.slug = (data.name as string).toLowerCase().replace(/\s+/g, "-");
        }
        break;
      case "brands":
        break;
      case "coupons":
        if (data.discount_value)
          data.discount_value = parseFloat(data.discount_value as string);
        if (data.minimum_order_amount)
          data.minimum_order_amount = parseFloat(
            data.minimum_order_amount as string
          );
        if (data.maximum_discount_amount)
          data.maximum_discount_amount = parseFloat(
            data.maximum_discount_amount as string
          );
        if (data.usage_limit)
          data.usage_limit = parseInt(data.usage_limit as string);
        break;
      case "shipping-tax":
        if (data.rate_value)
          data.rate_value = parseFloat(data.rate_value as string);
        if (data.min_order_amount)
          data.min_order_amount = parseFloat(data.min_order_amount as string);
        if (data.max_order_amount)
          data.max_order_amount = parseFloat(data.max_order_amount as string);
        break;
      case "orders":
        if (data.subtotal) data.subtotal = parseFloat(data.subtotal as string);
        if (data.tax_amount)
          data.tax_amount = parseFloat(data.tax_amount as string);
        if (data.shipping_amount)
          data.shipping_amount = parseFloat(data.shipping_amount as string);
        if (data.discount_amount)
          data.discount_amount = parseFloat(data.discount_amount as string);
        if (data.total_amount)
          data.total_amount = parseFloat(data.total_amount as string);
        break;
      case "invoices":
        if (data.subtotal) data.subtotal = parseFloat(data.subtotal as string);
        if (data.tax_amount)
          data.tax_amount = parseFloat(data.tax_amount as string);
        if (data.discount_amount)
          data.discount_amount = parseFloat(data.discount_amount as string);
        if (data.total_amount)
          data.total_amount = parseFloat(data.total_amount as string);
        break;
    }

    await handleCreateEdit(table as TableName, data);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("admin.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            Manage all aspects of your e-commerce platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger
              value="shipping-tax"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Shipping & Tax
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Products</CardTitle>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentSection("products");
                          resetForm();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Product" : "Add Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderProductForm()}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            {product.categories?.name || "-"}
                          </TableCell>
                          <TableCell>{product.brands?.name || "-"}</TableCell>
                          <TableCell>
                            ${product.price?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>{product.stock_quantity || 0}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                product.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(product);
                                  setFormData({
                                    name: product.name,
                                    price: product.price,
                                    category_id: product.category_id,
                                    brand_id: product.brand_id,
                                    description: product.description || "",
                                    stock_quantity: product.stock_quantity,
                                    sku: product.sku || "",
                                    size: product.size || "100ml",
                                    is_active: product.is_active,
                                    compare_price: product.compare_price,
                                    cost_price: product.cost_price,
                                    featured: product.featured,
                                  });
                                  setCurrentSection("products");
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    "products",
                                    product.id,
                                    product.name
                                  )
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Categories</CardTitle>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentSection("categories");
                          resetForm();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Category" : "Add Category"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderCategoryForm()}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Display Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryList.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>{category.display_order || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(category);
                                  setFormData({
                                    name: category.name,
                                    description: category.description || "",
                                    display_order: category.display_order,
                                  });
                                  setCurrentSection("categories");
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    "categories",
                                    category.id,
                                    category.name
                                  )
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Brands</CardTitle>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentSection("brands");
                          resetForm();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Brand
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Brand" : "Add Brand"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderBrandForm()}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandList.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">
                            {brand.name}
                          </TableCell>
                          <TableCell>{brand.description || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(brand);
                                  setFormData({
                                    name: brand.name,
                                    description: brand.description || "",
                                  });
                                  setCurrentSection("brands");
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete("brands", brand.id, brand.name)
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Coupons</CardTitle>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentSection("coupons");
                          resetForm();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Coupon
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Coupon" : "Add Coupon"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderCouponForm()}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">
                            {coupon.code}
                          </TableCell>
                          <TableCell className="capitalize">
                            {coupon.discount_type}
                          </TableCell>
                          <TableCell>
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}%`
                              : `$${coupon.discount_value}`}
                          </TableCell>
                          <TableCell>
                            {coupon.valid_until
                              ? new Date(coupon.valid_until).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                coupon.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {coupon.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(coupon);
                                  setFormData({
                                    code: coupon.code,
                                    discount_type: coupon.discount_type,
                                    discount_value: coupon.discount_value,
                                    minimum_order_amount:
                                      coupon.minimum_order_amount,
                                    valid_from: coupon.valid_from,
                                    valid_until: coupon.valid_until,
                                    usage_limit: coupon.usage_limit,
                                    is_active: coupon.is_active,
                                  });
                                  setCurrentSection("coupons");
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete("coupons", coupon.id, coupon.code)
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping & Tax Tab */}
          <TabsContent value="shipping-tax">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Shipping & Tax Configurations</CardTitle>
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentSection("shipping-tax");
                          resetForm();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem
                            ? "Edit Configuration"
                            : "Add Configuration"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderShippingTaxForm()}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Rate/Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shippingTaxConfigs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium capitalize">
                            {config.type}
                          </TableCell>
                          <TableCell>{config.name}</TableCell>
                          <TableCell>
                            {config.type === "tax"
                              ? `${config.rate_value}%`
                              : `${config.rate_value}`}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                config.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {config.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(config);
                                  setFormData({
                                    type: config.type,
                                    name: config.name,
                                    rate_value: config.rate_value,
                                    rate_type: config.rate_type,
                                    min_order_amount: config.min_order_amount,
                                    max_order_amount: config.max_order_amount,
                                    is_active: config.is_active,
                                  });
                                  setCurrentSection("shipping-tax");
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    "shipping-tax",
                                    config.id,
                                    config.name
                                  )
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            {typeof order.users === "object" &&
                            order.users &&
                            "email" in order.users
                              ? order.users.email
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            {invoice.orders?.order_number || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            ${invoice.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Download PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminManagement;
