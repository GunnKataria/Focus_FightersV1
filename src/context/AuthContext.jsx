import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh, expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) console.error("Google sign-in error:", error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Extract useful fields from session
  const user = session?.user ?? null;
  const googleAvatar = user?.user_metadata?.avatar_url ?? null;
  const googleName = user?.user_metadata?.full_name ?? user?.email ?? null;

  return (
    <AuthContext.Provider
      value={{ session, user, googleAvatar, googleName, authLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}