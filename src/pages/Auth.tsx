import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Handle initial session check
    const checkSession = async () => {
      console.log("Checking initial session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        return;
      }
      
      if (session) {
        console.log("Active session found:", session);
        toast.success("Successfully signed in!");
        navigate("/onboarding");
      } else {
        console.log("No active session found");
      }
    };

    checkSession();

    // Log URL parameters
    console.log("Current URL parameters:", Object.fromEntries(searchParams.entries()));

    // Handle magic link parameters
    const handleMagicLink = async () => {
      const hasError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      console.log("Magic link parameters:", {
        type,
        hasError,
        errorDescription,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      if (hasError) {
        console.error("Magic link error:", errorDescription);
        setErrorMessage(errorDescription || 'An error occurred during authentication');
        return;
      }

      // Handle both signup and recovery flows
      if ((type === 'recovery' || type === 'signup') && accessToken && refreshToken) {
        console.log(`Processing ${type} magic link return...`);
        try {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error("Error setting session:", error);
            setErrorMessage(getErrorMessage(error));
            return;
          }

          if (session) {
            console.log("Successfully set session from magic link");
            toast.success("Successfully signed in!");
            navigate("/onboarding");
          } else {
            console.error("No session after setting tokens");
            setErrorMessage("Failed to establish session");
          }
        } catch (error) {
          console.error("Unexpected error during magic link processing:", error);
          setErrorMessage("An unexpected error occurred");
        }
      }
    };

    handleMagicLink();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, sessionExists: !!session });
      
      if (event === 'SIGNED_IN') {
        console.log("Sign in detected, navigating to onboarding");
        toast.success("Successfully signed in!");
        navigate("/onboarding");
      } else if (event === 'SIGNED_OUT') {
        console.log("Sign out detected");
        navigate("/auth");
      } else if (event === 'USER_UPDATED') {
        console.log("User updated event detected");
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error refreshing session:", error);
          setErrorMessage(getErrorMessage(error));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Authentication error:", error);
    
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Neuralitix</h1>
          <p className="text-muted-foreground">Sign in with magic link to continue</p>
          {errorMessage && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {errorMessage}
            </div>
          )}
        </div>

        <SupabaseAuth 
          supabaseClient={supabase}
          view="magic_link"
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366F1',
                  brandAccent: '#4F46E5',
                  inputBackground: 'white',
                  inputText: '#1F2937',
                  inputBorder: '#E5E7EB',
                  inputBorderHover: '#6366F1',
                  inputBorderFocus: '#4F46E5',
                }
              }
            },
            style: {
              button: {
                borderRadius: '0.375rem',
                height: '2.5rem',
              },
              input: {
                borderRadius: '0.375rem',
              },
              message: {
                borderRadius: '0.375rem',
              },
            },
          }}
          providers={[]}
          localization={{
            variables: {
              magic_link: {
                email_input_label: 'Email',
                email_input_placeholder: 'Your email',
                button_label: 'Send Magic Link',
                loading_button_label: 'Sending Magic Link ...',
                link_text: "Don't have an account? Sign up",
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Auth;