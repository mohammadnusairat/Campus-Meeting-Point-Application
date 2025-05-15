"use client";

import { Search } from "lucide-react";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "@/app/Styles/SearchBar.css";

const API = process.env.NEXT_PUBLIC_API_URL;

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

interface SearchBarProps {
  placeholder: string;
  setSelectedPin: Dispatch<SetStateAction<string>>;
  queryResults: SearchResult[];
  setQueryResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  filters: string[];
  filteredLocations: boolean[];
  setFilteredLocations: Dispatch<SetStateAction<boolean[]>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  setSelectedPin,
  queryResults,
  setQueryResults,
  filters,
  filteredLocations,
}) => {
  const [query, setQuery] = useState(""); // Track input value

  const fetchInputQuery = async (searchTerm: string) => {
    if (!searchTerm) {
      setQueryResults([]);
      return;
    }

    // Updating the list of filters requested
    const updatedFilters = [];
    for (let i = 0; i < filters.length; i++) {
      if (filteredLocations[i] == true) {
        updatedFilters.push(filters[i]);
      }
    }
    // Preparing filters for request
    let filtersParam = "";
    if (updatedFilters.length === 0) {
      filtersParam = "";
    } else {
      filtersParam = updatedFilters.map(encodeURIComponent).join(",");
    }

    try {
      // Getting
      const response = await fetch(
        `${API}/autocomplete?prefix=${searchTerm}&filters=${filtersParam}`
      );

      const data: [] = await response.json();
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
  }, [query, filteredLocations, fetchInputQuery]);

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
          queryResults.map((location, index) => (
            <p
              key={index}
              onClick={() => {
                setSelectedPin(location.name);
                setQuery(location.name); // Optional: fill input with selected value
                setQueryResults([]); // Optional: close dropdown
              }}
            >
              {location.name}
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
