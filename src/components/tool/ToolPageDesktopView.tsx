import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToolUpdates } from "./ToolUpdates";
import { ToolReviews } from "./ToolReviews";
import { ToolProsAndCons } from "./ToolProsAndCons";
import { ToolFAQ } from "./ToolFAQ";
import { ToolPricing } from "./ToolPricing";

interface ToolPageDesktopViewProps {
  updates: any[];
  reviews: any[];
  pros: string[];
  cons: string[];
  faqs: any[];
  pricingTiers: any[];
}

export function ToolPageDesktopView({
  updates,
  reviews,
  pros,
  cons,
  faqs,
  pricingTiers,
}: ToolPageDesktopViewProps) {
  return (
    <Tabs defaultValue="overview" className="mt-8">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
        {["Overview", "Updates", "Reviews", "Pros & Cons", "FAQ", "Pricing"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab.toLowerCase().replace(/ & /g, "-")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 whitespace-nowrap"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
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
      </TabsContent>

      <TabsContent value="updates" className="mt-6">
        <ToolUpdates updates={updates} />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <ToolReviews reviews={reviews} />
      </TabsContent>

      <TabsContent value="pros-cons" className="mt-6">
        <ToolProsAndCons pros={pros} cons={cons} />
      </TabsContent>

      <TabsContent value="faq" className="mt-6">
        <ToolFAQ faqs={faqs} />
      </TabsContent>

      <TabsContent value="pricing" className="mt-6">
        <ToolPricing pricingTiers={pricingTiers} />
      </TabsContent>
    </Tabs>
  );
}