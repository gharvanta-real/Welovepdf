import React, { useRef, useState, useEffect } from "react";
import { RotateCw, Trash2, ArrowLeft, ArrowRight, CornerUpLeft } from "lucide-react";
import { renderSmileyIllustration } from "./FilePreviewCard";

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
  onPreviewClick?: () => void;
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
  onPreviewClick,
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
    <div
      className={`canvas-file-card page-card ${isRemoved ? "removed" : ""} ${isSelected ? "selected" : ""}`}
      style={{ position: "relative", cursor: onPreviewClick ? "pointer" : "default" }}
      onClick={() => onPreviewClick?.()}
    >
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
          <div style={{ width: "100%", height: "100%", zIndex: 1 }}>
            {renderSmileyIllustration("LOCKED", "#ef4444", "#fee2e2", { isLocked: true, scale: 0.85 })}
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
          <div className="page-removed-overlay" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(239, 68, 68, 0.15)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
            <div style={{ backgroundColor: "#ef4444", color: "white", padding: "4px 10px", borderRadius: "9999px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>EXCLUDED</div>
          </div>
        )}
      </div>
      
      <div className="file-card-meta page-meta" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "stretch" }}>
        <span className="file-card-name" style={{ fontSize: "0.78rem", fontWeight: "600", textAlign: "center" }}>Page {pageNum}</span>
        
        <div className="page-card-actions" style={{ display: "flex", gap: "6px", justifyContent: "center", width: "100%" }}>
          {showRotate && (
            <button 
              className="page-action-btn" 
              onClick={(e) => { e.stopPropagation(); onRotate(); }}
              title="Rotate 90°"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--c-bg)",
                color: "var(--c-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "var(--s-primary)";
                e.currentTarget.style.color = "var(--s-on-primary)";
                e.currentTarget.style.borderColor = "var(--s-primary)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "var(--c-bg)";
                e.currentTarget.style.color = "var(--c-text)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <RotateCw size={13} strokeWidth={2.4} />
            </button>
          )}
          {showRemove && (
            <button 
              className="page-action-btn" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title={isRemoved ? "Restore Page" : "Delete Page"}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: isRemoved ? "var(--s-primary)" : "var(--c-bg)",
                color: isRemoved ? "var(--s-on-primary)" : "var(--c-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = isRemoved ? "var(--c-bg)" : "var(--s-primary)";
                e.currentTarget.style.color = isRemoved ? "var(--c-text)" : "var(--s-on-primary)";
                e.currentTarget.style.borderColor = isRemoved ? "var(--border)" : "var(--s-primary)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = isRemoved ? "var(--s-primary)" : "var(--c-bg)";
                e.currentTarget.style.color = isRemoved ? "var(--s-on-primary)" : "var(--c-text)";
                e.currentTarget.style.borderColor = isRemoved ? "var(--s-primary)" : "var(--border)";
              }}
            >
              {isRemoved ? <CornerUpLeft size={13} strokeWidth={2.4} /> : <Trash2 size={13} strokeWidth={2.4} />}
            </button>
          )}
          {showMove && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
                disabled={indexInGrid === 0}
                title="Move Left"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--c-bg)",
                  color: "var(--c-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: indexInGrid === 0 ? "not-allowed" : "pointer",
                  opacity: indexInGrid === 0 ? 0.35 : 1,
                  transition: "all 0.15s ease-in-out",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                }}
                onMouseOver={e => {
                  if (indexInGrid > 0) {
                    e.currentTarget.style.background = "var(--s-primary)";
                    e.currentTarget.style.color = "var(--s-on-primary)";
                    e.currentTarget.style.borderColor = "var(--s-primary)";
                  }
                }}
                onMouseOut={e => {
                  if (indexInGrid > 0) {
                    e.currentTarget.style.background = "var(--c-bg)";
                    e.currentTarget.style.color = "var(--c-text)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >
                <ArrowLeft size={13} strokeWidth={2.4} />
              </button>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
                disabled={indexInGrid === totalGridItems - 1}
                title="Move Right"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--c-bg)",
                  color: "var(--c-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: indexInGrid === totalGridItems - 1 ? "not-allowed" : "pointer",
                  opacity: indexInGrid === totalGridItems - 1 ? 0.35 : 1,
                  transition: "all 0.15s ease-in-out",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                }}
                onMouseOver={e => {
                  if (indexInGrid < totalGridItems - 1) {
                    e.currentTarget.style.background = "var(--s-primary)";
                    e.currentTarget.style.color = "var(--s-on-primary)";
                    e.currentTarget.style.borderColor = "var(--s-primary)";
                  }
                }}
                onMouseOut={e => {
                  if (indexInGrid < totalGridItems - 1) {
                    e.currentTarget.style.background = "var(--c-bg)";
                    e.currentTarget.style.color = "var(--c-text)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >
                <ArrowRight size={13} strokeWidth={2.4} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
