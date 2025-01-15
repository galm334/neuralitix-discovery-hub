import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("[Auth] Checking initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          console.log("[Auth] Found existing session, checking profile...");
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("terms_accepted")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("[Auth] Profile fetch error:", profileError);
            throw profileError;
          }

          console.log("[Auth] Profile status:", profile);
          if (!profile?.terms_accepted) {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("[Auth] Session check error:", error);
        toast.error("Failed to check session");
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Auth state change listener
  useEffect(() => {
    console.log("[Auth] Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Event:", event);
        console.log("[Auth] Session:", session);
        
        if (event === "SIGNED_IN" && session?.user?.id) {
          try {
            console.log("[Auth] Signed in, waiting for profile creation...");
            // Wait for database trigger to create profile
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log("[Auth] Checking profile status...");
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("terms_accepted")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error("[Auth] Profile fetch error:", profileError);
              throw profileError;
            }

            console.log("[Auth] Profile data:", profile);
            if (!profile?.terms_accepted) {
              console.log("[Auth] Redirecting to onboarding...");
              navigate("/onboarding", { replace: true });
            } else {
              console.log("[Auth] Redirecting to home...");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("[Auth] Error in auth flow:", error);
            setError("Failed to check user profile");
            toast.error("Authentication error occurred");
          }
        }
      }
    );

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription.unsubscribe();
    };
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