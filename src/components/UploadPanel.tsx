import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, Share2, RotateCcw, File, Download, Cloud, Plus, Image as ImageIcon } from "lucide-react";
import { getToolColor } from "./ToolIcon";
import { PdfEditor } from "./PdfEditor";
import {
  CompressSettings,
  MergeSettings,
  JpgToPdfSettings,
  PdfToJpgSettings,
  SplitSettings,
  WatermarkSettings,
  SignSettings,
  PasswordSettings,
  TranslateSettings,
  SummarizeSettings,
  BatesSettings,
  PageNumberSettings,
  CropSettings,
  CopilotSettings,
  TxtToPdfSettings,
  HtmlToPdfSettings,
  RotateSettings,
  RemoveSettings,
  ExtractSettings,
  OrganizeSettings,
  FlattenSettings,
  RepairSettings,
  WordToPdfSettings,
  ExcelToPdfSettings,
  PptToPdfSettings,
  PdfToWordSettings,
  PdfToExcelSettings,
  PdfToPptSettings,
  AnnotateSettings,
  OcrSettings,
  DefaultSettings
} from "./tool-configs";

type UploadPanelProps = {
  selectedTool: string;
  onUpload: (files: FileList, options?: any) => void;
  onBack: () => void;
  activeJob: any;
  onReset: () => void;
  onStagedChange?: (hasStaged: boolean) => void;
};

const processingSteps = [
  "Uploading files to secure workspace...",
  "Verifying catalog structure and signatures...",
  "Executing document engine pipelines...",
  "Optimizing font and vector alignments...",
  "Finalizing delivery components...",
  "Signing output with secure download keys..."
];

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}


function getAcceptAttribute(tool: string): string {
  const t = tool.toLowerCase();
  if (t === "word to pdf") return ".docx,.doc";
  if (t === "excel to pdf") return ".xlsx,.xls";
  if (t === "ppt to pdf") return ".pptx,.ppt";
  if (t === "jpg to pdf") return "image/*";
  if (t === "html to pdf") return ".html,.htm";
  if (t === "txt to pdf") return ".txt";
  return ".pdf";
}

interface FilePreviewCardProps {
  file: any;
  idx: number;
  toolColor: string;
  onRemove: (index: number) => void;
  onPreviewClick?: (file: any) => void;
}

