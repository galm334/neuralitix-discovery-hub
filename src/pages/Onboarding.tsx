import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { WelcomeDialog } from "@/components/onboarding/WelcomeDialog";
import { TermsDialog } from "@/components/onboarding/TermsDialog";
import { terms } from "@/data/terms";
import { toast } from "sonner";

const Onboarding = () => {
  const [showTerms, setShowTerms] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useAuthRedirect();

  // Initial check for session and profile
  useEffect(() => {
    const checkSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        // Wait for profile to be created (important for Google sign-in)
        let retries = 0;
        const maxRetries = 5;
        
        while (retries < maxRetries) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("terms_accepted")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            break;
          }

          if (profile) {
            if (profile.terms_accepted) {
              navigate("/", { replace: true });
            }
            break;
          }

          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error in checkSessionAndProfile:", error);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    };

    checkSessionAndProfile();
  }, [navigate]);

  const handleAccept = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please login again.");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ terms_accepted: true })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Something went wrong. Please try again.");
        return;
      }

      setShowTerms(false);
      setShowWelcome(true);
    } catch (error) {
      console.error("Error in handleAccept:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      setShowWelcome(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error in handleComplete:", error);
      setIsCompleting(false);
      toast.error("Navigation failed. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TermsDialog 
        isOpen={showTerms} 
        onAccept={handleAccept}
        termsContent={terms}
      />
      <WelcomeDialog 
        isOpen={showWelcome} 
        onComplete={handleComplete}
      />
    </div>
  );
};

export default Onboarding;