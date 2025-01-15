import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authType = searchParams.get("type") || "signin";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password validation criteria
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  useEffect(() => {
    setPasswordValid(
      hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    );
  }, [password]);

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword && password.length > 0);
  }, [password, confirmPassword]);

  useEffect(() => {
    setShowPasswordRequirements(password.length >= 3 && !passwordValid);
  }, [password, passwordValid]);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session check error:', sessionError);
        toast.error("Error checking authentication status");
        return;
      }
      if (session) {
        console.log('Existing session found:', session);
        navigate("/");
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session);

      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            console.log('User signed in successfully');
            navigate("/");
          } else {
            console.error('SIGNED_IN event but no session');
            toast.error("Sign in failed. Please try again.");
          }
          break;

        case 'USER_UPDATED':
          console.log('User updated');
          if (session) navigate("/");
          break;

        case 'SIGNED_OUT':
          console.log('User signed out');
          navigate("/auth");
          break;

        default:
          console.log('Unhandled auth event:', event);
      }
    });

    // Setup password change listener
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        setPassword(target.value);
        setShowPasswordRequirements(target.value.length >= 3);
      });
    }

    return () => {
      subscription.unsubscribe();
      // Cleanup password listener
      if (passwordInput) {
        passwordInput.removeEventListener('input', () => {});
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 -mt-2 -mr-2"
          onClick={() => navigate("/")}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>

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
        
        <div className="relative">
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
                    inputText: 'rgb(0, 0, 0)',
                    inputBackground: 'rgb(255, 255, 255)',
                    inputBorder: 'rgb(var(--border))',
                    inputLabelText: 'rgb(255, 255, 255)',
                    inputPlaceholder: 'rgb(150, 150, 150)',
                  }
                }
              },
              className: {
                input: 'h-12 w-full text-black bg-white',
                label: 'text-foreground',
                container: 'w-full',
                button: 'w-full',
              }
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />

          {authType === "signup" && password.length >= 3 && (
            <div className="mt-4 w-full">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-12 w-full bg-white text-black ${passwordsMatch ? 'border-green-500' : 'border-input'}`}
              />
              {confirmPassword.length > 0 && (
                <p className={`text-sm ${passwordsMatch ? 'text-green-500' : 'text-destructive'} flex items-center gap-2 mt-1`}>
                  {passwordsMatch ? (
                    <>
                      <Check size={16} /> Passwords match
                    </>
                  ) : (
                    'Passwords do not match'
                  )}
                </p>
              )}
            </div>
          )}

          {showPasswordRequirements && (
            <div className="absolute left-full ml-4 top-0 w-64 bg-background border rounded-lg p-4 shadow-lg">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hasMinLength ? <Check size={16} /> : '•'} At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hasUpperCase ? <Check size={16} /> : '•'} One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${hasLowerCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hasLowerCase ? <Check size={16} /> : '•'} One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hasNumber ? <Check size={16} /> : '•'} One number
                </li>
                <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hasSpecialChar ? <Check size={16} /> : '•'} One special character
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;