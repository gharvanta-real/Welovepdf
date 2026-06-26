import React from "react";
import { ArrowUpDown } from "lucide-react";

interface WorkspaceSubbarProps {
  isAllSelected: boolean;
  onSelectAllChange: (checked: boolean) => void;
  stagedFilesCount: number;
  pdfPagesCount: number;
  viewMode: "Files" | "Pages";
}

export function WorkspaceSubbar({
  isAllSelected,
  onSelectAllChange,
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
        <label htmlFor="select-all-staged" style={{ cursor: "pointer", userSelect: "none", fontSize: "12px", fontWeight: 400, color: "#64748b" }}>Select all</label>
      </div>

      <div className="uw-subbar-right">
        <button className="uw-sort-btn" title="Sort Staged Files">
          <ArrowUpDown size={11} strokeWidth={1.5} />
          A-Z
        </button>
      </div>
    </div>
  );
}
