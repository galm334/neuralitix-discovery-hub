import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { logger } from "@/utils/logger";

const Onboarding = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      logger.warn("No session found, redirecting to auth");
      navigate("/auth");
    }
  }, [session, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your profile to get started
          </p>
        </div>

        <OnboardingForm
          onShowTerms={() => setTermsAccepted(true)}
          termsAccepted={termsAccepted}
        />
      </div>
    </div>
  );
};

export default Onboarding;