import React, { useState, useEffect, useRef, useCallback } from "react";
import { getPdfjsLib } from "../../utils/pdfjs";

interface PageEntry {
  key: string;
  fileIndex: number;
  pageNum: number;
  fileLabel: string;
  thumbUrl: string;
}

const THUMB_SCALE = 0.18;
const MAIN_SCALE  = 2.0;

export interface PdfPreviewPanelProps {
  files: File[];
  initialActivePageKey?: string | null;
  onClose: () => void;
}

export function PdfPreviewPanel({ files, initialActivePageKey, onClose }: PdfPreviewPanelProps) {
  const [pages,      setPages]      = useState<PageEntry[]>([]);
  const [rendered,   setRendered]   = useState<Record<string, string>>({});
  const [loading,    setLoading]    = useState(true);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());

  const railScrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs     = useRef<Record<string, HTMLDivElement | null>>({});

  const initialScrollDone = useRef(false);

  useEffect(() => {
    if (loading) {
      initialScrollDone.current = false;
    } else if (activePage && !initialScrollDone.current) {
      initialScrollDone.current = true;
      const t = setTimeout(() => {
        thumbRefs.current[activePage]?.scrollIntoView({ behavior: "auto", block: "nearest" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [loading, activePage]);

  useEffect(() => {
    if (!files || files.length === 0) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const allPages: PageEntry[] = [];
      const allRendered: Record<string, string> = {};

      for (let fi = 0; fi < files.length; fi++) {
        const file  = files[fi];
        const ext   = file.name.split(".").pop()?.toLowerCase() ?? "";
        const label = file.name.length > 16 ? file.name.slice(0, 14) + "..." : file.name;

        if (ext === "pdf") {
          try {
            const buf      = await file.arrayBuffer();
            const pdfjsLib = await getPdfjsLib();
            const pdf      = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;

            for (let pn = 1; pn <= pdf.numPages; pn++) {
              if (cancelled) return;
              const key  = `${fi}-${pn}`;
              const page = await pdf.getPage(pn);

              const tvp  = page.getViewport({ scale: THUMB_SCALE });
              const tc   = document.createElement("canvas");
              tc.width   = tvp.width; tc.height = tvp.height;
              const tctx = tc.getContext("2d");
              if (tctx) await page.render({ canvasContext: tctx, viewport: tvp }).promise;

              const mvp  = page.getViewport({ scale: MAIN_SCALE });
              const mc   = document.createElement("canvas");
              mc.width   = mvp.width; mc.height = mvp.height;
              const mctx = mc.getContext("2d");
              if (mctx) await page.render({ canvasContext: mctx, viewport: mvp }).promise;

              allPages.push({ key, fileIndex: fi, pageNum: pn, fileLabel: label, thumbUrl: tc.toDataURL() });
              allRendered[key] = mc.toDataURL();
            }
          } catch (e) { console.error("PdfPreviewPanel:", fi, e); }
        } else if (file.type.startsWith("image/")) {
          if (cancelled) return;
          const url = URL.createObjectURL(file);
          const key = `${fi}-1`;
          allPages.push({ key, fileIndex: fi, pageNum: 1, fileLabel: label, thumbUrl: url });
          allRendered[key] = url;
        }
      }

      if (!cancelled) {
        setPages(allPages);
        setRendered(allRendered);
        const startKey = initialActivePageKey && allPages.some(p => p.key === initialActivePageKey)
          ? initialActivePageKey
          : (allPages[0]?.key ?? null);
        setActivePage(startKey);
        setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [files, initialActivePageKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (!activePage || pages.length === 0) return;
      const idx = pages.findIndex(p => p.key === activePage);
      if ((e.key === "ArrowDown" || e.key === "ArrowRight") && idx < pages.length - 1) goToPage(pages[idx + 1].key);
      if ((e.key === "ArrowUp"   || e.key === "ArrowLeft" ) && idx > 0) goToPage(pages[idx - 1].key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePage, pages, onClose]);

  const goToPage = useCallback((key: string) => {
    setActivePage(key);
    thumbRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const toggleSelected = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };

  const deleteSelected = () => {
    const remaining = pages.filter(p => !selected.has(p.key));
    setPages(remaining);
    setRendered(prev => { const copy = { ...prev }; selected.forEach(k => delete copy[k]); return copy; });
    setSelected(new Set());
    if (activePage && selected.has(activePage)) {
      setActivePage(remaining[0]?.key ?? null);
    }
  };

  const activeIdx  = pages.findIndex(p => p.key === activePage);
  const totalPages = pages.length;
  const navPrev    = () => { if (activeIdx > 0) goToPage(pages[activeIdx - 1].key); };
  const navNext    = () => { if (activeIdx < totalPages - 1) goToPage(pages[activeIdx + 1].key); };

  const separatorAt = new Set<number>();
  let lastFi = -1;
  pages.forEach((p, i) => { if (p.fileIndex !== lastFi) { separatorAt.add(i); lastFi = p.fileIndex; } });

  if (loading) {
    return (
      <div className="uw-preview-panel">
        <div className="uw-preview-loading">
          <div className="uw-processing-spinner" />
          <span>Loading pages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="uw-preview-panel">

      {/* Left thumbnail rail — only shown for multi-page PDFs */}
      {totalPages > 1 && (
      <aside className="uw-preview-rail">
        <div className="uw-preview-rail-scroll" ref={railScrollRef}>
          {pages.map((page, i) => {
            const isActive   = page.key === activePage;
            const isSelected = selected.has(page.key);
            return (
              <React.Fragment key={page.key}>
                {separatorAt.has(i) && files.length > 1 && (
                  <>
                    <div className="uw-preview-file-label" title={files[page.fileIndex]?.name}>{page.fileLabel}</div>
                    <div className="uw-preview-file-divider" />
                  </>
                )}
                <div
                  ref={(el) => { thumbRefs.current[page.key] = el; }}
                  className={`uw-preview-thumb-wrapper${isActive ? " is-active" : ""}`}
                  onClick={() => goToPage(page.key)}
                >
                  <div className={["uw-preview-thumb", isActive ? "is-active" : "", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}>
                    <img src={page.thumbUrl} alt={`Page ${page.pageNum}`} />
                    <button
                      className="uw-preview-thumb-check"
                      title={isSelected ? "Deselect" : "Select"}
                      onClick={e => toggleSelected(page.key, e)}
                      style={{ opacity: isSelected ? 1 : undefined }}
                    >
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        {isSelected && <polyline points="2,6 5,9 10,3" />}
                      </svg>
                    </button>
                  </div>
                  <span className="uw-preview-thumb-label">
                    {files.length > 1 ? `${page.fileIndex + 1}.${page.pageNum}` : String(page.pageNum)}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </aside>
      )}

      <main className={`uw-preview-main${totalPages <= 1 ? " uw-preview-main--full" : ""}`}>
        <div className="uw-preview-main-scroll">
          {pages.map(page => {
            if (page.key !== activePage) return null;
            const isSelected = selected.has(page.key);
            const imgUrl     = rendered[page.key];
            return (
              <div
                key={page.key}
                className={["uw-preview-page-card", "is-active", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
              >
                {imgUrl
                  ? <img src={imgUrl} alt={`Page ${page.pageNum}`} className="uw-preview-page-canvas" />
                  : <div className="uw-preview-page-loading"><div className="uw-processing-spinner" /></div>
                }
                <span className="uw-preview-page-badge">
                  {files.length > 1 ? `File ${page.fileIndex + 1} - Pg ${page.pageNum}` : `Page ${page.pageNum}`}
                </span>
                <button
                  className="uw-preview-thumb-check"
                  title={isSelected ? "Deselect" : "Select"}
                  onClick={e => toggleSelected(page.key, e)}
                  style={{ top: 8, left: 8, width: 20, height: 20, opacity: isSelected ? 1 : undefined }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    {isSelected && <polyline points="2,6 5,9 10,3" />}
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {selected.size > 0 && (
          <div className="uw-preview-selectbar">
            <span className="uw-preview-selectbar-label">{selected.size} page{selected.size !== 1 ? "s" : ""} selected</span>
            <button className="uw-preview-selectbar-delete" onClick={deleteSelected}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Delete
            </button>
            <button className="uw-preview-selectbar-clear" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        <div className="uw-preview-floatbar">
          <button className="uw-preview-back-btn" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          {totalPages > 1 && (
            <>
              <div className="uw-preview-bar-divider" />
              <div className="uw-preview-nav-group">
                <button className="uw-preview-nav-btn" onClick={navPrev} disabled={activeIdx <= 0} title="Previous">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="uw-preview-nav-counter">{activeIdx + 1} / {totalPages}</span>
                <button className="uw-preview-nav-btn" onClick={navNext} disabled={activeIdx >= totalPages - 1} title="Next">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
