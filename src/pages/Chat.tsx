import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
}

const SearchResults = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { conversationId } = useParams();

  useEffect(() => {
    const fetchSearchQuery = async () => {
      try {
        // First get the search query from the conversation
        const { data: messages } = await supabase
          .from("chat_messages")
          .select("content")
          .eq("conversation_id", conversationId)
          .eq("role", "user")
          .order("created_at", { ascending: true })
          .limit(1);

        if (!messages || messages.length === 0) {
          toast.error("No search query found");
          setIsLoading(false);
          return;
        }

        const searchQuery = messages[0].content;
        console.log("Search query:", searchQuery);

        // Then search for tools using the query
        const { data: tools, error } = await supabase
          .from("ai_tools")
          .select("id, name, description, category, logo_url")
          .textSearch("search_vector", searchQuery, {
            type: "plain",
            config: "english"
          })
          .limit(10);

        if (error) throw error;

        console.log("Search results:", tools);
        setResults(tools || []);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch search results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchQuery();
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No results found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((tool) => (
            <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {tool.logo_url && (
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="h-12 w-12 object-contain"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground">{tool.category}</p>
                </div>
                <p className="text-sm">{tool.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchResults;