import { CollectionManagement } from "@/components/admin/CollectionManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

const Collections = () => {
  return (
    <AdminLayout
      title="Gestion des Collections"
      subtitle="Gérer les collections de produits pour le regroupement"
    >
      <CollectionManagement />
    </AdminLayout>
  );
};

export default Collections;
