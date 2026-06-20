import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, FileText, Binary, Sliders, Check, X } from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { OverlayElement } from "./types";
import { Header } from "./Header";

interface PageNumberEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function PageNumberEditor({ file, onClose, onSave }: PageNumberEditorProps) {
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

  // Page numbering settings
  const [template, setTemplate] = useState("Page {n} of {total}");
  const [position, setPosition] = useState<"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right">("bottom-center");
  const [startIndex, setStartIndex] = useState(1);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [textColor, setTextColor] = useState("#475569");
  const [fontSize, setFontSize] = useState(12);

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
          const context = canvas.getContext("2d");
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            thumbUrls.push(canvas.toDataURL());
          }
        }
        setThumbnails(thumbUrls);
      } catch (err) {
        console.error("Error loading PDF in PageNumberEditor:", err);
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
          console.error("Error rendering PDF page in PageNumberEditor:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, pageOrder, zoom]);

  // Helper to format text preview
  function getPreviewText() {
    const virtualNum = startIndex + currentPage - 1;
    return template.replace("{n}", String(virtualNum)).replace("{total}", String(totalPages));
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

  // Save changes
  function handleApplyPageNumbers() {
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
      if (skipFirstPage && i === 1) continue;

      const pageVirtualIndex = startIndex + i - 1;
      const content = template
        .replace("{n}", String(pageVirtualIndex))
        .replace("{total}", String(totalPages));

      finalElements.push({
        id: `pgnum-${i}-${Date.now()}`,
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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: "hidden"
    }}>
      <Header
        fileName={fileName}
        selectedTool="Page Numbers"
        onRenameFile={setFileName}
        onClose={onClose}
        onDownload={handleApplyPageNumbers}
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

          {/* Page Number Preview Element */}
          {(!skipFirstPage || currentPage !== 1) && (
            <div style={{
              position: "absolute",
              ...getPositionStyle(position),
              color: textColor,
              fontSize: `${fontSize * (zoom / 100)}px`,
              fontWeight: "bold",
              pointerEvents: "none",
              padding: "4px 8px",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {getPreviewText()}
            </div>
          )}
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
            Page Numbering
          </h3>

          {/* Dynamic settings scroll area */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Format template selection */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>NUMBERING FORMAT</label>
              <select
                value={template}
                onChange={e => setTemplate(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.78rem", marginTop: "4px", outline: "none", cursor: "pointer" }}
              >
                <option value="Page {n} of {total}">Page {`{n}`} of {`{total}`}</option>
                <option value="Page {n}">Page {`{n}`}</option>
                <option value="{n}">{`{n}`} (Number only)</option>
                <option value="Page {n} / {total}">Page {`{n}`} / {`{total}`}</option>
              </select>
            </div>

            {/* Starting Index input */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>START NUMBERING FROM</label>
              <input 
                type="number"
                min="1"
                value={startIndex}
                onChange={e => setStartIndex(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", marginTop: "4px", outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            {/* Skip first page checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input 
                type="checkbox"
                id="skipCheck"
                checked={skipFirstPage}
                onChange={e => setSkipFirstPage(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="skipCheck" style={{ fontSize: "0.74rem", fontWeight: "700", color: "rgba(0,0,0,0.7)", cursor: "pointer" }}>Skip first page (Cover page)</label>
            </div>

            {/* Polished Position Selector Grid (3x2 layout representation) */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", letterSpacing: "0.03em" }}>NUMBER POSITION</label>
              <div style={{
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "4px"
              }}>
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setPosition("top-left")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "top-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-left" ? "#000" : "#fff", cursor: "pointer" }} title="Top Left" />
                  <button onClick={() => setPosition("top-center")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "top-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-center" ? "#000" : "#fff", cursor: "pointer" }} title="Top Center" />
                  <button onClick={() => setPosition("top-right")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "top-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-right" ? "#000" : "#fff", cursor: "pointer" }} title="Top Right" />
                </div>
                
                {/* Center Page Body Graphic */}
                <div style={{ height: "40px", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
                  <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "bold" }}>PAGE BODY</span>
                </div>

                {/* Footer Row */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setPosition("bottom-left")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "bottom-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-left" ? "#000" : "#fff", cursor: "pointer" }} title="Bottom Left" />
                  <button onClick={() => setPosition("bottom-center")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "bottom-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-center" ? "#000" : "#fff", cursor: "pointer" }} title="Bottom Center" />
                  <button onClick={() => setPosition("bottom-right")} style={{ width: "24px", height: "24px", borderRadius: "4px", border: position === "bottom-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-right" ? "#000" : "#fff", cursor: "pointer" }} title="Bottom Right" />
                </div>
              </div>
            </div>

            {/* Font styling */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", display: "block" }}>COLOR PRESET</label>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                {["#475569", "#000000", "#dc2626", "#2563eb", "#16a34a"].map(c => (
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
                <span>FONT SIZE</span>
                <span>{fontSize}px</span>
              </div>
              <input 
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={e => setFontSize(parseInt(e.target.value))}
                style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
              />
            </div>

          </div>

          {/* Action Button */}
          <button
            onClick={handleApplyPageNumbers}
            className="primary-button"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Add Page Numbers &rarr;
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
