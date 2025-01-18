import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";

interface OnboardingData {
  name: string;
  nickname: string;
  profilePic: File | null;
}

export const useOnboardingSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { refreshProfile, session } = useAuth();

  const handleSubmit = async (data: OnboardingData) => {
    if (!session?.user) {
      logger.error("No session found during onboarding submission");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    setProgress(20);

    try {
      let avatarUrl = null;
      logger.info("Starting profile creation process");

      if (data.profilePic) {
        logger.info("Uploading profile picture");
        const fileExt = data.profilePic.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, data.profilePic);

        if (uploadError) {
          throw new Error("Failed to upload profile picture: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      setProgress(60);

      const profileData = {
        id: session.user.id,
        nickname: data.nickname,
        name: data.name,
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
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    progress,
    retryCount
  };
};