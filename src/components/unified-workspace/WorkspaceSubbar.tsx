import React from "react";
import { ArrowUpDown, List, LayoutGrid } from "lucide-react";

interface WorkspaceSubbarProps {
  isAllSelected: boolean;
  onSelectAllChange: (checked: boolean) => void;
  layoutMode: "grid" | "list";
  setLayoutMode: (mode: "grid" | "list") => void;
  stagedFilesCount: number;
  pdfPagesCount: number;
  viewMode: "Files" | "Pages";
}

export function WorkspaceSubbar({
  isAllSelected,
  onSelectAllChange,
  layoutMode,
  setLayoutMode,
  stagedFilesCount,
  pdfPagesCount,
  viewMode
}: WorkspaceSubbarProps) {
  const showCheckbox = viewMode === "Files" ? stagedFilesCount > 0 : pdfPagesCount > 0;

  return (
    <div className="uw-staged-subbar">
      <div className="uw-subbar-left">
        <input 
          type="checkbox" 
          id="select-all-staged"
          checked={isAllSelected && showCheckbox}
          onChange={(e) => onSelectAllChange(e.target.checked)}
        />
        <label htmlFor="select-all-staged" style={{ cursor: "pointer", userSelect: "none" }}>Select all</label>
      </div>

      <div className="uw-subbar-right">
        <button className="uw-sort-btn" title="Sort Staged Files">
          <ArrowUpDown size={12} />
          A-Z
        </button>
        <div className="uw-toolbar-divider" style={{ margin: "0 2px" }} />
        <div className="uw-view-switcher">
          <button 
            className={`uw-view-btn ${layoutMode === "list" ? "active" : ""}`}
            onClick={() => setLayoutMode("list")}
          >
            <List size={13} />
          </button>
          <button 
            className={`uw-view-btn ${layoutMode === "grid" ? "active" : ""}`}
            onClick={() => setLayoutMode("grid")}
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
