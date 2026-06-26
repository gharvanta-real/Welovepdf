import React from "react";
import { Trash2, RotateCw } from "lucide-react";
import { FilePreviewCard } from "../upload/FilePreviewCard";

interface WorkspaceStagedGridProps {
  viewMode: "Files" | "Pages";
  layoutMode: "grid" | "list";
  stagedFiles: File[];
  pdfPages: { pageNum: number; url: string; fileIndex: number }[];
  selectedFiles: Set<number>;
  selectedPages: Set<number>;
  pageRotations: Record<string, number>;
  localRemovedPages: Set<string>;
  handleToggleSelectFile: (idx: number) => void;
  handleToggleSelectPage: (idx: number) => void;
  handleRotatePageSingle: (key: string, deg: number) => void;
  handleDeleteSelected: () => void;
  onRemoveFile: (index: number) => void;
  onPreviewFile?: (pageKey?: string) => void;
  simpleMode?: boolean;
}

export function WorkspaceStagedGrid({
  viewMode,
  layoutMode,
  stagedFiles,
  pdfPages,
  selectedFiles,
  selectedPages,
  pageRotations,
  localRemovedPages,
  handleToggleSelectFile,
  handleToggleSelectPage,
  handleRotatePageSingle,
  handleDeleteSelected,
  onRemoveFile,
  onPreviewFile,
  simpleMode = false
}: WorkspaceStagedGridProps) {
  
  if (simpleMode) {
    return (
      <div className="uw-staged-centered">
        {stagedFiles.map((file, idx) => (
          <div key={`${file.name}-${idx}`} className="canvas-file-card-wrapper simple-mode">
            <FilePreviewCard
              file={file}
              idx={idx}
              toolColor="#2563eb"
              onRemove={onRemoveFile}
              readOnly={true}
            />
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === "Files") {
    return (
      <div className={`uw-staged-grid ${layoutMode === "list" ? "list-view" : ""}`}>
        {stagedFiles.map((file, idx) => {
          const isSelected = selectedFiles.has(idx);
          return (
            <div 
              key={`${file.name}-${idx}`} 
              className={`canvas-file-card-wrapper ${isSelected ? "selected" : ""}`}
              onClick={() => handleToggleSelectFile(idx)}
              onDoubleClick={() => onPreviewFile?.(`${idx}-1`)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <div 
                style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10 }}
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => handleToggleSelectFile(idx)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>
              {/* Eye preview button on hover */}
              {onPreviewFile && (
                <div
                  className="uw-preview-btn"
                  onClick={(e) => { e.stopPropagation(); onPreviewFile(`${idx}-1`); }}
                  title="Preview PDF (or double-click)"
                  style={{
                    position: "absolute", bottom: "48px", right: "8px",
                    zIndex: 15, opacity: 0, transition: "opacity 0.15s ease",
                    background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)",
                    border: "none", borderRadius: "6px", color: "#fff",
                    padding: "4px 9px", fontSize: "11px", fontWeight: 400,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview
                </div>
              )}
              <FilePreviewCard
                file={file}
                idx={idx}
                toolColor="#2563eb"
                onRemove={onRemoveFile}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`uw-staged-grid ${layoutMode === "list" ? "list-view" : ""}`}>
      {pdfPages.map((page, index) => {
        const pageKey = `${page.fileIndex}-${page.pageNum}`;
        const isExcluded = localRemovedPages.has(pageKey);
        const isSelected = selectedPages.has(index);
        const rotation = pageRotations[pageKey] || 0;
        const parentFile = stagedFiles[page.fileIndex];

        if (isExcluded) return null;

        return (
          <div 
            key={pageKey} 
            className={`canvas-file-card page-card ${isSelected ? "selected" : ""}`}
            onClick={() => onPreviewFile?.(pageKey)}
            onDoubleClick={() => onPreviewFile?.(pageKey)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div 
              className="page-card-checkbox-wrapper"
              onClick={(e) => e.stopPropagation()}
              style={{ position: "absolute", top: "8px", left: "8px", zIndex: 10 }}
            >
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => handleToggleSelectPage(index)} 
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
            </div>
            
            <div className="file-card-preview-box page-preview-box" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "140px", position: "relative" }}>
              <img 
                src={page.url} 
                alt={`Page ${page.pageNum}`}
                style={{ 
                  transform: `rotate(${rotation}deg)`, 
                  transition: "transform 0.2s ease-in-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
              />
              {/* Double-click hint on hover */}
              {onPreviewFile && (
                <div
                  className="uw-preview-btn"
                  onClick={(e) => { e.stopPropagation(); onPreviewFile(pageKey); }}
                  title="Preview file"
                  style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0)", transition: "background 0.15s ease",
                    zIndex: 5, cursor: "pointer"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.35)";
                    const btn = e.currentTarget.querySelector(".uw-eye-hint") as HTMLElement | null;
                    if (btn) btn.style.opacity = "1";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(0,0,0,0)";
                    const btn = e.currentTarget.querySelector(".uw-eye-hint") as HTMLElement | null;
                    if (btn) btn.style.opacity = "0";
                  }}
                >
                  <span className="uw-eye-hint" style={{ opacity: 0, transition: "opacity 0.15s", background: "rgba(15,23,42,0.75)", color: "#fff", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 400, display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Open
                  </span>
                </div>
              )}
            </div>
            
            <div className="file-card-meta page-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 400, color: "#64748b" }}>Page {page.pageNum}</span>
              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                <button 
                  className="uw-action-icon-btn" 
                  onClick={() => handleRotatePageSingle(pageKey, 90)}
                  style={{ width: "22px", height: "22px", padding: 0 }}
                  title="Rotate 90°"
                >
                  <RotateCw size={11} strokeWidth={1.5} />
                </button>
                <button 
                  className="uw-action-icon-btn" 
                  onClick={() => handleDeleteSelected()}
                  style={{ width: "22px", height: "22px", padding: 0 }}
                  title="Delete Page"
                >
                  <Trash2 size={11} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
