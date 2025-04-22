import "@/app/Styles/ShareButton.css";
import { Share, Share2 } from "lucide-react";

interface ShareButtonProps {
  selectedPin: string;
}

export default function ShareButton({ selectedPin }: ShareButtonProps) {
  return (
    <>
      <div className="share-button">
        <div className="share-icon-placement">
          <Share2 />
        </div>
        {/* Please place data in its appropriate div  */}
        {/* <div className="content-drop-down">Share Button</div> */}
        <button
          className="copy-pin-link"
          onClick={() =>
            navigator.clipboard.writeText(
              `https://google.com/maps/search/?api=1&query=${selectedPin}`
            )
          }
        >
          Copy {!selectedPin ? <div>selected pin</div> : selectedPin} to
          clipboard
        </button>
      </div>
    </>
  );
}
