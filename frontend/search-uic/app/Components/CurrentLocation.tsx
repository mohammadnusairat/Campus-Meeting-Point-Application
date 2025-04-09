import "@/app/Styles/CurrentLocation.css";
import { MapPin } from "lucide-react";

export default function CurrentLocation() {
  return (
    <>
      <div className="current-location">
        <div className="map-pin-icon-placement">
          <MapPin />
        </div>
        {/* Please place data in its appropriate div  */}
        <div className="content-drop-down">Current Location</div>
      </div>
    </>
  );
}
