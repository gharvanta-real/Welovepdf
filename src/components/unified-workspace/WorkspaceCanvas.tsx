import React, { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { WorkspaceToolbar } from "./WorkspaceToolbar";
import { WorkspaceSubbar } from "./WorkspaceSubbar";
import { WorkspaceStagedGrid } from "./WorkspaceStagedGrid";
import { WorkspaceUploadZone } from "./WorkspaceUploadZone";
import { FilePreviewCard, renderSmileyIllustration } from "../upload/FilePreviewCard";

interface WorkspaceCanvasProps {
  activeTool: string;
  stagedFiles: File[] | null;
  onFilesSelected: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  onAddMoreClick: () => void;
  onExecute?: () => void;
  isProcessing?: boolean;
  isCompleted?: boolean;
  activeJob?: any;
  progressPercent?: number;
}

export function WorkspaceCanvas({
  activeTool,
  stagedFiles,
  onFilesSelected,
  onRemoveFile,
  onExecute,
  isProcessing = false,
  isCompleted = false,
  activeJob,
  progressPercent
}: WorkspaceCanvasProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Staged states
  const [viewMode, setViewMode] = useState<"Files" | "Pages">("Files");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageRotations, setPageRotations] = useState<Record<string, number>>({});
  const [localRemovedPages, setLocalRemovedPages] = useState<Set<string>>(new Set());
  
  // Parsed PDF Pages state
  const [pdfPages, setPdfPages] = useState<{ pageNum: number; url: string; fileIndex: number }[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Trigger hidden input
  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  // Parse pages locally using pdf.js
  useEffect(() => {
    if (!stagedFiles || stagedFiles.length === 0) {
      setPdfPages([]);
      return;
    }

    let active = true;
    const loadAllPages = async () => {
      setLoadingPages(true);
      const allPages: typeof pdfPages = [];

      for (let i = 0; i < stagedFiles.length; i++) {
        const file = stagedFiles[i];
        const extension = file.name.split(".").pop()?.toLowerCase();

        if (extension === "pdf") {
          try {
            const fileReader = new FileReader();
            const arrayBufferPromise = new Promise<ArrayBuffer>((resolve) => {
              fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
              fileReader.readAsArrayBuffer(file);
            });
            const arrayBuffer = await arrayBufferPromise;
            const typedarray = new Uint8Array(arrayBuffer);

            const pdfjsLib = await getPdfjsLib();
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 0.28 });
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              if (context) {
                await page.render({ canvasContext: context, viewport }).promise;
                allPages.push({ pageNum, url: canvas.toDataURL(), fileIndex: i });
              }
            }
          } catch (err) {
            console.error("Error loading PDF pages:", err);
          }
        } else if (file.type.startsWith("image/")) {
          allPages.push({ pageNum: 1, url: URL.createObjectURL(file), fileIndex: i });
        }
      }

      if (active) {
        setPdfPages(allPages);
        setLoadingPages(false);
      }
    };

    loadAllPages();
    return () => { active = false; };
  }, [stagedFiles]);

  if (!stagedFiles || stagedFiles.length === 0) {
    return (
      <div className="uw-canvas-container" style={{ justifyContent: "center", padding: "24px" }}>
        <WorkspaceUploadZone 
          activeTool={activeTool} 
          onFilesSelected={onFilesSelected} 
        />
      </div>
    );
  }

  // Selections
  const handleToggleSelectFile = (idx: number) => {
    const next = new Set(selectedFiles);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedFiles(next);
  };

  const handleToggleSelectPage = (idx: number) => {
    const next = new Set(selectedPages);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedPages(next);
  };

  const handleSelectAll = (checked: boolean) => {
    if (viewMode === "Files") {
      if (checked) {
        setSelectedFiles(new Set(stagedFiles.map((_, i) => i)));
      } else {
        setSelectedFiles(new Set());
      }
    } else {
      const activePages = pdfPages.filter(p => !localRemovedPages.has(`${p.fileIndex}-${p.pageNum}`));
      if (checked) {
        setSelectedPages(new Set(activePages.map((_, i) => i)));
      } else {
        setSelectedPages(new Set());
      }
    }
  };

  // Actions
  const handleRotateLeft = () => {
    if (viewMode !== "Pages") return;
    const nextRotations = { ...pageRotations };
    selectedPages.forEach(idx => {
      const page = pdfPages[idx];
      const pageKey = `${page.fileIndex}-${page.pageNum}`;
      nextRotations[pageKey] = (nextRotations[pageKey] || 0) - 90;
    });
    setPageRotations(nextRotations);
  };

  const handleRotateRight = () => {
    if (viewMode !== "Pages") return;
    const nextRotations = { ...pageRotations };
    selectedPages.forEach(idx => {
      const page = pdfPages[idx];
      const pageKey = `${page.fileIndex}-${page.pageNum}`;
      nextRotations[pageKey] = (nextRotations[pageKey] || 0) + 90;
    });
    setPageRotations(nextRotations);
  };

  const handleRotatePageSingle = (key: string, deg: number) => {
    setPageRotations(prev => ({ ...prev, [key]: (prev[key] || 0) + deg }));
  };

  const handleDeleteSelected = () => {
    if (viewMode === "Files") {
      const sortedIndices = Array.from(selectedFiles).sort((a, b) => b - a);
      sortedIndices.forEach(idx => onRemoveFile(idx));
      setSelectedFiles(new Set());
    } else {
      const nextRemoved = new Set(localRemovedPages);
      selectedPages.forEach(idx => {
        const page = pdfPages[idx];
        nextRemoved.add(`${page.fileIndex}-${page.pageNum}`);
      });
      setLocalRemovedPages(nextRemoved);
      setSelectedPages(new Set());
    }
  };

  const handleRemovePageSingle = (key: string) => {
    const next = new Set(localRemovedPages);
    next.add(key);
    setLocalRemovedPages(next);
  };

  const isMultiFileOrPageTool = [
    "Merge PDF",
    "Split PDF",
    "Organize PDF",
    "Rotate PDF",
    "Remove Pages",
    "Extract Pages"
  ].includes(activeTool);

  const isAnySelected = viewMode === "Files" ? selectedFiles.size > 0 : selectedPages.size > 0;
  const activePagesFilter = pdfPages.filter(p => !localRemovedPages.has(`${p.fileIndex}-${p.pageNum}`));
  
  const isAllSelected = viewMode === "Files" 
    ? selectedFiles.size === stagedFiles.length 
    : selectedPages.size === activePagesFilter.length;

  if (isProcessing) {
    const isUploadingPhase = progressPercent !== undefined && progressPercent < 50;
    const processingMsg = isUploadingPhase ? "Uploading..." : (
      activeTool === "Compress PDF" ? "Optimizing document size..." :
      activeTool === "Optimize PDF" ? "Optimizing for target platform..." :
      activeTool === "Grayscale PDF" ? "Converting colors to grayscale..." :
      activeTool === "Flatten PDF" ? "Flattening interactive elements..." :
      activeTool === "Word to PDF" ? "Converting Word document to PDF..." :
      activeTool === "PDF to Word" ? "Extracting text and layout..." :
      activeTool === "JPG to PDF" ? "Assembling images into PDF..." :
      activeTool === "PDF to JPG" ? "Rendering pages to images..." :
      activeTool === "Excel to PDF" ? "Converting spreadsheet to PDF..." :
      activeTool === "PPT to PDF" ? "Converting presentation to PDF..." :
      activeTool === "Merge PDF" ? "Merging documents together..." :
      activeTool === "Split PDF" ? "Splitting document into parts..." :
      activeTool === "Repair PDF" ? "Analyzing and repairing structure..." :
      activeTool === "Protect PDF" ? "Encrypting document with password..." :
      activeTool === "Unlock PDF" ? "Removing document restrictions..." :
      activeTool === "Watermark PDF" ? "Applying watermark to pages..." :
      activeTool === "Edit PDF Metadata" ? "Updating document metadata..." :
      activeTool === "PDF OCR" ? "Running AI text recognition..." :
      activeTool === "Summarize PDF" ? "Generating AI summary..." :
      activeTool === "Translate PDF" ? "Translating document content..." :
      "Processing document..."
    );

    const tipMap: Record<string, string> = {
      "Compress PDF": "Compressing an important PDF? Use our Protect tool after to encrypt it with a password!",
      "Protect PDF": "After protecting, keep your password safe — it cannot be recovered if lost.",
      "Merge PDF": "You can drag & drop to reorder pages before merging next time.",
      "Split PDF": "After splitting, use Merge to combine specific parts back together.",
      "PDF to Word": "For best results, use PDFs with selectable text rather than scanned images.",
      "PDF OCR": "OCR works best on clean, high-resolution scans. Try deskewing first.",
      "Translate PDF": "Translation quality improves with PDFs that have clear, structured text.",
      "Summarize PDF": "Longer documents produce richer summaries with the Detailed option.",
      "Watermark PDF": "Use a light opacity watermark to keep document readability intact.",
      "Unlock PDF": "Only remove password protection from documents you own or have rights to.",
    };

    const tip = tipMap[activeTool] || "Need to process multiple files? You can use Merge PDF to combine them first.";
    const fileName = stagedFiles[0]?.name ?? "";
    const fileSize = stagedFiles[0] ? `${Math.round(stagedFiles[0].size / 1024)} kB` : "";

    return (
      <div className="uw-processing-stage">
        {/* Static document preview card */}
        <div className="uw-processing-doc-card">
          <FilePreviewCard
            file={stagedFiles[0]}
            idx={0}
            toolColor="#2563eb"
            onRemove={() => {}}
            readOnly={true}
          />
        </div>

        {/* Filename + size */}
        <div className="uw-processing-filename">
          {fileName}{fileSize ? ` (${fileSize})` : ""}
        </div>

        {/* Bold "Working..." */}
        <div className="uw-processing-working">{processingMsg}</div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="uw-success-canvas-container">
        <div className="uw-success-preview-wrapper">
          <div className="uw-success-badge">
            <Check size={14} strokeWidth={3.5} />
          </div>
          <FilePreviewCard
            file={stagedFiles[0]}
            idx={0}
            toolColor="#2563eb"
            onRemove={() => {}}
            readOnly={true}
          />
        </div>
        <span className="uw-success-filename">{activeJob?.file || stagedFiles[0].name}</span>
        <span className="uw-success-filesize">
          {activeJob?.size || "Ready"}
          {activeTool === "Compress PDF" && activeJob?.originalSizeBytes && activeJob?.finalSizeBytes && (
            <span style={{ color: "#16a34a", fontWeight: 700, marginLeft: "6px" }}>
              ({Math.round(((activeJob.originalSizeBytes - activeJob.finalSizeBytes) / activeJob.originalSizeBytes) * 100)}% smaller!)
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="uw-canvas-container" style={{ justifyContent: "flex-start", padding: 0 }}>
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        onChange={handleFileInputChange} 
        style={{ display: "none" }} 
      />

      <div className={`uw-staged-canvas ${!isMultiFileOrPageTool ? "simple-canvas" : ""}`} style={{ border: "none", borderRadius: 0 }}>
        {/* 1. SECONDARY TOOLBAR */}
        {isMultiFileOrPageTool && (
          <WorkspaceToolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddClick={handleAddClick}
            handleRotateLeft={handleRotateLeft}
            handleRotateRight={handleRotateRight}
            handleDeleteSelected={handleDeleteSelected}
            isAnySelected={isAnySelected}
            onExecute={onExecute}
          />
        )}

        {/* 2. SUB-BAR FILTERS/VIEWS */}
        {isMultiFileOrPageTool && (
          <WorkspaceSubbar 
            isAllSelected={isAllSelected}
            onSelectAllChange={handleSelectAll}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            stagedFilesCount={stagedFiles.length}
            pdfPagesCount={activePagesFilter.length}
            viewMode={viewMode}
          />
        )}

        {/* 3. CONTENT AREA */}
        {loadingPages && isMultiFileOrPageTool ? (
          <div className="uw-staged-grid" style={{ flex: 1, padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px", alignContent: "start" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="canvas-file-card skeleton-card" style={{ cursor: "default", width: "220px", height: "280px", maxWidth: "220px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                <div className="file-card-preview-box skeleton-shimmer" style={{ flex: 1, width: "100%", height: "calc(100% - 52px)", backgroundColor: "#f1f5f9", display: "flex", alignItems: "stretch", justifyContent: "stretch", overflow: "hidden" }}>
                  {renderSmileyIllustration("LOADING", "#e2e8f0", "#cbd5e1", { isLoading: true })}
                </div>
                <div className="file-card-meta" style={{ height: "52px", width: "100%", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", boxSizing: "border-box", gap: "6px" }}>
                  <div className="skeleton-line" style={{ width: "70%", height: "12px", backgroundColor: "#e2e8f0", borderRadius: "4px", animation: "uwPulse 1.5s infinite ease-in-out" }} />
                  <div className="skeleton-line" style={{ width: "40%", height: "9px", backgroundColor: "#e2e8f0", borderRadius: "4px", animation: "uwPulse 1.5s infinite ease-in-out" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <WorkspaceStagedGrid 
            viewMode={isMultiFileOrPageTool ? viewMode : "Files"}
            layoutMode={layoutMode}
            stagedFiles={stagedFiles}
            pdfPages={pdfPages}
            selectedFiles={selectedFiles}
            selectedPages={selectedPages}
            pageRotations={pageRotations}
            localRemovedPages={localRemovedPages}
            handleToggleSelectFile={handleToggleSelectFile}
            handleToggleSelectPage={handleToggleSelectPage}
            handleRotatePageSingle={handleRotatePageSingle}
            handleDeleteSelected={handleDeleteSelected}
            onRemoveFile={onRemoveFile}
            simpleMode={!isMultiFileOrPageTool}
          />
        )}
      </div>
    </div>
  );
}
