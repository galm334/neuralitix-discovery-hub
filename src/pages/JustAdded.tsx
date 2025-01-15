import { AIToolCard } from "@/components/AIToolCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";

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

interface DatabaseTool {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  category: string;
  created_at: string;
  created_by: string | null;
  is_approved: boolean | null;
  approved_at: string | null;
  approved_by: string | null;
  is_public: boolean | null;
}

export default function JustAdded() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database tool to UI tool format
  const mapDatabaseToolToUITool = (dbTool: DatabaseTool): Tool => ({
    id: dbTool.id,
    title: dbTool.name,
    description: dbTool.description,
    image: dbTool.logo_url || '/placeholder.svg',
    price: 'Free', // Default price, adjust as needed
    rating: 0, // Default rating, adjust as needed
    saves: 0, // Default saves, adjust as needed
    isVerified: dbTool.is_approved || false,
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: dbTools, error: fetchError } = await supabase
          .from('tools')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);

        if (fetchError) {
          throw fetchError;
        }

        const mappedTools = (dbTools || []).map(mapDatabaseToolToUITool);
        setTools(mappedTools);
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
    const toolsSubscription: RealtimeChannel = supabase
      .channel('tools_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tools'
        },
        (payload) => {
          const newTool = mapDatabaseToolToUITool(payload.new as DatabaseTool);
          setTools(currentTools => [newTool, ...currentTools].slice(0, 12));
          toast.success('New tool added!');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to tools updates');
        } else {
          console.error('Error subscribing to tools updates:', status);
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