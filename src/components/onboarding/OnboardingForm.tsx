import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname-generator";
import { showToast } from "@/utils/toast-config";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingFields } from "./OnboardingFields";
import { TermsAcceptance } from "./TermsAcceptance";
import { ProgressDialog } from "./ProgressDialog";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const { session } = useAuth();
  const { handleSubmit, isSubmitting, progress, retryCount } = useOnboardingSubmit();

  useEffect(() => {
    setNickname(generateNickname());
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!termsAccepted) {
      showToast.error("Please accept the terms and conditions");
      return;
    }

    if (!name.trim()) {
      showToast.error("Please enter your name");
      return;
    }

    if (!nickname.trim()) {
      showToast.error("Please enter a nickname");
      return;
    }

    await handleSubmit({ name, nickname, profilePic });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <OnboardingFields
          name={name}
          setName={setName}
          nickname={nickname}
          setNickname={setNickname}
          email={session?.user?.email}
          onFileSelect={setProfilePic}
        />

        <TermsAcceptance
          termsAccepted={termsAccepted}
          onShowTerms={onShowTerms}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>

      {isSubmitting && (
        <ProgressDialog 
          showProgress={isSubmitting}
          progress={progress}
          retryCount={retryCount}
        />
      )}
    </>
  );
};