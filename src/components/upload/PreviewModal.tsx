import React, { useState, useEffect, useRef, useCallback } from "react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { formatBytes } from "./UploadHelpers";
import { renderSmileyIllustration } from "./FilePreviewCard";

/* ─── Image Full-Screen Viewer ─────────────────────────────────────────────── */
interface ImagePreviewViewerProps {
  file: File;
  onClose: () => void;
}

function ImageFullscreenViewer({ file, onClose }: ImagePreviewViewerProps) {
  const [url, setUrl] = useState<string>("");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale(s => Math.min(3, s + 0.2));
      if (e.key === "-") setScale(s => Math.max(0.3, s - 0.2));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!url) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, overflow: "auto", padding: "40px", backgroundColor: "rgba(0,0,0,0.0)" }}>
      <img
        src={url}
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          borderRadius: "4px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          transform: `scale(${scale})`,
          transition: "transform 0.2s ease",
          objectFit: "contain"
        }}
        alt={file.name}
      />
      {/* HUD */}
      <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "6px", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "6px 10px", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 10 }}>
        <HudButton onClick={() => setScale(s => Math.max(0.3, s - 0.2))} title="Zoom Out">−</HudButton>
        <button onClick={() => setScale(1)} style={hudTextStyle} title="Reset zoom">{Math.round(scale * 100)}%</button>
        <HudButton onClick={() => setScale(s => Math.min(3, s + 0.2))} title="Zoom In">+</HudButton>
      </div>
    </div>
  );
}

/* ─── Shared HUD button styles ─────────────────────────────────────────────── */
const hudTextStyle: React.CSSProperties = {
  background: "transparent", border: "none", color: "rgba(255,255,255,0.9)", fontSize: "12px",
  fontWeight: "600", minWidth: "44px", textAlign: "center", cursor: "pointer", padding: "2px 6px"
};

function HudButton({ onClick, title, children, disabled }: { onClick: () => void; title?: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: "28px", height: "28px", borderRadius: "50%", border: "none",
        background: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
        color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", fontWeight: "300", transition: "background 0.15s ease"
      }}
    >{children}</button>
  );
}

/* ─── PDF Single-Page Renderer ─────────────────────────────────────────────── */
interface PdfPageRendererProps {
  pdfDoc: any;
  pageNum: number;
  scale: number;
  rotation: number;
  onRendered?: () => void;
}

function PdfPageRenderer({ pdfDoc, pageNum, scale, rotation, onRendered }: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let active = true;
    async function renderPage() {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({
          scale,
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
        onRendered?.();
      } catch (e) {
        console.error("Error rendering page:", e);
        setRendering(false);
      }
    }
    renderPage();
    return () => { active = false; };
  }, [pdfDoc, pageNum, scale, rotation]);

  return (
    <div style={{
      position: "relative",
      backgroundColor: "#ffffff",
      borderRadius: "3px",
      boxShadow: "0 16px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)",
      overflow: "hidden",
      display: "inline-block",
      lineHeight: 0
    }}>
      {rendering && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.9)", zIndex: 5
        }}>
          <div className="processing-spinner" style={{ borderTopColor: "var(--c-accent)", width: "24px", height: "24px" }} />
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
    </div>
  );
}

/* ─── Full-Screen PDF Viewer ───────────────────────────────────────────────── */
interface PdfFullscreenViewerProps {
  file: File;
  onClose: () => void;
  initialPage?: number;
}

