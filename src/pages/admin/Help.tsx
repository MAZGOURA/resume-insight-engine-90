import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { Card } from "@/components/ui/card";

export default function Help() {
  const helpItems = [
    {
      title: "Gestion des commandes",
      content: "Pour gérer les commandes, allez dans la section Commandes dans le menu de navigation. Vous pouvez voir toutes les commandes, les filtrer par statut et mettre à jour leur statut.",
    },
    {
      title: "Gestion des produits",
      content: "Dans la section Produits, vous pouvez ajouter de nouveaux produits, modifier les informations existantes et gérer les stocks.",
    },
    {
      title: "Gestion des clients",
      content: "La section Clients vous permet de voir tous les clients enregistrés, leurs commandes et leurs informations de contact.",
    },
    {
      title: "Configuration",
      content: "Dans la section Configuration, vous pouvez gérer les paramètres de livraison et les taxes.",
    },
  ];

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Centre d'aide</h1>
          <p className="text-muted-foreground mt-1">Documentation et support</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {helpItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.content}</p>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <p className="text-muted-foreground">
                Pour obtenir de l'aide supplémentaire, contactez l'équipe de support à{" "}
                <a
                  href="mailto:support@anasfragrances.com"
                  className="text-primary hover:underline"
                >
                  support@anasfragrances.com
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayoutV2>
  );
}
