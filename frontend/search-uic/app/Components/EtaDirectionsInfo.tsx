import React, { useEffect, useState } from "react";
import { Map } from "lucide-react";

import "@/app/Styles/EtaDirectionsInfo.css";
import { stringify } from "querystring";

interface EtaDirectionsInfoProps {
  destination: string;
}

function EtaDirectionsInfo({ destination }: EtaDirectionsInfoProps) {
  // const [curLocation, setCurLocation] = useState("");
  // const [eta, setEta] = useState(""); // Note: Need to check backend/src/api.py for a way to get eta for two locations instead of three
  // const [directions, setDirections] = useState("");

  // const fetchETA = (destination: string) => {
  //   return `${destination} ETA In-Progress`;
  // };

  // const fetchDirections = (destination: string) => {
  //   return `${destination} directions In-Progress`;
  // };

  const [tags, setTags] = useState([]);
  const [alias, setAlias] = useState([]);
  const [lat, setLat] = useState(0.0);
  const [lon, setLon] = useState(0.0);

  const fetchBuildingData = async () => {
    if (!destination) {
      setTags([]);
      setAlias([]);
      setLat(0.0);
      setLon(0.0);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/building_info?name=${destination}`
      );
      const data = await response.json();
      console.log(data); // Check the structure in the console

      setAlias(data.aliases);
      setTags(data.tags);
      setLat(data.lat);
      setLon(data.lon);
    } catch (error) {
      console.error("Error fetching building info results:", error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBuildingData();
    }, 300); // Adjust debounce time as needed

    return () => clearTimeout(delay);
  }, [destination]);

  return (
    <>
      <div className="eta-directions">
        <div className="map-icon-placement">
          <Map className="icon" />
        </div>
        <div className="content-eta-directions">
          {/* Please place data in its appropriate div  */}
          <div className="eta">ETA to {destination}</div>
          <div className="directions">Directions</div>
          <div className="info">
            <p>Latitude: {lat}</p>
            <p>Longitude: {lon}</p>
            <div className="aliases">
              Aliases:
              {alias.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <div className="tags">
              Tags:
              {tags.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EtaDirectionsInfo;
