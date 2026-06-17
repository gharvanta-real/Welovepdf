import { useState, useEffect, useRef } from "react";
import {
  Type, PenTool, Trash2, RotateCw, Download, Share2, ChevronLeft,
  ChevronRight, ZoomIn, ZoomOut, Maximize2, Hand, MousePointer,
  Highlighter, Square, Eraser, CheckCircle, FileText, Undo2, Redo2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Strikethrough, Link, MessageSquare, Stamp,
  Copy, Search, Layers, Circle, Minus,
  ArrowRight, LayoutTemplate, FileImage, Droplets,
  Lock, Unlock, FileMinus, X, Check, Plus, Hash, Crop
} from "lucide-react";
import { getToolColor } from "./ToolIcon";

interface OverlayElement {
  id: string;
  type: "text" | "drawing" | "highlight" | "shape" | "signature" | "redact" | "image" | "comment" | "link" | "stamp";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  opacity?: number;
  thickness?: number;
  points?: { x: number; y: number }[];
  shapeType?: "rectangle" | "circle" | "line" | "arrow" | "diamond";
  dataUrl?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  align?: "left" | "center" | "right" | "justify";
  redactText?: string;
  linkUrl?: string;
  stampType?: string;
  commentText?: string;
  zIndex?: number;
  locked?: boolean;
}

interface PdfEditorProps {
  file: File;
  selectedTool: string;
  onClose: () => void;
  onSave: (files: FileList, options?: any) => void;
}

type ActiveTool = "pan" | "select" | "text" | "pen" | "highlight" | "shape" | "signature" | "redact" | "image" | "comment" | "link" | "stamp" | "crop" | "eraser";
type RibbonTab = "home" | "insert" | "draw" | "layout" | "view";

const FONTS = [
  "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana",
  "Arial", "Trebuchet MS", "Garamond", "Palatino Linotype", "Comic Sans MS"
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 60, 72];

const PRESET_COLORS = [
  "#000000", "#1e293b", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#f1f5f9", "#fecaca", "#fed7aa", "#fef9c3",
  "#bbf7d0", "#a5f3fc", "#bfdbfe", "#ddd6fe", "#fbcfe8"
];

const STAMP_TYPES = ["APPROVED", "DRAFT", "CONFIDENTIAL", "REVIEWED", "VOID", "CERTIFIED", "URGENT"];

