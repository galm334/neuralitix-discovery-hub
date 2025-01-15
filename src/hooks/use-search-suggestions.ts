import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./use-debounce";

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 2) {
        try {
          console.log('Fetching suggestions for query:', debouncedQuery);
          const searchTerms = debouncedQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 0);

          if (searchTerms.length === 0) {
            setSuggestions([]);
            return;
          }

          const conditions = searchTerms.map(term => 
            `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
          ).join(',');

          const { data: tools, error } = await supabase
            .from("ai_tools")
            .select("name, description, category")
            .or(conditions)
            .limit(5);

          if (error) {
            console.error("Error fetching suggestions:", error);
            return;
          }

          console.log('Found tools:', tools);

          let newSuggestions: string[] = [];
          if (tools && tools.length > 0) {
            const categories = [...new Set(tools.map(tool => tool.category))];
            newSuggestions = [
              ...categories.map(category => `Find AI tools for ${category.toLowerCase()}`),
              ...tools.map(tool => `Tell me about ${tool.name}`),
            ];
          }

          console.log('Generated suggestions:', newSuggestions);
          setSuggestions(newSuggestions);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  return suggestions;
};