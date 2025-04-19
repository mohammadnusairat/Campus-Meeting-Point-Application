import React from "react";
import { Map } from "lucide-react";

import "@/app/Styles/EtaDirectionsInfo.css";

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

interface EtaDirectionsInfoProps {
  destination: SearchResult | null; // Accept the entire object or null
}

function EtaDirectionsInfo({ destination }: EtaDirectionsInfoProps) {
  const renderContent = () => {
    if (!destination) {
      return <div className="no-destination">No destination selected</div>;
    }

    const { name, tags, aliases, lat, lon } = destination; // Destructure the object

    return (
      <>
        <div className="eta">ETA to {name}</div>
        <div className="directions">Directions</div>
        <div className="info">
          <p>Latitude: {lat}</p>
          <p>Longitude: {lon}</p>
          <div className="aliases">
            Aliases:
            {aliases.map((item, index) => (
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
      </>
    );
  };

  return (
    <div className="eta-directions">
      <div className="map-icon-placement">
        <Map className="icon" />
      </div>
      <div className="content-eta-directions">{renderContent()}</div>
    </div>
  );
}

export default EtaDirectionsInfo;
