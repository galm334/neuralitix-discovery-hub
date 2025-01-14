import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { ToolUpdates } from "./ToolUpdates";
import { ToolReviews } from "./ToolReviews";
import { ToolProsAndCons } from "./ToolProsAndCons";
import { ToolFAQ } from "./ToolFAQ";
import { ToolPricing } from "./ToolPricing";

interface ToolPageMobileViewProps {
  updates: any[];
  reviews: any[];
  pros: string[];
  cons: string[];
  faqs: any[];
  pricingTiers: any[];
  scrollToSection: (sectionId: string) => void;
}

export function ToolPageMobileView({
  updates,
  reviews,
  pros,
  cons,
  faqs,
  pricingTiers,
  scrollToSection,
}: ToolPageMobileViewProps) {
  return (
    <div className="mt-8 space-y-12">
      <div id="overview">
        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
        <div className="w-full aspect-[21/9] mb-8 rounded-lg overflow-hidden">
          <img 
            src="/placeholder.svg"
            alt="CodeReviewer AI Featured"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="prose prose-invert max-w-none">
          <h2>What sets CodeReviewer AI apart</h2>
          <p>
            CodeReviewer AI is a cutting-edge AI agent that revolutionizes how we approach tasks. 
            Built with the latest advancements in artificial intelligence and machine learning, 
            it offers an intuitive and powerful solution for professionals and enthusiasts alike.
          </p>
          <div className="mt-8">
            <h3>Tags</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Writing", "AI", "Machine Learning", "Automation", "Productivity"].map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-accent/50">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="updates">
        <ToolUpdates updates={updates} />
      </div>

      <div id="reviews">
        <ToolReviews reviews={reviews} />
      </div>

      <div className="flex items-center justify-between py-4 border-t">
        <span className="text-sm text-muted-foreground">More sections</span>
        <div className="flex gap-4">
          <button onClick={() => scrollToSection('pros-cons')} className="flex items-center text-sm">
            Pros & Cons <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          <button onClick={() => scrollToSection('faq')} className="flex items-center text-sm">
            FAQ <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          <button onClick={() => scrollToSection('pricing')} className="flex items-center text-sm">
            Pricing <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      <div id="pros-cons">
        <ToolProsAndCons pros={pros} cons={cons} />
      </div>

      <div id="faq">
        <ToolFAQ faqs={faqs} />
      </div>

      <div id="pricing">
        <ToolPricing pricingTiers={pricingTiers} />
      </div>
    </div>
  );
}