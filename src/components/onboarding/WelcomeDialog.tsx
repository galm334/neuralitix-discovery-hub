import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const createProfile = async () => {
    if (isCreatingProfile) return;
    setIsCreatingProfile(true);
    setProgress(25);

    try {
      // Get current session and verify it exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      setProgress(50);

      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: session.user.id,
            terms_accepted: true,
            name: session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url
          }
        ]);

      if (profileError) {
        throw profileError;
      }

      setProgress(75);

      // Final session verification
      const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();
      if (finalSessionError) throw finalSessionError;
      if (!finalSession) {
        throw new Error("Session lost during profile creation");
      }

      setProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        onComplete();
        // Redirect to home page
        navigate("/", { replace: true });
        toast.success("Profile created successfully!");
      }, 500);

    } catch (error) {
      console.error("Error in profile creation:", error);
      toast.error("Failed to create profile. Please try again.");
      setIsCreatingProfile(false);
      // On error, redirect to auth page
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Neuralitix! 🎉</DialogTitle>
        </DialogHeader>
        {!isCreatingProfile ? (
          <>
            <div className="grid gap-4 py-4">
              <p className="text-muted-foreground">
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
              <Button onClick={createProfile}>Let's Go ➡️</Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">Creating your profile...</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};