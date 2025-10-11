import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AuthForm } from "@/components/AuthForm";

const Auth = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [authType, setAuthType] = useState<"login" | "signup">("login");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    // Fixed: Redirect to correct account route
    navigate("/account");
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {authType === "login" ? t("auth.signIn") : t("auth.signUp")}
            </CardTitle>
            <CardDescription>
              {authType === "login"
                ? t("auth.signInDescription")
                : t("auth.signUpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm type={authType} />
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm w-full mb-4">
              <Button
                variant="ghost"
                className="text-indigo-400 hover:text-indigo-300"
                onClick={() =>
                  setAuthType(authType === "login" ? "signup" : "login")
                }
              >
                {authType === "login"
                  ? `${t("auth.noAccount")} ${t("auth.signUp")}`
                  : `${t("auth.haveAccount")} ${t("auth.signIn")}`}
              </Button>
            </div>

            {authType === "login" && (
              <div className="text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="text-indigo-400 hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
