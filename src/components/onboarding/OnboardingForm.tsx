import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname-generator";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingFormProps {
  onShowTerms: () => void;
  termsAccepted: boolean;
}

export const OnboardingForm = ({ onShowTerms, termsAccepted }: OnboardingFormProps) => {
  const [nickname, setNickname] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!session?.user) {
      logger.error("No session found during onboarding submission");
      navigate("/auth");
      return;
    }

    if (!termsAccepted) {
      onShowTerms();
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl = null;

      if (profilePic) {
        const fileExt = profilePic.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePic);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nickname,
          avatar_url: avatarUrl,
          terms_accepted: true
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      showToast.success("Profile created successfully!");
      navigate("/");

    } catch (error) {
      logger.error("Error during onboarding submission:", error);
      showToast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            readOnly
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I accept the{" "}
            <button
              type="button"
              onClick={onShowTerms}
              className="text-primary hover:underline"
            >
              terms and conditions
            </button>
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