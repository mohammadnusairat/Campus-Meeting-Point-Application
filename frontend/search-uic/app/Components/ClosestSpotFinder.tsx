import "@/app/Styles/ClosestSpotFinder.css";
import { Check, MapPinCheck, Plus } from "lucide-react";
import { useState } from "react";

export default function ClosestSpotFinder() {
  const [locations, setLocations] = useState([]);

  return (
    <>
      <div className="closest-spot-finder">
        <div className="map-pin-check-icon-placement">
          <MapPinCheck />
        </div>
        {/* Closest Spot Finder */}
        {/* Note: Red errors are normal since it doesn't know what object location(s) is/are */}
        <div>
          {locations.length > 0 ? (
            locations.map((loc, index) => {
              return (
                <div key={index}>
                  <div>{index + 1}</div>
                  <div>From: {loc.from}</div>
                  <div>To: {loc.to}</div>
                  <button>Remove</button>
                </div>
              );
            })
          ) : (
            <div>
              <div>1</div>
              <div>
                From: <input />
              </div>
              <div>
                To: <input />
              </div>
              <button>
                <Check />
              </button>
            </div>
          )}
          <div>
            <button>
              <Plus />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
