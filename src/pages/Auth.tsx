import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("[Auth] Checking initial session");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Session check error:", sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log("[Auth] Session found for user:", session.user.id);
          // Check if profile exists
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, terms_accepted')
            .eq('id', session.user.id)
            .single();

          console.log("[Auth] Profile check result:", { profiles, profileError });

          if (profileError) {
            console.error("[Auth] Profile check error:", profileError);
            throw profileError;
          }

          if (!profiles) {
            console.log("[Auth] No profile found, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
          } else {
            console.log("[Auth] Profile found, redirecting to home");
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("[Auth] Error in checkSession:", error);
        setError(getErrorMessage(error as AuthError));
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Auth state change listener
  useEffect(() => {
    console.log("[Auth] Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Auth event:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("[Auth] User signed in, checking profile");
        
        try {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, terms_accepted')
            .eq('id', session.user.id)
            .single();

          console.log("[Auth] Profile check result:", { profiles, profileError });

          if (profileError) {
            throw profileError;
          }

          if (!profiles) {
            console.log("[Auth] No profile found, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
          } else {
            console.log("[Auth] Profile found, redirecting to home");
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("[Auth] Error in auth state change:", error);
          setError(getErrorMessage(error as AuthError));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case 'invalid_credentials':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'email_not_confirmed':
          return 'Please verify your email address before signing in.';
        case 'user_not_found':
          return 'No user found with these credentials.';
        case 'invalid_grant':
          return 'Invalid login credentials.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (isCheckingSession) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Neuralitix</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sign in to access your AI tools collection
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6366F1',
                    brandAccent: '#4F46E5',
                  },
                },
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth`}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;