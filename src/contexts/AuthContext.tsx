import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  terms_accepted: boolean;
  name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const initializationComplete = useRef(false);

  const fetchProfile = async (userId: string) => {
    console.log("🔍 [AuthContext] Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      console.log("✅ [AuthContext] Profile fetch result:", data);
      return data;
    } catch (error) {
      console.error('❌ [AuthContext] Error fetching profile:', error);
      return null;
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error('🚫 [AuthContext] Auth error:', error);
    toast.error('Authentication error. Please try again.');
  };

  const handleNavigation = async (session: Session) => {
    console.log("🧭 [AuthContext] Starting navigation handling");
    console.log("📍 [AuthContext] Current location:", location.pathname);
    console.log("👤 [AuthContext] Session user:", session.user.email);

    try {
      const profile = await fetchProfile(session.user.id);
      console.log("📋 [AuthContext] Profile state:", profile);
      setProfile(profile);

      // If we're on auth page and have a profile, go to home
      if (location.pathname === '/auth' && profile) {
        console.log("➡️ [AuthContext] Redirecting from auth to home");
        navigate('/', { replace: true });
        return;
      }

      // If we don't have a profile and we're not on onboarding, go to onboarding
      if (!profile && location.pathname !== '/onboarding') {
        console.log("➡️ [AuthContext] No profile, redirecting to onboarding");
        navigate('/onboarding', { replace: true });
        return;
      }

      // If we have a profile but we're on onboarding, go to home
      if (profile && location.pathname === '/onboarding') {
        console.log("➡️ [AuthContext] Have profile, redirecting from onboarding to home");
        navigate('/', { replace: true });
        return;
      }
    } catch (error) {
      console.error('❌ [AuthContext] Navigation error:', error);
      toast.error('Error loading user data');
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      console.log("⚠️ [AuthContext] Cannot refresh profile: No active session");
      return;
    }
    console.log("🔄 [AuthContext] Refreshing profile...");
    const profile = await fetchProfile(session.user.id);
    setProfile(profile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      console.log("🚀 [AuthContext] === Starting Authentication Flow ===");
      setIsLoading(true);
      
      try {
        console.log("🔍 [AuthContext] Checking current session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          console.log("✅ [AuthContext] Session check complete:", session ? "Active session" : "No session");
          setSession(session);
          if (session) {
            await handleNavigation(session);
          }
          setIsLoading(false);
          initializationComplete.current = true;
        }
      } catch (error) {
        console.error("❌ [AuthContext] Error in initializeAuth:", error);
        if (error instanceof AuthError) {
          handleAuthError(error);
        }
        if (mounted) {
          setIsLoading(false);
          initializationComplete.current = true;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthContext] Auth state changed:', event, session ? "Session present" : "No session");
      
      if (mounted) {
        setSession(session);
        if (session) {
          await handleNavigation(session);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, refreshProfile }}>
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