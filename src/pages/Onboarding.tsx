import { useState, useEffect } from "react";
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
  const navigate = useNavigate();

  useAuthRedirect();

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
      // First, close the welcome dialog
      setShowWelcome(false);
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to home and replace the current history entry
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error in handleComplete:", error);
      setIsCompleting(false);
      toast.error("Navigation failed. Please try again.");
    }
  };

  // Prevent going back to onboarding if terms are accepted
  useEffect(() => {
    const checkTermsAccepted = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("terms_accepted")
        .eq("id", session.user.id)
        .single();

      if (profile?.terms_accepted) {
        navigate("/", { replace: true });
      }
    };

    checkTermsAccepted();
  }, [navigate]);

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