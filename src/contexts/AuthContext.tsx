import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await checkUserRoles(session.user);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await checkUserRoles(session.user);
      } else {
        setIsAdmin(false);
        setIsDriver(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRoles = async (user: User) => {
    try {
      // Check if user has admin role
      const { data: adminData, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!adminError && !!adminData);

      // Check if user is a driver using the is_driver function
      const { data: driverData, error: driverError } = await supabase.rpc(
        "is_driver",
        { _user_id: user.id }
      );

      if (!driverError && driverData) {
        setIsDriver(true);
      } else {
        // Fallback: check in delivery_drivers table directly
        const { data: driverTableData, error: driverTableError } =
          await supabase
            .from("delivery_drivers")
            .select("id")
            .eq("user_id", user.id)
            .single();

        setIsDriver(!driverTableError && !!driverTableData);
      }
    } catch (error) {
      setIsAdmin(false);
      setIsDriver(false);
    }
  };

  const refreshUser = async () => {
    if (user) {
      await checkUserRoles(user);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
        });

        // Also create user record in users table
        const userResult = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
        });

        if (profileError || userResult.error) {
          console.error(
            "Error creating user records:",
            profileError || userResult.error
          );
          toast({
            title: t("auth.signUpFailed"),
            description: t("auth.signUpFailed"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.accountCreated"),
            description: t("auth.checkEmail"),
          });
        }
      }

      return { error: null };
    } catch (error) {
      const typedError = error as Error;

      // Handle specific Supabase errors
      let errorMessage = t("auth.signUpFailed");
      if (typedError.message.includes("already registered")) {
        errorMessage = t("auth.emailInUse");
      } else if (typedError.message.includes("weak password")) {
        errorMessage = t("auth.weakPassword");
      }

      toast({
        title: t("auth.signUpFailed"),
        description: errorMessage,
        variant: "destructive",
      });
      return { error: typedError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      await checkUserRoles(data.user);

      toast({
        title: t("auth.signInSuccess"),
        description: t("auth.signInSuccess"),
      });

      return { error: null };
    } catch (error) {
      const typedError = error as Error;

      // Handle specific Supabase errors
      let errorMessage = t("auth.signInFailed");
      if (typedError.message.includes("Invalid login credentials")) {
        errorMessage = t("auth.invalidCredentials");
      } else if (typedError.message.includes("Email not confirmed")) {
        errorMessage = t("auth.checkEmail");
      }

      toast({
        title: t("auth.signInFailed"),
        description: errorMessage,
        variant: "destructive",
      });
      return { error: typedError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsDriver(false);
      toast({
        title: t("auth.signOutSuccess"),
        description: t("auth.signOutSuccess"),
      });
    } catch (error) {
      const typedError = error as Error;
      toast({
        title: t("auth.signOutFailed"),
        description: typedError.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isDriver,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
