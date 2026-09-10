import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  resultCount?: number;
}

export function ChatSearch({ onSearch, onClear, isSearching, resultCount }: ChatSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search chats..."
          className="pl-9 pr-8 h-9 text-sm bg-muted/50 border-border/50 rounded-xl"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      {query && (
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {isSearching ? "Searching..." : `${resultCount || 0} results found`}
        </div>
      )}
    </div>
  );
}
