import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Package, MapPin, CreditCard, Clock, Printer, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import jsPDF from "jspdf";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onOrderUpdate?: () => void;
}

export const OrderDetailsModal = ({ open, onOpenChange, order, onOrderUpdate }: OrderDetailsModalProps) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const shippingAddress = order.shipping_address as any;

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Statut de la commande mis à jour");
      onOrderUpdate?.();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(false);
    }
  };

  const generateInvoicePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.text("FACTURE", pageWidth / 2, 20, { align: "center" });
      
      // Order info
      doc.setFontSize(12);
      doc.text(`Commande: ${order.order_number}`, 20, 40);
      doc.text(`Date: ${format(new Date(order.created_at), "d MMMM yyyy", { locale: fr })}`, 20, 48);
      doc.text(`Statut: ${order.status}`, 20, 56);
      
      // Customer info
      doc.setFontSize(14);
      doc.text("Client:", 20, 70);
      doc.setFontSize(11);
      doc.text(`${shippingAddress.first_name} ${shippingAddress.last_name}`, 20, 78);
      doc.text(`${shippingAddress.email}`, 20, 84);
      doc.text(`${shippingAddress.phone}`, 20, 90);
      doc.text(`${shippingAddress.address_line1}`, 20, 96);
      if (shippingAddress.address_line2) {
        doc.text(`${shippingAddress.address_line2}`, 20, 102);
      }
      doc.text(`${shippingAddress.city}, ${shippingAddress.postal_code}`, 20, 108);
      
      // Products table
      let yPos = 130;
      doc.setFontSize(14);
      doc.text("Produits:", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text("Produit", 20, yPos);
      doc.text("Qté", 120, yPos);
      doc.text("Prix", 145, yPos);
      doc.text("Total", 170, yPos);
      yPos += 8;
      
      order.order_items?.forEach((item: any) => {
        doc.text(item.product_snapshot?.name || "", 20, yPos, { maxWidth: 95 });
        doc.text(String(item.quantity), 120, yPos);
        doc.text(`${item.price} MAD`, 145, yPos);
        doc.text(`${item.total} MAD`, 170, yPos);
        yPos += 8;
      });
      
      // Summary
      yPos += 10;
      doc.setFontSize(11);
      doc.text(`Sous-total: ${order.subtotal} MAD`, 120, yPos);
      yPos += 8;
      if (order.shipping_amount > 0) {
        doc.text(`Livraison: ${order.shipping_amount} MAD`, 120, yPos);
        yPos += 8;
      }
      if (order.tax_amount > 0) {
        doc.text(`Taxes: ${order.tax_amount} MAD`, 120, yPos);
        yPos += 8;
      }
      if (order.discount_amount > 0) {
        doc.text(`Réduction: -${order.discount_amount} MAD`, 120, yPos);
        yPos += 8;
      }
      
      doc.setFontSize(14);
      doc.text(`Total: ${order.total_amount} MAD`, 120, yPos + 5);
      
      // Save
      doc.save(`facture-${order.order_number}.pdf`);
      toast.success("Facture téléchargée");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération de la facture");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Commande #{order.order_number}
            </DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={generateInvoicePDF}
              >
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Date */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Statut:</span>
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                  <SelectItem value="returned">Retournée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {format(new Date(order.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations client
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-medium">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{shippingAddress.email}</p>
              <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
              <Separator className="my-2" />
              <p className="text-sm">{shippingAddress.address_line1}</p>
              {shippingAddress.address_line2 && (
                <p className="text-sm">{shippingAddress.address_line2}</p>
              )}
              <p className="text-sm">
                {shippingAddress.city}, {shippingAddress.postal_code}
              </p>
              <p className="text-sm">{shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produits commandés
            </h3>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 bg-muted/50 p-3 rounded-lg">
                  <img
                    src={item.product_snapshot?.image_url || "/placeholder.svg"}
                    alt={item.product_snapshot?.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_snapshot?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.price} MAD</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {item.total} MAD
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Résumé du paiement
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{order.subtotal} MAD</span>
              </div>
              {order.shipping_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>{order.shipping_amount} MAD</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span>{order.tax_amount} MAD</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{order.discount_amount} MAD</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{order.total_amount} MAD</span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm font-medium">Numéro de suivi</p>
              <p className="text-lg font-mono">{order.tracking_number}</p>
              {order.carrier && (
                <p className="text-sm text-muted-foreground mt-1">
                  Transporteur: {order.carrier}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