export function PdfEditor({ file, selectedTool, onClose, onSave }: PdfEditorProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [activeTab, setActiveTab] = useState<RibbonTab>("home");
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [undoHistory, setUndoHistory] = useState<OverlayElement[][]>([]);
  const [redoHistory, setRedoHistory] = useState<OverlayElement[][]>([]);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Text formatting
  const [textColor, setTextColor] = useState("#1e293b");
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [textSize, setTextSize] = useState(14);
  const [textFont, setTextFont] = useState("Helvetica");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [lineHeight, setLineHeight] = useState(1.5);

  // Draw/shape options
  const [penColor, setPenColor] = useState("#ef4444");
  const [penThickness, setPenThickness] = useState(3);
  const [markerColor, setMarkerColor] = useState("#fef08a");
  const [markerOpacity, setMarkerOpacity] = useState(0.4);
  const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "line" | "arrow" | "diamond">("rectangle");
  const [shapeColor, setShapeColor] = useState("#3b82f6");
  const [shapeFillColor, setShapeFillColor] = useState("transparent");
  const [shapeThickness, setShapeThickness] = useState(2);
  const [stampType, setStampType] = useState("APPROVED");

  // Redact
  const [redactText, setRedactText] = useState("REDACTED");
  const [redactColor, setRedactColor] = useState("#0f172a");

  // Page setup
  const [pageSize, setPageSize] = useState("Letter");
  const [pageOrientation, setPageOrientation] = useState("Portrait");
  const [pageMargins, setPageMargins] = useState("Normal");
  const [pageColumns, setPageColumns] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [cropMargin, setCropMargin] = useState(10);
  const [cropLeft, setCropLeft] = useState(5);
  const [cropRight, setCropRight] = useState(5);
  const [cropTop, setCropTop] = useState(5);
  const [cropBottom, setCropBottom] = useState(5);
  const [isCropLinked, setIsCropLinked] = useState(true);

  const handleCropLeftChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v);
      setCropRight(v);
      setCropTop(v);
      setCropBottom(v);
      setCropMargin(v * 2);
    } else {
      setCropLeft(v);
    }
  };
  const handleCropRightChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v);
      setCropRight(v);
      setCropTop(v);
      setCropBottom(v);
      setCropMargin(v * 2);
    } else {
      setCropRight(v);
    }
  };
  const handleCropTopChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v);
      setCropRight(v);
      setCropTop(v);
      setCropBottom(v);
      setCropMargin(v * 2);
    } else {
      setCropTop(v);
    }
  };
  const handleCropBottomChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v);
      setCropRight(v);
      setCropTop(v);
      setCropBottom(v);
      setCropMargin(v * 2);
    } else {
      setCropBottom(v);
    }
  };
  const handleCropMarginUniformChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    setCropMargin(v);
    setCropLeft(v / 2);
    setCropRight(v / 2);
    setCropTop(v / 2);
    setCropBottom(v / 2);
  };

  // Page operations
  const [pageRotations, setPageRotations] = useState<{ [page: number]: number }>({});
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // Signature
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigMode, setSigMode] = useState<"draw" | "type">("draw");
  const [typedSig, setTypedSig] = useState("");
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Canvas
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Color pickers visibility
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showPenColorPicker, setShowPenColorPicker] = useState(false);
  const [showMarkerColorPicker, setShowMarkerColorPicker] = useState(false);
  const [showShapeColorPicker, setShowShapeColorPicker] = useState(false);

  // Comment modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });

  // Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 });

  // Watermark
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15);

  const toolColor = getToolColor(selectedTool);

  // Set active tool and tab based on selectedTool
  useEffect(() => {
    if (selectedTool === "Crop PDF") {
      setActiveTool("crop");
      setActiveTab("layout");
    } else if (selectedTool === "Sign PDF") {
      setActiveTool("signature");
      setActiveTab("insert");
    } else if (selectedTool === "Watermark PDF") {
      setActiveTool("stamp");
      setActiveTab("insert");
    } else if (selectedTool === "Page Numbers" || selectedTool === "Bates Numbering") {
      setActiveTool("stamp");
      setActiveTab("insert");
    } else if (selectedTool === "PDF Annotator") {
      setActiveTool("highlight");
      setActiveTab("home");
    }
  }, [selectedTool]);

  // ── Load PDF ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        try {
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
          }
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          const order: number[] = [];
          for (let i = 1; i <= pdf.numPages; i++) order.push(i);
          setPageOrder(order);

          // Generate thumbnails
          const thumbUrls: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.18 });
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
          console.error("Error loading PDF in editor:", err);
        }
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  // ── Render Page ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (pdfDoc && pageOrder[currentPage - 1]) {
      const actualPageNum = pageOrder[currentPage - 1];
      if (removedPages.has(actualPageNum)) return;

      let active = true;
      async function renderPage() {
        try {
          const page = await pdfDoc.getPage(actualPageNum);
          const viewport = page.getViewport({
            scale: zoom / 100,
            rotation: pageRotations[actualPageNum] || 0,
          });
          if (!active) return;
          const canvas = pageCanvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
        } catch (err) {
          console.error("Page render error:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, zoom, pageRotations, pageOrder, removedPages]);

  // ── History ───────────────────────────────────────────────────────────────
  function saveHistory(newElements: OverlayElement[]) {
    setUndoHistory(prev => [...prev.slice(-49), elements]);
    setRedoHistory([]);
    setElements(newElements);
  }

  function handleUndo() {
    if (undoHistory.length === 0) return;
    const previous = undoHistory[undoHistory.length - 1];
    setRedoHistory(prev => [...prev, elements]);
    setUndoHistory(prev => prev.slice(0, -1));
    setElements(previous);
  }

  function handleRedo() {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setUndoHistory(prev => [...prev, elements]);
    setRedoHistory(prev => prev.slice(0, -1));
    setElements(next);
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
        if ((e.key === "y") || (e.key === "z" && e.shiftKey)) { e.preventDefault(); handleRedo(); }
        if (e.key === "b") { e.preventDefault(); toggleBold(); }
        if (e.key === "i") { e.preventDefault(); toggleItalic(); }
        if (e.key === "u") { e.preventDefault(); toggleUnderline(); }
        if (e.key === "c") { /* copy */ }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId && !(e.target as HTMLElement).matches("input, textarea")) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
      if (e.key === "Escape") {
        setSelectedElementId(null);
        setActiveTool("select");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedElementId, undoHistory, redoHistory]);

  // ── Canvas Coords ─────────────────────────────────────────────────────────
  function getCanvasCoords(e: React.MouseEvent) {
    const container = overlayContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  const handleCropDragStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startL = cropLeft;
    const startR = cropRight;
    const startT = cropTop;
    const startB = cropBottom;

    // Get the wrapper rect
    const wrapper = pageCanvasRef.current?.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const widthPx = rect.width;
    const heightPx = rect.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const dxPercent = (dx / widthPx) * 100;
      const dyPercent = (dy / heightPx) * 100;

      if (isCropLinked) {
        // Uniform mode: adjust all margins by the primary dragged edge direction
        let maxDelta = 0;
        if (handle === "n") maxDelta = dyPercent;
        else if (handle === "s") maxDelta = -dyPercent;
        else if (handle === "w") maxDelta = dxPercent;
        else if (handle === "e") maxDelta = -dxPercent;
        else if (handle === "nw") maxDelta = Math.max(dxPercent, dyPercent);
        else if (handle === "ne") maxDelta = Math.max(-dxPercent, dyPercent);
        else if (handle === "sw") maxDelta = Math.max(dxPercent, -dyPercent);
        else if (handle === "se") maxDelta = Math.max(-dxPercent, -dyPercent);
        
        if (handle === "move") {
          // Centered dragging in uniform mode is still translation
          let newLeft = startL + dxPercent;
          let newTop = startT + dyPercent;
          const wPercent = 100 - startL - startR;
          const hPercent = 100 - startT - startB;

          if (newLeft < 0) newLeft = 0;
          if (newLeft + wPercent > 100) newLeft = 100 - wPercent;
          if (newTop < 0) newTop = 0;
          if (newTop + hPercent > 100) newTop = 100 - hPercent;

          setCropLeft(Math.round(newLeft * 10) / 10);
          setCropRight(Math.round((100 - newLeft - wPercent) * 10) / 10);
          setCropTop(Math.round(newTop * 10) / 10);
          setCropBottom(Math.round((100 - newTop - hPercent) * 10) / 10);
        } else {
          // Scale all sides equally
          const baseMargin = startL; // since they are all equal
          const newMargin = Math.min(Math.max(baseMargin + maxDelta, 0), 45);
          const rounded = Math.round(newMargin * 10) / 10;
          setCropLeft(rounded);
          setCropRight(rounded);
          setCropTop(rounded);
          setCropBottom(rounded);
          setCropMargin(rounded * 2);
        }
      } else {
        // Individual edge mode
        if (handle === "n") {
          const newTop = Math.min(Math.max(startT + dyPercent, 0), 100 - startB - 5);
          setCropTop(Math.round(newTop * 10) / 10);
        } else if (handle === "s") {
          const newBottom = Math.min(Math.max(startB - dyPercent, 0), 100 - startT - 5);
          setCropBottom(Math.round(newBottom * 10) / 10);
        } else if (handle === "w") {
          const newLeft = Math.min(Math.max(startL + dxPercent, 0), 100 - startR - 5);
          setCropLeft(Math.round(newLeft * 10) / 10);
        } else if (handle === "e") {
          const newRight = Math.min(Math.max(startR - dxPercent, 0), 100 - startL - 5);
          setCropRight(Math.round(newRight * 10) / 10);
        } else if (handle === "nw") {
          const newLeft = Math.min(Math.max(startL + dxPercent, 0), 100 - startR - 5);
          const newTop = Math.min(Math.max(startT + dyPercent, 0), 100 - startB - 5);
          setCropLeft(Math.round(newLeft * 10) / 10);
          setCropTop(Math.round(newTop * 10) / 10);
        } else if (handle === "ne") {
          const newRight = Math.min(Math.max(startR - dxPercent, 0), 100 - startL - 5);
          const newTop = Math.min(Math.max(startT + dyPercent, 0), 100 - startB - 5);
          setCropRight(Math.round(newRight * 10) / 10);
          setCropTop(Math.round(newTop * 10) / 10);
        } else if (handle === "sw") {
          const newLeft = Math.min(Math.max(startL + dxPercent, 0), 100 - startR - 5);
          const newBottom = Math.min(Math.max(startB - dyPercent, 0), 100 - startT - 5);
          setCropLeft(Math.round(newLeft * 10) / 10);
          setCropBottom(Math.round(newBottom * 10) / 10);
        } else if (handle === "se") {
          const newRight = Math.min(Math.max(startR - dxPercent, 0), 100 - startL - 5);
          const newBottom = Math.min(Math.max(startB - dyPercent, 0), 100 - startT - 5);
          setCropRight(Math.round(newRight * 10) / 10);
          setCropBottom(Math.round(newBottom * 10) / 10);
        } else if (handle === "move") {
          const wPercent = 100 - startL - startR;
          const hPercent = 100 - startT - startB;

          let newLeft = startL + dxPercent;
          let newTop = startT + dyPercent;

          if (newLeft < 0) newLeft = 0;
          if (newLeft + wPercent > 100) newLeft = 100 - wPercent;

          if (newTop < 0) newTop = 0;
          if (newTop + hPercent > 100) newTop = 100 - hPercent;

          setCropLeft(Math.round(newLeft * 10) / 10);
          setCropRight(Math.round((100 - newLeft - wPercent) * 10) / 10);
          setCropTop(Math.round(newTop * 10) / 10);
          setCropBottom(Math.round((100 - newTop - hPercent) * 10) / 10);
        }
        // Keep cropMargin in sync
        setCropMargin(Math.round(((startL + startR + startT + startB) / 2) * 10) / 10);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // ── Mouse Handlers ────────────────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent) {
    if (activeTool === "pan") return;
    const { x, y } = getCanvasCoords(e);

    if (activeTool === "select") {
      const clickedEl = [...elements].reverse().find(el => {
        if (el.page !== currentPage || el.locked) return false;
        const w = el.width || 15;
        const h = el.height || 6;
        return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
      });
      if (clickedEl) {
        setSelectedElementId(clickedEl.id);
        setIsDragging(true);
        setDragOffset({ x: x - clickedEl.x, y: y - clickedEl.y });
        if (clickedEl.type === "text") {
          setTextColor(clickedEl.color || "#1e293b");
          setTextSize(clickedEl.fontSize || 14);
          setTextFont(clickedEl.fontFamily || "Helvetica");
          setIsBold(!!clickedEl.isBold);
          setIsItalic(!!clickedEl.isItalic);
          setIsUnderline(!!clickedEl.isUnderline);
          setIsStrike(!!clickedEl.isStrike);
          setAlign(clickedEl.align || "left");
        }
      } else {
        setSelectedElementId(null);
      }
    } else if (activeTool === "text") {
      const newText: OverlayElement = {
        id: "text-" + Date.now(), type: "text", page: currentPage,
        x, y: y - 2, content: "Double-click to edit",
        color: textColor, fontSize: textSize, fontFamily: textFont,
        isBold, isItalic, isUnderline, isStrike, align, lineHeight, bgColor: textBgColor
      };
      saveHistory([...elements, newText]);
      setSelectedElementId(newText.id);
      setActiveTool("select");
    } else if (activeTool === "pen") {
      setIsDrawingPen(true);
      setCurrentPathPoints([{ x, y }]);
    } else if (activeTool === "highlight") {
      const newHl: OverlayElement = {
        id: "hl-" + Date.now(), type: "highlight", page: currentPage,
        x, y, width: 28, height: 3.5, color: markerColor, opacity: markerOpacity
      };
      saveHistory([...elements, newHl]);
      setSelectedElementId(newHl.id);
      setActiveTool("select");
    } else if (activeTool === "shape") {
      const newShape: OverlayElement = {
        id: "shape-" + Date.now(), type: "shape", page: currentPage,
        x, y, width: 18, height: 12, shapeType, color: shapeColor,
        bgColor: shapeFillColor, thickness: shapeThickness
      };
      saveHistory([...elements, newShape]);
      setSelectedElementId(newShape.id);
      setActiveTool("select");
    } else if (activeTool === "redact") {
      const newRedact: OverlayElement = {
        id: "redact-" + Date.now(), type: "redact", page: currentPage,
        x, y, width: 22, height: 5, color: redactColor, redactText
      };
      saveHistory([...elements, newRedact]);
      setSelectedElementId(newRedact.id);
      setActiveTool("select");
    } else if (activeTool === "comment") {
      setCommentPosition({ x, y });
      setCommentDraft("");
      setShowCommentModal(true);
    } else if (activeTool === "link") {
      setLinkPosition({ x, y });
      setLinkUrl("https://");
      setShowLinkModal(true);
    } else if (activeTool === "stamp") {
      const stampColors: Record<string, string> = {
        APPROVED: "#16a34a", DRAFT: "#64748b", CONFIDENTIAL: "#dc2626",
        REVIEWED: "#2563eb", VOID: "#9f1239", CERTIFIED: "#0369a1", URGENT: "#ea580c"
      };
      const newStamp: OverlayElement = {
        id: "stamp-" + Date.now(), type: "stamp", page: currentPage,
        x, y, width: 22, height: 8, stampType, color: stampColors[stampType] || "#64748b"
      };
      saveHistory([...elements, newStamp]);
      setSelectedElementId(newStamp.id);
      setActiveTool("select");
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    if (isDragging && selectedElementId) {
      const updated = elements.map(el => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            x: Math.min(Math.max(x - dragOffset.x, 0), 100 - (el.width || 0)),
            y: Math.min(Math.max(y - dragOffset.y, 0), 100 - (el.height || 0)),
          };
        }
        return el;
      });
      setElements(updated);
    } else if (isDrawingPen && activeTool === "pen") {
      setCurrentPathPoints(prev => [...prev, { x, y }]);
    }
  }

  function handleMouseUp() {
    if (activeTool === "pen" && isDrawingPen && currentPathPoints.length > 1) {
      const newDrawing: OverlayElement = {
        id: "draw-" + Date.now(), type: "drawing", page: currentPage,
        x: 0, y: 0, points: currentPathPoints, color: penColor, thickness: penThickness
      };
      saveHistory([...elements, newDrawing]);
      setCurrentPathPoints([]);
      setIsDrawingPen(false);
      setActiveTool("select");
    } else {
      setIsDrawingPen(false);
      setIsDragging(false);
    }
  }

  // ── Element Operations ────────────────────────────────────────────────────
  function updateElement(id: string, updates: Partial<OverlayElement>) {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }

  function updateTextContent(id: string, text: string) {
    updateElement(id, { content: text });
  }

  function deleteElement(id: string) {
    saveHistory(elements.filter(el => el.id !== id));
    setSelectedElementId(null);
  }

  function duplicateElement(id: string) {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const dup: OverlayElement = { ...el, id: el.type + "-" + Date.now(), x: el.x + 3, y: el.y + 3 };
    saveHistory([...elements, dup]);
    setSelectedElementId(dup.id);
  }

  function toggleLock(id: string) {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    updateElement(id, { locked: !el.locked });
  }

  function bringForward(id: string) {
    const idx = elements.findIndex(e => e.id === id);
    if (idx < elements.length - 1) {
      const updated = [...elements];
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
      saveHistory(updated);
    }
  }

  function sendBackward(id: string) {
    const idx = elements.findIndex(e => e.id === id);
    if (idx > 0) {
      const updated = [...elements];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      saveHistory(updated);
    }
  }

  // ── Page Operations ───────────────────────────────────────────────────────
  function rotatePage(pageNum: number) {
    setPageRotations(prev => ({ ...prev, [pageNum]: ((prev[pageNum] || 0) + 90) % 360 }));
  }

  function removePage(pageNum: number) {
    const next = new Set(removedPages);
    next.has(pageNum) ? next.delete(pageNum) : next.add(pageNum);
    setRemovedPages(next);
  }

  // ── Signature ─────────────────────────────────────────────────────────────
  function startSigDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function drawSig(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function stopSigDrawing() { setIsDrawingSig(false); }

  function clearSig() {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function saveSignature() {
    let dataUrl = "";
    if (sigMode === "draw") {
      const canvas = sigCanvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL();
    } else {
      // Render typed sig to canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = 392;
      offscreen.height = 100;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        ctx.font = `italic 48px 'Brush Script MT', cursive`;
        ctx.fillStyle = "#0f172a";
        ctx.fillText(typedSig || "Signature", 20, 70);
      }
      dataUrl = offscreen.toDataURL();
    }
    const newSig: OverlayElement = {
      id: "sig-" + Date.now(), type: "signature", page: currentPage,
      x: 35, y: 72, width: 24, height: 10, dataUrl
    };
    saveHistory([...elements, newSig]);
    setShowSigModal(false);
    setSelectedElementId(newSig.id);
    setActiveTool("select");
  }

  // ── Format Helpers ────────────────────────────────────────────────────────
  const toggleBold = () => {
    const v = !isBold; setIsBold(v);
    if (selectedElementId) updateElement(selectedElementId, { isBold: v });
  };
  const toggleItalic = () => {
    const v = !isItalic; setIsItalic(v);
    if (selectedElementId) updateElement(selectedElementId, { isItalic: v });
  };
  const toggleUnderline = () => {
    const v = !isUnderline; setIsUnderline(v);
    if (selectedElementId) updateElement(selectedElementId, { isUnderline: v });
  };
  const toggleStrike = () => {
    const v = !isStrike; setIsStrike(v);
    if (selectedElementId) updateElement(selectedElementId, { isStrike: v });
  };
  const updateAlignment = (a: "left" | "center" | "right" | "justify") => {
    setAlign(a);
    if (selectedElementId) updateElement(selectedElementId, { align: a });
  };
  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    if (selectedElementId) updateElement(selectedElementId, { color });
  };
  const handleTextSizeChange = (sz: number) => {
    setTextSize(sz);
    if (selectedElementId) updateElement(selectedElementId, { fontSize: sz });
  };
  const handleFontChange = (font: string) => {
    setTextFont(font);
    if (selectedElementId) updateElement(selectedElementId, { fontFamily: font });
  };

  // ── Download ──────────────────────────────────────────────────────────────
  function handleDownload() {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const options: any = {
      editorOverlays: JSON.stringify(elements),
      rotatePages: Object.entries(pageRotations)
        .filter(([, v]) => v !== 0).map(([k, v]) => `${k}:${v}`).join(","),
      removePages: Array.from(removedPages).join(","),
      pageOrder: pageOrder.join(","),
      pageSize, pageOrientation, pageMargins,
      cropMargin: String(cropMargin),
      cropLeft: String(cropLeft),
      cropRight: String(cropRight),
      cropTop: String(cropTop),
      cropBottom: String(cropBottom),
    };
    onSave(dataTransfer.files, options);
  }

  // ── Watermark ─────────────────────────────────────────────────────────────
  function applyWatermark() {
    const newWm: OverlayElement = {
      id: "stamp-wm-" + Date.now(), type: "stamp", page: currentPage,
      x: 15, y: 35, width: 70, height: 30, stampType: "WATERMARK",
      color: `rgba(100,116,139,${watermarkOpacity})`, content: watermarkText, opacity: watermarkOpacity
    };
    saveHistory([...elements, newWm]);
    setShowWatermarkModal(false);
  }

  // Selected element
  const selectedEl = elements.find(e => e.id === selectedElementId);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--c-bg)", color: "var(--c-text)", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ TOP APP BAR ══════════════════════════════════════════════════════ */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 16px", height: "44px",
        background: `linear-gradient(135deg, ${toolColor} 0%, ${toolColor}dd 100%)`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 30
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "500", backdropFilter: "blur(4px)" }}
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <div style={{ height: "20px", width: "1px", backgroundColor: "rgba(255,255,255,0.3)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fff", fontWeight: "600", fontSize: "0.85rem", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem" }}>{selectedTool}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setShowRightPanel(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: "0.78rem", backdropFilter: "blur(4px)" }}
          >
            <Layers size={14} />
            Properties
          </button>
          <button
            onClick={() => alert("PDF shared to clipboard!")}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: "0.78rem", backdropFilter: "blur(4px)" }}
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            onClick={handleDownload}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "9999px", border: "none", background: "var(--c-bg)", color: toolColor, cursor: "pointer", fontSize: "0.82rem", fontWeight: "600", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            <Download size={14} />
            Finish & Download
          </button>
        </div>
      </header>

      {/* ══ RIBBON TABS ══════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: "var(--c-surface)", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* Tab names */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 8px" }}>
          {(["home", "insert", "draw", "layout", "view"] as RibbonTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${toolColor}` : "2px solid transparent",
                background: "transparent",
                color: activeTab === tab ? toolColor : "var(--text-muted)",
                fontWeight: activeTab === tab ? "600" : "500",
                fontSize: "0.78rem",
                cursor: "pointer",
                textTransform: "capitalize",
                letterSpacing: "0.02em",
                transition: "all 0.15s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "4px 12px", minHeight: "58px", overflowX: "auto" }}>
          {/* ── HOME Tab ── */}
          {activeTab === "home" && (
            <>
              {/* Clipboard group */}
              <RibbonGroup label="Clipboard">
                <RibbonBtn icon={<Undo2 size={16} />} label="Undo" onClick={handleUndo} disabled={undoHistory.length === 0} color={toolColor} />
                <RibbonBtn icon={<Redo2 size={16} />} label="Redo" onClick={handleRedo} disabled={redoHistory.length === 0} color={toolColor} />
                <RibbonBtn icon={<Copy size={16} />} label="Copy" onClick={() => selectedElementId && duplicateElement(selectedElementId)} color={toolColor} />
                <RibbonBtn icon={<Trash2 size={16} />} label="Delete" onClick={() => selectedElementId && deleteElement(selectedElementId)} disabled={!selectedElementId} color="#ef4444" />
              </RibbonGroup>
              <RibbonDivider />
              {/* Font group */}
              <RibbonGroup label="Font">
                <select
                  value={textFont}
                  onChange={e => handleFontChange(e.target.value)}
                  style={{ height: "28px", padding: "0 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", minWidth: "130px", outline: "none", cursor: "pointer" }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select
                  value={textSize}
                  onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                  style={{ height: "28px", padding: "0 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", width: "58px", outline: "none", cursor: "pointer" }}
                >
                  {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ display: "flex", gap: "2px" }}>
                  <FormatBtn active={isBold} onClick={toggleBold} title="Bold (Ctrl+B)"><Bold size={13} /></FormatBtn>
                  <FormatBtn active={isItalic} onClick={toggleItalic} title="Italic (Ctrl+I)"><Italic size={13} /></FormatBtn>
                  <FormatBtn active={isUnderline} onClick={toggleUnderline} title="Underline (Ctrl+U)"><Underline size={13} /></FormatBtn>
                  <FormatBtn active={isStrike} onClick={toggleStrike} title="Strikethrough"><Strikethrough size={13} /></FormatBtn>
                </div>
                <div style={{ position: "relative" }}>
                  <ColorSwatch label="A" color={textColor} onClick={() => { setShowTextColorPicker(p => !p); setShowPenColorPicker(false); setShowMarkerColorPicker(false); setShowShapeColorPicker(false); }} />
                  {showTextColorPicker && (
                    <ColorPicker colors={PRESET_COLORS} selected={textColor} onSelect={c => { handleTextColorChange(c); setShowTextColorPicker(false); }} onClose={() => setShowTextColorPicker(false)} />
                  )}
                </div>
              </RibbonGroup>
              <RibbonDivider />
              {/* Paragraph group */}
              <RibbonGroup label="Paragraph">
                <div style={{ display: "flex", gap: "2px" }}>
                  <FormatBtn active={align === "left"} onClick={() => updateAlignment("left")} title="Align Left"><AlignLeft size={13} /></FormatBtn>
                  <FormatBtn active={align === "center"} onClick={() => updateAlignment("center")} title="Center"><AlignCenter size={13} /></FormatBtn>
                  <FormatBtn active={align === "right"} onClick={() => updateAlignment("right")} title="Align Right"><AlignRight size={13} /></FormatBtn>
                  <FormatBtn active={align === "justify"} onClick={() => updateAlignment("justify")} title="Justify"><AlignJustify size={13} /></FormatBtn>
                </div>
              </RibbonGroup>
              <RibbonDivider />
              {/* Selection tool */}
              <RibbonGroup label="Tools">
                <RibbonBtn icon={<MousePointer size={16} />} label="Select" active={activeTool === "select"} onClick={() => setActiveTool("select")} color={toolColor} />
                <RibbonBtn icon={<Hand size={16} />} label="Pan" active={activeTool === "pan"} onClick={() => setActiveTool("pan")} color={toolColor} />
                <RibbonBtn icon={<Search size={16} />} label="Find" onClick={() => alert("Find & Replace coming soon")} color={toolColor} />
              </RibbonGroup>
            </>
          )}

          {/* ── INSERT Tab ── */}
          {activeTab === "insert" && (
            <>
              <RibbonGroup label="Add Text">
                <RibbonBtn icon={<Type size={16} />} label="Text Box" active={activeTool === "text"} onClick={() => setActiveTool("text")} color={toolColor} />
                <RibbonBtn icon={<Hash size={16} />} label="Page No." onClick={() => {
                  const el: OverlayElement = { id: "text-pn-" + Date.now(), type: "text", page: currentPage, x: 45, y: 94, content: `Page ${currentPage}`, color: "#64748b", fontSize: 10, fontFamily: "Helvetica", align: "center" };
                  saveHistory([...elements, el]);
                  setSelectedElementId(el.id);
                }} color={toolColor} />
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Media">
                <RibbonBtn
                  icon={<FileImage size={16} />} label="Image"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const newImg: OverlayElement = {
                            id: "img-" + Date.now(), type: "image", page: currentPage,
                            x: 30, y: 30, width: 30, height: 25, dataUrl: reader.result as string
                          };
                          saveHistory([...elements, newImg]);
                          setSelectedElementId(newImg.id);
                          setActiveTool("select");
                        };
                        reader.readAsDataURL(f);
                      }
                    };
                    input.click();
                  }}
                  color={toolColor}
                />
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Shapes">
                {(["rectangle", "circle", "line", "arrow", "diamond"] as const).map(st => (
                  <RibbonBtn
                    key={st}
                    icon={st === "rectangle" ? <Square size={14} /> : st === "circle" ? <Circle size={14} /> : st === "line" ? <Minus size={14} /> : st === "arrow" ? <ArrowRight size={14} /> : <div style={{ width: 14, height: 14, border: "1.5px solid currentColor", transform: "rotate(45deg)" }} />}
                    label={st.charAt(0).toUpperCase() + st.slice(1)}
                    active={activeTool === "shape" && shapeType === st}
                    onClick={() => { setShapeType(st); setActiveTool("shape"); }}
                    color={toolColor}
                  />
                ))}
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Annotations">
                <RibbonBtn icon={<MessageSquare size={16} />} label="Comment" active={activeTool === "comment"} onClick={() => setActiveTool("comment")} color={toolColor} />
                <RibbonBtn icon={<Link size={16} />} label="Hyperlink" active={activeTool === "link"} onClick={() => setActiveTool("link")} color={toolColor} />
                <RibbonBtn icon={<Stamp size={16} />} label="Stamp" active={activeTool === "stamp"} onClick={() => setActiveTool("stamp")} color={toolColor} />
                <RibbonBtn icon={<Droplets size={16} />} label="Watermark" onClick={() => setShowWatermarkModal(true)} color={toolColor} />
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Sign">
                <RibbonBtn icon={<CheckCircle size={16} />} label="Signature" onClick={() => setShowSigModal(true)} color={toolColor} />
              </RibbonGroup>
            </>
          )}

          {/* ── DRAW Tab ── */}
          {activeTab === "draw" && (
            <>
              <RibbonGroup label="Drawing Tools">
                <RibbonBtn icon={<PenTool size={16} />} label="Pen" active={activeTool === "pen"} onClick={() => setActiveTool("pen")} color={toolColor} />
                <RibbonBtn icon={<Highlighter size={16} />} label="Highlight" active={activeTool === "highlight"} onClick={() => setActiveTool("highlight")} color={toolColor} />
                <RibbonBtn icon={<Eraser size={16} />} label="Redact" active={activeTool === "redact"} onClick={() => setActiveTool("redact")} color={toolColor} />
              </RibbonGroup>
              <RibbonDivider />
              {activeTool === "pen" && (
                <RibbonGroup label="Pen Options">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Color</span>
                      <div style={{ position: "relative" }}>
                        <ColorSwatch label="" color={penColor} onClick={() => { setShowPenColorPicker(p => !p); setShowTextColorPicker(false); }} />
                        {showPenColorPicker && (
                          <ColorPicker colors={PRESET_COLORS} selected={penColor} onSelect={c => { setPenColor(c); setShowPenColorPicker(false); }} onClose={() => setShowPenColorPicker(false)} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Size {penThickness}px</span>
                      <input type="range" min="1" max="12" value={penThickness} onChange={e => setPenThickness(parseInt(e.target.value))} style={{ width: "80px" }} />
                    </div>
                  </div>
                </RibbonGroup>
              )}
              {activeTool === "highlight" && (
                <RibbonGroup label="Highlight Options">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Color</span>
                      <div style={{ position: "relative" }}>
                        <ColorSwatch label="" color={markerColor} onClick={() => { setShowMarkerColorPicker(p => !p); setShowTextColorPicker(false); }} />
                        {showMarkerColorPicker && (
                          <ColorPicker colors={["#fef08a", "#bbf7d0", "#a5f3fc", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"]} selected={markerColor} onSelect={c => { setMarkerColor(c); setShowMarkerColorPicker(false); }} onClose={() => setShowMarkerColorPicker(false)} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Opacity {Math.round(markerOpacity * 100)}%</span>
                      <input type="range" min="0.1" max="0.8" step="0.05" value={markerOpacity} onChange={e => setMarkerOpacity(parseFloat(e.target.value))} style={{ width: "80px" }} />
                    </div>
                  </div>
                </RibbonGroup>
              )}
              {activeTool === "redact" && (
                <RibbonGroup label="Redact Options">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      <span>Label</span>
                      <input value={redactText} onChange={e => setRedactText(e.target.value)} style={{ width: "90px", padding: "2px 6px", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      <span>Color</span>
                      <input type="color" value={redactColor} onChange={e => setRedactColor(e.target.value)} style={{ width: "24px", height: "18px", padding: 0, border: "none", cursor: "pointer", borderRadius: "3px", backgroundColor: "transparent" }} />
                    </div>
                  </div>
                </RibbonGroup>
              )}
              {activeTool === "shape" && (
                <RibbonGroup label="Shape Options">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Border</span>
                      <div style={{ position: "relative" }}>
                        <ColorSwatch label="" color={shapeColor} onClick={() => { setShowShapeColorPicker(p => !p); setShowTextColorPicker(false); }} />
                        {showShapeColorPicker && (
                          <ColorPicker colors={PRESET_COLORS} selected={shapeColor} onSelect={c => { setShapeColor(c); setShowShapeColorPicker(false); }} onClose={() => setShowShapeColorPicker(false)} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>Width {shapeThickness}px</span>
                      <input type="range" min="1" max="8" value={shapeThickness} onChange={e => setShapeThickness(parseInt(e.target.value))} style={{ width: "70px" }} />
                    </div>
                  </div>
                </RibbonGroup>
              )}
            </>
          )}

          {/* ── LAYOUT Tab ── */}
          {activeTab === "layout" && (
            <>
              <RibbonGroup label="Page Size">
                <select value={pageSize} onChange={e => setPageSize(e.target.value)}
                  style={{ height: "28px", padding: "0 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", minWidth: "130px", outline: "none", cursor: "pointer" }}>
                  <option value="Letter">Letter (8.5" × 11")</option>
                  <option value="A4">A4 (210 × 297mm)</option>
                  <option value="Legal">Legal (8.5" × 14")</option>
                  <option value="A3">A3 (297 × 420mm)</option>
                  <option value="Tabloid">Tabloid (11" × 17")</option>
                </select>
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Orientation">
                <RibbonBtn icon={<LayoutTemplate size={16} />} label="Portrait" active={pageOrientation === "Portrait"} onClick={() => setPageOrientation("Portrait")} color={toolColor} />
                <RibbonBtn icon={<LayoutTemplate size={16} style={{ transform: "rotate(90deg)" }} />} label="Landscape" active={pageOrientation === "Landscape"} onClick={() => setPageOrientation("Landscape")} color={toolColor} />
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Margins">
                {(["None", "Narrow", "Normal", "Wide"] as const).map(m => (
                  <RibbonBtn key={m} label={m} active={pageMargins === m} onClick={() => setPageMargins(m)} color={toolColor} />
                ))}
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Page Operations">
                <RibbonBtn icon={<RotateCw size={16} />} label="Rotate" onClick={() => rotatePage(pageOrder[currentPage - 1])} color={toolColor} />
                <RibbonBtn icon={<FileMinus size={16} />} label="Remove" onClick={() => removePage(pageOrder[currentPage - 1])} color="#ef4444" />
              </RibbonGroup>
            </>
          )}

          {/* ── VIEW Tab ── */}
          {activeTab === "view" && (
            <>
              <RibbonGroup label="Zoom">
                <RibbonBtn icon={<ZoomOut size={16} />} label="Zoom Out" onClick={() => setZoom(p => Math.max(p - 10, 30))} color={toolColor} />
                <select value={zoom} onChange={e => setZoom(parseInt(e.target.value))}
                  style={{ height: "28px", padding: "0 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", backgroundColor: "var(--c-bg)", color: "var(--c-text)", width: "80px", outline: "none", cursor: "pointer" }}>
                  {[50, 75, 90, 100, 110, 125, 150, 175, 200].map(z => <option key={z} value={z}>{z}%</option>)}
                </select>
                <RibbonBtn icon={<ZoomIn size={16} />} label="Zoom In" onClick={() => setZoom(p => Math.min(p + 10, 250))} color={toolColor} />
                <RibbonBtn icon={<Maximize2 size={16} />} label="100%" onClick={() => setZoom(100)} color={toolColor} />
              </RibbonGroup>
              <RibbonDivider />
              <RibbonGroup label="Display">
                <FormatBtn active={showRuler} onClick={() => setShowRuler(p => !p)} title="Show Ruler">
                  <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Ruler</span>
                </FormatBtn>
                <FormatBtn active={showGrid} onClick={() => setShowGrid(p => !p)} title="Show Grid">
                  <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Grid</span>
                </FormatBtn>
                <FormatBtn active={showRightPanel} onClick={() => setShowRightPanel(p => !p)} title="Properties Panel">
                  <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>Panel</span>
                </FormatBtn>
              </RibbonGroup>
            </>
          )}
        </div>
      </div>

      {/* ══ MAIN EDITOR FRAME ════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR (Page Thumbnails) ────────────────────────────── */}
        <aside style={{
          width: "200px", minWidth: "200px", backgroundColor: "var(--surface-raised)", display: "flex",
          flexDirection: "column", overflowY: "auto", borderRight: "1px solid var(--border)"
        }}>
          <div style={{ padding: "12px 14px", fontSize: "0.74rem", fontWeight: "500", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", marginBottom: "8px" }}>
            Pages · {totalPages - removedPages.size}/{totalPages}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 10px 16px" }}>
            {pageOrder.map((pageNum, idx) => {
              const isRemoved = removedPages.has(pageNum);
              const rotation = pageRotations[pageNum] || 0;
              const isActive = currentPage === idx + 1;
              return (
                <div
                  key={pageNum}
                  onClick={() => !isRemoved && setCurrentPage(idx + 1)}
                  style={{
                    position: "relative", borderRadius: "8px",
                    border: `2px solid ${isActive ? toolColor : isRemoved ? "#ef4444" : "transparent"}`,
                    padding: "6px",
                    backgroundColor: isActive ? `${toolColor}15` : isRemoved ? "rgba(239, 68, 68, 0.15)" : "var(--c-bg)",
                    cursor: isRemoved ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: isActive ? `0 2px 10px ${toolColor}33` : "0 1px 4px rgba(0,0,0,0.06)"
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "8.5/11", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    {thumbnails[pageNum - 1] ? (
                      <img
                        src={thumbnails[pageNum - 1]}
                        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", transform: `rotate(${rotation}deg)`, transition: "transform 0.3s" }}
                        alt={`Page ${pageNum}`}
                      />
                    ) : (
                      <FileText size={24} style={{ color: "var(--text-muted)" }} />
                    )}
                    {isRemoved && (
                      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(239,68,68,0.6)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
                        <span style={{ color: "#fff", fontSize: "0.68rem", fontWeight: "600" }}>Excluded</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: "700", color: isActive ? "var(--c-text)" : "var(--text-muted)" }}>pg. {idx + 1}</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      <button
                        onClick={e => { e.stopPropagation(); rotatePage(pageNum); }}
                        style={{ padding: "2px 4px", borderRadius: "3px", border: "1px solid var(--border)", background: "var(--c-surface)", color: "var(--text-muted)", cursor: "pointer" }}
                        title="Rotate"
                      >
                        <RotateCw size={9} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); removePage(pageNum); }}
                        style={{ padding: "2px 4px", borderRadius: "3px", border: `1px solid ${isRemoved ? "#22c55e" : "#ef4444"}33`, background: "var(--c-surface)", color: isRemoved ? "#22c55e" : "#ef4444", cursor: "pointer" }}
                        title={isRemoved ? "Restore" : "Remove"}
                      >
                        {isRemoved ? <Check size={9} /> : <X size={9} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER CANVAS ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", backgroundColor: "color-mix(in srgb, var(--c-surface) 93%, var(--c-text))" }}>
          {/* Ruler */}
          {showRuler && (
            <div style={{ height: "20px", backgroundColor: "var(--c-surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", paddingLeft: "8px", flexShrink: 0 }}>
              <div style={{ flex: 1, height: "100%", position: "relative", overflow: "hidden" }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} style={{ position: "absolute", left: `${i * 72}px`, fontSize: "0.55rem", color: "var(--text-muted)", borderLeft: "1px solid var(--border)", paddingLeft: "2px", height: "100%", display: "flex", alignItems: "flex-end" }}>
                    {i > 0 ? i : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Canvas viewport */}
          <div
            style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "32px 24px" }}
          >
            <div
              className="canvas-document-wrapper"
              style={{
                position: "relative",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px var(--border)",
                backgroundColor: "#ffffff",
                cursor: activeTool === "pan" ? "grab" : activeTool === "text" ? "text" : activeTool === "select" ? "default" : "crosshair"
              }}
            >
              {/* PDF canvas */}
              <canvas ref={pageCanvasRef} style={{ display: "block" }} />

              {/* Grid overlay */}
              {showGrid && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  backgroundImage: "linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }} />
              )}

              {/* Margin guide */}
              {pageMargins !== "None" && (
                <div style={{
                  position: "absolute",
                  inset: pageMargins === "Narrow" ? "4.5%" : pageMargins === "Normal" ? "9%" : "18%",
                  border: "1px dashed rgba(99,102,241,0.35)",
                  pointerEvents: "none",
                  zIndex: 1
                }} />
              )}

              {/* Crop Box Overlay */}
              {(selectedTool === "Crop PDF" || activeTool === "crop") && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 3,
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: `${cropTop}%`,
                    left: `${cropLeft}%`,
                    right: `${cropRight}%`,
                    bottom: `${cropBottom}%`,
                    border: `2px dashed ${toolColor}`,
                    borderRadius: "4px",
                    boxShadow: "0 0 0 9999px rgba(9, 10, 15, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "auto"
                  }}>
                    {/* The label in the center */}
                    <div style={{
                      backgroundColor: toolColor,
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: "500",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                      cursor: "move",
                      userSelect: "none",
                      pointerEvents: "auto"
                    }}
                    onMouseDown={(e) => handleCropDragStart(e, "move")}
                    >
                      Crop Area ({Math.round(100 - cropLeft - cropRight)}% x {Math.round(100 - cropTop - cropBottom)}%)
                    </div>

                    {/* Resize handles */}
                    {/* Corner NW */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "-6px",
                        left: "-6px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ffffff",
                        border: `2px solid ${toolColor}`,
                        borderRadius: "50%",
                        cursor: "nwse-resize",
                        zIndex: 10,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "nw")}
                    />
                    {/* Corner NE */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ffffff",
                        border: `2px solid ${toolColor}`,
                        borderRadius: "50%",
                        cursor: "nesw-resize",
                        zIndex: 10,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "ne")}
                    />
                    {/* Corner SW */}
                    <div 
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        left: "-6px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ffffff",
                        border: `2px solid ${toolColor}`,
                        borderRadius: "50%",
                        cursor: "nesw-resize",
                        zIndex: 10,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "sw")}
                    />
                    {/* Corner SE */}
                    <div 
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        right: "-6px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ffffff",
                        border: `2px solid ${toolColor}`,
                        borderRadius: "50%",
                        cursor: "nwse-resize",
                        zIndex: 10,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "se")}
                    />

                    {/* Edge N */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "-5px",
                        left: "12px",
                        right: "12px",
                        height: "10px",
                        cursor: "ns-resize",
                        zIndex: 9,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "n")}
                    />
                    {/* Edge S */}
                    <div 
                      style={{
                        position: "absolute",
                        bottom: "-5px",
                        left: "12px",
                        right: "12px",
                        height: "10px",
                        cursor: "ns-resize",
                        zIndex: 9,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "s")}
                    />
                    {/* Edge W */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "12px",
                        bottom: "12px",
                        left: "-5px",
                        width: "10px",
                        cursor: "ew-resize",
                        zIndex: 9,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "w")}
                    />
                    {/* Edge E */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "12px",
                        bottom: "12px",
                        right: "-5px",
                        width: "10px",
                        cursor: "ew-resize",
                        zIndex: 9,
                        pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleCropDragStart(e, "e")}
                    />
                  </div>
                </div>
              )}

              {/* Interactive overlay */}
              <div
                ref={overlayContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ position: "absolute", inset: 0, zIndex: 2, userSelect: "none" }}
              >
                {/* SVG drawings */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
                  {elements.filter(el => el.page === currentPage && el.type === "drawing").map(el => {
                    if (!el.points || el.points.length < 2) return null;
                    const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");
                    return <path key={el.id} d={d} stroke={el.color} strokeWidth={el.thickness} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
                  })}
                  {isDrawingPen && currentPathPoints.length > 1 && (
                    <path
                      d={currentPathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ")}
                      stroke={penColor} strokeWidth={penThickness} fill="none" strokeLinecap="round" strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* HTML elements */}
                {elements.filter(el => el.page === currentPage).map(el => {
                  const isSel = selectedElementId === el.id;
                  const selBorder = `2px dashed ${toolColor}`;
                  const baseStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${el.x}%`, top: `${el.y}%`,
                    border: isSel ? selBorder : "1px solid transparent",
                    cursor: activeTool === "select" && !el.locked ? "move" : el.locked ? "not-allowed" : "default",
                    outline: "none",
                    transition: "border 0.1s"
                  };

                  if (el.type === "text") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{
                          ...baseStyle, padding: "2px 4px", borderRadius: "3px",
                          backgroundColor: isSel ? "rgba(99,102,241,0.04)" : "transparent",
                          minWidth: "80px"
                        }}>
                        {isSel ? (
                          <input
                            autoFocus
                            type="text"
                            value={el.content}
                            onChange={e => updateTextContent(el.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              color: el.color, fontSize: `${el.fontSize}px`,
                              fontFamily: el.fontFamily,
                              fontWeight: el.isBold ? "bold" : "normal",
                              fontStyle: el.isItalic ? "italic" : "normal",
                              textDecoration: `${el.isUnderline ? "underline " : ""}${el.isStrike ? "line-through" : ""}`.trim(),
                              textAlign: el.align || "left",
                              lineHeight: el.lineHeight || 1.5,
                              border: "none", outline: "none", background: "transparent",
                              padding: 0, minWidth: "120px", width: "100%"
                            }}
                          />
                        ) : (
                          <span style={{
                            color: el.color, fontSize: `${el.fontSize}px`,
                            fontFamily: el.fontFamily,
                            fontWeight: el.isBold ? "bold" : "normal",
                            fontStyle: el.isItalic ? "italic" : "normal",
                            textDecoration: `${el.isUnderline ? "underline " : ""}${el.isStrike ? "line-through" : ""}`.trim(),
                            textAlign: el.align || "left",
                            lineHeight: el.lineHeight || 1.5,
                            display: "block", whiteSpace: "nowrap"
                          }}>{el.content}</span>
                        )}
                      </div>
                    );
                  }

                  if (el.type === "highlight") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{ ...baseStyle, width: `${el.width || 28}%`, height: `${el.height || 3.5}%`, backgroundColor: el.color, opacity: el.opacity, borderRadius: "2px" }}
                      />
                    );
                  }

                  if (el.type === "shape") {
                    const isCircle = el.shapeType === "circle";
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{
                          ...baseStyle,
                          width: `${el.width || 18}%`, height: `${el.height || 12}%`,
                          border: `${el.thickness || 2}px solid ${el.color}`,
                          borderRadius: isCircle ? "50%" : el.shapeType === "diamond" ? "0" : "2px",
                          transform: el.shapeType === "diamond" ? "rotate(45deg)" : "none",
                          backgroundColor: el.bgColor && el.bgColor !== "transparent" ? el.bgColor : "transparent",
                          outline: isSel ? `2px dashed ${toolColor}` : "none"
                        }}
                      />
                    );
                  }

                  if (el.type === "redact") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{
                          ...baseStyle, width: `${el.width || 22}%`, height: `${el.height || 5}%`,
                          backgroundColor: el.color, borderRadius: "2px", display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}
                      >
                        <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: "900", letterSpacing: "0.05em", pointerEvents: "none" }}>{el.redactText}</span>
                      </div>
                    );
                  }

                  if (el.type === "comment") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{ ...baseStyle, width: "auto", height: "auto" }}
                        title={el.commentText}
                      >
                        <div style={{ backgroundColor: "#fbbf24", borderRadius: "50% 50% 50% 0", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                          <MessageSquare size={10} style={{ color: "#fff" }} />
                        </div>
                      </div>
                    );
                  }

                  if (el.type === "link") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{ ...baseStyle, padding: "2px 6px", backgroundColor: "#dbeafe", borderRadius: "3px" }}
                        title={el.linkUrl}
                      >
                        <span style={{ color: "#2563eb", fontSize: "11px", textDecoration: "underline", fontWeight: "600" }}>🔗 {el.content || el.linkUrl}</span>
                      </div>
                    );
                  }

                  if (el.type === "stamp") {
                    const isWatermark = el.stampType === "WATERMARK";
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{
                          ...baseStyle,
                          width: isWatermark ? `${el.width || 70}%` : `${el.width || 22}%`,
                          height: isWatermark ? `${el.height || 30}%` : `${el.height || 8}%`,
                          border: isWatermark ? "none" : `2px solid ${el.color}`,
                          borderRadius: isWatermark ? "0" : "4px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transform: isWatermark ? "rotate(-30deg)" : "none",
                          opacity: isWatermark ? (el.opacity || 0.15) : 1
                        }}
                      >
                        <span style={{
                          color: el.color,
                          fontSize: isWatermark ? "28px" : "11px",
                          fontWeight: "900", letterSpacing: isWatermark ? "0.15em" : "0.08em",
                          fontFamily: "Arial, sans-serif",
                          textTransform: "uppercase",
                          pointerEvents: "none"
                        }}>
                          {isWatermark ? (el.content || "CONFIDENTIAL") : el.stampType}
                        </span>
                      </div>
                    );
                  }

                  if (el.type === "signature" || el.type === "image") {
                    return (
                      <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{ ...baseStyle, width: `${el.width || 22}%`, height: `${el.height || 10}%` }}
                      >
                        <img src={el.dataUrl} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} alt={el.type} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 20px", backgroundColor: "var(--surface-raised)", borderTop: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: "0.72rem", flexShrink: 0
          }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ fontWeight: "600" }}>
                Page <span style={{ color: "var(--c-text)" }}>{currentPage}</span> / {totalPages}
              </span>
              <span>Tool: <span style={{ color: toolColor, fontWeight: "600", textTransform: "capitalize" }}>{activeTool}</span></span>
              {selectedEl && <span>Selected: <span style={{ color: "var(--c-text)" }}>{selectedEl.type}</span></span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, padding: 0 }}>
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, padding: 0 }}>
                <ChevronRight size={13} />
              </button>
              <div style={{ height: "14px", width: "1px", backgroundColor: "var(--border)", margin: "0 4px" }} />
              <button onClick={() => setZoom(p => Math.max(p - 10, 30))} style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><ZoomOut size={12} /></button>
              <span style={{ color: "var(--c-text)", fontWeight: "500", minWidth: "42px", textAlign: "center", fontSize: "0.75rem" }}>{zoom}%</span>
              <button onClick={() => setZoom(p => Math.min(p + 10, 250))} style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><ZoomIn size={12} /></button>
              <button onClick={() => setZoom(100)} style={{ height: "24px", padding: "0 8px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.68rem", fontWeight: "500" }}><Maximize2 size={12} style={{ marginRight: "2px" }} /> 100%</button>
            </div>
          </div>
        </main>

        {/* ── RIGHT PROPERTIES PANEL ────────────────────────────────────── */}
        {showRightPanel && (
          <aside style={{ width: "220px", minWidth: "220px", backgroundColor: "var(--c-surface)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: "500", color: "var(--c-text)" }}>Properties</span>
            </div>

            {selectedEl ? (
              <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Element info */}
                <div style={{ padding: "8px 10px", backgroundColor: "var(--c-bg)", borderRadius: "6px", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Element</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--c-text)", textTransform: "capitalize" }}>{selectedEl.type}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>x:{Math.round(selectedEl.x)}% y:{Math.round(selectedEl.y)}%</div>
                </div>

                {/* Text properties */}
                {selectedEl.type === "text" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <PropLabel>Font</PropLabel>
                    <select value={selectedEl.fontFamily || textFont} onChange={e => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                      style={{ width: "100%", padding: "5px 12px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", cursor: "pointer" }}>
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <PropLabel>Size</PropLabel>
                      <select value={selectedEl.fontSize || textSize} onChange={e => handleTextSizeChange(parseInt(e.target.value))}
                        style={{ flex: 1, padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", cursor: "pointer" }}>
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}pt</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <FormatBtn active={!!selectedEl.isBold} onClick={toggleBold} title="Bold"><Bold size={12} /></FormatBtn>
                      <FormatBtn active={!!selectedEl.isItalic} onClick={toggleItalic} title="Italic"><Italic size={12} /></FormatBtn>
                      <FormatBtn active={!!selectedEl.isUnderline} onClick={toggleUnderline} title="Underline"><Underline size={12} /></FormatBtn>
                      <FormatBtn active={!!selectedEl.isStrike} onClick={toggleStrike} title="Strike"><Strikethrough size={12} /></FormatBtn>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Color</PropLabel>
                      <input type="color" value={selectedEl.color || "var(--c-text)"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                        style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {(["left", "center", "right", "justify"] as const).map(a => (
                        <FormatBtn key={a} active={(selectedEl.align || "left") === a} onClick={() => updateElement(selectedEl.id, { align: a })} title={a}>
                          {a === "left" ? <AlignLeft size={11} /> : a === "center" ? <AlignCenter size={11} /> : a === "right" ? <AlignRight size={11} /> : <AlignJustify size={11} />}
                        </FormatBtn>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shape properties */}
                {selectedEl.type === "shape" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Border</PropLabel>
                      <input type="color" value={selectedEl.color || "#3b82f6"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                        style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Fill</PropLabel>
                      <input type="color" value={selectedEl.bgColor === "transparent" ? "#ffffff" : (selectedEl.bgColor || "#ffffff")} onChange={e => updateElement(selectedEl.id, { bgColor: e.target.value })}
                        style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Width</PropLabel>
                      <input type="range" min="1" max="10" value={selectedEl.thickness || 2} onChange={e => updateElement(selectedEl.id, { thickness: parseInt(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", minWidth: "22px" }}>{selectedEl.thickness || 2}px</span>
                    </div>
                  </div>
                )}

                {/* Highlight properties */}
                {selectedEl.type === "highlight" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Color</PropLabel>
                      <input type="color" value={selectedEl.color || "#fef08a"} onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                        style={{ width: "22px", height: "22px", padding: 0, border: "1px solid var(--border)", borderRadius: "50%", cursor: "pointer", backgroundColor: "transparent" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <PropLabel>Opacity</PropLabel>
                      <input type="range" min="0.1" max="0.9" step="0.05" value={selectedEl.opacity || 0.4} onChange={e => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{Math.round((selectedEl.opacity || 0.4) * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Position & size */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <PropLabel>Position & Size</PropLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {[
                      { label: "X", key: "x" as const, val: selectedEl.x },
                      { label: "Y", key: "y" as const, val: selectedEl.y },
                      { label: "W", key: "width" as const, val: selectedEl.width || 20 },
                      { label: "H", key: "height" as const, val: selectedEl.height || 10 },
                    ].map(({ label, key, val }) => (
                      <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500" }}>{label}</span>
                        <input
                          type="number"
                          value={Math.round(val * 10) / 10}
                          onChange={e => updateElement(selectedEl.id, { [key]: parseFloat(e.target.value) })}
                          min="0" max="100" step="0.5"
                          style={{ width: "100%", padding: "3px 8px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <PropLabel>Actions</PropLabel>
                  <button onClick={() => duplicateElement(selectedEl.id)} style={propActionBtn}>
                    <Copy size={11} /> Duplicate
                  </button>
                  <button onClick={() => toggleLock(selectedEl.id)} style={{ ...propActionBtn, borderColor: selectedEl.locked ? "#f59e0b" : "var(--border)", color: selectedEl.locked ? "#f59e0b" : "var(--c-text)", backgroundColor: selectedEl.locked ? "rgba(245,158,11,0.1)" : "var(--c-surface)" }}>
                    <Lock size={11} /> {selectedEl.locked ? "Unlock" : "Lock"}
                  </button>
                  <button onClick={() => bringForward(selectedEl.id)} style={propActionBtn}>
                    <Plus size={11} /> Bring Forward
                  </button>
                  <button onClick={() => sendBackward(selectedEl.id)} style={propActionBtn}>
                    <Minus size={11} /> Send Backward
                  </button>
                  <button onClick={() => deleteElement(selectedEl.id)} style={{ ...propActionBtn, borderColor: "#fecaca", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}>
                    <Trash2 size={11} /> Delete Element
                  </button>
                </div>
              </div>
            ) : (selectedTool === "Crop PDF" || activeTool === "crop") ? (
              <div style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "16px", backgroundColor: "var(--c-bg)", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Crop size={16} style={{ color: toolColor }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--c-text)" }}>Crop Boundaries</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                    Adjust margins using sliders, coordinates, or by dragging handles directly on the document canvas.
                  </p>

                  <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button 
                      onClick={() => setIsCropLinked(!isCropLinked)}
                      style={{
                        width: "100%",
                        padding: "6px 12px",
                        borderRadius: "9999px",
                        border: `1px solid ${isCropLinked ? toolColor : "var(--border)"}`,
                        background: isCropLinked ? `${toolColor}15` : "var(--c-bg)",
                        color: isCropLinked ? toolColor : "var(--c-text)",
                        fontSize: "0.72rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                        outline: "none"
                      }}
                    >
                      {isCropLinked ? <Lock size={12} /> : <Unlock size={12} />}
                      {isCropLinked ? "Link Margins (Uniform)" : "Unlink Margins (Custom)"}
                    </button>

                    {isCropLinked ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Margin Percentage</span>
                          <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropMargin}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          value={cropMargin} 
                          onChange={e => handleCropMarginUniformChange(parseInt(e.target.value))} 
                          style={{ width: "100%", cursor: "pointer" }} 
                        />
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Custom (%):</span>
                          <input 
                            type="number" 
                            min="0" 
                            max="45" 
                            value={cropMargin} 
                            onChange={e => handleCropMarginUniformChange(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 45))} 
                            style={{ width: "60px", padding: "3px 8px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none" }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {/* Left Margin */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Left Margin</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropLeft}%</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropLeft} 
                              onChange={e => handleCropLeftChange(parseFloat(e.target.value))} 
                              style={{ flex: 1, cursor: "pointer" }} 
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropLeft} 
                              onChange={e => handleCropLeftChange(parseFloat(e.target.value) || 0)} 
                              style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                            />
                          </div>
                        </div>

                        {/* Right Margin */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Right Margin</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropRight}%</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropRight} 
                              onChange={e => handleCropRightChange(parseFloat(e.target.value))} 
                              style={{ flex: 1, cursor: "pointer" }} 
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropRight} 
                              onChange={e => handleCropRightChange(parseFloat(e.target.value) || 0)} 
                              style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                            />
                          </div>
                        </div>

                        {/* Top Margin */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Top Margin</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropTop}%</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropTop} 
                              onChange={e => handleCropTopChange(parseFloat(e.target.value))} 
                              style={{ flex: 1, cursor: "pointer" }} 
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropTop} 
                              onChange={e => handleCropTopChange(parseFloat(e.target.value) || 0)} 
                              style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                            />
                          </div>
                        </div>

                        {/* Bottom Margin */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Bottom Margin</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--c-text)" }}>{cropBottom}%</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropBottom} 
                              onChange={e => handleCropBottomChange(parseFloat(e.target.value))} 
                              style={{ flex: 1, cursor: "pointer" }} 
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="45" 
                              step="0.5"
                              value={cropBottom} 
                              onChange={e => handleCropBottomChange(parseFloat(e.target.value) || 0)} 
                              style={{ width: "48px", padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--c-text)", backgroundColor: "var(--c-bg)", outline: "none", textAlign: "center" }} 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "4px 0" }} />

                    {/* Presets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500" }}>Quick Presets</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                          { label: "None (0%)", val: 0 },
                          { label: "Narrow (5%)", val: 5 },
                          { label: "Normal (10%)", val: 10 },
                          { label: "Wide (15%)", val: 15 }
                        ].map(preset => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              if (isCropLinked) {
                                handleCropMarginUniformChange(preset.val);
                              } else {
                                setCropLeft(preset.val / 2);
                                setCropRight(preset.val / 2);
                                setCropTop(preset.val / 2);
                                setCropBottom(preset.val / 2);
                                setCropMargin(preset.val);
                              }
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "9999px",
                              border: "1px solid var(--border)",
                              background: "var(--c-bg)",
                              color: "var(--c-text)",
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              transition: "all 0.1s ease",
                              outline: "none"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = toolColor; e.currentTarget.style.backgroundColor = `${toolColor}08`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.backgroundColor = "var(--c-bg)"; }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <PropLabel>Document Info</PropLabel>
                  <InfoRow label="Pages" value={String(totalPages)} />
                  <InfoRow label="Current Page" value={String(currentPage)} />
                  <InfoRow label="Zoom" value={`${zoom}%`} />
                  <InfoRow label="Active Tool" value={activeTool} />
                </div>
              </div>
            ) : (
              <div style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ textAlign: "center", padding: "24px 16px", backgroundColor: "var(--c-bg)", borderRadius: "8px", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <MousePointer size={24} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>Select an element to view and edit its properties</p>
                </div>

                {/* Quick info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                  <PropLabel>Document Info</PropLabel>
                  <InfoRow label="Pages" value={String(totalPages)} />
                  <InfoRow label="Elements" value={String(elements.length)} />
                  <InfoRow label="Current Page" value={String(currentPage)} />
                  <InfoRow label="Zoom" value={`${zoom}%`} />
                  <InfoRow label="Active Tool" value={activeTool} />
                </div>

                {/* Stamp selector (for insert/stamp tool) */}
                {activeTool === "stamp" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                    <PropLabel>Stamp Type</PropLabel>
                    {STAMP_TYPES.map(s => (
                      <button key={s} onClick={() => setStampType(s)}
                        style={{
                          padding: "5px 14px", borderRadius: "9999px", border: `1px solid ${stampType === s ? toolColor : "var(--border)"}`,
                          background: stampType === s ? `${toolColor}15` : "var(--c-bg)",
                          color: stampType === s ? toolColor : "var(--c-text)",
                          fontWeight: stampType === s ? "600" : "500",
                          fontSize: "0.72rem", cursor: "pointer", textAlign: "left"
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ══ SIGNATURE MODAL ══════════════════════════════════════════════════ */}
      {showSigModal && (
        <ModalOverlay onClose={() => setShowSigModal(false)}>
          <div style={{ width: "480px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "4px" }}>Electronic Signature</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>Draw or type your signature to insert it into the document.</p>

            <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
              {(["draw", "type"] as const).map(m => (
                <button key={m} onClick={() => setSigMode(m)}
                  style={{ padding: "6px 16px", borderRadius: "6px", border: `1px solid ${sigMode === m ? toolColor : "var(--border)"}`, background: sigMode === m ? `${toolColor}15` : "var(--c-bg)", color: sigMode === m ? toolColor : "var(--c-text)", fontWeight: sigMode === m ? "700" : "500", fontSize: "0.8rem", cursor: "pointer", textTransform: "capitalize" }}>
                  {m}
                </button>
              ))}
            </div>

            {sigMode === "draw" ? (
              <canvas
                ref={sigCanvasRef} width={432} height={160}
                onMouseDown={startSigDrawing} onMouseMove={drawSig}
                onMouseUp={stopSigDrawing} onMouseLeave={stopSigDrawing}
                style={{ border: "2px dashed var(--border)", borderRadius: "8px", backgroundColor: "var(--c-bg)", display: "block", cursor: "crosshair", width: "100%" }}
              />
            ) : (
              <input
                type="text"
                value={typedSig}
                onChange={e => setTypedSig(e.target.value)}
                placeholder="Type your signature..."
                style={{
                  width: "100%", padding: "16px", border: "2px dashed var(--border)", borderRadius: "8px",
                  backgroundColor: "var(--c-bg)", font: "italic 36px 'Brush Script MT', cursive",
                  color: "var(--c-text)", outline: "none", boxSizing: "border-box"
                }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              {sigMode === "draw" && <button onClick={clearSig} style={quietBtn}>Clear</button>}
              <button onClick={() => setShowSigModal(false)} style={quietBtn}>Cancel</button>
              <button onClick={saveSignature} style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}>Insert Signature</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══ COMMENT MODAL ════════════════════════════════════════════════════ */}
      {showCommentModal && (
        <ModalOverlay onClose={() => setShowCommentModal(false)}>
          <div style={{ width: "360px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>Add Comment</h3>
            <textarea
              value={commentDraft}
              onChange={e => setCommentDraft(e.target.value)}
              placeholder="Write your comment..."
              rows={4}
              style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--c-text)", backgroundColor: "var(--c-bg)" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button onClick={() => setShowCommentModal(false)} style={quietBtn}>Cancel</button>
              <button onClick={() => {
                if (!commentDraft.trim()) return;
                const newComment: OverlayElement = {
                  id: "comment-" + Date.now(), type: "comment", page: currentPage,
                  x: commentPosition.x, y: commentPosition.y,
                  commentText: commentDraft, color: "#fbbf24"
                };
                saveHistory([...elements, newComment]);
                setShowCommentModal(false);
                setSelectedElementId(newComment.id);
                setActiveTool("select");
              }} style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}>Add Comment</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══ LINK MODAL ═══════════════════════════════════════════════════════ */}
      {showLinkModal && (
        <ModalOverlay onClose={() => setShowLinkModal(false)}>
          <div style={{ width: "360px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>Insert Hyperlink</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input placeholder="Display text (optional)" style={modalInput} id="link-text-input" />
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" style={modalInput} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button onClick={() => setShowLinkModal(false)} style={quietBtn}>Cancel</button>
              <button onClick={() => {
                const displayText = (document.getElementById("link-text-input") as HTMLInputElement)?.value || linkUrl;
                const newLink: OverlayElement = {
                  id: "link-" + Date.now(), type: "link", page: currentPage,
                  x: linkPosition.x, y: linkPosition.y,
                  content: displayText, linkUrl, color: "#2563eb"
                };
                saveHistory([...elements, newLink]);
                setShowLinkModal(false);
                setSelectedElementId(newLink.id);
                setActiveTool("select");
              }} style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}>Insert Link</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ══ WATERMARK MODAL ══════════════════════════════════════════════════ */}
      {showWatermarkModal && (
        <ModalOverlay onClose={() => setShowWatermarkModal(false)}>
          <div style={{ width: "360px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>Add Watermark</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <PropLabel>Text</PropLabel>
                <input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} style={modalInput} placeholder="CONFIDENTIAL" />
              </div>
              <div>
                <PropLabel>Opacity ({Math.round(watermarkOpacity * 100)}%)</PropLabel>
                <input type="range" min="0.05" max="0.5" step="0.01" value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseFloat(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: "var(--c-bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ color: `rgba(100,116,139,${watermarkOpacity * 4})`, fontSize: "28px", fontWeight: "900", transform: "rotate(-30deg)", display: "inline-block", letterSpacing: "0.1em", textTransform: "uppercase" }}>{watermarkText || "PREVIEW"}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button onClick={() => setShowWatermarkModal(false)} style={quietBtn}>Cancel</button>
              <button onClick={applyWatermark} style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}>Apply Watermark</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "3px", flex: 1 }}>{children}</div>
      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function RibbonDivider() {
  return <div style={{ width: "1px", backgroundColor: "var(--border)", alignSelf: "stretch", margin: "4px 8px" }} />;
}

function RibbonBtn({ icon, label, onClick, active, disabled, color, style: extraStyle }: {
  icon?: React.ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean; color?: string; style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "2px", padding: "4px 8px", minWidth: "44px", height: "44px",
        borderRadius: "10px",
        border: active ? `1px solid ${color || "var(--c-accent)"}33` : "1px solid transparent",
        background: active ? `${color || "var(--c-accent)"}15` : "transparent",
        color: active ? (color || "var(--c-accent)") : disabled ? "var(--border)" : "var(--c-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.62rem", fontWeight: "600",
        transition: "all 0.12s",
        opacity: disabled ? 0.4 : 1,
        ...extraStyle
      }}
    >
      {icon}
      <span style={{ whiteSpace: "nowrap", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </button>
  );
}

function FormatBtn({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "4px 10px", borderRadius: "9999px", minHeight: "26px",
        border: active ? "1px solid var(--c-accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-soft)" : "var(--c-bg)",
        color: active ? "var(--c-accent)" : "var(--c-text)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.7rem", fontWeight: "500"
      }}
    >
      {children}
    </button>
  );
}

function ColorSwatch({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
        padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)",
        background: "var(--c-bg)", color: "var(--c-text)", cursor: "pointer"
      }}
    >
      {label && <span style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--c-text)" }}>{label}</span>}
      <div style={{ width: label ? "20px" : "16px", height: "4px", backgroundColor: color, borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} />
    </button>
  );
}

function ColorPicker({ colors, selected, onSelect, onClose }: { colors: string[]; selected: string; onSelect: (c: string) => void; onClose: () => void }) {
  return (
    <div style={{
      position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
      backgroundColor: "var(--c-surface)", borderRadius: "8px", padding: "8px",
      boxShadow: "var(--shadow)", border: "1px solid var(--border)",
      display: "grid", gridTemplateColumns: "repeat(10, 18px)", gap: "3px", width: "214px"
    }}>
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          title={c}
          style={{
            width: "18px", height: "18px", borderRadius: "50%",
            backgroundColor: c, border: selected === c ? "2px solid var(--c-accent)" : "1px solid rgba(0,0,0,0.12)",
            cursor: "pointer"
          }}
        />
      ))}
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(9,10,15,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: "var(--c-surface)", color: "var(--c-text)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
        {children}
      </div>
    </div>
  );
}

function PropLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: "0.72rem", fontWeight: "500", color: "var(--text-muted)" }}>{children}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.72rem", fontWeight: "500", color: "var(--c-text)", textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}

// Shared button styles
const quietBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: "9999px", border: "1px solid var(--border)",
  background: "var(--c-surface)", color: "var(--c-text)", cursor: "pointer", fontWeight: "500", fontSize: "0.82rem"
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 18px", borderRadius: "9999px", border: "1px solid var(--c-accent)",
  color: "var(--c-bg)", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem"
};

const propActionBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "6px",
  padding: "6px 14px", borderRadius: "9999px", border: "1px solid var(--border)",
  background: "var(--c-bg)", color: "var(--c-text)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "500"
};

const modalInput: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid var(--border)",
  borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "var(--c-text)", backgroundColor: "var(--c-bg)"
};
