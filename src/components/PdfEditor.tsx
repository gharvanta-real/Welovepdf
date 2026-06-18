import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2,
  FileText, Crop, Layers, Share2, Download
} from "lucide-react";
import { getToolColor } from "./ToolIcon";
import { getPdfjsLib } from "../utils/pdfjs";

// Subcomponents
import { PageSidebar } from "./pdf-editor/PageSidebar";
import { RibbonBar } from "./pdf-editor/RibbonBar";
import { PropertiesPanel } from "./pdf-editor/PropertiesPanel";
import {
  SignatureModal, CommentModal, LinkModal, WatermarkModal
} from "./pdf-editor/Modals";

// Shared Types
import { OverlayElement, PdfEditorProps, ActiveTool, RibbonTab } from "./pdf-editor/types";

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

  // Signature modal trigger
  const [showSigModal, setShowSigModal] = useState(false);

  // Canvas refs and dragging state
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // Color pickers visibility
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showPenColorPicker, setShowPenColorPicker] = useState(false);
  const [showMarkerColorPicker, setShowMarkerColorPicker] = useState(false);
  const [showShapeColorPicker, setShowShapeColorPicker] = useState(false);

  // Comment modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });

  // Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 });

  // Watermark
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);

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
      try {
        const pdfjsLib = await getPdfjsLib();
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
      setShowCommentModal(true);
    } else if (activeTool === "link") {
      setLinkPosition({ x, y });
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

  // ── Save/Add Callbacks from Modals ────────────────────────────────────────
  function handleSaveSignature(dataUrl: string) {
    const newSig: OverlayElement = {
      id: "sig-" + Date.now(), type: "signature", page: currentPage,
      x: 35, y: 72, width: 24, height: 10, dataUrl
    };
    saveHistory([...elements, newSig]);
    setShowSigModal(false);
    setSelectedElementId(newSig.id);
    setActiveTool("select");
  }

  function handleAddComment(commentText: string) {
    const newComment: OverlayElement = {
      id: "comment-" + Date.now(), type: "comment", page: currentPage,
      x: commentPosition.x, y: commentPosition.y,
      commentText, color: "#fbbf24"
    };
    saveHistory([...elements, newComment]);
    setShowCommentModal(false);
    setSelectedElementId(newComment.id);
    setActiveTool("select");
  }

  function handleInsertLink(linkText: string, url: string) {
    const newLink: OverlayElement = {
      id: "link-" + Date.now(), type: "link", page: currentPage,
      x: linkPosition.x, y: linkPosition.y,
      content: linkText || url, linkUrl: url, color: "#2563eb"
    };
    saveHistory([...elements, newLink]);
    setShowLinkModal(false);
    setSelectedElementId(newLink.id);
    setActiveTool("select");
  }

  function handleApplyWatermark(text: string, opacity: number) {
    const newWm: OverlayElement = {
      id: "stamp-wm-" + Date.now(), type: "stamp", page: currentPage,
      x: 15, y: 35, width: 70, height: 30, stampType: "WATERMARK",
      color: `rgba(100,116,139,${opacity})`, content: text, opacity
    };
    saveHistory([...elements, newWm]);
    setShowWatermarkModal(false);
  }

  // Selected element
  const selectedEl = elements.find(e => e.id === selectedElementId);

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
      <RibbonBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        undoHistory={undoHistory}
        redoHistory={redoHistory}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        selectedElementId={selectedElementId}
        duplicateElement={duplicateElement}
        deleteElement={deleteElement}
        textFont={textFont}
        setTextFont={setTextFont}
        handleFontChange={handleFontChange}
        textSize={textSize}
        handleTextSizeChange={handleTextSizeChange}
        isBold={isBold}
        toggleBold={toggleBold}
        isItalic={isItalic}
        toggleItalic={toggleItalic}
        isUnderline={isUnderline}
        toggleUnderline={toggleUnderline}
        isStrike={isStrike}
        toggleStrike={toggleStrike}
        textColor={textColor}
        showTextColorPicker={showTextColorPicker}
        setShowTextColorPicker={setShowTextColorPicker}
        handleTextColorChange={handleTextColorChange}
        align={align}
        updateAlignment={updateAlignment}
        toolColor={toolColor}
        currentPage={currentPage}
        elements={elements}
        saveHistory={saveHistory}
        setSelectedElementId={setSelectedElementId}
        shapeType={shapeType}
        setShapeType={setShapeType}
        setShowWatermarkModal={setShowWatermarkModal}
        setShowSigModal={setShowSigModal}
        penColor={penColor}
        setPenColor={setPenColor}
        showPenColorPicker={showPenColorPicker}
        setShowPenColorPicker={setShowPenColorPicker}
        penThickness={penThickness}
        setPenThickness={setPenThickness}
        markerColor={markerColor}
        setMarkerColor={setMarkerColor}
        showMarkerColorPicker={showMarkerColorPicker}
        setShowMarkerColorPicker={setShowMarkerColorPicker}
        markerOpacity={markerOpacity}
        setMarkerOpacity={setMarkerOpacity}
        redactText={redactText}
        setRedactText={setRedactText}
        redactColor={redactColor}
        setRedactColor={setRedactColor}
        shapeColor={shapeColor}
        setShapeColor={setShapeColor}
        showShapeColorPicker={showShapeColorPicker}
        setShowShapeColorPicker={setShowShapeColorPicker}
        shapeThickness={shapeThickness}
        setShapeThickness={setShapeThickness}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageOrientation={pageOrientation}
        setPageOrientation={setPageOrientation}
        pageMargins={pageMargins}
        setPageMargins={setPageMargins}
        rotatePage={rotatePage}
        removePage={removePage}
        zoom={zoom}
        setZoom={setZoom}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
        pageOrder={pageOrder}
      />

      <div className="editor-main-frame">

        {/* ── LEFT SIDEBAR (Page Thumbnails) ────────────────────────────── */}
        <PageSidebar
          pageOrder={pageOrder}
          removedPages={removedPages}
          pageRotations={pageRotations}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          thumbnails={thumbnails}
          toolColor={toolColor}
          totalPages={totalPages}
          rotatePage={rotatePage}
          removePage={removePage}
        />

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
                          <FileText size={10} style={{ color: "#fff" }} />
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
            padding: "4px 20px", backgroundColor: "var(--surface-raised)", borderTop: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: "0.70rem", flexShrink: 0
          }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ fontWeight: "600" }}>
                Page <span style={{ color: "var(--c-text)" }}>{currentPage}</span> / {totalPages}
              </span>
              <span>Tool: <span style={{ color: toolColor, fontWeight: "600", textTransform: "capitalize" }}>{activeTool}</span></span>
              {selectedEl && <span>Selected: <span style={{ color: "var(--c-text)" }}>{selectedEl.type}</span></span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                style={{ width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, padding: 0 }}>
                <ChevronLeft size={11} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                style={{ width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, padding: 0 }}>
                <ChevronRight size={11} />
              </button>
              <div style={{ height: "10px", width: "1px", backgroundColor: "var(--border)", margin: "0 3px" }} />
              <button onClick={() => setZoom(p => Math.max(p - 10, 30))} style={{ width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><ZoomOut size={11} /></button>
              <span style={{ color: "var(--c-text)", fontWeight: "500", minWidth: "36px", textAlign: "center", fontSize: "0.72rem" }}>{zoom}%</span>
              <button onClick={() => setZoom(p => Math.min(p + 10, 250))} style={{ width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><ZoomIn size={11} /></button>
              <button onClick={() => setZoom(100)} style={{ height: "20px", padding: "0 6px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.65rem", fontWeight: "500" }}><Maximize2 size={11} style={{ marginRight: "2px" }} /> 100%</button>
            </div>
          </div>
        </main>

        {/* ── RIGHT PROPERTIES PANEL ────────────────────────────────────── */}
        {showRightPanel && (
          <PropertiesPanel
            selectedEl={selectedEl}
            selectedTool={selectedTool}
            activeTool={activeTool}
            textFont={textFont}
            updateElement={updateElement}
            textSize={textSize}
            handleTextSizeChange={handleTextSizeChange}
            isBold={isBold}
            toggleBold={toggleBold}
            isItalic={isItalic}
            toggleItalic={toggleItalic}
            isUnderline={isUnderline}
            toggleUnderline={toggleUnderline}
            isStrike={isStrike}
            toggleStrike={toggleStrike}
            duplicateElement={duplicateElement}
            toggleLock={toggleLock}
            bringForward={bringForward}
            sendBackward={sendBackward}
            deleteElement={deleteElement}
            cropMargin={cropMargin}
            cropLeft={cropLeft}
            cropRight={cropRight}
            cropTop={cropTop}
            cropBottom={cropBottom}
            isCropLinked={isCropLinked}
            setIsCropLinked={setIsCropLinked}
            handleCropMarginUniformChange={handleCropMarginUniformChange}
            handleCropLeftChange={handleCropLeftChange}
            handleCropRightChange={handleCropRightChange}
            handleCropTopChange={handleCropTopChange}
            handleCropBottomChange={handleCropBottomChange}
            totalPages={totalPages}
            currentPage={currentPage}
            zoom={zoom}
            elementsCount={elements.length}
            stampType={stampType}
            setStampType={setStampType}
            toolColor={toolColor}
          />
        )}
      </div>

      {/* ══ SIGNATURE MODAL ══════════════════════════════════════════════════ */}
      {showSigModal && (
        <SignatureModal
          onClose={() => setShowSigModal(false)}
          onSaveSignature={handleSaveSignature}
          toolColor={toolColor}
        />
      )}

      {/* ══ COMMENT MODAL ════════════════════════════════════════════════════ */}
      {showCommentModal && (
        <CommentModal
          onClose={() => setShowCommentModal(false)}
          onAddComment={handleAddComment}
          toolColor={toolColor}
        />
      )}

      {/* ══ LINK MODAL ═══════════════════════════════════════════════════════ */}
      {showLinkModal && (
        <LinkModal
          onClose={() => setShowLinkModal(false)}
          onInsertLink={handleInsertLink}
          toolColor={toolColor}
        />
      )}

      {/* ══ WATERMARK MODAL ══════════════════════════════════════════════════ */}
      {showWatermarkModal && (
        <WatermarkModal
          onClose={() => setShowWatermarkModal(false)}
          onApplyWatermark={handleApplyWatermark}
          toolColor={toolColor}
        />
      )}
    </div>
  );
}
