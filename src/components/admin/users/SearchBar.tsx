
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
}

const SearchBar = ({ initialValue = '', onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 mr-2">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search by name or email..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="pl-8 pr-12"
      />
      <Button 
        type="submit" 
        size="sm" 
        variant="ghost" 
        className="absolute right-0 top-0 h-full px-3"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
