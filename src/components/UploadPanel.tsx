import { useRef, useState, useEffect } from "react";
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

  const documentIllustration = (
    <svg 
      width="56" 
      height="56" 
      viewBox="0 0 64 64" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      style={{ color: toolColor, marginBottom: "14px" }}
    >
      <rect x="20" y="10" width="28" height="38" rx="2" strokeDasharray="3 2" />
      <rect x="12" y="18" width="28" height="38" rx="2" fill="none" />
      <line x1="18" y1="26" x2="34" y2="26" strokeLinecap="round" />
      <line x1="18" y1="32" x2="34" y2="32" strokeLinecap="round" />
      <line x1="18" y1="38" x2="28" y2="38" strokeLinecap="round" />
      <rect x="20" y="44" width="16" height="8" rx="1.5" fill="currentColor" />
      <text 
        x="28" 
        y="49.5" 
        fill="#ffffff" 
        fontSize="5.5px" 
        fontWeight="900" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        PDF
      </text>
    </svg>
  );

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
      <div className="workspace-sidebar">
        <h3 className="sidebar-heading">{selectedTool} settings</h3>
        
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
        </div>
      </div>
    );
  }

  // Centered wrapper for selection (idle) and loading (processing) states
  if (viewMode === "idle" || viewMode === "processing") {
    return (
      <div className="workspace-container">
        <div className="workspace-inner">
          {viewMode === "idle" ? (
            <>
              {/* Breadcrumb */}
              <nav className="workspace-breadcrumb">
                <a href="#home" onClick={(e) => { e.preventDefault(); onBack(); }}>Home</a>
                <span className="separator">&rsaquo;</span>
                <span className="current">{selectedTool}</span>
              </nav>

              {/* Main Title */}
              <h1 className="workspace-title">{selectedTool}</h1>

              <div 
                className="workspace-uploader"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${toolColor} 8%, var(--c-surface))`, 
                  border: `1px solid color-mix(in srgb, ${toolColor} 20%, var(--border))`,
                  cursor: "pointer" 
                }}
                onClick={() => {
                  if (isDropdownOpen) setIsDropdownOpen(false);
                  else triggerFileInput();
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="uploader-inner-dashed">
                  {documentIllustration}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    style={{ display: "none" }}
                    accept={getAcceptAttribute(selectedTool)}
                  />
                  
                  <div className="choose-files-container">
                    <div className="choose-files-btn-group">
                      <button 
                        className="choose-files-btn" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          triggerFileInput(); 
                          setIsDropdownOpen(false);
                        }}
                      >
                        CHOOSE FILES
                      </button>
                      <button 
                        className="choose-files-dropdown" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setIsDropdownOpen(!isDropdownOpen); 
                        }}
                      >
                        <ChevronDown size={16} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </button>
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="choose-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="dropdown-item" 
                          onClick={() => { 
                            triggerFileInput(); 
                            setIsDropdownOpen(false); 
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                          </svg>
                          <span>From device</span>
                        </button>
                        <button 
                          className="dropdown-item" 
                          onClick={() => { 
                            alert("Dropbox integration coming soon!"); 
                            setIsDropdownOpen(false); 
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0061ff">
                            <path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 16l6-4-6-4-6 4 6 4zm12 0l6-4-6-4-6 4 6 4zM12 13v6l-6 4V17l6-4zm0 0v6l6 4V17l-6-4z"/>
                          </svg>
                          <span>From Dropbox</span>
                        </button>
                        <button 
                          className="dropdown-item" 
                          onClick={() => { 
                            alert("Google Drive integration coming soon!"); 
                            setIsDropdownOpen(false); 
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M2 14.5l3.5-6h13l-3.5 6H2z" fill="#00a859"/>
                            <path d="M8.5 2.5l3.5 6H22l-3.5-6H8.5z" fill="#ffc72c"/>
                            <path d="M15 8.5l3.5 6-6.5 11.5-3.5-6 6.5-11.5z" fill="#0066b3"/>
                          </svg>
                          <span>From Google Drive</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="drop-subtext">or drop files here</span>
                </div>
              </div>
            </>
          ) : (
            <div className="full-screen-loader">
              <div className="loader-box-card">
                <div className="processing-loader-wrapper">
                  <div className="processing-spinner" style={{ borderTopColor: toolColor }}></div>
                  <div className="processing-pulse-glow" style={{ backgroundColor: toolColor }}></div>
                </div>
                <h3 className="processing-title">Processing your request</h3>
                <p className="processing-subtext">{processingSteps[stepIdx]}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full bleed viewport container for staged and completed states
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
        <div className="workspace-split-container">
          {/* Left Staged Files Canvas */}
          <div className="workspace-canvas">
            {/* Breadcrumb */}
            <nav className="workspace-breadcrumb">
              <a href="#home" onClick={(e) => { e.preventDefault(); onBack(); }}>Home</a>
              <span className="separator">&rsaquo;</span>
              <span className="current">{selectedTool}</span>
            </nav>

            {/* Canvas Header */}
            <div className="canvas-header">
              <h1 className="workspace-canvas-title">Staged files ({stagedFiles.length})</h1>
              <button className="quiet-button add-more-text-btn" onClick={triggerAddMoreInput}>
                <Plus size={15} /> Add more files
              </button>
              <input 
                type="file" 
                ref={addMoreInputRef} 
                onChange={handleAddMoreChange} 
                multiple 
                style={{ display: "none" }}
                accept={getAcceptAttribute(selectedTool)}
              />
            </div>

            {/* Canvas Grid container (scrolls if overflow) */}
            <div className="canvas-file-grid">
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
                <div className="canvas-file-card add-card" onClick={triggerAddMoreInput}>
                  <div className="add-card-icon-box" style={{ color: toolColor }}>
                    <Plus size={20} />
                  </div>
                  <span className="add-card-label">Add Files</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Options panel */}
          {renderOptionsSidebar()}
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
