import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CategoryInsightsProps {
  category: string;
}

export function CategoryInsights({ category }: CategoryInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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

    if (category) {
      generateInsights();
    }
  }, [category, toast]);

  if (isLoading || !insights) {
    return (
      <div className="mt-12 animate-pulse">
        <div className="h-4 bg-primary/10 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-primary/10 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-primary/10 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
    </div>
  );
}