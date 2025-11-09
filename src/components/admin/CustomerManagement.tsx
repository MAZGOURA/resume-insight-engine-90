import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { getOrdersByUserId } from "@/lib/database";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  X,
  User,
  MapPin,
  CreditCard,
  Package as PackageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency"; // Added import
import { AdminLayout } from "./AdminLayout";
import { useTranslation } from "react-i18next";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  full_name?: string;
  // Note: email is not directly available in profiles table for privacy reasons
  // We're using placeholder emails to maintain UI consistency while protecting user privacy
}

// Define a type for the order data returned by getOrdersByUserId
interface UserOrder {
  id: string;
  user_id: string;
  total_amount: number;
  created_at: string;
  status: string;
  shipping_address: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    zip_code?: string;
  } | null;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
  }[];
}

export const CustomerManagement = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "orders" | "spent" | "date"
  >("date");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<UserOrder[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // First, get all user IDs with 'customer' role
      const { data: customerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq('role', 'customer');

      console.log('Customer roles query result:', { customerRoles, rolesError });

      if (rolesError) {
        throw new Error(rolesError.message);
      }

      const customerIds = (customerRoles || []).map(r => r.user_id);
      console.log('Customer IDs found:', customerIds);

      if (customerIds.length === 0) {
        setCustomers([]);
        toast.info("No customers found with 'customer' role");
        return;
      }

      // Then fetch profiles for those customer IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name, email, created_at")
        .in('id', customerIds)
        .order("created_at", { ascending: false });

      console.log('Profiles query result:', { profilesData, profilesError, count: profilesData?.length });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      // Use actual first_name/last_name if available, otherwise parse full_name
      const profiles = (profilesData || []).map((p) => {
        const firstName = p.first_name || (p.full_name || "").split(" ")[0] || "Unknown";
        const lastName = p.last_name || (p.full_name || "").split(" ").slice(1).join(" ") || "User";
        
        return {
          ...p,
          first_name: firstName,
          last_name: lastName,
          email: p.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
        };
      });

      // Process profiles and fetch order data for each customer
      const customerPromises = profiles.map(async (profile) => {
        try {
          // Fetch orders for this user using the existing database function
          const userOrdersData = await getOrdersByUserId(profile.id);

          const userOrders = userOrdersData as UserOrder[];

          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce((sum, order) => {
            // Handle the order structure from getOrdersByUserId
            return sum + (order.total_amount || 0);
          }, 0);

          // Find the most recent order date
          let lastOrderDate = profile.created_at;
          if (userOrders.length > 0) {
            const orderDates = userOrders.map((order) =>
              new Date(order.created_at).getTime()
            );
            const mostRecentTimestamp = Math.max(...orderDates);
            lastOrderDate = new Date(mostRecentTimestamp).toISOString();
          }

          // Use real email from profile or fallback to placeholder
          const placeholderEmail = `${profile.first_name.toLowerCase()}.${profile.last_name.toLowerCase()}@example.com`;

          return {
            id: profile.id,
            email: profile.email || placeholderEmail,
            first_name: profile.first_name || "Unknown",
            last_name: profile.last_name || "User",
            created_at: profile.created_at,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
          };
        } catch (orderError) {
          // If there's an error fetching orders, return customer with zero orders
          const placeholderEmail = `${profile.first_name.toLowerCase()}.${profile.last_name.toLowerCase()}@example.com`;

          return {
            id: profile.id,
            email: profile.email || placeholderEmail,
            first_name: profile.first_name || "Unknown",
            last_name: profile.last_name || "User",
            created_at: profile.created_at,
            total_orders: 0,
            total_spent: 0,
            last_order_date: profile.created_at,
          };
        }
      });

      // Wait for all customer data to be fetched
      const processedCustomers = await Promise.all(customerPromises);
      setCustomers(processedCustomers);
      setCurrentPage(1); // Reset to first page when data reloads
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    console.log("Loading customer orders for ID:", customerId);
    try {
      const orders = await getOrdersByUserId(customerId);
      console.log("Orders loaded:", orders);
      setCustomerOrders(orders as UserOrder[]);
    } catch (error) {
      console.error("Failed to load customer orders:", error);
      toast.error("Failed to load customer orders");
      setCustomerOrders([]);
    }
  };

  const handleViewCustomerDetails = async (customer: Customer) => {
    console.log("View customer details clicked:", customer);
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
    // Load orders after opening the modal to provide immediate feedback
    try {
      await loadCustomerOrders(customer.id);
      console.log("Customer orders loaded successfully");
    } catch (error) {
      console.error("Error loading customer orders:", error);
    }
  };

  const closeCustomerModal = () => {
    console.log("Closing customer modal");
    setIsCustomerModalOpen(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.first_name} ${customer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        );
      case "email":
        return a.email.localeCompare(b.email);
      case "orders":
        return b.total_orders - a.total_orders;
      case "spent":
        return b.total_spent - a.total_spent;
      case "date":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = sortedCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCustomerStatus = (totalOrders: number, totalSpent: number) => {
    if (totalSpent >= 1000)
      return { label: t("VIP"), variant: "default" as const };
    if (totalSpent >= 500)
      return { label: t("Premium"), variant: "secondary" as const };
    if (totalOrders >= 5)
      return { label: t("Régulier"), variant: "outline" as const };
    if (totalOrders >= 1)
      return { label: t("Récurrent"), variant: "outline" as const };
    return { label: t("Nouveau"), variant: "outline" as const };
  };

  if (loading) {
    return (
      <AdminLayout
        title={t("Gestion des Clients")}
        subtitle={t("Gérez tous les clients de votre boutique")}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t("Chargement des clients...")}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("Gestion des Clients")}
      subtitle={t("Gérez tous les clients de votre boutique")}
    >
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t("Gestion des Clients")}</h2>
            <p className="text-muted-foreground">
              {t("Afficher et gérer vos clients")}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Total Clients")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Clients VIP")}
              </CardTitle>
              <Badge variant="default">{t("VIP")}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.total_spent >= 1000).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Nouveaux Ce Mois-ci")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  customers.filter((c) => {
                    const createdDate = new Date(c.created_at);
                    const now = new Date();
                    return (
                      createdDate.getMonth() === now.getMonth() &&
                      createdDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Valeur Moyenne Commande")}
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  customers.reduce((sum, c) => sum + c.total_spent, 0) /
                    customers.length || 0,
                  "MAD"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Rechercher des clients...")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(
              value: "name" | "email" | "orders" | "spent" | "date"
            ) => setSortBy(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("Trier par")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t("Date d'inscription")}</SelectItem>
              <SelectItem value="name">{t("Nom")}</SelectItem>
              <SelectItem value="email">{t("Email")}</SelectItem>
              <SelectItem value="orders">{t("Total Commandes")}</SelectItem>
              <SelectItem value="spent">{t("Total Dépensé")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("Clients")} ({sortedCustomers.length})
            </CardTitle>
            <CardDescription>
              {t("Gérez votre base de clients et consultez leur activité")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Client")}</TableHead>
                    <TableHead>{t("Contact")}</TableHead>
                    <TableHead>{t("Statut")}</TableHead>
                    <TableHead>{t("Commandes")}</TableHead>
                    <TableHead>{t("Total Dépensé")}</TableHead>
                    <TableHead>{t("Dernière Commande")}</TableHead>
                    <TableHead>{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer) => {
                      const status = getCustomerStatus(
                        customer.total_orders,
                        customer.total_spent
                      );
                      return (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {customer.first_name} {customer.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t("Inscrit le")}{" "}
                                {formatDate(customer.created_at)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.total_orders}</TableCell>
                          <TableCell>
                            {formatCurrency(customer.total_spent, "MAD")}
                          </TableCell>
                          <TableCell>
                            {formatDate(customer.last_order_date)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewCustomerDetails(customer)
                              }
                            >
                              {t("Voir Détails")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? t("Aucun client ne correspond à votre recherche")
                            : t("Aucun client trouvé")}
                        </p>
                        {!searchTerm && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={loadCustomers}
                          >
                            {t("Actualiser les données")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => {
                  const status = getCustomerStatus(
                    customer.total_orders,
                    customer.total_spent
                  );
                  return (
                    <Card key={customer.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {customer.first_name} {customer.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t("Inscrit le")}{" "}
                                {formatDate(customer.created_at)}
                              </div>
                            </div>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">
                                {t("Commandes")}
                              </div>
                              <div className="font-medium">
                                {customer.total_orders}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                {t("Total Dépensé")}
                              </div>
                              <div className="font-medium">
                                {formatCurrency(customer.total_spent, "MAD")}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                {t("Dernière Commande")}
                              </div>
                              <div className="font-medium">
                                {formatDate(customer.last_order_date)}
                              </div>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleViewCustomerDetails(customer)}
                          >
                            {t("Voir Détails")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? t("Aucun client ne correspond à votre recherche")
                      : t("Aucun client trouvé")}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={loadCustomers}
                    >
                      {t("Actualiser les données")}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4">
                <div className="text-sm text-muted-foreground">
                  {t("Affichage de")} {indexOfFirstCustomer + 1} {t("à")}{" "}
                  {Math.min(indexOfLastCustomer, sortedCustomers.length)}{" "}
                  {t("sur")} {sortedCustomers.length} {t("clients")}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first, last, and pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <Dialog
          open={isCustomerModalOpen}
          onOpenChange={setIsCustomerModalOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl">
                    {t("Détails du Client")}
                  </DialogTitle>
                  {selectedCustomer && (
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold">
                        {selectedCustomer.first_name}{" "}
                        {selectedCustomer.last_name}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedCustomer.email}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeCustomerModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("Total Commandes")}
                          </p>
                          <p className="text-xl font-bold">
                            {selectedCustomer.total_orders}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("Total Dépensé")}
                          </p>
                          <p className="text-xl font-bold">
                            {formatCurrency(
                              selectedCustomer.total_spent,
                              "MAD"
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("Membre Depuis")}
                          </p>
                          <p className="text-xl font-bold">
                            {formatDate(selectedCustomer.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("Dernière Commande")}
                          </p>
                          <p className="text-xl font-bold">
                            {formatDate(selectedCustomer.last_order_date)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("Statut")}</h3>
                  <Badge
                    variant={
                      getCustomerStatus(
                        selectedCustomer.total_orders,
                        selectedCustomer.total_spent
                      ).variant
                    }
                  >
                    {
                      getCustomerStatus(
                        selectedCustomer.total_orders,
                        selectedCustomer.total_spent
                      ).label
                    }
                  </Badge>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("Historique des Commandes")}
                  </h3>
                  {customerOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("ID Commande")}</TableHead>
                          <TableHead>{t("Date")}</TableHead>
                          <TableHead>{t("Statut")}</TableHead>
                          <TableHead>{t("Articles")}</TableHead>
                          <TableHead>{t("Total")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{t(order.status)}</Badge>
                            </TableCell>
                            <TableCell>
                              {order.order_items?.length || 0} {t("articles")}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.total_amount, "MAD")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-2" />
                      <p>{t("Aucune commande trouvée pour ce client")}</p>
                    </div>
                  )}
                </div>

                {/* Order Items Details */}
                {customerOrders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {t("Achats Récents")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerOrders.slice(0, 4).map((order) =>
                        order.order_items?.map((item) => (
                          <Card key={`${order.id}-${item.id}`}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {item.products?.image_url ? (
                                  <img
                                    src={
                                      item.products.image_url?.startsWith(
                                        "http"
                                      )
                                        ? item.products.image_url
                                        : `https://dhoofnyfooqpplprlbkw.supabase.co/storage/v1/object/public/product-images/${item.products.image_url}`
                                    }
                                    alt={item.products.name}
                                    className="w-16 h-16 object-cover rounded"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg";
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <PackageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {item.products?.name || t("Produit")}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t("Qté")}: {item.quantity}
                                  </p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm">
                                      {t("Qté")}: {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(
                                        item.price * item.quantity,
                                        "MAD"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
