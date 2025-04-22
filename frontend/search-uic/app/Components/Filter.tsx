import { MapPinned } from "lucide-react";
import "@/app/Styles/Filter.css";
import { Dispatch, SetStateAction } from "react";

interface FilterProps {
  setDestinations: Dispatch<SetStateAction<never[]>>;
  filteredLocations: boolean[];
  setFilteredLocations: Dispatch<SetStateAction<boolean[]>>;
  filters: string[];
}

export default function Filter({
  setDestinations,
  setFilteredLocations,
  filteredLocations,
  filters,
}: FilterProps) {
  // const checkedFilters = [false, false, false, false, false, false, false];

  // const fetchFilter = async (filteredItem: string) => {
  //   if (!filteredItem) {
  //     setDestinations([]);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `http://127.0.0.1:5000/buildings_by_filter?type=${filteredItem}`
  //     );
  //     const data = await response.json();
  //     console.log(data); // Check the structure in the console

  //     setDestinations(data); // Since data is an array, results can be set directly
  //   } catch (error) {
  //     console.error("Error fetching filter results:", error);
  //   }
  // };

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
                    // fetchFilter(item);
                    const updatedFilters = filteredLocations.map((loc, ind) => {
                      if (index == ind) {
                        return !loc;
                      } else {
                        return loc;
                      }
                    });
                    console.log(`Old Filters: ${filteredLocations}`);
                    console.log(`Updated Filters: ${updatedFilters}`);
                    setFilteredLocations(updatedFilters);
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
