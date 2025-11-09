import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const forgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("Please enter a valid email address")),
  });

type ForgotPasswordFormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const { t } = useTranslation();
  const { resetPassword, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const result = await resetPassword(data.email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("Check your email")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("We've sent a password reset link to")} {form.getValues("email")}
          </p>
        </div>
        <Button variant="outline" onClick={onSuccess} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to Sign In")}
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-center text-sm text-gray-600 mb-4">
          {t(
            "Enter your email address and we'll send you a link to reset your password."
          )}
        </div>

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

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Sending...")}
            </>
          ) : (
            t("Send Reset Link")
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSuccess}
          className="w-full"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to Sign In")}
        </Button>
      </form>
    </Form>
  );
};
