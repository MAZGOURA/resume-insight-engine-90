// Test component to verify service role key is working
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminTest = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testAdminAccess = async () => {
    setIsLoading(true);
    setTestResult("Testing admin access...");

    try {
      // Test inserting a product
      const testProduct = {
        name: "Test Product",
        description: "Test product for RLS verification",
        price: 99.99,
        is_active: true,
        slug: "test-product",
      };

      console.log("Using adminSupabase client:", adminSupabase);
      console.log("Attempting to insert test product...");

      const { data, error } = await adminSupabase
        .from("products")
        .insert([testProduct])
        .select();

      if (error) {
        console.error("Insert error:", error);
        setTestResult(`Insert Error: ${error.message}`);
      } else {
        console.log("Insert success:", data);
        setTestResult(`Success! Inserted product with ID: ${data[0]?.id}`);

        // Clean up - delete the test product
        if (data && data[0]?.id) {
          await adminSupabase.from("products").delete().eq("id", data[0].id);
        }
      }
    } catch (error) {
      console.error("Exception:", error);
      setTestResult(`Exception: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSelectAccess = async () => {
    setIsLoading(true);
    setTestResult("Testing select access...");

    try {
      // Test selecting products
      const { data, error } = await adminSupabase
        .from("products")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Select error:", error);
        setTestResult(`Select Error: ${error.message}`);
      } else {
        console.log("Select success:", data);
        setTestResult(`Success! Retrieved ${data?.length || 0} products`);
      }
    } catch (error) {
      console.error("Exception:", error);
      setTestResult(`Exception: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Current SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL}</p>
            <p>
              Service role key present:{" "}
              {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? "Yes" : "No"}
            </p>
            <div className="flex gap-2">
              <Button onClick={testSelectAccess} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Select Access"}
              </Button>
              <Button
                onClick={testAdminAccess}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? "Testing..." : "Test Insert Access"}
              </Button>
            </div>
            <div className="p-4 bg-muted rounded">
              <p>Test Result: {testResult}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTest;
