import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const PROFILE_LOAD_TIMEOUT_MS = 3000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile(userId = user?.id) {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await getProfile(userId);
    if (error) {
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  }

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      try {
        if (currentUser) {
          await withTimeout(refreshProfile(currentUser.id), PROFILE_LOAD_TIMEOUT_MS);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Unable to load profile from existing session:", error);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(true);

      try {
        if (currentUser) {
          await withTimeout(refreshProfile(currentUser.id), PROFILE_LOAD_TIMEOUT_MS);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Unable to load profile after auth change:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
