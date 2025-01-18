import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      logger.info("🔐 [Auth] Starting magic link authentication...");
      try {
        // Parse both URL parameters and hash parameters
        const allParams = {
          ...Object.fromEntries(searchParams.entries()),
          ...parseHashParams(location.hash)
        };
        logger.info("🔍 [Auth] Auth parameters:", allParams);

        // Check for error parameters in the URL hash
        if (allParams.error) {
          logger.error("❌ [Auth] Error from URL:", allParams.error, allParams.error_description);
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
          return;
        }

        logger.info("✅ [Auth] No errors in URL parameters");
      } catch (error) {
        logger.error("❌ [Auth] Unexpected error during auth:", error);
        setErrorMessage("An unexpected error occurred");
      }
    };

    handleAuth();
  }, [searchParams, location.hash]);

  const parseHashParams = (hash: string) => {
    if (!hash) return {};
    const params = new URLSearchParams(hash.replace('#', ''));
    return Object.fromEntries(params.entries());
  };

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