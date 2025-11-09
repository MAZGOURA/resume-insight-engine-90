import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { AdminLayout } from "./AdminLayout";

// Helper to load a Unicode font so French accents render properly in PDF
const loadNotoSansFont = async (doc: jsPDF) => {
  const res = await fetch("/fonts/NotoSans-Regular.ttf");
  const buffer = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const docWithVFS = doc as unknown as {
    addFileToVFS: (filename: string, data: string) => void;
    addFont: (filename: string, family: string, style: string) => void;
  };
  docWithVFS.addFileToVFS("NotoSans-Regular.ttf", base64);
  docWithVFS.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans", "normal");
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

interface ShippingAddress {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  [key: string]: string | undefined;
}

interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_amount?: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | ShippingAddress | undefined; // Allow additional properties with specific types
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    image_url: string;
  };
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products!fk_order_items_product (
            name,
            image_url
          )
        `
        )
        .eq("order_id", orderId);

      if (error) throw error;
      const items = (data || []) as OrderItem[];
      setOrderItems(items);
      return items;
    } catch (error) {
      toast.error("Erreur lors du chargement des articles");
      return [] as OrderItem[];
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchOrders();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const downloadInvoice = async (order: Order, items: OrderItem[]) => {
    const doc = new jsPDF();
    await loadNotoSansFont(doc);

    // Fetch city name if city is a UUID
    let cityName = order.shipping_address?.city || "N/A";
    if (cityName && cityName.length === 36 && cityName.includes("-")) {
      // Looks like a UUID, fetch the actual city name
      try {
        const { data: cityData } = await supabase
          .from("shipping_cities")
          .select("city_name")
          .eq("id", cityName)
          .single();

        if (cityData) {
          cityName = cityData.city_name;
        }
      } catch (error) {
        console.error("Error fetching city name:", error);
      }
    }

    // Company header with background
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("FACTURE", 105, 15, { align: "center" });

    doc.setFontSize(11);
    doc.text("ANAS FRAGRANCES", 105, 23, { align: "center" });
    doc.text("Votre boutique de parfums en ligne", 105, 29, {
      align: "center",
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Invoice details box
    let yPos = 45;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, 85, 25, "F");
    doc.rect(110, yPos, 80, 25, "F");

    // Left side - Order info
    doc.setFontSize(10);
    doc.setFont("NotoSans", "bold");
    doc.text("COMMANDE", 25, yPos + 7);
    doc.setFont("NotoSans", "normal");
    doc.text(`N° ${order.id.slice(0, 8).toUpperCase()}`, 25, yPos + 13);
    doc.text(
      `Date: ${new Date(order.created_at).toLocaleDateString("fr-FR")}`,
      25,
      yPos + 19
    );

    // Client information
    yPos += 35;
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);
    doc.text("INFORMATIONS CLIENT", 20, yPos);

    yPos += 8;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    yPos += 8;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10);
    doc.text(`Nom: ${order.shipping_address?.name || "N/A"}`, 25, yPos);
    yPos += 6;
    doc.text(`Téléphone: ${order.shipping_address?.phone || "N/A"}`, 25, yPos);
    yPos += 6;
    doc.text(`Adresse: ${order.shipping_address?.address || "N/A"}`, 25, yPos);
    yPos += 6;
    doc.text(
      `Ville: ${cityName}, ${order.shipping_address?.zip_code || ""}`,
      25,
      yPos
    );

    // Items table
    yPos += 15;
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);
    doc.text("ARTICLES COMMANDÉS", 20, yPos);

    yPos += 8;
    doc.line(20, yPos, 190, yPos);

    yPos += 2;

    // Table header
    doc.setFillColor(41, 128, 185);
    doc.rect(20, yPos, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Produit", 25, yPos + 7);
    doc.text("Qté", 125, yPos + 7, { align: "center" });
    doc.text("Prix Unit.", 150, yPos + 7, { align: "center" });
    doc.text("Total", 180, yPos + 7, { align: "right" });

    doc.setTextColor(0, 0, 0);
    yPos += 12;

    // Table rows with alternating colors
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (yPos > 260) {
        doc.addPage();
        await loadNotoSansFont(doc);
        yPos = 20;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 3, 170, 8, "F");
      }

      const name = item.products?.name || "Produit";
      doc.setFont("NotoSans", "normal");
      doc.text(name.substring(0, 45), 25, yPos + 3);
      doc.text(String(item.quantity), 125, yPos + 3, { align: "center" });
      doc.text(`${Number(item.price).toFixed(2)} MAD`, 150, yPos + 3, {
        align: "center",
      });
      doc.setFont("NotoSans", "bold");
      doc.text(
        `${(Number(item.price) * item.quantity).toFixed(2)} MAD`,
        180,
        yPos + 3,
        { align: "right" }
      );
      yPos += 8;
    }

    // Totals section
    yPos += 5;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.8);
    doc.line(120, yPos, 190, yPos);

    yPos += 8;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10);
    const subtotal = order.total_amount - (order.shipping_amount || 0);
    doc.text("Sous-total:", 130, yPos);
    doc.text(`${formatCurrency(subtotal, "MAD")}`, 185, yPos, {
      align: "right",
    });

    yPos += 6;
    doc.text("Frais de livraison:", 130, yPos);
    doc.text(
      `${formatCurrency(order.shipping_amount || 0, "MAD")}`,
      185,
      yPos,
      {
        align: "right",
      }
    );

    yPos += 8;
    doc.setFillColor(41, 128, 185);
    doc.rect(120, yPos - 5, 70, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 130, yPos + 2);
    doc.text(`${formatCurrency(order.total_amount, "MAD")}`, 185, yPos + 2, {
      align: "right",
    });

    doc.setTextColor(0, 0, 0);

    // Footer
    yPos += 20;
    if (yPos > 270) {
      doc.addPage();
      await loadNotoSansFont(doc);
      yPos = 20;
    }

    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, 170, 20, "F");
    doc.setFontSize(10);
    doc.setFont("NotoSans", "normal");
    doc.text("Merci pour votre confiance!", 105, yPos + 8, { align: "center" });
    doc.setFontSize(9);
    doc.text(
      "Pour toute question, contactez-nous via notre site web",
      105,
      yPos + 14,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`facture-${order.id.slice(0, 8)}.pdf`);
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const items = await fetchOrderItems(order.id);
    setOrderItems(items);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: BadgeVariant }
    > = {
      pending: { label: "En attente", variant: "secondary" },
      processing: { label: "En cours", variant: "default" },
      shipped: { label: "Expédié", variant: "default" },
      delivered: { label: "Livré", variant: "default" },
      cancelled: { label: "Annulé", variant: "destructive" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout
      title="Gestion des Commandes"
      subtitle="Gérez toutes les commandes de votre boutique"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commandes récentes</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        {order.shipping_address?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.total_amount, "MAD")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(
                              order.id,
                              value as Order["status"]
                            )
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="shipped">Expédié</SelectItem>
                            <SelectItem value="delivered">Livré</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              fetchOrderItems(order.id).then((items) =>
                                downloadInvoice(order, items)
                              );
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Détails de la commande</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Informations de la commande
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Commande #:</strong>{" "}
                        {selectedOrder.id.slice(0, 8)}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedOrder.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(selectedOrder.total_amount, "MAD")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nom:</strong>{" "}
                        {selectedOrder.shipping_address?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Téléphone:</strong>{" "}
                        {selectedOrder.shipping_address?.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Adresse:</strong>{" "}
                        {selectedOrder.shipping_address?.address || "N/A"}
                      </p>
                      <p>
                        <strong>Ville:</strong>{" "}
                        {selectedOrder.shipping_address?.city || "N/A"}
                      </p>
                      <p>
                        <strong>Code Postal:</strong>{" "}
                        {selectedOrder.shipping_address?.zip_code || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Articles</h3>
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const imageUrl = item.products?.image_url?.startsWith(
                        "http"
                      )
                        ? item.products.image_url
                        : "/placeholder.svg";

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 border rounded-lg"
                        >
                          {item.products?.image_url && (
                            <img
                              src={imageUrl}
                              alt={item.products?.name || "Product"}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.products?.name || "Produit"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(
                                item.price * item.quantity,
                                "MAD"
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.price, "MAD")} pièce
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
