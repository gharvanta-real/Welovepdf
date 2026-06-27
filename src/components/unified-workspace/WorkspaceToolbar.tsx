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
  disablePagesView?: boolean;
}

export function WorkspaceToolbar({
  viewMode,
  setViewMode,
  onAddClick,
  handleRotateLeft,
  handleRotateRight,
  handleDeleteSelected,
  isAnySelected,
  onExecute,
  disablePagesView = false
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
            <FileText size={13} strokeWidth={1.5} />
            Files
          </button>
          <button 
            className={`uw-toggle-btn ${viewMode === "Pages" ? "active" : ""}`}
            onClick={() => !disablePagesView && setViewMode("Pages")}
            disabled={disablePagesView}
            title={disablePagesView ? "Only PDF and image files support page-level view" : ""}
            style={{
              opacity: disablePagesView ? 0.5 : 1,
              cursor: disablePagesView ? "not-allowed" : "pointer"
            }}
          >
            <LayoutGrid size={13} strokeWidth={1.5} />
            Pages
            <span className="uw-crown-badge" title="Premium Feature">
              <Crown size={9} fill="#f59e0b" style={{ marginLeft: 2 }} />
            </span>
          </button>
        </div>

        <div className="uw-toolbar-divider" />

        {/* Add Dropdown */}
        <button className="uw-add-dropdown" onClick={onAddClick}>
          <Plus size={13} strokeWidth={1.5} />
          Add
          <ChevronDown size={11} strokeWidth={1.5} style={{ marginLeft: 1 }} />
        </button>

        <div className="uw-toolbar-divider" />

        {/* Batch actions */}
        <button 
          className="uw-action-icon-btn" 
          onClick={handleRotateLeft} 
          disabled={!isAnySelected || viewMode === "Files"}
          title="Rotate Left"
        >
          <RotateCcw size={13} strokeWidth={1.5} />
        </button>
        <button 
          className="uw-action-icon-btn" 
          onClick={handleRotateRight} 
          disabled={!isAnySelected || viewMode === "Files"}
          title="Rotate Right"
        >
          <RotateCw size={13} strokeWidth={1.5} />
        </button>
        <button 
          className="uw-action-icon-btn" 
          onClick={handleDeleteSelected} 
          disabled={!isAnySelected}
          title="Delete Selected"
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>

      <div className="uw-toolbar-right">
        <button className="uw-finish-btn" onClick={onExecute}>
          Finish
          <ArrowRight size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
