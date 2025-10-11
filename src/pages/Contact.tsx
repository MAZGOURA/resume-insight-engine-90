import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  contactService,
  ContactFormData,
} from "@/integrations/supabase/services/contactService";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contactData: ContactFormData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      const result = await contactService.submitContactForm(contactData);

      if (result.success) {
        toast({
          title: "Message Sent",
          description:
            "Thank you for your message. We'll get back to you soon.",
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Mail className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-300 font-medium text-sm">
                {t("contact.getInTouch")}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
              {t("contact.title")}
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-serif text-3xl font-bold mb-8">
                {t("contact.contactInfo")}
              </h2>

              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Phone className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold mb-1">
                          {t("contact.callTitle")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("contact.callNumber")}
                          <br />
                          {t("contact.callHours1")}
                          <br />
                          {t("contact.callHours2")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Mail className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold mb-1">
                          {t("contact.emailTitle")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("contact.email1")}
                          <br />
                          {t("contact.email2")}
                          <br />
                          {t("contact.emailResponse")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Clock className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold mb-1">
                          {t("contact.hoursTitle")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("contact.hoursWeekdays")}
                          <br />
                          {t("contact.hoursSaturday")}
                          <br />
                          {t("contact.hoursSunday")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-serif text-3xl font-bold mb-8">
                {t("contact.messageTitle")}
              </h2>

              <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">
                          {t("contact.firstName")}
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder={t("contact.firstNamePlaceholder")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          {t("contact.lastName")}
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder={t("contact.lastName")}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">{t("contact.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">{t("contact.subject")}</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={t("contact.subject")}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">{t("contact.message")}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t("contact.message")}
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : t("contact.sendMessage")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                <h3 className="font-serif text-xl font-bold mb-3">
                  {t("contact.urgentTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("contact.urgentText")}{" "}
                  <span className="font-medium text-indigo-600">
                    {t("contact.callNumber")}
                  </span>
                </p>
                <Button
                  variant="outline"
                  className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                >
                  {t("contact.callNow")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
