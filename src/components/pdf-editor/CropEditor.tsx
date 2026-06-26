import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, Crop, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Maximize2,
  Check, AlignCenter, Layout, Sliders,
  RefreshCw, Download,
  Settings2, Expand, FileType2, ScanLine, Scissors, FrameIcon,
  LayoutGrid, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, Minimize2,
} from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { ToolIcon } from "../ToolIcon";

interface CropEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

// ─── Preset definitions ──────────────────────────────────────────────────────
const PRESETS = [
  { id: "custom",  label: "Custom Margins",        Icon: Settings2,  values: null, color: "#3b82f6" },
  { id: "none",    label: "No Margins (Full Page)", Icon: Expand,     values: { t: 0,  b: 0,  l: 0,  r: 0  }, color: "#ef4444" },
  { id: "a4",      label: "Standard A4",            Icon: FileType2,  values: { t: 10, b: 10, l: 5,  r: 5  }, color: "#10b981" },
  { id: "letter",  label: "Letter Page",            Icon: FileText,   values: { t: 8,  b: 8,  l: 8,  r: 8  }, color: "#ec4899" },
  { id: "auto",    label: "Auto-Crop Scanner",      Icon: ScanLine,   values: { t: 12, b: 12, l: 12, r: 12 }, color: "#8b5cf6" },
  { id: "tight",   label: "Tight Trim (±3%)",       Icon: Scissors,   values: { t: 3,  b: 3,  l: 3,  r: 3  }, color: "#06b6d4" },
  { id: "wide",    label: "Wide Margins (15%)",     Icon: FrameIcon,  values: { t: 15, b: 15, l: 15, r: 15 }, color: "#f59e0b" },
];

