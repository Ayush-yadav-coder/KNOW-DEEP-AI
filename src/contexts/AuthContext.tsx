import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import {
  registerSecureUser,
  authenticateSecureUser,
  updateSecureUserPassword,
  saveActiveSession,
  getActiveSession,
  clearActiveSession,
  SecureUser,
} from "@/lib/secureAuth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

function toSupabaseUser(secureUser: SecureUser): User {
  return {
    id: secureUser.id,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      display_name: secureUser.displayName,
      name: secureUser.displayName,
    },
    aud: "authenticated",
    email: secureUser.email,
    created_at: secureUser.createdAt,
    last_sign_in_at: secureUser.lastLoginAt,
    role: "authenticated",
  } as unknown as User;
}

function toSupabaseSession(secureUser: SecureUser, token: string): Session {
  const user = toSupabaseUser(secureUser);
  return {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600 * 24 * 30,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
    refresh_token: token,
    user,
  } as Session;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const syncState = (nextUser: User | null, nextSession: Session | null) => {
    setUser(nextUser);
    setSession(nextSession);
    useAppStore.getState().setUser(nextUser);
    useAppStore.getState().setSession(nextSession);
    useAppStore.getState().setIsLoading(false);
    if (nextUser) {
      useAppStore.getState().setIsGuest(false);
      const name =
        nextUser.user_metadata?.display_name ||
        nextUser.user_metadata?.name ||
        nextUser.user_metadata?.full_name;
      if (name && name.trim() && name.trim().toLowerCase() !== "explorer") {
        try {
          localStorage.setItem("knowdeep_display_name", name.trim());
          localStorage.setItem("knowdeep_user_name", name.trim());
        } catch (e) {
          console.warn("Could not save display name on auth sync:", e);
        }
        useAppStore.getState().updatePreferences({ displayName: name.trim() });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. First check local secure session
    const localSession = getActiveSession();
    if (localSession) {
      const compatUser = toSupabaseUser(localSession.user);
      const compatSession = toSupabaseSession(localSession.user, localSession.token);
      if (isMounted) {
        syncState(compatUser, compatSession);
        setLoading(false);
      }
      return;
    }

    // 2. Otherwise listen to and check Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, remoteSession) => {
        if (!isMounted) return;
        if (remoteSession?.user) {
          syncState(remoteSession.user, remoteSession);
        } else if (!getActiveSession()) {
          syncState(null, null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: remoteSession } }) => {
      if (!isMounted) return;
      if (remoteSession?.user) {
        syncState(remoteSession.user, remoteSession);
      } else if (!getActiveSession()) {
        syncState(null, null);
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) {
        setLoading(false);
        useAppStore.getState().setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      // 1. Register with secure cryptographic salted hashing
      const { user: secureUser, error: regError } = await registerSecureUser(email, password, displayName);
      if (regError) {
        return { error: regError };
      }

      if (!secureUser) {
        return { error: new Error("Could not create account.") };
      }

      // Also attempt Supabase registration in background if available
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || secureUser.displayName },
          },
        });
      } catch (sbErr) {
        console.warn("Supabase background registration skipped:", sbErr);
      }

      // Save active session & log user in
      const activeSession = saveActiveSession(secureUser, true);
      const compatUser = toSupabaseUser(secureUser);
      const compatSession = toSupabaseSession(secureUser, activeSession.token);
      syncState(compatUser, compatSession);

      toast({
        title: "Account created!",
        description: `Welcome to Know Deep, ${secureUser.displayName}!`,
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe = true) => {
    try {
      // 1. Check secure local credentials store first
      const { user: secureUser, error: authError } = await authenticateSecureUser(email, password);
      if (secureUser) {
        const activeSession = saveActiveSession(secureUser, rememberMe);
        const compatUser = toSupabaseUser(secureUser);
        const compatSession = toSupabaseSession(secureUser, activeSession.token);
        syncState(compatUser, compatSession);

        toast({
          title: "Welcome back!",
          description: `Logged in as ${secureUser.displayName}`,
        });

        return { error: null };
      }

      // 2. Try Supabase Auth as secondary/remote backend
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (sbData?.session && sbData?.user) {
        syncState(sbData.user, sbData.session);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${sbData.user.email}`,
        });
        return { error: null };
      }

      if (sbError) {
        if (sbError.message.includes("Invalid login credentials") || sbError.message.includes("invalid_grant")) {
          return { error: new Error("Invalid email or password. Please try again.") };
        }
        return { error: sbError };
      }

      return { error: authError || new Error("Invalid email or password. Please try again.") };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      return { error: error as any };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (!error) {
        toast({ title: "Magic link sent", description: "Check your inbox to sign in." });
      }
      return { error: error as any };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (!error) {
        toast({ title: "Reset link sent", description: "Check your inbox for the password reset link." });
      }
      return { error: error as any };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      return { error: new Error("You must be logged in to update your password.") };
    }
    try {
      // 1. Update securely in local PBKDF2 credentials store
      const { success, error: localErr } = await updateSecureUserPassword(
        user.email,
        currentPassword,
        newPassword
      );
      if (localErr) {
        return { error: localErr };
      }

      // 2. Also update Supabase if remote user
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (sbErr) {
        console.warn("Supabase password update skipped:", sbErr);
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed securely.",
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    clearActiveSession();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out notice:", e);
    }
    syncState(null, null);
    localStorage.removeItem("guest_mode");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signInWithMagicLink, resetPassword, updatePassword, signOut }}>
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
