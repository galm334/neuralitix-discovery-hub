import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { TermsDialog } from "@/components/onboarding/TermsDialog";
import { terms } from "@/data/terms";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const [showTerms, setShowTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

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

        // Check if profile exists and terms are accepted
        const { data: profile } = await supabase
          .from("profiles")
          .select("terms_accepted")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.terms_accepted) {
          navigate("/", { replace: true });
          return;
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

  const handleAcceptTerms = async () => {
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
        toast.error("Failed to accept terms. Please try again.");
        return;
      }

      await refreshProfile();
      setShowTerms(false);
      // Redirect to auth page for login
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error in handleAcceptTerms:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TermsDialog 
        isOpen={showTerms} 
        onAccept={handleAcceptTerms}
        termsContent={terms}
      />
    </div>
  );
};

export default Onboarding;