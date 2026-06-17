import React from "react";
import { RotateCw, Check, X, FileText } from "lucide-react";

interface PageSidebarProps {
  pageOrder: number[];
  removedPages: Set<number>;
  pageRotations: { [page: number]: number };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  thumbnails: string[];
  toolColor: string;
  totalPages: number;
  rotatePage: (pageNum: number) => void;
  removePage: (pageNum: number) => void;
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
}: PageSidebarProps) {
  return (
    <aside
      style={{
        width: "200px",
        minWidth: "200px",
        backgroundColor: "var(--surface-raised)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          fontSize: "0.74rem",
          fontWeight: "500",
          color: "var(--text-muted)",
          borderBottom: "1px solid var(--border)",
          marginBottom: "8px",
        }}
      >
        Pages · {totalPages - removedPages.size}/{totalPages}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 10px 16px" }}>
        {pageOrder.map((pageNum, idx) => {
          const isRemoved = removedPages.has(pageNum);
          const rotation = pageRotations[pageNum] || 0;
          const isActive = currentPage === idx + 1;
          return (
            <div
              key={pageNum}
              onClick={() => !isRemoved && setCurrentPage(idx + 1)}
              style={{
                position: "relative",
                borderRadius: "8px",
                border: `2px solid ${isActive ? toolColor : isRemoved ? "#ef4444" : "transparent"}`,
                padding: "6px",
                backgroundColor: isActive
                  ? `${toolColor}15`
                  : isRemoved
                  ? "rgba(239, 68, 68, 0.15)"
                  : "var(--c-bg)",
                cursor: isRemoved ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: isActive ? `0 2px 10px ${toolColor}33` : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "8.5/11",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {thumbnails[pageNum - 1] ? (
                  <img
                    src={thumbnails[pageNum - 1]}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.3s",
                    }}
                    alt={`Page ${pageNum}`}
                  />
                ) : (
                  <FileText size={24} style={{ color: "var(--text-muted)" }} />
                )}
                {isRemoved && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(239,68,68,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: "#fff", fontSize: "0.68rem", fontWeight: "600" }}>
                      Excluded
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: isActive ? "var(--c-text)" : "var(--text-muted)",
                  }}
                >
                  pg. {idx + 1}
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(pageNum);
                    }}
                    style={{
                      padding: "2px 4px",
                      borderRadius: "3px",
                      border: "1px solid var(--border)",
                      background: "var(--c-surface)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    title="Rotate"
                  >
                    <RotateCw size={9} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(pageNum);
                    }}
                    style={{
                      padding: "2px 4px",
                      borderRadius: "3px",
                      border: `1px solid ${isRemoved ? "#22c55e" : "#ef4444"}33`,
                      background: "var(--c-surface)",
                      color: isRemoved ? "#22c55e" : "#ef4444",
                      cursor: "pointer",
                    }}
                    title={isRemoved ? "Restore" : "Remove"}
                  >
                    {isRemoved ? <Check size={9} /> : <X size={9} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
