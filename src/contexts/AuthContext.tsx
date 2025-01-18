import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
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
  const maxRetries = 3;
  const retryDelay = 1000;

  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      logger.info("Attempting to fetch profile", { 
        userId, 
        retryCount,
        hasAuthHeader: !!session?.access_token
      });

      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error("Profile fetch error", { 
          error, 
          status,
          userId,
          retryAttempt: retryCount
        });

        // Handle 406 specifically - this means the profile doesn't exist yet
        if (status === 406) {
          logger.info("Profile doesn't exist yet (406)", { userId });
          return null;
        }

        const shouldRetry = retryCount < maxRetries && (
          error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('internet') ||
          status === 503 || 
          status === 429 ||
          status === 401 ||
          status === 0
        );

        if (shouldRetry) {
          const delay = retryDelay * Math.pow(2, retryCount);
          logger.info("Retrying profile fetch", { 
            nextAttemptIn: delay,
            attemptNumber: retryCount + 1 
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchProfile(userId, retryCount + 1);
        }

        throw error;
      }

      logger.info("Profile fetch successful", { 
        success: !!data,
        hasProfile: !!data,
        userId
      });
      
      return data;
    } catch (error) {
      logger.error("Profile fetch failed", { error, userId, retryCount });
      
      if (retryCount < maxRetries && error instanceof Error && (
        error.message.includes('internet disconnected') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        const delay = retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(userId, retryCount + 1);
      }
      
      return null;
    }
  };

  const handleNavigation = useCallback(async (session: Session) => {
    logger.info("Starting navigation handling", {
      currentPath: location.pathname,
      userEmail: session.user.email,
      hasAccessToken: !!session.access_token
    });

    try {
      const fetchedProfile = await fetchProfile(session.user.id);
      
      if (!fetchedProfile) {
        logger.info("No profile found, redirecting to onboarding", { userId: session.user.id });
        navigate('/onboarding', { replace: true });
        return;
      }

      if (fetchedProfile && (location.pathname === '/auth' || location.pathname === '/onboarding')) {
        logger.info("Profile exists, redirecting to home", { userId: session.user.id });
        navigate('/', { replace: true });
        return;
      }

      setProfile(fetchedProfile);
    } catch (error) {
      logger.error("Navigation error", { error });
      navigate('/auth', { replace: true });
    }
  }, [navigate, location.pathname]);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      logger.info("Cannot refresh profile: No active session");
      return;
    }

    try {
      logger.info("Refreshing profile", { userId: session.user.id });
      const fetchedProfile = await fetchProfile(session.user.id);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
    } catch (error) {
      logger.error("Profile refresh failed", { error });
      toast.error('Failed to refresh profile. Please try again.');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      
      logger.info("Initializing authentication", {
        currentUrl: window.location.href,
        pathname: location.pathname
      });
      
      setIsLoading(true);
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error("Session initialization error", { error });
          throw error;
        }
        
        if (mounted) {
          if (initialSession) {
            logger.info("Initial session found", { 
              userId: initialSession.user.id,
              email: initialSession.user.email 
            });
            setSession(initialSession);
            await handleNavigation(initialSession);
          } else {
            logger.info("No initial session found");
            // Only redirect to /auth if we're on a protected route
            if (location.pathname === '/chat') {
              navigate('/auth', { replace: true });
            }
          }
          
          setIsLoading(false);
          initializationComplete.current = true;
        }
      } catch (error) {
        logger.error("Auth initialization failed", { error });
        if (mounted) {
          setIsLoading(false);
          initializationComplete.current = true;
          toast.error('Authentication error. Please refresh the page.');
          // Only redirect to /auth if we're on a protected route
          if (location.pathname === '/chat') {
            navigate('/auth', { replace: true });
          }
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("Auth state changed", { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id 
      });
      
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
  }, [handleNavigation, navigate, location.pathname]);

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