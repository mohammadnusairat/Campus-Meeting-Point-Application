"use client";

import { useEffect, useReducer, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  Map,
  MapControl,
  Pin,
} from "@vis.gl/react-google-maps";
// import { configDotenv } from "dotenv";

import SearchBar from "./Components/SearchBar";
// import EtaDirectionsInfo from "./Components/EtaDirectionsInfo";
import Title from "./Components/Title";
import ShareButton from "./Components/ShareButton";
import Filter from "./Components/Filter";

import "@/app/Styles/Page.css";
import ClosestSpotFinder from "./Components/ClosestSpotFinder";
import { setDefaultAutoSelectFamily } from "net";
import { Interface } from "readline";

// configDotenv({ path: "./.env" }); // Unecessary in Nextjs. Nextjs loads the .env file itself.

interface DestinationData {
  aliases: string[];
  lat: Number;
  lon: Number;
  name: string;
  tags: string[];
}

// aliases, lat, lon, name, tags}
export default function Home() {
  const [destination, setDestination] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [selectedPin, setSelectedPin] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [searchBarFilters, setSearchBarFilters] = useState([]);

  const [filteredLocations, setFilteredLocations] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [filters, setFilters] = useState([
    "Bathroom",
    "Study Spots",
    "Lounges",
    "Quiet Spots",
    "Loud Spots",
    "Professors' Offices",
    "Lecture Hall",
  ]);

  const maps_api_key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const map_id = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  if (!maps_api_key) {
    throw new Error("Google Maps API key is missing");
  }

  if (!map_id) {
    throw new Error("Google Maps Map ID is missing");
  }

  const clearDestinations = () => {
    if (destinations.length > 0) {
      setDestination({});
    } else if (destination) {
      setDestinations([]);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      clearDestinations();
    }, 300);

    return clearTimeout(delay);
  }, [destination, destinations]);

  // Ensures that the map is running in the client since the map's
  // components tries to access document elements
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    // Please place data in its appropriate div/component
    <div>
      <header>
        <div className="background-map">
          {isClient && (
            <APIProvider apiKey={maps_api_key}>
              <MapControl position={ControlPosition.TOP_CENTER}>
                <div className="Home">
                  <div className="title-search-location">
                    <Title />
                    <SearchBar
                      placeholder="Enter Building Name"
                      setSelectedPin={setSelectedPin}
                      setDestinations={setDestinations}
                      filters={filters}
                      filteredLocations={filteredLocations}
                      setFilteredLocations={setFilteredLocations}
                    />
                    <ShareButton selectedPin={selectedPin} />
                  </div>
                  <div className="eta-filter">
                    {/* Note: Need to add a closestSpot useState value and use it inside of <Map> so that the pin pops up*/}
                    <ClosestSpotFinder />
                    <Filter
                      filters={filters}
                      // searchBarFilters={searchBarFilters}
                      // setSearchBarFilters={setSearchBarFilters}
                      filteredLocations={filteredLocations}
                      setFilteredLocations={setFilteredLocations}
                      setDestinations={setDestinations}
                    />
                  </div>
                </div>
              </MapControl>
              <Map
                defaultCenter={{
                  lat: 41.871838324998784,
                  lng: -87.65107916698115,
                }}
                defaultZoom={16}
                gestureHandling={"greedy"}
                disableDefaultUI={true}
                mapId={map_id}
              >
                {/* Note: Red errors are normal since it doesn't know what object destination(s) is/are */}
                {/* A single destination */}
                {/* {destination.lat && destination.lon && (
                  <AdvancedMarker
                    onClick={() => {
                      setSelectedPin(destination.name);
                    }}
                    key={destination.name}
                    title={destination.name}
                    position={{
                      lat: Number(destination.lat),
                      lng: Number(destination.lon),
                    }}
                  >
                    <Pin
                      background={
                        selectedPin == destination.name ? "#19dd51" : "#19aadd"
                      } // Blue (search): #19aadd
                      glyphColor={"#000"}
                      borderColor={"#000"}
                      scale={1.5}
                    />
                  </AdvancedMarker>
                )} */}
                {/* Many destinations */}
                {destinations &&
                  destinations.map((item: DestinationData, index) => (
                    <AdvancedMarker
                      onClick={() => {
                        setSelectedPin(item.name);
                      }}
                      key={index}
                      title={item.name}
                      position={{
                        lat: Number(item.lat),
                        lng: Number(item.lon),
                      }}
                    >
                      <Pin
                        background={
                          selectedPin == item.name ? "#19dd51" : "#FBBC04"
                        } // Yellow (filters): #FBBC04
                        glyphColor={"#000"}
                        borderColor={"#000"}
                        scale={1.5}
                      />
                    </AdvancedMarker>
                  ))}
              </Map>
            </APIProvider>
          )}
        </div>
      </header>
    </div>
  );
}
