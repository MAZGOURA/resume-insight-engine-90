import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useTranslation } from "react-i18next";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup" | "forgot";
}

export const AuthModal = ({
  isOpen,
  onClose,
  defaultTab = "signin",
}: AuthModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">(
    defaultTab
  );

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === "signin" && t("Welcome Back")}
            {activeTab === "signup" && t("Create Account")}
            {activeTab === "forgot" && t("Reset Password")}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "signin" | "signup" | "forgot")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">{t("Sign In")}</TabsTrigger>
            <TabsTrigger value="signup">{t("Sign Up")}</TabsTrigger>
            <TabsTrigger value="forgot">{t("Forgot")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="forgot" className="space-y-4">
            <ForgotPasswordForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
