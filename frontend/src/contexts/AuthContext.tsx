import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, orgName?: string, referralCode?: string, role?: 'sales_manager' | 'member') => Promise<void>;
  signInWithGoogle: (role?: 'sales_manager' | 'member', orgName?: string, referralCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  joinOrganization: (referralCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile from new 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message, error.details);
        return;
      }

      if (!data) {
        console.log('No profile found for user yet.');
        return;
      }

      // If profile exists, try to get org details separately
      if (data.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', data.org_id)
          .single();

        if (orgData) {
          data.organizations = orgData;
        }
      }

      setProfile(data);
      console.log('Successfully loaded profile with org:', data);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const handleAuthStateChange = async () => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' && currentUser) {
          console.log('\n========================================');
          console.log('🔐 SIGNED_IN EVENT STARTED');
          console.log('========================================');
          console.log('User ID:', currentUser.id);
          console.log('Email:', currentUser.email);
          console.log('Timestamp:', new Date().toISOString());
          console.log('========================================\n');

          // Check if profile exists (with retry logic for RLS issues)
          let retryCount = 0;
          let existingProfile = null;

          while (retryCount < 3 && !existingProfile) {
            console.log(`\n🔍 Profile Check Attempt ${retryCount + 1}/3`);
            console.log('Querying: profiles table');
            console.log('Filter: id =', currentUser.id);

            const { data, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', currentUser.id)
              .maybeSingle();

            if (error) {
              console.error('❌ PROFILE CHECK FAILED:');
              console.error('Error Message:', error.message);
              console.error('Error Details:', error.details);
              console.error('Error Hint:', error.hint);
              console.error('Error Code:', error.code);

              if (error.message.includes('infinite recursion')) {
                console.error('\n⚠️⚠️⚠️ INFINITE RECURSION DETECTED ⚠️⚠️⚠️');
                console.error('This means the RLS policies are still broken!');
                console.error('You need to run migration 008_complete_rls_fix.sql in Supabase SQL Editor');
                console.error('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n');
              }
              retryCount++;
              if (retryCount < 3) {
                console.log(`⏳ Waiting 500ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else {
              existingProfile = data;
              if (data) {
                console.log('✅ Profile found:', data.id);
              } else {
                console.log('⚠️ No profile found in database');
              }
              break;
            }
          }

          if (existingProfile) {
            console.log('\n📋 Fetching full profile with org data...');
            await fetchProfile(currentUser.id);
          } else {
            console.log('\n🆕 No existing profile - checking for signup intent...');

            // If no profile, check if we have stored signup intent (for Google/OAuth)
            const pendingRole = localStorage.getItem('lingopitch_pending_role') as any;
            const pendingOrg = localStorage.getItem('lingopitch_pending_org');
            const pendingRef = localStorage.getItem('lingopitch_pending_ref');

            console.log('Pending Role:', pendingRole || 'none');
            console.log('Pending Org:', pendingOrg || 'none');
            console.log('Pending Ref:', pendingRef || 'none');

            if (pendingRole) {
              console.log('\n🔨 Creating profile from signup intent...');
              try {
                await completeProfile(
                  currentUser.id,
                  currentUser.user_metadata.full_name || currentUser.email?.split('@')[0] || 'Agent',
                  pendingRole,
                  pendingOrg || undefined,
                  pendingRef || undefined
                );
                console.log('✅ Profile created successfully');

                // After creating, fetch it
                await fetchProfile(currentUser.id);
              } catch (err) {
                console.error('❌ Failed to auto-create profile after OAuth:', err);
              } finally {
                console.log('🧹 Clearing signup intent from localStorage');
                localStorage.removeItem('lingopitch_pending_role');
                localStorage.removeItem('lingopitch_pending_org');
                localStorage.removeItem('lingopitch_pending_ref');
              }
            } else if (event === 'SIGNED_IN' && !currentUser.email_confirmed_at) {
              console.log('\n📧 User signed up but email not verified yet');
              setProfile({ id: currentUser.id, email: currentUser.email, full_name: 'Pending Verification' });
            } else {
              console.log('\n⏳ Final check: waiting 1 second for RLS to settle...');
              await new Promise(resolve => setTimeout(resolve, 1000));

              const { data: finalCheck } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', currentUser.id)
                .maybeSingle();

              if (!finalCheck) {
                console.error('\n❌ AUTHORIZATION FAILED');
                console.error('No profile found after all retries');
                console.error('Signing user out...');

                await supabase.auth.signOut();
                setProfile(null);
                localStorage.setItem('lingopitch_auth_error', 'No account found. Please sign up first.');
                window.location.href = '/login';
              } else {
                console.log('✅ Profile found on final check!');
                await fetchProfile(currentUser.id);
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('\n🚪 SIGNED_OUT event');
          setProfile(null);
        }

        setLoading(false);
      };

      handleAuthStateChange();
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeProfile = async (userId: string, name: string, role: 'sales_manager' | 'member', orgName?: string, referralCode?: string) => {
    let organizationId: string | null = null;
    let finalRole = role;

    // CRITICAL: Ensure we have an active session before making RLS-protected calls
    console.log('🔍 Checking session before creating org...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('❌ No active session found:', sessionError);
      throw new Error('No active session - please try signing in again');
    }

    console.log('✅ Active session found for user:', session.user.id);
    console.log('Session access token exists:', !!session.access_token);

    // 1. Handle Organization Logic
    if (referralCode) {
      // User is joining an existing organization via referral code
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .single();

      if (orgError || !orgData) {
        throw new Error('Invalid referral code');
      }
      organizationId = orgData.id;
      finalRole = 'member'; // ALWAYS member when using referral code
    } else if (role === 'sales_manager') {
      // User is creating their own organization as a manager
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const orgSlug = (orgName || `${name}'s Organization`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + randomSuffix;

      console.log('📝 Attempting to INSERT organization...');
      console.log('Data:', {
        name: orgName || `${name}'s Organization`,
        slug: orgSlug,
        owner_id: userId,
        referral_code: newReferralCode,
      });

      const { data: newOrgData, error: newOrgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName || `${name}'s Organization`,
          slug: orgSlug,
          owner_id: userId,
          referral_code: newReferralCode,
        })
        .select('id')
        .single();

      if (newOrgError) {
        console.error('❌ Organization INSERT failed:', newOrgError);
        console.error('Error code:', newOrgError.code);
        console.error('Error details:', newOrgError.details);
        console.error('Error hint:', newOrgError.hint);
        throw new Error('Failed to create organization: ' + newOrgError.message);
      }

      console.log('✅ Organization created:', newOrgData.id);
      organizationId = newOrgData.id;
      finalRole = 'sales_manager';
    }
    // If role='member' but no referral code, they remain a member with no org (can join later)

    // 2. Create/Update profile (new schema)
    // Map 'sales_manager' to 'manager' for database (DB only accepts: admin, manager, rep)
    const dbRole = finalRole === 'sales_manager' ? 'manager' : (finalRole === 'member' ? 'rep' : finalRole);

    console.log('Inserting/Upserting profile for:', userId, { finalRole, dbRole, organizationId });
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: name,
      email: (await supabase.auth.getUser()).data.user?.email || '',
      org_id: organizationId,
      role: dbRole,
    }, {
      onConflict: 'id'
    });

    if (profileError) {
      console.error('Profile creation error details:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
    console.log('Profile successfully established for:', userId);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, orgName?: string, referralCode?: string, role: 'sales_manager' | 'member' = 'member') => {
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

    // 2. Complete Profile using the shared logic
    await completeProfile(authData.user.id, name, role, orgName, referralCode);

    // 3. Manually fetch profile to update state immediately
    await fetchProfile(authData.user.id);
  };

  const signInWithGoogle = async (role?: 'sales_manager' | 'member', orgName?: string, referralCode?: string) => {
    // If we're on the signup page with role intent, save it to handle after redirect
    if (role) {
      localStorage.setItem('lingopitch_pending_role', role);
      if (orgName) localStorage.setItem('lingopitch_pending_org', orgName);
      if (referralCode) localStorage.setItem('lingopitch_pending_ref', referralCode);
    }

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

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const joinOrganization = async (referralCode: string) => {
    console.log('\n========================================');
    console.log('🎫 JOIN ORGANIZATION STARTED');
    console.log('========================================');
    console.log('Referral Code:', referralCode);
    console.log('User ID:', user?.id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    if (!user) {
      console.error('❌ No user logged in!');
      throw new Error('Must be logged in to join an organization');
    }

    // Validate referral code and get organization
    console.log('🔍 Step 1: Looking up organization with referral code...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .single();

    if (orgError || !orgData) {
      console.error('❌ Organization lookup failed:', orgError);
      throw new Error('Invalid referral code');
    }

    console.log('✅ Organization found:', orgData.name, '(ID:', orgData.id, ')');

    // Update user profile with organization (new schema)
    console.log('\n🔄 Step 2: Updating profile...');
    console.log('Setting org_id:', orgData.id);
    console.log('Setting role: rep (mapped from member for DB compatibility)');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        org_id: orgData.id,
        role: 'rep'  // FIXED: Database only accepts 'admin', 'manager', 'rep'
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      console.error('Error code:', updateError.code);
      console.error('Error message:', updateError.message);
      console.error('Error details:', updateError.details);
      throw updateError;
    }

    console.log('✅ Profile updated successfully!');
    console.log('\n🎉 JOIN ORGANIZATION COMPLETED');
    console.log('========================================\n');

    // Refresh profile to show new org
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        joinOrganization,
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
