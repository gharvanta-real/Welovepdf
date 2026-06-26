import React, { useState, useEffect } from "react";
import { File, X } from "lucide-react";
import { formatBytes } from "./UploadHelpers";
import { getPdfjsLib } from "../../utils/pdfjs";

export function renderSmileyIllustration(
  badgeText: string,
  themeColor: string,
  bgLineColor: string,
  options?: {
    isCrying?: boolean;
    isLoading?: boolean;
    isLocked?: boolean;
    scale?: number;
  }
) {
  const isCrying = options?.isCrying ?? false;
  const isLoading = options?.isLoading ?? false;
  const isLocked = options?.isLocked ?? false;
  const scale = options?.scale ?? 1;

  let animStyle: React.CSSProperties = {};
  if (isLoading) {
    animStyle = { animation: "uwFloat 3s infinite ease-in-out" };
  } else if (isCrying) {
    animStyle = { animation: "uwWiggle 1.5s infinite ease-in-out" };
  }

  // Determine eyes & mouth based on state
  let eyesAndMouth: React.ReactNode;
  if (isCrying) {
    eyesAndMouth = (
      <>
        {/* X eyes */}
        <path d="M17 33L23 39M23 33L17 39" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M37 33L43 39M43 33L37 39" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Tears */}
        <path d="M20 45C20 47 19 48 18 48C17 48 16 47 16 45C16 44 18 41 18 41C18 41 20 44 20 45Z" fill="#3b82f6" />
        <path d="M44 45C44 47 43 48 42 48C41 48 40 47 40 45C40 44 42 41 42 41C42 41 44 44 44 45Z" fill="#3b82f6" />
        {/* Sad mouth */}
        <path d="M26 50C26 47 34 47 34 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (isLoading) {
    eyesAndMouth = (
      <>
        {/* Closed/happy eyes arches */}
        <path d="M16 38C16 35 24 35 24 38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M36 38C36 35 44 35 44 38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Whistling/concentrating mouth */}
        <circle cx="30" cy="48" r="3" fill="#1e293b" />
      </>
    );
  } else if (isLocked) {
    eyesAndMouth = (
      <>
        {/* Sleeping straight lines */}
        <path d="M16 36H24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M36 36H44" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Straight mouth */}
        <path d="M27 48H33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else {
    // Normal smiley face
    eyesAndMouth = (
      <>
        {/* Eyes (inside glasses) */}
        <circle cx="20" cy="36" r="2" fill="#1e293b" />
        <circle cx="40" cy="36" r="2" fill="#1e293b" />
        {/* Smiling Mouth */}
        <path d="M26 48C26 51 34 51 34 48" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  }

  // Display locked padlock next to text if locked
  const badgeTextFinal = isLocked ? `ðŸ”’ ${badgeText}` : badgeText;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "16px", boxSizing: "border-box" }}>
      {/* Background page layouts (faint paragraph blocks) */}
      <div style={{ position: "absolute", inset: "16px", display: "flex", flexDirection: "column", gap: "8px", opacity: 0.35, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ width: "40%", height: "24px", backgroundColor: bgLineColor, borderRadius: "2px" }} />
          <div style={{ width: "60%", height: "24px", backgroundColor: bgLineColor, borderRadius: "2px" }} />
        </div>
        <div style={{ width: "100%", height: "12px", backgroundColor: bgLineColor, borderRadius: "2px" }} />
        <div style={{ width: "85%", height: "12px", backgroundColor: bgLineColor, borderRadius: "2px" }} />
        <div style={{ width: "100%", height: "12px", backgroundColor: bgLineColor, borderRadius: "2px", marginTop: "auto" }} />
        <div style={{ width: "50%", height: "12px", backgroundColor: bgLineColor, borderRadius: "2px" }} />
      </div>

      {/* Center Smiley Document Illustration */}
      <div style={{ 
        position: "relative", 
        width: "70px", 
        height: "90px", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 2,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        ...animStyle
      }}>
        <svg width="60" height="76" viewBox="0 0 60 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.06))" }}>
          {/* White document body with a folded corner */}
          <path d="M2 2C2 0.895431 2.89543 0 4 0H42L58 16V74C58 75.1046 57.1046 76 56 76H4C2.89543 76 2 75.1046 2 74V2Z" fill="white" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M42 0V16H58" fill="white" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Eyeglasses */}
          <circle cx="20" cy="36" r="7" stroke="#1e293b" strokeWidth="2.5" fill="none" />
          <circle cx="40" cy="36" r="7" stroke="#1e293b" strokeWidth="2.5" fill="none" />
          <path d="M27 36H33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M13 36C13 34 10 35 10 35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M47 36C47 34 50 35 50 35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

          {eyesAndMouth}
        </svg>

        {/* Red/Theme Badge */}
        <div style={{
          position: "absolute",
          bottom: "6px",
          backgroundColor: themeColor,
          color: "#ffffff",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: "3px",
          letterSpacing: "0.2px",
          boxShadow: `0 2px 4px ${themeColor}33`,
          zIndex: 3,
          whiteSpace: "nowrap"
        }}>
          {badgeTextFinal}
        </div>
      </div>
    </div>
  );
}

