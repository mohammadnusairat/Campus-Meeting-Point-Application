import { MapPinned } from "lucide-react";
import "@/app/Styles/Filter.css";
import { Dispatch, SetStateAction, useEffect } from "react";

interface SearchResult {
  name: string;
  tags: string[];
  aliases: string[];
  lat: number;
  lon: number;
}

interface FilterProps {
  setDestinations: Dispatch<SetStateAction<SearchResult[]>>;
  filteredLocations: boolean[];
  setFilteredLocations: Dispatch<SetStateAction<boolean[]>>;
  filters: string[];
}

export default function Filter({
  setFilteredLocations,
  filteredLocations,
  filters,
}: FilterProps) {
  useEffect(() => {}, [filteredLocations]);
  return (
    <>
      <div className="filter">
        <div className="map-pinned-icon-placement">
          <MapPinned />
        </div>

        <fieldset>
          <legend>Filtered Buildings</legend>
          {filters.map((item, index) => (
            <div key={index}>
              <label>
                <input
                  type="checkbox"
                  id={item}
                  name="filtered_buildings"
                  onClick={() => {
                    setFilteredLocations((filteredLocations) =>
                      filteredLocations.map((loc, ind) =>
                        index === ind ? !loc : loc
                      )
                    );
                  }}
                />
                {item}
              </label>
            </div>
          ))}
        </fieldset>
      </div>
    </>
  );
}
