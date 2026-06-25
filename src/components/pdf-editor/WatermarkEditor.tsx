import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, FileText, Upload, Sliders, Type, Image as ImageIcon, Check, X } from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { OverlayElement } from "./types";
import { Header } from "./Header";

interface WatermarkEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function WatermarkEditor({ file, onClose, onSave }: WatermarkEditorProps) {
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

  // Watermark Settings
  const [mode, setMode] = useState<"text" | "image">("text");
  
  // Text Watermark Options
  const [wmText, setWmText] = useState("Confidential");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#dc2626");
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [isTiled, setIsTiled] = useState(false);
  const [position, setPosition] = useState<"top-left" | "top-center" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom-center" | "bottom-right">("center");

  // Image Watermark Options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imgScale, setImgScale] = useState(40);
  const [imgOpacity, setImgOpacity] = useState(0.4);
  const [imgRotation, setImgRotation] = useState(0);
  const [imgPosition, setImgPosition] = useState<"top-left" | "top-center" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom-center" | "bottom-right">("center");

  // Page range selection
  const [pageRange, setPageRange] = useState<"all" | "first" | "custom">("all");
  const [customRangeStr, setCustomRangeStr] = useState("");

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
        console.error("Error loading PDF in WatermarkEditor:", err);
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
          console.error("Error rendering PDF page in WatermarkEditor:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, pageOrder, zoom]);

  // Handle Image upload
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Calculate pages to apply
  function getPagesToApply(): number[] {
    const list: number[] = [];
    if (pageRange === "all") {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else if (pageRange === "first") {
      list.push(1);
    } else if (pageRange === "custom") {
      const parts = customRangeStr.split(",");
      parts.forEach(p => {
        const clean = p.trim();
        if (clean.includes("-")) {
          const rangeParts = clean.split("-");
          const start = parseInt(rangeParts[0]);
          const end = parseInt(rangeParts[1]);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) list.push(i);
            }
          }
        } else {
          const num = parseInt(clean);
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            list.push(num);
          }
        }
      });
    }
    return list.length > 0 ? list : [1];
  }

  // Complete watermarking process
  async function handleApplyWatermark() {
    const pagesToWatermark = getPagesToApply();
    const finalElements: OverlayElement[] = [];

    if (mode === "text") {
      // Map layout alignments to coordinates (percentages)
      let x = 50;
      let y = 50;
      let align: "center" | "left" | "right" = "center";
      
      if (position === "top-left") { x = 10; y = 10; align = "left"; }
      else if (position === "top-center") { x = 50; y = 10; align = "center"; }
      else if (position === "top-right") { x = 90; y = 10; align = "right"; }
      else if (position === "left") { x = 10; y = 50; align = "left"; }
      else if (position === "center") { x = 50; y = 50; align = "center"; }
      else if (position === "right") { x = 90; y = 50; align = "right"; }
      else if (position === "bottom-left") { x = 10; y = 90; align = "left"; }
      else if (position === "bottom-center") { x = 50; y = 90; align = "center"; }
      else if (position === "bottom-right") { x = 90; y = 90; align = "right"; }

      pagesToWatermark.forEach(pageNum => {
        if (isTiled) {
          // Generate a grid of text elements across the page
          for (let gridX = 15; gridX <= 85; gridX += 35) {
            for (let gridY = 15; gridY <= 85; gridY += 35) {
              finalElements.push({
                id: `wm-text-${pageNum}-${gridX}-${gridY}-${Date.now()}`,
                type: "text",
                page: pageNum,
                x: gridX,
                y: gridY,
                content: wmText,
                fontSize: Math.round(fontSize * 0.7),
                color: textColor,
                opacity: opacity,
                align: "center"
              });
            }
          }
        } else {
          finalElements.push({
            id: `wm-text-${pageNum}-${Date.now()}`,
            type: "text",
            page: pageNum,
            x,
            y,
            content: wmText,
            fontSize,
            color: textColor,
            opacity,
            align
          });
        }
      });
    } else {
      // Image Watermark
      if (!imageDataUrl) {
        alert("Please upload a watermark image first!");
        return;
      }

      // Generate a canvas with correct opacity and scaling
      const processedImageUrl = await new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.globalAlpha = imgOpacity;
            ctx.drawImage(img, 0, 0);
          }
          resolve(c.toDataURL("image/png"));
        };
        img.src = imageDataUrl;
      });

      // Bounding box coordinates
      const wSize = imgScale;
      const hSize = imgScale * 0.6; // average aspect ratio box
      let x = 50 - wSize / 2;
      let y = 50 - hSize / 2;

      if (imgPosition === "top-left") { x = 8; y = 8; }
      else if (imgPosition === "top-center") { x = 50 - wSize / 2; y = 8; }
      else if (imgPosition === "top-right") { x = 92 - wSize; y = 8; }
      else if (imgPosition === "left") { x = 8; y = 50 - hSize / 2; }
      else if (imgPosition === "center") { x = 50 - wSize / 2; y = 50 - hSize / 2; }
      else if (imgPosition === "right") { x = 92 - wSize; y = 50 - hSize / 2; }
      else if (imgPosition === "bottom-left") { x = 8; y = 92 - hSize; }
      else if (imgPosition === "bottom-center") { x = 50 - wSize / 2; y = 92 - hSize; }
      else if (imgPosition === "bottom-right") { x = 92 - wSize; y = 92 - hSize; }

      pagesToWatermark.forEach(pageNum => {
        finalElements.push({
          id: `wm-img-${pageNum}-${Date.now()}`,
          type: "image",
          page: pageNum,
          x,
          y,
          width: wSize,
          height: hSize,
          dataUrl: processedImageUrl
        });
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

  // Get position style helper for visual previews
  function getPositionStyle(pos: string) {
    const gap = "10%";
    switch (pos) {
      case "top-left": return { top: gap, left: gap, transform: "translate(-50%, -50%)" };
      case "top-center": return { top: gap, left: "50%", transform: "translate(-50%, -50%)" };
      case "top-right": return { top: gap, right: gap, transform: "translate(50%, -50%)" };
      case "left": return { top: "50%", left: gap, transform: "translate(-50%, -50%)" };
      case "center": return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      case "right": return { top: "50%", right: gap, transform: "translate(50%, -50%)" };
      case "bottom-left": return { bottom: gap, left: gap, transform: "translate(-50%, 50%)" };
      case "bottom-center": return { bottom: gap, left: "50%", transform: "translate(-50%, 50%)" };
      default: return { bottom: gap, right: gap, transform: "translate(50%, 50%)" }; // bottom-right
    }
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
        selectedTool="Watermark PDF"
        onRenameFile={setFileName}
        onClose={onClose}
        onDownload={handleApplyWatermark}
        onToggleProperties={() => setShowRightPanel(!showRightPanel)}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        showRightPanel={showRightPanel}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar: Pages List */}
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
          
          {/* Watermark Overlay Preview Layer */}
          <div style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignContent: "center"
          }}>
            {mode === "text" ? (
              isTiled ? (
                // Tiled Text grid preview
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{
                    width: "33.3%",
                    height: "33.3%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: textColor,
                    fontSize: `${fontSize * (zoom / 100) * 0.6}px`,
                    fontWeight: "bold",
                    opacity: opacity,
                    transform: `rotate(-${rotation}deg)`,
                    whiteSpace: "nowrap"
                  }}>
                    {wmText}
                  </div>
                ))
              ) : (
                // Centered/aligned Text preview
                <div style={{
                  position: "absolute",
                  ...getPositionStyle(position),
                  color: textColor,
                  fontSize: `${fontSize * (zoom / 100)}px`,
                  fontWeight: "bold",
                  opacity: opacity,
                  transform: `${getPositionStyle(position).transform} rotate(-${rotation}deg)`,
                  whiteSpace: "nowrap"
                }}>
                  {wmText}
                </div>
              )
            ) : (
              // Image preview
              imageDataUrl && (
                <div style={{
                  position: "absolute",
                  ...getPositionStyle(imgPosition),
                  width: `${imgScale}%`,
                  opacity: imgOpacity,
                  transform: `${getPositionStyle(imgPosition).transform} rotate(${imgRotation}deg)`
                }}>
                  <img src={imageDataUrl} style={{ width: "100%", height: "auto", display: "block" }} alt="wm preview" />
                </div>
              )
            )}
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
            Watermark Options
          </h3>

          {/* Tab Selection */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "18px", backgroundColor: "rgba(255,255,255,0.4)", padding: "4px", borderRadius: "9999px" }}>
            <button
              onClick={() => setMode("text")}
              className={mode === "text" ? "primary-button" : "quiet-button"}
              style={{ flex: 1, padding: "8px", fontSize: "0.78rem", minHeight: "auto", borderRadius: "9999px", background: mode === "text" ? "#000" : "transparent", color: mode === "text" ? "#fff" : "#000", border: "none" }}
            >
              Text
            </button>
            <button
              onClick={() => setMode("image")}
              className={mode === "image" ? "primary-button" : "quiet-button"}
              style={{ flex: 1, padding: "8px", fontSize: "0.78rem", minHeight: "auto", borderRadius: "9999px", background: mode === "image" ? "#000" : "transparent", color: mode === "image" ? "#fff" : "#000", border: "none" }}
            >
              Image
            </button>
          </div>

          {/* Dynamic settings panel container */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "text" ? (
              <>
                {/* Text Input */}
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Watermark Text</label>
                  <input 
                    type="text" 
                    value={wmText}
                    onChange={e => setWmText(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", marginTop: "4px", outline: "none", boxSizing: "border-box", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>

                {/* Position presets 3x3 Grid */}
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", letterSpacing: "0.03em" }}>Placement Position</label>
                  <div style={{
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "4px"
                  }}>
                    {/* Top Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setPosition("top-left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "top-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("top-center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "top-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("top-right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "top-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "top-right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
                    {/* Middle Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setPosition("left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
                    {/* Bottom Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setPosition("bottom-left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "bottom-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("bottom-center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "bottom-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setPosition("bottom-right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: position === "bottom-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: position === "bottom-right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
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
                    min="12" 
                    max="120" 
                    value={fontSize}
                    onChange={e => setFontSize(parseInt(e.target.value))}
                    style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
                  />
                </div>

                {/* Text Color Picker */}
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Text Color</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
                    <input 
                      type="color" 
                      value={textColor}
                      onChange={e => setTextColor(e.target.value)}
                      style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: "4px", padding: "0", width: "32px", height: "32px", cursor: "pointer", backgroundColor: "transparent" }}
                    />
                    <span style={{ fontSize: "0.78rem", fontWeight: "600", fontFamily: "monospace", color: "#333" }}>{textColor.toUpperCase()}</span>
                  </div>
                </div>

                {/* Tiled Repeat Pattern Checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                  <input 
                    type="checkbox" 
                    id="tiledCheck"
                    checked={isTiled}
                    onChange={e => setIsTiled(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="tiledCheck" style={{ fontSize: "0.74rem", fontWeight: "700", color: "rgba(0,0,0,0.7)", cursor: "pointer" }}>Tile/Repeat pattern across page</label>
                </div>

                {/* Opacity slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>
                    <span>Opacity / Transparency</span>
                    <span>{Math.round(opacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="95" 
                    value={opacity * 100}
                    onChange={e => setOpacity(parseInt(e.target.value) / 100)}
                    style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
                  />
                </div>

                {/* Rotation slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>
                    <span>Rotation</span>
                    <span>{rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value))}
                    style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Image upload */}
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", display: "block", marginBottom: "4px" }}>Watermark Image</label>
                  <div style={{
                    border: "1.5px dashed rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    backgroundColor: "rgba(255,255,255,0.4)"
                  }}>
                    <Upload size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      style={{ fontSize: "0.72rem", width: "100%", cursor: "pointer" }}
                    />
                  </div>
                </div>

                {/* Image positions 3x3 Grid */}
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)", letterSpacing: "0.03em" }}>Placement Position</label>
                  <div style={{
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "4px"
                  }}>
                    {/* Top Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setImgPosition("top-left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "top-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "top-left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("top-center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "top-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "top-center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("top-right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "top-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "top-right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
                    {/* Middle Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setImgPosition("left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
                    {/* Bottom Row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setImgPosition("bottom-left")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "bottom-left" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "bottom-left" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("bottom-center")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "bottom-center" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "bottom-center" ? "#000" : "#fff", cursor: "pointer" }} />
                      <button onClick={() => setImgPosition("bottom-right")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: imgPosition === "bottom-right" ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)", backgroundColor: imgPosition === "bottom-right" ? "#000" : "#fff", cursor: "pointer" }} />
                    </div>
                  </div>
                </div>

                {/* Image scale slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>
                    <span>Image Scale / Size</span>
                    <span>{imgScale}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={imgScale}
                    onChange={e => setImgScale(parseInt(e.target.value))}
                    style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
                  />
                </div>

                {/* Image Opacity */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>
                    <span>Opacity</span>
                    <span>{Math.round(imgOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={imgOpacity * 100}
                    onChange={e => setImgOpacity(parseInt(e.target.value) / 100)}
                    style={{ width: "100%", marginTop: "4px", cursor: "pointer" }}
                  />
                </div>
              </>
            )}

            {/* Page range selections */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "rgba(0,0,0,0.6)" }}>Page Range</label>
              <select 
                value={pageRange}
                onChange={e => setPageRange(e.target.value as any)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.78rem", marginTop: "4px", outline: "none", cursor: "pointer" }}
              >
                <option value="all">Apply to all pages</option>
                <option value="first">Apply to first page only</option>
                <option value="custom">Custom page range</option>
              </select>

              {pageRange === "custom" && (
                <input 
                  type="text" 
                  placeholder="e.g. 1-3, 5"
                  value={customRangeStr}
                  onChange={e => setCustomRangeStr(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.74rem", marginTop: "6px", outline: "none", boxSizing: "border-box" }}
                />
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleApplyWatermark}
            className="primary-button"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Apply Watermark &rarr;
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
