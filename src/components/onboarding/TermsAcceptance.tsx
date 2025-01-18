import { Checkbox } from "@/components/ui/checkbox";

interface TermsAcceptanceProps {
  termsAccepted: boolean;
  onShowTerms: () => void;
}

export const TermsAcceptance = ({ termsAccepted, onShowTerms }: TermsAcceptanceProps) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="terms"
        checked={termsAccepted}
        onCheckedChange={onShowTerms}
        className="h-4 w-4"
      />
      <label htmlFor="terms" className="text-sm text-muted-foreground">
        I agree to the{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Terms of Service
        </a>
        {" "}and{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Privacy Policy
        </a>
        , and I consent to the processing of my personal data in accordance with{" "}
        <a
          href="/gdpr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GDPR
        </a>
        {" "}regulations.
      </label>
    </div>
  );
};