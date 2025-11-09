import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export default function Profile() {
  const { admin, updateProfile } = useAdminAuth();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize form fields when admin data is available
  useEffect(() => {
    if (admin) {
      setName(admin.email?.split("@")[0] || "");
      setEmail(admin.email || "");
    }
  }, [admin]);

  // Simple email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error(t("Veuillez entrer une adresse email valide"));
      setLoading(false);
      return;
    }

    // For now, we only update the email since Supabase auth only allows email updates
    // The name is derived from the email
    if (email !== admin?.email) {
      const result = await updateProfile({ email });
      if (result.success) {
        toast.success(
          t(
            "Un email de confirmation a été envoyé à votre nouvelle adresse. Veuillez vérifier votre boîte de réception et confirmer le changement."
          )
        );
      } else {
        toast.error(
          result.error || t("Erreur lors de la mise à jour du profil")
        );
      }
    } else {
      toast.info(t("Aucune modification nécessaire"));
    }

    setLoading(false);
  };

  return (
    <AdminLayout
      title={t("Profil administrateur")}
      subtitle={t("Gérez les informations de votre profil")}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("Profil administrateur")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("Nom")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                {t(
                  "Le nom est dérivé de votre email et ne peut pas être modifié directement"
                )}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("Email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t("Mise à jour...") : t("Mettre à jour le profil")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
