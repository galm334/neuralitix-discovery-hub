import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError, Session } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        
        if (event === "SIGNED_IN") {
          if (!session?.user?.id) return;
          
          try {
            // Wait briefly for the profile to be created by the database trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if profile exists and terms are accepted
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("terms_accepted")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
              setError(profileError.message);
              return;
            }

            // For Google sign-ups or if terms not accepted, go to onboarding
            if (!profile?.terms_accepted) {
              navigate("/onboarding", { replace: true });
              return;
            }

            // For cases where terms are accepted, go to home
            navigate("/", { replace: true });
          } catch (err) {
            console.error("Error checking profile:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
          }
        }
      }
    );

    // Handle initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          setIsCheckingSession(false);
          return;
        }
        
        if (session?.user?.id) {
          // Check profile and redirect if necessary
          const { data: profile } = await supabase
            .from("profiles")
            .select("terms_accepted")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile?.terms_accepted) {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }
        
        setIsCheckingSession(false);
      } catch (err) {
        console.error("Error checking session:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsCheckingSession(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

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