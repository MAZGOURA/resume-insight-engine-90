import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  updateProfile: (updates: {
    email?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async (user: User) => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roles) {
        setAdmin({
          id: user.id,
          email: user.email!,
          role: "admin",
        });
      } else {
        setAdmin(null);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminRole(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdminRole(session.user);
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roles) {
          await supabase.auth.signOut();
          throw new Error("Unauthorized: Admin access required");
        }

        setAdmin({
          id: data.user.id,
          email: data.user.email!,
          role: "admin",
        });
        toast.success("Successfully logged in");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to login";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    toast.success("Successfully logged out");
  };

  const updateProfile = async (updates: { email?: string }) => {
    try {
      setLoading(true);

      // Update Supabase auth user
      const { error: authError } = await supabase.auth.updateUser({
        email: updates.email,
      });

      if (authError) {
        toast.error(authError.message);
        return { success: false, error: authError.message };
      }

      // Update the users table directly
      if (updates.email && admin) {
        const { error: usersError } = await supabase
          .from("users")
          .update({
            email: updates.email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", admin.id);

        if (usersError) {
          toast.error(usersError.message);
          return { success: false, error: usersError.message };
        }

        // Update the admin state with new email
        setAdmin({
          ...admin,
          email: updates.email,
        });
      }

      // Note: Supabase will send a confirmation email to the new address
      // The user needs to confirm the email before the change is finalized
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = admin !== null && admin.role === "admin";
  const isSuperAdmin = false; // For future use if you add super admin role

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
        updateProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
