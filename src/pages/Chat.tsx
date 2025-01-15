import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SearchResultCard from "@/components/search/SearchResultCard";
import ChatNowButton from "@/components/search/ChatNowButton";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { conversationId } = useParams();

  useEffect(() => {
    const fetchSearchQuery = async () => {
      try {
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

        const query = messages[0].content.toLowerCase();
        setSearchQuery(query);
        console.log("Search query:", query);

        const searchTerms = query
          .replace(/find|ai|tools|for/gi, '')
          .trim()
          .split(/\s+/)
          .filter(term => term.length > 0);

        console.log("Search terms:", searchTerms);

        if (searchTerms.length === 0) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        const conditions = searchTerms.map(term => 
          `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
        ).join(',');

        const { data: tools, error } = await supabase
          .from("ai_tools")
          .select("id, name, description, category, logo_url")
          .or(conditions)
          .limit(10);

        if (error) {
          console.error("Error fetching results:", error);
          throw error;
        }

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
    <div className="container mx-auto py-8 px-4">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-semibold mb-6">
          I've found some great tools for {searchQuery.replace(/find|ai|tools|for/gi, '').trim()}—here's what I recommend:
        </h2>
        <div className="space-y-6">
          {results.map((tool) => (
            <SearchResultCard key={tool.id} {...tool} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg mb-4">Still unsure? Ask our AI assistant for personalized recommendations!</p>
          <ChatNowButton />
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchResults;