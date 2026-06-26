import React from "react";
import { 
  RotateCw, RotateCcw, Trash2, FileText, LayoutGrid, MoreVertical, Plus, ChevronDown 
} from "lucide-react";

interface PageSidebarProps {
  pageOrder: number[];
  removedPages: Set<number>;
  pageRotations: { [page: number]: number };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  thumbnails: string[];
  toolColor: string;
  totalPages: number;
  rotatePage: (pageNum: number, direction?: "cw" | "ccw") => void;
  removePage: (pageNum: number) => void;
  onAddPages?: () => void;
  setPageOrder?: React.Dispatch<React.SetStateAction<number[]>>;
  showToast?: (message: string, type?: "info" | "success" | "warning") => void;
}

export function PageSidebar({
  pageOrder,
  removedPages,
  pageRotations,
  currentPage,
  setCurrentPage,
  thumbnails,
  toolColor,
  totalPages,
  rotatePage,
  removePage,
  onAddPages,
  setPageOrder,
  showToast
}: PageSidebarProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    if (setPageOrder) {
      setPageOrder((prev) => {
        const result = [...prev];
        const [removed] = result.splice(draggedIndex, 1);
        result.splice(targetIndex, 0, removed);
        return result;
      });
    }

    if (showToast) {
      showToast(`Moved Page ${pageOrder[draggedIndex]} to position ${targetIndex + 1}`, "success");
    }

    setCurrentPage(targetIndex + 1);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  return (
    <aside style={{
      width: "220px",
      minWidth: "220px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flexShrink: 0,
      userSelect: "none",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f4f4f4"
      }}>
        <span style={{
          fontSize: "0.85rem",
          fontWeight: "700",
          color: "#1e293b"
        }}>
          Pages
        </span>
        <button style={{
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f4f4f4"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <LayoutGrid size={15} />
        </button>
      </div>

      {/* Pages List */}
      <div className="editor-page-sidebar-scroll" style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        {pageOrder.map((pageNum, idx) => {
          const isRemoved = removedPages.has(pageNum);
          const rotation = pageRotations[pageNum] || 0;
          const isActive = currentPage === idx + 1;
          
          return (
            <div
              key={pageNum}
              onClick={() => !isRemoved && setCurrentPage(idx + 1)}
              className="page-thumbnail-container"
              draggable={!isRemoved}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                opacity: draggedIndex === idx ? 0.4 : 1,
                cursor: isRemoved ? "not-allowed" : "grab",
                transition: "opacity 0.2s"
              }}
            >
              {/* Card Element */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  borderRadius: "8px",
                  border: `2px solid ${isActive ? "#2563eb" : (dragOverIndex === idx ? "#3b82f6" : "transparent")}`,
                  borderStyle: dragOverIndex === idx ? "dashed" : "solid",
                  padding: "4px",
                  backgroundColor: isActive ? "#f8fafc" : (dragOverIndex === idx ? "#eff6ff" : "transparent"),
                  cursor: isRemoved ? "not-allowed" : "inherit",
                  transform: dragOverIndex === idx ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none"
                }}
              >
                {/* Image / Thumbnail Container */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "0.75",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${isActive ? "#2563eb" : "#e2e8f0"}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  {thumbnails[pageNum - 1] ? (
                    <img
                      src={thumbnails[pageNum - 1]}
                      style={{
                        maxHeight: "92%",
                        maxWidth: "92%",
                        objectFit: "contain",
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 0.25s ease"
                      }}
                      alt={`Page ${pageNum}`}
                    />
                  ) : (
                    <FileText size={24} style={{ color: "#94a3b8" }} />
                  )}
                  {isRemoved && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 4,
                        backgroundColor: "rgba(239,68,68,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "5px"
                      }}
                    >
                      <span style={{ color: "#ffffff", fontSize: "0.62rem", fontWeight: "600" }}>
                        Excluded
                      </span>
                    </div>
                  )}
                </div>

                {/* Page Number Label bottom-left inside or below */}
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#2563eb" : "#94a3b8",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: "750",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                }}>
                  {idx + 1}
                </div>
              </div>

              {/* Actions side drawer - visible on hover/active */}
              <div 
                className="thumbnail-action-bar"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  width: "28px",
                  alignItems: "center"
                }}
              >
                {isActive ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rotatePage(pageNum, "ccw");
                      }}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        color: "#475569",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Rotate Counter-Clockwise"
                    >
                      <RotateCcw size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rotatePage(pageNum, "cw");
                      }}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        color: "#475569",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Rotate Clockwise"
                    >
                      <RotateCw size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePage(pageNum);
                      }}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Delete Page"
                    >
                      <Trash2 size={10} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(idx + 1);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                  >
                    <MoreVertical size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Add Pages button */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #f4f4f4"
      }}>
        <button
          onClick={onAddPages || (() => {})}
          style={{
            width: "100%",
            height: "36px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#334155",
            fontSize: "0.78rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} style={{ color: "#475569" }} />
            Add Pages
          </div>
          <ChevronDown size={12} style={{ color: "#94a3b8" }} />
        </button>
      </div>
    </aside>
  );
}

