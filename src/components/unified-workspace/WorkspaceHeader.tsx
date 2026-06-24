import React from "react";
import { ArrowLeft, Crown } from "lucide-react";

interface WorkspaceHeaderProps {
  activeTool: string;
  onBack: () => void;
  onLoginClick: () => void;
  onProClick: () => void;
}

export function WorkspaceHeader({
  activeTool,
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
          title="Back to home"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <span className="uw-header-title">{activeTool}</span>
      </div>

      <div className="uw-header-right">
        <button className="uw-pro-badge" onClick={onProClick}>
          <Crown size={16} fill="currentColor" />
          <span>Get Pro</span>
        </button>
        <button className="uw-login-btn" onClick={onLoginClick}>
          Log In
        </button>
      </div>
    </header>
  );
}
