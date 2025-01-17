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
    const checkSession = async () => {
      console.log("=== Starting Authentication Flow ===");
      console.log("Checking initial session...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        return;
      }
      
      if (session) {
        console.log("Active session found:", {
          user: session.user.email,
          lastSignIn: session.user.last_sign_in_at
        });
        toast.success("Successfully signed in!");
        navigate("/onboarding");
        return;
      }

      // Log all URL parameters for debugging
      const allParams = Object.fromEntries(searchParams.entries());
      console.log("All URL parameters:", allParams);

      // Extract magic link parameters
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const hasError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log("Magic link parameters:", {
        type,
        hasError: hasError,
        errorDescription,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        fullUrl: window.location.href
      });

      if (hasError) {
        console.error("Magic link error:", errorDescription);
        setErrorMessage(errorDescription || 'An error occurred during authentication');
        return;
      }

      // Handle magic link authentication
      if (accessToken && refreshToken) {
        console.log(`Processing authentication with ${type} magic link...`);
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
            console.log("Successfully established session:", {
              user: session.user.email,
              expiresAt: session.expires_at
            });
            toast.success("Successfully signed in!");
            navigate("/onboarding");
          } else {
            console.error("No session established after setting tokens");
            setErrorMessage("Failed to establish session");
          }
        } catch (error) {
          console.error("Unexpected error during magic link processing:", error);
          setErrorMessage("An unexpected error occurred");
        }
      } else {
        console.log("No authentication tokens found in URL");
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", { 
        event, 
        sessionExists: !!session,
        userEmail: session?.user?.email
      });
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in detected, navigating to onboarding");
        toast.success("Successfully signed in!");
        navigate("/onboarding");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Authentication error details:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return 'Invalid credentials or expired link. Please try again.';
        case 422:
          return 'Invalid email format. Please check your email address.';
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