import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { track } from '../Analytics';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const provider = user.app_metadata.provider;
        const createdAt = new Date(user.created_at).getTime();
        const lastSignInAt = user.last_sign_in_at
          ? new Date(user.last_sign_in_at).getTime()
          : Number.NaN;
        const isNewAccount =
          provider === 'google' &&
          Number.isFinite(createdAt) &&
          Number.isFinite(lastSignInAt) &&
          Math.abs(lastSignInAt - createdAt) < 60_000;

        if (isNewAccount) {
          track('sign_up', { method: provider });
        }
      }

      setState({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
