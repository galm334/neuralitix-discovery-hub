import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TermsDialog } from "@/components/onboarding/TermsDialog";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { terms } from "@/data/terms";
import { logger } from "@/utils/logger";

// Lazy load the WelcomeDialog component
const WelcomeDialog = lazy(() => import('@/components/onboarding/WelcomeDialog').then(module => ({
  default: module.WelcomeDialog
})));

const Onboarding = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      logger.warn("No session found, redirecting to auth");
      navigate("/auth");
    }
  }, [session, navigate]);

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
          onShowTerms={() => setShowTerms(true)}
          termsAccepted={termsAccepted}
        />

        <Suspense fallback={<div>Loading...</div>}>
          <WelcomeDialog isOpen={false} onComplete={() => {}} />
        </Suspense>

        <TermsDialog 
          isOpen={showTerms}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTerms(false);
          }}
          termsContent={terms}
        />
      </div>
    </div>
  );
};

export default Onboarding;