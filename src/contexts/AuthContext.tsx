import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const initializationComplete = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const fetchProfile = async (userId: string, retry = false) => {
    logger.info("🔍 [AuthContext] Fetching profile for user:", userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      logger.info("✅ [AuthContext] Profile fetch result:", data);
      retryCount.current = 0;
      
      if (!data) {
        logger.warn("⚠️ [AuthContext] No profile found for user:", userId);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("❌ [AuthContext] Error fetching profile:", error);
      
      if (retry && retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 8000);
        logger.info(`🔄 [AuthContext] Retrying profile fetch in ${delay}ms (${retryCount.current}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(userId, true);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (errorMessage.includes('not found')) {
        toast.error("Profile not found. Please try logging in again.");
      } else {
        toast.error("Failed to load profile. Please refresh the page.");
      }
      return null;
    }
  };

  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    logger.info("🔄 [AuthContext] Auth state changed:", event, newSession ? "Session present" : "No session");
    
    setSession(newSession);

    if (newSession?.user?.id) {
      try {
        const fetchedProfile = await fetchProfile(newSession.user.id, true);
        setProfile(fetchedProfile);
      } catch (error) {
        logger.error("❌ [AuthContext] Error handling auth state change:", error);
        toast.error("Error updating authentication state. Please try again.");
      }
    } else if (event === 'SIGNED_OUT') {
      setProfile(null);
    }
  }, []);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      logger.warn("⚠️ [AuthContext] Cannot refresh profile: No active session");
      return;
    }

    logger.info("🔄 [AuthContext] Refreshing profile...");
    const fetchedProfile = await fetchProfile(session.user.id, true);
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
            await handleAuthStateChange('INITIAL_SESSION', initialSession);
          }
          
          setIsLoading(false);
          initializationComplete.current = true;
        }
      } catch (error) {
        logger.error("❌ [AuthContext] Initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          initializationComplete.current = true;
          toast.error("Error initializing authentication. Please refresh the page.");
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

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