interface FilePreviewCardProps {
  file: File;
  idx: number;
  toolColor: string;
  onRemove: (index: number) => void;
  onPreviewClick?: (file: File) => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function FilePreviewCard({ file, idx, toolColor, onRemove, onPreviewClick, readOnly = false, isLoading = false }: FilePreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [, setLoadingPdf] = useState(false);

  const fileName = file.name;
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  const getFileTypeDescription = () => {
    if (extension === "pdf") return "PDF Document";
    if (extension === "docx" || extension === "doc") return "Word Document";
    if (extension === "xlsx" || extension === "xls") return "Excel Sheet";
    if (extension === "pptx" || extension === "ppt") return "PowerPoint";
    if (extension === "txt") return "Text File";
    if (extension === "html" || extension === "htm") return "HTML File";
    if (file.type.startsWith("image/")) return `${extension.toUpperCase()} Image`;
    return extension ? `${extension.toUpperCase()} File` : "File";
  };

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  useEffect(() => {
    if (extension === "pdf") {
      setLoadingPdf(true);
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        try {
          const pdfjsLib = await getPdfjsLib();
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          setPdfPageCount(pdf.numPages);
          
          // Render first page as thumbnail
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.75 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            setPdfThumbnail(canvas.toDataURL());
          }
        } catch (err) {
          console.error("PDF.js error in FilePreviewCard:", err);
          fallbackPageCount(typedarray);
        } finally {
          setLoadingPdf(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    }
    
    function fallbackPageCount(arrayBuffer: Uint8Array) {
      try {
        const text = new TextDecoder("ascii").decode(arrayBuffer);
        const matches = text.match(/\/Count\s+(\d+)/g);
        if (matches && matches.length > 0) {
          const countMatch = matches[matches.length - 1];
          const count = parseInt(countMatch.replace(/[^\d]/g, ""), 10);
          if (!isNaN(count)) {
            setPdfPageCount(count);
            return;
          }
        }
      } catch (e) {
        console.error("Fallback page count regex failed:", e);
      }
      setPdfPageCount(1);
    }
  }, [file, extension]);

  // Determine what preview content to render
  let previewContent;
  
  if (isLoading) {
    const badgeText = extension.toUpperCase() || "FILE";
    const badgeColor = 
      extension === "pdf" ? "#ef4444" :
      (extension === "docx" || extension === "doc") ? "#2563eb" :
      (extension === "xlsx" || extension === "xls") ? "#16a34a" :
      (extension === "pptx" || extension === "ppt") ? "#ea580c" :
      (extension === "html" || extension === "htm") ? "#0ea5e9" :
      extension === "txt" ? "#64748b" : (toolColor || "#2563eb");
    
    const bgLineColor = 
      extension === "pdf" ? "#fee2e2" :
      (extension === "docx" || extension === "doc") ? "#dbeafe" :
      (extension === "xlsx" || extension === "xls") ? "#dcfce7" :
      (extension === "pptx" || extension === "ppt") ? "#ffedd5" :
      (extension === "html" || extension === "htm") ? "#e0f2fe" : "#f4f4f4";
      
    previewContent = renderSmileyIllustration(badgeText, badgeColor, bgLineColor, { isLoading: true });
  } else if (file.type.startsWith("image/") && previewUrl) {
    previewContent = (
      <img 
        src={previewUrl} 
        className="file-card-img-preview" 
        alt={fileName} 
      />
    );
  } else if (extension === "pdf") {
    previewContent = (
      <div className="pdf-mock-preview" style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {pdfThumbnail ? (
          <img src={pdfThumbnail} className="file-card-img-preview" alt={fileName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          renderSmileyIllustration("PDF", "#ef4444", "#fee2e2")
        )}
        {pdfPageCount !== null && !readOnly && (
          <span className="pdf-page-counter-badge" style={{ position: "absolute", bottom: "6px", right: "6px", backgroundColor: "rgba(15, 23, 42, 0.65)", color: "white", fontSize: "10px", fontWeight: 400, padding: "2px 5px", borderRadius: "3px" }}>
            {pdfPageCount} {pdfPageCount === 1 ? "pg" : "pgs"}
          </span>
        )}
      </div>
    );
  } else if (extension === "docx" || extension === "doc") {
    previewContent = renderSmileyIllustration("WORD", "#2563eb", "#dbeafe");
  } else if (extension === "xlsx" || extension === "xls") {
    previewContent = renderSmileyIllustration("EXCEL", "#16a34a", "#dcfce7");
  } else if (extension === "pptx" || extension === "ppt") {
    previewContent = renderSmileyIllustration("PPT", "#ea580c", "#ffedd5");
  } else if (extension === "html" || extension === "htm") {
    previewContent = renderSmileyIllustration("HTML", "#0ea5e9", "#e0f2fe");
  } else if (extension === "txt") {
    previewContent = renderSmileyIllustration("TXT", "#64748b", "#f4f4f4");
  } else {
    previewContent = renderSmileyIllustration("FILE", toolColor || "#2563eb", "#f4f4f4");
  }

  return (
    <div 
      className="canvas-file-card" 
      onClick={() => onPreviewClick && onPreviewClick(file)}
      style={{ cursor: readOnly ? "default" : "pointer" }}
    >
      {!readOnly && (
        <button 
          className="file-card-remove" 
          onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          aria-label="Remove file"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
      
      <div className="file-card-preview-box">
        {previewContent}
      </div>
      
      {!readOnly && (
        <div className="file-card-meta">
          <span className="file-card-name" title={fileName}>{fileName}</span>
          <span className="file-card-size">
            {getFileTypeDescription()} &bull; {formatBytes(file.size)}
          </span>
        </div>
      )}
    </div>
  );
}

