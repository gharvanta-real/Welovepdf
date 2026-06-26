import React from "react";
import { 
  ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, Maximize2, 
  LayoutGrid, BookOpen, Bookmark 
} from "lucide-react";

interface BottomBarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
  onToggleGridView?: () => void;
  onToggleOutlineView?: () => void;
  onToggleBookmarkView?: () => void;
}

export function BottomBar({
  currentPage,
  totalPages,
  zoom,
  setZoom,
  setCurrentPage,
  onToggleGridView = () => {},
  onToggleOutlineView = () => {},
  onToggleBookmarkView = () => {}
}: BottomBarProps) {
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setCurrentPage(val);
      } else {
        e.currentTarget.value = String(currentPage);
      }
    }
  };

  const handleZoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setZoom(val);
    }
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "20px",
      left: "20px",
      right: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
      pointerEvents: "none", // Allows clicking through the empty space to the canvas
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left Capsule: View Options */}
      <div style={{ 
        display: "flex", 
        gap: "4px", 
        alignItems: "center",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "9999px",
        padding: "4px 8px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)",
        pointerEvents: "auto"
      }}>
        {[
          { icon: <LayoutGrid size={13} />, action: onToggleGridView, title: "Grid View" },
          { icon: <BookOpen size={13} />, action: onToggleOutlineView, title: "Outline View" },
          { icon: <Bookmark size={13} />, action: onToggleBookmarkView, title: "Bookmarks" }
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            title={btn.title}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f4f4f4"; e.currentTarget.style.color = "#1e293b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Center Capsule: Pagination Controls */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "9999px",
        padding: "4px 14px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)",
        pointerEvents: "auto"
      }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.4 : 1,
            padding: 0,
            outline: "none"
          }}
          onMouseEnter={(e) => { if (currentPage > 1) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <ChevronLeft size={13} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="text"
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={handlePageInput}
            style={{
              width: "24px",
              height: "20px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              textAlign: "center",
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "#1e293b",
              outline: "none",
              padding: 0
            }}
          />
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>/ {totalPages}</span>
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.4 : 1,
            padding: 0,
            outline: "none"
          }}
          onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Right Capsule: Zoom & Fullscreen Controls */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "6px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "9999px",
        padding: "4px 10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)",
        pointerEvents: "auto"
      }}>
        {/* Zoom Out */}
        <button
          onClick={() => setZoom((z) => Math.max(z - 10, 30))}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <Minus size={11} />
        </button>

        {/* Zoom select menu */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <select
            value={`${zoom}`}
            onChange={handleZoomSelect}
            style={{
              padding: "2px 20px 2px 6px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "#1e293b",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none"
            }}
          >
            {[50, 75, 100, 125, 150, 200].map((z) => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>
          <div style={{
            position: "absolute",
            right: "6px",
            pointerEvents: "none",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center"
          }}>
            <ChevronDown size={10} />
          </div>
        </div>

        {/* Zoom In */}
        <button
          onClick={() => setZoom((z) => Math.min(z + 10, 250))}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <Plus size={11} />
        </button>

        {/* Separator */}
        <div style={{ width: "1px", height: "16px", backgroundColor: "#e2e8f0", margin: "0 2px" }} />

        {/* Fit Screen */}
        <button
          onClick={() => setZoom(100)}
          title="Fit Screen"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <Maximize2 size={11} />
        </button>
      </div>
    </div>
  );
}

