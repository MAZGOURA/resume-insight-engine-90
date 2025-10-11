import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Mall from "./pages/Mall";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTest from "./pages/admin/AdminTest";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminDriverAssignments from "./pages/admin/AdminDriverAssignments";
import AdminDriverPayments from "./pages/admin/AdminDriverPayments";
import AccountDashboard from "./pages/account/Dashboard";
import AccountProfile from "./pages/account/Profile";
import AccountOrders from "./pages/account/Orders";
import AccountWishlist from "./pages/account/Wishlist";
import AccountShipping from "./pages/account/Shipping";
import AccountNotifications from "./pages/account/Notifications";
import AccountPaymentMethods from "./pages/account/PaymentMethods";
import AccountSecurity from "./pages/account/Security";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import TestSupabase from "./pages/TestSupabase";
import DriverLogin from "./pages/driver/Login";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverPayments from "./pages/driver/Payments";

const queryClient = new QueryClient();

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system" // Use system theme preference
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/mall" element={<Mall />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route
                      path="/order-confirmation/:orderId"
                      element={<OrderConfirmation />}
                    />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                  </Route>

                  {/* Authentication Routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/signup" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Account Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <AccountProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <AccountOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/wishlist"
                    element={
                      <ProtectedRoute>
                        <AccountWishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/shipping"
                    element={
                      <ProtectedRoute>
                        <AccountShipping />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/notifications"
                    element={
                      <ProtectedRoute>
                        <AccountNotifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/payment-methods"
                    element={
                      <ProtectedRoute>
                        <AccountPaymentMethods />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/security"
                    element={
                      <ProtectedRoute>
                        <AccountSecurity />
                      </ProtectedRoute>
                    }
                  />

                  {/* Driver Routes */}
                  <Route path="/driver/login" element={<DriverLogin />} />
                  <Route
                    path="/driver/dashboard"
                    element={
                      <ProtectedRoute requiredRole="driver">
                        <DriverDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/driver/payments"
                    element={
                      <ProtectedRoute requiredRole="driver">
                        <DriverPayments />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminCustomers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminCategories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/drivers"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDrivers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/driver-assignments"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDriverAssignments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/driver-payments"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDriverPayments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/test"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminTest />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public routes that don't require authentication */}
                  <Route path="/test-supabase" element={<TestSupabase />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
