import React from "react";

export function getToolColor(identifier: string): string {
  const key = identifier.toLowerCase().replace(/ pdf|pdf /g, "").replace("-", " ").trim();
  
  // 1. Optimize
  if (key.includes("compress")) return "#ef4444"; // Coral Red
  if (key.includes("flatten")) return "#f97316"; // Orange
  if (key.includes("repair")) return "#d97706"; // Amber/Gold
  
  // 2. AI Intelligence
  if (key.includes("copilot") || key.includes("ai")) return "#a855f7"; // Violet
  if (key.includes("summarize")) return "#ec4899"; // Pink
  if (key.includes("translate")) return "#d946ef"; // Magenta
  
  // 3. Page Operations
  if (key.includes("merge")) return "#6366f1"; // Indigo
  if (key.includes("split")) return "#8b5cf6"; // Purple
  if (key.includes("rotate")) return "#7c3aed"; // Violet-Purple
  if (key.includes("remove") || key.includes("delete")) return "#dc2626"; // Crimson Red
  if (key.includes("extract")) return "#4f46e5"; // Royal Indigo
  if (key.includes("organize")) return "#5b21b6"; // Deep Purple
  
  // 4. Edit Tools
  if (key.includes("edit")) return "#0d9488"; // Teal
  if (key.includes("annotator") || key.includes("annotate")) return "#0ea5e9"; // Cyan
  if (key.includes("watermark")) return "#3b82f6"; // Blue
  if (key.includes("number")) return "#4f46e5"; // Indigo
  if (key.includes("crop")) return "#059669"; // Emerald
  if (key.includes("bates")) return "#475569"; // Slate
  
  // 5. Convert to PDF
  if (key.includes("word") || key.includes("doc")) return "#2563eb"; // Blue
  if (key.includes("excel") || key.includes("xls") || key.includes("sheet")) return "#16a34a"; // Green
  if (key.includes("ppt") || key.includes("powerpoint") || key.includes("slide")) return "#ea580c"; // Orange-Red
  if (key.includes("jpg") || key.includes("png") || key.includes("image")) return "#db2777"; // Deep Pink
  if (key.includes("html") || key.includes("url")) return "#0891b2"; // Cyan-Teal
  if (key.includes("txt") || key.includes("text")) return "#4b5563"; // Dark Grey
  
  // 6. Sign & Protect
  if (key.includes("esign") || key.includes("sign")) return "#d97706"; // Amber
  if (key.includes("unlock")) return "#dc2626"; // Red
  if (key.includes("protect")) return "#1e3a8a"; // Navy Blue
  if (key.includes("ocr")) return "#06b6d4"; // Bright Cyan
  
  // Default fallback
  return "#0074f0"; // Pdfmount.online Brand Blue
}

