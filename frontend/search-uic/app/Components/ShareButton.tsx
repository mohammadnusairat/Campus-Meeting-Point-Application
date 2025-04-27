import "@/app/Styles/ShareButton.css";
import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  selectedPin: string;
}

export default function ShareButton({ selectedPin }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!selectedPin) return;

    try {
      await navigator.clipboard.writeText(
        `https://google.com/maps/search/?api=1&query=${selectedPin}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="share-button">
      <div className="share-icon-placement">
        <Share2 />
      </div>
      <button
        className={`copy-pin-link ${copied ? "bounce" : ""}`}
        onClick={handleCopy}
      >
        {copied
          ? "Link Copied!"
          : `Copy ${!selectedPin ? "selected pin" : selectedPin} to clipboard`}
      </button>
    </div>
  );
}