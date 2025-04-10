import { MapPinned } from "lucide-react";
import "@/app/Styles/Filter.css";
import { Dispatch, SetStateAction } from "react";

interface FilterProps {
  setDestinations: Dispatch<SetStateAction<never[]>>;
}

export default function Filter({ setDestinations }: FilterProps) {
  const filters = [
    "Bathroom",
    "Study Spots",
    "Lounges",
    "Quiet Spots",
    "Loud Spots",
    "Professors' Offices",
    "Lecture Hall",
  ];

  const fetchFilter = async (filteredItem: string) => {
    if (!filteredItem) {
      setDestinations([]);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/buildings_by_filter?type=${filteredItem}`
      );
      const data = await response.json();
      console.log(data); // Check the structure in the console

      setDestinations(data); // Since data is an array, results can be set directly
    } catch (error) {
      console.error("Error fetching filter results:", error);
    }
  };

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
                  type="radio"
                  id={item}
                  name="filtered_buildings"
                  onClick={() => fetchFilter(item)}
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
