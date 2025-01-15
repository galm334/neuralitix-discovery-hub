import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";
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
          <DialogTitle className="text-3xl font-bold text-center mb-4">One last step</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4 border rounded-md">
          <div className="prose prose-sm p-4" dangerouslySetInnerHTML={{ __html: termsContent }} />
        </ScrollArea>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the{" "}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                terms and conditions
              </a>
              ,{" "}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                privacy policy <ExternalLink className="inline h-3 w-3" />
              </a>
              {" "}and{" "}
              <a 
                href="/gdpr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GDPR policy <ExternalLink className="inline h-3 w-3" />
              </a>
            </label>
          </div>
          <Button onClick={onAccept} disabled={!accepted}>Next</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};