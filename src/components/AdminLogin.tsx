import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn } from "lucide-react";

interface AdminLoginProps {
  onLogin: (profile: string) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [profile, setProfile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const savedAdmin = localStorage.getItem("loggedInAdmin");
    if (savedAdmin) {
      onLogin(savedAdmin);
    }
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !password) {
      toast({
        title: "Erreur",
        description:
          "Veuillez sélectionner un profil et saisir le mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("profile", profile as any)
        .eq("password_hash", password)
        .single();

      if (error || !data) {
        toast({
          title: "Erreur de connexion",
          description: "Profil ou mot de passe incorrect.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${profile} !`,
      });

      onLogin(profile);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-light to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Connexion Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Accédez au dashboard d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Profil Administrateur</Label>
              <Select value={profile} onValueChange={setProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre profil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KENZA">KENZA</SelectItem>
                  <SelectItem value="GHIZLANE">GHIZLANE</SelectItem>
                  <SelectItem value="ABDELMONIM">ABDELMONIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border/50 focus:border-primary"
                placeholder="Saisissez votre mot de passe"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                "Connexion en cours..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
