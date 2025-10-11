import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface ShippingTaxConfig {
  id: string;
  name: string;
  type: "shipping" | "tax";
  rate_type: "percentage" | "fixed";
  rate_value: number;
  min_order_amount: number | null;
  max_order_amount: number | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const AdminSettings = () => {
  const [configs, setConfigs] = useState<ShippingTaxConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<
    Partial<ShippingTaxConfig>
  >({
    name: "",
    type: "shipping",
    rate_type: "fixed",
    rate_value: 0,
    min_order_amount: 0,
    max_order_amount: null,
    is_active: true,
    description: "",
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shipping_tax_configs")
      .select("*")
      .order("type")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load configurations: " + error.message,
        variant: "destructive",
      });
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentConfig.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (isEditing && currentConfig.id) {
      result = await supabase
        .from("shipping_tax_configs")
        .update(currentConfig)
        .eq("id", currentConfig.id);
    } else {
      result = await supabase
        .from("shipping_tax_configs")
        .insert([currentConfig]);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to ${
          isEditing ? "update" : "create"
        } configuration: ${result.error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Configuration ${
          isEditing ? "updated" : "created"
        } successfully`,
      });
      resetForm();
      loadConfigs();
    }
  };

  const handleEdit = (config: ShippingTaxConfig) => {
    setCurrentConfig(config);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to delete this configuration?")
    ) {
      return;
    }

    const { error } = await supabase
      .from("shipping_tax_configs")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete configuration: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });
      loadConfigs();
    }
  };

  const resetForm = () => {
    setCurrentConfig({
      name: "",
      type: "shipping",
      rate_type: "fixed",
      rate_value: 0,
      min_order_amount: 0,
      max_order_amount: null,
      is_active: true,
      description: "",
    });
    setIsEditing(false);
  };

  const filteredConfigs = (type: "shipping" | "tax") => {
    return configs.filter((config) => config.type === type);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage shipping fees and tax rates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Configuration" : "Add New Configuration"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentConfig.name || ""}
                    onChange={(e) =>
                      setCurrentConfig({
                        ...currentConfig,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Standard Shipping, VAT"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={currentConfig.type}
                      onValueChange={(value: "shipping" | "tax") =>
                        setCurrentConfig({ ...currentConfig, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="tax">Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate_type">Rate Type</Label>
                    <Select
                      value={currentConfig.rate_type}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setCurrentConfig({ ...currentConfig, rate_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate_value">
                    Rate Value (
                    {currentConfig.rate_type === "percentage" ? "%" : "$"})
                  </Label>
                  <Input
                    id="rate_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentConfig.rate_value || 0}
                    onChange={(e) =>
                      setCurrentConfig({
                        ...currentConfig,
                        rate_value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">
                      Min Order Amount ($)
                    </Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentConfig.min_order_amount || 0}
                      onChange={(e) =>
                        setCurrentConfig({
                          ...currentConfig,
                          min_order_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_order_amount">
                      Max Order Amount ($)
                    </Label>
                    <Input
                      id="max_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentConfig.max_order_amount || ""}
                      onChange={(e) =>
                        setCurrentConfig({
                          ...currentConfig,
                          max_order_amount: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentConfig.description || ""}
                    onChange={(e) =>
                      setCurrentConfig({
                        ...currentConfig,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={currentConfig.is_active}
                    onCheckedChange={(checked) =>
                      setCurrentConfig({ ...currentConfig, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">
                    {isEditing ? "Update" : "Create"} Configuration
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Configurations List */}
          <div className="space-y-6">
            {/* Shipping Configurations */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : filteredConfigs("shipping").length === 0 ? (
                  <p className="text-muted-foreground">
                    No shipping configurations found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredConfigs("shipping").map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{config.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.rate_type === "percentage"
                              ? `${config.rate_value}%`
                              : `$${config.rate_value}`}
                            {config.min_order_amount
                              ? ` (Min: $${config.min_order_amount})`
                              : ""}
                            {config.max_order_amount
                              ? ` (Max: $${config.max_order_amount})`
                              : ""}
                          </p>
                          {config.description && (
                            <p className="text-xs mt-1">{config.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.is_active}
                            onCheckedChange={async (checked) => {
                              const { error } = await supabase
                                .from("shipping_tax_configs")
                                .update({ is_active: checked })
                                .eq("id", config.id);

                              if (error) {
                                toast({
                                  title: "Error",
                                  description:
                                    "Failed to update status: " + error.message,
                                  variant: "destructive",
                                });
                              } else {
                                loadConfigs();
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Configurations */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : filteredConfigs("tax").length === 0 ? (
                  <p className="text-muted-foreground">
                    No tax configurations found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredConfigs("tax").map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{config.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.rate_type === "percentage"
                              ? `${config.rate_value}%`
                              : `$${config.rate_value}`}
                            {config.min_order_amount
                              ? ` (Min: $${config.min_order_amount})`
                              : ""}
                            {config.max_order_amount
                              ? ` (Max: $${config.max_order_amount})`
                              : ""}
                          </p>
                          {config.description && (
                            <p className="text-xs mt-1">{config.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.is_active}
                            onCheckedChange={async (checked) => {
                              const { error } = await supabase
                                .from("shipping_tax_configs")
                                .update({ is_active: checked })
                                .eq("id", config.id);

                              if (error) {
                                toast({
                                  title: "Error",
                                  description:
                                    "Failed to update status: " + error.message,
                                  variant: "destructive",
                                });
                              } else {
                                loadConfigs();
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
