import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role),
        orders(id)
      `)
      .order('created_at', { ascending: false });
    
    setCustomers(data || []);
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Customers</h1>
        
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{customer.full_name || 'No name'}</h3>
                      {customer.user_roles?.[0]?.role === 'admin' && (
                        <Badge variant="destructive">Admin</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{customer.orders?.length || 0}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Joined: {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
