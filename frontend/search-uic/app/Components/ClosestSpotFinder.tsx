import "@/app/Styles/ClosestSpotFinder.css";
import { Check, MapPinCheck, Plus } from "lucide-react";
//import { Black_And_White_Picture } from "next/font/google";
import { JSX, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

interface SpotFinder {
  from: string;
}

interface ClosestSpotFinderProps {
  spots: SearchResult[];
  setSpots: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  filters: string[];
  filteredLocations: boolean[];
  setMeetingPoint: React.Dispatch<
    React.SetStateAction<{ lat: number; lon: number } | null>
  >;
}

export default function ClosestSpotFinder({
  //spots,
  setSpots,
  filters,
  filteredLocations,
  setMeetingPoint,
}: ClosestSpotFinderProps) {
  const [locations, setLocations] = useState<SpotFinder[]>([]);
  const [from, setFrom] = useState("");
  const [showLocationForm, setShowLocationForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [availableBuildings, setAvailableBuildings] = useState<SearchResult[]>(
    []
  );

  useEffect(() => {
    fetchAvailableBuildings();
  }, [filteredLocations]); // refetch when filters change

  const fetchAvailableBuildings = async () => {
    try {
      const selectedFilters =
        filteredLocations.length > 0 && filteredLocations.some((f) => f)
          ? filters.filter((_, idx) => filteredLocations[idx])
          : [];
  
      if (selectedFilters.length === 0) {
        // No filters selected -> show no buildings
        setAvailableBuildings([]);
        setSpots([]); // Also clear the spots if needed
        return;
      }
  
      const queryString = `?tags=${encodeURIComponent(selectedFilters.join(","))}`;
      const res = await fetch(
        `${API}/buildings_by_multiple_filters${queryString}`
      );
      const data: SearchResult[] = await res.json();
  
      setAvailableBuildings(data || []);
      setSpots(data || []);
    } catch (err) {
      console.error("Error fetching available buildings:", err);
    }
  };  

  const fetchMeetingPoint = async () => {
    if (locations.length < 2) {
      alert("Please enter at least two location pairs.");
      return;
    }

    const buildingNames = locations.map((loc) => loc.from.toLowerCase());
    const selectedFilters =
      filteredLocations.length > 0 && filteredLocations.some((f) => f)
        ? filters.filter((_, idx) => filteredLocations[idx])
        : [...filters]; // fallback to all filters

    if (!selectedFilters || selectedFilters.length === 0) {
      alert("No filters selected and fallback to all filters failed.");
      setIsLoading(false);
      setMeetingPoint(null); // clear previous pin
      return;
    }

    setIsLoading(true);
    setMeetingPoint(null);

    try {
      const res = await fetch(
        `${API}/compute_meeting_by_buildings_with_filters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildings: buildingNames,
            filters: selectedFilters,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Server Error");
        setIsLoading(false);
        setMeetingPoint(null); // clear previous pin
        return;
      }

      const data = await res.json();

      if (!data.meeting_building || !data.fermat_point) {
        alert(
          "No valid meeting point could be found with the selected filters."
        );
        setIsLoading(false);
        return;
      }

      console.log("Backend response:", data);
      alert(`Meeting Point: ${data.meeting_building}`);
      setGoogleMapsLink(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          data.meeting_building
        )}`
      );

      setSpots((prev: SearchResult[]) =>
        prev.filter((b) => !b.tags.includes("meeting"))
      );

      const buildingToAdd: SearchResult = {
        name: data.meeting_building,
        lat: data.fermat_point.lat,
        lon: data.fermat_point.lon,
        tags: ["meeting"],
        aliases: [],
      };
      setSpots((prev: SearchResult[]) => [...prev, buildingToAdd]);
      setMeetingPoint({
        lat: data.fermat_point.lat,
        lon: data.fermat_point.lon,
      });
    } catch (err) {
      console.error("Error fetching meeting point:", err);
      alert("Server error.");
      setMeetingPoint(null); // clear previous pin
    }

    setIsLoading(false);
  };

  const submitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLocations((prev) => [...prev, { from }]);
    setFrom("");
    setShowLocationForm(false);
  };

  const removeLocation = (e: React.FormEvent, loc: SpotFinder) => {
    e.preventDefault();
    setLocations((locations) =>
      locations.filter((item) => item.from !== loc.from)
    );
  };

  return (
    <>
      <div className="closest-spot-finder">
        {/* Copy Meeting Link at Top Right */}
        {googleMapsLink && (
          <div className="copy-meeting-link-top-right">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(googleMapsLink!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                  console.error("Failed to copy link", err);
                }
              }}
              style={{
                color: "#facc15",
                backgroundColor: "#1f2937",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copied ? "Link Copied!" : "Copy Meeting Link"}
            </button>
          </div>
        )}

        {/* Icon */}
        <div className="map-pin-check-icon-placement">
          <MapPinCheck />
        </div>

        {/* Locations Section */}
        <div>
          <p className="locations-title">
            <strong>Closest Meeting Point</strong>
          </p>
          <div>
            {locations.length > 0 ? (
              locations.map((loc: SpotFinder, index) => (
                <div key={index} className="location-item">
                  <div className="location-text">
                    {index + 1}. From: {loc.from}
                  </div>
                  <button
                    className="button remove-button"
                    onClick={(e) => removeLocation(e, loc)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="no-locations-text">No locations added yet.</p>
            )}
          </div>

          {showLocationForm && (
            <form onSubmit={(e) => submitLocation(e)} className="input-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter location"
                  className="styled-input"
                />
                <button className="button check-button">
                  <Check />
                </button>
              </div>
            </form>
          )}

          <div>
            <button
              className="button plus-button"
              onClick={() => setShowLocationForm(true)}
            >
              <Plus />
            </button>
          </div>

          {/* Compute Button */}
          {locations.length >= 2 ? (
            <button
              className="button filter-submit-button"
              onClick={fetchMeetingPoint}
            >
              Get Closest Meeting Point
            </button>
          ) : (
            <p className="no-locations-text">Add 2 or more locations.</p>
          )}

          {/* Loading Text */}
          {isLoading && (
            <p
              style={{
                color: "#7a0019",
                marginTop: "0.5rem",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Calculating meeting point...
            </p>
          )}
        </div>

        {/* Available Buildings Section */}
        <div className="available-buildings-section">
          <h3 style={{ marginTop: "1rem", color: "#7a0019" }}>
            Available Buildings
          </h3>
          <div
            style={{
              maxHeight: "80px",
              overflowY: "auto",
              marginTop: "0.5rem",
              backgroundColor: "#ec7e7e",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "#000000",
            }}
          >
            {availableBuildings.length > 0 ? (
              availableBuildings.map((building, index) => (
                <div key={index} className="available-building-item">
                  {building.name}
                </div>
              ))
            ) : (
              <p className="no-available-buildings">
                No buildings match the selected filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
