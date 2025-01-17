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

  const handleMagicLinkAuth = async (hash: string) => {
    console.log("🔑 Processing magic link authentication...");
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      try {
        console.log("🔄 Setting session from magic link tokens...");
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) throw error;

        if (session) {
          console.log("✅ Successfully established session from magic link");
          setSession(session);
          await handleNavigation(session);
          toast.success("Successfully signed in!");
          return true;
        }
      } catch (error) {
        console.error("❌ Error setting session from magic link:", error);
        toast.error("Failed to authenticate. Please try again.");
        navigate("/auth", { replace: true });
      }
    }
    return false;
  };

  const handleNavigation = async (session: Session) => {
    console.log("🧭 Handling navigation for session:", session.user.email);
    try {
      const profile = await fetchProfile(session.user.id);
      setProfile(profile);

      if (!profile) {
        console.log("➡️ No profile found, redirecting to onboarding");
        navigate('/onboarding', { replace: true });
      } else if (!profile.terms_accepted) {
        console.log("➡️ Terms not accepted, redirecting to onboarding");
        navigate('/onboarding', { replace: true });
      } else if (location.pathname === '/auth' || location.pathname === '/onboarding') {
        console.log("➡️ Profile complete, navigating to home");
        navigate('/', { replace: true });
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
        // Handle magic link authentication first
        if (location.hash && location.hash.includes('access_token')) {
          console.log("🔑 Magic link detected, processing...");
          const success = await handleMagicLinkAuth(location.hash);
          if (success) {
            setIsLoading(false);
            initializationComplete.current = true;
            return;
          }
        }

        // If no magic link or magic link failed, check current session
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
          if (event === 'SIGNED_IN') {
            await handleNavigation(session);
          }
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
  }, [navigate, location.hash]);

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