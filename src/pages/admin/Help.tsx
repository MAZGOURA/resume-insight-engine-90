import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Help() {
  const { t } = useTranslation();

  const helpItems = [
    {
      title: t("Gestion des commandes"),
      content: t(
        "Pour gérer les commandes, allez dans la section Commandes dans le menu de navigation. Vous pouvez voir toutes les commandes, les filtrer par statut et mettre à jour leur statut."
      ),
    },
    {
      title: t("Gestion des produits"),
      content: t(
        "Dans la section Produits, vous pouvez ajouter de nouveaux produits, modifier les informations existantes et gérer les stocks."
      ),
    },
    {
      title: t("Gestion des clients"),
      content: t(
        "La section Clients vous permet de voir tous les clients enregistrés, leurs commandes et leurs informations de contact."
      ),
    },
    {
      title: t("Configuration"),
      content: t(
        "Dans la section Configuration, vous pouvez gérer les paramètres de livraison et les taxes."
      ),
    },
  ];

  return (
    <AdminLayout
      title={t("Centre d'aide")}
      subtitle={t("Trouvez des réponses aux questions fréquentes")}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("Centre d'aide")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {helpItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.content}</p>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">{t("Support")}</h3>
              <p className="text-muted-foreground">
                {t(
                  "Pour obtenir de l'aide supplémentaire, contactez l'équipe de support à"
                )}{" "}
                <a
                  href="mailto:support@essenceexpress.com"
                  className="text-primary hover:underline"
                >
                  support@essenceexpress.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
