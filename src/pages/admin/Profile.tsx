import { AdminLayoutV2 } from "@/components/admin/v2/AdminLayoutV2";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function Profile() {
  const { admin } = useAdminAuth();

  return (
    <AdminLayoutV2>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground mt-1">Informations du compte administrateur</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{admin?.email}</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayoutV2>
  );
}
