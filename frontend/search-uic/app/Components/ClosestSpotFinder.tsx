import "@/app/Styles/ClosestSpotFinder.css";
import { Check, MapPinCheck, Plus } from "lucide-react";
import { JSX, useEffect, useState } from "react";

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
  setMeetingPoint: React.Dispatch<React.SetStateAction<{ lat: number; lon: number } | null>>;
}

export default function ClosestSpotFinder({ spots, setSpots, filters }: ClosestSpotFinderProps) {
  const [locations, setLocations] = useState<SpotFinder[]>([]);
  const [from, setFrom] = useState("");
  const [showLocationForm, setShowLocationForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/buildings_by_filter?type=") // empty type = get all
      .then((res) => res.json())     
      .catch((err) => {
        console.error("Error loading all buildings:", err);
      });
  }, []);


  const fetchMeetingPoint = async () => {
    if (locations.length < 2) {
      alert("Please enter at least two location pairs.");
      return;
    }
  
    const buildingNames = locations.map((loc) => loc.from.toLowerCase());
    setIsLoading(true); // START LOADING
  
    try {
      const res = await fetch("http://localhost:5000/compute_meeting_by_buildings_with_filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildings: buildingNames, filters }),
      });
  
      const data = await res.json();
      console.log("Backend response:", data); // NEW LOG
      if (res.ok) {
        console.log("Filtered Meeting Point:", data);
        alert(`Meeting Point: ${data.meeting_building}`);
        setGoogleMapsLink(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.meeting_building)}`
        );
  
        // Remove old "meeting" markers
        setSpots((prev: SearchResult[]) =>
          prev.filter((b) => !b.tags.includes("meeting"))
        );
  
        // Add new meeting point to map
        const buildingToAdd: SearchResult = {
          name: data.meeting_building,
          lat: data.fermat_point.lat,
          lon: data.fermat_point.lon,
          tags: ["meeting"],
          aliases: [],
        };
        setSpots((prev: SearchResult[]) => [...prev, buildingToAdd]);
      } else {
        alert(data.error || "No meeting point found.");
      }
    } catch (err) {
      console.error("Error fetching meeting point:", err);
      alert("Server error.");
    }
  
    setIsLoading(false); // STOP LOADING
  };        

  const submitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLocations((prev) => [...prev, { from }]);
    setFrom("");
    setShowLocationForm(false);
    /*
    // Make a request to the backend to get the new spots given the locations

    // Receive the request

    // Parse the request

    // Replace the spots array with a new array of the new spots

    // fetchInputQuery() in SearchBar.tsx will take care of making another
    // request through useEffect()
    */
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
        <div className="map-pin-check-icon-placement">
          <MapPinCheck />
        </div>
        {/* Closest Spot Finder */}
        <div>
          {locations.length > 0 ? (
            locations.map((loc: SpotFinder, index) => {
              return (
                <form key={index} onSubmit={(e) => removeLocation(e, loc)}>
                  <div>{index + 1}</div>
                  <div>From: {loc.from}</div>
                  <button>Remove</button>
                </form>
              );
            })
          ) : (
            <div></div>
          )}
          {/* Option to Show form */}
          {showLocationForm ? (
            <form onSubmit={(e) => submitLocation(e)}>
              <div>
                <div>{locations.length + 1}</div>
                <div>
                  From:{" "}
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              </div>
              <button>
                <Check />
              </button>
            </form>
          ) : (
            <div></div>
          )}
          {/* Add a new from and to location */}
          <div>
            <button onClick={() => setShowLocationForm(true)}>
              <Plus />
            </button>
          </div>
        </div>
        <button className="filter-submit-button" onClick={fetchMeetingPoint}>
          Compute Filtered Meeting Point
        </button>
        {isLoading && <p style={{ color: "white", marginTop: "0.5rem" }}>Calculating meeting point...</p>}
      </div>
      {googleMapsLink && (
        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 999 }}>
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#facc15",
              backgroundColor: "#1f2937",
              padding: "6px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            View Meeting Point on Google Maps
          </a>
        </div>
      )}
    </>
  );
}
