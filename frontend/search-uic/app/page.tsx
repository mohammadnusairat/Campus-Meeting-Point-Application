"use client";

import { useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  Map,
  MapControl,
  Pin,
} from "@vis.gl/react-google-maps";

import SearchBar from "./Components/SearchBar";
import Title from "./Components/Title";
import ShareButton from "./Components/ShareButton";
import Filter from "./Components/Filter";

import "@/app/Styles/Page.css";
import ClosestSpotFinder from "./Components/ClosestSpotFinder";

// configDotenv({ path: "./.env" }); // Unecessary in Nextjs. Nextjs loads the .env file itself.

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

export default function Home() {
  const [destinations, setDestinations] = useState<SearchResult[]>([]);
  const [selectedPin, setSelectedPin] = useState("");
  const [meetingPoint, setMeetingPoint] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  useEffect(() => {
    if (!meetingPoint) return;

    const match = destinations.find(
      (d) =>
        Math.abs(d.lat - meetingPoint.lat) < 0.0002 &&
        Math.abs(d.lon - meetingPoint.lon) < 0.0002
    );

    if (match) {
      setSelectedPin(match.name);
    }
  }, [meetingPoint, destinations]);
  const [isClient, setIsClient] = useState(false);

  const [filteredLocations, setFilteredLocations] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [filters] = useState([
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

  // Ensures that the map is running in the client since the map's
  // components tries to access document elements
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <header>
        <div className="background-map">
          {isClient && (
            <APIProvider apiKey={maps_api_key}>
              <div className="Home">
                {/* Top Bar */}
                <div className="title-search-location">
                  <Title />
                  <SearchBar
                    placeholder="Enter Building Name"
                    setSelectedPin={setSelectedPin}
                    queryResults={destinations}
                    setQueryResults={setDestinations}
                    filters={filters}
                    filteredLocations={filteredLocations}
                    setFilteredLocations={setFilteredLocations}
                  />
                  <ShareButton selectedPin={selectedPin} />
                </div>

                {/* Map Controls - ClosestSpotFinder (Left) + Filters (Right) */}
                <MapControl position={ControlPosition.TOP_LEFT}>
                  <div className="eta-filter">
                    <ClosestSpotFinder
                      spots={destinations}
                      setSpots={setDestinations}
                      filters={filters}
                      filteredLocations={filteredLocations}
                      setMeetingPoint={setMeetingPoint}
                    />
                  </div>
                </MapControl>

                {/* Filters box moved OUTSIDE of MapControl */}
                <div className="filters-box">
                  <Filter
                    filters={filters}
                    filteredLocations={filteredLocations}
                    setFilteredLocations={setFilteredLocations}
                    setDestinations={setDestinations}
                  />
                </div>

                {/* Map */}
                <Map
                  className="map-container"
                  defaultCenter={{
                    lat: 41.871838324998784,
                    lng: -87.65107916698115,
                  }}
                  defaultZoom={16}
                  gestureHandling="greedy"
                  disableDefaultUI
                  mapId={map_id}
                >
                  {/* Meeting Point */}
                  {meetingPoint && (
                    <AdvancedMarker
                      title="Meeting Point"
                      position={{
                        lat: meetingPoint.lat,
                        lng: meetingPoint.lon,
                      }}
                    >
                      <Pin
                        background="#facc15"
                        borderColor="#000"
                        glyphColor="#000"
                        scale={2}
                      />
                    </AdvancedMarker>
                  )}

                  {/* Building Pins */}
                  {destinations.map((item, index) => (
                    <AdvancedMarker
                      key={index}
                      onClick={() => setSelectedPin(item.name)}
                      title={item.name}
                      position={{ lat: item.lat, lng: item.lon }}
                    >
                      <Pin
                        background={
                          selectedPin === item.name ? "#19dd51" : "#FBBC04"
                        }
                        borderColor="#000"
                        glyphColor="#000"
                        scale={1.5}
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </div>
            </APIProvider>
          )}
        </div>
      </header>
    </div>
  );
}
