import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, terms_accepted, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    
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
    try {
      const profile = await fetchProfile(session.user.id);
      setProfile(profile);

      // Only redirect to onboarding if profile exists but terms not accepted
      if (profile && !profile.terms_accepted) {
        navigate('/onboarding');
      } else if (!profile) {
        // If no profile exists yet, wait briefly for it to be created
        setTimeout(async () => {
          const retryProfile = await fetchProfile(session.user.id);
          setProfile(retryProfile);
          if (retryProfile && !retryProfile.terms_accepted) {
            navigate('/onboarding');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Error loading user data');
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) return;
    const profile = await fetchProfile(session.user.id);
    setProfile(profile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          if (session) {
            await handleNavigation(session);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof AuthError) {
          handleAuthError(error);
        }
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        setSession(session);

        try {
          if (session) {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              await handleNavigation(session);
            }
          } else if (event === 'SIGNED_OUT') {
            setProfile(null);
            navigate('/auth');
          }
        } catch (error) {
          if (error instanceof AuthError) {
            handleAuthError(error);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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