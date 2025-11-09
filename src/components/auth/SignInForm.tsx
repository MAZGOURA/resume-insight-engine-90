import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SignInFormProps {
  onSuccess: () => void;
}

export const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const { t } = useTranslation();
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSignInSchema = () =>
    z.object({
      email: z.string().email(t("Please enter a valid email address")),
      password: z.string().min(6, t("Password must be at least 6 characters")),
    });

  const signInSchema = createSignInSchema();

  type SignInFormData = z.infer<typeof signInSchema>;

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signIn(data.email, data.password);
      if (result.success) {
        // Don't call onSuccess here - the redirect happens in signIn
        // onSuccess();
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("Enter your email")}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Mot de passe")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Enter your password")}
                    {...field}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Signing In...")}
            </>
          ) : (
            <span>{t("AuthSignInButton")}</span>
          )}
        </Button>
      </form>
    </Form>
  );
};
