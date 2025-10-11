import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Bell, Mail, ShoppingCart, Package, Loader2 } from "lucide-react";

const AccountNotifications = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState({
    email_notifications: true,
    order_updates: true,
    product_updates: true,
    promotional_offers: true,
    newsletter: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // In a real app, you would fetch from the database
        // For now, we'll use default settings
        setSettings({
          email_notifications: true,
          order_updates: true,
          product_updates: true,
          promotional_offers: true,
          newsletter: true,
        });
      } catch (err) {
        console.error("Error fetching notification settings:", err);
        setError("Failed to load notification settings");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading]);

  const handleToggle = async (field: string, value: boolean) => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // In a real app, you would update the database
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));

      toast({
        title: "Success",
        description: "Notification settings updated",
      });
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setError("Failed to update notification settings");
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
            <p>Please sign in to access your notification settings.</p>
            <Button className="mt-4">Sign In</Button>
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
            {t("header.notifications")}
          </h1>
          <p className="text-muted-foreground">
            Manage your notification preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-indigo-500/5">
                  <Mail className="h-5 w-5 text-indigo-400 mr-3" />
                  <span>Email Notifications</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-indigo-500/5">
                  <ShoppingCart className="h-5 w-5 text-indigo-400 mr-3" />
                  <span>Order Updates</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-indigo-500/5">
                  <Package className="h-5 w-5 text-indigo-400 mr-3" />
                  <span>Product Updates</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-indigo-500/5">
                  <Bell className="h-5 w-5 text-indigo-400 mr-3" />
                  <span>Promotional Offers</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for all activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) =>
                      handleToggle("email_notifications", checked)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                  <div>
                    <h3 className="font-medium">Order Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about your order status and shipping updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.order_updates}
                    onCheckedChange={(checked) =>
                      handleToggle("order_updates", checked)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                  <div>
                    <h3 className="font-medium">Product Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Be notified when products you're interested in are updated
                    </p>
                  </div>
                  <Switch
                    checked={settings.product_updates}
                    onCheckedChange={(checked) =>
                      handleToggle("product_updates", checked)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                  <div>
                    <h3 className="font-medium">Promotional Offers</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive special offers and discounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.promotional_offers}
                    onCheckedChange={(checked) =>
                      handleToggle("promotional_offers", checked)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                  <div>
                    <h3 className="font-medium">Newsletter</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive our monthly newsletter with industry insights
                    </p>
                  </div>
                  <Switch
                    checked={settings.newsletter}
                    onCheckedChange={(checked) =>
                      handleToggle("newsletter", checked)
                    }
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No notifications yet. Your notification history will appear
                    here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountNotifications;
