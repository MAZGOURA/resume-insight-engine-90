import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { insertContactMessage } from "@/lib/database";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { validateContactMessage } from "@/lib/validation";

const Contact = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // Auto-fill name and email from user profile
      const fullName =
        user.user_metadata?.first_name && user.user_metadata?.last_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user.user_metadata?.full_name || user.email?.split("@")[0] || "";

      setFormData((prev) => ({
        ...prev,
        name: fullName,
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // If user is logged in, only allow changes to subject and message
    // If not logged in, allow changes to all fields
    if (user) {
      if (name === "subject" || name === "message") {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data including bad words check
      const validation = validateContactMessage(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      if (!validation.isValid) {
        toast.error(validation.error || "Formulaire invalide");
        setIsSubmitting(false);
        return;
      }

      // Insert contact message into database
      await insertContactMessage(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      toast.success(
        "Message envoyé avec succès ! Nous vous répondrons bientôt."
      );
      
      // Reset only subject and message, keep user info if logged in
      setFormData({
        name: user ? formData.name : "",
        email: user ? formData.email : "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit contact message:", error);
      if (error instanceof Error) {
        toast.error(
          "Échec de l'envoi du message. Veuillez réessayer. Erreur: " + error.message
        );
      } else {
        toast.error("Échec de l'envoi du message. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <SEO
        title={t("Contact Us - Essence Express")}
        description={t(
          "Get in touch with Essence Express. We're here to help with any questions about our luxury perfumes and fragrances."
        )}
        keywords="contactez-nous, service client, support parfum, aide fragrance, essence express"
      />

      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t("Contact Us")}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            {t(
              "We're here to help with any questions about our luxury perfumes and fragrances"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  {t("Send us a message")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("ContactName")}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={!!user}
                      className={user ? "bg-muted" : ""}
                      required
                      placeholder={!user ? "Votre nom complet" : ""}
                    />
                    {user && (
                      <p className="text-xs text-muted-foreground">
                        Connecté en tant que {formData.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("Email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!!user}
                      className={user ? "bg-muted" : ""}
                      required
                      placeholder={!user ? "votre.email@exemple.com" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("Subject")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Objet de votre message"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("Message")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Votre message (minimum 10 caractères)"
                      maxLength={2000}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                      Tous les champs sont obligatoires et filtrés pour votre sécurité
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  {t("Get in touch")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">
                      {t("Email")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      support@essenceexpress.com
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      orders@essenceexpress.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">
                      {t("Phone")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      +212 6 12 34 56 78
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Mon-Fri, 9:00 AM - 6:00 PM (Moroccan Time)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">
                      {t("Address")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      123 Avenue Mohammed V
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Casablanca, Morocco
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">
                      {t("Business Hours")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Saturday: 10:00 AM - 4:00 PM
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Sunday: Closed
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    {t("Frequently Asked Questions")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      •{" "}
                      <Link to="/faq" className="text-primary hover:underline">
                        {t("How do I track my order?")}
                      </Link>
                    </li>
                    <li>
                      •{" "}
                      <Link to="/faq" className="text-primary hover:underline">
                        {t("What is your return policy?")}
                      </Link>
                    </li>
                    <li>
                      •{" "}
                      <Link to="/faq" className="text-primary hover:underline">
                        {t("How should I store my perfumes?")}
                      </Link>
                    </li>
                    <li>
                      •{" "}
                      <Link to="/faq" className="text-primary hover:underline">
                        {t("Are your products authentic?")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
