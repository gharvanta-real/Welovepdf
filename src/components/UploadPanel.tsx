import { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, Share2, RotateCcw, File, Download, Cloud, Plus, Image as ImageIcon } from "lucide-react";
import { getToolColor } from "./ToolIcon";
import { PdfEditor } from "./PdfEditor";

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
  const [summarizeLength, setSummarizeLength] = useState("medium");
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
          <div className="options-group">
            <label className="options-label">Compression Level</label>
            <div className="options-vertical-list">
              <button 
                className={`option-card ${compressionLevel === "extreme" ? "active" : ""}`}
                style={{ borderColor: compressionLevel === "extreme" ? toolColor : "" }}
                onClick={() => setCompressionLevel("extreme")}
              >
                <span className="option-title">Extreme Compression</span>
                <span className="option-desc">Less quality, high compression.</span>
              </button>
              <button 
                className={`option-card ${compressionLevel === "recommended" ? "active" : ""}`}
                style={{ borderColor: compressionLevel === "recommended" ? toolColor : "" }}
                onClick={() => setCompressionLevel("recommended")}
              >
                <span className="option-title">Recommended Compression</span>
                <span className="option-desc">Good quality, good compression.</span>
              </button>
              <button 
                className={`option-card ${compressionLevel === "less" ? "active" : ""}`}
                style={{ borderColor: compressionLevel === "less" ? toolColor : "" }}
                onClick={() => setCompressionLevel("less")}
              >
                <span className="option-title">Less Compression</span>
                <span className="option-desc">High quality, low compression.</span>
              </button>
            </div>
          </div>
        )}

        {isMerge && (
          <div className="options-group">
            <label className="options-label">Merge Options</label>
            <div className="options-checkbox-list">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={fileNameStamps} 
                  onChange={(e) => setFileNameStamps(e.target.checked)} 
                />
                <span>Add filename stamps to page corners</span>
              </label>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={includeTOC} 
                  onChange={(e) => setIncludeTOC(e.target.checked)} 
                />
                <span>Include a table of contents page</span>
              </label>
            </div>
          </div>
        )}

        {isJpgToPdf && (
          <>
            <div className="options-group">
              <label className="options-label">Page orientation</label>
              <div className="options-grid cols-2">
                <button 
                  className={`option-card center-align ${pageOrientation === "portrait" ? "active" : ""}`}
                  style={{ borderColor: pageOrientation === "portrait" ? toolColor : "" }}
                  onClick={() => setPageOrientation("portrait")}
                >
                  <div className="orientation-icon portrait"></div>
                  <span className="option-title">Portrait</span>
                </button>
                <button 
                  className={`option-card center-align ${pageOrientation === "landscape" ? "active" : ""}`}
                  style={{ borderColor: pageOrientation === "landscape" ? toolColor : "" }}
                  onClick={() => setPageOrientation("landscape")}
                >
                  <div className="orientation-icon landscape"></div>
                  <span className="option-title">Landscape</span>
                </button>
              </div>
            </div>

            <div className="options-group">
              <label className="options-label">Page size</label>
              <select 
                className="options-select" 
                value={pageSize} 
                onChange={(e) => setPageSize(e.target.value as any)}
              >
                <option value="a4">A4 (297x210 mm)</option>
                <option value="letter">US Letter (8.5x11 in)</option>
                <option value="fit">Fit (same page size as image)</option>
              </select>
            </div>

            <div className="options-group">
              <label className="options-label">Margin</label>
              <div className="options-grid cols-3">
                <button 
                  className={`option-card center-align compact ${pageMargin === "none" ? "active" : ""}`}
                  style={{ borderColor: pageMargin === "none" ? toolColor : "" }}
                  onClick={() => setPageMargin("none")}
                >
                  <span className="option-title">No margin</span>
                </button>
                <button 
                  className={`option-card center-align compact ${pageMargin === "small" ? "active" : ""}`}
                  style={{ borderColor: pageMargin === "small" ? toolColor : "" }}
                  onClick={() => setPageMargin("small")}
                >
                  <span className="option-title">Small</span>
                </button>
                <button 
                  className={`option-card center-align compact ${pageMargin === "big" ? "active" : ""}`}
                  style={{ borderColor: pageMargin === "big" ? toolColor : "" }}
                  onClick={() => setPageMargin("big")}
                >
                  <span className="option-title">Big</span>
                </button>
              </div>
            </div>

            <div className="options-group">
              <label className="checkbox-row mt-4">
                <input 
                  type="checkbox" 
                  checked={mergeAll} 
                  onChange={(e) => setMergeAll(e.target.checked)} 
                />
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Merge all images in one PDF file</span>
              </label>
            </div>
          </>
        )}

        {isPdfToJpg && (
          <div className="options-group">
            <label className="options-label">Extraction Mode</label>
            <div className="options-vertical-list">
              <button 
                className={`option-card ${conversionMode === "page" ? "active" : ""}`}
                style={{ borderColor: conversionMode === "page" ? toolColor : "" }}
                onClick={() => setConversionMode("page")}
              >
                <span className="option-title">Page to JPG</span>
                <span className="option-desc">Convert entire PDF pages to JPG images.</span>
              </button>
              <button 
                className={`option-card ${conversionMode === "extract" ? "active" : ""}`}
                style={{ borderColor: conversionMode === "extract" ? toolColor : "" }}
                onClick={() => setConversionMode("extract")}
              >
                <span className="option-title">Extract Images</span>
                <span className="option-desc">Extract all single images inside the PDF.</span>
              </button>
            </div>
          </div>
        )}

        {isSplit && (
          <>
            <div className="options-group">
              <label className="options-label">Split Mode</label>
              <div className="options-grid cols-2">
                <button 
                  className={`option-card center-align ${splitMode === "ranges" ? "active" : ""}`}
                  style={{ borderColor: splitMode === "ranges" ? toolColor : "" }}
                  onClick={() => {
                    setSplitMode("ranges");
                    setSplitRanges("1-2");
                  }}
                >
                  <span className="option-title">Split by Range</span>
                </button>
                <button 
                  className={`option-card center-align ${splitMode === "extract" ? "active" : ""}`}
                  style={{ borderColor: splitMode === "extract" ? toolColor : "" }}
                  onClick={() => {
                    setSplitMode("extract");
                    setSplitRanges("all");
                  }}
                >
                  <span className="option-title">Extract Pages</span>
                </button>
              </div>
            </div>

            <div className="options-group">
              {splitMode === "ranges" ? (
                <>
                  <label className="options-label" htmlFor="split-ranges-input">Custom page ranges</label>
                  <input 
                    type="text" 
                    id="split-ranges-input"
                    className="options-input" 
                    value={splitRanges} 
                    onChange={(e) => setSplitRanges(e.target.value)} 
                    placeholder="e.g. 1-2, 3-5"
                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
                  />
                  <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                    Split the document into separate files of specified page ranges.
                  </span>
                </>
              ) : (
                <>
                  <label className="options-label" htmlFor="split-extract-input">Page numbers to extract</label>
                  <input 
                    type="text" 
                    id="split-extract-input"
                    className="options-input" 
                    value={splitRanges} 
                    onChange={(e) => setSplitRanges(e.target.value)} 
                    placeholder="e.g. all or 1, 3, 5"
                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
                  />
                  <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                    Enter page numbers separated by commas, or write "all" to split every page.
                  </span>
                </>
              )}
            </div>
          </>
        )}

        {isWatermark && (
          <div className="options-group">
            <label className="options-label">Watermark Text</label>
            <input 
              type="text" 
              className="options-input" 
              value={watermarkText} 
              onChange={(e) => setWatermarkText(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Text Color</label>
            <input 
              type="color" 
              value={watermarkColor} 
              onChange={(e) => setWatermarkColor(e.target.value)}
              style={{ width: "100%", height: "38px", border: "1px solid var(--border)", background: "none", cursor: "pointer", marginTop: "4px", borderRadius: "var(--radius-sm)" }}
            />
            <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Opacity ({Math.round(parseFloat(watermarkOpacity) * 100)}%)</label>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={watermarkOpacity} 
              onChange={(e) => setWatermarkOpacity(e.target.value)}
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>
        )}

        {isSign && (
          <div className="options-group">
            <label className="options-label">Signature Text</label>
            <input 
              type="text" 
              className="options-input" 
              value={signatureText} 
              onChange={(e) => setSignatureText(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Signature Font Style</label>
            <select 
              className="options-select" 
              value={signatureStyle}
              onChange={(e) => setSignatureStyle(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            >
              <option value="cursive">Cursive (Handwritten)</option>
              <option value="serif">Formal Serif</option>
              <option value="sans">Clean Sans-Serif</option>
            </select>
          </div>
        )}

        {(isProtect || isUnlock) && (
          <div className="options-group">
            <label className="options-label">PDF Password</label>
            <input 
              type="password" 
              className="options-input" 
              value={pdfPassword} 
              onChange={(e) => setPdfPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              {isProtect ? "Set a secure password lock for this document." : "Enter the password required to open the PDF."}
            </span>
          </div>
        )}

        {isTranslate && (
          <div className="options-group">
            <label className="options-label">Target Language</label>
            <select 
              className="options-select" 
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            >
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
            </select>
          </div>
        )}

        {isSummarize && (
          <div className="options-group">
            <label className="options-label">Summary Length</label>
            <div className="options-vertical-list">
              <button 
                className={`option-card ${summarizeLength === "short" ? "active" : ""}`}
                style={{ borderColor: summarizeLength === "short" ? toolColor : "" }}
                onClick={() => setSummarizeLength("short")}
              >
                <span className="option-title">Short (3 Sentences)</span>
                <span className="option-desc">Highly condensed overview.</span>
              </button>
              <button 
                className={`option-card ${summarizeLength === "medium" ? "active" : ""}`}
                style={{ borderColor: summarizeLength === "medium" ? toolColor : "" }}
                onClick={() => setSummarizeLength("medium")}
              >
                <span className="option-title">Medium (6 Sentences)</span>
                <span className="option-desc">Standard descriptive outline.</span>
              </button>
              <button 
                className={`option-card ${summarizeLength === "long" ? "active" : ""}`}
                style={{ borderColor: summarizeLength === "long" ? toolColor : "" }}
                onClick={() => setSummarizeLength("long")}
              >
                <span className="option-title">Long (12 Sentences)</span>
                <span className="option-desc">Deep structural details.</span>
              </button>
            </div>
          </div>
        )}

        {isBates && (
          <div className="options-group">
            <label className="options-label">Bates Prefix</label>
            <input 
              type="text" 
              className="options-input" 
              value={batesPrefix} 
              onChange={(e) => setBatesPrefix(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Starting Number</label>
            <input 
              type="number" 
              className="options-input" 
              value={batesStart} 
              onChange={(e) => setBatesStart(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
          </div>
        )}

        {isPageNumber && (
          <div className="options-group">
            <label className="options-label">Position Alignment</label>
            <select 
              className="options-select" 
              value={pageNumberPos}
              onChange={(e) => setPageNumberPos(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-center">Top Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
            </select>
            <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Font Size (px)</label>
            <input 
              type="number" 
              className="options-input" 
              value={pageNumberSize} 
              onChange={(e) => setPageNumberSize(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
          </div>
        )}

        {isCrop && (
          <div className="options-group">
            <label className="options-label">Crop Margin Percentage ({cropMargin}%)</label>
            <input 
              type="range" 
              min="2" 
              max="30" 
              step="1" 
              value={cropMargin} 
              onChange={(e) => setCropMargin(e.target.value)}
              style={{ width: "100%", marginTop: "4px" }}
            />
            <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Applies equal crop boundary margins to all four page edges.
            </span>
          </div>
        )}

        {isCopilot && (
          <div className="options-group">
            <label className="options-label">Copilot Analysis Mode</label>
            <div className="options-vertical-list">
              <button 
                className={`option-card ${copilotMode === "general" ? "active" : ""}`}
                style={{ borderColor: copilotMode === "general" ? toolColor : "" }}
                onClick={() => setCopilotMode("general")}
              >
                <span className="option-title">General Summary</span>
                <span className="option-desc">Broad, semantic review.</span>
              </button>
              <button 
                className={`option-card ${copilotMode === "technical" ? "active" : ""}`}
                style={{ borderColor: copilotMode === "technical" ? toolColor : "" }}
                onClick={() => setCopilotMode("technical")}
              >
                <span className="option-title">Technical Audit</span>
                <span className="option-desc">Inspect structural tags and elements.</span>
              </button>
              <button 
                className={`option-card ${copilotMode === "financial" ? "active" : ""}`}
                style={{ borderColor: copilotMode === "financial" ? toolColor : "" }}
                onClick={() => setCopilotMode("financial")}
              >
                <span className="option-title">Financial Audit</span>
                <span className="option-desc">Extract tabular data and metrics.</span>
              </button>
            </div>
          </div>
        )}

        {isTxtToPdf && (
          <div className="options-group">
            <label className="options-label">Font Size</label>
            <input 
              type="number" 
              className="options-input" 
              value={txtFontSize} 
              onChange={(e) => setTxtFontSize(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
          </div>
        )}

        {isHtmlToPdf && (
          <div className="options-group">
            <label className="options-label">Page Layout Dimensions</label>
            <select 
              className="options-select" 
              value={htmlPageSize}
              onChange={(e) => setHtmlPageSize(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            >
              <option value="letter">US Letter (8.5 x 11 in)</option>
              <option value="a4">ISO A4 (210 x 297 mm)</option>
            </select>
          </div>
        )}

        {selectedTool === "Rotate PDF" && (
          <div className="options-group">
            <label className="options-label">Global Rotate</label>
            <button 
              className="option-card center-align compact"
              onClick={() => {
                const next: any = {};
                for (let i = 1; i <= totalPdfPages; i++) {
                  next[i] = ((rotationMap[i] || 0) + 90) % 360;
                }
                setRotationMap(next);
              }}
              style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Rotate all pages 90°</span>
            </button>
          </div>
        )}

        {selectedTool === "Remove Pages" && (
          <div className="options-group">
            <label className="options-label">Selection Summary</label>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px 0" }}>
              {removedPages.size} {removedPages.size === 1 ? "page" : "pages"} selected for removal.
            </p>
            {removedPages.size > 0 && (
              <button 
                className="quiet-button" 
                style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", background: "transparent" }}
                onClick={() => setRemovedPages(new Set())}
              >
                Clear all deletions
              </button>
            )}
          </div>
        )}

        {selectedTool === "Extract Pages" && (
          <div className="options-group">
            <label className="options-label">Extraction Ranges</label>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px 0" }}>
              {selectedPages.size} of {totalPdfPages} pages selected for extraction.
            </p>
            <div className="options-grid cols-2" style={{ gap: "8px" }}>
              <button 
                className="quiet-button"
                style={{ border: "1px solid var(--border)", padding: "8px", cursor: "pointer" }}
                onClick={() => {
                  const s = new Set<number>();
                  for (let i = 1; i <= totalPdfPages; i++) s.add(i);
                  setSelectedPages(s);
                }}
              >
                Select All
              </button>
              <button 
                className="quiet-button"
                style={{ border: "1px solid var(--border)", padding: "8px", cursor: "pointer" }}
                onClick={() => setSelectedPages(new Set())}
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {selectedTool === "Organize PDF" && (
          <div className="options-group">
            <label className="options-label">Sequence operations</label>
            <button 
              className="option-card center-align compact"
              onClick={() => {
                setPageOrder(prev => [...prev].reverse());
              }}
              style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}
            >
              <span>Reverse page order</span>
            </button>
            <button 
              className="option-card center-align compact"
              onClick={() => {
                const s = [];
                for (let i = 1; i <= totalPdfPages; i++) s.push(i);
                setPageOrder(s);
              }}
              style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px", cursor: "pointer" }}
            >
              <span>Reset to default order</span>
            </button>
          </div>
        )}

        {isFlatten && (
          <div className="options-group">
            <label className="options-label">Flattening Mode</label>
            <div className="options-vertical-list">
              <button 
                className={`option-card ${flattenMode === "all" ? "active" : ""}`}
                style={{ borderColor: flattenMode === "all" ? toolColor : "" }}
                onClick={() => setFlattenMode("all")}
              >
                <span className="option-title">Flatten All Elements</span>
                <span className="option-desc">Flatten both form fields and annotations.</span>
              </button>
              <button 
                className={`option-card ${flattenMode === "forms" ? "active" : ""}`}
                style={{ borderColor: flattenMode === "forms" ? toolColor : "" }}
                onClick={() => setFlattenMode("forms")}
              >
                <span className="option-title">Flatten Form Fields Only</span>
                <span className="option-desc">Keep annotations interactive, flatten form fields.</span>
              </button>
              <button 
                className={`option-card ${flattenMode === "annotations" ? "active" : ""}`}
                style={{ borderColor: flattenMode === "annotations" ? toolColor : "" }}
                onClick={() => setFlattenMode("annotations")}
              >
                <span className="option-title">Flatten Annotations Only</span>
                <span className="option-desc">Keep form fields interactive, flatten annotations.</span>
              </button>
            </div>
          </div>
        )}

        {isRepair && (
          <>
            <div className="options-group">
              <label className="options-label">Repair Intensity</label>
              <div className="options-vertical-list">
                <button 
                  className={`option-card ${repairMode === "streams" ? "active" : ""}`}
                  style={{ borderColor: repairMode === "streams" ? toolColor : "" }}
                  onClick={() => setRepairMode("streams")}
                >
                  <span className="option-title">Recover Corrupted Streams</span>
                  <span className="option-desc">Deep scan stream blocks for errors.</span>
                </button>
                <button 
                  className={`option-card ${repairMode === "tables" ? "active" : ""}`}
                  style={{ borderColor: repairMode === "tables" ? toolColor : "" }}
                  onClick={() => setRepairMode("tables")}
                >
                  <span className="option-title">Rebuild Cross-References</span>
                  <span className="option-desc">Restore page indexes and offsets.</span>
                </button>
                <button 
                  className={`option-card ${repairMode === "catalog" ? "active" : ""}`}
                  style={{ borderColor: repairMode === "catalog" ? toolColor : "" }}
                  onClick={() => setRepairMode("catalog")}
                >
                  <span className="option-title">Fix Catalog Metadata</span>
                  <span className="option-desc">Rebuild corrupt catalog root descriptors.</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">PDF Compatibility Output</label>
              <select 
                className="options-select" 
                value={repairCompatibility} 
                onChange={(e) => setRepairCompatibility(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="1.4">Acrobat 5.0 (PDF 1.4)</option>
                <option value="1.7">Acrobat 8.0 (PDF 1.7 - Default)</option>
                <option value="2.0">Acrobat X (PDF 2.0)</option>
              </select>
            </div>
          </>
        )}

        {isWordToPdf && (
          <>
            <div className="options-group">
              <label className="options-label">Margins</label>
              <select 
                className="options-select" 
                value={wordMargins} 
                onChange={(e) => setWordMargins(e.target.value as any)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="standard">Standard (1.0 in / 2.54 cm)</option>
                <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                <option value="wide">Wide (1.5 in / 3.81 cm)</option>
              </select>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Layout Rules</label>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={wordBookmarks} 
                    onChange={(e) => setWordBookmarks(e.target.checked)} 
                  />
                  <span>Convert headings to document bookmarks</span>
                </label>
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={wordLinkColors} 
                    onChange={(e) => setWordLinkColors(e.target.checked)} 
                  />
                  <span>Preserve source link styling and colors</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isExcelToPdf && (
          <>
            <div className="options-group">
              <label className="options-label">Orientation</label>
              <div className="options-grid cols-2">
                <button 
                  className={`option-card center-align ${excelOrientation === "portrait" ? "active" : ""}`}
                  style={{ borderColor: excelOrientation === "portrait" ? toolColor : "" }}
                  onClick={() => setExcelOrientation("portrait")}
                >
                  <span className="option-title">Portrait</span>
                </button>
                <button 
                  className={`option-card center-align ${excelOrientation === "landscape" ? "active" : ""}`}
                  style={{ borderColor: excelOrientation === "landscape" ? toolColor : "" }}
                  onClick={() => setExcelOrientation("landscape")}
                >
                  <span className="option-title">Landscape</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Sheet Scaling</label>
              <select 
                className="options-select" 
                value={excelSheetRendering} 
                onChange={(e) => setExcelSheetRendering(e.target.value as any)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="fit-width">Fit Sheet to One Page Wide</option>
                <option value="fit-all-columns">Fit All Columns on One Page</option>
                <option value="actual-size">No Scaling (Actual Size)</option>
              </select>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={excelGridlines} 
                    onChange={(e) => setExcelGridlines(e.target.checked)} 
                  />
                  <span>Render visible gridlines in output PDF</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isPptToPdf && (
          <>
            <div className="options-group">
              <label className="options-label">Slide Orientation</label>
              <div className="options-grid cols-2">
                <button 
                  className={`option-card center-align ${pptOrientation === "landscape" ? "active" : ""}`}
                  style={{ borderColor: pptOrientation === "landscape" ? toolColor : "" }}
                  onClick={() => setPptOrientation("landscape")}
                >
                  <span className="option-title">Landscape</span>
                </button>
                <button 
                  className={`option-card center-align ${pptOrientation === "portrait" ? "active" : ""}`}
                  style={{ borderColor: pptOrientation === "portrait" ? toolColor : "" }}
                  onClick={() => setPptOrientation("portrait")}
                >
                  <span className="option-title">Portrait</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Slides Layout</label>
              <select 
                className="options-select" 
                value={pptSlidesLayout} 
                onChange={(e) => setPptSlidesLayout(e.target.value as any)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="1-slide">1 Slide Per Page</option>
                <option value="2-slides">2 Slides Per Page (Vertical List)</option>
                <option value="4-slides">4 Slides Per Page (2x2 Handout Grid)</option>
              </select>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={pptNotes} 
                    onChange={(e) => setPptNotes(e.target.checked)} 
                  />
                  <span>Include presenter notes page under slides</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isPdfToWord && (
          <>
            <div className="options-group">
              <label className="options-label">Text Layout Reconstruction</label>
              <div className="options-vertical-list">
                <button 
                  className={`option-card ${pdfToWordMode === "flowing" ? "active" : ""}`}
                  style={{ borderColor: pdfToWordMode === "flowing" ? toolColor : "" }}
                  onClick={() => setPdfToWordMode("flowing")}
                >
                  <span className="option-title">Flowing Text (Highly Editable)</span>
                  <span className="option-desc">Preserves paragraphs, tables and document flow.</span>
                </button>
                <button 
                  className={`option-card ${pdfToWordMode === "frames" ? "active" : ""}`}
                  style={{ borderColor: pdfToWordMode === "frames" ? toolColor : "" }}
                  onClick={() => setPdfToWordMode("frames")}
                >
                  <span className="option-title">Visual Layout (Frames)</span>
                  <span className="option-desc">Keeps elements in exact visual positions using text boxes.</span>
                </button>
                <button 
                  className={`option-card ${pdfToWordMode === "text-only" ? "active" : ""}`}
                  style={{ borderColor: pdfToWordMode === "text-only" ? toolColor : "" }}
                  onClick={() => setPdfToWordMode("text-only")}
                >
                  <span className="option-title">Plain Text Only</span>
                  <span className="option-desc">Extract raw text strings without markup.</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">OCR Options</label>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={pdfToWordOcr} 
                    onChange={(e) => setPdfToWordOcr(e.target.checked)} 
                  />
                  <span>Run OCR to extract text from scanned images</span>
                </label>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Language for Text Parsing</label>
              <select 
                className="options-select" 
                value={pdfToWordLang} 
                onChange={(e) => setPdfToWordLang(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
              </select>
            </div>
          </>
        )}

        {isPdfToExcel && (
          <>
            <div className="options-group">
              <label className="options-label">Table Extraction Format</label>
              <select 
                className="options-select" 
                value={pdfToExcelData} 
                onChange={(e) => setPdfToExcelData(e.target.value as any)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="all-tables">Extract All Tables to Separate Sheets</option>
                <option value="single-sheet">Merge All Tables into One Sheet</option>
                <option value="table-per-page">Create One Excel Sheet Per PDF Page</option>
              </select>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Formatting Separator</label>
              <div className="options-grid cols-2">
                <button 
                  className={`option-card center-align ${pdfToExcelSeparator === "period" ? "active" : ""}`}
                  style={{ borderColor: pdfToExcelSeparator === "period" ? toolColor : "" }}
                  onClick={() => setPdfToExcelSeparator("period")}
                >
                  <span className="option-title">Period (.) Decimal</span>
                </button>
                <button 
                  className={`option-card center-align ${pdfToExcelSeparator === "comma" ? "active" : ""}`}
                  style={{ borderColor: pdfToExcelSeparator === "comma" ? toolColor : "" }}
                  onClick={() => setPdfToExcelSeparator("comma")}
                >
                  <span className="option-title">Comma (,) Decimal</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={pdfToExcelDetectNum} 
                    onChange={(e) => setPdfToExcelDetectNum(e.target.checked)} 
                  />
                  <span>Automatically detect numeric string formatting</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isPdfToPpt && (
          <>
            <div className="options-group">
              <label className="options-label">Slide Creation Layout</label>
              <div className="options-vertical-list">
                <button 
                  className={`option-card ${pdfToPptLayout === "auto" ? "active" : ""}`}
                  style={{ borderColor: pdfToPptLayout === "auto" ? toolColor : "" }}
                  onClick={() => setPdfToPptLayout("auto")}
                >
                  <span className="option-title">Auto Content Flow</span>
                  <span className="option-desc">Convert PDF paragraphs into bullet slides.</span>
                </button>
                <button 
                  className={`option-card ${pdfToPptLayout === "page-image" ? "active" : ""}`}
                  style={{ borderColor: pdfToPptLayout === "page-image" ? toolColor : "" }}
                  onClick={() => setPdfToPptLayout("page-image")}
                >
                  <span className="option-title">Page as Backdrop Image</span>
                  <span className="option-desc">Rasterize each page as a static slide background.</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <div className="options-checkbox-list">
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={pdfToPptBorders} 
                    onChange={(e) => setPdfToPptBorders(e.target.checked)} 
                  />
                  <span>Add thin slide border lines</span>
                </label>
                <label className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={pdfToPptCompress} 
                    onChange={(e) => setPdfToPptCompress(e.target.checked)} 
                  />
                  <span>Compress embedded images to 150 DPI</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isAnnotate && (
          <>
            <div className="options-group">
              <label className="options-label">Annotation Tool</label>
              <div className="options-vertical-list">
                <button 
                  className={`option-card ${annotateTool === "highlight" ? "active" : ""}`}
                  style={{ borderColor: annotateTool === "highlight" ? toolColor : "" }}
                  onClick={() => setAnnotateTool("highlight")}
                >
                  <span className="option-title">Highlight Marker</span>
                  <span className="option-desc">Semi-transparent text selection highlight.</span>
                </button>
                <button 
                  className={`option-card ${annotateTool === "pen" ? "active" : ""}`}
                  style={{ borderColor: annotateTool === "pen" ? toolColor : "" }}
                  onClick={() => setAnnotateTool("pen")}
                >
                  <span className="option-title">Freehand Pen Outline</span>
                  <span className="option-desc">Draw a customizable review outline path.</span>
                </button>
                <button 
                  className={`option-card ${annotateTool === "text-comment" ? "active" : ""}`}
                  style={{ borderColor: annotateTool === "text-comment" ? toolColor : "" }}
                  onClick={() => setAnnotateTool("text-comment")}
                >
                  <span className="option-title">Reviewer Comment Card</span>
                  <span className="option-desc">Insert a sticky text comment card on page header.</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Annotation Color</label>
              <input 
                type="color" 
                value={annotateColor} 
                onChange={(e) => setAnnotateColor(e.target.value)}
                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", background: "none", cursor: "pointer", marginTop: "4px", borderRadius: "var(--radius-sm)" }}
              />
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label" htmlFor="annotate-text-input">Annotation / Comment Text</label>
              <input 
                type="text" 
                id="annotate-text-input"
                className="options-input" 
                value={annotateText} 
                onChange={(e) => setAnnotateText(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              />
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Opacity ({Math.round(parseFloat(annotateOpacity) * 100)}%)</label>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05" 
                value={annotateOpacity} 
                onChange={(e) => setAnnotateOpacity(e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            {annotateTool === "pen" && (
              <div className="options-group" style={{ marginTop: "14px" }}>
                <label className="options-label">Pen Line Thickness ({annotateThickness}px)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1" 
                  value={annotateThickness} 
                  onChange={(e) => setAnnotateThickness(e.target.value)}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
            )}
          </>
        )}

        {isOcr && (
          <>
            <div className="options-group">
              <label className="options-label">OCR Engine Accuracy</label>
              <div className="options-vertical-list">
                <button 
                  className={`option-card ${ocrEngineMode === "balanced" ? "active" : ""}`}
                  style={{ borderColor: ocrEngineMode === "balanced" ? toolColor : "" }}
                  onClick={() => setOcrEngineMode("balanced")}
                >
                  <span className="option-title">Balanced Quality</span>
                  <span className="option-desc">Standard conversion layout and accuracy.</span>
                </button>
                <button 
                  className={`option-card ${ocrEngineMode === "quality" ? "active" : ""}`}
                  style={{ borderColor: ocrEngineMode === "quality" ? toolColor : "" }}
                  onClick={() => setOcrEngineMode("quality")}
                >
                  <span className="option-title">Maximum Quality (Slow)</span>
                  <span className="option-desc">High precision pixel scanning and formatting.</span>
                </button>
                <button 
                  className={`option-card ${ocrEngineMode === "fast" ? "active" : ""}`}
                  style={{ borderColor: ocrEngineMode === "fast" ? toolColor : "" }}
                  onClick={() => setOcrEngineMode("fast")}
                >
                  <span className="option-title">Fast Recognition</span>
                  <span className="option-desc">Optimized speed, simple overlay structure.</span>
                </button>
              </div>
            </div>
            <div className="options-group" style={{ marginTop: "14px" }}>
              <label className="options-label">Primary Document Language</label>
              <select 
                className="options-select" 
                value={ocrLanguage} 
                onChange={(e) => setOcrLanguage(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </>
        )}

        {!isCompress && !isMerge && !isJpgToPdf && !isPdfToJpg && !isSplit && 
         !isWatermark && !isSign && !isProtect && !isUnlock && !isTranslate && !isSummarize && 
         !isBates && !isPageNumber && !isCrop && !isCopilot && !isTxtToPdf && !isHtmlToPdf && 
         !isFlatten && !isRepair && !isWordToPdf && !isExcelToPdf && !isPptToPdf && 
         !isPdfToWord && !isPdfToExcel && !isPdfToPpt && !isAnnotate && !isOcr && 
         selectedTool !== "Rotate PDF" && selectedTool !== "Remove Pages" && 
         selectedTool !== "Extract Pages" && selectedTool !== "Organize PDF" && (
          <>
            <div className="options-group">
              <label className="options-label">Output Quality</label>
              <div className="options-grid cols-3">
                <button 
                  className={`option-card center-align compact ${outputQuality === "normal" ? "active" : ""}`}
                  style={{ borderColor: outputQuality === "normal" ? toolColor : "" }}
                  onClick={() => setOutputQuality("normal")}
                >
                  <span className="option-title">Normal</span>
                </button>
                <button 
                  className={`option-card center-align compact ${outputQuality === "high" ? "active" : ""}`}
                  style={{ borderColor: outputQuality === "high" ? toolColor : "" }}
                  onClick={() => setOutputQuality("high")}
                >
                  <span className="option-title">High</span>
                </button>
                <button 
                  className={`option-card center-align compact ${outputQuality === "compact" ? "active" : ""}`}
                  style={{ borderColor: outputQuality === "compact" ? toolColor : "" }}
                  onClick={() => setOutputQuality("compact")}
                >
                  <span className="option-title">Compact</span>
                </button>
              </div>
            </div>

            <div className="options-group">
              <label className="checkbox-row mt-4">
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Optimize output for web view</span>
              </label>
            </div>
          </>
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
