import React, { useState, useEffect, useRef } from "react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { formatBytes } from "./UploadHelpers";

interface ImagePreviewViewerProps {
  file: File;
  scale: number;
  rotation: number;
}

function ImagePreviewViewer({ file, scale, rotation }: ImagePreviewViewerProps) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", overflow: "auto", padding: "20px" }}>
      <img 
        src={url} 
        style={{ 
          maxWidth: "100%", 
          maxHeight: "70vh", 
          height: "auto", 
          borderRadius: "8px", 
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", 
          border: "1px solid var(--border)",
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: "transform 0.2s ease"
        }} 
        alt={file.name} 
      />
    </div>
  );
}

interface PdfPageRendererProps {
  pdfDoc: any;
  pageNum: number;
  scale: number;
  rotation: number;
}

function PdfPageRenderer({ pdfDoc, pageNum, scale, rotation }: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let active = true;
    async function renderPage() {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ 
          scale: scale, 
          rotation: (page.rotation + rotation) % 360 
        });
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        setRendering(false);
      } catch (e) {
        console.error("Error rendering page inside preview renderer:", e);
      }
    }
    renderPage();
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  return (
    <div style={{ 
      position: "relative",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      border: "1px solid var(--border)",
      overflow: "hidden",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "width 0.2s ease, height 0.2s ease"
    }}>
      {rendering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)", zIndex: 5 }}>
          <div className="processing-spinner" style={{ borderTopColor: "var(--c-accent)", width: "20px", height: "20px" }}></div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto", display: "block" }} />
      <div style={{ 
        width: "100%", 
        padding: "8px 0", 
        textAlign: "center", 
        fontSize: "0.7rem", 
        fontWeight: "500",
        color: "#6b7280", 
        backgroundColor: "#f9fafb", 
        borderTop: "1px solid #e5e7eb" 
      }}>
        Page {pageNum}
      </div>
    </div>
  );
}

interface PdfPreviewViewerProps {
  file: File;
  scale: number;
  rotation: number;
}

function PdfPreviewViewer({ file, scale, rotation }: PdfPreviewViewerProps) {
  const [pages, setPages] = useState<number[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      try {
        const pdfjsLib = await getPdfjsLib();
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setPdfDoc(pdf);
        const pageList = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pageList.push(i);
        }
        setPages(pageList);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading PDF in preview:", err);
        setError("Failed to render PDF: " + err.message);
        setLoading(false);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "14px" }}>
        <div className="processing-spinner" style={{ borderTopColor: "var(--c-accent)", width: "32px", height: "32px" }}></div>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>Loading document pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", width: "100%", padding: "10px 0" }}>
      {pages.map((pageNum) => (
        <PdfPageRenderer key={pageNum} pdfDoc={pdfDoc} pageNum={pageNum} scale={scale} rotation={rotation} />
      ))}
    </div>
  );
}

interface PreviewModalProps {
  previewFile: File | null;
  onClose: () => void;
  previewScale: number;
  setPreviewScale: React.Dispatch<React.SetStateAction<number>>;
  previewRotation: number;
  setPreviewRotation: React.Dispatch<React.SetStateAction<number>>;
}

export function PreviewModal({
  previewFile,
  onClose,
  previewScale,
  setPreviewScale,
  previewRotation,
  setPreviewRotation,
}: PreviewModalProps) {
  if (!previewFile) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box"
    }} onClick={onClose}>
      <div style={{
        backgroundColor: "var(--c-surface)",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "750px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden"
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--c-surface)"
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--c-text)" }}>{previewFile.name}</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{formatBytes(previewFile.size)}</span>
          </div>
          
          {/* Zoom & Rotate Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Rotate Button */}
            <button 
              onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
              style={{
                background: "var(--c-bg)",
                border: "1px solid var(--border)",
                color: "var(--c-text)",
                padding: "4px 10px",
                borderRadius: "9999px",
                cursor: "pointer",
                fontSize: "0.7rem",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                outline: "none"
              }}
              title="Rotate Clockwise"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Rotate
            </button>
            
            {/* Zoom Controls */}
            <div style={{ display: "flex", alignItems: "center", background: "var(--c-bg)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "2px 4px", gap: "6px" }}>
              <button 
                onClick={() => setPreviewScale(prev => Math.max(0.5, prev - 0.15))}
                disabled={previewScale <= 0.5}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--c-text)",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: previewScale <= 0.5 ? 0.4 : 1,
                  outline: "none"
                }}
                title="Zoom Out"
              >
                -
              </button>
              <span style={{ fontSize: "0.7rem", fontWeight: "600", width: "38px", textAlign: "center", color: "var(--c-text)" }}>
                {Math.round(previewScale * 100)}%
              </span>
              <button 
                onClick={() => setPreviewScale(prev => Math.min(2.0, prev + 0.15))}
                disabled={previewScale >= 2.0}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--c-text)",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: previewScale >= 2.0 ? 0.4 : 1,
                  outline: "none"
                }}
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              lineHeight: 1,
              padding: "4px"
            }}
          >
            &times;
          </button>
        </div>
        
        {/* Body */}
        <div style={{
          padding: "20px",
          overflowY: "auto",
          flex: 1,
          backgroundColor: "color-mix(in srgb, var(--c-surface) 96%, var(--c-text))"
        }}>
          {previewFile.type.startsWith("image/") ? (
            <ImagePreviewViewer file={previewFile} scale={previewScale} rotation={previewRotation} />
          ) : previewFile.name.endsWith(".pdf") ? (
            <PdfPreviewViewer file={previewFile} scale={previewScale} rotation={previewRotation} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: "16px", textAlign: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "600", margin: "0 0 4px" }}>Preview Not Available</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  Previews are only available for PDF and image formats. 
                  Click the process button to compile and check the output!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