function FilePreviewCard({ file, idx, toolColor, onRemove, onPreviewClick }: FilePreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

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
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          try {
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            }
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
        } else {
          fallbackPageCount(typedarray);
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

interface PdfPageCardProps {
  pdfDoc: any;
  pageNum: number;
  rotation: number;
  isRemoved: boolean;
  isSelected: boolean;
  onRotate: () => void;
  onRemove: () => void;
  onToggleSelect: () => void;
  toolColor: string;
  selectedTool: string;
  indexInGrid: number;
  totalGridItems: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

function PdfPageCard({
  pdfDoc,
  pageNum,
  rotation,
  isRemoved,
  isSelected,
  onRotate,
  onRemove,
  onToggleSelect,
  toolColor,
  selectedTool,
  indexInGrid,
  totalGridItems,
  onMoveLeft,
  onMoveRight,
}: PdfPageCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function renderPage() {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.35 });
        
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        setLoading(false);
      } catch (err) {
        console.error("Page render error:", err);
      }
    }
    renderPage();
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNum]);

  const showRotate = selectedTool === "Rotate PDF";
  const showRemove = selectedTool === "Remove Pages" || selectedTool === "Organize PDF";
  const showCheckbox = selectedTool === "Split PDF" || selectedTool === "Extract Pages" || selectedTool === "Organize PDF";
  const showMove = selectedTool === "Organize PDF";

  return (
    <div className={`canvas-file-card page-card ${isRemoved ? "removed" : ""} ${isSelected ? "selected" : ""}`} style={{ position: "relative" }}>
      {showCheckbox && (
        <div 
          className="page-card-checkbox-wrapper" 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          style={{ position: "absolute", top: "6px", left: "6px", zIndex: 10, cursor: "pointer", background: "white", borderRadius: "3px", padding: "2px" }}
        >
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggleSelect} 
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
        </div>
      )}
      
      <div className="file-card-preview-box page-preview-box" style={{ overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? (
          <div className="page-loading-placeholder" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
            <div className="mini-spinner" style={{ width: "16px", height: "16px", border: "2px solid #cbd5e1", borderTopColor: toolColor, borderRadius: "50%", animation: "spin 0.6s linear infinite" }}></div>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="page-canvas" 
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transition: "transform 0.2s ease-in-out",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }} 
          />
        )}
        
        {isRemoved && (
          <div className="page-removed-overlay" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(239, 68, 68, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.8rem", fontWeight: "900", zIndex: 5 }}>
            <span>EXCLUDED</span>
          </div>
        )}
      </div>
      
      <div className="file-card-meta page-meta" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "stretch" }}>
        <span className="file-card-name" style={{ fontSize: "0.78rem", fontWeight: "600", textAlign: "center" }}>Page {pageNum}</span>
        
        <div className="page-card-actions" style={{ display: "flex", gap: "4px", justifyContent: "center", width: "100%" }}>
          {showRotate && (
            <button 
              className="page-action-btn" 
              onClick={(e) => { e.stopPropagation(); onRotate(); }}
              title="Rotate 90° Clockwise"
              style={{ padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          )}
          {showRemove && (
            <button 
              className="page-action-btn delete-btn" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title={isRemoved ? "Restore Page" : "Delete Page"}
              style={{ padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", border: "1px solid var(--border)", background: isRemoved ? "var(--c-accent)" : "var(--c-surface)", color: isRemoved ? "white" : "var(--c-text)", borderRadius: "var(--radius-xs)" }}
            >
              {isRemoved ? "Restore" : "Delete"}
            </button>
          )}
          {showMove && (
            <div style={{ display: "flex", gap: "2px" }}>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
                disabled={indexInGrid === 0}
                title="Move Left"
                style={{ padding: "2px 6px", fontSize: "0.68rem", cursor: indexInGrid === 0 ? "not-allowed" : "pointer", opacity: indexInGrid === 0 ? 0.3 : 1, border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
              >
                &larr;
              </button>
              <button 
                className="page-action-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
                disabled={indexInGrid === totalGridItems - 1}
                title="Move Right"
                style={{ padding: "2px 6px", fontSize: "0.68rem", cursor: indexInGrid === totalGridItems - 1 ? "not-allowed" : "pointer", opacity: indexInGrid === totalGridItems - 1 ? 0.3 : 1, border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--c-text)", borderRadius: "var(--radius-xs)" }}
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImagePreviewViewer({ file, scale, rotation }: { file: File; scale: number; rotation: number }) {
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

function PdfPreviewViewer({ file, scale, rotation }: { file: File; scale: number; rotation: number }) {
  const [pages, setPages] = useState<number[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        setError("PDFJS library not loaded");
        setLoading(false);
        return;
      }
      try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
        }
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

export function UploadPanel({ selectedTool, onUpload, onBack, activeJob, onReset, onStagedChange }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewScale, setPreviewScale] = useState(0.95);
  const [previewRotation, setPreviewRotation] = useState(0);

  function openPreview(file: File) {
    setPreviewScale(0.95);
    setPreviewRotation(0);
    setPreviewFile(file);
  }

  // Configuration States
  const [pageOrientation, setPageOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [splitMode, setSplitMode] = useState<"ranges" | "extract">("ranges");
  const [splitRanges, setSplitRanges] = useState("1-2");
  const [pageMargin, setPageMargin] = useState<"none" | "small" | "big">("none");
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "less">("recommended");
  const [conversionMode, setConversionMode] = useState<"page" | "extract">("page");
  const [outputQuality, setOutputQuality] = useState<"normal" | "high" | "compact">("normal");
  const [mergeAll, setMergeAll] = useState(true);
  const [includeTOC, setIncludeTOC] = useState(false);
  const [fileNameStamps, setFileNameStamps] = useState(false);

  // Extended Tool Configuration States
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkColor, setWatermarkColor] = useState("#e2e8f0");
  const [watermarkOpacity, setWatermarkOpacity] = useState("0.2");
  const [signatureText, setSignatureText] = useState("Digitally Signed");
  const [signatureStyle, setSignatureStyle] = useState("cursive");
  const [pdfPassword, setPdfPassword] = useState("welovepdf");
  const [translateLang, setTranslateLang] = useState("hi");
  const [summarizeLength, setSummarizeLength] = useState<"short" | "medium" | "long">("medium");
  const [batesPrefix, setBatesPrefix] = useState("BATES-");
  const [batesStart, setBatesStart] = useState("1");
  const [pageNumberPos, setPageNumberPos] = useState("bottom-center");
  const [pageNumberSize, setPageNumberSize] = useState("10");
  const [cropMargin, setCropMargin] = useState("10");
  const [copilotMode, setCopilotMode] = useState("general");
  const [txtFontSize, setTxtFontSize] = useState("10");
  const [htmlPageSize, setHtmlPageSize] = useState("letter");

  // Custom configuration states for remaining tools
  const [flattenMode, setFlattenMode] = useState<"all" | "forms" | "annotations">("all");
  const [repairMode, setRepairMode] = useState<"streams" | "tables" | "catalog">("streams");
  const [repairCompatibility, setRepairCompatibility] = useState("1.7");
  const [wordMargins, setWordMargins] = useState<"standard" | "narrow" | "wide">("standard");
  const [wordBookmarks, setWordBookmarks] = useState(true);
  const [wordLinkColors, setWordLinkColors] = useState(true);
  const [excelSheetRendering, setExcelSheetRendering] = useState<"fit-width" | "actual-size" | "fit-all-columns">("fit-width");
  const [excelOrientation, setExcelOrientation] = useState<"portrait" | "landscape">("portrait");
  const [excelGridlines, setExcelGridlines] = useState(true);
  const [pptSlidesLayout, setPptSlidesLayout] = useState<"1-slide" | "2-slides" | "4-slides">("1-slide");
  const [pptOrientation, setPptOrientation] = useState<"landscape" | "portrait">("landscape");
  const [pptNotes, setPptNotes] = useState(false);
  const [pdfToWordMode, setPdfToWordMode] = useState<"flowing" | "frames" | "text-only">("flowing");
  const [pdfToWordOcr, setPdfToWordOcr] = useState(true);
  const [pdfToWordLang, setPdfToWordLang] = useState("en");
  const [pdfToExcelData, setPdfToExcelData] = useState<"all-tables" | "single-sheet" | "table-per-page">("all-tables");
  const [pdfToExcelSeparator, setPdfToExcelSeparator] = useState<"period" | "comma">("period");
  const [pdfToExcelDetectNum, setPdfToExcelDetectNum] = useState(true);
  const [pdfToPptLayout, setPdfToPptLayout] = useState<"auto" | "page-image">("auto");
  const [pdfToPptBorders, setPdfToPptBorders] = useState(true);
  const [pdfToPptCompress, setPdfToPptCompress] = useState(true);
  const [annotateTool, setAnnotateTool] = useState<"highlight" | "pen" | "text-comment">("highlight");
  const [annotateColor, setAnnotateColor] = useState("#fef08a");
  const [annotateText, setAnnotateText] = useState("Reviewed and approved");
  const [annotateOpacity, setAnnotateOpacity] = useState("0.5");
  const [annotateThickness, setAnnotateThickness] = useState("2");
  const [ocrEngineMode, setOcrEngineMode] = useState<"fast" | "balanced" | "quality">("balanced");
  const [ocrLanguage, setOcrLanguage] = useState("en");

  // Page Grid States (for Rotate, Remove, Organize, Extract, Split)
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(0);
  const [rotationMap, setRotationMap] = useState<{ [pageNum: number]: number }>({});
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  const isPageOrientedTool = [
    "Rotate PDF",
    "Remove Pages",
    "Organize PDF",
    "Split PDF",
    "Extract Pages"
  ].includes(selectedTool);

  const isVisualEditorTool = [
    "Edit PDF",
    "PDF Annotator",
    "Sign PDF",
    "Watermark PDF",
    "Crop PDF",
    "Page Numbers",
    "Bates Numbering"
  ].includes(selectedTool);

  const toolColor = getToolColor(selectedTool);

  // Load PDF Document for Interactive Page Grid
  useEffect(() => {
    if (stagedFiles && stagedFiles.length > 0) {
      const file = stagedFiles[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" && isPageOrientedTool) {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdfjsLib = (window as any).pdfjsLib;
          if (pdfjsLib) {
            try {
              if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
              }
              const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
              setPdfDoc(pdf);
              setTotalPdfPages(pdf.numPages);
              
              const order = [];
              const selected = new Set<number>();
              for (let i = 1; i <= pdf.numPages; i++) {
                order.push(i);
                selected.add(i);
              }
              setPageOrder(order);
              setSelectedPages(selected);
            } catch (err) {
              console.error("PDF load error for interactive layout:", err);
            }
          }
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        setPdfDoc(null);
        setTotalPdfPages(0);
      }
    } else {
      setPdfDoc(null);
      setTotalPdfPages(0);
      setRotationMap({});
      setRemovedPages(new Set());
      setSelectedPages(new Set());
      setPageOrder([]);
    }
  }, [stagedFiles, selectedTool]);

  // Page Grid Callbacks
  function rotatePage(pageNum: number) {
    setRotationMap(prev => {
      const current = prev[pageNum] || 0;
      return { ...prev, [pageNum]: (current + 90) % 360 };
    });
  }

  function toggleRemovePage(pageNum: number) {
    setRemovedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  }

  function toggleSelectPage(pageNum: number) {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  }

  function movePage(index: number, direction: "left" | "right") {
    setPageOrder(prev => {
      const next = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
      }
      return next;
    });
  }

  useEffect(() => {
    if (activeJob?.status === "Processing") {
      setStepIdx(0);
      const interval = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % processingSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeJob?.status]);

  function handleFilesSelected(files: FileList) {
    if (!files || files.length === 0) return;
    setStagedFiles(Array.from(files));
    onStagedChange?.(true);
  }

  function appendStagedFiles(files: FileList) {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setStagedFiles((prev) => {
      const updated = prev ? [...prev, ...newFiles] : newFiles;
      onStagedChange?.(true);
      return updated;
    });
  }

  function removeStagedFile(index: number) {
    if (!stagedFiles) return;
    const updated = stagedFiles.filter((_, idx) => idx !== index);
    if (updated.length === 0) {
      setStagedFiles(null);
      onReset();
      onStagedChange?.(false);
    } else {
      setStagedFiles(updated);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function triggerAddMoreInput() {
    addMoreInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      handleFilesSelected(event.target.files);
    }
  }

  function handleAddMoreChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      appendStagedFiles(event.target.files);
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    if (event.dataTransfer.files) {
      handleFilesSelected(event.dataTransfer.files);
    }
  }

  function runProcess() {
    if (!stagedFiles || stagedFiles.length === 0) return;
    
    const dataTransfer = new DataTransfer();
    stagedFiles.forEach(file => dataTransfer.items.add(file));
    
    const options: any = {};
    options.splitMode = splitMode;
    options.splitRanges = splitRanges;
    options.compressionLevel = compressionLevel;
    options.fileNameStamps = fileNameStamps ? "true" : "false";
    options.includeTOC = includeTOC ? "true" : "false";
    options.watermarkText = watermarkText;
    options.watermarkColor = watermarkColor;
    options.watermarkOpacity = watermarkOpacity;
    options.signatureText = signatureText;
    options.signatureStyle = signatureStyle;
    options.pdfPassword = pdfPassword;
    options.translateLang = translateLang;
    options.summarizeLength = summarizeLength;
    options.batesPrefix = batesPrefix;
    options.batesStart = batesStart;
    options.pageNumberPos = pageNumberPos;
    options.pageNumberSize = pageNumberSize;
    options.cropMargin = cropMargin;
    options.copilotMode = copilotMode;
    options.txtFontSize = txtFontSize;
    options.htmlPageSize = htmlPageSize;

    // Collect options for remaining tools
    options.flattenMode = flattenMode;
    options.repairMode = repairMode;
    options.repairCompatibility = repairCompatibility;
    options.wordMargins = wordMargins;
    options.wordBookmarks = wordBookmarks ? "true" : "false";
    options.wordLinkColors = wordLinkColors ? "true" : "false";
    options.excelSheetRendering = excelSheetRendering;
    options.excelOrientation = excelOrientation;
    options.excelGridlines = excelGridlines ? "true" : "false";
    options.pptSlidesLayout = pptSlidesLayout;
    options.pptOrientation = pptOrientation;
    options.pptNotes = pptNotes ? "true" : "false";
    options.pdfToWordMode = pdfToWordMode;
    options.pdfToWordOcr = pdfToWordOcr ? "true" : "false";
    options.pdfToWordLang = pdfToWordLang;
    options.pdfToExcelData = pdfToExcelData;
    options.pdfToExcelSeparator = pdfToExcelSeparator;
    options.pdfToExcelDetectNum = pdfToExcelDetectNum ? "true" : "false";
    options.pdfToPptLayout = pdfToPptLayout;
    options.pdfToPptBorders = pdfToPptBorders ? "true" : "false";
    options.pdfToPptCompress = pdfToPptCompress ? "true" : "false";
    options.annotateTool = annotateTool;
    options.annotateColor = annotateColor;
    options.annotateText = annotateText;
    options.annotateOpacity = annotateOpacity;
    options.annotateThickness = annotateThickness;
    options.ocrEngineMode = ocrEngineMode;
    options.ocrLanguage = ocrLanguage;


    if (selectedTool === "Rotate PDF") {
      const rotParts = [];
      for (const pNum in rotationMap) {
        if (rotationMap[pNum] !== 0) {
          rotParts.push(`${pNum}:${rotationMap[pNum]}`);
        }
      }
      options.rotatePages = rotParts.join(",");
      options.rotateAngle = "90";
    } else if (selectedTool === "Remove Pages") {
      options.removePages = Array.from(removedPages).join(",");
    } else if (selectedTool === "Organize PDF") {
      options.pageOrder = pageOrder.join(",");
    } else if (selectedTool === "Extract Pages") {
      options.extractPages = Array.from(selectedPages).join(",");
    }

    onUpload(dataTransfer.files, options);
  }

  function clearSelection() {
    setStagedFiles(null);
    onReset();
    onStagedChange?.(false);
  }

  function handleShare() {
    if (activeJob?.downloadUrl) {
      const fullUrl = window.location.origin + activeJob.downloadUrl;
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  // Get block color per tool for Stitch design hero
  function getToolBlockColor(tool: string): string {
    const t = tool.toLowerCase();
    if (t.includes("merge")) return "#D6C4FF"; // lilac
    if (t.includes("split")) return "#FFBDAE"; // coral
    if (t.includes("compress")) return "#FFC7C2"; // pink
    if (t.includes("sign") || t.includes("esign")) return "#ADEFD1"; // mint
    if (t.includes("rotate") || t.includes("organize")) return "#D3F57B"; // lime
    if (t.includes("watermark") || t.includes("annotate")) return "#D6C4FF"; // lilac
    if (t.includes("protect") || t.includes("password")) return "#ADEFD1"; // mint
    if (t.includes("unlock")) return "#FFC7C2"; // pink
    if (t.includes("word") || t.includes("excel") || t.includes("ppt")) return "#D3F57B"; // lime
    if (t.includes("jpg") || t.includes("image")) return "#FFC7C2"; // pink
    if (t.includes("ocr") || t.includes("translate") || t.includes("summarize") || t.includes("copilot")) return "#ADEFD1"; // mint
    if (t.includes("extract") || t.includes("remove") || t.includes("page")) return "#FFBDAE"; // coral
    if (t.includes("bates") || t.includes("number") || t.includes("crop")) return "#D3F57B"; // lime
    if (t.includes("flatten") || t.includes("repair")) return "#FFF9E5"; // cream
    return "#D6C4FF"; // lilac default
  }

  function getToolHeroDescription(tool: string): string {
    const t = tool.toLowerCase();
    if (t.includes("merge")) return "Combine multiple PDF files into a single, perfectly structured document. Fast, secure, and free.";
    if (t.includes("split")) return "Extract specific pages or break down massive documents into smaller files instantly. Professional-grade tool for creators and businesses.";
    if (t.includes("compress")) return "Reduce PDF file size without losing quality. Optimized compression for sharing, email, and archiving.";
    if (t.includes("sign")) return "Electronically sign PDFs with your custom signature. Legally binding and secure digital signing workflow.";
    if (t.includes("rotate")) return "Rotate one or all pages in your PDF to any angle. Fix scanned documents or adjust orientation instantly.";
    if (t.includes("organize")) return "Reorder, rearrange, and organize PDF pages with a simple drag-and-drop interface. Full control over page order.";
    if (t.includes("watermark")) return "Add custom text or image watermarks to your PDF. Protect your documents with branded overlays.";
    if (t.includes("annotate")) return "Highlight, comment, and annotate PDFs directly in the browser. Collaborate and review with precision.";
    if (t.includes("protect")) return "Encrypt your PDF with a password. Prevent unauthorized access and keep your documents secure.";
    if (t.includes("unlock")) return "Remove password protection from PDF files you have the right to access. Fast and secure.";
    if (t.includes("word")) return "Convert Word documents to PDF format instantly. Preserve formatting, fonts, and layouts perfectly.";
    if (t.includes("excel")) return "Turn Excel spreadsheets into professional PDF documents. All charts, data, and formatting preserved.";
    if (t.includes("ppt")) return "Convert PowerPoint presentations to PDF. Every slide, animation note, and image preserved exactly.";
    if (t.includes("jpg")) return "Transform images into high-quality PDF documents. Supports JPG, PNG, and other image formats.";
    if (t.includes("ocr")) return "Extract text from scanned PDFs with AI-powered OCR. Convert image-based PDFs to searchable, editable text.";
    if (t.includes("translate")) return "Translate your PDF documents into dozens of languages. AI-powered translation preserving layout and formatting.";
    if (t.includes("summarize")) return "Get AI-generated summaries of lengthy PDF documents. Extract key insights in seconds.";
    if (t.includes("extract")) return "Extract specific pages from your PDF into a new file. Select exactly which pages you want to keep.";
    if (t.includes("remove")) return "Remove unwanted pages from your PDF document. Select pages to delete and rebuild your document.";
    if (t.includes("crop")) return "Crop and resize PDF pages to remove margins, trim content, or redefine the page boundary.";
    if (t.includes("flatten")) return "Flatten form fields, annotations, and layers into a single non-editable PDF layer.";
    if (t.includes("repair")) return "Repair corrupted or damaged PDF files. Recover content from broken documents automatically.";
    if (t.includes("copilot")) return "Your AI-powered document assistant. Chat with your PDF, ask questions, and get intelligent answers.";
    return "Professional PDF processing tool. Fast, secure, and easy to use directly in your browser.";
  }

  function getToolEyebrow(tool: string): string {
    const t = tool.toLowerCase();
    if (t.includes("merge") || t.includes("split") || t.includes("compress") || t.includes("rotate") || t.includes("organize") || t.includes("extract") || t.includes("remove")) {
      return "PDF TOOLS / " + tool.replace(" PDF", "").replace("PDF ", "").toUpperCase();
    }
    if (t.includes("word") || t.includes("excel") || t.includes("ppt") || t.includes("jpg") || t.includes("html") || t.includes("txt")) {
      return "CONVERT / " + tool.toUpperCase();
    }
    if (t.includes("sign") || t.includes("protect") || t.includes("unlock") || t.includes("watermark")) {
      return "SECURITY / " + tool.replace(" PDF", "").toUpperCase();
    }
    if (t.includes("ocr") || t.includes("translate") || t.includes("summarize") || t.includes("copilot") || t.includes("annotate")) {
      return "AI TOOLS / " + tool.replace(" PDF", "").toUpperCase();
    }
    return "PDF TOOLS / " + tool.replace(" PDF", "").toUpperCase();
  }

  // Feature data per tool
  function getToolFeatures(tool: string): { icon: string; title: string; desc: string; color: string }[] {
    const t = tool.toLowerCase();
    const base = [
      { icon: "🛡️", title: "Secure Processing", desc: "Files are processed locally in your browser whenever possible or encrypted end-to-end and deleted immediately after processing.", color: "#ADEFD1" },
      { icon: "⚡", title: "Instant Results", desc: "Our high-speed engine processes multi-gigabyte PDFs in seconds. No waiting for server-side queues or slow rendering.", color: "#FFC7C2" },
      { icon: "✨", title: "Zero Quality Loss", desc: "Every font, image, and vector element is preserved exactly as it is in the original file. We never compromise quality.", color: "#D3F57B" }
    ];
    if (t.includes("merge")) return [
      { icon: "🛡️", title: "Secure Processing", desc: "Your files are encrypted and automatically deleted after 2 hours.", color: "#ADEFD1" },
      { icon: "⚡", title: "Fast Merging", desc: "Our high-performance servers combine your PDFs in seconds, regardless of file count.", color: "#FFC7C2" },
      { icon: "🌍", title: "Easy Access", desc: "Works in any web browser, on any device, anywhere in the world.", color: "#D3F57B" }
    ];
    if (t.includes("split")) return [
      { icon: "🛡️", title: "Secure Processing", desc: "Files are processed locally in your browser whenever possible, encrypted end-to-end.", color: "#ADEFD1" },
      { icon: "⚡", title: "Instant Extraction", desc: "Our high-speed engine splits multi-gigabyte PDFs in seconds. No server-side queues.", color: "#FFC7C2" },
      { icon: "🎯", title: "Zero Quality Loss", desc: "Every font, image, and vector element is preserved exactly as it is in the original file.", color: "#D3F57B" }
    ];
    if (t.includes("compress")) return [
      { icon: "📦", title: "Smart Compression", desc: "Intelligently compresses images and streams while preserving document fidelity.", color: "#ADEFD1" },
      { icon: "⚡", title: "Instant Results", desc: "Compress even large PDFs in seconds with our optimized pipeline.", color: "#D3F57B" },
      { icon: "🔒", title: "Privacy First", desc: "Files are automatically deleted after processing. We never store your documents.", color: "#FFC7C2" }
    ];
    return base;
  }

  // Illustration SVGs per tool
  function getToolIllustration(tool: string, blockColor: string): React.ReactElement {
    const t = tool.toLowerCase();
    if (t.includes("merge")) {
      return (
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: "160px", height: "210px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-8deg) translateX(-30px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
            <div style={{ width: "100%", height: "50%", background: "#f5f5f5", borderRadius: "6px" }}></div>
            <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
            <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
            <div style={{ height: "6px", width: "55%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          </div>
          <div style={{ position: "absolute", width: "160px", height: "210px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(4deg) translateX(30px) translateY(20px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>⊕</span>
              <span style={{ fontSize: "10px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace" }}>MERGED</span>
            </div>
            <div style={{ width: "100%", height: "40%", background: blockColor + "40", borderRadius: "6px", border: `2px dashed ${blockColor}` }}></div>
            <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
            <div style={{ height: "6px", width: "66%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          </div>
        </div>
      );
    }
    if (t.includes("split")) {
      return (
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: "150px", height: "200px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-6deg) translateX(-25px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
            <div style={{ width: "100%", height: "50%", background: "#f5f5f5", borderRadius: "6px" }}></div>
            <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
            <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          </div>
          <div style={{ position: "absolute", width: "150px", height: "200px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(3deg) translateX(30px) translateY(15px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "16px" }}>✂️</span>
              <span style={{ fontSize: "9px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace" }}>PAGE 12-24</span>
            </div>
            <div style={{ width: "100%", height: "45%", background: blockColor + "40", borderRadius: "6px", border: `2px dashed ${blockColor}` }}></div>
            <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
            <div style={{ height: "6px", width: "66%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          </div>
        </div>
      );
    }
    // Generic illustration for other tools
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: "155px", height: "205px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-5deg) translateX(-20px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
          <div style={{ width: "100%", height: "48%", background: "#f5f5f5", borderRadius: "6px" }}></div>
          <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "50%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
        <div style={{ position: "absolute", width: "155px", height: "205px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(4deg) translateX(28px) translateY(18px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "18px", filter: "grayscale(1)" }}>📄</span>
            <span style={{ fontSize: "9px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.5px" }}>OUTPUT</span>
          </div>
          <div style={{ width: "100%", height: "40%", background: blockColor + "50", borderRadius: "6px", border: `1.5px dashed ${blockColor}` }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "70%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
      </div>
    );
  }

  const blockColor = getToolBlockColor(selectedTool);
  const heroDesc = getToolHeroDescription(selectedTool);
  const eyebrow = getToolEyebrow(selectedTool);
  const features = getToolFeatures(selectedTool);
  const heroIllustration = getToolIllustration(selectedTool, blockColor);

  // Determine current display mode
  let viewMode: "idle" | "staged" | "processing" | "completed" = "idle";
  if (activeJob?.status === "Processing") {
    viewMode = "processing";
  } else if (activeJob?.status === "Done") {
    viewMode = "completed";
  } else if (stagedFiles && stagedFiles.length > 0) {
    viewMode = "staged";
  }

  // Render options sidebar content dynamically
  // Render options sidebar content dynamically
  function renderOptionsSidebar() {
    const isCompress = selectedTool === "Compress PDF";
    const isMerge = selectedTool === "Merge PDF";
    const isJpgToPdf = selectedTool === "JPG to PDF";
    const isPdfToJpg = selectedTool === "PDF to JPG";
    const isSplit = selectedTool === "Split PDF";
    const isWatermark = selectedTool === "Watermark PDF";
    const isSign = selectedTool === "Sign PDF";
    const isProtect = selectedTool === "Protect PDF";
    const isUnlock = selectedTool === "Unlock PDF";
    const isTranslate = selectedTool === "Translate PDF";
    const isSummarize = selectedTool === "Summarize PDF";
    const isBates = selectedTool === "Bates Numbering";
    const isPageNumber = selectedTool === "Page Numbers";
    const isCrop = selectedTool === "Crop PDF";
    const isCopilot = selectedTool === "AI Document Copilot";
    const isTxtToPdf = selectedTool === "TXT to PDF";
    const isHtmlToPdf = selectedTool === "HTML to PDF";

    // New tools variables
    const isFlatten = selectedTool === "Flatten PDF";
    const isRepair = selectedTool === "Repair PDF";
    const isWordToPdf = selectedTool === "Word to PDF";
    const isExcelToPdf = selectedTool === "Excel to PDF";
    const isPptToPdf = selectedTool === "PPT to PDF";
    const isPdfToWord = selectedTool === "PDF to Word";
    const isPdfToExcel = selectedTool === "PDF to Excel";
    const isPdfToPpt = selectedTool === "PDF to PPT";
    const isAnnotate = selectedTool === "PDF Annotator";
    const isOcr = selectedTool === "PDF OCR";

    return (
      <>
        <h3 className="sidebar-heading">{selectedTool} Options</h3>
        <div style={{ overflowY: "auto", flex: 1, paddingBottom: "12px" }}>

        {isCompress && (
          <CompressSettings
            compressionLevel={compressionLevel}
            setCompressionLevel={setCompressionLevel}
            toolColor={toolColor}
          />
        )}

        {isMerge && (
          <MergeSettings
            fileNameStamps={fileNameStamps}
            setFileNameStamps={setFileNameStamps}
            includeTOC={includeTOC}
            setIncludeTOC={setIncludeTOC}
          />
        )}

        {isJpgToPdf && (
          <JpgToPdfSettings
            pageOrientation={pageOrientation}
            setPageOrientation={setPageOrientation}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageMargin={pageMargin}
            setPageMargin={setPageMargin}
            mergeAll={mergeAll}
            setMergeAll={setMergeAll}
            toolColor={toolColor}
          />
        )}

        {isPdfToJpg && (
          <PdfToJpgSettings
            conversionMode={conversionMode}
            setConversionMode={setConversionMode}
            toolColor={toolColor}
          />
        )}

        {isSplit && (
          <SplitSettings
            splitMode={splitMode}
            setSplitMode={setSplitMode}
            splitRanges={splitRanges}
            setSplitRanges={setSplitRanges}
            toolColor={toolColor}
          />
        )}

        {isWatermark && (
          <WatermarkSettings
            watermarkText={watermarkText}
            setWatermarkText={setWatermarkText}
            watermarkColor={watermarkColor}
            setWatermarkColor={setWatermarkColor}
            watermarkOpacity={watermarkOpacity}
            setWatermarkOpacity={setWatermarkOpacity}
          />
        )}

        {isSign && (
          <SignSettings
            signatureText={signatureText}
            setSignatureText={setSignatureText}
            signatureStyle={signatureStyle}
            setSignatureStyle={setSignatureStyle}
          />
        )}

        {(isProtect || isUnlock) && (
          <PasswordSettings
            pdfPassword={pdfPassword}
            setPdfPassword={setPdfPassword}
            isProtect={isProtect}
          />
        )}

        {isTranslate && (
          <TranslateSettings
            translateLang={translateLang}
            setTranslateLang={setTranslateLang}
          />
        )}

        {isSummarize && (
          <SummarizeSettings
            summarizeLength={summarizeLength}
            setSummarizeLength={setSummarizeLength}
            toolColor={toolColor}
          />
        )}

        {isBates && (
          <BatesSettings
            batesPrefix={batesPrefix}
            setBatesPrefix={setBatesPrefix}
            batesStart={batesStart}
            setBatesStart={setBatesStart}
          />
        )}

        {isPageNumber && (
          <PageNumberSettings
            pageNumberPos={pageNumberPos}
            setPageNumberPos={setPageNumberPos}
            pageNumberSize={pageNumberSize}
            setPageNumberSize={setPageNumberSize}
          />
        )}

        {isCrop && (
          <CropSettings
            cropMargin={cropMargin}
            setCropMargin={setCropMargin}
          />
        )}

        {isCopilot && (
          <CopilotSettings
            copilotMode={copilotMode}
            setCopilotMode={setCopilotMode}
            toolColor={toolColor}
          />
        )}

        {isTxtToPdf && (
          <TxtToPdfSettings
            txtFontSize={txtFontSize}
            setTxtFontSize={setTxtFontSize}
          />
        )}

        {isHtmlToPdf && (
          <HtmlToPdfSettings
            htmlPageSize={htmlPageSize}
            setHtmlPageSize={setHtmlPageSize}
          />
        )}

        {selectedTool === "Rotate PDF" && (
          <RotateSettings
            totalPdfPages={totalPdfPages}
            rotationMap={rotationMap}
            setRotationMap={setRotationMap}
          />
        )}

        {selectedTool === "Remove Pages" && (
          <RemoveSettings
            removedPages={removedPages}
            setRemovedPages={setRemovedPages}
          />
        )}

        {selectedTool === "Extract Pages" && (
          <ExtractSettings
            selectedPages={selectedPages}
            setSelectedPages={setSelectedPages}
            totalPdfPages={totalPdfPages}
          />
        )}

        {selectedTool === "Organize PDF" && (
          <OrganizeSettings
            setPageOrder={setPageOrder}
            totalPdfPages={totalPdfPages}
          />
        )}

        {isFlatten && (
          <FlattenSettings
            flattenMode={flattenMode}
            setFlattenMode={setFlattenMode}
            toolColor={toolColor}
          />
        )}

        {isRepair && (
          <RepairSettings
            repairMode={repairMode}
            setRepairMode={setRepairMode}
            repairCompatibility={repairCompatibility}
            setRepairCompatibility={setRepairCompatibility}
            toolColor={toolColor}
          />
        )}

        {isWordToPdf && (
          <WordToPdfSettings
            wordMargins={wordMargins}
            setWordMargins={setWordMargins}
            wordBookmarks={wordBookmarks}
            setWordBookmarks={setWordBookmarks}
            wordLinkColors={wordLinkColors}
            setWordLinkColors={setWordLinkColors}
          />
        )}

        {isExcelToPdf && (
          <ExcelToPdfSettings
            excelOrientation={excelOrientation}
            setExcelOrientation={setExcelOrientation}
            excelSheetRendering={excelSheetRendering}
            setExcelSheetRendering={setExcelSheetRendering}
            excelGridlines={excelGridlines}
            setExcelGridlines={setExcelGridlines}
            toolColor={toolColor}
          />
        )}

        {isPptToPdf && (
          <PptToPdfSettings
            pptOrientation={pptOrientation}
            setPptOrientation={setPptOrientation}
            pptSlidesLayout={pptSlidesLayout}
            setPptSlidesLayout={setPptSlidesLayout}
            pptNotes={pptNotes}
            setPptNotes={setPptNotes}
            toolColor={toolColor}
          />
        )}

        {isPdfToWord && (
          <PdfToWordSettings
            pdfToWordMode={pdfToWordMode}
            setPdfToWordMode={setPdfToWordMode}
            pdfToWordOcr={pdfToWordOcr}
            setPdfToWordOcr={setPdfToWordOcr}
            pdfToWordLang={pdfToWordLang}
            setPdfToWordLang={setPdfToWordLang}
            toolColor={toolColor}
          />
        )}

        {isPdfToExcel && (
          <PdfToExcelSettings
            pdfToExcelData={pdfToExcelData}
            setPdfToExcelData={setPdfToExcelData}
            pdfToExcelSeparator={pdfToExcelSeparator}
            setPdfToExcelSeparator={setPdfToExcelSeparator}
            pdfToExcelDetectNum={pdfToExcelDetectNum}
            setPdfToExcelDetectNum={setPdfToExcelDetectNum}
            toolColor={toolColor}
          />
        )}

        {isPdfToPpt && (
          <PdfToPptSettings
            pdfToPptLayout={pdfToPptLayout}
            setPdfToPptLayout={setPdfToPptLayout}
            pdfToPptBorders={pdfToPptBorders}
            setPdfToPptBorders={setPdfToPptBorders}
            pdfToPptCompress={pdfToPptCompress}
            setPdfToPptCompress={setPdfToPptCompress}
            toolColor={toolColor}
          />
        )}

        {isAnnotate && (
          <AnnotateSettings
            annotateTool={annotateTool}
            setAnnotateTool={setAnnotateTool}
            annotateColor={annotateColor}
            setAnnotateColor={setAnnotateColor}
            annotateText={annotateText}
            setAnnotateText={setAnnotateText}
            annotateOpacity={annotateOpacity}
            setAnnotateOpacity={setAnnotateOpacity}
            annotateThickness={annotateThickness}
            setAnnotateThickness={setAnnotateThickness}
            toolColor={toolColor}
          />
        )}

        {isOcr && (
          <OcrSettings
            ocrEngineMode={ocrEngineMode}
            setOcrEngineMode={setOcrEngineMode}
            ocrLanguage={ocrLanguage}
            setOcrLanguage={setOcrLanguage}
            toolColor={toolColor}
          />
        )}

        {!isCompress && !isMerge && !isJpgToPdf && !isPdfToJpg && !isSplit && 
         !isWatermark && !isSign && !isProtect && !isUnlock && !isTranslate && !isSummarize && 
         !isBates && !isPageNumber && !isCrop && !isCopilot && !isTxtToPdf && !isHtmlToPdf && 
         !isFlatten && !isRepair && !isWordToPdf && !isExcelToPdf && !isPptToPdf && 
         !isPdfToWord && !isPdfToExcel && !isPdfToPpt && !isAnnotate && !isOcr && 
         selectedTool !== "Rotate PDF" && selectedTool !== "Remove Pages" && 
         selectedTool !== "Extract Pages" && selectedTool !== "Organize PDF" && (
           <DefaultSettings
             outputQuality={outputQuality}
             setOutputQuality={setOutputQuality}
             toolColor={toolColor}
           />
        )}

        </div>
        <div className="sidebar-action-footer">
          <button 
            className="primary-button process-sidebar-btn" 
            onClick={runProcess}
          >
            {selectedTool.toUpperCase()} →
          </button>
          <button className="quiet-button cancel-sidebar-btn" onClick={clearSelection}>
            Cancel & Back
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#7e7576", margin: "4px 0 0", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 320 }}>No registration required</p>
        </div>
      </>
    );
  }

  // Centered wrapper for selection (idle) and loading (processing) states — Stitch Design
  if (viewMode === "idle" || viewMode === "processing") {
    return (
      <div style={{ width: "100%", overflowY: "auto" }}>
        {viewMode === "idle" ? (
          <>
            {/* ── HERO SECTION: Colored block card ── */}
            <section style={{ padding: "16px 24px 0" }}>
              <div style={{
                background: blockColor,
                borderRadius: "16px",
                padding: "48px 64px",
                display: "flex",
                alignItems: "center",
                gap: "48px",
                overflow: "hidden",
                position: "relative",
                minHeight: "380px"
              }}>
                {/* Left content */}
                <div style={{ flex: "0 0 50%", zIndex: 1 }}>
                  <span style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "13px",
                    letterSpacing: "0.5px",
                    color: "rgba(0,0,0,0.55)",
                    display: "block",
                    marginBottom: "16px",
                    fontWeight: 400
                  }}>{eyebrow}</span>

                  <h1 style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "clamp(40px, 5vw, 72px)",
                    lineHeight: 1.05,
                    fontWeight: 340,
                    color: "#000000",
                    margin: "0 0 24px",
                    letterSpacing: "-1.5px"
                  }}>{selectedTool}</h1>

                  <p style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "18px",
                    lineHeight: "1.55",
                    color: "rgba(0,0,0,0.70)",
                    maxWidth: "420px",
                    margin: "0 0 32px",
                    fontWeight: 320
                  }}>{heroDesc}</p>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", position: "relative" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                      style={{
                        background: "#000000",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "16px 36px",
                        fontSize: "17px",
                        fontWeight: 480,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "opacity 0.15s ease",
                        letterSpacing: "-0.1px"
                      }}
                      onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
                      onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                    >
                      Select {selectedTool.includes("to PDF") ? selectedTool.replace(" to PDF", "") : "PDF"} File
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                      </svg>
                    </button>

                    {/* Dropdown button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                      style={{
                        background: "rgba(0,0,0,0.08)",
                        color: "#000000",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "16px 20px",
                        fontSize: "16px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        transition: "background 0.15s"
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = "rgba(0,0,0,0.14)")}
                      onMouseOut={e => (e.currentTarget.style.background = "rgba(0,0,0,0.08)")}
                    >
                      <ChevronDown size={18} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                      <div style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        width: "220px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #E6E6E6",
                        overflow: "hidden",
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column"
                      }} onClick={(e) => e.stopPropagation()}>
                        <button className="dropdown-item" onClick={() => { triggerFileInput(); setIsDropdownOpen(false); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                          <span>From device</span>
                        </button>
                        <button className="dropdown-item" onClick={() => { alert("Dropbox coming soon!"); setIsDropdownOpen(false); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0061ff"><path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 16l6-4-6-4-6 4 6 4zm12 0l6-4-6-4-6 4 6 4zM12 13v6l-6 4V17l6-4zm0 0v6l6 4V17l-6-4z"/></svg>
                          <span>From Dropbox</span>
                        </button>
                        <button className="dropdown-item" onClick={() => { alert("Google Drive coming soon!"); setIsDropdownOpen(false); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 14.5l3.5-6h13l-3.5 6H2z" fill="#00a859"/><path d="M8.5 2.5l3.5 6H22l-3.5-6H8.5z" fill="#ffc72c"/><path d="M15 8.5l3.5 6-6.5 11.5-3.5-6 6.5-11.5z" fill="#0066b3"/></svg>
                          <span>From Google Drive</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    style={{ display: "none" }}
                    accept={getAcceptAttribute(selectedTool)}
                  />
                </div>

                {/* Right illustration */}
                <div
                  style={{
                    flex: "1",
                    height: "320px",
                    position: "relative"
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Blurred backdrop blob */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(24px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    transform: "rotate(2deg) scale(1.04)"
                  }}></div>
                  {heroIllustration}
                  <div style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "12px",
                    color: "rgba(0,0,0,0.45)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 320,
                    whiteSpace: "nowrap"
                  }}>or drop files here</div>
                </div>
              </div>
            </section>

            {/* ── FEATURES SECTION ── */}
            <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "64px" }}>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  letterSpacing: "0.8px",
                  color: "rgba(0,0,0,0.45)",
                  display: "block",
                  marginBottom: "16px",
                  textTransform: "uppercase"
                }}>EFFICIENCY REDEFINED</span>
                <h2 style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "clamp(32px, 4vw, 52px)",
                  fontWeight: 340,
                  color: "#000000",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                  margin: "0 auto",
                  maxWidth: "600px"
                }}>High-fidelity processing without complexity.</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px" }}>
                {features.map((feat, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: feat.color,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      flexShrink: 0
                    }}>{feat.icon}</div>
                    <h3 style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: "20px",
                      fontWeight: 540,
                      color: "#000000",
                      margin: 0
                    }}>{feat.title}</h3>
                    <p style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#4c4546",
                      margin: 0,
                      fontWeight: 320
                    }}>{feat.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── NAVY CTA SECTION ── */}
            <section style={{
              background: "#10162F",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "24px"
            }}>
              <p style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "18px",
                color: "rgba(255,255,255,0.65)",
                margin: 0,
                fontWeight: 320
              }}>Ready to <span style={{ color: "#ADEFD1" }}>process</span> your <span style={{ color: "#D3F57B" }}>documents?</span></p>
              <button
                onClick={triggerFileInput}
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "18px 48px",
                  fontSize: "18px",
                  fontWeight: 480,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                  letterSpacing: "-0.1px"
                }}
                onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Start {selectedTool} Now
              </button>
            </section>
          </>
        ) : (
          /* Processing state */
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: "24px",
            padding: "48px"
          }}>
            <div style={{
              width: "64px", height: "64px",
              borderRadius: "50%",
              border: `3px solid ${blockColor}`,
              borderTopColor: "#000000",
              animation: "spin 0.8s linear infinite"
            }}></div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, color: "#000000", margin: 0 }}>Processing your request</h3>
            <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "16px", color: "#4c4546", margin: 0, fontWeight: 320 }}>{processingSteps[stepIdx]}</p>
          </div>
        )}
      </div>
    );
  }

  // Full bleed viewport container for staged and completed states — Stitch Split Layout
  return (
    <div className="workspace-full-bleed-container animate-fade-in">
      {viewMode === "staged" && stagedFiles && stagedFiles.length > 0 && isVisualEditorTool ? (
        <PdfEditor
          file={stagedFiles[0]}
          selectedTool={selectedTool}
          onClose={onBack}
          onSave={(files, options) => {
            onUpload(files, options);
          }}
        />
      ) : viewMode === "staged" && stagedFiles ? (
        <div style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "stretch",
          background: "#f9f9f9"
        }}>
          {/* ── LEFT: Settings Panel (Stitch style) ── */}
          <div style={{
            width: "320px",
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
            background: "#F5F5F5",
            borderRight: "1px solid #E6E6E6",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Panel header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #E6E6E6",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <button
                onClick={() => { clearSelection(); onBack(); }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  color: "#4c4546",
                  transition: "background 0.15s"
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#E6E6E6")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#1b1b1b"
              }}>{selectedTool}</span>
            </div>

            {/* Settings content (existing renderOptionsSidebar) */}
            <div style={{ flex: 1, padding: "0" }}>
              {renderOptionsSidebar()}
            </div>
          </div>

          {/* ── RIGHT: File Preview Panel (Stitch style) ── */}
          <div style={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* File header bar */}
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid #E6E6E6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>📄</span>
                <div>
                  <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "15px", fontWeight: 600, color: "#1b1b1b" }}>
                    {stagedFiles.length === 1 ? stagedFiles[0].name : `${stagedFiles.length} files selected`}
                  </div>
                  <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "12px", color: "#4c4546", marginTop: "2px" }}>
                    {stagedFiles.reduce((acc, f) => acc + f.size, 0) > 1024 * 1024
                      ? `${(stagedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                      : `${(stagedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(0)} KB`}
                    {" • "}{stagedFiles.length} {stagedFiles.length === 1 ? "file" : "files"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={triggerAddMoreInput}
                  style={{
                    background: "transparent",
                    border: "1px solid #E6E6E6",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#1b1b1b",
                    cursor: "pointer",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Plus size={14} /> Add more
                </button>
                <input
                  type="file"
                  ref={addMoreInputRef}
                  onChange={handleAddMoreChange}
                  multiple
                  style={{ display: "none" }}
                  accept={getAcceptAttribute(selectedTool)}
                />
                <button
                  onClick={clearSelection}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "6px",
                    color: "#4c4546",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "20px",
                    lineHeight: 1,
                    transition: "background 0.15s"
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                >×</button>
              </div>
            </div>

            {/* Page/file grid */}
            <div style={{
              flex: 1,
              padding: "24px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: isPageOrientedTool
                ? "repeat(auto-fill, minmax(140px, 1fr))"
                : "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "20px",
              alignContent: "start",
              background: "#fafafa"
            }}>
              {isPageOrientedTool && pdfDoc ? (
                pageOrder.map((pageNum, idx) => (
                  <PdfPageCard
                    key={`${pageNum}-${idx}`}
                    pdfDoc={pdfDoc}
                    pageNum={pageNum}
                    rotation={rotationMap[pageNum] || 0}
                    isRemoved={removedPages.has(pageNum)}
                    isSelected={selectedPages.has(pageNum)}
                    onRotate={() => rotatePage(pageNum)}
                    onRemove={() => toggleRemovePage(pageNum)}
                    onToggleSelect={() => toggleSelectPage(pageNum)}
                    toolColor={toolColor}
                    selectedTool={selectedTool}
                    indexInGrid={idx}
                    totalGridItems={pageOrder.length}
                    onMoveLeft={() => movePage(idx, "left")}
                    onMoveRight={() => movePage(idx, "right")}
                  />
                ))
              ) : (
                stagedFiles.map((file, idx) => (
                  <FilePreviewCard
                    key={idx}
                    file={file}
                    idx={idx}
                    toolColor={toolColor}
                    onRemove={removeStagedFile}
                    onPreviewClick={openPreview}
                  />
                ))
              )}

              {!isPageOrientedTool && (
                <div
                  onClick={triggerAddMoreInput}
                  style={{
                    aspectRatio: "3/4",
                    border: "2px dashed #E6E6E6",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    color: "#4c4546",
                    fontSize: "13px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 500,
                    transition: "border-color 0.15s, background 0.15s"
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "#000000"; (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E6E6E6"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Plus size={24} />
                  <span>Add Files</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        activeJob && (
          <div className="workspace-split-container">
            {/* Left Delivery Canvas */}
            <div className="workspace-canvas center-content">
              <div className="delivery-document-preview">
                <div className="completed-svg-box" style={{ color: toolColor }}>
                  <File size={110} strokeWidth={1.2} />
                  <div className="completed-success-badge" style={{ backgroundColor: toolColor }}>
                    <Check size={26} color="#ffffff" strokeWidth={3.5} />
                  </div>
                </div>
                
                <ul className="delivery-status-checklist">
                  <li><Check size={14} className="green-check" /> Document parsed successfully</li>
                  <li><Check size={14} className="green-check" /> Processed by our high-performance engine</li>
                  <li><Check size={14} className="green-check" /> Output formatted to specification</li>
                </ul>
              </div>
            </div>

            {/* Right Delivery Sidebar */}
            <div className="workspace-sidebar delivery-sidebar">
              <h2 className="success-heading">Success!</h2>
              <p className="success-paragraph">Your file has been processed and is ready for download.</p>

              <div className="delivery-card">
                <div className="file-info-left">
                  <div className="file-icon-box" style={{ color: toolColor }}>
                    <File size={22} />
                  </div>
                  <div className="file-name-meta">
                    <strong className="file-name">{activeJob.file}</strong>
                    <span className="file-size">
                      {activeJob.size} 
                      {selectedTool === "Compress PDF" && activeJob.originalSizeBytes && activeJob.finalSizeBytes && (
                        <span className="savings-badge">
                          ({Math.round(((activeJob.originalSizeBytes - activeJob.finalSizeBytes) / activeJob.originalSizeBytes) * 100)}% smaller!)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="delivery-actions">
                <a 
                  href={activeJob.downloadUrl} 
                  className="primary-button download-btn"
                  style={{ textDecoration: "none" }}
                  download
                >
                  <Download size={18} />
                  DOWNLOAD FILE
                </a>

                <div className="delivery-vertical-actions">
                  <button className="sub-action-sidebar-btn" onClick={handleShare}>
                    <Share2 size={15} />
                    <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
                  </button>
                  <button 
                    className="sub-action-sidebar-btn" 
                    onClick={() => alert("Google Drive integration coming soon!")}
                  >
                    <Cloud size={15} />
                    <span>Save to Google Drive</span>
                  </button>
                  <button className="sub-action-sidebar-btn start-over-btn" onClick={clearSelection}>
                    <RotateCcw size={15} />
                    <span>Start Over</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {previewFile && (
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
        }} onClick={() => setPreviewFile(null)}>
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
                onClick={() => setPreviewFile(null)}
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
      )}
    </div>
  );
}
