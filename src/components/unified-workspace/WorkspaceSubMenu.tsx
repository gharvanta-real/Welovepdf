import React from "react";
import type { SidebarTab } from "./WorkspaceSidebar";
import { ToolIcon } from "../ToolIcon";

interface SubMenuTool {
  name: string;
}

interface WorkspaceSubMenuProps {
  activeTab: SidebarTab;
  onToolSelect: (toolName: string) => void;
  activeTool: string;
}

export function WorkspaceSubMenu({ 
  activeTab, 
  onToolSelect,
  activeTool
}: WorkspaceSubMenuProps) {
  
  const getSubMenuTools = (tab: SidebarTab): SubMenuTool[] => {
    switch (tab) {
      case "Compress":
        return [
          { name: "Compress PDF" },
          { name: "Optimize PDF" },
          { name: "Edit PDF" },
          { name: "PDF Annotator" },
          { name: "Grayscale PDF" },
          { name: "Flatten PDF" }
        ];
      case "Convert":
        return [
          { name: "Word to PDF" },
          { name: "PDF to Word" },
          { name: "JPG to PDF" },
          { name: "PDF to JPG" },
          { name: "Excel to PDF" },
          { name: "PPT to PDF" }
        ];
      case "Organize":
        return [
          { name: "Merge PDF" },
          { name: "Split PDF" },
          { name: "Crop PDF" },
          { name: "Repair PDF" }
        ];
      case "Security":
        return [
          { name: "Protect PDF" },
          { name: "Unlock PDF" },
          { name: "Sign PDF" },
          { name: "Watermark PDF" },
          { name: "Edit PDF Metadata" }
        ];
      case "AI Tools":
        return [
          { name: "PDF OCR" },
          { name: "Summarize PDF" },
          { name: "Translate PDF" }
        ];
      default:
        return [];
    }
  };

  const submenuTools = getSubMenuTools(activeTab);

  if (submenuTools.length === 0) return null;

  // Position popover based on tab index
  const tabPositions: Record<string, number> = {
    "Compress": 96,
    "Convert": 158,
    "Organize": 220,
    "Security": 282,
    "AI Tools": 344
  };

  const topOffset = tabPositions[activeTab] || 96;

  return (
    <div 
      className="uw-submenu-popover"
      style={{ top: `${topOffset}px` }}
    >
      <div className="uw-submenu-header">{activeTab} Tools</div>
      {submenuTools.map((tool) => (
        <button
          key={tool.name}
          className={`uw-submenu-btn ${activeTool === tool.name ? "active" : ""}`}
          onClick={() => onToolSelect(tool.name)}
        >
          <ToolIcon toolNameOrId={tool.name} size={13} style={{ borderRadius: "6px" }} />
          <span className="uw-submenu-btn-text">{tool.name}</span>
        </button>
      ))}
    </div>
  );
}

