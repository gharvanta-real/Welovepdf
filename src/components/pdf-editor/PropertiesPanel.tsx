import React, { useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Copy, Lock, Unlock, Plus, Minus, Trash2, Crop, X, ChevronDown, ChevronUp
} from "lucide-react";
import { OverlayElement, ActiveTool, FONTS, FONT_SIZES, PRESET_COLORS } from "./types";

interface PropertiesPanelProps {
  selectedEl: OverlayElement | undefined;
  selectedTool: string;
  activeTool: ActiveTool;
  textFont: string;
  updateElement: (id: string, updates: Partial<OverlayElement>) => void;
  textSize: number;
  handleTextSizeChange: (sz: number) => void;
  isBold: boolean;
  toggleBold: () => void;
  isItalic: boolean;
  toggleItalic: () => void;
  isUnderline: boolean;
  toggleUnderline: () => void;
  isStrike: boolean;
  toggleStrike: () => void;
  duplicateElement: (id: string) => void;
  toggleLock: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  deleteElement: (id: string) => void;
  cropMargin: number;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  isCropLinked: boolean;
  setIsCropLinked: (linked: boolean) => void;
  handleCropMarginUniformChange: (val: number) => void;
  handleCropLeftChange: (val: number) => void;
  handleCropRightChange: (val: number) => void;
  handleCropTopChange: (val: number) => void;
  handleCropBottomChange: (val: number) => void;
  totalPages: number;
  currentPage: number;
  zoom: number;
  elementsCount: number;
  stampType: string;
  setStampType: (s: string) => void;
  toolColor: string;
  onClosePanel?: () => void;

  // Defaults props
  handleFontChange?: (font: string) => void;
  align?: "left" | "center" | "right" | "justify";
  updateAlignment?: (a: "left" | "center" | "right" | "justify") => void;
  textColor?: string;
  handleTextColorChange?: (color: string) => void;
  penColor?: string;
  setPenColor?: (c: string) => void;
  penThickness?: number;
  setPenThickness?: (t: number) => void;
  markerColor?: string;
  setMarkerColor?: (c: string) => void;
  markerOpacity?: number;
  setMarkerOpacity?: (o: number) => void;
  shapeType?: "rectangle" | "circle" | "line" | "arrow" | "diamond";
  setShapeType?: (t: "rectangle" | "circle" | "line" | "arrow" | "diamond") => void;
  shapeColor?: string;
  setShapeColor?: (c: string) => void;
  shapeFillColor?: string;
  setShapeFillColor?: (c: string) => void;
  shapeThickness?: number;
  setShapeThickness?: (t: number) => void;
}

