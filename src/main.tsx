import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./lib/i18n";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { AnalyticsProvider } from "@/components/Analytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";

console.log("React version:", React.version);
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <AdminAuthProvider>
                <ThemeProvider>
                  <I18nextProvider i18n={i18n}>
                    <TooltipProvider>
                      <CartProvider>
                        <ComparisonProvider>
                          <AnalyticsProvider>
                            <App />
                          </AnalyticsProvider>
                        </ComparisonProvider>
                      </CartProvider>
                    </TooltipProvider>
                  </I18nextProvider>
                </ThemeProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
