import { AIToolCard } from "@/components/AIToolCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  saves: number;
  isVerified: boolean;
}

export default function JustAdded() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: tools, error: fetchError } = await supabase
          .from('tools')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);

        if (fetchError) {
          throw fetchError;
        }

        setTools(tools || []);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Unable to load tools. Please try again later.');
        toast.error('Failed to load recently added tools');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();

    // Set up real-time subscription for new tools
    const toolsSubscription = supabase
      .channel('tools_channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'tools' 
        }, 
        (payload) => {
          setTools(currentTools => [payload.new as Tool, ...currentTools].slice(0, 12));
          toast.success('New tool added!');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error('Error subscribing to tools updates');
          toast.error('Unable to receive real-time updates');
        }
      });

    return () => {
      toolsSubscription.unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Just Added</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Just Added</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <AIToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </div>
  );
}