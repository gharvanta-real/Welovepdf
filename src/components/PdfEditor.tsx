import { useState, useEffect, useRef } from "react";
import { getToolColor } from "./ToolIcon";
import { getPdfjsLib } from "../utils/pdfjs";

// Modular Subcomponents
import { Header } from "./pdf-editor/Header";
import { PageSidebar } from "./pdf-editor/PageSidebar";
import { FloatingToolbar } from "./pdf-editor/FloatingToolbar";
import { CanvasViewport } from "./pdf-editor/CanvasViewport";
import { BottomBar } from "./pdf-editor/BottomBar";
import { PropertiesPanel } from "./pdf-editor/PropertiesPanel";

// Modals
import {
  SignatureModal, CommentModal, LinkModal, WatermarkModal
} from "./pdf-editor/Modals";

// Shared Types
import { OverlayElement, PdfEditorProps, ActiveTool } from "./pdf-editor/types";

export function PdfEditor({ file, selectedTool, onClose, onSave }: PdfEditorProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [undoHistory, setUndoHistory] = useState<OverlayElement[][]>([]);
  const [redoHistory, setRedoHistory] = useState<OverlayElement[][]>([]);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Text formatting defaults
  const [textColor, setTextColor] = useState("#111111");
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [textSize, setTextSize] = useState(14);
  const [textFont, setTextFont] = useState("Helvetica");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [lineHeight, setLineHeight] = useState(1.5);

  // Draw/shape defaults
  const [penColor, setPenColor] = useState("#ef4444");
  const [penThickness, setPenThickness] = useState(3);
  const [markerColor, setMarkerColor] = useState("#FFE83B");
  const [markerOpacity, setMarkerOpacity] = useState(0.4);

  const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "line" | "arrow" | "diamond">("rectangle");
  const [shapeColor, setShapeColor] = useState("#2563eb");
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

  // Page operations
  const [pageRotations, setPageRotations] = useState<{ [page: number]: number }>({});
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [customFileName, setCustomFileName] = useState(file.name);

  // Modals trigger states
  const [showSigModal, setShowSigModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 });
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);

  // Canvas refs and dragging states
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 24 });

  // Toasts State & Handler
  const [toasts, setToasts] = useState<{ id: string; message: string; type?: "info" | "success" | "warning" }[]>([]);
  const showToast = (message: string, type: "info" | "success" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const isFirstRenderTool = useRef(true);
  useEffect(() => {
    if (isFirstRenderTool.current) {
      isFirstRenderTool.current = false;
      return;
    }
    const toolLabels: { [key in ActiveTool]?: string } = {
      pan: "Pan Tool",
      select: "Select Mode",
      text: "Text Tool",
      pen: "Pen Drawing Tool",
      highlight: "Highlighter",
      shape: "Shapes Tool",
      signature: "Signature Tool",
      comment: "Comment Tool",
      redact: "Redact Tool",
      crop: "Crop Tool",
      stamp: "Stamp Tool",
      eraser: "Eraser"
    };
    showToast(`Switched to ${toolLabels[activeTool] || activeTool}`, "info");
  }, [activeTool]);

  const handleToolbarDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = toolbarPosition.x;
    const initialY = toolbarPosition.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newX = Math.max(10, initialX + dx);
      const newY = Math.max(10, initialY + dy);
      setToolbarPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const toolColor = getToolColor(selectedTool);

  // Set active tool based on entry selectedTool
  useEffect(() => {
    if (selectedTool === "Crop PDF") {
      setActiveTool("crop");
    } else if (selectedTool === "Sign PDF") {
      setActiveTool("signature");
    } else if (selectedTool === "Watermark PDF") {
      setActiveTool("stamp");
    } else if (selectedTool === "Page Numbers" || selectedTool === "Bates Numbering") {
      setActiveTool("stamp");
    } else if (selectedTool === "PDF Annotator") {
      setActiveTool("highlight");
    }
  }, [selectedTool]);

  // Load PDF document and render thumbnails
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

  // Render Page to main canvas
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

  // History Undo/Redo save states
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

  // Keyboard Event Shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore shortcuts if user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.matches("input, textarea") || target.isContentEditable) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { 
          e.preventDefault(); 
          handleUndo(); 
          showToast("Undo applied", "info"); 
        }
        if ((e.key === "y") || (e.key === "z" && e.shiftKey)) { 
          e.preventDefault(); 
          handleRedo(); 
          showToast("Redo applied", "info"); 
        }
        if (e.key === "0") { 
          e.preventDefault(); 
          setZoom(100); 
          showToast("Reset Zoom", "info"); 
        }
      } else {
        // Single letter tool shortcuts
        const key = e.key.toLowerCase();
        if (key === "v") { setActiveTool("select"); }
        else if (key === "t") { setActiveTool("text"); }
        else if (key === "p") { setActiveTool("pen"); }
        else if (key === "h") { setActiveTool("highlight"); }
        else if (key === "s") { setActiveTool("shape"); }
        else if (key === "c") { setActiveTool("comment"); }
        else if (key === "r") { setActiveTool("redact"); }
        else if (key === "o") { setActiveTool("crop"); }
        else if (key === "w") { setActiveTool("stamp"); }
        else if (e.key === "+" || e.key === "=") { 
          e.preventDefault(); 
          setZoom((z) => Math.min(z + 10, 250)); 
        }
        else if (e.key === "-") { 
          e.preventDefault(); 
          setZoom((z) => Math.max(z - 10, 30)); 
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
          showToast("Deleted element", "warning");
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

  // Canvas Mouse Coordinates Helper
  function getCanvasCoords(e: React.MouseEvent) {
    const container = overlayContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  // Page Operations
  function rotatePage(pageNum: number, direction: "cw" | "ccw" = "cw") {
    const delta = direction === "cw" ? 90 : 270;
    setPageRotations(prev => ({ ...prev, [pageNum]: ((prev[pageNum] || 0) + delta) % 360 }));
  }

  function removePage(pageNum: number) {
    const next = new Set(removedPages);
    next.has(pageNum) ? next.delete(pageNum) : next.add(pageNum);
    setRemovedPages(next);
  }

  // Text Styling Modifiers
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

  // Crop Sliders Guides
  const handleCropLeftChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v); setCropRight(v); setCropTop(v); setCropBottom(v);
      setCropMargin(v * 2);
    } else { setCropLeft(v); }
  };
  const handleCropRightChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v); setCropRight(v); setCropTop(v); setCropBottom(v);
      setCropMargin(v * 2);
    } else { setCropRight(v); }
  };
  const handleCropTopChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v); setCropRight(v); setCropTop(v); setCropBottom(v);
      setCropMargin(v * 2);
    } else { setCropTop(v); }
  };
  const handleCropBottomChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    if (isCropLinked) {
      setCropLeft(v); setCropRight(v); setCropTop(v); setCropBottom(v);
      setCropMargin(v * 2);
    } else { setCropBottom(v); }
  };
  const handleCropMarginUniformChange = (val: number) => {
    const v = Math.min(Math.max(val, 0), 45);
    setCropMargin(v);
    setCropLeft(v / 2); setCropRight(v / 2); setCropTop(v / 2); setCropBottom(v / 2);
  };

  // Drag handles for Crop boundaries
  const handleCropDragStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startL = cropLeft;
    const startR = cropRight;
    const startT = cropTop;
    const startB = cropBottom;

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
          const baseMargin = startL;
          const newMargin = Math.min(Math.max(baseMargin + maxDelta, 0), 45);
          const rounded = Math.round(newMargin * 10) / 10;
          setCropLeft(rounded); setCropRight(rounded); setCropTop(rounded); setCropBottom(rounded);
          setCropMargin(rounded * 2);
        }
      } else {
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
          setCropLeft(Math.round(newLeft * 10) / 10); setCropTop(Math.round(newTop * 10) / 10);
        } else if (handle === "ne") {
          const newRight = Math.min(Math.max(startR - dxPercent, 0), 100 - startL - 5);
          const newTop = Math.min(Math.max(startT + dyPercent, 0), 100 - startB - 5);
          setCropRight(Math.round(newRight * 10) / 10); setCropTop(Math.round(newTop * 10) / 10);
        } else if (handle === "sw") {
          const newLeft = Math.min(Math.max(startL + dxPercent, 0), 100 - startR - 5);
          const newBottom = Math.min(Math.max(startB - dyPercent, 0), 100 - startT - 5);
          setCropLeft(Math.round(newLeft * 10) / 10); setCropBottom(Math.round(newBottom * 10) / 10);
        } else if (handle === "se") {
          const newRight = Math.min(Math.max(startR - dxPercent, 0), 100 - startL - 5);
          const newBottom = Math.min(Math.max(startB - dyPercent, 0), 100 - startT - 5);
          setCropRight(Math.round(newRight * 10) / 10); setCropBottom(Math.round(newBottom * 10) / 10);
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

  // Canvas Mouse Down - Interactive drawing/selecting/placing triggers
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
          setTextColor(clickedEl.color || "#111111");
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
        APPROVED: "#22c55e", DRAFT: "#64748b", CONFIDENTIAL: "#dc2626",
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

  // Element CRUD modifiers
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

  // File Download Callback
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

  // Modals Save Callbacks
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

  // Floating Popover More Actions Handler
  const handleSelectMoreAction = (actionKey: string) => {
    if (actionKey === "edit_rotate_left") {
      rotatePage(currentPage, "ccw");
    } else if (actionKey === "edit_rotate_right") {
      rotatePage(currentPage, "cw");
    } else if (actionKey === "organize_delete") {
      removePage(currentPage);
    } else if (actionKey === "insert_image") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e: any) => {
        const selFile = e.target.files[0];
        if (selFile) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            const newImg: OverlayElement = {
              id: "img-" + Date.now(), type: "image", page: currentPage,
              x: 30, y: 30, width: 30, height: 20, dataUrl: event.target.result
            };
            saveHistory([...elements, newImg]);
            setSelectedElementId(newImg.id);
            setActiveTool("select");
          };
          reader.readAsDataURL(selFile);
        }
      };
      fileInput.click();
    } else if (actionKey === "insert_page_number") {
      const newElements = [...elements];
      for (let i = 1; i <= totalPages; i++) {
        const newNum: OverlayElement = {
          id: `pgnum-${i}-${Date.now()}`, type: "stamp", page: i,
          x: 88, y: 92, width: 6, height: 4, stampType: "PAGE_NUM",
          content: `${i}`, color: "#64748b"
        };
        newElements.push(newNum);
      }
      saveHistory(newElements);
      alert("Page numbers injected to bottom-right of all pages.");
    } else if (actionKey === "view_fit_width") {
      setZoom(125);
    } else if (actionKey === "view_fit_page") {
      setZoom(100);
    } else if (actionKey === "view_actual_size") {
      setZoom(100);
    } else if (actionKey === "other_redact") {
      setActiveTool("redact");
    } else {
      alert(`Action "${actionKey}" is not implemented in this demo.`);
    }
  };

  const selectedEl = elements.find(e => e.id === selectedElementId);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#f8fafc",
      color: "#1e293b",
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* ══ TOP HEADER ══ */}
      <Header
        fileName={customFileName}
        selectedTool={selectedTool}
        onRenameFile={setCustomFileName}
        onClose={onClose}
        onDownload={handleDownload}
        onToggleProperties={() => setShowRightPanel(!showRightPanel)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoHistory.length > 0}
        canRedo={redoHistory.length > 0}
        showRightPanel={showRightPanel}
      />

      {/* ══ MAIN WORKSPACE CONTAINER ══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Page thumbnails sidebar */}
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
          onAddPages={() => alert("Please choose local files to merge/add.")}
          setPageOrder={setPageOrder}
          showToast={showToast}
        />

        {/* Center Document View canvas area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          
          {/* Floating Vertical Toolbar Capsule */}
          <div style={{ position: "absolute", left: `${toolbarPosition.x}px`, top: `${toolbarPosition.y}px`, zIndex: 10 }}>
            <FloatingToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onSelectMoreAction={handleSelectMoreAction}
              showCommentModal={() => setShowCommentModal(true)}
              showWatermarkModal={() => setShowWatermarkModal(true)}
              showSignatureModal={() => setShowSigModal(true)}
              showLinkModal={() => setShowLinkModal(true)}
              onDragStart={handleToolbarDragStart}
            />
          </div>

          {/* Canvas Viewport Frame */}
          <CanvasViewport
            pageCanvasRef={pageCanvasRef}
            overlayContainerRef={overlayContainerRef}
            showRuler={showRuler}
            showGrid={showGrid}
            pageMargins={pageMargins}
            activeTool={activeTool}
            selectedTool={selectedTool}
            currentPage={currentPage}
            elements={elements}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            updateElement={updateElement}
            updateTextContent={updateTextContent}
            deleteElement={deleteElement}
            toolColor={toolColor}
            isDrawingPen={isDrawingPen}
            currentPathPoints={currentPathPoints}
            penColor={penColor}
            penThickness={penThickness}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            cropTop={cropTop}
            cropBottom={cropBottom}
            cropLeft={cropLeft}
            cropRight={cropRight}
            cropMargin={cropMargin}
            handleCropDragStart={handleCropDragStart}
            isCropLinked={isCropLinked}
          />

          {/* Bottom Pagination & Zoom Status Bar */}
          <BottomBar
            currentPage={currentPage}
            totalPages={totalPages}
            zoom={zoom}
            setZoom={setZoom}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Right side Properties panel */}
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
            onClosePanel={() => setShowRightPanel(false)}
            
            // Defaults properties
            handleFontChange={handleFontChange}
            align={align}
            updateAlignment={updateAlignment}
            textColor={textColor}
            handleTextColorChange={handleTextColorChange}
            penColor={penColor}
            setPenColor={setPenColor}
            penThickness={penThickness}
            markerColor={markerColor}
            setMarkerColor={setMarkerColor}
            markerOpacity={markerOpacity}
            setMarkerOpacity={setMarkerOpacity}
            shapeType={shapeType}
            setShapeType={setShapeType}
            shapeColor={shapeColor}
            setShapeColor={setShapeColor}
            shapeFillColor={shapeFillColor}
            setShapeFillColor={setShapeFillColor}
            shapeThickness={shapeThickness}
            setShapeThickness={setShapeThickness}
          />
        )}
      </div>

      {/* ══ SIGNATURE MODAL ══ */}
      {showSigModal && (
        <SignatureModal
          onClose={() => setShowSigModal(false)}
          onSaveSignature={handleSaveSignature}
          toolColor={toolColor}
        />
      )}

      {/* ══ COMMENT MODAL ══ */}
      {showCommentModal && (
        <CommentModal
          onClose={() => setShowCommentModal(false)}
          onAddComment={handleAddComment}
          toolColor={toolColor}
        />
      )}

      {/* ══ LINK MODAL ══ */}
      {showLinkModal && (
        <LinkModal
          onClose={() => setShowLinkModal(false)}
          onInsertLink={handleInsertLink}
          toolColor={toolColor}
        />
      )}

      {/* ══ WATERMARK MODAL ══ */}
      {showWatermarkModal && (
        <WatermarkModal
          onClose={() => setShowWatermarkModal(false)}
          onApplyWatermark={handleApplyWatermark}
          toolColor={toolColor}
        />
      )}

      {/* ══ TOAST NOTIFICATIONS OVERLAY ══ */}
      <div style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 9999,
        pointerEvents: "none"
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-notification"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              pointerEvents: "auto",
              border: "1px solid rgba(255,255,255,0.08)",
              minWidth: "200px"
            }}
          >
            {toast.type === "success" && <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>}
            {toast.type === "warning" && <span style={{ color: "#f59e0b", fontWeight: "bold" }}>⚠</span>}
            {toast.type === "info" && <span style={{ color: "#3b82f6", fontWeight: "bold" }}>ℹ</span>}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
