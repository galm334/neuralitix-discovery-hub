import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Link2, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
}

declare global {
  interface Window {
    ZapChat?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}

const SearchResults = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { conversationId } = useParams();

  // Add a state to track if Zapier chat is ready
  const [isChatReady, setIsChatReady] = useState(false);

  // Check for Zapier chat availability
  useEffect(() => {
    const checkChatAvailability = () => {
      const chatElement = document.querySelector('zapier-interfaces-chatbot-embed');
      if (chatElement || window.ZapChat) {
        setIsChatReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkChatAvailability()) {
      // If not available, set up an observer to watch for the chat widget
      const observer = new MutationObserver((mutations, obs) => {
        if (checkChatAvailability()) {
          obs.disconnect(); // Stop observing once found
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Cleanup
      return () => observer.disconnect();
    }
  }, []);

  const handleChatNow = () => {
    if (!isChatReady) {
      toast.error("Chat is initializing. Please wait a moment and try again.");
      return;
    }

    // Try to use the Zapier Chat API if available
    if (window.ZapChat && typeof window.ZapChat.open === 'function') {
      window.ZapChat.open();
      toast.success("Opening chat window...");
    } else {
      // Fallback: try to find and click the chat button
      const chatButton = document.querySelector('[data-testid="chat-button"]') as HTMLElement;
      if (chatButton) {
        chatButton.click();
        toast.success("Opening chat window...");
      } else {
        toast.error("Chat is not available at the moment. Please refresh the page.");
      }
    }
  };

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

        const query = messages[0].content.toLowerCase();
        setSearchQuery(query);
        console.log("Search query:", query);

        // Split the search query into words and remove common words
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

        // Build the OR conditions for each search term
        const conditions = searchTerms.map(term => 
          `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
        ).join(',');

        // Then search for tools using direct text search
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

  const topic = searchQuery
    .replace(/find|ai|tools|for/gi, '')
    .trim();

  return (
    <div className="container mx-auto py-8 px-4">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-semibold mb-6">
          I've found some great tools for {searchQuery.replace(/find|ai|tools|for/gi, '').trim()}—here's what I recommend:
        </h2>
        <div className="space-y-6">
          {results.map((tool) => (
            <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0">
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={`${tool.name} logo`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link 
                    to={`/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xl font-semibold hover:text-primary transition-colors"
                  >
                    {tool.name}
                  </Link>
                  <p className="text-muted-foreground mt-2">
                    {tool.description}
                    <Link 
                      to={`/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="ml-2 text-primary hover:underline inline-flex items-center"
                    >
                      See more
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg mb-4">Still unsure? Ask our AI assistant for personalized recommendations!</p>
          <Button 
            onClick={handleChatNow}
            className="bg-primary text-white px-6"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat Now
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchResults;