import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const parseHashParams = (hash: string) => {
    if (!hash) return {};
    const params = new URLSearchParams(hash.replace('#', ''));
    return Object.fromEntries(params.entries());
  };

  useEffect(() => {
    const handleAuth = async () => {
      console.log("=== Starting Authentication Flow ===");
      setIsLoading(true);

      try {
        // Parse both URL parameters and hash parameters
        const allParams = {
          ...Object.fromEntries(searchParams.entries()),
          ...parseHashParams(location.hash)
        };
        console.log("Auth parameters:", allParams);

        const accessToken = allParams.access_token;
        const refreshToken = allParams.refresh_token;
        const hasError = allParams.error;
        const errorDescription = allParams.error_description;

        // If this is a magic link callback with tokens
        if (accessToken && refreshToken) {
          console.log("Processing magic link authentication...");
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error("Error setting session:", error);
            setErrorMessage(error.message);
            setIsLoading(false);
            return;
          }

          if (session) {
            console.log("Successfully established session");
            // Navigation will be handled by AuthContext
            setIsLoading(false);
            return;
          }
        } else if (hasError) {
          console.error("Auth error:", errorDescription);
          setErrorMessage(errorDescription || 'An error occurred during authentication');
        }
      } catch (error) {
        console.error("Unexpected error during auth:", error);
        setErrorMessage("An unexpected error occurred");
      }

      setIsLoading(false);
    };

    handleAuth();
  }, [navigate, searchParams, location.hash]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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