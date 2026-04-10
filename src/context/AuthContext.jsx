import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession]         = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile]         = useState(null);

  // ── Load or create profile from Supabase ─────────────────────
  const loadProfile = async (user) => {
    if (!user) { setProfile(null); return; }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No row yet — create one
        const newProfile = {
          id:           user.id,
          display_name: user.user_metadata?.full_name ?? user.email ?? "Warrior",
          avatar_emoji: "🧙",
          photo_url:    user.user_metadata?.avatar_url ?? null,
          email:        user.email ?? null,
          is_guest:     false,
        };
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          console.error("Profile insert error:", insertError);
          setProfile({ ...newProfile, xp: 0, coins: 0, level: 1, xp_to_next: 100 });
        } else {
          setProfile(created);
        }
      } else if (error) {
        console.error("Profile fetch error:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("loadProfile crashed:", err);
      setProfile(null);
    }
  };

  // ── Guest profile (localStorage only) ───────────────────────
  const loadGuestProfile = () => {
    const stored = localStorage.getItem("ff_guest_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    } else {
      const names = ["Shadow", "Blaze", "Storm", "Nova", "Vex"];
      const guest = {
        id:           "guest",
        display_name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 99),
        avatar_emoji: "🧙",
        photo_url:    null,
        email:        null,
        xp:           0,
        coins:        0,
        level:        1,
        xp_to_next:   100,
        is_guest:     true,
      };
      localStorage.setItem("ff_guest_profile", JSON.stringify(guest));
      setProfile(guest);
    }
  };

  // ── Session init + listener ──────────────────────────────────
  useEffect(() => {
    // Safety net — never stuck loading more than 6s
    const timeout = setTimeout(() => setAuthLoading(false), 6000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        // Check if guest was active
        const guest = localStorage.getItem("ff_guest_profile");
        if (guest) setProfile(JSON.parse(guest));
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setProfile(p => p?.is_guest ? p : null);
        }
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ─────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { queryParams: { access_type: "offline", prompt: "consent" } },
    });
    if (error) console.error("Google sign-in error:", error.message);
  };

  const signInAsGuest = () => {
    setSession(null);
    loadGuestProfile();
  };

  const signOut = async () => {
    if (profile?.is_guest) {
      localStorage.removeItem("ff_guest_profile");
      setProfile(null);
      setSession(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  // ── Profile update ───────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!profile) return;
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    if (profile.is_guest) {
      localStorage.setItem("ff_guest_profile", JSON.stringify(updated));
      setProfile(updated);
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();
      if (!error) setProfile(data);
      else console.error("Profile update error:", error);
    }
  };

  // ── Upload avatar image to Supabase Storage ──────────────────
  const uploadAvatar = async (file) => {
    if (!file || !profile) return null;

    const ext      = file.name.split(".").pop();
    const fileName = `${profile.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const isLoggedIn = !!session || profile?.is_guest;

  return (
    <AuthContext.Provider value={{
      session,
      authLoading,
      profile,
      isLoggedIn,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      updateProfile,
      uploadAvatar,
      // convenience shortcuts
      googleAvatar: profile?.photo_url ?? null,
      googleName:   profile?.display_name ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}