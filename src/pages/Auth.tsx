import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/toast-config";

const Auth = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("Auth state changed:", { event, hasSession: !!session?.user });

      if (session?.user?.id) {
        try {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            logger.error("Error checking profile:", profileError);
            showToast.error("Error checking profile status");
            return;
          }

          if (!profile?.id) {
            logger.info("No profile found, redirecting to onboarding", { userId: session.user.id });
            navigate('/onboarding', { replace: true });
          } else {
            logger.info("Profile exists, redirecting to home", { userId: session.user.id });
            navigate('/', { replace: true });
          }
        } catch (error) {
          logger.error("Error in auth flow:", error);
          showToast.error("Authentication error occurred");
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => navigate(-1)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in with magic link to continue
          </p>
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