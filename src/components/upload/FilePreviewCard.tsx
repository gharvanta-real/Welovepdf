import React, { useState, useEffect } from "react";
import { File } from "lucide-react";
import { formatBytes } from "./UploadHelpers";
import { getPdfjsLib } from "../../utils/pdfjs";

interface FilePreviewCardProps {
  file: File;
  idx: number;
  toolColor: string;
  onRemove: (index: number) => void;
  onPreviewClick?: (file: File) => void;
}

export function FilePreviewCard({ file, idx, toolColor, onRemove, onPreviewClick }: FilePreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [, setLoadingPdf] = useState(false);

  const fileName = file.name;
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

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
          const viewport = page.getViewport({ scale: 0.35 });
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
  
  if (file.type.startsWith("image/") && previewUrl) {
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
          <>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="pdf-badge-text">PDF</span>
          </>
        )}
        {pdfPageCount !== null && (
          <span className="pdf-page-counter-badge" style={{ position: "absolute", bottom: "6px", right: "6px", backgroundColor: "rgba(15, 23, 42, 0.8)", color: "white", fontSize: "0.68rem", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>
            {pdfPageCount} {pdfPageCount === 1 ? "Page" : "Pages"}
          </span>
        )}
      </div>
    );
  } else if (extension === "docx" || extension === "doc") {
    previewContent = (
      <div className="word-mock-preview">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="word-badge-text">WORD</span>
      </div>
    );
  } else if (extension === "xlsx" || extension === "xls") {
    previewContent = (
      <div className="excel-mock-preview">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="excel-badge-text">EXCEL</span>
      </div>
    );
  } else if (extension === "pptx" || extension === "ppt") {
    previewContent = (
      <div className="ppt-mock-preview">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="ppt-badge-text">PPT</span>
      </div>
    );
  } else if (extension === "html" || extension === "htm") {
    previewContent = (
      <div className="html-mock-preview">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="html-badge-text">HTML</span>
      </div>
    );
  } else if (extension === "txt") {
    previewContent = (
      <div className="txt-mock-preview">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="txt-badge-text">TXT</span>
      </div>
    );
  } else {
    previewContent = (
      <div className="file-type-icon-wrapper" style={{ color: toolColor }}>
        <File size={34} />
      </div>
    );
  }

  return (
    <div 
      className="canvas-file-card" 
      onClick={() => onPreviewClick && onPreviewClick(file)}
      style={{ cursor: "pointer" }}
    >
      <button 
        className="file-card-remove" 
        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
        aria-label="Remove file"
      >
        &times;
      </button>
      
      <div className="file-card-preview-box">
        {previewContent}
      </div>
      
      <div className="file-card-meta">
        <span className="file-card-name" title={fileName}>{fileName}</span>
        <span className="file-card-size">{formatBytes(file.size)}</span>
      </div>
    </div>
  );
}
