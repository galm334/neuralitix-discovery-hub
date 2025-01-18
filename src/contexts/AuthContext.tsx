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
    logger.info("Fetching profile", { userId });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error("Error fetching profile", { error, userId });
        throw error;
      }
      
      logger.info("Profile fetch result", { 
        success: !!data,
        hasProfile: !!data,
        userId 
      });
      
      return data;
    } catch (error) {
      logger.error("Error in fetchProfile", { error, userId });
      return null;
    }
  };

  const handleAuthError = (error: AuthError) => {
    logger.error("Auth error occurred", { 
      code: error.code,
      message: error.message,
      status: error.status
    });
    toast.error('Authentication error. Please try again.');
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

      logger.info("Navigation state", {
        hasProfile: !!currentProfile,
        currentPath: location.pathname,
        isOnAuth: location.pathname === '/auth',
        isOnOnboarding: location.pathname === '/onboarding'
      });

      if (location.pathname === '/auth') {
        if (currentProfile) {
          logger.info("Redirecting from auth to home", { userId: session.user.id });
          navigate('/', { replace: true });
        } else {
          logger.info("No profile, redirecting to onboarding", { userId: session.user.id });
          navigate('/onboarding', { replace: true });
        }
        return;
      }

      if (!currentProfile && location.pathname !== '/onboarding') {
        logger.info("No profile detected, redirecting to onboarding", { userId: session.user.id });
        navigate('/onboarding', { replace: true });
        return;
      }

      if (currentProfile && location.pathname === '/onboarding') {
        logger.info("Profile exists, redirecting from onboarding to home", { userId: session.user.id });
        navigate('/', { replace: true });
        return;
      }
    } catch (error) {
      logger.error("Navigation error", { error });
      toast.error('Error loading user data');
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
        logger.info("Initial session check", { 
          hasSession: !!initialSession,
          error: !!error 
        });
        
        if (error) throw error;
        
        if (mounted) {
          if (initialSession) {
            logger.info("Setting initial session", { userId: initialSession.user.id });
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
        logger.error("Error in initializeAuth", { error });
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
          logger.info("User signed out, clearing profile");
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