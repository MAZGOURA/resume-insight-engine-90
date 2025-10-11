import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Truck } from "lucide-react";

const DriverLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, isDriver } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as driver, redirect to dashboard
  if (isDriver) {
    navigate("/driver/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (!error) {
        // Check if user is a driver
        // The AuthContext already sets isDriver based on user role
        toast({
          title: t("driver.loginSuccess"),
          description: t("driver.redirecting"),
        });
        navigate("/driver/dashboard");
      } else {
        toast({
          title: t("driver.loginFailed"),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("driver.loginFailed"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-500/10 p-3 rounded-full">
              <Truck className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("driver.driverLogin")}</CardTitle>
          <CardDescription>{t("driver.enterCredentials")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("driver.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("driver.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("driver.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("driver.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? t("driver.signingIn") : t("driver.signIn")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DriverLogin;
