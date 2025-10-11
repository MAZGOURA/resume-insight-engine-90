import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "driver";
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isDriver } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      navigate("/login");
    } else if (requiredRole === "admin" && !loading && user && !isAdmin) {
      // Redirect to home if not admin but admin access is required
      navigate("/");
    } else if (requiredRole === "driver" && !loading && user && !isDriver) {
      // Redirect to home if not driver but driver access is required
      navigate("/");
    }
  }, [user, loading, isAdmin, isDriver, navigate, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is authenticated and has the required role (if specified)
  if (user) {
    if (requiredRole === "admin" && isAdmin) {
      return <>{children}</>;
    } else if (requiredRole === "driver" && isDriver) {
      return <>{children}</>;
    } else if (!requiredRole) {
      // No specific role required, just need to be authenticated
      return <>{children}</>;
    }
  }

  // User not authenticated or doesn't have required role
  return null;
};
