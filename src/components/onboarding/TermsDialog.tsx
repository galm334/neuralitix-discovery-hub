import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  termsContent: string;
}

export const TermsDialog = ({ isOpen, onAccept, termsContent }: TermsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: termsContent }} />
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button onClick={onAccept}>Accept</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};