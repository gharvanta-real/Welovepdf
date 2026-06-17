import React from "react";

interface CompressSettingsProps {
  compressionLevel: "extreme" | "recommended" | "less";
  setCompressionLevel: (val: "extreme" | "recommended" | "less") => void;
  toolColor: string;
}

export function CompressSettings({
  compressionLevel,
  setCompressionLevel,
  toolColor,
}: CompressSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Compression Level</label>
      <div className="options-vertical-list">
        <button
          className={`option-card ${compressionLevel === "extreme" ? "active" : ""}`}
          style={{ borderColor: compressionLevel === "extreme" ? toolColor : "" }}
          onClick={() => setCompressionLevel("extreme")}
        >
          <span className="option-title">Extreme Compression</span>
          <span className="option-desc">Less quality, high compression.</span>
        </button>
        <button
          className={`option-card ${compressionLevel === "recommended" ? "active" : ""}`}
          style={{ borderColor: compressionLevel === "recommended" ? toolColor : "" }}
          onClick={() => setCompressionLevel("recommended")}
        >
          <span className="option-title">Recommended Compression</span>
          <span className="option-desc">Good quality, good compression.</span>
        </button>
        <button
          className={`option-card ${compressionLevel === "less" ? "active" : ""}`}
          style={{ borderColor: compressionLevel === "less" ? toolColor : "" }}
          onClick={() => setCompressionLevel("less")}
        >
          <span className="option-title">Less Compression</span>
          <span className="option-desc">High quality, low compression.</span>
        </button>
      </div>
    </div>
  );
}
