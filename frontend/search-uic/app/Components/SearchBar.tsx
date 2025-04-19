"use client";

import { Search } from "lucide-react";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "@/app/Styles/SearchBar.css";

interface SearchBarProps {
  placeholder: string;
  destination: string;
  setDestination: Dispatch<SetStateAction<string>>;
}

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  setDestination,
}) => {
  const [query, setQuery] = useState(""); // Track input value
  const [queryResults, setQueryResults] = useState<SearchResult[]>([]); // Store API results

  const fetchInputQuery = async (searchTerm: string) => {
    if (!searchTerm) {
      setQueryResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/autocomplete?q=${searchTerm}`
      );
      const data: SearchResult[] = await response.json();
      setQueryResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchInputQuery(query);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="search">
      <div className="search-icon-placement">
        <Search size={20} />
      </div>
      <div className="search-inputs">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="data-result">
        {queryResults.length > 0 ? (
          queryResults.map((item, index) => (
            <p
              key={index}
              onClick={() => {
                setDestination(item); // Pass the entire object instead of just the name
                setQuery(item.name); // Optional: fill input with selected value
                setQueryResults([]); // Optional: close dropdown
              }}
            >
              {item.name} {/* Display the "name" field */}
            </p>
          ))
        ) : query.length > 0 ? (
          <p>No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
