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

        // Handle network errors with exponential backoff
        if (retryCount < maxRetries && (
          error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('internet') ||
          status === 503 || 
          status === 429 || 
          status === 0
        )) {
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

      logger.info("Profile fetch result", { 
        success: !!data,
        hasProfile: !!data,
        userId
      });
      
      return data;
    } catch (error) {
      logger.error("Profile fetch failed", { error, userId, retryCount });
      
      // Additional retry for network disconnection errors
      if (retryCount < maxRetries && error instanceof Error && (
        error.message.includes('internet disconnected') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        const delay = retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(userId, retryCount + 1);
      }
      
      toast.error('Unable to load profile. Please check your internet connection and try again.');
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
      let currentProfile = profile;
      if (!currentProfile) {
        logger.info("No cached profile, fetching", { userId: session.user.id });
        currentProfile = await fetchProfile(session.user.id);
        setProfile(currentProfile);
      }

      // If we're on /auth and have a profile, go home
      if (location.pathname === '/auth' && currentProfile) {
        logger.info("Redirecting from auth to home", { userId: session.user.id });
        navigate('/', { replace: true });
        return;
      }

      // If we're on /auth and don't have a profile, go to onboarding
      if (location.pathname === '/auth' && !currentProfile) {
        logger.info("No profile found, redirecting to onboarding", { userId: session.user.id });
        navigate('/onboarding', { replace: true });
        return;
      }

      // If we don't have a profile and aren't on onboarding, go to onboarding
      if (!currentProfile && location.pathname !== '/onboarding') {
        logger.info("No profile detected, redirecting to onboarding", { userId: session.user.id });
        navigate('/onboarding', { replace: true });
        return;
      }

      // If we have a profile and are on onboarding, go home
      if (currentProfile && location.pathname === '/onboarding') {
        logger.info("Profile exists, redirecting from onboarding to home", { userId: session.user.id });
        navigate('/', { replace: true });
        return;
      }
    } catch (error) {
      logger.error("Navigation error", { error });
      toast.error('Error loading user data. Please check your connection and try again.');
      navigate('/auth', { replace: true });
    }
  }, [navigate, location.pathname, profile]);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      logger.info("Cannot refresh profile: No active session");
      return;
    }

    logger.info("Refreshing profile", { userId: session.user.id });
    const fetchedProfile = await fetchProfile(session.user.id);
    setProfile(fetchedProfile);
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
            const fetchedProfile = await fetchProfile(initialSession.user.id);
            setProfile(fetchedProfile);
            await handleNavigation(initialSession);
          } else {
            logger.info("No initial session found");
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
          const fetchedProfile = await fetchProfile(session.user.id);
          setProfile(fetchedProfile);
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