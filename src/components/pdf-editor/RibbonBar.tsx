import React from "react";
import {
  Undo2, Redo2, Copy, Trash2, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, MousePointer, Hand, Search,
  Type, Hash, FileImage, Square, Circle, Minus, ArrowRight, MessageSquare,
  Link, Stamp, Droplets, CheckCircle, PenTool, Highlighter, Eraser,
  LayoutTemplate, RotateCw, FileMinus, ZoomOut, ZoomIn, Maximize2
} from "lucide-react";
import {
  RibbonGroup, RibbonDivider, RibbonBtn, FormatBtn, ColorSwatch, ColorPicker
} from "./shared-components";
import {
  ActiveTool, RibbonTab, OverlayElement, FONTS, FONT_SIZES, PRESET_COLORS
} from "./types";

interface RibbonBarProps {
  activeTab: RibbonTab;
  setActiveTab: (tab: RibbonTab) => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  undoHistory: any[];
  redoHistory: any[];
  handleUndo: () => void;
  handleRedo: () => void;
  selectedElementId: string | null;
  duplicateElement: (id: string) => void;
  deleteElement: (id: string) => void;
  textFont: string;
  setTextFont: (font: string) => void;
  handleFontChange: (font: string) => void;
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
  textColor: string;
  showTextColorPicker: boolean;
  setShowTextColorPicker: (show: boolean) => void;
  handleTextColorChange: (color: string) => void;
  align: "left" | "center" | "right" | "justify";
  updateAlignment: (a: "left" | "center" | "right" | "justify") => void;
  toolColor: string;
  currentPage: number;
  elements: OverlayElement[];
  saveHistory: (newElements: OverlayElement[]) => void;
  setSelectedElementId: (id: string | null) => void;
  shapeType: "rectangle" | "circle" | "line" | "arrow" | "diamond";
  setShapeType: (t: "rectangle" | "circle" | "line" | "arrow" | "diamond") => void;
  setShowWatermarkModal: (show: boolean) => void;
  setShowSigModal: (show: boolean) => void;
  penColor: string;
  setPenColor: (c: string) => void;
  showPenColorPicker: boolean;
  setShowPenColorPicker: (show: boolean) => void;
  penThickness: number;
  setPenThickness: (t: number) => void;
  markerColor: string;
  setMarkerColor: (c: string) => void;
  showMarkerColorPicker: boolean;
  setShowMarkerColorPicker: (show: boolean) => void;
  markerOpacity: number;
  setMarkerOpacity: (o: number) => void;
  redactText: string;
  setRedactText: (t: string) => void;
  redactColor: string;
  setRedactColor: (c: string) => void;
  shapeColor: string;
  setShapeColor: (c: string) => void;
  showShapeColorPicker: boolean;
  setShowShapeColorPicker: (show: boolean) => void;
  shapeThickness: number;
  setShapeThickness: (t: number) => void;
  pageSize: string;
  setPageSize: (s: string) => void;
  pageOrientation: string;
  setPageOrientation: (o: string) => void;
  pageMargins: string;
  setPageMargins: (m: string) => void;
  rotatePage: (pageNum: number) => void;
  removePage: (pageNum: number) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  showRuler: boolean;
  setShowRuler: React.Dispatch<React.SetStateAction<boolean>>;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showRightPanel: boolean;
  setShowRightPanel: React.Dispatch<React.SetStateAction<boolean>>;
  pageOrder: number[];
}

