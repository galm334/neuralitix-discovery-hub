import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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
    logger.info("🔍 [AuthContext] Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error("❌ [AuthContext] Profile fetch error:", error);
        toast.error("Error fetching profile data");
        throw error;
      }

      logger.info("✅ [AuthContext] Profile fetch result:", data);
      
      if (!data) {
        logger.warn("⚠️ [AuthContext] No profile found for user:", userId);
        if (location.pathname !== '/onboarding') {
          navigate('/onboarding', { replace: true });
        }
        return null;
      }

      return data;
    } catch (error) {
      logger.error("❌ [AuthContext] Profile fetch error:", error);
      toast.error("Failed to load profile. Please try again.");
      return null;
    }
  };

  const handleAuthStateChange = useCallback(async ({ event, session }: { event: string; session: Session | null }) => {
    logger.info("🔄 [AuthContext] Auth state changed:", event, session ? "Session present" : "No session");
    
    setSession(session);

    if (session?.user?.id) {
      try {
        const fetchedProfile = await fetchProfile(session.user.id);
        setProfile(fetchedProfile);
        
        // Handle navigation based on profile state
        if (!fetchedProfile && location.pathname !== '/onboarding') {
          logger.info("➡️ [AuthContext] No profile, redirecting to onboarding");
          navigate('/onboarding', { replace: true });
        } else if (fetchedProfile && location.pathname === '/onboarding') {
          logger.info("➡️ [AuthContext] Profile exists, redirecting from onboarding");
          navigate('/', { replace: true });
        }
      } catch (error) {
        logger.error("❌ [AuthContext] Error handling auth state change:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      setProfile(null);
      if (!location.pathname.startsWith('/auth')) {
        navigate('/auth', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      logger.warn("⚠️ [AuthContext] Cannot refresh profile: No active session");
      return;
    }

    logger.info("🔄 [AuthContext] Refreshing profile...");
    const fetchedProfile = await fetchProfile(session.user.id);
    setProfile(fetchedProfile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      
      logger.info("🚀 [AuthContext] Starting authentication initialization");
      setIsLoading(true);

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          logger.info("✅ [AuthContext] Session check complete:", initialSession ? "Active session" : "No session");
          
          if (initialSession?.user) {
            await handleAuthStateChange({ event: 'INITIAL_SESSION', session: initialSession });
          }
          
          setIsLoading(false);
          initializationComplete.current = true;
        }
      } catch (error) {
        logger.error("❌ [AuthContext] Initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          initializationComplete.current = true;
          toast.error("Error initializing authentication");
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange({ event, session });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

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