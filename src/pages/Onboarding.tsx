import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const Onboarding = () => {
  const [accepted, setAccepted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setIsGoogle(session.user.app_metadata.provider === "google");
    };
    checkAuth();
  }, [navigate]);

  const handleAccept = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ terms_accepted: true })
      .eq("id", session.user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
      return;
    }

    setShowWelcome(true);
  };

  const handleComplete = () => {
    setShowWelcome(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">One Last Step</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Please review and accept our terms and conditions
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              <section>
                <h2 className="text-xl font-bold mb-2">Terms and Conditions</h2>
                <p>[Placeholder for Terms and Conditions]</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-2">Privacy Policy</h2>
                <p>[Placeholder for Privacy Policy]</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-2">GDPR Compliance</h2>
                <p>[Placeholder for GDPR information]</p>
              </section>
            </div>
          </ScrollArea>

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the terms and conditions, privacy policy, and GDPR compliance
            </label>
          </div>

          <Button
            className="w-full mt-4"
            disabled={!accepted}
            onClick={handleAccept}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Neuralitix! 🎉</DialogTitle>
            <DialogDescription className="space-y-4">
              {isGoogle ? (
                <>
                  <p>Your journey to discovering the best GenAI tools starts now.</p>
                  <div>
                    <p className="font-bold">Pro Tips for Your Journey:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Use the search bar and the AI assistant to quickly find tools by category or purpose.</li>
                      <li>Save your favorites to build a custom toolkit.</li>
                      <li>Share insights or submit tools to grow our community.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p>Your email has been successfully verified! You're now ready to explore the #1 AI data aggregator</p>
                  <div>
                    <p className="font-bold">Pro Tips for Your Journey:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Use the search bar and the AI assistant to quickly find tools by category or purpose.</li>
                      <li>Save your favorites to build a custom toolkit.</li>
                      <li>Share insights or submit tools to grow our community.</li>
                    </ul>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleComplete}>
            {isGoogle ? "Let's Go ➡️" : "Log in ➡️"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;