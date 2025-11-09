import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { AnalyticsProvider, trackPerformance } from "./components/Analytics";
import { SkipToMainContent } from "./components/Accessibility";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { ThemeProvider } from "./components/ThemeProvider";

// Debug logging
console.log("App component loading");
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminRoute } from "./components/admin/AdminRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import UserOrders from "./pages/UserOrders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Categories from "./pages/admin/Categories";
import Collections from "./pages/admin/Collections";
import ShippingCities from "./pages/admin/ShippingCities";
import ShippingTax from "./pages/admin/ShippingTax";
import Help from "./pages/admin/Help";
import ResetPassword from "./pages/ResetPassword";

import { OrderManagement } from "./components/admin/OrderManagement";
import { ProductManagement } from "./components/admin/ProductManagement";
import { CustomerManagement } from "./components/admin/CustomerManagement";
import ContactMessages from "./pages/admin/ContactMessages";

const queryClient = new QueryClient();

// Component to conditionally render the correct navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const { admin } = useAdminAuth();

  // Don't show navbar on admin routes or admin login page
  const isAdminRoute = location.pathname.startsWith("/admin/");
  if (isAdminRoute) {
    return null;
  }

  return <Navbar />;
};

// Component to conditionally render the footer
const ConditionalFooter = () => {
  const location = useLocation();

  // Don't show footer on admin routes
  const isAdminRoute = location.pathname.startsWith("/admin/");
  if (isAdminRoute) {
    return null;
  }

  return <Footer />;
};

const AppContent = () => {
  // Debug logging
  console.log("AppContent component rendering");

  // Initialize performance tracking
  trackPerformance();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <AdminAuthProvider>
                <CartProvider>
                  <I18nextProvider i18n={i18n}>
                    <ThemeProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <AnalyticsProvider>
                          <SkipToMainContent />
                          <ConditionalNavbar />
                          <main id="main-content" className="pt-20">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route
                                path="/debug"
                                element={<div>Debug Route Working</div>}
                              />
                              <Route path="/shop" element={<Shop />} />
                              <Route
                                path="/product/:id"
                                element={<ProductDetail />}
                              />
                              {/* Removed cart route since we're using a popup */}
                              <Route path="/checkout" element={<Checkout />} />
                              <Route path="/about" element={<About />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/faq" element={<FAQ />} />
                              <Route
                                path="/admin"
                                element={
                                  <Navigate to="/admin/dashboard" replace />
                                }
                              />
                              <Route
                                path="/admin/login"
                                element={<AdminLogin />}
                              />
                              <Route
                                path="/admin/dashboard"
                                element={
                                  <AdminRoute>
                                    <AdminDashboard />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/orders"
                                element={
                                  <AdminRoute>
                                    <OrderManagement />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/products"
                                element={
                                  <AdminRoute>
                                    <ProductManagement />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/customers"
                                element={
                                  <AdminRoute>
                                    <CustomerManagement />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/categories"
                                element={
                                  <AdminRoute>
                                    <Categories />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/collections"
                                element={
                                  <AdminRoute>
                                    <Collections />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/help"
                                element={
                                  <AdminRoute>
                                    <Help />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/shipping-cities"
                                element={
                                  <AdminRoute>
                                    <ShippingCities />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/shipping-tax"
                                element={
                                  <AdminRoute>
                                    <ShippingTax />
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/admin/contact-messages"
                                element={
                                  <AdminRoute>
                                    <ContactMessages />
                                  </AdminRoute>
                                }
                              />
                              <Route path="/orders" element={<UserOrders />} />
                              <Route path="/wishlist" element={<Wishlist />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route
                                path="/reset-password"
                                element={<ResetPassword />}
                              />

                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                          <ConditionalFooter />
                        </AnalyticsProvider>
                      </BrowserRouter>
                    </ThemeProvider>
                  </I18nextProvider>
                </CartProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
