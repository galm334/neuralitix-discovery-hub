import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authType = searchParams.get("type") || "signin";

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

    // Check if this is a verification callback
    const isVerificationCallback = searchParams.get("verification") === "success";
    if (isVerificationCallback) {
      setShowVerifiedDialog(true);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === "SIGNED_IN" && session) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const siteUrl = window.location.origin === 'http://localhost:3000' 
        ? 'https://neuralitix.com' 
        : window.location.origin;
      
      const redirectTo = `${siteUrl}/auth?verification=success`;
      console.log('Using redirect URL:', redirectTo);

      if (authType === "signup") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: values.email.split('@')[0],
            }
          }
        });

        if (error) throw error;
        toast.success("Please check your email to verify your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;
        toast.success("Successfully signed in!");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setShowVerifiedDialog(false);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={() => navigate("/")}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            {authType === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-white">
            {authType === "signup"
              ? "Sign up to get started"
              : "Sign in to continue"}
          </p>
        </div>

        {authError && (
          <div className="bg-destructive/15 text-white px-4 py-2 rounded-md">
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
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
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
                        size="icon"
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
                  <FormMessage className="text-white" />
                </FormItem>
              )}
            />

            {authType === "signup" && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Confirm Password</FormLabel>
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
                          size="icon"
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
                    <FormMessage className="text-white" />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : authType === "signup" ? "Sign up" : "Sign in"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-white">
          {authType === "signup" ? (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/auth?type=signin")}
              >
                Sign in
              </Button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/auth?type=signup")}
              >
                Sign up
              </Button>
            </>
          )}
        </p>
      </div>

      <Dialog open={showVerifiedDialog} onOpenChange={setShowVerifiedDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Welcome to Neuralitix! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Your email has been successfully verified! You're now ready to explore the #1 AI data aggregator
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <p className="font-bold">Pro Tips for Your Journey:</p>
              <ul className="list-none space-y-2">
                <li>👉 Use the search bar and the AI assistant to quickly find tools by category or purpose.</li>
                <li>👉 Save your favorites to build a custom toolkit.</li>
                <li>👉 Share insights or submit tools to grow our community.</li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={handleContinue} className="w-full">
                Next ➡️
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;