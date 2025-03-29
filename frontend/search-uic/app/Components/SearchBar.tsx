"use client";

import React, { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const [query, setQuery] = useState(""); // Track input value
  const [results, setResults] = useState<string[]>([]); // Store API results

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/autocomplete?prefix=${searchTerm}`
      );
      const data = await response.json();
      console.log(data); // Check the structure in the console

      // Extract the list of words from the suggestions array
      setResults(data.suggestions.map((item: { word: string }) => item.word));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Handle input change with debouncing
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchResults(query);
    }, 300); // Adjust debounce time as needed

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="search">
      <div className="searchInputs">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {/* Display search results */}
      <div className="dataResult">
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
