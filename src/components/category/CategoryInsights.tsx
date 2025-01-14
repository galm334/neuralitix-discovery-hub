import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CategoryInsightsProps {
  category: string;
}

export function CategoryInsights({ category }: CategoryInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { category },
      });

      if (error) throw error;
      setInsights(data.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        variant: "destructive",
        title: "Error generating insights",
        description: "Please try again later.",
      });
    }
    setIsLoading(false);
  };

  if (!insights) {
    return (
      <div className="space-y-4">
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isLoading ? "Generating..." : "Generate Insights"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
    </div>
  );
}