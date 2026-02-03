import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, orgName?: string, referralCode?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, orgName?: string, referralCode?: string) => {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (authError) throw authError;

    if (!authData.user) throw new Error('Signup failed: user data missing');

    const userId = authData.user.id;
    let organizationId: string | null = null;
    let role: 'sales_manager' | 'member' = 'member';

    // 2. Handle Organization Logic
    if (referralCode) {
      // Joining an existing organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .single();

      if (orgError || !orgData) {
        throw new Error('Invalid referral code');
      }
      organizationId = orgData.id;
      role = 'member';
    } else if (orgName) {
      // Creating a new organization (Sales Manager role)
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: newOrgData, error: newOrgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          owner_id: userId,
          referral_code: newReferralCode,
        })
        .select('id')
        .single();

      if (newOrgError) throw new Error('Failed to create organization: ' + newOrgError.message);
      organizationId = newOrgData.id;
      role = 'sales_manager';
    } else {
      // Fallback if neither provided (default to sales manager with default org name)
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data: newOrgData, error: newOrgError } = await supabase
        .from('organizations')
        .insert({
          name: `${name}'s Organization`,
          owner_id: userId,
          referral_code: newReferralCode,
        })
        .select('id')
        .single();

      if (newOrgError) throw new Error('Failed to create default organization');
      organizationId = newOrgData.id;
      role = 'sales_manager';
    }

    // 3. Create user_profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: userId,
      full_name: name,
      organization_id: organizationId,
      role: role,
      referral_code: referralCode || null,
    });

    if (profileError) throw profileError;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
