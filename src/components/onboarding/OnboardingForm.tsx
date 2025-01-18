import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname-generator";
import { showToast } from "@/utils/toast-config";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingFields } from "./OnboardingFields";
import { TermsAcceptance } from "./TermsAcceptance";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState(generateNickname());
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { session, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
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

    if (!session?.user?.id) {
      showToast.error("No active session found");
      navigate("/auth", { replace: true });
      return;
    }

    setIsSubmitting(true);
    setProgress(25);

    try {
      let avatarUrl = null;

      if (profilePic) {
        setProgress(40);
        const fileExt = profilePic.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePic);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      setProgress(70);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name,
          nickname,
          avatar_url: avatarUrl,
          terms_accepted: true,
          email: session.user.email
        });

      if (profileError) throw profileError;

      setProgress(90);
      await refreshProfile();
      setProgress(100);

      showToast.success("Profile created successfully!");
      navigate("/", { replace: true });

    } catch (error) {
      logger.error("Profile creation failed:", error);
      showToast.error("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {isSubmitting && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              {progress < 100 ? "Setting up your profile..." : "Almost there..."}
            </p>
          </div>
        )}
      </form>
    </>
  );
};