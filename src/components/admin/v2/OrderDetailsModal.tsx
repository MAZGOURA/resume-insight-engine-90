import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Package, MapPin, CreditCard, Clock, Printer } from "lucide-react";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export const OrderDetailsModal = ({ open, onOpenChange, order }: OrderDetailsModalProps) => {
  if (!order) return null;

  const shippingAddress = order.shipping_address as any;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Commande #{order.order_number}
            </DialogTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <Badge
              variant={
                order.status === "delivered"
                  ? "default"
                  : order.status === "cancelled"
                  ? "destructive"
                  : "secondary"
              }
            >
              {order.status}
            </Badge>
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
