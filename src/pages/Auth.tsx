import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthError } from "@supabase/supabase-js";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("type") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    const isVerificationCallback = searchParams.get("verification") === "success";
    if (isVerificationCallback) {
      // Remove verification parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("verification");
      setSearchParams(newParams);
      
      toast(
        <div className="flex flex-col gap-4 max-w-md">
          <div className="text-xl font-bold">Welcome to Neuralitix! 🎉</div>
          <p className="text-base">Your email has been successfully verified! You're now ready to explore the #1 AI data aggregator</p>
          <div className="space-y-2">
            <div className="font-bold text-lg">Pro Tips for Your Journey:</div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span>👉</span>
                <span>Use the search bar and the AI assistant to quickly find tools by category or purpose.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>👉</span>
                <span>Save your favorites to build a custom toolkit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>👉</span>
                <span>Share insights or submit tools to grow our community.</span>
              </li>
            </ul>
          </div>
        </div>,
        {
          duration: 10000,
          action: {
            label: "Log in ➡️",
            onClick: () => {
              emailInputRef.current?.focus();
            },
          },
        }
      );
    }

    checkSession();
  }, [navigate, searchParams, setSearchParams]);

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    const errorMessage = error.message === 'Invalid login credentials'
      ? 'Invalid email or password'
      : error.message;
    setAuthError(errorMessage);
    toast.error(errorMessage);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?verification=success`,
          },
        });

        if (error) throw error;
        toast.success("Check your email to verify your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;
        toast.success("Successfully signed in!");
        navigate("/");
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
                form.reset();
                // Update URL parameter
                const newParams = new URLSearchParams(searchParams);
                newParams.set("type", isSignUp ? "signin" : "signup");
                setSearchParams(newParams);
              }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Button>
          </p>
        </div>

        {authError && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {authError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      ref={emailInputRef}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </div>
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Auth;
