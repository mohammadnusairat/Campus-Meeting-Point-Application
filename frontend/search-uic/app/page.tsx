import SearchBar from "./Components/SearchBar";
import EtaDirections from "./Components/EtaDirections";
import Title from "./Components/Title";
import CurrentLocation from "./Components/CurrentLocation";
import Filter from "./Components/Filter";

import "@/app/Styles/Page.css";

export default function Home() {
  return (
    // Please place data in its appropriate div/component
    <div className="Home">
      <div className="title-search-location">
        <Title />
        <SearchBar placeholder="Enter Building Name" />
        <CurrentLocation />
      </div>
      <div className="eta-filter">
        <EtaDirections />
        <Filter />
      </div>
    </div>
  );
}
