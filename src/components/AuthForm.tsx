import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthFormProps {
  type: "login" | "signup";
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } =
      {};

    if (type === "signup" && !fullName) {
      newErrors.fullName = t("auth.fullNameRequired");
    }

    if (!email) {
      newErrors.email = t("auth.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
    }

    if (!password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.passwordMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (type === "login") {
        const { error } = await signIn(email, password);
        if (!error) {
          // Fixed: Redirect to correct account route
          navigate("/account");
        } else {
          // Handle specific error cases
          let errorMessage = t("auth.signInFailed");
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = t("auth.invalidCredentials");
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = t("auth.checkEmail");
          }

          toast({
            title: t("auth.signInFailed"),
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (!error) {
          // Redirect to login page after successful signup
          navigate("/login");
        } else {
          // Handle specific error cases
          let errorMessage = t("auth.signUpFailed");
          if (error.message.includes("already registered")) {
            errorMessage = t("auth.emailInUse");
          } else if (error.message.includes("weak password")) {
            errorMessage = t("auth.weakPassword");
          }

          toast({
            title: t("auth.signUpFailed"),
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      const errorMessage =
        type === "login" ? t("auth.signInFailed") : t("auth.signUpFailed");
      toast({
        title: errorMessage,
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center">
            <User className="h-4 w-4 mr-2 text-indigo-400" />
            {t("auth.fullName")}
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder={t("auth.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            className={errors.fullName ? "border-red-500" : ""}
            required={type === "signup"}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>
      )}

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
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          className={errors.email ? "border-red-500" : ""}
          required
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center">
          <Lock className="h-4 w-4 mr-2 text-indigo-400" />
          {t("auth.password")}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          className={errors.password ? "border-red-500" : ""}
          required
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        disabled={loading}
      >
        {loading
          ? type === "login"
            ? t("auth.signingIn")
            : t("auth.signingUp")
          : type === "login"
          ? t("auth.signIn")
          : t("auth.signUp")}
      </Button>
    </form>
  );
};
