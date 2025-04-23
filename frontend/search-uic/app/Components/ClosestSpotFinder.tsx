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
  to: string;
}

interface ClosestSpotFinderProps {
  spots: SearchResult[];
  setSpots: React.Dispatch<React.SetStateAction<SearchResult[]>>;
}

export default function ClosestSpotFinder({ spots }: ClosestSpotFinderProps) {
  const [locations, setLocations] = useState<SpotFinder[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showLocationForm, setShowLocationForm] = useState(true);
  const [renderedLocations, setRenderedLocations] = useState<JSX.Element[]>();

  const submitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Running submitLocation");
    let updatedLocations = locations;
    updatedLocations.push({ from, to });
    setLocations(updatedLocations);

    // renderLocations();
    setShowLocationForm(false);
    console.log(locations);
    // Make a request to the backend to get the new spots given the locations

    // Receive the request

    // Parse the request

    // Replace the spots array with a new array of the new spots

    // fetchInputQuery() in SearchBar.tsx will take care of making another
    // request through useEffect()
  };

  const removeLocation = (e: React.FormEvent, loc: SpotFinder) => {
    e.preventDefault();
    console.log("Running removeLocation");
    setLocations((locations) =>
      locations.filter((item) => item.from !== loc.from || item.to !== loc.to)
    );
    // setLocations((updatedLocations) =>
    //   updatedLocations.filter(
    //     (item) => item.from !== loc.from && item.to !== loc.to
    //     // (item) => item !== loc
    //   )
    // );
    // setLocations(updatedLocations);
    // renderLocations();
    console.log(locations);
  };

  // const renderLocations = () => {
  //   console.log("Running renderLocations");
  //   // setRenderedLocations(
  //   // locations.map((loc: SpotFinder, index) => {
  //   //   return (
  //   //     <form key={index} onSubmit={(e) => removeLocation(e, loc)}>
  //   //       <div>{index + 1}</div>
  //   //       <div>From: {loc.from}</div>
  //   //       <div>To: {loc.to}</div>
  //   //       <button>Remove</button>
  //   //     </form>
  //   //   );
  //   // })
  //   // );

  //   console.log(locations);
  // };

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     setRenderedLocations(renderLocations());
  //   }, 300);

  //   return () => clearTimeout(delay);
  // }, [locations]);

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
                  <div>To: {loc.to}</div>
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
                <div>
                  To:{" "}
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
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
      </div>
    </>
  );
}
