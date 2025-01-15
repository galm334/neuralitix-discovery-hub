import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        if (event === "SIGNED_IN") {
          // Check if terms are accepted
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("terms_accepted")
            .eq("id", session?.user?.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            setError(profileError.message);
            return;
          }

          if (profile?.terms_accepted) {
            navigate("/");
          } else {
            navigate("/onboarding");
          }
        }

        if (event === "SIGNED_OUT") {
          console.log("User signed out");
        }

        // Log any auth errors
        if (event === "USER_DELETED" || event === "TOKEN_REFRESHED" || event === "PASSWORD_RECOVERY") {
          console.log(`Auth event ${event} occurred`);
        }
      }
    );

    // Handle initial session
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError(sessionError.message);
      }
      if (session) {
        console.log("Initial session:", session);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthError = (error: AuthError) => {
    console.error("Auth error:", error);
    setError(error.message);
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: error.message,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
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
            redirectTo={`${window.location.origin}/auth/callback`}
            onError={handleAuthError}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;