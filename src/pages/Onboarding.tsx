import { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { logger } from "@/utils/logger";

// Lazy load the WelcomeDialog component
const WelcomeDialog = lazy(() => import('@/components/onboarding/WelcomeDialog').then(module => ({
  default: module.WelcomeDialog
})));

const Onboarding = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

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

        <Suspense fallback={<div>Loading...</div>}>
          <WelcomeDialog isOpen={false} onComplete={() => {}} />
        </Suspense>
      </div>
    </div>
  );
};

export default Onboarding;