export function RibbonBar({
  activeTab,
  setActiveTab,
  activeTool,
  setActiveTool,
  undoHistory,
  redoHistory,
  handleUndo,
  handleRedo,
  selectedElementId,
  duplicateElement,
  deleteElement,
  textFont,
  setTextFont,
  handleFontChange,
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
  textColor,
  showTextColorPicker,
  setShowTextColorPicker,
  handleTextColorChange,
  align,
  updateAlignment,
  toolColor,
  currentPage,
  elements,
  saveHistory,
  setSelectedElementId,
  shapeType,
  setShapeType,
  setShowWatermarkModal,
  setShowSigModal,
  penColor,
  setPenColor,
  showPenColorPicker,
  setShowPenColorPicker,
  penThickness,
  setPenThickness,
  markerColor,
  setMarkerColor,
  showMarkerColorPicker,
  setShowMarkerColorPicker,
  markerOpacity,
  setMarkerOpacity,
  redactText,
  setRedactText,
  redactColor,
  setRedactColor,
  shapeColor,
  setShapeColor,
  showShapeColorPicker,
  setShowShapeColorPicker,
  shapeThickness,
  setShapeThickness,
  pageSize,
  setPageSize,
  pageOrientation,
  setPageOrientation,
  pageMargins,
  setPageMargins,
  rotatePage,
  removePage,
  zoom,
  setZoom,
  showRuler,
  setShowRuler,
  showGrid,
  setShowGrid,
  showRightPanel,
  setShowRightPanel,
  pageOrder
}: RibbonBarProps) {
  return (
    <div style={{ backgroundColor: "var(--c-surface)", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Tab names */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 8px" }}>
        {(["home", "insert", "draw", "layout", "view"] as RibbonTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: activeTab === tab ? `2px solid ${toolColor}` : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab ? toolColor : "var(--text-muted)",
              fontWeight: activeTab === tab ? "600" : "500",
              fontSize: "0.78rem",
              cursor: "pointer",
              textTransform: "capitalize",
              letterSpacing: "0.02em",
              transition: "all 0.15s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab contents */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "4px 12px", minHeight: "58px", overflowX: "auto" }}>
        {/* ── HOME Tab ── */}
        {activeTab === "home" && (
          <>
            {/* Clipboard group */}
            <RibbonGroup label="Clipboard">
              <RibbonBtn icon={<Undo2 size={16} />} label="Undo" onClick={handleUndo} disabled={undoHistory.length === 0} color={toolColor} />
              <RibbonBtn icon={<Redo2 size={16} />} label="Redo" onClick={handleRedo} disabled={redoHistory.length === 0} color={toolColor} />
              <RibbonBtn icon={<Copy size={16} />} label="Copy" onClick={() => selectedElementId && duplicateElement(selectedElementId)} color={toolColor} />
              <RibbonBtn icon={<Trash2 size={16} />} label="Delete" onClick={() => selectedElementId && deleteElement(selectedElementId)} disabled={!selectedElementId} color="#ef4444" />
            </RibbonGroup>
            <RibbonDivider />
            {/* Font group */}
            <RibbonGroup label="Font">
              <select
                value={textFont}
                onChange={e => handleFontChange(e.target.value)}
                style={{ height: "28px", padding: "0 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", minWidth: "130px", outline: "none", cursor: "pointer" }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select
                value={textSize}
                onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                style={{ height: "28px", padding: "0 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", width: "58px", outline: "none", cursor: "pointer" }}
              >
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ display: "flex", gap: "2px" }}>
                <FormatBtn active={isBold} onClick={toggleBold} title="Bold (Ctrl+B)"><Bold size={13} /></FormatBtn>
                <FormatBtn active={isItalic} onClick={toggleItalic} title="Italic (Ctrl+I)"><Italic size={13} /></FormatBtn>
                <FormatBtn active={isUnderline} onClick={toggleUnderline} title="Underline (Ctrl+U)"><Underline size={13} /></FormatBtn>
                <FormatBtn active={isStrike} onClick={toggleStrike} title="Strikethrough"><Strikethrough size={13} /></FormatBtn>
              </div>
              <div style={{ position: "relative" }}>
                <ColorSwatch label="A" color={textColor} onClick={() => { setShowTextColorPicker(!showTextColorPicker); setShowPenColorPicker(false); setShowMarkerColorPicker(false); setShowShapeColorPicker(false); }} />
                {showTextColorPicker && (
                  <ColorPicker colors={PRESET_COLORS} selected={textColor} onSelect={c => { handleTextColorChange(c); setShowTextColorPicker(false); }} onClose={() => setShowTextColorPicker(false)} />
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />
            {/* Paragraph group */}
            <RibbonGroup label="Paragraph">
              <div style={{ display: "flex", gap: "2px" }}>
                <FormatBtn active={align === "left"} onClick={() => updateAlignment("left")} title="Align Left"><AlignLeft size={13} /></FormatBtn>
                <FormatBtn active={align === "center"} onClick={() => updateAlignment("center")} title="Center"><AlignCenter size={13} /></FormatBtn>
                <FormatBtn active={align === "right"} onClick={() => updateAlignment("right")} title="Align Right"><AlignRight size={13} /></FormatBtn>
                <FormatBtn active={align === "justify"} onClick={() => updateAlignment("justify")} title="Justify"><AlignJustify size={13} /></FormatBtn>
              </div>
            </RibbonGroup>
            <RibbonDivider />
            {/* Selection tool */}
            <RibbonGroup label="Tools">
              <RibbonBtn icon={<MousePointer size={16} />} label="Select" active={activeTool === "select"} onClick={() => setActiveTool("select")} color={toolColor} />
              <RibbonBtn icon={<Hand size={16} />} label="Pan" active={activeTool === "pan"} onClick={() => setActiveTool("pan")} color={toolColor} />
              <RibbonBtn icon={<Search size={16} />} label="Find" onClick={() => alert("Find & Replace coming soon")} color={toolColor} />
            </RibbonGroup>
          </>
        )}

        {/* ── INSERT Tab ── */}
        {activeTab === "insert" && (
          <>
            <RibbonGroup label="Add Text">
              <RibbonBtn icon={<Type size={16} />} label="Text Box" active={activeTool === "text"} onClick={() => setActiveTool("text")} color={toolColor} />
              <RibbonBtn icon={<Hash size={16} />} label="Page No." onClick={() => {
                const el: OverlayElement = { id: "text-pn-" + Date.now(), type: "text", page: currentPage, x: 45, y: 94, content: `Page ${currentPage}`, color: "#64748b", fontSize: 10, fontFamily: "Helvetica", align: "center" };
                saveHistory([...elements, el]);
                setSelectedElementId(el.id);
              }} color={toolColor} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Media">
              <RibbonBtn
                icon={<FileImage size={16} />} label="Image"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file"; input.accept = "image/*";
                  input.onchange = (e) => {
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const newImg: OverlayElement = {
                          id: "img-" + Date.now(), type: "image", page: currentPage,
                          x: 30, y: 30, width: 30, height: 25, dataUrl: reader.result as string
                        };
                        saveHistory([...elements, newImg]);
                        setSelectedElementId(newImg.id);
                        setActiveTool("select");
                      };
                      reader.readAsDataURL(f);
                    }
                  };
                  input.click();
                }}
                color={toolColor}
              />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Shapes">
              {(["rectangle", "circle", "line", "arrow", "diamond"] as const).map(st => (
                <RibbonBtn
                  key={st}
                  icon={st === "rectangle" ? <Square size={14} /> : st === "circle" ? <Circle size={14} /> : st === "line" ? <Minus size={14} /> : st === "arrow" ? <ArrowRight size={14} /> : <div style={{ width: 14, height: 14, border: "1.5px solid currentColor", transform: "rotate(45deg)" }} />}
                  label={st.charAt(0).toUpperCase() + st.slice(1)}
                  active={activeTool === "shape" && shapeType === st}
                  onClick={() => { setShapeType(st); setActiveTool("shape"); }}
                  color={toolColor}
                />
              ))}
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Annotations">
              <RibbonBtn icon={<MessageSquare size={16} />} label="Comment" active={activeTool === "comment"} onClick={() => setActiveTool("comment")} color={toolColor} />
              <RibbonBtn icon={<Link size={16} />} label="Hyperlink" active={activeTool === "link"} onClick={() => setActiveTool("link")} color={toolColor} />
              <RibbonBtn icon={<Stamp size={16} />} label="Stamp" active={activeTool === "stamp"} onClick={() => setActiveTool("stamp")} color={toolColor} />
              <RibbonBtn icon={<Droplets size={16} />} label="Watermark" onClick={() => setShowWatermarkModal(true)} color={toolColor} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Sign">
              <RibbonBtn icon={<CheckCircle size={16} />} label="Signature" onClick={() => setShowSigModal(true)} color={toolColor} />
            </RibbonGroup>
          </>
        )}

        {/* ── DRAW Tab ── */}
        {activeTab === "draw" && (
          <>
            <RibbonGroup label="Drawing Tools">
              <RibbonBtn icon={<PenTool size={16} />} label="Pen" active={activeTool === "pen"} onClick={() => setActiveTool("pen")} color={toolColor} />
              <RibbonBtn icon={<Highlighter size={16} />} label="Highlight" active={activeTool === "highlight"} onClick={() => setActiveTool("highlight")} color={toolColor} />
              <RibbonBtn icon={<Eraser size={16} />} label="Redact" active={activeTool === "redact"} onClick={() => setActiveTool("redact")} color={toolColor} />
            </RibbonGroup>
            <RibbonDivider />
            {activeTool === "pen" && (
              <RibbonGroup label="Pen Options">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Color</span>
                    <div style={{ position: "relative" }}>
                      <ColorSwatch label="" color={penColor} onClick={() => { setShowPenColorPicker(!showPenColorPicker); setShowTextColorPicker(false); }} />
                      {showPenColorPicker && (
                        <ColorPicker colors={PRESET_COLORS} selected={penColor} onSelect={c => { setPenColor(c); setShowPenColorPicker(false); }} onClose={() => setShowPenColorPicker(false)} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Size {penThickness}px</span>
                    <input type="range" min="1" max="12" value={penThickness} onChange={e => setPenThickness(parseInt(e.target.value))} style={{ width: "80px" }} />
                  </div>
                </div>
              </RibbonGroup>
            )}
            {activeTool === "highlight" && (
              <RibbonGroup label="Highlight Options">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Color</span>
                    <div style={{ position: "relative" }}>
                      <ColorSwatch label="" color={markerColor} onClick={() => { setShowMarkerColorPicker(!showMarkerColorPicker); setShowTextColorPicker(false); }} />
                      {showMarkerColorPicker && (
                        <ColorPicker colors={["#fef08a", "#bbf7d0", "#a5f3fc", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"]} selected={markerColor} onSelect={c => { setMarkerColor(c); setShowMarkerColorPicker(false); }} onClose={() => setShowMarkerColorPicker(false)} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Opacity {Math.round(markerOpacity * 100)}%</span>
                    <input type="range" min="0.1" max="0.8" step="0.05" value={markerOpacity} onChange={e => setMarkerOpacity(parseFloat(e.target.value))} style={{ width: "80px" }} />
                  </div>
                </div>
              </RibbonGroup>
            )}
            {activeTool === "redact" && (
              <RibbonGroup label="Redact Options">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <span>Label</span>
                    <input value={redactText} onChange={e => setRedactText(e.target.value)} style={{ width: "90px", padding: "2px 6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <span>Color</span>
                    <input type="color" value={redactColor} onChange={e => setRedactColor(e.target.value)} style={{ width: "24px", height: "18px", padding: 0, border: "none", cursor: "pointer", borderRadius: "3px", backgroundColor: "transparent" }} />
                  </div>
                </div>
              </RibbonGroup>
            )}
            {activeTool === "shape" && (
              <RibbonGroup label="Shape Options">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Border</span>
                    <div style={{ position: "relative" }}>
                      <ColorSwatch label="" color={shapeColor} onClick={() => { setShowShapeColorPicker(!showShapeColorPicker); setShowTextColorPicker(false); }} />
                      {showShapeColorPicker && (
                        <ColorPicker colors={PRESET_COLORS} selected={shapeColor} onSelect={c => { setShapeColor(c); setShowShapeColorPicker(false); }} onClose={() => setShowShapeColorPicker(false)} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                    <span>Width {shapeThickness}px</span>
                    <input type="range" min="1" max="8" value={shapeThickness} onChange={e => setShapeThickness(parseInt(e.target.value))} style={{ width: "70px" }} />
                  </div>
                </div>
              </RibbonGroup>
            )}
          </>
        )}

        {/* ── LAYOUT Tab ── */}
        {activeTab === "layout" && (
          <>
            <RibbonGroup label="Page Size">
              <select value={pageSize} onChange={e => setPageSize(e.target.value)}
                style={{ height: "28px", padding: "0 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", minWidth: "130px", outline: "none", cursor: "pointer" }}>
                <option value="Letter">Letter (8.5" × 11")</option>
                <option value="A4">A4 (210 × 297mm)</option>
                <option value="Legal">Legal (8.5" × 14")</option>
                <option value="A3">A3 (297 × 420mm)</option>
                <option value="Tabloid">Tabloid (11" × 17")</option>
              </select>
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Orientation">
              <RibbonBtn icon={<LayoutTemplate size={16} />} label="Portrait" active={pageOrientation === "Portrait"} onClick={() => setPageOrientation("Portrait")} color={toolColor} />
              <RibbonBtn icon={<LayoutTemplate size={16} style={{ transform: "rotate(90deg)" }} />} label="Landscape" active={pageOrientation === "Landscape"} onClick={() => setPageOrientation("Landscape")} color={toolColor} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Margins">
              {(["None", "Narrow", "Normal", "Wide"] as const).map(m => (
                <RibbonBtn key={m} label={m} active={pageMargins === m} onClick={() => setPageMargins(m)} color={toolColor} />
              ))}
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Page Operations">
              <RibbonBtn icon={<RotateCw size={16} />} label="Rotate" onClick={() => rotatePage(pageOrder[currentPage - 1])} color={toolColor} />
              <RibbonBtn icon={<FileMinus size={16} />} label="Remove" onClick={() => removePage(pageOrder[currentPage - 1])} color="#ef4444" />
            </RibbonGroup>
          </>
        )}

        {/* ── VIEW Tab ── */}
        {activeTab === "view" && (
          <>
            <RibbonGroup label="Zoom">
              <RibbonBtn icon={<ZoomOut size={16} />} label="Zoom Out" onClick={() => setZoom(p => Math.max(p - 10, 30))} color={toolColor} />
              <select value={zoom} onChange={e => setZoom(parseInt(e.target.value))}
                style={{ height: "28px", padding: "0 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", width: "80px", outline: "none", cursor: "pointer" }}>
                {[50, 75, 90, 100, 110, 125, 150, 175, 200].map(z => <option key={z} value={z}>{z}%</option>)}
              </select>
              <RibbonBtn icon={<ZoomIn size={16} />} label="Zoom In" onClick={() => setZoom(p => Math.min(p + 10, 250))} color={toolColor} />
              <RibbonBtn icon={<Maximize2 size={16} />} label="100%" onClick={() => setZoom(100)} color={toolColor} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Display">
              <FormatBtn active={showRuler} onClick={() => setShowRuler(p => !p)} title="Show Ruler">
                <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Ruler</span>
              </FormatBtn>
              <FormatBtn active={showGrid} onClick={() => setShowGrid(p => !p)} title="Show Grid">
                <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Grid</span>
              </FormatBtn>
              <FormatBtn active={showRightPanel} onClick={() => setShowRightPanel(p => !p)} title="Properties Panel">
                <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Panel</span>
              </FormatBtn>
            </RibbonGroup>
          </>
        )}
      </div>
    </div>
  );
}
