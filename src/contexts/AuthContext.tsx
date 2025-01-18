import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

const SESSION_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const PROFILE_FETCH_TIMEOUT = 30000; // 30 seconds
const MAX_PROFILE_FETCH_ATTEMPTS = 3;

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
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const fetchProfile = async (userId: string, attempt = 1): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error("Profile fetch error", { error, userId, attempt });
        if (attempt < MAX_PROFILE_FETCH_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchProfile(userId, attempt + 1);
        }
        toast.error("Failed to load profile. Please try again.");
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Profile fetch failed", { error, userId, attempt });
      toast.error("An unexpected error occurred while loading your profile.");
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      logger.info("Cannot refresh profile: No active session");
      return;
    }

    try {
      const fetchedProfile = await fetchProfile(session.user.id);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
    } catch (error) {
      logger.error("Profile refresh failed", { error });
      toast.error('Failed to refresh profile data');
    }
  };

  const setupSessionRefresh = useCallback((session: Session) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          logger.error("Session refresh failed", { error });
          handleSessionTimeout();
        }
      } catch (error) {
        logger.error("Session refresh error", { error });
        handleSessionTimeout();
      }
    }, SESSION_REFRESH_INTERVAL);

    if (session.expires_at) {
      const timeUntilExpiry = new Date(session.expires_at).getTime() - Date.now();
      if (timeUntilExpiry > 0) {
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current);
        }
        sessionTimeoutRef.current = setTimeout(handleSessionTimeout, timeUntilExpiry);
      }
    }
  }, []);

  const handleSessionTimeout = useCallback(() => {
    logger.warn("Session timeout detected");
    setSession(null);
    setProfile(null);
    toast.error("Your session has expired. Please sign in again.");
    navigate('/auth', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationComplete.current) return;
      
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            setupSessionRefresh(initialSession);
            
            const fetchedProfile = await fetchProfile(initialSession.user.id);
            if (fetchedProfile) {
              setProfile(fetchedProfile);
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
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.info("Auth state changed", { event, hasSession: !!newSession });
      
      if (mounted) {
        if (newSession) {
          setSession(newSession);
          setupSessionRefresh(newSession);
          
          const fetchedProfile = await fetchProfile(newSession.user.id);
          if (fetchedProfile) {
            setProfile(fetchedProfile);
          }
        } else {
          setSession(null);
          setProfile(null);
          if (event === 'SIGNED_OUT') {
            navigate('/auth', { replace: true });
          }
        }
      }
    });

    return () => {
      mounted = false;
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      subscription.unsubscribe();
    };
  }, [navigate, setupSessionRefresh]);

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