import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, MapPin, Loader2 } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  avatar_url?: string;
}

const AccountProfile = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, phone, created_at, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          full_name: data.full_name || "",
          email: data.email,
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
          created_at: new Date(data.created_at).toLocaleDateString(),
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (err) {
      console.error("Error updating avatar:", err);
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setUpdating(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Show success message
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to access your profile.</p>
            <Button className="mt-4">Sign In</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {t("header.profile")}
          </h1>
          <p className="text-muted-foreground">{t("contact.editProfile")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>{t("header.profile")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-indigo-400" />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="mb-4 border-indigo-400 text-indigo-400 hover:bg-indigo-500/10"
                    onClick={handleAvatarClick}
                  >
                    {t("contact.changeAvatar")}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    aria-label={t("contact.changeAvatar")}
                  />
                  <p className="text-center text-muted-foreground text-sm">
                    {t("contact.avatarInfo")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>{t("contact.personalInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-indigo-400" />
                        {t("contact.firstName")}
                      </Label>
                      <Input
                        id="name"
                        value={profile?.full_name || ""}
                        onChange={(e) =>
                          setProfile((prev) =>
                            prev ? { ...prev, full_name: e.target.value } : null
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                        {t("contact.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                        {t("contact.phone")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile?.phone || ""}
                        onChange={(e) =>
                          setProfile((prev) =>
                            prev ? { ...prev, phone: e.target.value } : null
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="joinDate" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                        {t("contact.joinDate")}
                      </Label>
                      <Input
                        id="joinDate"
                        value={profile?.created_at || ""}
                        disabled
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
                      {t("contact.address")}
                    </Label>
                    <Input
                      id="address"
                      placeholder={t("contact.addressPlaceholder")}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      disabled={updating}
                    >
                      {updating
                        ? t("contact.saving")
                        : t("contact.saveChanges")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountProfile;
