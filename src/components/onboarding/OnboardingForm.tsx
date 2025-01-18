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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { refreshProfile, session } = useAuth();

  useEffect(() => {
    setNickname(generateNickname());
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("File size must be less than 5MB");
        return;
      }
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const verifyProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('id', userId)
        .single();
      
      if (error) {
        logger.error("Profile verification error:", error);
        return false;
      }
      
      return !!data && !!data.nickname;
    } catch (error) {
      logger.error("Profile verification failed:", error);
      return false;
    }
  };

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

    setIsSubmitting(true);
    setShowProgress(true);
    setProgress(0);

    try {
      let avatarUrl = null;

      // Start progress
      setProgress(20);

      if (profilePic) {
        const fileExt = profilePic.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePic);

        if (uploadError) {
          logger.error("Profile picture upload error:", uploadError);
          throw uploadError;
        }

        setProgress(40);

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      setProgress(60);

      const profileData = {
        nickname,
        name,
        avatar_url: avatarUrl,
        terms_accepted: true
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', session.user.id);

      if (updateError) {
        logger.error("Profile update error:", updateError);
        throw updateError;
      }

      setProgress(80);

      // Verify profile creation with timeout
      let profileCreated = false;
      const startTime = Date.now();
      while (Date.now() - startTime < 6000) {
        profileCreated = await verifyProfile(session.user.id);
        if (profileCreated) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!profileCreated) {
        throw new Error("Profile creation verification timeout");
      }

      setProgress(100);

      await refreshProfile();
      showToast.success("Profile created successfully!");
      navigate("/");

    } catch (error) {
      logger.error("Error during onboarding submission:", error);
      showToast.error("Failed to create profile. Please try again.");
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

          <div>
            <Label htmlFor="avatar">Profile Picture (optional)</Label>
            <div className="mt-1 flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
          </div>

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

      <Dialog open={showProgress} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Creating your profile...
            </p>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};