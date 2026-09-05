import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useAuth } from './auth';

export type MembershipPlan = 'free' | 'standard' | 'premium';
export type MembershipStatus =
  | 'free'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export type MembershipData = {
  plan: MembershipPlan;
  status: MembershipStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
} | null;

type MembershipState = {
  membership: MembershipData;
  plan: MembershipPlan;
  status: MembershipStatus;
  isStandard: boolean;
  isActive: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const MembershipContext = createContext<MembershipState>({
  membership: null,
  plan: 'free',
  status: 'free',
  isStandard: false,
  isActive: false,
  loading: true,
  refresh: async () => {},
});

const ACTIVE_STATUSES: MembershipStatus[] = ['active', 'trialing'];

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [membership, setMembership] = useState<MembershipData>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembership = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .select('plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end')
      .eq('user_id', uid)
      .maybeSingle();

    if (error) {
      setMembership(null);
      return;
    }

    if (data) {
      setMembership(data as MembershipData);
    } else {
      setMembership(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (user) {
      await fetchMembership(user.id);
    }
  }, [user, fetchMembership]);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMembership(user.id).finally(() => setLoading(false));
  }, [user, fetchMembership]);

  const plan: MembershipPlan = membership?.plan ?? 'free';
  const status: MembershipStatus = membership?.status ?? 'free';
  const isActive = ACTIVE_STATUSES.includes(status);
  const isStandard = plan === 'standard' && isActive;

  return (
    <MembershipContext.Provider value={{ membership, plan, status, isStandard, isActive, loading, refresh }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  return useContext(MembershipContext);
}
