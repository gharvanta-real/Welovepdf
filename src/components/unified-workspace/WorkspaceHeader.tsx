import React from "react";
import { ArrowLeft, Crown } from "lucide-react";

interface WorkspaceHeaderProps {
  activeTool: string;
  previewFile?: File | null;
  onBack: () => void;
  onLoginClick: () => void;
  onProClick: () => void;
}

export function WorkspaceHeader({
  activeTool,
  previewFile,
  onBack,
  onLoginClick,
  onProClick
}: WorkspaceHeaderProps) {
  return (
    <header className="uw-header">
      <div className="uw-header-left">
        <button 
          className="uw-back-btn" 
          onClick={onBack} 
          title={previewFile ? "Close preview" : "Back to home"}
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <div className="uw-header-divider"></div>
        <span className="uw-header-title" style={{ display: "flex", alignItems: "center" }}>
          {activeTool}
          {previewFile && (
            <>
              <span style={{ margin: "0 8px", color: "var(--text-muted)", fontWeight: 400 }}>/</span>
              <span className="uw-header-subtitle" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>
                {previewFile.name}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="uw-header-right">
        <button className="uw-login-btn" onClick={onLoginClick}>
          Log In
        </button>
      </div>
    </header>
  );
}

