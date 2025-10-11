import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  ShoppingCart,
  Heart,
  MapPin,
  CreditCard,
  Shield,
  Bell,
  Package,
  Droplets,
  Loader2,
  LogOut,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
}

interface Profile {
  full_name: string;
  email: string;
  created_at: string;
}

const AccountDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email, created_at")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setProfile({
          full_name: profileData.full_name || "User",
          email: profileData.email,
          created_at: new Date(profileData.created_at).toLocaleDateString(),
        });

        // Fetch user orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, order_number, created_at, status, total_amount")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (ordersError) throw ordersError;

        setOrders(
          ordersData.map((order) => ({
            ...order,
            created_at: new Date(order.created_at).toLocaleDateString(),
          }))
        );
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const accountSections = [
    { icon: User, title: t("header.profile"), link: "/account/profile" },
    { icon: ShoppingCart, title: t("header.orders"), link: "/account/orders" },
    { icon: Heart, title: t("header.wishlist"), link: "/account/wishlist" },
    {
      icon: MapPin,
      title: t("checkout.shippingInfo"),
      link: "/account/addresses",
    },
    {
      icon: CreditCard,
      title: t("checkout.paymentMethod"),
      link: "/account/payment-methods",
    },
    { icon: Shield, title: "Security", link: "/account/security" },
    { icon: Bell, title: "Notifications", link: "/account/notifications" },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to access your account.</p>
            <Link to="/login">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {t("header.account")}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || "User"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-400" />
                  {t("header.profile")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mr-4">
                    <User className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {profile?.full_name || "User"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {profile?.email}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Member since {profile?.created_at}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-500/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("header.orders")}
                    </p>
                  </div>
                  <div className="bg-indigo-500/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">
                      {t("header.wishlist")}
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mb-3">
                  {t("contact.editProfile")}
                </Button>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500/10 flex items-center justify-center"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("header.signOut")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Sections */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {accountSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Link to={section.link} key={index}>
                    <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-500/30">
                      <CardContent className="p-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mr-3">
                          <Icon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <h3 className="font-medium">{section.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Recent Orders */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-indigo-400" />
                  {t("orderConfirmation.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {t("cart.noOrders")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center py-3 border-b border-border/20"
                      >
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {order.total_amount.toFixed(2)} MAD
                          </p>
                          <p className="text-sm">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                              {order.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-4 border-indigo-400 text-indigo-400 hover:bg-indigo-500/10"
                  asChild
                >
                  <Link to="/account/orders">
                    {t("orderConfirmation.viewOrders")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountDashboard;
