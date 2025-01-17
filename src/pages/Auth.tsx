import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Add custom styles to inject the password toggle button
  const customStyles = {
    container: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: '40px',
    },
    toggleButton: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6366F1',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
    },
  };

  // Inject custom password toggle styles into the page
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .supabase-auth-ui_ui-container div[data-input-type="password"] {
        position: relative;
      }
      .supabase-auth-ui_ui-container input[type="password"],
      .supabase-auth-ui_ui-container input[type="text"][data-type="password"] {
        padding-right: 40px !important;
      }
      .password-toggle-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #6366F1;
        display: flex;
        align-items: center;
        padding: 4px;
        z-index: 10;
      }
      .password-toggle-btn:hover {
        color: #4F46E5;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add password toggle functionality
  useEffect(() => {
    const addPasswordToggles = () => {
      const passwordInputs = document.querySelectorAll<HTMLInputElement>('input[type="password"]');
      passwordInputs.forEach(input => {
        const container = input.parentElement;
        if (container && !container.querySelector('.password-toggle-btn')) {
          const toggleBtn = document.createElement('button');
          toggleBtn.className = 'password-toggle-btn';
          toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-7.333 0-12 6-12 6s4.667 6 12 6 12-6 12-6-4.667-6-12-6Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>';
          toggleBtn.onclick = (e) => {
            e.preventDefault();
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword 
              ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7.333 0 12 6 12 6s-1.737 2.225-4.48 4.08"/><path d="M6.61 6.61A13.526 13.526 0 0 0 0 11s4.667 6 12 6c1.94 0 3.705-.38 5.27-1"/><path d="M2 2l20 20"/></svg>'
              : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-7.333 0-12 6-12 6s4.667 6 12 6 12-6 12-6-4.667-6-12-6Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>';
          };
          container.appendChild(toggleBtn);
        }
      });
    };

    // Add initial password toggles with a delay to ensure DOM is ready
    setTimeout(addPasswordToggles, 500);

    // Monitor for dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          setTimeout(addPasswordToggles, 100);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

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
                link_text: "Don't have an account? Sign up"
              },
              sign_up: {
                password_label: 'Password',
                password_input_placeholder: 'Your password',
                email_label: 'Email',
                email_input_placeholder: 'Your email',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                link_text: "Already have an account? Sign in"
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
