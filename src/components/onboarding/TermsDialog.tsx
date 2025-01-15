import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface TermsDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  termsContent: string;
}

export const TermsDialog = ({ isOpen, onAccept, termsContent }: TermsDialogProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: termsContent }} />
        </ScrollArea>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the terms and conditions
            </label>
          </div>
          <Button onClick={onAccept} disabled={!accepted}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};