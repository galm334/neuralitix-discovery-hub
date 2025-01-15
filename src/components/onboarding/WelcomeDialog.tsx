import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  const navigate = useNavigate();

  const handleComplete = () => {
    onComplete();
    navigate("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Neuralitix! 🎉</DialogTitle>
        </DialogHeader>
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
          <Button onClick={handleComplete}>Let's Go ➡️</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};