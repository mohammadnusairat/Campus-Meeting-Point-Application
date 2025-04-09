import { MapPinned } from "lucide-react";
import "@/app/Styles/Filter.css";

export default function Filter() {
  return (
    <>
      <div className="filter">
        <div className="map-pinned-icon-placement">
          <MapPinned />
        </div>
        <div className="filter-drop-down">Filter</div>
      </div>
    </>
  );
}
