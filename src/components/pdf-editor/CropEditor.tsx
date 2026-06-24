import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, FileText, Crop, Sliders, Check, X } from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { Header } from "./Header";

interface CropEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function CropEditor({ file, onClose, onSave }: CropEditorProps) {
  // Document states
  const [fileName, setFileName] = useState(file.name);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // Crop settings (margins in percentage)
  const [cropLeft, setCropLeft] = useState(10);
  const [cropRight, setCropRight] = useState(10);
  const [cropTop, setCropTop] = useState(10);
  const [cropBottom, setCropBottom] = useState(10);
  
  const [preset, setPreset] = useState("custom");
  const [applyToAll, setApplyToAll] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartMargins = useRef({ left: 0, right: 0, top: 0, bottom: 0 });

  // Load PDF
  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      try {
        const pdfjsLib = await getPdfjsLib();
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        const order = [];
        for (let i = 1; i <= pdf.numPages; i++) order.push(i);
        setPageOrder(order);

        // Generate thumbnails
        const thumbUrls: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.14 });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            thumbUrls.push(canvas.toDataURL());
          }
        }
        setThumbnails(thumbUrls);
      } catch (err) {
        console.error("Error loading PDF in CropEditor:", err);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  // Render Page to Canvas
  useEffect(() => {
    if (pdfDoc && pageOrder[currentPage - 1]) {
      const actualPageNum = pageOrder[currentPage - 1];
      let active = true;
      async function renderPage() {
        try {
          const page = await pdfDoc.getPage(actualPageNum);
          const viewport = page.getViewport({ scale: zoom / 100 });
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          await page.render(renderContext).promise;

          if (overlayContainerRef.current) {
            overlayContainerRef.current.style.width = `${viewport.width}px`;
            overlayContainerRef.current.style.height = `${viewport.height}px`;
          }
        } catch (err) {
          console.error("Error rendering PDF page in CropEditor:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, pageOrder, zoom]);

  // Handle preset dropdown change
  useEffect(() => {
    if (preset === "letter") {
      setCropLeft(8); setCropRight(8); setCropTop(8); setCropBottom(8);
    } else if (preset === "a4") {
      setCropLeft(5); setCropRight(5); setCropTop(10); setCropBottom(10);
    } else if (preset === "auto") {
      setCropLeft(12); setCropRight(12); setCropTop(12); setCropBottom(12);
    } else if (preset === "none") {
      setCropLeft(0); setCropRight(0); setCropTop(0); setCropBottom(0);
    }
  }, [preset]);

  // Drag handlers for overlay bounding box
  function handleMouseDown(e: React.MouseEvent, handle: string) {
    e.stopPropagation();
    e.preventDefault();
    dragHandleRef.current = handle;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartMargins.current = { left: cropLeft, right: cropRight, top: cropTop, bottom: cropBottom };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragHandleRef.current || !overlayContainerRef.current) return;

    const rect = overlayContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

    const h = dragHandleRef.current;
    const start = dragStartMargins.current;

    setPreset("custom");

    if (h === "tl") {
      setCropLeft(Math.min(Math.max(start.left + dx, 0), 100 - start.right - 5));
      setCropTop(Math.min(Math.max(start.top + dy, 0), 100 - start.bottom - 5));
    } else if (h === "tr") {
      setCropRight(Math.min(Math.max(start.right - dx, 0), 100 - start.left - 5));
      setCropTop(Math.min(Math.max(start.top + dy, 0), 100 - start.bottom - 5));
    } else if (h === "bl") {
      setCropLeft(Math.min(Math.max(start.left + dx, 0), 100 - start.right - 5));
      setCropBottom(Math.min(Math.max(start.bottom - dy, 0), 100 - start.top - 5));
    } else if (h === "br") {
      setCropRight(Math.min(Math.max(start.right - dx, 0), 100 - start.left - 5));
      setCropBottom(Math.min(Math.max(start.bottom - dy, 0), 100 - start.top - 5));
    } else if (h === "top") {
      setCropTop(Math.min(Math.max(start.top + dy, 0), 100 - start.bottom - 5));
    } else if (h === "bottom") {
      setCropBottom(Math.min(Math.max(start.bottom - dy, 0), 100 - start.top - 5));
    } else if (h === "left") {
      setCropLeft(Math.min(Math.max(start.left + dx, 0), 100 - start.right - 5));
    } else if (h === "right") {
      setCropRight(Math.min(Math.max(start.right - dx, 0), 100 - start.left - 5));
    }
  }

  function handleMouseUp() {
    dragHandleRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  // Complete Crop operation
  function handleApplyCrop() {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // Backend expects crop margins to be scaled integers or floats in options
    const options = {
      pageOrder: pageOrder.join(","),
      rotatePages: "",
      removePages: "",
      cropMargin: "0",
      cropLeft: String(Math.round(cropLeft)),
      cropRight: String(Math.round(cropRight)),
      cropTop: String(Math.round(cropTop)),
      cropBottom: String(Math.round(cropBottom)),
      cropAllPages: applyToAll ? "true" : "false"
    };

    onSave(dataTransfer.files, options);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      width: "100%",
      backgroundColor: "#f3f3f3",
      fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif",
      overflow: "hidden"
    }}>
      <Header
        fileName={fileName}
        selectedTool="Crop PDF"
        onRenameFile={setFileName}
        onClose={onClose}
        onDownload={handleApplyCrop}
        onToggleProperties={() => setShowRightPanel(!showRightPanel)}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        showRightPanel={showRightPanel}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar: Pages list */}
      <div style={{
        width: "180px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e6e6e6",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1b1b1b", letterSpacing: "0.03em" }}>PAGES</span>
          <span style={{ fontSize: "0.72rem", color: "#5d5f5f" }}>{currentPage} / {totalPages || 1}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {pageOrder.map((pageNum, idx) => {
            const isActive = currentPage === idx + 1;
            return (
              <div 
                key={pageNum}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  borderRadius: "6px",
                  border: `2px solid ${isActive ? "#000000" : "transparent"}`,
                  padding: "4px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#f9f9f9" : "transparent",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{
                  width: "100%",
                  aspectRatio: "0.75",
                  background: "#ffffff",
                  border: "1px solid #e6e6e6",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {thumbnails[pageNum - 1] ? (
                    <img src={thumbnails[pageNum - 1]} style={{ width: "90%", height: "90%", objectFit: "contain" }} alt={`Page ${pageNum}`} />
                  ) : (
                    <FileText size={20} style={{ color: "#94a3b8" }} />
                  )}
                </div>
                <div style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: "600", color: "#5d5f5f", marginTop: "4px" }}>Page {pageNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Canvas Workspace */}
      <div style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        position: "relative"
      }}>
        <div 
          ref={overlayContainerRef}
          style={{
            position: "relative",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            border: "1px solid #e6e6e6"
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />

          {/* Interactive Bounding Crop Box Overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15,23,42,0.4)" // Dimmed outside region
          }}>
            {/* The actual clear crop area */}
            <div style={{
              position: "absolute",
              top: `${cropTop}%`,
              left: `${cropLeft}%`,
              right: `${cropRight}%`,
              bottom: `${cropBottom}%`,
              border: "2px dashed #000000",
              boxShadow: "0 0 0 9999px rgba(15,23,42,0.4)", // dim screen outside
              boxSizing: "border-box"
            }}>
              {/* Drag handles at corners */}
              <div 
                onMouseDown={e => handleMouseDown(e, "tl")}
                style={{ position: "absolute", width: "10px", height: "10px", background: "#000", left: "-6px", top: "-6px", cursor: "nwse-resize", borderRadius: "50%", border: "2px solid #fff" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "tr")}
                style={{ position: "absolute", width: "10px", height: "10px", background: "#000", right: "-6px", top: "-6px", cursor: "nesw-resize", borderRadius: "50%", border: "2px solid #fff" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "bl")}
                style={{ position: "absolute", width: "10px", height: "10px", background: "#000", left: "-6px", bottom: "-6px", cursor: "nesw-resize", borderRadius: "50%", border: "2px solid #fff" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "br")}
                style={{ position: "absolute", width: "10px", height: "10px", background: "#000", right: "-6px", bottom: "-6px", cursor: "nwse-resize", borderRadius: "50%", border: "2px solid #fff" }} 
              />

              {/* Edge drag bars */}
              <div 
                onMouseDown={e => handleMouseDown(e, "top")}
                style={{ position: "absolute", height: "8px", top: "-4px", left: "6px", right: "6px", cursor: "ns-resize" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "bottom")}
                style={{ position: "absolute", height: "8px", bottom: "-4px", left: "6px", right: "6px", cursor: "ns-resize" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "left")}
                style={{ position: "absolute", width: "8px", left: "-4px", top: "6px", bottom: "6px", cursor: "ew-resize" }} 
              />
              <div 
                onMouseDown={e => handleMouseDown(e, "right")}
                style={{ position: "absolute", width: "8px", right: "-4px", top: "6px", bottom: "6px", cursor: "ew-resize" }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Option Panel */}
      {showRightPanel && (
        <div style={{
          width: "280px",
          backgroundColor: "#ADEFD1", // Mint branding
          borderLeft: "1px solid #e6e6e6",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "20px 16px",
          boxSizing: "border-box"
        }}>
          {/* Back Link */}
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(0,0,0,0.6)",
              fontSize: "0.74rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "0",
              marginBottom: "14px"
            }}
          >
            <ChevronLeft size={12} /> Dashboard
          </button>

          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#000000", margin: "0 0 16px 0" }}>
            Crop Margins
          </h3>

          {/* Dynamic settings scroll area */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Preset options */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>PAGE PRESET</label>
              <select
                value={preset}
                onChange={e => setPreset(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.78rem", marginTop: "4px", outline: "none" }}
              >
                <option value="custom">Custom margins</option>
                <option value="a4">Standard A4 Margins</option>
                <option value="letter">Letter Page Outline</option>
                <option value="auto">Auto-Crop scanner borders</option>
                <option value="none">No margins (Reset)</option>
              </select>
            </div>

            {/* Numeric Slider Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", display: "block" }}>MARGIN INSET (%)</label>
              
              {/* Top Margin */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "600" }}>
                  <span>Top margin</span>
                  <span>{cropTop}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={cropTop} 
                  onChange={e => { setPreset("custom"); setCropTop(parseInt(e.target.value)); }}
                  style={{ width: "100%", marginTop: "2px" }}
                />
              </div>

              {/* Bottom Margin */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "600" }}>
                  <span>Bottom margin</span>
                  <span>{cropBottom}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={cropBottom} 
                  onChange={e => { setPreset("custom"); setCropBottom(parseInt(e.target.value)); }}
                  style={{ width: "100%", marginTop: "2px" }}
                />
              </div>

              {/* Left Margin */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "600" }}>
                  <span>Left margin</span>
                  <span>{cropLeft}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={cropLeft} 
                  onChange={e => { setPreset("custom"); setCropLeft(parseInt(e.target.value)); }}
                  style={{ width: "100%", marginTop: "2px" }}
                />
              </div>

              {/* Right Margin */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "600" }}>
                  <span>Right margin</span>
                  <span>{cropRight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={cropRight} 
                  onChange={e => { setPreset("custom"); setCropRight(parseInt(e.target.value)); }}
                  style={{ width: "100%", marginTop: "2px" }}
                />
              </div>
            </div>

            {/* Apply options */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input 
                type="checkbox" 
                id="applyAllCheck"
                checked={applyToAll}
                onChange={e => setApplyToAll(e.target.checked)}
              />
              <label htmlFor="applyAllCheck" style={{ fontSize: "0.74rem", fontWeight: "700", color: "rgba(0,0,0,0.7)" }}>Apply crop to all pages</label>
            </div>

          </div>

          {/* Action Button */}
          <button
            onClick={handleApplyCrop}
            className="primary-button"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Crop PDF &rarr;
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
