import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const createProfile = async () => {
    logger.info("Starting profile creation process");
    if (isCreatingProfile) {
      logger.warn("Profile creation already in progress");
      return;
    }
    
    setIsCreatingProfile(true);
    setProgress(25);

    try {
      logger.info("Creating guest profile");
      setProgress(90);
      
      logger.info("Profile creation complete");
      setProgress(100);
      onComplete();
      navigate("/", { replace: true });
      showToast.success("Welcome to Neuralitix!");

    } catch (error) {
      logger.error("Error in profile creation", error);
      showToast.error("Failed to create profile. Please try again later.");
      setIsCreatingProfile(false);
      setProgress(0);
      navigate("/", { replace: true });
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};