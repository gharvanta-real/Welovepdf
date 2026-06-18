import React, { useRef, useState, useEffect } from "react";

interface PdfPageCardProps {
  pdfDoc: any;
  pageNum: number;
  rotation: number;
  isRemoved: boolean;
  isSelected: boolean;
  onRotate: () => void;
  onRemove: () => void;
  onToggleSelect: () => void;
  toolColor: string;
  selectedTool: string;
  indexInGrid: number;
  totalGridItems: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export function PdfPageCard({
  pdfDoc,
  pageNum,
  rotation,
  isRemoved,
  isSelected,
  onRotate,
  onRemove,
  onToggleSelect,
  toolColor,
  selectedTool,
  indexInGrid,
  totalGridItems,
  onMoveLeft,
  onMoveRight,
}: PdfPageCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    let active = true;
    setRenderError(false);
    async function renderPage() {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.35 });
        
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        if (active) setLoading(false);
      } catch (err) {
        console.error("Page render error:", err);
        if (active) {
          setRenderError(true);
          setLoading(false);
        }
      }
    }
    renderPage();
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNum]);

  const showRotate = selectedTool === "Rotate PDF";
  const showRemove = selectedTool === "Remove Pages" || selectedTool === "Organize PDF";
  const showCheckbox = selectedTool === "Split PDF" || selectedTool === "Extract Pages" || selectedTool === "Organize PDF";
  const showMove = selectedTool === "Organize PDF";

  return (
    <div className={`canvas-file-card page-card ${isRemoved ? "removed" : ""} ${isSelected ? "selected" : ""}`} style={{ position: "relative" }}>
      {showCheckbox && (
        <div 
          className="page-card-checkbox-wrapper" 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          style={{ position: "absolute", top: "6px", left: "6px", zIndex: 10, cursor: "pointer", background: "white", borderRadius: "3px", padding: "2px" }}
        >
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggleSelect} 
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
        </div>
      )}
      
      <div className="file-card-preview-box page-preview-box" style={{ overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "140px" }}>
        {loading && (
          <div className="page-loading-placeholder" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", position: "absolute", inset: 0, backgroundColor: "#f9fafb", zIndex: 2 }}>
            <div className="mini-spinner" style={{ width: "16px", height: "16px", border: "2px solid #cbd5e1", borderTopColor: toolColor, borderRadius: "50%", animation: "spin 0.6s linear infinite" }}></div>
          </div>
        )}
        
        {renderError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "#94a3b8", zIndex: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: toolColor }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.2px" }}>Locked / Encrypted</span>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="page-canvas" 
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transition: "transform 0.2s ease-in-out",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: loading ? "none" : "block"
            }} 
          />
        )}
        
        {isRemoved && (
          <div className="page-removed-overlay" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(239, 68, 68, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.8rem", fontWeight: "900", zIndex: 5 }}>
            <span>EXCLUDED</span>
          </div>
        )}
      </div>
      
      <div className="file-card-meta page-meta" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "stretch" }}>
        <span className="file-card-name" style={{ fontSize: "0.78rem", fontWeight: "600", textAlign: "center" }}>Page {pageNum}</span>
        
        <div className="page-card-actions" style={{ display: "flex", gap: "4px", justifyContent: "center", width: "100%" }}>
          {showRotate && (
            <button 
              className="page-action-btn" 
              onClick={(e) => { e.stopPropagation(); onRotate(); }}
              title="Rotate 90° Clockwise"
              style={{ padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          )}
          {showRemove && (
            <button 
              className="page-action-btn delete-btn" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title={isRemoved ? "Restore Page" : "Delete Page"}
              style={{ padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", border: "1px solid var(--border)", background: isRemoved ? "var(--c-accent)" : "var(--c-surface)", color: isRemoved ? "white" : "var(--c-text)", borderRadius: "var(--radius-xs)" }}
            >
              {isRemoved ? "Restore" : "Delete"}
            </button>
          )}
          {showMove && (
            <div style={{ display: "flex", gap: "2px" }}>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
                disabled={indexInGrid === 0}
                title="Move Left"
                style={{ padding: "2px 6px", fontSize: "0.68rem", cursor: indexInGrid === 0 ? "not-allowed" : "pointer", opacity: indexInGrid === 0 ? 0.3 : 1, border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
              >
                &larr;
              </button>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
                disabled={indexInGrid === totalGridItems - 1}
                title="Move Right"
                style={{ padding: "2px 6px", fontSize: "0.68rem", cursor: indexInGrid === totalGridItems - 1 ? "not-allowed" : "pointer", opacity: indexInGrid === totalGridItems - 1 ? 0.3 : 1, border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
