import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

interface ToolPricingProps {
  pricingTiers: PricingTier[];
}

export function ToolPricing({ pricingTiers }: ToolPricingProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {pricingTiers.map((tier) => (
        <div 
          key={tier.name}
          className={`border ${tier.isPopular ? 'border-2 border-primary' : 'border-border'} rounded-lg p-6 relative`}
        >
          {tier.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
          )}
          <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">{tier.price}</span>
            {tier.price !== 'Custom' && <span className="text-muted-foreground">/per month</span>}
          </div>
          <ul className="space-y-3 mb-6">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            className="w-full" 
            variant={tier.isPopular ? "default" : "outline"}
          >
            {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
          </Button>
        </div>
      ))}
    </div>
  );
}