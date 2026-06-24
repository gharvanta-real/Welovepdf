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
              style={{ position: "relative" }}
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

        if (isExcluded) return null;

        return (
          <div 
            key={pageKey} 
            className={`canvas-file-card page-card ${isSelected ? "selected" : ""}`}
            onClick={() => handleToggleSelectPage(index)}
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
            </div>
            
            <div className="file-card-meta page-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>Page {page.pageNum}</span>
              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                <button 
                  className="uw-action-icon-btn" 
                  onClick={() => handleRotatePageSingle(pageKey, 90)}
                  style={{ width: "24px", height: "24px", padding: 0 }}
                  title="Rotate 90°"
                >
                  <RotateCw size={12} />
                </button>
                <button 
                  className="uw-action-icon-btn" 
                  onClick={() => handleDeleteSelected()}
                  style={{ width: "24px", height: "24px", padding: 0 }}
                  title="Delete Page"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
