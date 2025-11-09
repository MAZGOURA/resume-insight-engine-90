import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <div className="absolute -bottom-2 left-0 h-2 w-full bg-primary/20 blur-sm"></div>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Page Non Trouvée
        </h2>

        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Désolé, nous n'avons pas trouvé la page que vous recherchez. Elle a
          peut-être été supprimée, renommée ou n'a jamais existé.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Retour à l'Accueil
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/shop">
              <Search className="h-4 w-4" />
              Parcourir les Produits
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Button
            asChild
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Code d'erreur : 404 - {location.pathname}</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