function PdfFullscreenViewer({ file, onClose, initialPage = 1 }: PdfFullscreenViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Touch pinch state
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1.2);

  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      try {
        const pdfjsLib = await getPdfjsLib();
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        setError("Failed to load PDF: " + err.message);
        setLoading(false);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1, "right");
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPage(currentPage - 1, "left");
      if (e.key === "+" || e.key === "=") setScale(s => Math.min(3, s + 0.2));
      if (e.key === "-") setScale(s => Math.max(0.4, s - 0.2));
      if (e.key === "r" || e.key === "R") setRotation(r => (r + 90) % 360);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, totalPages, onClose]);

  // Pinch-to-zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    function dist(t1: Touch, t2: Touch) {
      return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        touchStartDistRef.current = dist(e.touches[0], e.touches[1]);
        touchStartScaleRef.current = scale;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        const factor = d / touchStartDistRef.current;
        const newScale = Math.min(3, Math.max(0.4, touchStartScaleRef.current * factor));
        setScale(newScale);
      }
    }

    function onTouchEnd() {
      touchStartDistRef.current = null;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [scale]);

  const goToPage = useCallback((page: number, dir: "left" | "right") => {
    if (page < 1 || page > totalPages || transitioning) return;
    setAnimDir(dir);
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setAnimDir(null);
      setTransitioning(false);
    }, 180);
  }, [totalPages, transitioning]);

  // Swipe gesture
  const swipeStartX = useRef<number | null>(null);
  const onTouchStartSwipe = (e: React.TouchEvent) => {
    if (e.touches.length === 1) swipeStartX.current = e.touches[0].clientX;
  };
  const onTouchEndSwipe = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goToPage(currentPage + 1, "right");
      else goToPage(currentPage - 1, "left");
    }
  };

  const progress = totalPages > 0 ? ((currentPage - 1) / (totalPages - 1)) * 100 : 0;

  return (
    <div
      ref={viewportRef}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        backgroundColor: "#111827",
        display: "flex", flexDirection: "column",
        userSelect: "none"
      }}
      onTouchStart={onTouchStartSwipe}
      onTouchEnd={onTouchEndSwipe}
    >
      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, zIndex: 20
      }}>
        {/* File info */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: "calc(100% - 200px)" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {file.name}
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "1px" }}>
            {formatBytes(file.size)} · {totalPages} {totalPages === 1 ? "page" : "pages"}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Rotate */}
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            title="Rotate (R)"
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            Close
          </button>
        </div>
      </div>

      {/* ── Page Viewer Body ── */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 24px", position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", height: "100%", minHeight: "200px" }}>
            <div className="processing-spinner" style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "#3b82f6", width: "32px", height: "32px" } as React.CSSProperties} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Loading PDF…</span>
          </div>
        ) : error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "60px" }}>
            <div style={{ width: "100px", height: "130px" }}>
              {renderSmileyIllustration("ERROR", "#ef4444", "#fee2e2", { isCrying: true })}
            </div>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{error}</span>
          </div>
        ) : pdfDoc ? (
          <div style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning
              ? `translateX(${animDir === "right" ? "-30px" : "30px"})`
              : "translateX(0)",
            transition: "opacity 0.18s ease, transform 0.18s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0"
          }}>
            <PdfPageRenderer
              pdfDoc={pdfDoc}
              pageNum={currentPage}
              scale={scale}
              rotation={rotation}
            />
          </div>
        ) : null}

        {/* Left/Right click zones for desktop */}
        {!loading && !error && totalPages > 1 && (
          <>
            <button
              onClick={() => goToPage(currentPage - 1, "left")}
              disabled={currentPage <= 1}
              style={{
                position: "fixed", left: "16px", top: "50%", transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%", border: "none",
                background: currentPage <= 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)", color: "#fff", cursor: currentPage <= 1 ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentPage <= 1 ? 0.3 : 1, transition: "all 0.15s ease", zIndex: 20
              }}
              title="Previous page (←)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => goToPage(currentPage + 1, "right")}
              disabled={currentPage >= totalPages}
              style={{
                position: "fixed", right: "16px", top: "50%", transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%", border: "none",
                background: currentPage >= totalPages ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)", color: "#fff", cursor: currentPage >= totalPages ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentPage >= totalPages ? 0.3 : 1, transition: "all 0.15s ease", zIndex: 20
              }}
              title="Next page (→)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>

      {/* ── Bottom HUD ── */}
      {!loading && !error && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "8px", padding: "10px 16px 16px",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0
        }}>
          {/* Progress bar (only if multi-page) */}
          {totalPages > 1 && (
            <div style={{ width: "100%", maxWidth: "400px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#3b82f6", borderRadius: "4px", transition: "width 0.2s ease" }} />
            </div>
          )}

          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Page nav */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "4px 6px" }}>
                <HudButton onClick={() => goToPage(currentPage - 1, "left")} disabled={currentPage <= 1} title="Previous page">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
                </HudButton>
                <span style={{ ...hudTextStyle, fontSize: "12px", minWidth: "60px" }}>
                  {currentPage} / {totalPages}
                </span>
                <HudButton onClick={() => goToPage(currentPage + 1, "right")} disabled={currentPage >= totalPages} title="Next page">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                </HudButton>
              </div>
            )}

            {/* Zoom controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "4px 6px" }}>
              <HudButton onClick={() => setScale(s => Math.max(0.4, s - 0.2))} title="Zoom Out (-)">−</HudButton>
              <button onClick={() => setScale(1.2)} style={{ ...hudTextStyle, fontSize: "12px" }} title="Reset zoom">
                {Math.round(scale * 100)}%
              </button>
              <HudButton onClick={() => setScale(s => Math.min(3, s + 0.2))} title="Zoom In (+)">+</HudButton>
            </div>

            {/* Keyboard hint */}
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", display: "none" as const }}>
              ← → to navigate · Esc to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main PreviewModal (entry point) ─────────────────────────────────────── */
interface PreviewModalProps {
  previewFile: File | null;
  onClose: () => void;
  previewScale: number;
  setPreviewScale: React.Dispatch<React.SetStateAction<number>>;
  previewRotation: number;
  setPreviewRotation: React.Dispatch<React.SetStateAction<number>>;
}

export function PreviewModal({
  previewFile,
  onClose,
}: PreviewModalProps) {
  if (!previewFile) return null;

  const isPdf = previewFile.name.toLowerCase().endsWith(".pdf");
  const isImage = previewFile.type.startsWith("image/");

  if (isPdf) {
    return <PdfFullscreenViewer file={previewFile} onClose={onClose} />;
  }

  if (isImage) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          backgroundColor: "rgba(0,0,0,0.92)",
          display: "flex", flexDirection: "column"
        }}
        onClick={onClose}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
          >✕ Close</button>
        </div>
        <div onClick={e => e.stopPropagation()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageFullscreenViewer file={previewFile} onClose={onClose} />
        </div>
      </div>
    );
  }

  // Unsupported format
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--c-surface)", borderRadius: "12px", padding: "40px", maxWidth: "360px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
        onClick={e => e.stopPropagation()}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <h4 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 8px", color: "var(--c-text)" }}>Preview Not Available</h4>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px" }}>
          Previews are only available for PDF and image files.
        </p>
        <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "var(--c-accent)", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
          Close
        </button>
      </div>
    </div>
  );
}
