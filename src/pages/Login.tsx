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
import { useTranslation } from "react-i18next";
import { AuthForm } from "@/components/AuthForm";

const Login = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/account/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {t("auth.signIn")}
            </CardTitle>
            <CardDescription>{t("auth.signInDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm type="login" />
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm w-full">
              <span className="text-muted-foreground">
                {t("auth.noAccount")}
              </span>{" "}
              <Link to="/signup" className="text-indigo-400 hover:underline">
                {t("auth.signUp")}
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link
                to="/forgot-password"
                className="text-indigo-400 hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Login;
