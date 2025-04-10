import React from "react";
import { Map } from "lucide-react";

import "@/app/Styles/EtaDirectionsInfo.css";

function EtaDirectionsInfo() {
  return (
    <>
      <div className="eta-directions">
        <div className="map-icon-placement">
          <Map className="icon" />
        </div>
        <div className="content-eta-directions">
          {/* Please place data in its appropriate div  */}
          <div className="eta">ETA</div>
          <div className="directions">Directions</div>
          <div className="info">Info</div>
        </div>
      </div>
    </>
  );
}

export default EtaDirectionsInfo;
