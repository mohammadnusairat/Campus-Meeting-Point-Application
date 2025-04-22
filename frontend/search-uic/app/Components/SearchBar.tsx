"use client";

import { Search } from "lucide-react";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "@/app/Styles/SearchBar.css";

interface SearchBarProps {
  placeholder: string;
  setSelectedPin: Dispatch<SetStateAction<string>>;
  setDestination: Dispatch<SetStateAction<{}>>;
  filters: string[];
  filteredLocations: boolean[];
  setFilteredLocations: Dispatch<SetStateAction<boolean[]>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  setSelectedPin,
  setDestination,
  filters,
  filteredLocations,
  setFilteredLocations,
}) => {
  const [query, setQuery] = useState(""); // Track input value
  const [queryResults, setQueryResults] = useState<string[]>([]); // Store API results

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
        `http://127.0.0.1:5000/autocomplete?prefix=${searchTerm}&filters=${filtersParam}`
      );
      const data = await response.json();
      setQueryResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const fetchDestinationInfo = async (searchTerm: string) => {
    if (!searchTerm) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/building_info?name=${searchTerm}`
      );
      const data = await response.json();
      console.log(data);
      setDestination(data);
    } catch (error) {
      console.error("Error fetching queried destination info:", error);
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
        {/* If the search bar query is empty and the user clicks on a filter, then display all of the buildings that are associated with that filter. */}
        {/* Suppose you want a building that starts with the letter s, but want the bathroom of a building that has the letter s
        If you then click on one of the filters, the buildings displayed by the filters will be buildings with the letter s and that contain a bathroom.
      */}
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
                setSelectedPin(location);
                setQuery(location); // Optional: fill input with selected value
                fetchDestinationInfo(location);
                setQueryResults([]); // Optional: close dropdown
              }}
            >
              {location}
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
