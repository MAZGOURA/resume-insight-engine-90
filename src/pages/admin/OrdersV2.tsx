import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { DataTable } from "@/components/admin/v2/DataTable";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { OrderDetailsModal } from "@/components/admin/v2/OrderDetailsModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrdersV2() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordersData) {
        setOrders([]);
        return;
      }

      // Fetch order items separately
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*");

      // Combine orders with their items
      const ordersWithItems = ordersData.map(order => ({
        ...order,
        order_items: itemsData?.filter(item => item.order_id === order.id) || []
      }));

      setOrders(ordersWithItems);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Erreur lors du chargement des commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (order.shipping_address as any)?.first_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (order.shipping_address as any)?.last_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "En attente",
      processing: "En cours",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return <Badge variant={variants[status]}>{labels[status] || status}</Badge>;
  };

  const columns = [
    {
      header: "N° Commande",
      accessor: "order_number" as const,
      cell: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      ),
    },
    {
      header: "Client",
      accessor: (order: any) => {
        const addr = order.shipping_address as any;
        return `${addr.first_name} ${addr.last_name}`;
      },
    },
    {
      header: "Date",
      accessor: "created_at" as const,
      cell: (value: string) =>
        format(new Date(value), "d MMM yyyy", { locale: fr }),
    },
    {
      header: "Total",
      accessor: "total_amount" as const,
      cell: (value: number) => <span className="font-semibold">{value} MAD</span>,
    },
    {
      header: "Statut",
      accessor: "status" as const,
      cell: (value: string) => getStatusBadge(value),
    },
  ];

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez toutes les commandes de votre boutique
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par n° commande ou client..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['N° Commande', 'Client', 'Date', 'Total', 'Statut'].join(','),
                  ...filteredOrders.map(o => [
                    o.order_number,
                    `${(o.shipping_address as any)?.first_name} ${(o.shipping_address as any)?.last_name}`,
                    format(new Date(o.created_at), 'dd/MM/yyyy'),
                    o.total_amount,
                    o.status
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `commandes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </>
          }
          filters={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Orders Table */}
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          emptyMessage="Aucune commande trouvée"
          onRowClick={setSelectedOrder}
        />

        {/* Order Details Modal */}
        <OrderDetailsModal
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      </div>
    </AdminLayoutV2>
  );
}
