import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { WelcomeDialog } from "@/components/onboarding/WelcomeDialog";
import { TermsDialog } from "@/components/onboarding/TermsDialog";
import { terms } from "@/data/terms";

const Onboarding = () => {
  const [showTerms, setShowTerms] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);
  const navigate = useNavigate();

  useAuthRedirect();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setIsGoogle(session.user.app_metadata.provider === "google");
    };
    checkAuth();
  }, []);

  const handleAccept = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ terms_accepted: true })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return;
    }

    setShowTerms(false);
    setShowWelcome(true);
  };

  const handleComplete = () => {
    setShowWelcome(false);
    // Use replace to prevent going back to onboarding
    navigate("/", { replace: true });
  };

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