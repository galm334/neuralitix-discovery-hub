import { Card } from "@/components/ui/card";
import { forwardRef } from "react";

interface SearchSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SearchSuggestions = forwardRef<HTMLDivElement, SearchSuggestionsProps>(
  ({ suggestions, onSuggestionClick }, ref) => {
    if (suggestions.length === 0) return null;

    return (
      <Card ref={ref} className="absolute w-full mt-2 p-2 shadow-lg z-50 max-h-[400px] overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={`suggestion-${index}`}
            className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </Card>
    );
  }
);

SearchSuggestions.displayName = "SearchSuggestions";

export default SearchSuggestions;