export function getToolIconSVG(identifier: string, size = 20): React.ReactElement {
  const key = identifier.toLowerCase().replace(/ pdf|pdf /g, "").replace("-", " ").trim();
  const toolColor = getToolColor(identifier);

  // 1. Microsoft Word
  if (key.includes("word")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M13.5 5.5H19a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5h-5.5v-13z" fill="currentColor" fillOpacity="0.25" />
        <rect x="15.5" y="8" width="3.5" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="15.5" y="11.2" width="3.5" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="15.5" y="14.4" width="2.5" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="3.5" y="6" width="9" height="12" rx="1.5" fill="currentColor" />
        <text x="8" y="12.5" fill={toolColor} fontSize="9.5px" fontWeight="900" fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif" textAnchor="middle" dominantBaseline="central">W</text>
      </svg>
    );
  }

  // 2. Microsoft Excel
  if (key.includes("excel")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M13.5 5.5H19a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5h-5.5v-13z" fill="currentColor" fillOpacity="0.25" />
        <rect x="15.5" y="8" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="17.5" y="8" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="15.5" y="10.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="17.5" y="10.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="15.5" y="13" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="17.5" y="13" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="15.5" y="15.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="17.5" y="15.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
        <rect x="3.5" y="6" width="9" height="12" rx="1.5" fill="currentColor" />
        <text x="8" y="12.5" fill={toolColor} fontSize="9.5px" fontWeight="900" fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif" textAnchor="middle" dominantBaseline="central">X</text>
      </svg>
    );
  }

  // 3. Microsoft PowerPoint
  if (key.includes("ppt") || key.includes("powerpoint")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M13.5 5.5H19a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5h-5.5v-13z" fill="currentColor" fillOpacity="0.25" />
        <circle cx="17" cy="11.5" r="2.2" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M17 11.5l1.2 1.2M17 11.5v-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <rect x="3.5" y="6" width="9" height="12" rx="1.5" fill="currentColor" />
        <text x="8" y="12.5" fill={toolColor} fontSize="9.5px" fontWeight="900" fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif" textAnchor="middle" dominantBaseline="central">P</text>
      </svg>
    );
  }

  // 4. Compress
  if (key.includes("compress")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <path d="M12 6.5v4M12 10.5l-2-2M12 10.5l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 17.5v-4M12 13.5l-2 2M12 13.5l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  // 5. Merge
  if (key.includes("merge")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="7" width="12" height="14" rx="2" fillOpacity="0.2" />
        <rect x="9" y="3" width="12" height="14" rx="2" fillOpacity="0.45" />
        <path d="M14 9h2v-2h1v2h2v1h-2v2h-1v-2h-2v-1z" />
      </svg>
    );
  }

  // 6. Split
  if (key.includes("split")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3h16a1 1 0 011 1v7H3V4a1 1 0 011-1z" fillOpacity="0.3" />
        <path d="M3 13h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7z" fillOpacity="0.3" />
        <circle cx="7" cy="10" r="1.2" />
        <circle cx="7" cy="14" r="1.2" />
        <path d="M7.5 10.5L11 12M7.5 13.5L11 12M11 12h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. Rotate
  if (key.includes("rotate")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="5" width="12" height="14" rx="1.5" fillOpacity="0.3" />
        <path d="M12 9a2.5 2.5 0 102.5 2.5h-1.2l1.8 2.2 1.8-2.2H15.5a4 4 0 11-4-4z" />
      </svg>
    );
  }

  // 8. Remove / Delete Pages
  if (key.includes("remove") || key.includes("delete")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <path d="M8 7.5h8M9 9.5h6v7H9v-7zM11 11v4M13 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 9. Watermark
  if (key.includes("watermark")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <text x="12" y="12.5" fill="currentColor" fontSize="3px" fontWeight="900" transform="rotate(-30 12 12.5)" textAnchor="middle" dominantBaseline="central">WATERMARK</text>
      </svg>
    );
  }

  // 10. Page Numbers
  if (key.includes("number")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <rect x="12" y="13" width="6" height="6" rx="1" />
        <text x="15" y="16.5" fill="var(--icon-bg-soft, #ffffff)" fontSize="5.5px" fontWeight="900" textAnchor="middle" dominantBaseline="central">12</text>
      </svg>
    );
  }

  // 11. Sign / eSign
  if (key.includes("sign") || key.includes("esign")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <path d="M13 6.5l2.5 2.5L9.5 15H7v-2.5L13 6.5z" />
        <path d="M6 16.5c3-1.5 6-1.5 9-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // 12. Unlock
  if (key.includes("unlock")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor" />
        <path d="M8 10V6.5a4 4 0 017.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14.5" r="1.5" fill="var(--icon-bg-soft, #ffffff)" />
        <path d="M12 16v2.5" stroke="var(--icon-bg-soft, #ffffff)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 13. Protect
  if (key.includes("protect")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor" />
        <path d="M8 10V6a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14.5" r="1.5" fill="var(--icon-bg-soft, #ffffff)" />
        <path d="M12 16v2.5" stroke="var(--icon-bg-soft, #ffffff)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 14. OCR
  if (key.includes("ocr")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <rect x="7" y="7" width="10" height="1.2" rx="0.6" />
        <rect x="7" y="10" width="10" height="1.2" rx="0.6" />
        <rect x="7" y="13" width="6" height="1.2" rx="0.6" />
        <circle cx="14.5" cy="14.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 16l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 15. JPG / PNG / Image
  if (key.includes("jpg") || key.includes("png") || key.includes("image")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" fillOpacity="0.3" />
        <circle cx="8.5" cy="8.5" r="1.8" />
        <path d="M5 18l4.5-5.5 3.5 4.5 2.5-3 4.5 5H5z" />
      </svg>
    );
  }

  // 16. Summarize / AI
  if (key.includes("summarize") || key.includes("ai")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <path d="M9 11l.6-1.9 1.9-.6-1.9-.6L9 6l-.6 1.9-1.9.6 1.9.6L9 11zm5.5 5.5l.4-1.2 1.2-.4-1.2-.4-.4-1.2-.4 1.2-1.2.4 1.2.4.4 1.2z" />
      </svg>
    );
  }

  // 17. Edit & other document-based tools
  if (key.includes("edit") || key.includes("annotator") || key.includes("reader") || key.includes("crop") || key.includes("redact") || key.includes("filler") || key.includes("share")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
        <path d="M14 6.5l2.5 2.5L10 15H7.5v-2.5L14 6.5z" />
        <rect x="7" y="7" width="5" height="1.2" rx="0.6" opacity="0.4" />
        <rect x="7" y="10" width="5" height="1.2" rx="0.6" opacity="0.4" />
        <rect x="7" y="13" width="3" height="1.2" rx="0.6" opacity="0.4" />
      </svg>
    );
  }

  // Default fallback
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" fillOpacity="0.3" />
      <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" />
    </svg>
  );
}

type ToolIconProps = {
  toolNameOrId: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function ToolIcon({ toolNameOrId, size = 22, className = "", style = {} }: ToolIconProps) {
  const toolColor = getToolColor(toolNameOrId);

  return (
    <div 
      className={`tool-icon-container ${className}`} 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        borderRadius: "10px",
        backgroundColor: toolColor,
        color: "#ffffff",
        flexShrink: 0,
        ...style
      }}
    >
      {getToolIconSVG(toolNameOrId, size * 1.6)}
    </div>
  );
}
