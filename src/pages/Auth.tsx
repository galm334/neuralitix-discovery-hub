import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const parseHashParams = (hash: string) => {
    if (!hash) return {};
    const params = new URLSearchParams(hash.replace('#', ''));
    return Object.fromEntries(params.entries());
  };

  useEffect(() => {
    const handleAuth = async () => {
      console.log("🔐 [Auth] Starting magic link authentication...");
      setIsLoading(true);

      try {
        // Parse both URL parameters and hash parameters
        const allParams = {
          ...Object.fromEntries(searchParams.entries()),
          ...parseHashParams(location.hash)
        };
        console.log("🔍 [Auth] Auth parameters:", allParams);

        // Check for error parameters in the URL hash
        if (allParams.error) {
          console.error("❌ [Auth] Error from URL:", allParams.error, allParams.error_description);
          switch (allParams.error_code) {
            case 'otp_expired':
              setErrorMessage("The magic link has expired. Please request a new one.");
              break;
            case 'invalid_otp':
              setErrorMessage("Invalid magic link. Please request a new one.");
              break;
            default:
              setErrorMessage(allParams.error_description || "Authentication failed. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        const accessToken = allParams.access_token;
        const refreshToken = allParams.refresh_token;
        const type = allParams.type;

        // If this is a magic link callback
        if (type === 'recovery' || type === 'magiclink') {
          console.log("✨ [Auth] Processing magic link authentication...");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error("❌ [Auth] Error setting session:", error);
            setErrorMessage(error.message);
          } else {
            console.log("✅ [Auth] Magic link authentication successful");
          }
        }
      } catch (error) {
        console.error("❌ [Auth] Unexpected error during auth:", error);
        setErrorMessage("An unexpected error occurred");
      }

      setIsLoading(false);
    };

    handleAuth();
  }, [searchParams, location.hash]);

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
          <p className="text-muted-foreground">Sign up with magic link to continue</p>
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