export function PropertiesPanel({
  selectedEl,
  selectedTool,
  activeTool,
  textFont,
  updateElement,
  textSize,
  handleTextSizeChange,
  isBold,
  toggleBold,
  isItalic,
  toggleItalic,
  isUnderline,
  toggleUnderline,
  isStrike,
  toggleStrike,
  duplicateElement,
  toggleLock,
  bringForward,
  sendBackward,
  deleteElement,
  cropMargin,
  cropLeft,
  cropRight,
  cropTop,
  cropBottom,
  isCropLinked,
  setIsCropLinked,
  handleCropMarginUniformChange,
  handleCropLeftChange,
  handleCropRightChange,
  handleCropTopChange,
  handleCropBottomChange,
  totalPages,
  currentPage,
  zoom,
  elementsCount,
  stampType,
  setStampType,
  toolColor,
  onClosePanel,

  handleFontChange = () => {},
  align = "left",
  updateAlignment = () => {},
  textColor = "#111111",
  handleTextColorChange = () => {},
  penColor = "#ef4444",
  setPenColor = () => {},
  penThickness = 3,
  setPenThickness = () => {},
  markerColor = "#FFE83B",
  setMarkerColor = () => {},
  markerOpacity = 0.4,
  setMarkerOpacity = () => {},
  shapeType = "rectangle",
  setShapeType = () => {},
  shapeColor = "#2563eb",
  setShapeColor = () => {},
  shapeFillColor = "transparent",
  setShapeFillColor = () => {},
  shapeThickness = 2,
  setShapeThickness = () => {}
}: PropertiesPanelProps) {
  const [showColorDropdown, setShowColorDropdown] = useState<string | null>(null);
  const [showSpacingCollapse, setShowSpacingCollapse] = useState(false);

  // Helper component for Color Swatch Pill Dropdown
  const ColorSwatchPill = ({ 
    color, 
    label, 
    onChange, 
    dropdownId 
  }: { 
    color: string; 
    label: string; 
    onChange: (c: string) => void; 
    dropdownId: string;
  }) => {
    const isTransparent = color === "transparent" || !color;
    return (
      <div style={{ position: "relative", flex: 1 }}>
        <button
          onClick={() => setShowColorDropdown(showColorDropdown === dropdownId ? null : dropdownId)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "32px",
            padding: "0 10px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            background: "#ffffff",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              border: "1px solid rgba(0,0,0,0.1)",
              background: isTransparent 
                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" 
                : color,
              backgroundSize: isTransparent ? "4px 4px" : "auto"
            }} />
            <span style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: "500" }}>
              {isTransparent ? "Transparent" : color.toUpperCase()}
            </span>
          </div>
          <ChevronDown size={11} style={{ color: "#94a3b8" }} />
        </button>

        {showColorDropdown === dropdownId && (
          <div style={{
            position: "absolute",
            top: "36px",
            right: 0,
            zIndex: 50,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "8px",
            width: "152px",
            display: "grid",
            gridTemplateColumns: "repeat(6, 20px)",
            gap: "4px"
          }}>
            {dropdownId.includes("fill") && (
              <button
                onClick={() => { onChange("transparent"); setShowColorDropdown(null); }}
                title="Transparent"
                style={{
                  gridColumn: "span 6",
                  fontSize: "0.68rem",
                  padding: "4px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  background: "#ffffff",
                  cursor: "pointer",
                  marginBottom: "4px"
                }}
              >
                Clear Fill
              </button>
            )}
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { onChange(c); setShowColorDropdown(null); }}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  background: c,
                  border: "1px solid rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  padding: 0
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Determine Active State ──
  const titleText = selectedEl 
    ? `${selectedEl.type.charAt(0).toUpperCase() + selectedEl.type.slice(1)} Properties`
    : (selectedTool === "Crop PDF" || activeTool === "crop") 
      ? "Crop Properties"
      : "Editor Properties";

  return (
    <aside style={{
      width: "240px",
      minWidth: "240px",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flexShrink: 0,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Title Bar */}
      <div style={{
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f1f5f9"
      }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1e293b" }}>
          {titleText}
        </span>
        {onClosePanel && (
          <button 
            onClick={onClosePanel}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Main Controls Panel */}
      <div className="editor-page-sidebar-scroll" style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        {selectedEl ? (
          <>
            {/* 1. CONTENT (Text only) */}
            {selectedEl.type === "text" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>Content</label>
                <textarea
                  value={selectedEl.content || ""}
                  onChange={e => updateElement(selectedEl.id, { content: e.target.value })}
                  style={{
                    width: "100%",
                    height: "64px",
                    padding: "8px 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    color: "#1e293b",
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none"
                  }}
                />
              </div>
            )}

            {/* 2. FONT PROPERTIES (Text only) */}
            {selectedEl.type === "text" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>Font</label>
                
                {/* Font Family Dropdown */}
                <select
                  value={selectedEl.fontFamily || textFont}
                  onChange={e => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                  style={{
                    width: "100%",
                    height: "32px",
                    padding: "0 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    color: "#1e293b",
                    background: "#ffffff",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                {/* Font Weight & Size */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <select
                    style={{
                      flex: 1,
                      height: "32px",
                      padding: "0 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.76rem",
                      color: "#1e293b",
                      background: "#ffffff",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="regular">Regular</option>
                    <option value="medium">Medium</option>
                    <option value="bold">Bold</option>
                  </select>

                  <select
                    value={selectedEl.fontSize || textSize}
                    onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                    style={{
                      width: "68px",
                      height: "32px",
                      padding: "0 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.76rem",
                      color: "#1e293b",
                      background: "#ffffff",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Formatting & Alignment Buttons */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {[
                    { icon: <Bold size={13} />, active: !!selectedEl.isBold, action: toggleBold, title: "Bold" },
                    { icon: <Italic size={13} />, active: !!selectedEl.isItalic, action: toggleItalic, title: "Italic" },
                    { icon: <Underline size={13} />, active: !!selectedEl.isUnderline, action: toggleUnderline, title: "Underline" },
                    { icon: <Strikethrough size={13} />, active: !!selectedEl.isStrike, action: toggleStrike, title: "Strike" }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={btn.action}
                      title={btn.title}
                      style={{
                        flex: 1,
                        height: "28px",
                        border: `1px solid ${btn.active ? "#2563eb" : "#cbd5e1"}`,
                        background: btn.active ? "#eff6ff" : "#ffffff",
                        color: btn.active ? "#2563eb" : "#475569",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "none"
                      }}
                    >
                      {btn.icon}
                    </button>
                  ))}

                  <div style={{ width: "1px", backgroundColor: "#e2e8f0", margin: "0 2px" }} />

                  {(["left", "center", "right", "justify"] as const).map(a => (
                    <button
                      key={a}
                      onClick={() => updateElement(selectedEl.id, { align: a })}
                      title={`Align ${a}`}
                      style={{
                        flex: 1,
                        height: "28px",
                        border: `1px solid ${(selectedEl.align || "left") === a ? "#2563eb" : "#cbd5e1"}`,
                        background: (selectedEl.align || "left") === a ? "#eff6ff" : "#ffffff",
                        color: (selectedEl.align || "left") === a ? "#2563eb" : "#475569",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "none"
                      }}
                    >
                      {a === "left" ? <AlignLeft size={12} /> : a === "center" ? <AlignCenter size={12} /> : a === "right" ? <AlignRight size={12} /> : <AlignJustify size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. COLOR SELECTION */}
            {(selectedEl.type === "text" || selectedEl.type === "shape" || selectedEl.type === "highlight") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>Color</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <ColorSwatchPill 
                    color={selectedEl.color || "#111111"} 
                    label="Foreground" 
                    onChange={(c) => updateElement(selectedEl.id, { color: c })} 
                    dropdownId="fg"
                  />
                  {selectedEl.type === "text" && (
                    <ColorSwatchPill 
                      color={selectedEl.bgColor || "transparent"} 
                      label="Background" 
                      onChange={(c) => updateElement(selectedEl.id, { bgColor: c })} 
                      dropdownId="bg"
                    />
                  )}
                </div>
              </div>
            )}

            {/* 4. OPACITY */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>Opacity</label>
                <span style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: "600" }}>
                  {Math.round((selectedEl.opacity !== undefined ? selectedEl.opacity : 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={selectedEl.opacity !== undefined ? selectedEl.opacity : 1.0}
                onChange={e => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })}
                style={{ width: "100%", cursor: "pointer", height: "4px" }}
              />
            </div>

            {/* 5. TEXT BOX/CONTAINER PROPERTIES (Only for Text and Shapes) */}
            {(selectedEl.type === "text" || selectedEl.type === "shape") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {selectedEl.type === "text" ? "Text Box" : "Shape Frame"}
                </label>

                {/* Fill & Border swatches */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Fill</span>
                    <ColorSwatchPill 
                      color={selectedEl.bgColor || "transparent"} 
                      label="Fill" 
                      onChange={(c) => updateElement(selectedEl.id, { bgColor: c })} 
                      dropdownId="shape_fill"
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Border</span>
                    <ColorSwatchPill 
                      color={selectedEl.color || "#0057C0"} 
                      label="Border" 
                      onChange={(c) => updateElement(selectedEl.id, { color: c })} 
                      dropdownId="shape_border"
                    />
                  </div>
                </div>

                {/* Border Thickness slider */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Border Thickness</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>{selectedEl.thickness || 1.5} pt</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={selectedEl.thickness !== undefined ? selectedEl.thickness : 1.5}
                    onChange={e => updateElement(selectedEl.id, { thickness: parseFloat(e.target.value) })}
                    style={{ width: "100%", cursor: "pointer", height: "4px" }}
                  />
                </div>

                {/* Corner Radius slider */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Corner Radius</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>{selectedEl.bgColor ? (selectedEl.thickness || 4) : 4} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={selectedEl.thickness !== undefined ? Math.round(selectedEl.thickness * 2.5) : 4}
                    onChange={e => updateElement(selectedEl.id, { thickness: parseInt(e.target.value) / 2.5 })}
                    style={{ width: "100%", cursor: "pointer", height: "4px" }}
                  />
                </div>
              </div>
            )}

            {/* 6. SPACING ACCORDION COLLAPSE */}
            {selectedEl.type === "text" && (
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                <button
                  onClick={() => setShowSpacingCollapse(!showSpacingCollapse)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "4px 0",
                    cursor: "pointer",
                    fontSize: "0.68rem",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  Spacing
                  {showSpacingCollapse ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showSpacingCollapse && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Letter Spacing</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>0px</span>
                      </div>
                      <input type="range" min="-2" max="10" defaultValue="0" style={{ width: "100%", height: "4px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Line Height</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>1.2</span>
                      </div>
                      <input type="range" min="0.8" max="2.5" step="0.1" defaultValue="1.2" style={{ width: "100%", height: "4px" }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions (Z-index operations) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "4px" }}>
              <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>Arrange & Actions</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <button onClick={() => duplicateElement(selectedEl.id)} style={propBtnStyle}>
                  Duplicate
                </button>
                <button onClick={() => toggleLock(selectedEl.id)} style={{ ...propBtnStyle, background: selectedEl.locked ? "#fef3c7" : "#ffffff" }}>
                  {selectedEl.locked ? "Unlock" : "Lock"}
                </button>
                <button onClick={() => bringForward(selectedEl.id)} style={propBtnStyle}>
                  Bring Front
                </button>
                <button onClick={() => sendBackward(selectedEl.id)} style={propBtnStyle}>
                  Send Back
                </button>
              </div>
              <button 
                onClick={() => deleteElement(selectedEl.id)} 
                style={{
                  width: "100%",
                  height: "32px",
                  borderRadius: "6px",
                  border: "1px solid #fee2e2",
                  background: "#fef2f2",
                  color: "#ef4444",
                  fontSize: "0.72rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  marginTop: "4px"
                }}
              >
                <Trash2 size={12} /> Remove Element
              </button>
            </div>
          </>
        ) : (selectedTool === "Crop PDF" || activeTool === "crop") ? (
          // CROP PROPERTIES VIEW
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Crop size={14} style={{ color: "#2563eb" }} />
              <span style={{ fontSize: "0.76rem", fontWeight: "600", color: "#1e293b" }}>Crop Boundaries</span>
            </div>
            
            <button
              onClick={() => setIsCropLinked(!isCropLinked)}
              style={{
                width: "100%",
                height: "32px",
                borderRadius: "6px",
                border: `1px solid ${isCropLinked ? "#2563eb" : "#cbd5e1"}`,
                background: isCropLinked ? "#eff6ff" : "#ffffff",
                color: isCropLinked ? "#2563eb" : "#475569",
                fontSize: "0.72rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                outline: "none"
              }}
            >
              {isCropLinked ? <Lock size={12} /> : <Unlock size={12} />}
              {isCropLinked ? "Link Margins (Uniform)" : "Unlink Margins (Custom)"}
            </button>

            {isCropLinked ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Uniform Margin</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: "600", color: "#1e293b" }}>{cropMargin}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={cropMargin}
                  onChange={e => handleCropMarginUniformChange(parseInt(e.target.value))}
                  style={{ width: "100%", cursor: "pointer", height: "4px" }}
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Top Margin", val: cropTop, change: handleCropTopChange },
                  { label: "Bottom Margin", val: cropBottom, change: handleCropBottomChange },
                  { label: "Left Margin", val: cropLeft, change: handleCropLeftChange },
                  { label: "Right Margin", val: cropRight, change: handleCropRightChange }
                ].map((margin, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{margin.label}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: "600", color: "#1e293b" }}>{margin.val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="0.5"
                      value={margin.val}
                      onChange={e => margin.change(parseFloat(e.target.value))}
                      style={{ width: "100%", cursor: "pointer", height: "4px" }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px" }}>
              <span style={{ fontSize: "0.62rem", color: "#94a3b8", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Quick Presets</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {[
                  { label: "None (0%)", val: 0 },
                  { label: "Narrow (5%)", val: 5 },
                  { label: "Normal (10%)", val: 10 },
                  { label: "Wide (15%)", val: 15 }
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      if (isCropLinked) handleCropMarginUniformChange(p.val);
                      else {
                        handleCropLeftChange(p.val / 2);
                        handleCropRightChange(p.val / 2);
                        handleCropTopChange(p.val / 2);
                        handleCropBottomChange(p.val / 2);
                      }
                    }}
                    style={{
                      padding: "4px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontSize: "0.65rem",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // DEFAULT VIEW OPTIONS BASED ON ACTIVE TOOL
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeTool !== "select" && activeTool !== "pan" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Tool Defaults: {activeTool}
                </span>
                
                {/* Text Defaults */}
                {activeTool === "text" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Font Style</span>
                    <select
                      value={textFont}
                      onChange={e => handleFontChange(e.target.value)}
                      style={{
                        width: "100%",
                        height: "32px",
                        padding: "0 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        color: "#1e293b",
                        background: "#ffffff",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <select
                        value={textSize}
                        onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                        style={{
                          flex: 1,
                          height: "32px",
                          padding: "0 8px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "0.76rem",
                          color: "#1e293b",
                          background: "#ffffff",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <ColorSwatchPill 
                        color={textColor} 
                        label="Text Color" 
                        onChange={handleTextColorChange} 
                        dropdownId="default_text_color"
                      />
                    </div>
                  </div>
                )}

                {/* Pen Defaults */}
                {activeTool === "pen" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Pen Color</span>
                      <ColorSwatchPill 
                        color={penColor} 
                        label="Pen Color" 
                        onChange={setPenColor} 
                        dropdownId="default_pen_color"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Line Thickness</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>{penThickness}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={penThickness}
                        onChange={e => setPenThickness && setPenThickness(parseInt(e.target.value))}
                        style={{ width: "100%", cursor: "pointer", height: "4px" }}
                      />
                    </div>
                  </div>
                )}

                {/* Highlighter Defaults */}
                {activeTool === "highlight" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Highlight Color</span>
                      <ColorSwatchPill 
                        color={markerColor} 
                        label="Marker Color" 
                        onChange={setMarkerColor} 
                        dropdownId="default_marker_color"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Opacity</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#475569" }}>{Math.round(markerOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={markerOpacity}
                        onChange={e => setMarkerOpacity && setMarkerOpacity(parseFloat(e.target.value))}
                        style={{ width: "100%", cursor: "pointer", height: "4px" }}
                      />
                    </div>
                  </div>
                )}

                {/* Shape Defaults */}
                {activeTool === "shape" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Shape Type</span>
                      <select
                        value={shapeType}
                        onChange={e => setShapeType && setShapeType(e.target.value as any)}
                        style={{
                          width: "100%",
                          height: "32px",
                          padding: "0 8px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "0.76rem",
                          color: "#1e293b",
                          background: "#ffffff",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="line">Line</option>
                        <option value="arrow">Arrow</option>
                        <option value="diamond">Diamond</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Fill</span>
                        <ColorSwatchPill 
                          color={shapeFillColor} 
                          label="Fill" 
                          onChange={setShapeFillColor} 
                          dropdownId="default_shape_fill"
                        />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b" }}>Border</span>
                        <ColorSwatchPill 
                          color={shapeColor} 
                          label="Border" 
                          onChange={setShapeColor} 
                          dropdownId="default_shape_border"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "24px 16px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px dashed #cbd5e1"
              }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4, display: "block" }}>
                  Select an overlay element or choose a tool from the left floating toolbar to edit.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Document Info Footer */}
        <div style={{
          marginTop: "auto",
          paddingTop: "14px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Document Info</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
              <span style={{ color: "#64748b" }}>Total Pages:</span>
              <span style={{ fontWeight: "600", color: "#1e293b" }}>{totalPages}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
              <span style={{ color: "#64748b" }}>Current Page:</span>
              <span style={{ fontWeight: "600", color: "#1e293b" }}>{currentPage}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
              <span style={{ color: "#64748b" }}>Total Elements:</span>
              <span style={{ fontWeight: "600", color: "#1e293b" }}>{elementsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const propBtnStyle: React.CSSProperties = {
  height: "28px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#475569",
  fontSize: "0.7rem",
  fontWeight: "500",
  borderRadius: "6px",
  cursor: "pointer",
  outline: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
