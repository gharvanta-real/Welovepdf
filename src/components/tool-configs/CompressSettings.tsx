import React from "react";
import { Check } from "lucide-react";

interface CompressSettingsProps {
  compressionLevel: "extreme" | "recommended" | "less";
  setCompressionLevel: (val: "extreme" | "recommended" | "less") => void;
  toolColor: string;
}

const levels: { value: "extreme" | "recommended" | "less"; title: string; desc: string; badge: string }[] = [
  {
    value: "extreme",
    title: "Extreme Compression",
    desc: "Maximum file size reduction. Some image quality loss.",
    badge: "~60–80% smaller",
  },
  {
    value: "recommended",
    title: "Recommended",
    desc: "Great balance — good quality, smaller file size.",
    badge: "~30–60% smaller",
  },
  {
    value: "less",
    title: "Less Compression",
    desc: "Lossless repack — zero pixel quality loss.",
    badge: "~5–20% smaller",
  },
];

export function CompressSettings({
  compressionLevel,
  setCompressionLevel,
  toolColor,
}: CompressSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Compression Level</label>
      <div className="options-vertical-list">
        {levels.map(({ value, title, desc, badge }) => {
          const isActive = compressionLevel === value;
          return (
            <button
              key={value}
              className={`option-card${isActive ? " active" : ""}`}
              style={{
                borderColor: isActive ? toolColor : "",
                borderWidth: isActive ? "2px" : "1px",
                background: isActive ? `${toolColor}12` : "",
              }}
              onClick={() => setCompressionLevel(value)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                  <span className="option-title" style={{ color: isActive ? toolColor : "" }}>{title}</span>
                  <span className="option-desc">{desc}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  {isActive && (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: toolColor,
                      color: "#fff",
                      flexShrink: 0,
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: isActive ? toolColor : "var(--text-muted)",
                    background: isActive ? `${toolColor}1a` : "var(--s-surface-low)",
                    padding: "2px 7px",
                    borderRadius: "99px",
                    whiteSpace: "nowrap",
                  }}>
                    {badge}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
