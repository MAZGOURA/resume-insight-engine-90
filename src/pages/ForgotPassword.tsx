import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: t("auth.resetPassword"),
        description: t("auth.checkEmail"),
      });
    } catch (error) {
      toast({
        title: t("auth.resetPassword"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {t("auth.resetPassword")}
            </CardTitle>
            <CardDescription>
              {t("auth.resetPasswordDescription")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={emailSent}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              {emailSent ? (
                <div className="w-full text-center">
                  <p className="text-green-500 mb-4">{t("auth.checkEmail")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    {t("auth.backToSignIn")}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading
                      ? t("auth.sendResetLink")
                      : t("auth.sendResetLink")}
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    <Link
                      to="/login"
                      className="text-indigo-400 hover:underline"
                    >
                      {t("auth.backToSignIn")}
                    </Link>
                  </div>
                </>
              )}
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ForgotPassword;
