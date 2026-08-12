import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { canAccessAdmin, adminAccessHint } from '@/lib/adminAccess';
import { withTimeout, FETCH_TIMEOUT_MS } from '@/lib/utils';

const AuthContext = createContext(null);

async function fetchIsDbAdmin() {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data, error } = await withTimeout(
      supabase.rpc('is_admin'),
      FETCH_TIMEOUT_MS,
      'Admin check timed out',
    );
    return !error && data === true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isDbAdmin, setIsDbAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const failSafe = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        const admin = data.session ? await fetchIsDbAdmin() : false;
        if (!cancelled) setIsDbAdmin(admin);
        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        console.warn('[Auth] getSession failed:', err?.message);
        if (!cancelled) setLoading(false);
      })
      .finally(() => {
        window.clearTimeout(failSafe);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setIsDbAdmin(false);
        return;
      }
      fetchIsDbAdmin().then((admin) => {
        if (!cancelled) setIsDbAdmin(admin);
      });
    });
    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Add credentials to enable admin login.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const admin = await fetchIsDbAdmin();
    const signedInEmail = data.session?.user?.email;
    if (!canAccessAdmin({ email: signedInEmail, isDbAdmin: admin })) {
      await supabase.auth.signOut();
      setIsDbAdmin(false);
      throw new Error(
        adminAccessHint() || 'This account is not authorized for admin access.',
      );
    }
    setIsDbAdmin(true);
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setIsDbAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        loading,
        signIn,
        signOut,
        isDbAdmin,
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
