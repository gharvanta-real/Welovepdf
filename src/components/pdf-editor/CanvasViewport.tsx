import React, { useRef } from "react";
import { FileText, Crop } from "lucide-react";
import { OverlayElement, ActiveTool } from "./types";

interface CanvasViewportProps {
  pageCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayContainerRef: React.RefObject<HTMLDivElement | null>;
  showRuler: boolean;
  showGrid: boolean;
  pageMargins: string;
  activeTool: ActiveTool;
  selectedTool: string;
  currentPage: number;
  elements: OverlayElement[];
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<OverlayElement>) => void;
  updateTextContent: (id: string, text: string) => void;
  deleteElement: (id: string) => void;
  toolColor: string;
  
  // Pen Drawing State
  isDrawingPen: boolean;
  currentPathPoints: { x: number; y: number }[];
  penColor: string;
  penThickness: number;

  // Mouse Handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;

  // Crop State
  cropTop: number;
  cropBottom: number;
  cropLeft: number;
  cropRight: number;
  cropMargin: number;
  handleCropDragStart: (e: React.MouseEvent, handle: string) => void;
  isCropLinked: boolean;
}

export function CanvasViewport({
  pageCanvasRef,
  overlayContainerRef,
  showRuler,
  showGrid,
  pageMargins,
  activeTool,
  selectedTool,
  currentPage,
  elements,
  selectedElementId,
  setSelectedElementId,
  updateElement,
  updateTextContent,
  deleteElement,
  toolColor,
  
  isDrawingPen,
  currentPathPoints,
  penColor,
  penThickness,

  handleMouseDown,
  handleMouseMove,
  handleMouseUp,

  cropTop,
  cropBottom,
  cropLeft,
  cropRight,
  cropMargin,
  handleCropDragStart,
  isCropLinked
}: CanvasViewportProps) {
  
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#f8fafc"
    }}>
      
      {/* 1. Rulers Grid */}
      {showRuler && (
        <div style={{
          height: "20px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          paddingLeft: "8px",
          flexShrink: 0
        }}>
          <div style={{ flex: 1, height: "100%", position: "relative", overflow: "hidden" }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} style={{
                position: "absolute",
                left: `${i * 72}px`,
                fontSize: "0.55rem",
                color: "#94a3b8",
                borderLeft: "1px solid #e2e8f0",
                paddingLeft: "2px",
                height: "100%",
                display: "flex",
                alignItems: "flex-end"
              }}>
                {i > 0 ? i : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Canvas view-scroll container */}
      <div 
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "32px 24px"
        }}
      >
        {/* Document sheet wrapper */}
        <div
          className="canvas-document-wrapper"
          style={{
            position: "relative",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px #e2e8f0",
            backgroundColor: "#ffffff",
            cursor: activeTool === "pan" ? "grab" : activeTool === "text" ? "text" : activeTool === "select" ? "default" : "crosshair"
          }}
        >
          {/* PDF Page Canvas */}
          <canvas ref={pageCanvasRef} style={{ display: "block" }} />

          {/* Grid Overlay */}
          {showGrid && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }} />
          )}

          {/* Margin Guides */}
          {pageMargins !== "None" && (
            <div style={{
              position: "absolute",
              inset: pageMargins === "Narrow" ? "4.5%" : pageMargins === "Normal" ? "9%" : "18%",
              border: "1px dashed rgba(37,99,235,0.25)",
              pointerEvents: "none",
              zIndex: 1
            }} />
          )}

          {/* Crop Boundary Guides Overlay */}
          {(selectedTool === "Crop PDF" || activeTool === "crop") && (
            <div style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 3,
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: `${cropTop}%`,
                left: `${cropLeft}%`,
                right: `${cropRight}%`,
                bottom: `${cropBottom}%`,
                border: "2px dashed #2563eb",
                borderRadius: "4px",
                boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto"
              }}>
                {/* Badge Label */}
                <div style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  cursor: "move",
                  userSelect: "none"
                }}
                onMouseDown={(e) => handleCropDragStart(e, "move")}
                >
                  Crop Area ({Math.round(100 - cropLeft - cropRight)}% x {Math.round(100 - cropTop - cropBottom)}%)
                </div>

                {/* Handles Grid */}
                {/* Corners */}
                {["nw", "ne", "sw", "se"].map((corner) => (
                  <div 
                    key={corner}
                    onMouseDown={(e) => handleCropDragStart(e, corner)}
                    style={{
                      position: "absolute",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#ffffff",
                      border: "2px solid #2563eb",
                      borderRadius: "50%",
                      cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                      top: corner.startsWith("n") ? "-5px" : "auto",
                      bottom: corner.startsWith("s") ? "-5px" : "auto",
                      left: corner.endsWith("w") ? "-5px" : "auto",
                      right: corner.endsWith("e") ? "-5px" : "auto",
                      zIndex: 10
                    }}
                  />
                ))}

                {/* Edges */}
                {[
                  { key: "n", cursor: "ns-resize", style: { top: "-4px", left: "10px", right: "10px", height: "8px" } },
                  { key: "s", cursor: "ns-resize", style: { bottom: "-4px", left: "10px", right: "10px", height: "8px" } },
                  { key: "w", cursor: "ew-resize", style: { left: "-4px", top: "10px", bottom: "10px", width: "8px" } },
                  { key: "e", cursor: "ew-resize", style: { right: "-4px", top: "10px", bottom: "10px", width: "8px" } }
                ].map(edge => (
                  <div
                    key={edge.key}
                    onMouseDown={(e) => handleCropDragStart(e, edge.key)}
                    style={{
                      position: "absolute",
                      cursor: edge.cursor,
                      zIndex: 9,
                      ...edge.style
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Drag & Drop Interactive Canvas Overlay */}
          <div
            ref={overlayContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ 
              position: "absolute", 
              inset: 0, 
              zIndex: 2, 
              userSelect: "none" 
            }}
          >
            {/* SVG Drawings Pen Path */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
              {elements.filter(el => el.page === currentPage && el.type === "drawing").map(el => {
                if (!el.points || el.points.length < 2) return null;
                const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");
                return <path key={el.id} d={d} stroke={el.color} strokeWidth={el.thickness} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
              })}
              {isDrawingPen && currentPathPoints.length > 1 && (
                <path
                  d={currentPathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ")}
                  stroke={penColor} strokeWidth={penThickness} fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Canvas Interactive Elements */}
            {elements.filter(el => el.page === currentPage).map(el => {
              const isSel = selectedElementId === el.id;
              
              // Bounding box style similar to screenshot select indicator:
              // Dashed outline with 4 blue handle nodes at the borders.
              const baseStyle: React.CSSProperties = {
                position: "absolute",
                left: `${el.x}%`, 
                top: `${el.y}%`,
                border: isSel ? "1.5px dashed #2563eb" : "1.5px solid transparent",
                cursor: activeTool === "select" && !el.locked ? "move" : el.locked ? "not-allowed" : "default",
                outline: "none",
                transition: "border 0.08s ease"
              };

              // Resize nodes for active elements
              const resizeNodes = isSel && (
                <>
                  {/* Circular border drag handles */}
                  {["nw", "ne", "sw", "se"].map((h) => (
                    <div 
                      key={h}
                      style={{
                        position: "absolute",
                        width: "6px",
                        height: "6px",
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #2563eb",
                        borderRadius: "50%",
                        top: h.startsWith("n") ? "-4px" : "auto",
                        bottom: h.startsWith("s") ? "-4px" : "auto",
                        left: h.endsWith("w") ? "-4px" : "auto",
                        right: h.endsWith("e") ? "-4px" : "auto",
                        pointerEvents: "none"
                      }}
                    />
                  ))}
                </>
              );

              // Render text element
              if (el.type === "text") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{
                      ...baseStyle, 
                      padding: "2px 6px", 
                      borderRadius: "4px",
                      backgroundColor: isSel ? "rgba(37,99,235,0.02)" : "transparent",
                      minWidth: "120px"
                    }}
                  >
                    {isSel ? (
                      <input
                        autoFocus
                        type="text"
                        value={el.content}
                        onChange={e => updateTextContent(el.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{
                          color: el.color || "#111111", 
                          fontSize: `${el.fontSize || 14}px`,
                          fontFamily: el.fontFamily || "Inter",
                          fontWeight: el.isBold ? "bold" : "normal",
                          fontStyle: el.isItalic ? "italic" : "normal",
                          textDecoration: `${el.isUnderline ? "underline " : ""}${el.isStrike ? "line-through" : ""}`.trim(),
                          textAlign: el.align || "left",
                          lineHeight: el.lineHeight || 1.5,
                          border: "none", 
                          outline: "none", 
                          background: "transparent",
                          padding: 0, 
                          width: "100%"
                        }}
                      />
                    ) : (
                      <span style={{
                        color: el.color || "#111111", 
                        fontSize: `${el.fontSize || 14}px`,
                        fontFamily: el.fontFamily || "Inter",
                        fontWeight: el.isBold ? "bold" : "normal",
                        fontStyle: el.isItalic ? "italic" : "normal",
                        textDecoration: `${el.isUnderline ? "underline " : ""}${el.isStrike ? "line-through" : ""}`.trim(),
                        textAlign: el.align || "left",
                        lineHeight: el.lineHeight || 1.5,
                        display: "block", 
                        whiteSpace: "nowrap"
                      }}>{el.content}</span>
                    )}
                    {resizeNodes}
                  </div>
                );
              }

              // Highlight element
              if (el.type === "highlight") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{ 
                      ...baseStyle, 
                      width: `${el.width || 28}%`, 
                      height: `${el.height || 3.5}%`, 
                      backgroundColor: el.color || "#FFE83B", 
                      opacity: el.opacity || 0.4, 
                      borderRadius: "2px" 
                    }}
                  >
                    {resizeNodes}
                  </div>
                );
              }

              // Shape elements
              if (el.type === "shape") {
                const isCircle = el.shapeType === "circle";
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{
                      ...baseStyle,
                      width: `${el.width || 18}%`, 
                      height: `${el.height || 12}%`,
                      border: `${el.thickness || 2}px solid ${el.color || "#2563eb"}`,
                      borderRadius: isCircle ? "50%" : el.shapeType === "diamond" ? "0" : "2px",
                      transform: el.shapeType === "diamond" ? "rotate(45deg)" : "none",
                      backgroundColor: el.bgColor && el.bgColor !== "transparent" ? el.bgColor : "transparent",
                      outline: "none"
                    }}
                  >
                    {resizeNodes}
                  </div>
                );
              }

              // Redact regions
              if (el.type === "redact") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{
                      ...baseStyle, 
                      width: `${el.width || 22}%`, 
                      height: `${el.height || 5}%`,
                      backgroundColor: el.color || "#0f172a", 
                      borderRadius: "2px", 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <span style={{ 
                      color: "#ffffff", 
                      fontSize: "9px", 
                      fontWeight: "900", 
                      letterSpacing: "0.05em", 
                      pointerEvents: "none" 
                    }}>
                      {el.redactText || "REDACTED"}
                    </span>
                    {resizeNodes}
                  </div>
                );
              }

              // Comments: Aisha Khan card style from mock screenshot
              if (el.type === "comment") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{ 
                      ...baseStyle, 
                      width: "190px", 
                      height: "auto",
                      border: "none"
                    }}
                  >
                    {/* Aisha Khan Mock Comment card block */}
                    <div style={{
                      backgroundColor: "#fefcbf", // Yellow card style
                      border: "1px solid #fef08a",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* Avatar */}
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#475569",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.58rem",
                          fontWeight: "750"
                        }}>
                          AK
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#1e293b" }}>Aisha Khan</span>
                          <span style={{ fontSize: "0.52rem", color: "#64748b" }}>Today, 10:30 AM</span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: "0.68rem",
                        color: "#334155",
                        lineHeight: 1.35,
                        margin: "2px 0 4px 0",
                        fontWeight: "500",
                        whiteSpace: "normal"
                      }}>
                        {el.commentText || "Please update the statistics in this section."}
                      </p>
                      <button style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "0.62rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left"
                      }}>
                        Reply
                      </button>
                    </div>
                  </div>
                );
              }

              // Link overlays
              if (el.type === "link") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{ ...baseStyle, padding: "2px 6px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "4px" }}
                    title={el.linkUrl}
                  >
                    <span style={{ color: "#2563eb", fontSize: "11px", textDecoration: "underline", fontWeight: "600" }}>
                      🔗 {el.content || el.linkUrl}
                    </span>
                    {resizeNodes}
                  </div>
                );
              }

              // Watermarks & stamps
              if (el.type === "stamp") {
                const isWatermark = el.stampType === "WATERMARK";
                const isApproved = el.stampType === "APPROVED";
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{
                      ...baseStyle,
                      width: isWatermark ? `${el.width || 70}%` : `${el.width || 22}%`,
                      height: isWatermark ? `${el.height || 30}%` : `${el.height || 8}%`,
                      border: isWatermark ? "none" : (isApproved ? "2.5px solid #22c55e" : `2.5px solid ${el.color || "#64748b"}`),
                      borderRadius: isWatermark ? "0" : "6px",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      transform: isWatermark ? "rotate(-30deg)" : "none",
                      opacity: isWatermark ? (el.opacity || 0.15) : 1.0,
                      backgroundColor: isWatermark ? "transparent" : "rgba(255,255,255,0.9)",
                      boxShadow: isWatermark ? "none" : "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                  >
                    {/* approved signature handwritten text style */}
                    <span style={{
                      color: isApproved ? "#ef4444" : (el.color || "#64748b"),
                      fontSize: isWatermark ? "24px" : "13px",
                      fontWeight: "900", 
                      letterSpacing: isWatermark ? "0.15em" : "0.05em",
                      fontFamily: isApproved ? "'Caveat', 'Segoe Script', cursive, sans-serif" : "Arial, sans-serif",
                      textTransform: isWatermark ? "uppercase" : "none",
                      pointerEvents: "none"
                    }}>
                      {isWatermark ? (el.content || "CONFIDENTIAL") : (isApproved ? "Approved" : el.stampType)}
                    </span>
                    {resizeNodes}
                  </div>
                );
              }

              // Signature image overlay
              if (el.type === "signature" || el.type === "image") {
                return (
                  <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{ ...baseStyle, width: `${el.width || 22}%`, height: `${el.height || 10}%` }}
                  >
                    <img src={el.dataUrl} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} alt={el.type} />
                    {resizeNodes}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
