import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeDialog = ({ isOpen, onComplete }: WelcomeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Neuralitix!</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Thank you for joining our platform. We're excited to have you here!</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onComplete}>Next</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};