import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

const Categories = () => {
  return (
    <AdminLayout
      title="Gestion des Catégories"
      subtitle="Gérer les catégories de produits pour le filtrage"
    >
      <CategoryManagement />
    </AdminLayout>
  );
};

export default Categories;
