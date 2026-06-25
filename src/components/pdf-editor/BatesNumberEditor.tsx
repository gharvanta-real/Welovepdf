import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, FileText, Hash, Check, X } from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { OverlayElement } from "./types";
import { Header } from "./Header";

interface BatesNumberEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function BatesNumberEditor({ file, onClose, onSave }: BatesNumberEditorProps) {
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

  // Bates settings
  const [prefix, setPrefix] = useState("Bates-");
  const [suffix, setSuffix] = useState("");
  const [paddingWidth, setPaddingWidth] = useState(6);
  const [startIndex, setStartIndex] = useState(1);
  const [position, setPosition] = useState<"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right">("bottom-right");
  const [textColor, setTextColor] = useState("#ef4444"); // Red is standard for legal stamps
  const [fontSize, setFontSize] = useState(11);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);

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
        console.error("Error loading PDF in BatesNumberEditor:", err);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  // Render Page
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
          console.error("Error rendering PDF page in BatesNumberEditor:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, pageOrder, zoom]);

  // Helper to format Bates numbering string for preview
  function getPreviewBates() {
    const pageVal = startIndex + currentPage - 1;
    const padded = String(pageVal).padStart(paddingWidth, "0");
    return `${prefix}${padded}${suffix}`;
  }

  // Get CSS style for layout position
  function getPositionStyle(pos: string) {
    const gap = "12px";
    switch (pos) {
      case "top-left": return { top: gap, left: gap, transform: "none", textAlign: "left" as const };
      case "top-center": return { top: gap, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const };
      case "top-right": return { top: gap, right: gap, transform: "none", textAlign: "right" as const };
      case "bottom-left": return { bottom: gap, left: gap, transform: "none", textAlign: "left" as const };
      case "bottom-right": return { bottom: gap, right: gap, transform: "none", textAlign: "right" as const };
      default: return { bottom: gap, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const }; // bottom-center
    }
  }

  // Save Bates Number overlays
  function handleApplyBates() {
    const finalElements: OverlayElement[] = [];

    // Map position keyword to page coordinates (percentage)
    let x = 50;
    let y = 95;
    let align: "center" | "left" | "right" = "center";

    if (position === "top-left") { x = 5; y = 5; align = "left"; }
    else if (position === "top-center") { x = 50; y = 5; align = "center"; }
    else if (position === "top-right") { x = 95; y = 5; align = "right"; }
    else if (position === "bottom-left") { x = 5; y = 95; align = "left"; }
    else if (position === "bottom-right") { x = 95; y = 95; align = "right"; }

    for (let i = 1; i <= totalPages; i++) {
      const pageVal = startIndex + i - 1;
      const padded = String(pageVal).padStart(paddingWidth, "0");
      const content = `${prefix}${padded}${suffix}`;

      finalElements.push({
        id: `bates-${i}-${Date.now()}`,
        type: "text",
        page: i,
        x,
        y,
        content,
        fontSize,
        color: textColor,
        align
      });
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const options = {
      editorOverlays: JSON.stringify(finalElements),
      pageOrder: pageOrder.join(","),
      rotatePages: "",
      removePages: ""
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
        selectedTool="Bates Numbering"
        onRenameFile={setFileName}
        onClose={onClose}
        onDownload={handleApplyBates}
        onToggleProperties={() => setShowRightPanel(!showRightPanel)}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        showRightPanel={showRightPanel}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar */}
      <div style={{
        width: "180px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e6e6e6",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1b1b1b", letterSpacing: "0.03em" }}>Pages</span>
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

      {/* Center Canvas Viewport */}
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
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            backgroundColor: "#ffffff",
            borderRadius: "6px",
            border: "1px solid #e6e6e6",
            overflow: "hidden"
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />

          {/* Bates Number Preview Element */}
          <div style={{
            position: "absolute",
            ...getPositionStyle(position),
            color: textColor,
            fontSize: `${fontSize * (zoom / 100)}px`,
            fontWeight: "bold",
            pointerEvents: "none",
            padding: "4px 8px",
            fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif"
          }}>
            {getPreviewBates()}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
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
            Bates Numbering
          </h3>

          {/* Dynamic settings scroll area */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Prefix */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Index Prefix</label>
              <input 
                type="text"
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                placeholder="e.g. BATES-"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", marginTop: "4px", outline: "none", boxSizing: "border-box", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            {/* Suffix */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Index Suffix</label>
              <input 
                type="text"
                value={suffix}
                onChange={e => setSuffix(e.target.value)}
                placeholder="e.g. -CONF"
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", marginTop: "4px", outline: "none", boxSizing: "border-box", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            {/* Padding selector */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Serial Digit Width</label>
              <select
                value={paddingWidth}
                onChange={e => setPaddingWidth(parseInt(e.target.value))}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.78rem", marginTop: "4px", outline: "none", cursor: "pointer" }}
              >
                <option value="3">3 digits (001)</option>
                <option value="4">4 digits (0001)</option>
                <option value="5">5 digits (00001)</option>
                <option value="6">6 digits (000001)</option>
                <option value="8">8 digits (00000001)</option>
              </select>
            </div>

            {/* Start index */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Start Serial Number</label>
              <input 
                type="number"
                min="1"
                value={startIndex}
                onChange={e => setStartIndex(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", marginTop: "4px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Placement */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Placement Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as any)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.78rem", marginTop: "4px", outline: "none", cursor: "pointer" }}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            {/* Color preset */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", display: "block" }}>Stamp Color</label>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                {["#ef4444", "#000000", "#2563eb", "#16a34a", "#475569"].map(c => (
                  <button 
                    key={c}
                    onClick={() => setTextColor(c)}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: c,
                      border: textColor === c ? "2px solid #000" : "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Font Size slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input 
                type="range"
                min="8"
                max="20"
                value={fontSize}
                onChange={e => setFontSize(parseInt(e.target.value))}
                style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
              />
            </div>

          </div>

          {/* Action Button */}
          <button
            onClick={handleApplyBates}
            className="primary-button"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Apply Bates Stamp &rarr;
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
