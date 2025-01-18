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

      if (error) {
        console.error("❌ [AuthContext] Error fetching profile:", error);
        throw error;
      }
      console.log("✅ [AuthContext] Profile fetch result:", data);
      return data;
    } catch (error) {
      console.error('❌ [AuthContext] Error in fetchProfile:', error);
      return null;
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error('🚫 [AuthContext] Auth error:', error);
    toast.error('Authentication error. Please try again.');
  };

  const handleNavigation = useCallback(async (session: Session) => {
    console.log("🧭 [AuthContext] Starting navigation handling");
    console.log("📍 [AuthContext] Current location:", location.pathname);
    console.log("👤 [AuthContext] Session user:", session.user.email);
    console.log("🔑 [AuthContext] Session token:", session.access_token ? "Present" : "Missing");

    try {
      // Only fetch profile if we don't have it cached
      let currentProfile = profile;
      if (!currentProfile) {
        currentProfile = await fetchProfile(session.user.id);
        console.log("👥 [AuthContext] Fetched profile:", currentProfile);
        setProfile(currentProfile);
      }

      // Handle different navigation scenarios
      if (location.pathname === '/auth') {
        if (currentProfile) {
          console.log("➡️ [AuthContext] Redirecting from auth to home");
          navigate('/', { replace: true });
        } else {
          console.log("➡️ [AuthContext] No profile, redirecting to onboarding");
          navigate('/onboarding', { replace: true });
        }
        return;
      }

      if (!currentProfile && location.pathname !== '/onboarding') {
        console.log("➡️ [AuthContext] No profile, redirecting to onboarding");
        navigate('/onboarding', { replace: true });
        return;
      }

      if (currentProfile && location.pathname === '/onboarding') {
        console.log("➡️ [AuthContext] Have profile, redirecting from onboarding to home");
        navigate('/', { replace: true });
        return;
      }
    } catch (error) {
      console.error('❌ [AuthContext] Navigation error:', error);
      toast.error('Error loading user data');
      navigate('/auth', { replace: true });
    }
  }, [navigate, location.pathname, profile]);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      console.log("⚠️ [AuthContext] Cannot refresh profile: No active session");
      return;
    }

    console.log("🔄 [AuthContext] Refreshing profile...");
    const fetchedProfile = await fetchProfile(session.user.id);
    setProfile(fetchedProfile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      console.log("🚀 [AuthContext] === Starting Authentication Flow ===");
      console.log("📝 [AuthContext] Current URL:", window.location.href);
      setIsLoading(true);
      
      try {
        // Get the initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        console.log("🔐 [AuthContext] Initial session check:", initialSession ? "Found session" : "No session");
        
        if (error) throw error;
        
        if (mounted) {
          if (initialSession) {
            console.log("✅ [AuthContext] Setting initial session");
            setSession(initialSession);
            const fetchedProfile = await fetchProfile(initialSession.user.id);
            setProfile(fetchedProfile);
            await handleNavigation(initialSession);
          } else {
            console.log("ℹ️ [AuthContext] No initial session found");
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
      console.log('📊 [AuthContext] Event details:', { event, sessionExists: !!session });
      
      if (mounted) {
        setSession(session);
        if (session) {
          const fetchedProfile = await fetchProfile(session.user.id);
          setProfile(fetchedProfile);
          await handleNavigation(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [AuthContext] User signed out, clearing profile');
          setProfile(null);
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleNavigation]);

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