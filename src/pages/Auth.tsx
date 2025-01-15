import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authType = searchParams.get("type") || "signin";

  useEffect(() => {
    // Listen for auth state changes specifically on the auth page
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in Auth.tsx:', event);
      
      if (event === 'SIGNED_IN') {
        const { error } = await supabase.auth.getUser();
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.info("You already have an account. Signing you in...");
          } else {
            toast.error("Authentication error. Please try again.");
          }
        }
        // Only navigate after we confirm the user is properly authenticated
        if (session) {
          navigate("/");
        }
      }
    });

    // Check if user is already authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">
            {authType === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {authType === "signup" 
              ? "Sign up to get started with Neuralitix" 
              : "Sign in to continue to Neuralitix"}
          </p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          view={authType === "signup" ? "sign_up" : "sign_in"}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                }
              }
            }
          }}
          providers={["google"]}
        />
      </div>
    </div>
  );
};

export default Auth;