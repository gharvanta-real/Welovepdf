import React, { useState, useEffect, useRef } from "react";
import { Check, Trash2 } from "lucide-react";
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

  // Hoisted annotation props
  annotCategory: "text" | "draw" | "shape" | "processing";
  setAnnotCategory: (val: "text" | "draw" | "shape" | "processing") => void;
  annotFont: string;
  annotFontSize: string;
  annotTextColor: string;
  annotBold: boolean;
  annotItalic: boolean;
  annotUnderline: boolean;
  annotAlign: "left" | "center" | "right";
  activeDrawTool: "pen" | "highlighter";
  setActiveDrawTool: (val: "pen" | "highlighter") => void;
  annotHlColor: string;
  annotHlOpacity: number;
  annotPenColor: string;
  annotPenSize: number;
  annotPenOpacity: number;
  annotPenStyle: "solid" | "dashed" | "dotted";
  annotShapeType: string;
  annotShapeFill: string;
  annotShapeColor: string;
  annotShapeBorderWidth: number;
  annotShapeStrokeStyle: "solid" | "dashed" | "dotted";
  annotShapeCornerRadius: number;
  annotShapeShadow: boolean;
  annotElements: any[];
  setAnnotElements: React.SetStateAction<any>;

  // Undo/Redo props
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushUndo: (elements: any[]) => void;
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
  progressPercent,
  annotCategory,
  setAnnotCategory,
  annotFont,
  annotFontSize,
  annotTextColor,
  annotBold,
  annotItalic,
  annotUnderline,
  annotAlign,
  activeDrawTool,
  setActiveDrawTool,
  annotHlColor,
  annotHlOpacity,
  annotPenColor,
  annotPenSize,
  annotPenOpacity,
  annotPenStyle,
  annotShapeType,
  annotShapeFill,
  annotShapeColor,
  annotShapeBorderWidth,
  annotShapeStrokeStyle,
  annotShapeCornerRadius,
  annotShapeShadow,
  annotElements,
  setAnnotElements,
  undo,
  redo,
  canUndo,
  canRedo,
  pushUndo
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

            const isEditor = activeTool === "PDF Annotator" || activeTool === "Edit PDF";
            const scale = isEditor ? 1.25 : 0.28;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale });
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
  }, [stagedFiles, activeTool]);

  // Interactive Annotator States
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);
  
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementsBeforeDragRef = useRef<any[] | null>(null);

  // Get percentage coordinates inside page container
  const getPageCoords = (e: React.MouseEvent, pageElement: HTMLDivElement) => {
    const rect = pageElement.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const handleMouseDown = (e: React.MouseEvent, pageNum: number, pageElement: HTMLDivElement) => {
    const coords = getPageCoords(e, pageElement);

    // Clicked an existing overlay element
    const clickedEl = [...annotElements].reverse().find(el => {
      if (el.page !== pageNum) return false;
      const w = el.width || 12;
      const h = el.height || 6;
      return coords.x >= el.x && coords.x <= el.x + w && coords.y >= el.y && coords.y <= el.y + h;
    });

    if (clickedEl) {
      e.stopPropagation();
      setSelectedElementId(clickedEl.id);
      setIsDragging(true);
      setDragOffset({ x: coords.x - clickedEl.x, y: coords.y - clickedEl.y });
      elementsBeforeDragRef.current = [...annotElements]; // capture state before drag
      return;
    }

    setSelectedElementId(null);

    if (annotCategory === "text") {
      pushUndo(annotElements); // snapshot before text creation
      const newText = {
        id: "text-" + Date.now(),
        type: "text" as const,
        page: pageNum,
        x: coords.x,
        y: coords.y - 2,
        content: "Double-click to edit",
        color: annotTextColor,
        fontSize: Number(annotFontSize),
        fontFamily: annotFont,
        isBold: annotBold,
        isItalic: annotItalic,
        isUnderline: annotUnderline,
        align: annotAlign
      };
      setAnnotElements((prev: any) => [...prev, newText]);
      setSelectedElementId(newText.id);
    } else if (annotCategory === "draw") {
      setIsDrawingPen(true);
      setCurrentPathPoints([{ x: coords.x, y: coords.y }]);
    } else if (annotCategory === "shape") {
      setIsDrawingShape(true);
      setShapeStart(coords);
      setShapeCurrent(coords);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, pageNum: number, pageElement: HTMLDivElement) => {
    const coords = getPageCoords(e, pageElement);

    if (isDragging && selectedElementId) {
      setAnnotElements((prev: any) => prev.map((el: any) => {
        if (el.id === selectedElementId) {
          const w = el.width || 12;
          const h = el.height || 6;
          return {
            ...el,
            x: Math.min(Math.max(coords.x - dragOffset.x, 0), 100 - w),
            y: Math.min(Math.max(coords.y - dragOffset.y, 0), 100 - h)
          };
        }
        return el;
      }));
    } else if (isDrawingPen && annotCategory === "draw") {
      setCurrentPathPoints(prev => [...prev, { x: coords.x, y: coords.y }]);
    } else if (isDrawingShape && annotCategory === "shape" && shapeStart) {
      setShapeCurrent(coords);
    }
  };

  const handleMouseUp = (e: React.MouseEvent, pageNum: number) => {
    if (isDrawingPen && annotCategory === "draw" && currentPathPoints.length > 1) {
      pushUndo(annotElements); // snapshot before pen line creation
      const isPen = activeDrawTool === "pen";
      const newDrawing = {
        id: "draw-" + Date.now(),
        type: "drawing" as const,
        page: pageNum,
        x: 0,
        y: 0,
        points: currentPathPoints,
        color: isPen ? annotPenColor : annotHlColor,
        thickness: isPen ? annotPenSize : 12,
        opacity: isPen ? (annotPenOpacity / 100) : (annotHlOpacity / 100)
      };
      setAnnotElements((prev: any) => [...prev, newDrawing]);
      setCurrentPathPoints([]);
      setIsDrawingPen(false);
    } else if (isDrawingShape && annotCategory === "shape" && shapeStart && shapeCurrent) {
      pushUndo(annotElements); // snapshot before shape creation
      const x = Math.min(shapeStart.x, shapeCurrent.x);
      const y = Math.min(shapeStart.y, shapeCurrent.y);
      const w = Math.max(Math.abs(shapeCurrent.x - shapeStart.x), 2);
      const h = Math.max(Math.abs(shapeCurrent.y - shapeStart.y), 2);

      const fillColor = annotShapeFill === "solid" ? annotShapeColor : annotShapeFill === "semi-transparent" ? `${annotShapeColor}80` : "transparent";

      const newShape = {
        id: "shape-" + Date.now(),
        type: "shape" as const,
        page: pageNum,
        x,
        y,
        width: w,
        height: h,
        shapeType: annotShapeType.toLowerCase().includes("circle") ? ("circle" as const) :
                   annotShapeType.toLowerCase().includes("line") ? ("line" as const) :
                   annotShapeType.toLowerCase().includes("arrow") ? ("arrow" as const) :
                   annotShapeType.toLowerCase().includes("diamond") ? ("diamond" as const) : ("rectangle" as const),
        color: annotShapeColor,
        bgColor: fillColor,
        thickness: annotShapeBorderWidth,
        commentText: JSON.stringify({
          cornerRadius: annotShapeCornerRadius,
          strokeStyle: annotShapeStrokeStyle,
          shadow: annotShapeShadow,
          actualShapeType: annotShapeType
        })
      };
      setAnnotElements((prev: any) => [...prev, newShape]);
      setIsDrawingShape(false);
      setShapeStart(null);
      setShapeCurrent(null);
    } else {
      if (isDragging && elementsBeforeDragRef.current) {
        // Drag complete, compare to see if it actually moved
        const hasMoved = JSON.stringify(elementsBeforeDragRef.current) !== JSON.stringify(annotElements);
        if (hasMoved) {
          pushUndo(elementsBeforeDragRef.current);
        }
        elementsBeforeDragRef.current = null;
      }
      setIsDragging(false);
    }
  };

  const updateTextContent = (id: string, newContent: string) => {
    setAnnotElements((prev: any) => prev.map((el: any) => {
      if (el.id === id) {
        return { ...el, content: newContent };
      }
      return el;
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return;
        }
        if (selectedElementId) {
          pushUndo(annotElements); // snapshot before delete key
          setAnnotElements((prev: any) => prev.filter((el: any) => el.id !== selectedElementId));
          setSelectedElementId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, annotElements]);

  const renderShapeSvgContent = (shapeType: string, color: string, bgColor: string, thickness: number, dashArray: string, cornerRadius: number, id: string) => {
    const normShape = shapeType.toLowerCase();
    const arrowDefs = (normShape.includes("arrow")) && (
      <defs>
        <marker id={`arrowhead-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
        <marker id={`arrowhead-start-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 10 0 L 0 5 L 10 10 z" fill={color} />
        </marker>
      </defs>
    );

    if (normShape === "rectangle") {
      return <rect x="0" y="0" width="100" height="100" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "rounded rectangle") {
      return <rect x="0" y="0" width="100" height="100" rx={cornerRadius} ry={cornerRadius} fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "circle" || normShape === "ellipse") {
      return <ellipse cx="50" cy="50" rx="50" ry="50" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "triangle") {
      return <polygon points="50,0 100,100 0,100" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "right triangle") {
      return <polygon points="0,0 100,100 0,100" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "star 4") {
      return <polygon points="50,0 65,35 100,50 65,65 50,100 35,65 0,50 35,35" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "star 5") {
      return <polygon points="50,0 63,38 100,38 70,62 82,100 50,75 18,100 30,62 0,38 37,38" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "pentagon") {
      return <polygon points="50,0 100,38 81,100 19,100 0,38" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "hexagon") {
      return <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "line") {
      return <line x1="0" y1="100" x2="100" y2="0" stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "arrow") {
      return (
        <>
          {arrowDefs}
          <line x1="0" y1="100" x2="95" y2="5" stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} markerEnd={`url(#arrowhead-${id})`} vectorEffect="non-scaling-stroke" />
        </>
      );
    }
    if (normShape === "double arrow") {
      return (
        <>
          {arrowDefs}
          <line x1="5" y1="95" x2="95" y2="5" stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} markerStart={`url(#arrowhead-start-${id})`} markerEnd={`url(#arrowhead-${id})`} vectorEffect="non-scaling-stroke" />
        </>
      );
    }
    if (normShape === "speech bubble") {
      return <path d="M 10 10 L 90 10 L 90 70 L 40 70 L 20 90 L 30 70 L 10 70 Z" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "heart") {
      return <path d="M 50 25 C 50 25 35 0 15 0 C 0 0 0 20 0 35 C 0 60 50 100 50 100 C 50 100 100 60 100 35 C 100 20 100 0 85 0 C 65 0 50 25 50 25 Z" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "cloud") {
      return <path d="M 25 60 A 20 20 0 0 1 30 30 A 25 25 0 0 1 70 30 A 20 20 0 0 1 75 60 A 15 15 0 0 1 90 75 A 15 15 0 0 1 75 90 L 25 90 A 15 15 0 0 1 10 75 A 15 15 0 0 1 25 60 Z" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    if (normShape === "cross") {
      return <path d="M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z" fill={bgColor} stroke={color} strokeWidth={thickness} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />;
    }
    return <rect x="0" y="0" width="100" height="100" fill={bgColor} stroke={color} strokeWidth={thickness} vectorEffect="non-scaling-stroke" />;
  };

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

  const isInteractiveEditor = activeTool === "PDF Annotator" || activeTool === "Edit PDF";

  if (isInteractiveEditor && stagedFiles && stagedFiles.length > 0) {
    return (
      <div className="uw-canvas-container" style={{ justifyContent: "center", padding: 0, overflow: "hidden" }}>
        {loadingPages ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", gap: "12px", background: "#f8fafc" }}>
            <div className="uw-processing-spinner" style={{ width: "36px", height: "36px" }} />
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Loading PDF pages...</span>
          </div>
        ) : (
          <div className="pdf-annotator-workspace" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
            overflowY: "auto",
            background: "#f1f5f9",
            padding: "32px 16px",
            gap: "32px"
          }}>
            {pdfPages.map((page) => {
              const pageContainerRef = React.createRef<HTMLDivElement>();
              return (
                <div 
                  key={`page-${page.pageNum}`}
                  ref={pageContainerRef}
                  style={{
                    position: "relative",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    width: "fit-content",
                    height: "fit-content",
                    userSelect: "none"
                  }}
                >
                  <img 
                    src={page.url}
                    alt={`Page ${page.pageNum}`}
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "6px",
                      pointerEvents: "none"
                    }}
                  />
                  {/* Overlay container for annotations */}
                  <div
                    onMouseDown={(e) => {
                      if (pageContainerRef.current) {
                        handleMouseDown(e, page.pageNum, pageContainerRef.current);
                      }
                    }}
                    onMouseMove={(e) => {
                      if (pageContainerRef.current) {
                        handleMouseMove(e, page.pageNum, pageContainerRef.current);
                      }
                    }}
                    onMouseUp={(e) => handleMouseUp(e, page.pageNum)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      cursor: annotCategory === "text" ? "text" : annotCategory === "draw" ? "crosshair" : annotCategory === "shape" ? "crosshair" : "default",
                      zIndex: 20
                    }}
                  >
                    {/* SVG Drawings Pen Path */}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible", zIndex: 5 }}>
                      {annotElements.filter(el => el.page === page.pageNum && el.type === "drawing").map(el => {
                        if (!el.points || el.points.length < 2) return null;
                        const d = el.points.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");
                        return (
                          <path 
                            key={el.id} 
                            d={d} 
                            stroke={el.color} 
                            strokeWidth={el.thickness} 
                            strokeOpacity={el.opacity ?? 1}
                            fill="none" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        );
                      })}
                      {isDrawingPen && currentPathPoints.length > 1 && (
                        <path
                          d={currentPathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ")}
                          stroke={activeDrawTool === "pen" ? annotPenColor : annotHlColor} 
                          strokeWidth={activeDrawTool === "pen" ? annotPenSize : 12} 
                          strokeOpacity={activeDrawTool === "pen" ? (annotPenOpacity / 100) : (annotHlOpacity / 100)}
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>

                    {/* Shape elements */}
                    {annotElements.filter(el => el.page === page.pageNum && el.type === "shape").map(el => {
                      const isSel = selectedElementId === el.id;
                      let cornerRadius = 0;
                      let strokeStyle = "solid";
                      let shadow = false;
                      let actualShapeType = "Rectangle";
                      try {
                        if (el.commentText) {
                          const meta = JSON.parse(el.commentText);
                          cornerRadius = meta.cornerRadius ?? 0;
                          strokeStyle = meta.strokeStyle ?? "solid";
                          shadow = meta.shadow ?? false;
                          actualShapeType = meta.actualShapeType ?? "Rectangle";
                        }
                      } catch (e) {}

                      const dashArray = strokeStyle === "dashed" ? "6,6" : strokeStyle === "dotted" ? "2,4" : "";

                      return (
                        <div
                          key={el.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                          style={{
                            position: "absolute",
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            height: `${el.height}%`,
                            border: isSel ? "1.5px dashed #2563eb" : "1.5px solid transparent",
                            cursor: "move",
                            zIndex: isSel ? 100 : 10,
                            filter: shadow ? "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" : "none"
                          }}
                        >
                          <svg 
                            width="100%" 
                            height="100%" 
                            viewBox="0 0 100 100" 
                            preserveAspectRatio="none" 
                            style={{ overflow: "visible" }}
                          >
                            {renderShapeSvgContent(actualShapeType, el.color, el.bgColor, el.thickness, dashArray, cornerRadius, el.id)}
                          </svg>
                          {isSel && (
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                pushUndo(annotElements); // snapshot before delete click
                                setAnnotElements((prev: any) => prev.filter((item: any) => item.id !== el.id));
                                setSelectedElementId(null);
                              }}
                              style={{
                                position: "absolute",
                                top: "-28px",
                                right: "-6px",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                zIndex: 110
                              }}
                              title="Delete Shape"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Text elements */}
                    {annotElements.filter(el => el.page === page.pageNum && el.type === "text").map(el => {
                      const isSel = selectedElementId === el.id;

                      return (
                        <div
                          key={el.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                          style={{
                            position: "absolute",
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            border: isSel ? "1.5px dashed #2563eb" : "1.5px solid transparent",
                            cursor: "move",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: isSel ? "rgba(37,99,235,0.02)" : "transparent",
                            minWidth: "120px",
                            zIndex: isSel ? 100 : 10
                          }}
                        >
                          {isSel ? (
                            <input
                              autoFocus
                              type="text"
                              value={el.content}
                              onChange={(e) => updateTextContent(el.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                color: el.color || "#111111",
                                fontSize: `${el.fontSize || 14}px`,
                                fontFamily: el.fontFamily || "Inter",
                                fontWeight: el.isBold ? "bold" : "normal",
                                fontStyle: el.isItalic ? "italic" : "normal",
                                textDecoration: `${el.isUnderline ? "underline" : ""}`,
                                textAlign: el.align || "left",
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                padding: 0,
                                width: "100%"
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                color: el.color || "#111111",
                                fontSize: `${el.fontSize || 14}px`,
                                fontFamily: el.fontFamily || "Inter",
                                fontWeight: el.isBold ? "bold" : "normal",
                                fontStyle: el.isItalic ? "italic" : "normal",
                                textDecoration: `${el.isUnderline ? "underline" : ""}`,
                                textAlign: el.align || "left",
                                display: "block",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {el.content}
                            </span>
                          )}
                          {isSel && (
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                pushUndo(annotElements); // snapshot before delete click
                                setAnnotElements((prev: any) => prev.filter((item: any) => item.id !== el.id));
                                setSelectedElementId(null);
                              }}
                              style={{
                                position: "absolute",
                                top: "-28px",
                                right: "-6px",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                zIndex: 110
                              }}
                              title="Delete Text"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Temporary shape drawing preview */}
                    {isDrawingShape && shapeStart && shapeCurrent && annotCategory === "shape" && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${Math.min(shapeStart.x, shapeCurrent.x)}%`,
                          top: `${Math.min(shapeStart.y, shapeCurrent.y)}%`,
                          width: `${Math.abs(shapeCurrent.x - shapeStart.x)}%`,
                          height: `${Math.abs(shapeCurrent.y - shapeStart.y)}%`,
                          border: `${annotShapeBorderWidth}px dashed ${annotShapeColor}`,
                          borderRadius: annotShapeType.toLowerCase().includes("circle") ? "50%" : "2px",
                          backgroundColor: "rgba(37,99,235,0.05)",
                          pointerEvents: "none",
                          zIndex: 20
                        }}
                      />
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
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
