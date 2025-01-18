import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, AuthError, AuthApiError } from '@supabase/supabase-js';
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
    console.log("🔍 Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      console.log("✅ Profile fetch result:", data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error('🚫 Auth error:', error);
    
    switch (error.message) {
      case 'Token expired':
      case 'Invalid JWT':
        toast.error('Your session has expired. Please sign in again.');
        navigate('/auth');
        break;
      case 'Network error':
        toast.error('Network error. Please check your connection.');
        break;
      default:
        toast.error('Authentication error. Please try again.');
    }
  };

  const handleNavigation = async (session: Session) => {
    console.log("🧭 Handling navigation for session:", session.user.email);
    try {
      const profile = await fetchProfile(session.user.id);
      setProfile(profile);

      // If we're on the auth page and have a profile with accepted terms,
      // navigate to home
      if (location.pathname === '/auth' && profile?.terms_accepted) {
        console.log("➡️ Auth complete and terms accepted, navigating to home");
        navigate('/', { replace: true });
        return;
      }

      // If no profile or terms not accepted, redirect to onboarding
      if (!profile || !profile.terms_accepted) {
        console.log("➡️ Terms not accepted, redirecting to onboarding");
        navigate('/onboarding', { replace: true });
        return;
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      toast.error('Error loading user data');
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) return;
    console.log("🔄 Refreshing profile...");
    const profile = await fetchProfile(session.user.id);
    setProfile(profile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      console.log("🚀 === Starting Authentication Flow ===");
      setIsLoading(true);
      
      try {
        // Get current session
        console.log("🔍 Checking current session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          console.log("✅ Session check complete:", session ? "Active session" : "No session");
          setSession(session);
          if (session) {
            await handleNavigation(session);
          }
          setIsLoading(false);
          initializationComplete.current = true;
        }
      } catch (error) {
        console.error("❌ Error in initializeAuth:", error);
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
      console.log('🔄 Auth state changed:', event, session ? "Session present" : "No session");
      
      if (mounted) {
        setSession(session);

        if (session) {
          await handleNavigation(session);
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 User signed out, clearing profile");
          setProfile(null);
          navigate('/auth');
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