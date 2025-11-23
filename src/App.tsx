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
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { CompareBar } from "./components/CompareBar";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { AnalyticsProvider, trackPerformance } from "./components/Analytics";
import { SkipToMainContent } from "./components/Accessibility";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { ThemeProvider } from "./components/ThemeProvider";
import { lazy, Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Debug logging
console.log("App component loading");
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AdminLogin } from "./components/admin/AdminLogin";
const DashboardV2 = lazy(() => import("./pages/admin/DashboardV2"));
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminLayoutV2 } from "./components/admin/v2/AdminLayoutV2";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const UserOrders = lazy(() => import("./pages/UserOrders"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Collections = lazy(() => import("./pages/admin/Collections"));
const ShippingCities = lazy(() => import("./pages/admin/ShippingCities"));
const ShippingTax = lazy(() => import("./pages/admin/ShippingTax"));
const Help = lazy(() => import("./pages/admin/Help"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Compare = lazy(() => import("./pages/Compare"));

const ContactMessages = lazy(() => import("./pages/admin/ContactMessages"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-muted-foreground">Chargement...</p>
    </motion.div>
  </div>
);

// App loading screen
const AppLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold luxury-text text-primary mb-2">ANAS FRAGRANCES</h1>
        <p className="text-muted-foreground">Luxury Perfumes</p>
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"
      />
    </motion.div>
  </div>
);

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
  const [appLoading, setAppLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Initialize performance tracking
  trackPerformance();

  return (
    <>
      <SkipToMainContent />
      <AnimatePresence mode="wait">
        {appLoading ? (
          <AppLoader key="loader" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ConditionalNavbar />
            <main id="main-content" className="min-h-screen">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<UserOrders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/*"
                    element={
                  <AdminRoute>
                        <Routes>
                          <Route index element={<DashboardV2 />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="customers" element={<AdminCustomers />} />
                          <Route path="categories" element={<Categories />} />
                          <Route path="collections" element={<Collections />} />
                          <Route path="shipping-cities" element={<ShippingCities />} />
                          <Route path="shipping-tax" element={<ShippingTax />} />
                          <Route path="contact-messages" element={<ContactMessages />} />
                          <Route path="help" element={<Help />} />
                        </Routes>
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <ConditionalFooter />
            <CompareBar />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
      <Sonner />
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
