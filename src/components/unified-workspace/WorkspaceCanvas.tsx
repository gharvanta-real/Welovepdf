import React from "react";
import { Trash2, RotateCw, Plus } from "lucide-react";
import { WorkspaceUploadZone } from "./WorkspaceUploadZone";
import { FilePreviewCard } from "../upload/FilePreviewCard";
import { PdfPageCard } from "../upload/PdfPageCard";
import { formatBytes } from "../upload/UploadHelpers";

interface WorkspaceCanvasProps {
  activeTool: string;
  stagedFiles: File[] | null;
  onFilesSelected: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  onAddMoreClick: () => void;
  // Page organization states
  pageOrder: number[];
  rotationMap: Record<number, number>;
  removedPages: Set<number>;
  selectedPages: Set<number>;
  onRotateAll?: () => void;
  onReverseOrder?: () => void;
  pdfPageUrls?: string[];
  pdfDoc?: any;
}

export function WorkspaceCanvas({
  activeTool,
  stagedFiles,
  onFilesSelected,
  onRemoveFile,
  onAddMoreClick,
  pageOrder,
  rotationMap,
  removedPages,
  selectedPages,
  onRotateAll,
  onReverseOrder,
  pdfPageUrls,
  pdfDoc
}: WorkspaceCanvasProps) {
  
  if (!stagedFiles || stagedFiles.length === 0) {
    return (
      <div className="uw-canvas-container">
        <WorkspaceUploadZone 
          activeTool={activeTool} 
          onFilesSelected={onFilesSelected} 
        />
      </div>
    );
  }

  // If we have staged files, determine how to show them
  // For multi-page visual tools (like Split, Rotate, Organize, Remove Pages),
  // we show the page cards grid if we have page thumbnails loaded.
  const isVisualOrganizer = [
    "Rotate PDF", 
    "Remove Pages", 
    "Organize PDF", 
    "Extract Pages", 
    "Split PDF"
  ].includes(activeTool);

  const showPageGrid = isVisualOrganizer && pdfPageUrls && pdfPageUrls.length > 0;

  return (
    <div className="uw-canvas-container" style={{ justifyContent: "flex-start", padding: "24px" }}>
      <div className="uw-staged-canvas">
        <div className="uw-staged-header">
          <div className="uw-staged-title">
            <span>Staged Files ({stagedFiles.length})</span>
          </div>
          <div className="uw-staged-actions">
            {isVisualOrganizer && onRotateAll && (
              <button className="uw-action-pill" onClick={onRotateAll}>
                <RotateCw size={14} />
                Rotate All
              </button>
            )}
            <button className="uw-action-pill" onClick={onAddMoreClick}>
              <Plus size={14} />
              Add Files
            </button>
          </div>
        </div>

        {showPageGrid ? (
          <div className="uw-staged-grid">
            {pageOrder.map((pageNum, index) => {
              const isExcluded = removedPages.has(pageNum);
              const isSelected = selectedPages.has(pageNum);
              const rotation = rotationMap[pageNum] || 0;
              const pageUrl = pdfPageUrls[pageNum - 1];

              return (
                <PdfPageCard
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNum={pageNum}
                  rotation={rotation}
                  isRemoved={isExcluded}
                  isSelected={isSelected}
                  onRotate={() => {}}
                  onRemove={() => {}}
                  onToggleSelect={() => {}}
                  toolColor="#3b82f6"
                  selectedTool={activeTool}
                  indexInGrid={index}
                  totalGridItems={pageOrder.length}
                  onMoveLeft={() => {}}
                  onMoveRight={() => {}}
                />
              );
            })}
          </div>
        ) : (
          <div className="uw-staged-grid">
            {stagedFiles.map((file, idx) => (
              <FilePreviewCard
                key={`${file.name}-${idx}`}
                file={file}
                idx={idx}
                toolColor="#3b82f6"
                onRemove={() => onRemoveFile(idx)}
                onPreviewClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
