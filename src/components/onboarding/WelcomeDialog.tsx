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
    console.log("🚀 Starting profile creation process");
    if (isCreatingProfile) {
      console.log("⚠️ Profile creation already in progress");
      return;
    }
    
    setIsCreatingProfile(true);
    setProgress(25);

    try {
      console.log("🔍 Fetching current session");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        throw sessionError;
      }
      
      if (!session?.user?.id) {
        console.error("❌ No user session found");
        throw new Error("No user session found");
      }

      console.log("✅ Session found for user:", session.user.email);
      setProgress(50);

      console.log("📝 Creating profile record");
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
        console.error("❌ Profile creation error:", profileError);
        throw profileError;
      }

      console.log("✅ Profile created successfully");
      setProgress(75);

      console.log("🔄 Refreshing profile data");
      await refreshProfile();
      console.log("✅ Profile refresh complete");
      setProgress(100);
      
      // Increased timeout and added state check
      console.log("⏳ Waiting for state updates to complete");
      setTimeout(async () => {
        try {
          const { data: { session: finalSession } } = await supabase.auth.getSession();
          if (!finalSession) {
            console.error("❌ No session after state update");
            throw new Error("Session validation failed");
          }
          
          console.log("✅ Session validated, completing onboarding");
          onComplete();
          navigate("/", { replace: true });
          toast.success("Welcome to Neuralitix! Your profile has been created.");
        } catch (error) {
          console.error("❌ Final session validation error:", error);
          toast.error("Error completing profile setup. Please try again.");
          setIsCreatingProfile(false);
        }
      }, 6000);

    } catch (error) {
      console.error("❌ Error in profile creation:", error);
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
              Please wait while we complete your setup...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};