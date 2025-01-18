import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

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
      if (sessionError) throw sessionError;
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      setProgress(50);

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

      await refreshProfile();
      setProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        onComplete();
        navigate("/", { replace: true });
        toast.success("Welcome to Neuralitix! Your profile has been created.");
      }, 500);

    } catch (error) {
      console.error("Error in profile creation:", error);
      toast.error("Failed to create profile. Please try again.");
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
            <DialogTitle className="text-2xl">Welcome to Neuralitix! 🎉</DialogTitle>
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
            <p className="text-center text-muted-foreground">Setting up your profile...</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};