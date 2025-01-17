import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TermsDialog } from "@/components/onboarding/TermsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { generateNickname } from "@/utils/nickname-generator";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";

// Lazy load the WelcomeDialog component
const WelcomeDialog = lazy(() => import('@/components/onboarding/WelcomeDialog').then(module => ({
  default: module.WelcomeDialog
})));

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile, session } = useAuth();

  useAuthRedirect();

  // Check for session and redirect if not present
  useEffect(() => {
    if (!session) {
      logger.warn("No session found in Onboarding");
      navigate("/auth", { replace: true });
      return;
    }
  }, [session, navigate]);

  useEffect(() => {
    const checkSessionAndSetup = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logger.warn("No active session found");
          navigate("/auth", { replace: true });
          return;
        }

        // Generate a random nickname if user doesn't have one
        if (!nickname) {
          const generatedNickname = generateNickname();
          logger.info("Generated nickname", { nickname: generatedNickname });
          setNickname(generatedNickname);
        }

        setIsLoading(false);
      } catch (error) {
        logger.error("Error in checkSessionAndSetup", error);
        showToast.error("Something went wrong. Please try again.");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkSessionAndSetup();
  }, [navigate, nickname]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showToast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast.error("File size should be less than 500KB");
      return;
    }

    logger.info("Profile picture selected", { fileName: file.name, fileSize: file.size });
    setProfilePic(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup previous preview URL
    return () => URL.revokeObjectURL(objectUrl);
  };

  const uploadProfilePicture = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      logger.info("Profile picture uploaded successfully", { publicUrl });
      return publicUrl;
    } catch (error) {
      logger.error("Error uploading profile picture", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info("Starting profile creation...");
    
    try {
      setIsLoading(true);
      
      if (!session) {
        showToast.error("Session expired. Please login again.");
        navigate("/auth", { replace: true });
        return;
      }

      if (!termsAccepted) {
        showToast.warning("Please accept the terms and conditions");
        return;
      }

      let avatarUrl = null;
      if (profilePic) {
        avatarUrl = await uploadProfilePicture(session.user.id, profilePic);
        if (!avatarUrl) {
          showToast.error("Failed to upload profile picture");
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nickname,
          avatar_url: avatarUrl,
          terms_accepted: termsAccepted,
        })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      logger.info("Profile created successfully");
      showToast.success("Profile created successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      logger.error("Error creating profile", error);
      showToast.error("Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // ... keep existing code (JSX for the form)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your profile before you start exploring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Choose a nickname"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePic">Profile Picture (optional)</Label>
            <Input
              id="profilePic"
              type="file"
              accept={ALLOWED_FILE_TYPES.join(',')}
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the{" "}
              <button
                type="button"
                onClick={() => setTermsAccepted(true)}
                className="text-primary hover:underline"
              >
                terms and conditions
              </button>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!termsAccepted || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Creating Profile...</span>
              </div>
            ) : (
              "Complete Profile"
            )}
          </Button>
        </form>
      </div>

      <Suspense fallback={
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }>
        <WelcomeDialog isOpen={false} onComplete={() => {}} />
      </Suspense>

      <TermsDialog />
    </div>
  );
};

export default Onboarding;
