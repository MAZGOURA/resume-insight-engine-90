import { UserProfile } from "@/components/UserProfile";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Mon Profil - ANAS FRAGRANCES"
        description="Gérez vos informations de profil, adresses de livraison et paramètres de compte."
        keywords="profil, compte, paramètres, informations personnelles, adresse de livraison"
      />

<div className="container mx-auto max-w-7xl">
  <div className="flex justify-center items-center gap-4 mb-6"> {/* justify-center et items-center */}
    <h1 className="text-2xl sm:text-3xl font-bold">Mon Profil</h1>
  </div>
  <UserProfile />
</div>
    </div>
  );
};

export default Profile;
