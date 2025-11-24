import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { MetricCard } from "@/components/admin/v2/MetricCard";
import { ActivityTimeline } from "@/components/admin/v2/ActivityTimeline";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DashboardV2() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<Array<{ name: string; value: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; ventes: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Real-time updates
    const ordersChannel = supabase
      .channel("dashboard_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Fetch popular products from order_items
      const { data: orderItemsData } = await supabase
        .from("order_items")
        .select(`
          product_id,
          quantity,
          products (
            name
          )
        `);

      // Calculate product sales
      const productSales: Record<string, number> = {};
      orderItemsData?.forEach((item) => {
        const productName = (item.products as any)?.name || 'Produit inconnu';
        productSales[productName] = (productSales[productName] || 0) + item.quantity;
      });

      // Get top 5 products
      const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, ventes]) => ({ name, ventes }));

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const ordersCount = orders?.length || 0;
      
      // Calculate previous period for trends
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo) || [];
      const previousOrders = orders?.filter(o => new Date(o.created_at) < thirtyDaysAgo) || [];
      
      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      const revenueTrend = previousRevenue > 0 
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      setMetrics({
        revenue: totalRevenue,
        orders: ordersCount,
        customers: customersCount || 0,
        products: productsCount || 0,
      });

      // Store top products in state
      setTopProducts(topProducts);

      // Create recent activities from real orders
      const recentActivities = orders?.slice(0, 8).map((order) => ({
        id: order.order_number,
        type: "order" as const,
        title: `Commande #${order.order_number}`,
        description: `Montant: ${order.total_amount?.toFixed(2) || 0} MAD`,
        timestamp: order.created_at,
        status: order.status,
      })) || [];

      setRecentActivities(recentActivities);

      // Calculate last 7 days revenue with actual order data
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        // Calculate revenue for this day from orders
        const dayRevenue = orders?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= date && orderDate < nextDay;
        }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        
        last7Days.push({
          name: dayName,
          value: dayRevenue
        });
      }
      
      setRevenueData(last7Days);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutV2>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayoutV2>
    );
  }

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de votre boutique
            </p>
          </div>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Voir Rapport
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenus Total"
            value={`${metrics.revenue.toFixed(2)} MAD`}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <MetricCard
            title="Commandes"
            value={metrics.orders}
            icon={ShoppingBag}
            trend={{ value: 8.2, isPositive: true }}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Clients"
            value={metrics.customers}
            icon={Users}
            trend={{ value: 5.1, isPositive: true }}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <MetricCard
            title="Produits"
            value={metrics.products}
            icon={Package}
            trend={{ value: 2.3, isPositive: true }}
            colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenus (7 jours)</h3>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Products */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Produits Populaires</h3>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topProducts.length > 0 ? topProducts : [
                  { name: "Aucune vente", ventes: 0 }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline activities={recentActivities} />
      </div>
    </AdminLayoutV2>
  );
}
