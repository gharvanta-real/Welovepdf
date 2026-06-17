import React from "react";
import {
  MousePointer, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Copy, Lock, Unlock, Plus, Minus, Trash2, Crop
} from "lucide-react";
import {
  PropLabel, InfoRow, FormatBtn, propActionBtn
} from "./shared-components";
import {
  OverlayElement, ActiveTool, FONTS, FONT_SIZES, STAMP_TYPES
} from "./types";

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
  toolColor
}: PropertiesPanelProps) {
  return (
    <aside style={{ width: "220px", minWidth: "220px", backgroundColor: "var(--c-surface)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: "0.76rem", fontWeight: "500", color: "var(--c-text)" }}>Properties</span>
      </div>

      {selectedEl ? (
        <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Element info */}
          <div style={{ padding: "8px 10px", backgroundColor: "var(--c-bg)", borderRadius: "6px", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Element</div>
            <div style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--c-text)", textTransform: "capitalize" }}>{selectedEl.type}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>x:{Math.round(selectedEl.x)}% y:{Math.round(selectedEl.y)}%</div>
          </div>

          {/* Text properties */}
          {selectedEl.type === "text" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <PropLabel>Font</PropLabel>
              <select value={selectedEl.fontFamily || textFont} onChange={e => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                style={{ width: "100%", padding: "5px 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", cursor: "pointer" }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <PropLabel>Size</PropLabel>
                <select value={selectedEl.fontSize || textSize} onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                  style={{ flex: 1, padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", cursor: "pointer" }}>
                  {FONT_SIZES.map(s => <option key={s} value={s}>{s}pt</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <FormatBtn active={!!selectedEl.isBold} onClick={toggleBold} title="Bold"><Bold size={12} /></FormatBtn>
                <FormatBtn active={!!selectedEl.isItalic} onClick={toggleItalic} title="Italic"><Italic size={12} /></FormatBtn>
                <FormatBtn active={!!selectedEl.isUnderline} onClick={toggleUnderline} title="Underline"><Underline size={12} /></FormatBtn>
                <FormatBtn active={!!selectedEl.isStrike} onClick={toggleStrike} title="Strike"><Strikethrough size={12} /></FormatBtn>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Color</PropLabel>
                <input type="color" value={selectedEl.color || "var(--c-text)"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                  style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {(["left", "center", "right", "justify"] as const).map(a => (
                  <FormatBtn key={a} active={(selectedEl.align || "left") === a} onClick={() => updateElement(selectedEl.id, { align: a })} title={a}>
                    {a === "left" ? <AlignLeft size={11} /> : a === "center" ? <AlignCenter size={11} /> : a === "right" ? <AlignRight size={11} /> : <AlignJustify size={11} />}
                  </FormatBtn>
                ))}
              </div>
            </div>
          )}

          {/* Shape properties */}
          {selectedEl.type === "shape" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Border</PropLabel>
                <input type="color" value={selectedEl.color || "#3b82f6"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                  style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Fill</PropLabel>
                <input type="color" value={selectedEl.bgColor === "transparent" ? "#ffffff" : (selectedEl.bgColor || "#ffffff")} onChange={e => updateElement(selectedEl.id, { bgColor: e.target.value })}
                  style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Width</PropLabel>
                <input type="range" min="1" max="10" value={selectedEl.thickness || 2} onChange={e => updateElement(selectedEl.id, { thickness: parseInt(e.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", minWidth: "22px" }}>{selectedEl.thickness || 2}px</span>
              </div>
            </div>
          )}

          {/* Highlight properties */}
          {selectedEl.type === "highlight" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Color</PropLabel>
                <input type="color" value={selectedEl.color || "#fef08a"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                  style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PropLabel>Opacity</PropLabel>
                <input type="range" min="0.1" max="0.9" step="0.05" value={selectedEl.opacity || 0.4} onChange={e => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{Math.round((selectedEl.opacity || 0.4) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Position & size */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <PropLabel>Position & Size</PropLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { label: "X", key: "x" as const, val: selectedEl.x },
                { label: "Y", key: "y" as const, val: selectedEl.y },
                { label: "W", key: "width" as const, val: selectedEl.width || 20 },
                { label: "H", key: "height" as const, val: selectedEl.height || 10 },
              ].map(({ label, key, val }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500" }}>{label}</span>
                  <input
                    type="number"
                    value={Math.round(val * 10) / 10}
                    onChange={e => updateElement(selectedEl.id, { [key]: parseFloat(e.target.value) })}
                    min="0" max="100" step="0.5"
                    style={{ width: "100%", padding: "3px 8px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <PropLabel>Actions</PropLabel>
            <button onClick={() => duplicateElement(selectedEl.id)} style={propActionBtn}>
              <Copy size={11} /> Duplicate
            </button>
            <button onClick={() => toggleLock(selectedEl.id)} style={{ ...propActionBtn, borderColor: selectedEl.locked ? "#f59e0b" : "var(--border)", color: selectedEl.locked ? "#f59e0b" : "var(--c-text)", backgroundColor: selectedEl.locked ? "rgba(245,158,11,0.1)" : "var(--c-surface)" }}>
              <Lock size={11} /> {selectedEl.locked ? "Unlock" : "Lock"}
            </button>
            <button onClick={() => bringForward(selectedEl.id)} style={propActionBtn}>
              <Plus size={11} /> Bring Forward
            </button>
            <button onClick={() => sendBackward(selectedEl.id)} style={propActionBtn}>
              <Minus size={11} /> Send Backward
            </button>
            <button onClick={() => deleteElement(selectedEl.id)} style={{ ...propActionBtn, borderColor: "#fecaca", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}>
              <Trash2 size={11} /> Delete Element
            </button>
          </div>
        </div>
      ) : (selectedTool === "Crop PDF" || activeTool === "crop") ? (
        <div style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "16px", backgroundColor: "var(--c-bg)", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Crop size={16} style={{ color: toolColor }} />
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--c-text)" }}>Crop Boundaries</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
              Adjust margins using sliders, coordinates, or by dragging handles directly on the document canvas.
            </p>

            <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={() => setIsCropLinked(!isCropLinked)}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  border: `1px solid ${isCropLinked ? toolColor : "var(--border)"}`,
                  background: isCropLinked ? `${toolColor}15` : "var(--c-bg)",
                  color: isCropLinked ? toolColor : "var(--c-text)",
                  fontSize: "0.72rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                  outline: "none"
                }}
              >
                {isCropLinked ? <Lock size={12} /> : <Unlock size={12} />}
                {isCropLinked ? "Link Margins (Uniform)" : "Unlink Margins (Custom)"}
              </button>

              {isCropLinked ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Margin Percentage</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropMargin}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={cropMargin} 
                    onChange={e => handleCropMarginUniformChange(parseInt(e.target.value))} 
                    style={{ width: "100%", cursor: "pointer" }} 
                  />
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Custom (%):</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="45" 
                      value={cropMargin} 
                      onChange={e => handleCropMarginUniformChange(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 45))} 
                      style={{ width: "60px", padding: "3px 8px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none" }} 
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Left Margin */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Left Margin</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropLeft}%</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropLeft} 
                        onChange={e => handleCropLeftChange(parseFloat(e.target.value))} 
                        style={{ flex: 1, cursor: "pointer" }} 
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropLeft} 
                        onChange={e => handleCropLeftChange(parseFloat(e.target.value) || 0)} 
                        style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                      />
                    </div>
                  </div>

                  {/* Right Margin */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Right Margin</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropRight}%</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropRight} 
                        onChange={e => handleCropRightChange(parseFloat(e.target.value))} 
                        style={{ flex: 1, cursor: "pointer" }} 
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropRight} 
                        onChange={e => handleCropRightChange(parseFloat(e.target.value) || 0)} 
                        style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                      />
                    </div>
                  </div>

                  {/* Top Margin */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Top Margin</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropTop}%</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropTop} 
                        onChange={e => handleCropTopChange(parseFloat(e.target.value))} 
                        style={{ flex: 1, cursor: "pointer" }} 
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropTop} 
                        onChange={e => handleCropTopChange(parseFloat(e.target.value) || 0)} 
                        style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                      />
                    </div>
                  </div>

                  {/* Bottom Margin */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Bottom Margin</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropBottom}%</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropBottom} 
                        onChange={e => handleCropBottomChange(parseFloat(e.target.value))} 
                        style={{ flex: 1, cursor: "pointer" }} 
                      />
                      <input 
                        type="number" 
                        min="0" 
                        max="45" 
                        step="0.5"
                        value={cropBottom} 
                        onChange={e => handleCropBottomChange(parseFloat(e.target.value) || 0)} 
                        style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "4px 0" }} />

              {/* Presets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500" }}>Quick Presets</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { label: "None (0%)", val: 0 },
                    { label: "Narrow (5%)", val: 5 },
                    { label: "Normal (10%)", val: 10 },
                    { label: "Wide (15%)", val: 15 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        if (isCropLinked) {
                          handleCropMarginUniformChange(preset.val);
                        } else {
                          handleCropLeftChange(preset.val / 2);
                          handleCropRightChange(preset.val / 2);
                          handleCropTopChange(preset.val / 2);
                          handleCropBottomChange(preset.val / 2);
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "9999px",
                        border: "1px solid var(--border)",
                        background: "var(--c-bg)",
                        color: "var(--c-text)",
                        fontSize: "0.65rem",
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                        outline: "none"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = toolColor; e.currentTarget.style.backgroundColor = `${toolColor}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.backgroundColor = "var(--c-bg)"; }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <PropLabel>Document Info</PropLabel>
            <InfoRow label="Pages" value={String(totalPages)} />
            <InfoRow label="Current Page" value={String(currentPage)} />
            <InfoRow label="Zoom" value={`${zoom}%`} />
            <InfoRow label="Active Tool" value={activeTool} />
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ textAlign: "center", padding: "24px 16px", backgroundColor: "var(--c-bg)", borderRadius: "8px", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <MousePointer size={24} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>Select an element to view and edit its properties</p>
          </div>

          {/* Quick info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
            <PropLabel>Document Info</PropLabel>
            <InfoRow label="Pages" value={String(totalPages)} />
            <InfoRow label="Elements" value={String(elementsCount)} />
            <InfoRow label="Current Page" value={String(currentPage)} />
            <InfoRow label="Zoom" value={`${zoom}%`} />
            <InfoRow label="Active Tool" value={activeTool} />
          </div>

          {/* Stamp selector (for insert/stamp tool) */}
          {activeTool === "stamp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              <PropLabel>Stamp Type</PropLabel>
              {STAMP_TYPES.map(s => (
                <button key={s} onClick={() => setStampType(s)}
                  style={{
                    padding: "5px 14px", borderRadius: "9999px", border: `1px solid ${stampType === s ? toolColor : "var(--border)"}`,
                    background: stampType === s ? `${toolColor}15` : "var(--c-bg)",
                    color: stampType === s ? toolColor : "var(--c-text)",
                    fontWeight: stampType === s ? "600" : "500",
                    fontSize: "0.72rem", cursor: "pointer", textAlign: "left"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
