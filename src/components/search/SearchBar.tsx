import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  name: string;
  description: string;
  category: string;
}

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        const closeTimeout = setTimeout(() => {
          setShowSuggestions(false);
        }, 1000);

        return () => clearTimeout(closeTimeout);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 3) {
        try {
          const { data, error } = await supabase.functions.invoke('get-autocomplete', {
            body: { query: debouncedQuery }
          });
          
          if (error) {
            console.error("Error fetching suggestions:", error);
            return;
          }

          if (data) {
            setSuggestions(data.suggestions || []);
            setTools(data.tools || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setTools([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = async (searchQuery: string) => {
    try {
      console.log('Starting search with query:', searchQuery);
      
      // First create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert([
          { thread_id: 'new' }
        ])
        .select()
        .single();

      if (conversationError) throw conversationError;
      
      console.log('Created conversation:', conversationData);

      // Then create the initial message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            conversation_id: conversationData.id,
            content: searchQuery,
            role: 'user'
          }
        ]);

      if (messageError) throw messageError;
      
      console.log('Created initial message for conversation:', conversationData.id);

      // Navigate to the chat page with the new conversation ID
      navigate(`/chat/${conversationData.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      handleSearch(query);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex gap-2 bg-muted/80 backdrop-blur-sm rounded-lg p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I need an AI tool that can…"
            className="w-full pl-10 h-12 text-lg bg-transparent border-0 focus-visible:ring-0"
          />
        </div>
        <Button 
          className="h-12 px-6 text-lg hidden md:inline-flex"
          onClick={() => handleSearch(query)}
        >
          Search
        </Button>
      </div>

      {showSuggestions && (query.length >= 3) && (suggestions.length > 0 || tools.length > 0) && (
        <Card ref={suggestionsRef} className="absolute w-full mt-2 p-2 shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
              onClick={() => {
                setQuery(suggestion);
                handleSearch(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
          {tools.length > 0 && (
            <div className="border-t mt-2 pt-2">
              <div className="px-4 py-1 text-sm text-muted-foreground">
                Related Tools
              </div>
              {tools.map((tool, index) => (
                <button
                  key={`tool-${index}`}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
                  onClick={() => navigate(`/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-muted-foreground">{tool.description}</div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};