const LAYOUT_PATTERNS = [
  { label: "Full",       values: [0,  0,  0,  0 ], Icon: LayoutGrid },
  { label: "Center",     values: [10, 10, 10, 10], Icon: Target },
  { label: "Top Heavy",  values: [3,  15, 5,  5 ], Icon: ArrowUp },
  { label: "Bottom",     values: [15, 3,  5,  5 ], Icon: ArrowDown },
  { label: "Left Trim",  values: [5,  5,  15, 3 ], Icon: ArrowLeft },
  { label: "Right Trim", values: [5,  5,  3,  15], Icon: ArrowRight },
  { label: "Portrait",   values: [8,  8,  15, 15], Icon: AlignVerticalJustifyCenter },
  { label: "Landscape",  values: [15, 15, 8,  8 ], Icon: AlignHorizontalJustifyCenter },
  { label: "Tight",      values: [3,  3,  3,  3 ], Icon: Minimize2 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

/** Render pages in small batches to keep the browser responsive */
async function renderBatch<T>(
  items: T[],
  batchSize: number,
  worker: (item: T, idx: number) => Promise<void>,
  onBatchDone?: () => void,
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    await Promise.all(slice.map((item, j) => worker(item, i + j)));
    onBatchDone?.();
  }
}

// ─── Margin Slider ───────────────────────────────────────────────────────────
function MarginSlider({
  label,
  value,
  onChange,
  accent = "#2563eb",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{label}</span>
        <div style={{
          background: "#f4f4f4",
          borderRadius: "6px",
          padding: "2px 8px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#111827",
          minWidth: "42px",
          textAlign: "center",
        }}>
          {Math.round(value)}%
        </div>
      </div>
      <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: "4px", background: "#e5e7eb", borderRadius: "99px" }} />
        <div style={{
          position: "absolute",
          left: 0,
          width: `${value / 40 * 100}%`,
          height: "4px",
          background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
          borderRadius: "99px",
          transition: "width 0.05s",
        }} />
        <input
          type="range" min={0} max={40} step={0.5} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ position: "absolute", width: "100%", opacity: 0, cursor: "pointer", height: "20px", margin: 0 }}
        />
        <div style={{
          position: "absolute",
          left: `calc(${value / 40 * 100}% - 8px)`,
          width: "16px", height: "16px",
          borderRadius: "50%",
          background: "#ffffff",
          border: `2px solid ${accent}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.05s",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

// ─── Number Input ─────────────────────────────────────────────────────────────
function NumberInput({ value, onChange, min = 0, max = 40 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <input
      type="number" min={min} max={max} step={0.5}
      value={Math.round(value * 10) / 10}
      onChange={e => onChange(clamp(parseFloat(e.target.value) || 0, min, max))}
      style={{
        width: "56px", padding: "4px 6px",
        border: "1px solid #e5e7eb", borderRadius: "6px",
        fontSize: "12px", fontWeight: 600, color: "#111827",
        background: "#ffffff", outline: "none", textAlign: "center",
      }}
    />
  );
}

// ─── Lazy Thumbnail Item ──────────────────────────────────────────────────────
/**
 * Each thumbnail renders itself via IntersectionObserver — only fires the
 * render when the element is visible in the sidebar scroll area.
 * Uses the system "skeleton-shimmer" class while loading.
 */
function LazyThumb({
  pageNum,
  pdfDoc,
  isActive,
  onClick,
}: {
  pageNum: number;
  pdfDoc: any;
  isActive: boolean;
  onClick: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!pdfDoc || rendered.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || rendered.current) return;
        rendered.current = true;
        setRendering(true);
        observer.disconnect();
        try {
          const dpr  = Math.min(window.devicePixelRatio || 1, 2);
          const page = await pdfDoc.getPage(pageNum);
          const vp   = page.getViewport({ scale: 0.2 * dpr });
          const c    = document.createElement("canvas");
          c.width    = vp.width;
          c.height   = vp.height;
          const ctx  = c.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            setDataUrl(c.toDataURL("image/jpeg", 0.82));
          }
        } catch (_) {
          // silently ignore individual page errors
        } finally {
          setRendering(false);
        }
      },
      { rootMargin: "120px 0px" }, // pre-load slightly before entering view
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pdfDoc, pageNum]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        padding: "4px",
        border: "none",
        background: "none",
        cursor: "pointer",
        borderRadius: "8px",
        outline: isActive ? "2px solid #2563eb" : "2px solid transparent",
        outlineOffset: "1px",
        transition: "outline 0.12s",
      }}
    >
      <div style={{
        width: "100%",
        aspectRatio: "0.707",
        background: "#f4f4f4",
        borderRadius: "5px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isActive ? "0 2px 8px rgba(37,99,235,0.18)" : "0 1px 3px rgba(0,0,0,0.06)",
        position: "relative",
      }}>
        {/* Shimmer placeholder — uses the system skeleton-shimmer class */}
        {(rendering || !dataUrl) && (
          <div
            className="skeleton-shimmer"
            style={{
              position: "absolute",
              inset: 0,
              background: "#ebebeb",
              borderRadius: "5px",
            }}
          />
        )}
        {dataUrl && (
          <img
            src={dataUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            alt={`Page ${pageNum}`}
          />
        )}
        {/* Page number badge over shimmer when not loaded */}
        {!dataUrl && !rendering && (
          <FileText size={18} color="#d1d5db" />
        )}
      </div>
      <div style={{
        marginTop: "4px",
        textAlign: "center",
        fontSize: "10px",
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "#2563eb" : "#6b7280",
      }}>
        {pageNum}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CropEditor({ file, onClose, onSave }: CropEditorProps) {
  // PDF state
  const [pdfDoc, setPdfDoc]     = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(0);
  const [zoom, setZoom]         = useState(1.0);
  const [pageOrder, setPageOrder]     = useState<number[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  // Crop margins (0–40 %)
  const [cropTop,    setCropTop]    = useState(10);
  const [cropBottom, setCropBottom] = useState(10);
  const [cropLeft,   setCropLeft]   = useState(10);
  const [cropRight,  setCropRight]  = useState(10);

  // UI state
  const [preset, setPreset]         = useState("custom");
  const [applyToAll, setApplyToAll] = useState(true);
  const [activeTab, setActiveTab]   = useState<"preset" | "manual" | "layout">("preset");
  const [showGuides, setShowGuides] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);

  // Refs
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const overlayRef         = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef      = useRef<string | null>(null);
  const dragStartPos       = useRef({ x: 0, y: 0 });
  const dragStartMargins   = useRef({ t: 0, b: 0, l: 0, r: 0 });

  // ─── Load PDF (fast — only load doc + page count, NO thumbnails upfront) ──
  useEffect(() => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async function () {
      const data = new Uint8Array(this.result as ArrayBuffer);
      try {
        const pdfjsLib = await getPdfjsLib();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageOrder(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
        // Thumbnails are NOW rendered lazily via IntersectionObserver in <LazyThumb>
        // No upfront loop — instant first paint
      } catch (err) {
        console.error("CropEditor: PDF load error", err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  // ─── Render current page (DPR-aware for sharp output) ───────────────────
  useEffect(() => {
    if (!pdfDoc || !pageOrder[currentPage - 1]) return;
    const pageNum = pageOrder[currentPage - 1];
    let cancelled = false;
    setRenderingPage(true);

    async function render() {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const dpr  = Math.min(window.devicePixelRatio || 1, 2);
        const vp   = page.getViewport({ scale: zoom * dpr });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Physical pixels = sharp rendering
        canvas.width  = vp.width;
        canvas.height = vp.height;
        // CSS pixels = actual display size
        canvas.style.width  = `${vp.width  / dpr}px`;
        canvas.style.height = `${vp.height / dpr}px`;

        if (overlayRef.current) {
          overlayRef.current.style.width  = `${vp.width  / dpr}px`;
          overlayRef.current.style.height = `${vp.height / dpr}px`;
        }
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
      } finally {
        if (!cancelled) setRenderingPage(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, pageOrder, zoom]);

  // ─── Apply preset values ─────────────────────────────────────────────────
  useEffect(() => {
    const p = PRESETS.find(p => p.id === preset);
    if (p?.values) {
      setCropTop(p.values.t);
      setCropBottom(p.values.b);
      setCropLeft(p.values.l);
      setCropRight(p.values.r);
    }
  }, [preset]);

  // ─── Drag Handlers ───────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    dragHandleRef.current    = handle;
    dragStartPos.current     = { x: e.clientX, y: e.clientY };
    dragStartMargins.current = { t: cropTop, b: cropBottom, l: cropLeft, r: cropRight };
    setIsDragging(true);
    setPreset("custom");
  }, [cropTop, cropBottom, cropLeft, cropRight]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragHandleRef.current || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const dx   = ((e.clientX - dragStartPos.current.x) / rect.width)  * 100;
      const dy   = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;
      const s    = dragStartMargins.current;
      const h    = dragHandleRef.current;

      if (h === "tl") {
        setCropLeft(()  => clamp(s.l + dx, 0, 100 - s.r - 5));
        setCropTop(()   => clamp(s.t + dy, 0, 100 - s.b - 5));
      } else if (h === "tr") {
        setCropRight(() => clamp(s.r - dx, 0, 100 - s.l - 5));
        setCropTop(()   => clamp(s.t + dy, 0, 100 - s.b - 5));
      } else if (h === "bl") {
        setCropLeft(()   => clamp(s.l + dx, 0, 100 - s.r - 5));
        setCropBottom(() => clamp(s.b - dy, 0, 100 - s.t - 5));
      } else if (h === "br") {
        setCropRight(() => clamp(s.r - dx, 0, 100 - s.l - 5));
        setCropBottom(() => clamp(s.b - dy, 0, 100 - s.t - 5));
      } else if (h === "top") {
        setCropTop(()   => clamp(s.t + dy, 0, 100 - s.b - 5));
      } else if (h === "bot") {
        setCropBottom(() => clamp(s.b - dy, 0, 100 - s.t - 5));
      } else if (h === "lft") {
        setCropLeft(()  => clamp(s.l + dx, 0, 100 - s.r - 5));
      } else if (h === "rgt") {
        setCropRight(() => clamp(s.r - dx, 0, 100 - s.l - 5));
      } else if (h === "move") {
        if (s.l + dx >= 0 && s.r - dx >= 0) {
          setCropLeft(clamp(s.l + dx, 0, 100));
          setCropRight(clamp(s.r - dx, 0, 100));
        }
        if (s.t + dy >= 0 && s.b - dy >= 0) {
          setCropTop(clamp(s.t + dy, 0, 100));
          setCropBottom(clamp(s.b - dy, 0, 100));
        }
      }
    }
    function onUp() {
      dragHandleRef.current = null;
      setIsDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ─── Apply / Reset ───────────────────────────────────────────────────────
  function handleApply() {
    const dt = new DataTransfer();
    dt.items.add(file);
    onSave(dt.files, {
      pageOrder:    pageOrder.join(","),
      rotatePages:  "",
      removePages:  "",
      cropMargin:   "0",
      cropLeft:     String(Math.round(cropLeft)),
      cropRight:    String(Math.round(cropRight)),
      cropTop:      String(Math.round(cropTop)),
      cropBottom:   String(Math.round(cropBottom)),
      cropAllPages: applyToAll ? "true" : "false",
    });
  }

  function handleReset() {
    setCropTop(10); setCropBottom(10); setCropLeft(10); setCropRight(10);
    setPreset("custom");
  }

  const cropW = Math.max(0, 100 - cropLeft - cropRight);
  const cropH = Math.max(0, 100 - cropTop - cropBottom);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      fontFamily: '"Google Sans", "Inter", system-ui, sans-serif',
      background: "#F0F2F5",
    }}>

      {/* ── LEFT: Page Thumbnail Sidebar ─────────────────────────────── */}
      <aside style={{
        width: "168px",
        flexShrink: 0,
        height: "100%",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#374151",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>Pages</span>

          {isLoading ? (
            /* Skeleton pill while PDF loads */
            <div
              className="skeleton-shimmer"
              style={{
                width: "36px",
                height: "18px",
                borderRadius: "99px",
                background: "#ebebeb",
              }}
            />
          ) : (
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#6b7280",
              background: "#f4f4f4",
              padding: "2px 7px",
              borderRadius: "99px",
            }}>
              {currentPage}/{totalPages}
            </span>
          )}
        </div>

        {/* Page List — virtualized via IntersectionObserver in each LazyThumb */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {isLoading ? (
            /* Skeleton placeholder cards while PDF document is loading */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                width: "100%",
                aspectRatio: "0.707",
                borderRadius: "6px",
                overflow: "hidden",
              }}>
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#ebebeb",
                    borderRadius: "6px",
                  }}
                />
              </div>
            ))
          ) : (
            /* LazyThumb renders each page via IntersectionObserver */
            pageOrder.map((pageNum, idx) => (
              <LazyThumb
                key={pageNum}
                pageNum={pageNum}
                pdfDoc={pdfDoc}
                isActive={currentPage === idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
              />
            ))
          )}
        </div>

        {/* Page Nav Arrows */}
        <div style={{
          padding: "8px 10px",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          gap: "6px",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              flex: 1, padding: "6px",
              border: "1px solid #e5e7eb", borderRadius: "6px",
              background: currentPage <= 1 ? "#f9fafb" : "#ffffff",
              color: currentPage <= 1 ? "#d1d5db" : "#374151",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{
              flex: 1, padding: "6px",
              border: "1px solid #e5e7eb", borderRadius: "6px",
              background: currentPage >= totalPages ? "#f9fafb" : "#ffffff",
              color: currentPage >= totalPages ? "#d1d5db" : "#374151",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {/* ── CENTER: PDF Canvas + Crop Overlay ──────────────────────── */}
      <div
        ref={canvasContainerRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          background: "#F0F2F5",
          position: "relative",
        }}
      >
        {/* Canvas Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
          gap: "12px",
        }}>
          {/* Left Side: Title & Loading indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Crop size={14} color="#2563eb" strokeWidth={1.5} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
              Crop Preview
            </span>
            {/* Page rendering state spinner */}
            {renderingPage && (
              <span style={{
                fontSize: "12px", color: "#2563eb",
                background: "#eff6ff", padding: "2px 8px",
                borderRadius: "4px", fontWeight: 600,
              }}>
                Loading…
              </span>
            )}
            {isDragging && !renderingPage && (
              <span style={{
                fontSize: "12px", color: "#2563eb",
                background: "#eff6ff", padding: "2px 8px",
                borderRadius: "4px", fontWeight: 600,
              }}>
                Dragging…
              </span>
            )}
          </div>

          {/* Right Side: Grouped toolbar controls with separators */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Zoom Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1)))} style={canvasToolBtn} title="Zoom Out">
                <ZoomOut size={14} strokeWidth={1.5} />
              </button>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", minWidth: "38px", textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))} style={canvasToolBtn} title="Zoom In">
                <ZoomIn size={14} strokeWidth={1.5} />
              </button>
              <button onClick={() => setZoom(1.0)} style={canvasToolBtn} title="Reset Zoom">
                <Maximize2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: "1px", height: "18px", backgroundColor: "#cbd5e1" }} />

            {/* Keep Size Badge */}
            <div style={{
              fontSize: "12px", color: "#475569",
              background: "#f8fafc", borderRadius: "4px",
              border: "1px solid #cbd5e1",
              padding: "4px 10px", fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}>
              Keep: {Math.round(cropW)}% × {Math.round(cropH)}%
            </div>

            {/* Vertical Divider */}
            <div style={{ width: "1px", height: "18px", backgroundColor: "#cbd5e1" }} />

            {/* Toggle Guides Button */}
            <button
              onClick={() => setShowGuides(g => !g)}
              style={{
                ...canvasToolBtn,
                color: showGuides ? "#2563eb" : "#475569",
                background: showGuides ? "#eff6ff" : "#ffffff",
                borderColor: showGuides ? "#2563eb" : "#cbd5e1",
              }}
              title="Toggle Guides"
            >
              <Layout size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* PDF Canvas Area */}
        <div style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "32px 24px",
        }}>
          {/* Canvas + Overlay wrapper */}
          <div
            ref={overlayRef}
            style={{
              position: "relative",
              boxShadow: "0 4px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
              borderRadius: "2px",
              flexShrink: 0,
              cursor: isDragging ? "grabbing" : "default",
              userSelect: "none",
            }}
          >
            {/* Page skeleton overlay while switching pages */}
            {(isLoading || renderingPage) && (
              <div
                className="skeleton-shimmer"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#e8e8e8",
                  borderRadius: "2px",
                  zIndex: 20,
                  minWidth: "200px",
                  minHeight: "280px",
                }}
              />
            )}

            {/* The PDF canvas */}
            <canvas ref={canvasRef} style={{ display: "block" }} />

            {/* ── CROP OVERLAY ─────────────────────────────────── */}
            {!isLoading && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: isDragging ? "none" : "auto" }}>
                {/* Dark masks */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${cropTop}%`, background: "rgba(10,18,36,0.52)", transition: isDragging ? "none" : "height 0.05s" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${cropBottom}%`, background: "rgba(10,18,36,0.52)", transition: isDragging ? "none" : "height 0.05s" }} />
                <div style={{ position: "absolute", top: `${cropTop}%`, bottom: `${cropBottom}%`, left: 0, width: `${cropLeft}%`, background: "rgba(10,18,36,0.52)", transition: isDragging ? "none" : "all 0.05s" }} />
                <div style={{ position: "absolute", top: `${cropTop}%`, bottom: `${cropBottom}%`, right: 0, width: `${cropRight}%`, background: "rgba(10,18,36,0.52)", transition: isDragging ? "none" : "all 0.05s" }} />

                {/* Crop Box */}
                <div
                  style={{
                    position: "absolute",
                    top: `${cropTop}%`, left: `${cropLeft}%`,
                    right: `${cropRight}%`, bottom: `${cropBottom}%`,
                    boxSizing: "border-box",
                    cursor: "move",
                    pointerEvents: "all",
                  }}
                  onMouseDown={e => handleMouseDown(e, "move")}
                >
                  <div style={{ position: "absolute", inset: 0, border: "2px dashed rgba(255,255,255,0.9)", boxSizing: "border-box", pointerEvents: "none", animation: "cropDash 16s linear infinite" }} />
                  <div style={{ position: "absolute", inset: "1px", border: "1px solid rgba(59,130,246,0.7)", boxSizing: "border-box", pointerEvents: "none" }} />

                  {showGuides && (
                    <>
                      <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />
                    </>
                  )}

                  <EdgeHandle pos="top"    onMouseDown={e => handleMouseDown(e, "top")} />
                  <EdgeHandle pos="bottom" onMouseDown={e => handleMouseDown(e, "bot")} />
                  <EdgeHandle pos="left"   onMouseDown={e => handleMouseDown(e, "lft")} />
                  <EdgeHandle pos="right"  onMouseDown={e => handleMouseDown(e, "rgt")} />

                  <CornerHandle pos="tl" cursor="nwse-resize" onMouseDown={e => handleMouseDown(e, "tl")} />
                  <CornerHandle pos="tr" cursor="nesw-resize" onMouseDown={e => handleMouseDown(e, "tr")} />
                  <CornerHandle pos="bl" cursor="nesw-resize" onMouseDown={e => handleMouseDown(e, "bl")} />
                  <CornerHandle pos="br" cursor="nwse-resize" onMouseDown={e => handleMouseDown(e, "br")} />

                  <div style={{
                    position: "absolute", bottom: "8px", left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.7)", color: "#ffffff",
                    fontSize: "10px", fontWeight: 700,
                    padding: "3px 8px", borderRadius: "4px",
                    pointerEvents: "none", letterSpacing: "0.04em", whiteSpace: "nowrap",
                  }}>
                    {Math.round(cropW)}% × {Math.round(cropH)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Crop Tools Panel ────────────────────────────────── */}
      <aside style={{
        width: "288px",
        flexShrink: 0,
        height: "100%",
        background: "#ffffff",
        borderLeft: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Panel Header */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ToolIcon
              toolNameOrId="Crop PDF"
              size={16}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(5,150,105,0.3)",
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>Crop Margins</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", fontWeight: 400 }}>Drag handles or use sliders</div>
            </div>
          </div>
        </div>

        {/* Underline Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0, background: "#ffffff" }}>
          {([
            { id: "preset",  label: "Presets",  Icon: FrameIcon  },
            { id: "manual",  label: "Manual",   Icon: Sliders    },
            { id: "layout",  label: "Layout",   Icon: LayoutGrid },
          ] as const).map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  border: "none",
                  borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                  background: "transparent",
                  color: active ? "#2563eb" : "#6b7280",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: active ? 600 : 500,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: "-1px",
                }}
              >
                <tab.Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* ── PRESETS Section ──────────────────────────────── */}
          {activeTab === "preset" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={sectionLabel}>Page Preset</span>
              <div className="uw-radio-card-group" style={{ marginTop: "6px" }}>
                {PRESETS.map(p => {
                  const active = preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      className={`uw-radio-card ${active ? "active" : ""}`}
                      style={{
                        width: "100%",
                        border: "none",
                        textAlign: "left",
                        padding: "10px 12px",
                      }}
                    >
                      <div className="uw-radio-circle" />
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "7px",
                        background: active ? `${p.color}20` : `${p.color}0c`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "background 0.12s",
                      }}>
                        <p.Icon size={14} color={p.color} />
                      </div>
                      <span className="uw-radio-card-title" style={{ flex: 1, marginBottom: 0 }}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MANUAL Section ───────────────────────────────── */}
          {activeTab === "manual" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={sectionLabel}>Margin Inset (%)</span>
                <MarginSlider label="Top"    value={cropTop}    onChange={v => { setPreset("custom"); setCropTop(v); }}    accent="#3b82f6" />
                <MarginSlider label="Bottom" value={cropBottom} onChange={v => { setPreset("custom"); setCropBottom(v); }} accent="#8b5cf6" />
                <MarginSlider label="Left"   value={cropLeft}   onChange={v => { setPreset("custom"); setCropLeft(v); }}   accent="#10b981" />
                <MarginSlider label="Right"  value={cropRight}  onChange={v => { setPreset("custom"); setCropRight(v); }}  accent="#f59e0b" />
              </div>

              <div>
                <span style={sectionLabel}>Precise Values (%)</span>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "8px", marginTop: "10px",
                  background: "#f4f4f4", borderRadius: "10px", padding: "12px",
                }}>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                      <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>TOP</span>
                      <NumberInput value={cropTop} onChange={v => { setPreset("custom"); setCropTop(v); }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                    <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>LEFT</span>
                    <NumberInput value={cropLeft} onChange={v => { setPreset("custom"); setCropLeft(v); }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                    <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>RIGHT</span>
                    <NumberInput value={cropRight} onChange={v => { setPreset("custom"); setCropRight(v); }} />
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                      <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>BOTTOM</span>
                      <NumberInput value={cropBottom} onChange={v => { setPreset("custom"); setCropBottom(v); }} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const avg = (cropTop + cropBottom + cropLeft + cropRight) / 4;
                  setPreset("custom");
                  setCropTop(avg); setCropBottom(avg); setCropLeft(avg); setCropRight(avg);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 12px", border: "none", borderRadius: "7px",
                  background: "#f4f4f4", color: "#374151", cursor: "pointer",
                  fontSize: "13px", fontWeight: 500, width: "100%",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f4f4f4")}
              >
                <AlignCenter size={13} color="#6b7280" />
                Make All Sides Equal
              </button>
            </>
          )}

          {/* ── LAYOUT Section ───────────────────────────────── */}
          {activeTab === "layout" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={sectionLabel}>Quick Crop Pattern</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginTop: "4px" }}>
                {LAYOUT_PATTERNS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setPreset("custom");
                      setCropTop(item.values[0]); setCropBottom(item.values[1]);
                      setCropLeft(item.values[2]); setCropRight(item.values[3]);
                    }}
                    style={{
                      padding: "10px 4px", border: "none", borderRadius: "8px",
                      background: "#f4f4f4", cursor: "pointer",
                      fontSize: "11px", fontWeight: 500, color: "#374151",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.color = "#1d4ed8";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#f4f4f4";
                      e.currentTarget.style.color = "#374151";
                    }}
                  >
                    <item.Icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Apply-to-all toggle (always visible) ─────────────── */}
          <div style={{ padding: "12px 14px", background: "#f4f4f4", borderRadius: "10px" }}>
            <div
              onClick={() => setApplyToAll(a => !a)}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            >
              <div style={{
                width: "36px", height: "20px", borderRadius: "10px",
                background: applyToAll ? "#2563eb" : "#d1d5db",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: "3px",
                  left: applyToAll ? "18px" : "3px",
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s",
                }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Apply to all pages</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                  {applyToAll ? "Same margins applied to every page" : "Only current page will be cropped"}
                </div>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div style={{
            padding: "10px 12px", background: "#f0f9ff", borderRadius: "8px",
            fontSize: "12px", color: "#0369a1", lineHeight: 1.55, fontWeight: 400,
            display: "flex", gap: "8px", alignItems: "flex-start",
          }}>
            <Layout size={14} color="#0ea5e9" style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>Drag handles on the canvas for pixel-perfect cropping. Use rule-of-thirds guides for balanced layouts.</span>
          </div>
        </div>

        {/* ── Bottom Action Buttons ─────────────────────────────────── */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid #f3f4f6", flexShrink: 0,
          display: "flex", flexDirection: "row", gap: "8px", background: "#ffffff",
        }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "11px 8px", border: "none", borderRadius: "8px",
              background: "#f4f4f4", color: "#374151", cursor: "pointer",
              fontSize: "13px", fontWeight: 500, transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f4f4f4")}
          >
            Reset
          </button>

          <button
            onClick={handleApply}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "11px 8px", border: "none", borderRadius: "8px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff", cursor: "pointer",
              fontSize: "13px", fontWeight: 700,
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              transition: "all 0.15s", letterSpacing: "0.01em",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1d4ed8, #1e40af)";
              e.currentTarget.style.boxShadow  = "0 6px 16px rgba(37,99,235,0.4)";
              e.currentTarget.style.transform  = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)";
              e.currentTarget.style.boxShadow  = "0 4px 12px rgba(37,99,235,0.3)";
              e.currentTarget.style.transform  = "translateY(0)";
            }}
          >
            Crop PDF
          </button>
        </div>
      </aside>

      {/* Animation for dashed crop border */}
      <style>{`
        @keyframes cropDash {
          0%   { border-dash-offset: 0; }
          100% { }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CornerHandle({
  pos, cursor, onMouseDown,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const SIZE = 10;
  const OFFSET = -(SIZE / 2 + 1);
  const style: React.CSSProperties = {
    position: "absolute", width: SIZE, height: SIZE, cursor, zIndex: 10, padding: 5, margin: -5,
  };
  if (pos === "tl") { style.top = OFFSET; style.left = OFFSET; }
  if (pos === "tr") { style.top = OFFSET; style.right = OFFSET; }
  if (pos === "bl") { style.bottom = OFFSET; style.left = OFFSET; }
  if (pos === "br") { style.bottom = OFFSET; style.right = OFFSET; }

  return (
    <div style={style} onMouseDown={e => { e.stopPropagation(); onMouseDown(e); }}>
      <div style={{
        width: SIZE, height: SIZE, borderRadius: "3px",
        background: "#2563eb", border: "2px solid #ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

function EdgeHandle({
  pos, onMouseDown,
}: {
  pos: "top" | "bottom" | "left" | "right";
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const isHoriz = pos === "top" || pos === "bottom";
  const bar: React.CSSProperties = {
    position: "absolute", background: "rgba(255,255,255,0.9)",
    borderRadius: "99px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", zIndex: 9,
  };
  if (isHoriz) {
    bar.width = "32px"; bar.height = "4px"; bar.left = "50%";
    bar.transform = "translateX(-50%)"; bar.cursor = "ns-resize";
    if (pos === "top")    bar.top    = "-2px";
    if (pos === "bottom") bar.bottom = "-2px";
  } else {
    bar.width = "4px"; bar.height = "32px"; bar.top = "50%";
    bar.transform = "translateY(-50%)"; bar.cursor = "ew-resize";
    if (pos === "left")  bar.left  = "-2px";
    if (pos === "right") bar.right = "-2px";
  }
  const hitZone: React.CSSProperties = {
    position: "absolute", zIndex: 9,
    cursor: isHoriz ? "ns-resize" : "ew-resize",
  };
  if (pos === "top")    { hitZone.top = "-6px";    hitZone.left = "10%"; hitZone.right = "10%"; hitZone.height = "12px"; }
  if (pos === "bottom") { hitZone.bottom = "-6px";  hitZone.left = "10%"; hitZone.right = "10%"; hitZone.height = "12px"; }
  if (pos === "left")   { hitZone.left = "-6px";    hitZone.top = "10%"; hitZone.bottom = "10%"; hitZone.width = "12px"; }
  if (pos === "right")  { hitZone.right = "-6px";   hitZone.top = "10%"; hitZone.bottom = "10%"; hitZone.width = "12px"; }

  return (
    <>
      <div style={bar} />
      <div style={hitZone} onMouseDown={e => { e.stopPropagation(); onMouseDown(e); }} />
    </>
  );
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const canvasToolBtn: React.CSSProperties = {
  width: "28px", height: "28px",
  border: "1px solid #cbd5e1", borderRadius: "4px",
  background: "#ffffff",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#1e293b", transition: "all 0.15s ease",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700,
  color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em",
};
