import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authType = searchParams.get("type") || "signin";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

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
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session check error:', sessionError);
        toast.error("Error checking authentication status");
        return;
      }
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
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={() => navigate("/")}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            {authType === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {authType === "signup" 
              ? "Sign up to get started with Neuralitix" 
              : "Sign in to continue to Neuralitix"}
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
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
                  container: 'w-full space-y-4',
                  button: 'w-full',
                },
                style: {
                  input: {
                    borderColor: 'rgb(var(--border))',
                  },
                  ...(authType === "signup" && {
                    button: {
                      display: passwordsMatch ? 'block' : 'none'
                    }
                  })
                }
              }}
              providers={[]}
              redirectTo={window.location.origin}
              onPasswordInput={(e) => {
                const target = e.target as HTMLInputElement;
                setPassword(target.value);
              }}
            />
          </div>

          <div className="w-72">
            <div className="bg-background border rounded-lg p-4 shadow-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;