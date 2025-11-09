import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import { getShippingCities, type ShippingCity } from "@/lib/shipping";

// Enhanced profile schema with better email validation
const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const UserProfile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCities, setShippingCities] = useState<ShippingCity[]>([]);

  // Load shipping cities
  useEffect(() => {
    const loadShippingCities = async () => {
      const cities = await getShippingCities();
      setShippingCities(cities);
    };

    loadShippingCities();
  }, []);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user && shippingCities.length > 0) {
      const userCity = user.user_metadata?.city || "";
      
      // Check if userCity is a UUID or a city name
      const cityMatch = shippingCities.find(
        (city) => city.id === userCity || city.city_name === userCity
      );
      
      form.reset({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
        city: cityMatch?.id || "",
        zipCode: user.user_metadata?.zip_code || "",
      });
    }
  }, [user, form, shippingCities]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Only update editable fields: phone, address, city, zip_code
      const result = await updateProfile({
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip_code: data.zipCode,
      });

      if (result.success) {
        form.reset(data);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Veuillez vous connecter pour voir votre profil.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations du profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Prénom"
                          {...field}
                          disabled={true}
                          className="bg-muted"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Ne peut pas être modifié</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nom"
                          {...field}
                          disabled={true}
                          className="bg-muted"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Ne peut pas être modifié</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Entrez votre email"
                        {...field}
                        disabled={true}
                        className="bg-muted"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Ne peut pas être modifié</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Entrez votre numéro de téléphone"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez votre adresse"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une ville" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shippingCities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.city_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Postal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez votre code postal"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour du profil...
                  </>
                ) : (
                  "Mettre à jour le profil"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
