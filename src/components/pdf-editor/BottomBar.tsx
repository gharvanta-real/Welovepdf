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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 20px",
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e2e8f0",
      color: "#475569",
      fontSize: "0.72rem",
      flexShrink: 0,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left side: View icons */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#1e293b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Center: Pagination */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            padding: 0
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
              width: "28px",
              height: "20px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              textAlign: "center",
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "#1e293b",
              outline: "none"
            }}
          />
          <span style={{ color: "#94a3b8", fontWeight: "500" }}>/ {totalPages}</span>
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
            padding: 0
          }}
          onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Right: Zoom Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Zoom Out Button */}
        <button
          onClick={() => setZoom((z) => Math.max(z - 10, 30))}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <Minus size={12} />
        </button>

        {/* Zoom Percent dropdown */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <select
            value={`${zoom}`}
            onChange={handleZoomSelect}
            style={{
              padding: "2px 20px 2px 6px",
              borderRadius: "4px",
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

        {/* Zoom In Button */}
        <button
          onClick={() => setZoom((z) => Math.min(z + 10, 250))}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <Plus size={12} />
        </button>

        {/* Fit to window */}
        <button
          onClick={() => setZoom(100)}
          title="Fit to Window"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
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
