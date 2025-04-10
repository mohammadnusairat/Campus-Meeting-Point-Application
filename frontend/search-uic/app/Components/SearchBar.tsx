"use client";

import { CornerDownLeft, Search } from "lucide-react";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "@/app/Styles/SearchBar.css";
import { validateHeaderValue } from "http";

interface SearchBarProps {
  placeholder: string;
  destination: string;
  setDestination: Dispatch<SetStateAction<string>>;
}

/* 
TODO:
  - [ ] Request and format...
    +  [ ] Building Info 
    +  [ ] Filters
    +  [ ] ETA
      - Needs Current Location | Could use the same autocomplete here
    +  [ ] Directions
      - Needs Current Location | Could use the same autocomplete uere
*/

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  setDestination,
}) => {
  // const [destination, setDestination] = useState(""); // Must set this so that the other components receive this change in props
  const [query, setQuery] = useState(""); // Track input value
  const [queryResults, setQueryResults] = useState<string[]>([]); // Store API results

  // The commented section should be in its respective component
  // const [curLocation, setCurLocation] = useState("");
  // const [eta, setEta] = useState(""); // Note: Need to check backend/src/api.py for a way to get eta for two locations instead of three
  // const [directions, setDirections] = useState("");

  // const filters = [
  //   // List out the filters here...
  // ];

  // const fetchETA = (destination: string) => {
  //   return `${destination} ETA In-Progress`;
  // };

  // const fetchDirections = (destination: string) => {
  //   return `${destination} directions In-Progress`;
  // };

  const fetchInputQuery = async (searchTerm: string) => {
    if (!searchTerm) {
      setQueryResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/autocomplete?q=${searchTerm}`
      );
      const data = await response.json();
      console.log(data); // Check the structure in the console

      setQueryResults(data); // Since data is an array, results can be set directly
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Handle input change with debouncing
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchInputQuery(query);
    }, 300); // Adjust debounce time as needed

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="search">
      <div className="search-icon-placement">
        <Search />
      </div>
      {/* Please place data in its appropriate div  */}
      <div className="content-search">
        <div className="search-inputs">
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {/* Display search results */}
      <div className="data-result">
        {queryResults.length > 0 ? (
          queryResults.map((item, index) => (
            // On click will populate the ETA and Directions components
            <p
              key={index}
              onClick={() => {
                setDestination(item);
              }}
            >
              {item}
            </p>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
