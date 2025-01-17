import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from email verification
    const type = searchParams.get('type');
    if (type === 'signup' && searchParams.get('error_description') === 'Email already confirmed') {
      setShowSuccess(true);
      toast.success("Email verified successfully! Please sign in.");
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Neuralitix</h1>
          <p className="text-muted-foreground">Sign in or create an account to continue</p>
          {showSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
              Email verified successfully! Please sign in with your credentials.
            </div>
          )}
        </div>

        <SupabaseAuth 
          supabaseClient={supabase}
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
              input: {
                backgroundColor: 'white',
                color: '#1F2937',
                borderColor: '#E5E7EB',
              },
              label: {
                color: '#F9FAFB',
              },
              button: {
                backgroundColor: '#6366F1',
                color: '#ffffff',
              },
              anchor: {
                color: '#6366F1',
              }
            }
          }}
          providers={[]}
          showLinks={true}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                password_label: 'Password',
                password_input_placeholder: 'Your password',
                email_label: 'Email',
                email_input_placeholder: 'Your email',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
                link_text: "Don't have an account? Sign up",
              },
              sign_up: {
                password_label: 'Password',
                password_input_placeholder: 'Your password',
                email_label: 'Email',
                email_input_placeholder: 'Your email',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                link_text: "Already have an account? Sign in",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Auth;