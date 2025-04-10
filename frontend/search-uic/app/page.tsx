"use client";

import SearchBar from "./Components/SearchBar";
import EtaDirectionsInfo from "./Components/EtaDirectionsInfo";
import Title from "./Components/Title";
import CurrentLocation from "./Components/CurrentLocation";
import Filter from "./Components/Filter";

import "@/app/Styles/Page.css";
import { useState } from "react";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [destinations, setDestinations] = useState([]);
  // const [curLocation, setCurLocation] = useState("");
  // const [filter, setFilter] = useState(""); // Also known as tag in the api

  return (
    // Please place data in its appropriate div/component
    <div className="Home">
      <div className="title-search-location">
        <Title />
        <SearchBar
          placeholder="Enter Building Name"
          destination={destination}
          setDestination={setDestination}
        />
        <CurrentLocation />
      </div>
      <div className="eta-filter">
        <EtaDirectionsInfo destination={destination} />
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
