import { useState, useEffect } from "react";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { DataTable } from "@/components/admin/v2/DataTable";
import { FilterBar } from "@/components/admin/v2/FilterBar";
import { CustomerDetailsModal } from "@/components/admin/v2/CustomerDetailsModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";

export default function CustomersV2() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();

    // Real-time updates for both profiles and orders
    const profilesChannel = supabase
      .channel("profiles_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchCustomers()
      )
      .subscribe();

    const ordersChannel = supabase
      .channel("customer_orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      if (ordersError) throw ordersError;

      const customersWithStats = profiles?.map((customer) => {
        const userOrders = orders?.filter(o => o.user_id === customer.id) || [];
        return {
          ...customer,
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, order) => sum + order.total_amount, 0),
        };
      });

      setCustomers(customersWithStats || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des clients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Client",
      accessor: (customer: any) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={customer.avatar_url} />
            <AvatarFallback>
              {customer.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{customer.full_name || "Sans nom"}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Téléphone",
      accessor: "phone" as const,
      cell: (value: string) => value || "-",
    },
    {
      header: "Commandes",
      accessor: "totalOrders" as const,
      cell: (value: number) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      header: "Total dépensé",
      accessor: "totalSpent" as const,
      cell: (value: number) => (
        <span className="font-semibold">{value.toFixed(2)} MAD</span>
      ),
    },
    {
      header: "Inscription",
      accessor: "created_at" as const,
      cell: (value: string) =>
        format(new Date(value), "d MMM yyyy", { locale: fr }),
    },
    {
      header: "Actions",
      accessor: (customer: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCustomer(customer)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} clients enregistrés
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un client..."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={fetchCustomers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['Nom', 'Email', 'Téléphone', 'Commandes', 'Total dépensé'].join(','),
                  ...filteredCustomers.map(c => [
                    c.full_name || '',
                    c.email,
                    c.phone || '',
                    c.totalOrders || 0,
                    (c.totalSpent || 0).toFixed(2)
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                toast.success("Export réussi");
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </>
          }
        />

        {/* Customers Table */}
        <DataTable
          data={filteredCustomers}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun client trouvé"
        />

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
          customer={selectedCustomer}
        />
      </div>
    </AdminLayoutV2>
  );
}
