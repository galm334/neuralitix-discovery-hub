import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import SearchSuggestions from "./SearchSuggestions";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestions = useSearchSuggestions(query);

  const handleSearch = async (searchQuery: string) => {
    try {
      console.log('Starting search with query:', searchQuery);
      
      const { data: conversationData, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert([
          { thread_id: 'new' }
        ])
        .select()
        .single();

      if (conversationError) throw conversationError;
      
      console.log('Created conversation:', conversationData);

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

      <SearchSuggestions
        ref={suggestionsRef}
        suggestions={suggestions}
        onSuggestionClick={(suggestion) => {
          setQuery(suggestion);
          handleSearch(suggestion);
        }}
      />
    </div>
  );
};