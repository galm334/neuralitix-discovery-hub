import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

interface ProgressDialogProps {
  showProgress: boolean;
  progress: number;
  retryCount: number;
}

export const ProgressDialog = ({ showProgress, progress, retryCount }: ProgressDialogProps) => {
  return (
    <Dialog open={showProgress} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-lg font-semibold">
          Creating Your Profile
        </DialogTitle>
        <DialogDescription>
          Please wait while we set up your account...
        </DialogDescription>
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            {progress < 100 ? "Setting up your profile..." : "Almost there..."}
          </p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {retryCount > 0 ? `Retry attempt ${retryCount}/3...` : "Please wait while we complete your setup..."}
          </p>
          {retryCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};