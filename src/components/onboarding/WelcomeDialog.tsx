import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, RefreshCw } from "lucide-react";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const verifyProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (error || !data) throw new Error("Profile verification failed");
    return data;
  };

  const createProfile = async () => {
    logger.info("Starting profile creation process");
    if (isCreatingProfile) {
      logger.warn("Profile creation already in progress");
      return;
    }
    
    setIsCreatingProfile(true);
    setProgress(25);

    try {
      logger.info("Fetching current session");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error("Session error", sessionError);
        throw sessionError;
      }
      
      if (!session?.user?.id) {
        logger.error("No user session found");
        throw new Error("No user session found");
      }

      logger.info("Session found", { email: session.user.email });
      setProgress(50);

      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (existingProfile) {
        logger.info("Profile already exists, proceeding to home");
        setProgress(100);
        onComplete();
        navigate("/", { replace: true });
        return;
      }

      // Get user metadata with fallbacks
      const fullName = session.user.user_metadata?.full_name || 'User';
      const avatarUrl = session.user.user_metadata?.avatar_url || null;

      logger.info("Creating profile record", { fullName });
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: session.user.id,
            terms_accepted: true,
            name: fullName,
            avatar_url: avatarUrl
          }
        ]);

      if (profileError) {
        logger.error("Profile creation error", profileError);
        throw profileError;
      }

      logger.info("Profile created successfully");
      setProgress(75);

      logger.info("Refreshing profile data");
      await refreshProfile();
      
      logger.info("Profile refresh complete");
      setProgress(90);

      // Verify profile creation
      await verifyProfile(session.user.id);

      logger.info("Profile verified, completing onboarding");
      setProgress(100);
      onComplete();
      navigate("/", { replace: true });
      showToast.success("Welcome to Neuralitix! Your profile has been created.");

    } catch (error) {
      logger.error("Error in profile creation", error);
      
      if (retryCount < 3) {
        showToast.error("Profile creation failed. Retrying...");
        setRetryCount(prev => prev + 1);
        setProgress(0);
        setIsCreatingProfile(false);
        // Retry after a short delay
        setTimeout(createProfile, 1000);
      } else {
        showToast.error("Failed to create profile. Please try again later.");
        setIsCreatingProfile(false);
        setProgress(0);
        navigate("/auth", { replace: true });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-primary" />
            <DialogTitle className="text-2xl">
              {isCreatingProfile ? "Creating Your Profile..." : "Welcome to Neuralitix! 🎉"}
            </DialogTitle>
          </div>
        </DialogHeader>
        {!isCreatingProfile ? (
          <>
            <div className="grid gap-4 py-4">
              <p className="text-muted-foreground text-center">
                Your journey to discovering the best GenAI tools starts now.
              </p>
              <div className="space-y-4">
                <p className="font-bold">Pro Tips for Your Journey:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the search bar and the AI assistant to quickly find tools by category or purpose.</li>
                  <li>Save your favorites to build a custom toolkit.</li>
                  <li>Share insights or submit tools to grow our community.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createProfile} className="w-full">Let's Get Started</Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              {progress < 100 ? "Setting up your profile..." : "Almost there..."}
            </p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              {retryCount > 0 ? `Retry attempt ${retryCount}/3...` : "Please wait while we complete your setup..."}
            </p>
            {retryCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Retrying...</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};