import React from "react";
import { 
  FileText, 
  LayoutGrid, 
  Plus, 
  ChevronDown, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  ArrowRight, 
  Crown 
} from "lucide-react";

interface WorkspaceToolbarProps {
  viewMode: "Files" | "Pages";
  setViewMode: (mode: "Files" | "Pages") => void;
  onAddClick: () => void;
  handleRotateLeft: () => void;
  handleRotateRight: () => void;
  handleDeleteSelected: () => void;
  isAnySelected: boolean;
  onExecute?: () => void;
}

export function WorkspaceToolbar({
  viewMode,
  setViewMode,
  onAddClick,
  handleRotateLeft,
  handleRotateRight,
  handleDeleteSelected,
  isAnySelected,
  onExecute
}: WorkspaceToolbarProps) {
  return (
    <div className="uw-staged-header-toolbar">
      <div className="uw-toolbar-left">
        {/* View Mode Toggle Group */}
        <div className="uw-toggle-group">
          <button 
            className={`uw-toggle-btn ${viewMode === "Files" ? "active" : ""}`}
            onClick={() => setViewMode("Files")}
          >
            <FileText size={14} />
            Files
          </button>
          <button 
            className={`uw-toggle-btn ${viewMode === "Pages" ? "active" : ""}`}
            onClick={() => setViewMode("Pages")}
          >
            <LayoutGrid size={14} />
            Pages
            <span className="uw-crown-badge" title="Premium Feature">
              <Crown size={10} fill="#f59e0b" style={{ marginLeft: 2 }} />
            </span>
          </button>
        </div>

        <div className="uw-toolbar-divider" />

        {/* Add Dropdown */}
        <button className="uw-add-dropdown" onClick={onAddClick}>
          <Plus size={14} />
          Add
          <ChevronDown size={12} style={{ marginLeft: 2 }} />
        </button>

        <div className="uw-toolbar-divider" />

        {/* Batch actions */}
        <button 
          className="uw-action-icon-btn" 
          onClick={handleRotateLeft} 
          disabled={!isAnySelected || viewMode === "Files"}
          title="Rotate Left"
        >
          <RotateCcw size={14} />
        </button>
        <button 
          className="uw-action-icon-btn" 
          onClick={handleRotateRight} 
          disabled={!isAnySelected || viewMode === "Files"}
          title="Rotate Right"
        >
          <RotateCw size={14} />
        </button>
        <button 
          className="uw-action-icon-btn" 
          onClick={handleDeleteSelected} 
          disabled={!isAnySelected}
          title="Delete Selected"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="uw-toolbar-right">
        <button className="uw-finish-btn" onClick={onExecute}>
          Finish
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
