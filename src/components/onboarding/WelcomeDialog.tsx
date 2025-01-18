import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";
import { verifyProfile } from "./ProfileVerification";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const createProfile = async () => {
    if (isCreatingProfile) return;
    
    setIsCreatingProfile(true);
    setProgress(25);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user?.id) {
        throw new Error(sessionError?.message || "No user session found");
      }

      setProgress(50);

      // Get user metadata with fallbacks
      const fullName = session.user.user_metadata?.full_name || 'User';
      const avatarUrl = session.user.user_metadata?.avatar_url || null;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: session.user.id,
            terms_accepted: true,
            name: fullName,
            avatar_url: avatarUrl
          }
        ]);

      if (profileError) throw profileError;

      setProgress(75);
      await refreshProfile();
      
      // Simple verification
      const isVerified = await verifyProfile(session.user.id);
      if (!isVerified) throw new Error("Profile verification failed");

      setProgress(100);
      onComplete();
      navigate("/", { replace: true });
      showToast.success("Welcome to Neuralitix!");

    } catch (error) {
      logger.error("Profile creation failed", error);
      showToast.error("Failed to create profile. Please try again.");
      setIsCreatingProfile(false);
      navigate("/auth", { replace: true });
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