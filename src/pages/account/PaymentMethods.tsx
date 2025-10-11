import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Plus, Trash2, Loader2, Lock } from "lucide-react";

interface PaymentMethod {
  id: string;
  user_id: string;
  card_type: string;
  last_four_digits: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  created_at: string;
}

const AccountPaymentMethods = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, loading: authLoading } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [formData, setFormData] = useState({
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    cardholder_name: "",
  });

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // In a real app, you would fetch from the database
        // For now, we'll use mock data
        setPaymentMethods([
          {
            id: "1",
            user_id: user.id,
            card_type: "Visa",
            last_four_digits: "1234",
            expiry_month: 12,
            expiry_year: 2025,
            is_default: true,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError("Failed to load payment methods");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPaymentMethods();
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // In a real app, you would save to the database
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: editingPaymentMethod
          ? "Payment method updated successfully"
          : "Payment method added successfully",
      });

      // Reset form
      setFormData({
        card_number: "",
        expiry_month: "",
        expiry_year: "",
        cvv: "",
        cardholder_name: "",
      });
      setShowForm(false);
      setEditingPaymentMethod(null);
    } catch (err) {
      console.error("Error saving payment method:", err);
      setError("Failed to save payment method");
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      // In a real app, you would delete from the database
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });

      // Update local state
      setPaymentMethods((prev) =>
        prev.filter((pm) => pm.id !== paymentMethodId)
      );
    } catch (err) {
      console.error("Error deleting payment method:", err);
      setError("Failed to delete payment method");
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      // In a real app, you would update the database
      toast({
        title: "Success",
        description: "Default payment method updated",
      });

      // Update local state
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          is_default: pm.id === paymentMethodId,
        }))
      );
    } catch (err) {
      console.error("Error setting default payment method:", err);
      setError("Failed to set default payment method");
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      });
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
            <p>Please sign in to access your payment methods.</p>
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
            {t("checkout.paymentMethod")}
          </h1>
          <p className="text-muted-foreground">Manage your payment methods</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? "Cancel" : "Add Payment Method"}
            </Button>
          </div>

          {showForm && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {editingPaymentMethod
                    ? "Edit Payment Method"
                    : "Add New Payment Method"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="card_number">Card Number</Label>
                    <Input
                      id="card_number"
                      name="card_number"
                      value={formData.card_number}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry_month">Expiry Month</Label>
                      <Input
                        id="expiry_month"
                        name="expiry_month"
                        value={formData.expiry_month}
                        onChange={handleInputChange}
                        placeholder="MM"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry_year">Expiry Year</Label>
                      <Input
                        id="expiry_year"
                        name="expiry_year"
                        value={formData.expiry_year}
                        onChange={handleInputChange}
                        placeholder="YYYY"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardholder_name">Cardholder Name</Label>
                      <Input
                        id="cardholder_name"
                        name="cardholder_name"
                        value={formData.cardholder_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPaymentMethod(null);
                        setFormData({
                          card_number: "",
                          expiry_month: "",
                          expiry_year: "",
                          cvv: "",
                          cardholder_name: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Payment Method"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {paymentMethods.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardContent className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">
                  No Payment Methods
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't added any payment methods yet.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((paymentMethod) => (
                <Card
                  key={paymentMethod.id}
                  className={`bg-card/50 backdrop-blur-sm border-border/20 shadow-lg ${
                    paymentMethod.is_default ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CreditCard className="h-8 w-8 text-indigo-400 mr-3" />
                        <div>
                          <div className="font-medium">
                            {paymentMethod.card_type} ending in{" "}
                            {paymentMethod.last_four_digits}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Expires {paymentMethod.expiry_month}/
                            {paymentMethod.expiry_year}
                          </div>
                        </div>
                        {paymentMethod.is_default && (
                          <span className="ml-3 text-xs bg-indigo-500 text-white px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(paymentMethod.id)}
                          disabled={paymentMethod.is_default}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(paymentMethod.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountPaymentMethods;
