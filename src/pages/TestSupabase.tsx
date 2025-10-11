import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  success: boolean;
  data?: unknown[];
  error?: string;
}

interface TestResults {
  [key: string]: TestResult;
}

const TestSupabase = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);
      const results: TestResults = {};

      try {
        // Test 1: Categories table
        const { data: categories, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .limit(3);

        results.categories = {
          success: !categoriesError,
          data: categories,
          error: categoriesError?.message,
        };

        // Test 2: Products table
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .limit(3);

        results.products = {
          success: !productsError,
          data: products,
          error: productsError?.message,
        };

        // Test 3: Brands table
        const { data: brands, error: brandsError } = await supabase
          .from("brands")
          .select("*")
          .limit(3);

        results.brands = {
          success: !brandsError,
          data: brands,
          error: brandsError?.message,
        };
      } catch (error) {
        console.error("Test error:", error);
        results.general = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      setTestResults(results);
      setLoading(false);
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

        {loading ? (
          <p>Testing connection...</p>
        ) : (
          <div className="space-y-6">
            {testResults &&
              Object.entries(testResults).map(([key, result]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle
                      className={
                        result.success ? "text-green-500" : "text-red-500"
                      }
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)} Table Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.success ? (
                      <div>
                        <p className="text-green-500 font-medium">✅ Success</p>
                        <p>Records found: {result.data?.length || 0}</p>
                        {result.data && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-500 font-medium">❌ Failed</p>
                        <p>Error: {result.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <div className="mt-6">
          <Button onClick={() => window.location.reload()}>Re-run Tests</Button>
        </div>
      </main>
    </div>
  );
};

export default TestSupabase;
