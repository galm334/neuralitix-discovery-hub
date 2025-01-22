import { useState } from "react";
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

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState(generateNickname());
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshProfile, session } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!session?.user) {
      logger.error("No session found during onboarding submission");
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

        if (uploadError) throw uploadError;

        logger.info("Profile picture uploaded successfully");
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
        logger.info("Generated public URL for profile picture:", avatarUrl);
      }

      const profileData = {
        id: session.user.id,
        nickname,
        name,
        avatar_url: avatarUrl,
        terms_accepted: true,
        email: session.user.email
      };

      logger.info("Creating profile with data:", profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) throw profileError;

      logger.info("Profile created successfully");
      await refreshProfile();
      
      showToast.success("Profile created successfully!");

    } catch (error) {
      logger.error("Error during onboarding submission:", error);
      showToast.error(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};
