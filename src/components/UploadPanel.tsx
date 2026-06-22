import React, { useRef, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { PdfEditor } from "./PdfEditor";
import { SignEditor } from "./pdf-editor/SignEditor";
import { WatermarkEditor } from "./pdf-editor/WatermarkEditor";
import { CropEditor } from "./pdf-editor/CropEditor";
import { PageNumberEditor } from "./pdf-editor/PageNumberEditor";
import { BatesNumberEditor } from "./pdf-editor/BatesNumberEditor";
import { getPdfjsLib } from "../utils/pdfjs";

// Import modular subcomponents
import { 
  processingSteps, 
  formatBytes, 
  getAcceptAttribute, 
  getToolBlockColor, 
  getToolHeroDescription, 
  getToolEyebrow, 
  getToolFeatures, 
  getToolIllustration 
} from "./upload/UploadHelpers";
import { FilePreviewCard } from "./upload/FilePreviewCard";
import { PdfPageCard } from "./upload/PdfPageCard";
import { PreviewModal } from "./upload/PreviewModal";
import { UploadHero } from "./upload/UploadHero";
import { SuccessState } from "./upload/SuccessState";
import { OptionsSidebar } from "./upload/OptionsSidebar";
import { indianSeoRoutes } from "../data/seoPages";

type UploadPanelProps = {
  selectedTool: string;
  onUpload: (files: FileList, options?: any) => void;
  onBack: () => void;
  activeJob: any;
  onReset: () => void;
  onStagedChange?: (hasStaged: boolean) => void;
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
  jobs?: any[];
  onRetry?: (job: any) => void;
  onDeleteJob?: (jobId: string) => void;
};

export function UploadPanel({ 
  selectedTool, 
  onUpload, 
  onBack, 
  activeJob, 
  onReset, 
  onStagedChange,
  onToolSelect,
  onViewChange,
  jobs,
  onRetry,
  onDeleteJob
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewScale, setPreviewScale] = useState(0.95);
  const [previewRotation, setPreviewRotation] = useState(0);

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
  const [pdfPassword, setPdfPassword] = useState("pdfmount");
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

  // New tools states
  const [grayscaleMode, setGrayscaleMode] = useState<"all" | "images" | "text">("all");
  const [optimizeLevel, setOptimizeLevel] = useState<"standard" | "maximum" | "minimum">("standard");
  const [txtEncoding, setTxtEncoding] = useState("utf-8");
  const [htmlLayout, setHtmlLayout] = useState<"formatted" | "simple">("formatted");
  const [pngDpi, setPngDpi] = useState("150");
  const [metadataTitle, setMetadataTitle] = useState("");
  const [metadataAuthor, setMetadataAuthor] = useState("");
  const [metadataSubject, setMetadataSubject] = useState("");
  const [metadataKeywords, setMetadataKeywords] = useState("");
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [resizePageSize, setResizePageSize] = useState<"a4" | "letter" | "legal">("a4");

  // Page Grid States (for Rotate, Remove, Organize, Extract, Split)
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(0);
  const [rotationMap, setRotationMap] = useState<{ [pageNum: number]: number }>({});
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const isVisualEditorTool = [
    "Edit PDF",
    "PDF Annotator",
    "Crop PDF"
  ].includes(selectedTool);

  const blockColor = getToolBlockColor(selectedTool);
  const toolColor = getToolBlockColor(selectedTool); // Visual compatibility
  const heroDesc = getToolHeroDescription(selectedTool);
  const eyebrow = getToolEyebrow(selectedTool);
  const features = getToolFeatures(selectedTool);
  const heroIllustration = getToolIllustration(selectedTool, blockColor);

  // Automatically select extreme compression if target size is <= 200kb
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const match = path.match(/^\/compress-pdf-to-(\d+)(kb|mb)$/i);
      const indianMatch = indianSeoRoutes.find(r => r.route === path);
      if (indianMatch) {
        const sizeVal = parseInt(indianMatch.size, 10);
        if (sizeVal <= 200) {
          setCompressionLevel("extreme");
        } else {
          setCompressionLevel("recommended");
        }
      } else if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit === "kb" && val <= 200) {
          setCompressionLevel("extreme");
        } else {
          setCompressionLevel("recommended");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (stagedFiles && stagedFiles.length > 0) {
      const file = stagedFiles[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") {
        setLoadingPdf(true);
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          try {
            const pdfjsLib = await getPdfjsLib();
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
          } finally {
            setLoadingPdf(false);
          }
        };
        fileReader.onerror = () => setLoadingPdf(false);
        fileReader.readAsArrayBuffer(file);
      } else {
        setPdfDoc(null);
        setTotalPdfPages(0);
        setLoadingPdf(false);
      }
    } else {
      setPdfDoc(null);
      setTotalPdfPages(0);
      setRotationMap({});
      setRemovedPages(new Set());
      setSelectedPages(new Set());
      setPageOrder([]);
      setLoadingPdf(false);
    }
  }, [stagedFiles, selectedTool]);

  useEffect(() => {
    if (activeJob?.status === "Processing") {
      setStepIdx(0);
      const interval = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % processingSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeJob?.status]);

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

    // New tools options
    options.grayscaleMode = grayscaleMode;
    options.optimizeLevel = optimizeLevel;
    options.txtEncoding = txtEncoding;
    options.htmlLayout = htmlLayout;
    options.pngDpi = pngDpi;
    options.metadataTitle = metadataTitle;
    options.metadataAuthor = metadataAuthor;
    options.metadataSubject = metadataSubject;
    options.metadataKeywords = metadataKeywords;
    options.headerText = headerText;
    options.footerText = footerText;
    options.resizePageSize = resizePageSize;

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

  function openPreview(file: File) {
    setPreviewScale(0.95);
    setPreviewRotation(0);
    setPreviewFile(file);
  }

  // Determine viewMode
  let viewMode: "idle" | "staged" | "processing" | "completed" = "idle";
  if (activeJob?.status === "Processing") {
    viewMode = "processing";
  } else if (activeJob?.status === "Done") {
    viewMode = "completed";
  } else if (stagedFiles && stagedFiles.length > 0) {
    viewMode = "staged";
  }

  if (viewMode === "idle" || viewMode === "processing") {
    return (
      <div style={{ width: "100%", overflowY: "auto" }}>
        {viewMode === "idle" ? (
          <UploadHero
            selectedTool={selectedTool}
            blockColor={blockColor}
            eyebrow={eyebrow}
            heroDesc={heroDesc}
            triggerFileInput={triggerFileInput}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleFileChange={handleFileChange}
            getAcceptAttribute={getAcceptAttribute}
            fileInputRef={fileInputRef}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            heroIllustration={heroIllustration}
            jobs={jobs}
            onRetry={onRetry}
            onDeleteJob={onDeleteJob}
            features={features}
            onToolSelect={onToolSelect}
            onViewChange={onViewChange}
          />
        ) : (
          /* Processing state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px", padding: "48px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: `3px solid ${blockColor}`, borderTopColor: "#000000", animation: "spin 0.8s linear infinite" }}></div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, color: "#000000", margin: 0 }}>Processing your request</h3>
            <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "16px", color: "#4c4546", margin: 0, fontWeight: 320 }}>{processingSteps[stepIdx]}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="workspace-full-bleed-container animate-fade-in">
      {viewMode === "staged" && stagedFiles && stagedFiles.length > 0 ? (
        selectedTool === "Sign PDF" ? (
          <SignEditor
            file={stagedFiles[0]}
            onClose={onBack}
            onSave={(files, options) => {
              onUpload(files, options);
            }}
          />
        ) : selectedTool === "Crop PDF" ? (
          <CropEditor
            file={stagedFiles[0]}
            onClose={onBack}
            onSave={(files, options) => {
              onUpload(files, options);
            }}
          />
        ) : isVisualEditorTool ? (
          <PdfEditor
            file={stagedFiles[0]}
            selectedTool={selectedTool}
            onClose={onBack}
            onSave={(files, options) => {
              onUpload(files, options);
            }}
          />
        ) : (
          <div className="workspace-split-container">
          {/* ── LEFT-CENTER: Workspace Canvas Preview Frame ── */}
          <div className="workspace-canvas">
            <div className="document-preview-frame" style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--c-bg)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.03)", overflow: "hidden", height: "100%", width: "100%" }}>
              {/* File header bar (inside preview frame) */}
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-bg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px", color: toolColor, display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "15px", fontWeight: 600, color: "var(--c-text)" }}>
                      {stagedFiles.length === 1 ? stagedFiles[0].name : `${stagedFiles.length} files selected`}
                    </div>
                    <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {stagedFiles.reduce((acc, f) => acc + f.size, 0) > 1024 * 1024
                        ? `${(stagedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                        : `${(stagedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(0)} KB`}
                      {totalPdfPages > 0 && ` • ${totalPdfPages} ${totalPdfPages === 1 ? "page" : "pages"}`}
                      {stagedFiles.length > 1 && ` • ${stagedFiles.length} files`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={triggerAddMoreInput}
                    style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", fontWeight: 540, color: "var(--c-text)", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", display: "flex", alignItems: "center", gap: "6px", transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget.style.background = "var(--accent-soft)")}
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
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "6px", color: "var(--text-muted)", display: "flex", alignItems: "center", fontSize: "20px", lineHeight: 1, transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget.style.background = "var(--accent-soft)")}
                    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                  >×</button>
                </div>
              </div>

              {/* Page/file grid inside the preview frame card */}
              <div className="workspace-grid">
                {loadingPdf ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="canvas-file-card page-card skeleton" style={{ aspectRatio: "3/4", background: "var(--c-bg)", borderRadius: "8px", border: "1px solid var(--border)", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", opacity: 0.6 }}>
                      <div className="file-card-preview-box page-preview-box" style={{ width: "100%", height: "100%", background: "var(--accent-soft)", borderRadius: "4px", display: "flex", alignItems: "center", justifyItems: "center" }}>
                        <div className="mini-spinner" style={{ margin: "auto", width: "16px", height: "16px", border: "2px solid var(--border)", borderTopColor: toolColor, borderRadius: "50%", animation: "spin 0.6s linear infinite" }}></div>
                      </div>
                      <div style={{ width: "60px", height: "10px", background: "var(--border)", borderRadius: "2px", marginTop: "8px" }}></div>
                    </div>
                  ))
                ) : pdfDoc ? (
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

                {(!pdfDoc && !loadingPdf) && (
                  <div
                    onClick={triggerAddMoreInput}
                    className="add-file-card"
                    style={{ aspectRatio: "3/4", border: "2px dashed var(--border)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500, transition: "border-color 0.15s, background 0.15s" }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent)"; (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Plus size={24} />
                    <span>Add Files</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Settings Panel (Options / Controller Sidebar) ── */}
          <div className="workspace-sidebar" style={{ background: blockColor }}>
            <div style={{ padding: "20px 24px 0px", display: "flex", alignItems: "center", background: "transparent" }}>
              <button
                onClick={() => { clearSelection(); onBack(); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 540, color: "rgba(0, 0, 0, 0.6)", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "color 0.15s" }}
                onMouseOver={e => (e.currentTarget.style.color = "#000000")}
                onMouseOut={e => (e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                <span>{selectedTool}</span>
              </button>
            </div>

            <div style={{ flex: 1, padding: "0" }}>
              <OptionsSidebar
                selectedTool={selectedTool}
                toolColor={toolColor}
                runProcess={runProcess}
                clearSelection={clearSelection}
                compressionLevel={compressionLevel}
                setCompressionLevel={setCompressionLevel}
                fileNameStamps={fileNameStamps}
                setFileNameStamps={setFileNameStamps}
                includeTOC={includeTOC}
                setIncludeTOC={setIncludeTOC}
                pageOrientation={pageOrientation}
                setPageOrientation={setPageOrientation}
                pageSize={pageSize}
                setPageSize={setPageSize}
                pageMargin={pageMargin}
                setPageMargin={setPageMargin}
                mergeAll={mergeAll}
                setMergeAll={setMergeAll}
                conversionMode={conversionMode}
                setConversionMode={setConversionMode}
                splitMode={splitMode}
                setSplitMode={setSplitMode}
                splitRanges={splitRanges}
                setSplitRanges={setSplitRanges}
                watermarkText={watermarkText}
                setWatermarkText={setWatermarkText}
                watermarkColor={watermarkColor}
                setWatermarkColor={setWatermarkColor}
                watermarkOpacity={watermarkOpacity}
                setWatermarkOpacity={setWatermarkOpacity}
                signatureText={signatureText}
                setSignatureText={setSignatureText}
                signatureStyle={signatureStyle}
                setSignatureStyle={setSignatureStyle}
                pdfPassword={pdfPassword}
                setPdfPassword={setPdfPassword}
                translateLang={translateLang}
                setTranslateLang={setTranslateLang}
                summarizeLength={summarizeLength}
                setSummarizeLength={setSummarizeLength}
                batesPrefix={batesPrefix}
                setBatesPrefix={setBatesPrefix}
                batesStart={batesStart}
                setBatesStart={setBatesStart}
                pageNumberPos={pageNumberPos}
                setPageNumberPos={setPageNumberPos}
                pageNumberSize={pageNumberSize}
                setPageNumberSize={setPageNumberSize}
                cropMargin={cropMargin}
                setCropMargin={setCropMargin}
                copilotMode={copilotMode}
                setCopilotMode={setCopilotMode}
                txtFontSize={txtFontSize}
                setTxtFontSize={setTxtFontSize}
                htmlPageSize={htmlPageSize}
                setHtmlPageSize={setHtmlPageSize}
                totalPdfPages={totalPdfPages}
                rotationMap={rotationMap}
                setRotationMap={setRotationMap}
                removedPages={removedPages}
                setRemovedPages={setRemovedPages}
                selectedPages={selectedPages}
                setSelectedPages={setSelectedPages}
                setPageOrder={setPageOrder}
                flattenMode={flattenMode}
                setFlattenMode={setFlattenMode}
                repairMode={repairMode}
                setRepairMode={setRepairMode}
                repairCompatibility={repairCompatibility}
                setRepairCompatibility={setRepairCompatibility}
                wordMargins={wordMargins}
                setWordMargins={setWordMargins}
                wordBookmarks={wordBookmarks}
                setWordBookmarks={setWordBookmarks}
                wordLinkColors={wordLinkColors}
                setWordLinkColors={setWordLinkColors}
                excelOrientation={excelOrientation}
                setExcelOrientation={setExcelOrientation}
                excelSheetRendering={excelSheetRendering}
                setExcelSheetRendering={setExcelSheetRendering}
                excelGridlines={excelGridlines}
                setExcelGridlines={setExcelGridlines}
                pptOrientation={pptOrientation}
                setPptOrientation={setPptOrientation}
                pptSlidesLayout={pptSlidesLayout}
                setPptSlidesLayout={setPptSlidesLayout}
                pptNotes={pptNotes}
                setPptNotes={setPptNotes}
                pdfToWordMode={pdfToWordMode}
                setPdfToWordMode={setPdfToWordMode}
                pdfToWordOcr={pdfToWordOcr}
                setPdfToWordOcr={setPdfToWordOcr}
                pdfToWordLang={pdfToWordLang}
                setPdfToWordLang={setPdfToWordLang}
                pdfToExcelData={pdfToExcelData}
                setPdfToExcelData={setPdfToExcelData}
                pdfToExcelSeparator={pdfToExcelSeparator}
                setPdfToExcelSeparator={setPdfToExcelSeparator}
                pdfToExcelDetectNum={pdfToExcelDetectNum}
                setPdfToExcelDetectNum={setPdfToExcelDetectNum}
                pdfToPptLayout={pdfToPptLayout}
                setPdfToPptLayout={setPdfToPptLayout}
                pdfToPptBorders={pdfToPptBorders}
                setPdfToPptBorders={setPdfToPptBorders}
                pdfToPptCompress={pdfToPptCompress}
                setPdfToPptCompress={setPdfToPptCompress}
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
                ocrEngineMode={ocrEngineMode}
                setOcrEngineMode={setOcrEngineMode}
                ocrLanguage={ocrLanguage}
                setOcrLanguage={setOcrLanguage}
                grayscaleMode={grayscaleMode}
                setGrayscaleMode={setGrayscaleMode}
                optimizeLevel={optimizeLevel}
                setOptimizeLevel={setOptimizeLevel}
                txtEncoding={txtEncoding}
                setTxtEncoding={setTxtEncoding}
                htmlLayout={htmlLayout}
                setHtmlLayout={setHtmlLayout}
                pngDpi={pngDpi}
                setPngDpi={setPngDpi}
                metadataTitle={metadataTitle}
                setMetadataTitle={setMetadataTitle}
                metadataAuthor={metadataAuthor}
                setMetadataAuthor={setMetadataAuthor}
                metadataSubject={metadataSubject}
                setMetadataSubject={setMetadataSubject}
                metadataKeywords={metadataKeywords}
                setMetadataKeywords={setMetadataKeywords}
                headerText={headerText}
                setHeaderText={setHeaderText}
                footerText={footerText}
                setFooterText={setFooterText}
                resizePageSize={resizePageSize}
                setResizePageSize={setResizePageSize}
                outputQuality={outputQuality}
                setOutputQuality={setOutputQuality}
              />
            </div>
          </div>
        </div>
      ) ) : (
        activeJob && (
          <SuccessState
            selectedTool={selectedTool}
            blockColor={blockColor}
            activeJob={activeJob}
            copied={copied}
            handleShare={handleShare}
            clearSelection={clearSelection}
            onToolSelect={onToolSelect}
            onViewChange={onViewChange}
          />
        )
      )}
      <PreviewModal
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
        previewScale={previewScale}
        setPreviewScale={setPreviewScale}
        previewRotation={previewRotation}
        setPreviewRotation={setPreviewRotation}
      />
    </div>
  );
}
