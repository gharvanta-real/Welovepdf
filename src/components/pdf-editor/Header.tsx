import React, { useState } from "react";
import { 
  Undo2, Redo2, Sparkles, SlidersHorizontal, Download, ChevronDown, Edit2, Check
} from "lucide-react";

interface HeaderProps {
  fileName: string;
  lastSavedText?: string;
  onClose: () => void;
  onDownload: () => void;
  onToggleProperties: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onRenameFile?: (newName: string) => void;
  showRightPanel: boolean;
}

export function Header({
  fileName,
  lastSavedText = "Last saved 2m ago",
  onClose,
  onDownload,
  onToggleProperties,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRenameFile,
  showRightPanel
}: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(fileName);

  const handleSaveName = () => {
    setIsEditingName(false);
    if (onRenameFile && tempName.trim()) {
      onRenameFile(tempName.trim());
    }
  };

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      height: "56px",
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      zIndex: 30,
      flexShrink: 0,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left: Brand Logo & File Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div 
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          {/* Logo P Box */}
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "0.95rem"
          }}>
            P
          </div>
          <span style={{ 
            color: "#1e293b", 
            fontWeight: "700", 
            fontSize: "0.95rem", 
            letterSpacing: "-0.3px" 
          }}>
            PDF Editor
          </span>
        </div>

        {/* Separator */}
        <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0" }} />

        {/* Editable File Title */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {isEditingName ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
                  autoFocus
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    outline: "none",
                    height: "20px"
                  }}
                />
                <button 
                  onClick={handleSaveName}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    padding: "2px"
                  }}
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <>
                <span style={{ 
                  color: "#1e293b", 
                  fontWeight: "600", 
                  fontSize: "0.82rem", 
                  maxWidth: "240px", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {fileName}
                </span>
                <button 
                  onClick={() => setIsEditingName(true)}
                  style={{ 
                    border: "none", 
                    background: "none", 
                    color: "#94a3b8", 
                    cursor: "pointer", 
                    padding: "2px",
                    display: "flex",
                    alignItems: "center"
                  }}
                  title="Rename Document"
                >
                  <Edit2 size={11} />
                </button>
              </>
            )}
          </div>
          <span style={{ color: "#64748b", fontSize: "0.65rem", marginTop: "1px" }}>
            {lastSavedText}
          </span>
        </div>
      </div>

      {/* Center: Undo/Redo capsule */}
      <div style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: "9999px",
        padding: "4px 8px",
        gap: "4px"
      }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: canUndo ? "#475569" : "#cbd5e1",
            cursor: canUndo ? "pointer" : "not-allowed",
            transition: "background 0.15s"
          }}
          onMouseEnter={(e) => { if (canUndo) e.currentTarget.style.backgroundColor = "#e2e8f0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: canRedo ? "#475569" : "#cbd5e1",
            cursor: canRedo ? "pointer" : "not-allowed",
            transition: "background 0.15s"
          }}
          onMouseEnter={(e) => { if (canRedo) e.currentTarget.style.backgroundColor = "#e2e8f0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={13} />
        </button>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* AI Assistant */}
        <button
          onClick={() => alert("AI Assistant is indexing your document...")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#334155",
            cursor: "pointer",
            fontSize: "0.76rem",
            fontWeight: "500",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          <Sparkles size={13} style={{ color: "#3b82f6" }} />
          AI Assistant
        </button>

        {/* Toggle Properties */}
        <button
          onClick={onToggleProperties}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: showRightPanel ? "#f8fafc" : "#ffffff",
            color: "#334155",
            cursor: "pointer",
            fontSize: "0.76rem",
            fontWeight: "500",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            if (!showRightPanel) {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.backgroundColor = "#ffffff";
            }
          }}
        >
          <SlidersHorizontal size={13} style={{ color: "#475569" }} />
          Toggle Properties
        </button>

        {/* Finish & Download */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={onDownload}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: "600",
              boxShadow: "0 1px 2px rgba(37,99,235,0.1)",
              transition: "background 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; }}
          >
            <Download size={13} />
            Finish & Download
          </button>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#3b82f6" }} />
          <button
            onClick={onDownload}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "7px 10px",
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              transition: "background 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; }}
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
