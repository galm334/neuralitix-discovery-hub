import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { generateNickname } from "@/utils/nickname-generator";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";
import { supabase } from "@/integrations/supabase/client";
import { ProfilePictureInput } from "./ProfilePictureInput";
import { ProgressDialog } from "./ProgressDialog";
import { verifyProfile } from "./ProfileVerification";

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { refreshProfile, session } = useAuth();

  useEffect(() => {
    setNickname(generateNickname());
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!session?.user) {
      logger.error("No session found during onboarding submission");
      navigate("/auth");
      return;
    }

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

    setIsSubmitting(true);
    setShowProgress(true);
    setProgress(20);

    try {
      let avatarUrl = null;
      logger.info("Starting profile creation process");

      if (profilePic) {
        logger.info("Uploading profile picture");
        const fileExt = profilePic.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePic);

        if (uploadError) {
          logger.error("Profile picture upload error:", uploadError);
          throw new Error("Failed to upload profile picture: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
        logger.info("Profile picture uploaded successfully");
      }

      setProgress(60);

      const profileData = {
        id: session.user.id,
        nickname,
        name,
        avatar_url: avatarUrl,
        terms_accepted: true,
        email: session.user.email
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (upsertError) {
        throw new Error("Failed to create profile: " + upsertError.message);
      }

      setProgress(80);

      const isVerified = await verifyProfile(session.user.id);
      if (!isVerified) {
        throw new Error("Profile creation verification failed");
      }

      setProgress(100);
      await refreshProfile();
      
      showToast.success("Profile created successfully!");
      navigate("/", { replace: true });

    } catch (error) {
      logger.error("Error during onboarding submission:", error);
      showToast.error(error instanceof Error ? error.message : "Failed to create profile");
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Your Real Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Your real name"
              required
            />
          </div>

          <div>
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {session?.user?.email && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session.user.email}
                disabled
                className="mt-1 bg-background text-foreground border-input"
              />
            </div>
          )}

          <ProfilePictureInput onFileSelect={setProfilePic} />

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={onShowTerms}
              className="h-4 w-4"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms of Service
              </a>
              {" "}and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
              , and I consent to the processing of my personal data in accordance with{" "}
              <a
                href="/gdpr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GDPR
              </a>
              {" "}regulations.
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>

      <ProgressDialog 
        showProgress={showProgress}
        progress={progress}
        retryCount={retryCount}
      />
    </>
  );
};
