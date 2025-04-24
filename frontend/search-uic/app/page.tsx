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
  const [meetingPoint, setMeetingPoint] = useState<{ lat: number; lon: number } | null>(null);
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
                      queryResults={destinations}
                      setQueryResults={setDestinations}
                      filters={filters}
                      filteredLocations={filteredLocations}
                      setFilteredLocations={setFilteredLocations}
                    />
                    <ShareButton selectedPin={selectedPin} />
                  </div>
                  <div className="eta-filter">
                    {/* Note: Need to add a closestSpot useState value and use it inside of <Map> so that the pin pops up*/}
                    <ClosestSpotFinder
                      spots={destinations}
                      setSpots={setDestinations}
                      filters={filters}
                      setMeetingPoint={setMeetingPoint}
                    />
                    <Filter
                      filters={filters}
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
                {/* Yellow meeting pin goes here */}
                {meetingPoint && (
                  <AdvancedMarker
                    title="Meeting Point"
                    position={{ lat: meetingPoint.lat, lng: meetingPoint.lon }}
                  >
                    <Pin
                      background="#facc15" // Yellow
                      borderColor="#000"
                      glyphColor="#000"
                      scale={2}
                    />
                  </AdvancedMarker>
                )}
                {/* Existing loop for user building pins */}
                {destinations &&
                  destinations.map((item: SearchResult, index) => (                   
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
                        // Yellow (unselected): #FBBC04
                        // Green (selected): #19dd51
                        background={
                          selectedPin == item.name ? "#19dd51" : "#FBBC04"
                        }
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
