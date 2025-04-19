"use client";

import SearchBar from "./Components/SearchBar";
import EtaDirectionsInfo from "./Components/EtaDirectionsInfo";
import Title from "./Components/Title";
import CurrentLocation from "./Components/CurrentLocation";
import Filter from "./Components/Filter";

import "@/app/Styles/Page.css";
import { useState } from "react";

export default function Home() {
  const [destination, setDestination] = useState<SearchResult | null>(null); // Store the entire search result object
  const [destinations, setDestinations] = useState([]);

  return (
    <div className="Home">
      <div className="title-search-location">
        <Title />
        <SearchBar
          placeholder="Enter Building Name"
          destination={destination?.name || ""} // Pass the name if destination is not null
          setDestination={setDestination}
        />
        <CurrentLocation />
      </div>
      <div className="eta-filter">
        <EtaDirectionsInfo destination={destination} />{" "}
        {/* Pass the entire object */}
        <Filter setDestinations={setDestinations} />
      </div>
      <div>
        Filtered Buildings:
        {destinations.map((item, index) => (
          <div key={index}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
