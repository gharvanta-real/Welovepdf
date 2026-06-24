import React from "react";
import { 
  Layers, 
  Scissors, 
  RotateCw, 
  Trash2, 
  FileDown, 
  FileText, 
  Type, 
  Crop, 
  Stamp, 
  Binary, 
  Sparkles, 
  MessageSquare, 
  FileSpreadsheet, 
  Play, 
  Languages, 
  Unlock, 
  Lock, 
  Wrench,
  Activity
} from "lucide-react";
import type { SidebarTab } from "./WorkspaceSidebar";

interface SubMenuTool {
  name: string;
  icon: React.ReactNode;
  isBeta?: boolean;
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
      case "Convert":
        return [
          { name: "Word to PDF", icon: <FileText size={16} /> },
          { name: "PDF to Word", icon: <FileText size={16} /> },
          { name: "JPG to PDF", icon: <Layers size={16} /> },
          { name: "PDF to JPG", icon: <Layers size={16} /> },
          { name: "Excel to PDF", icon: <FileSpreadsheet size={16} /> },
          { name: "PPT to PDF", icon: <Play size={16} /> }
        ];
      case "Organize":
        return [
          { name: "Merge PDF", icon: <Layers size={16} /> },
          { name: "Split PDF", icon: <Scissors size={16} /> },
          { name: "Rotate PDF", icon: <RotateCw size={16} /> },
          { name: "Remove Pages", icon: <Trash2 size={16} /> },
          { name: "Extract Pages", icon: <FileDown size={16} /> }
        ];
      case "Edit":
        return [
          { name: "PDF Annotator", icon: <Type size={16} /> },
          { name: "Document Editor", icon: <FileText size={16} /> },
          { name: "Crop PDF", icon: <Crop size={16} /> },
          { name: "Watermark PDF", icon: <Stamp size={16} /> },
          { name: "Page Numbers", icon: <Binary size={16} /> }
        ];
      case "AI PDF":
        return [
          { name: "PDF OCR", icon: <Sparkles size={16} /> },
          { name: "Chat with PDF", icon: <MessageSquare size={16} />, isBeta: true },
          { name: "Summarize PDF", icon: <FileText size={16} />, isBeta: true },
          { name: "Translate PDF", icon: <Languages size={16} />, isBeta: true }
        ];
      case "More":
        return [
          { name: "Unlock PDF", icon: <Unlock size={16} /> },
          { name: "Protect PDF", icon: <Lock size={16} /> },
          { name: "Bates Numbering", icon: <Binary size={16} /> },
          { name: "Edit PDF Metadata", icon: <FileText size={16} /> },
          { name: "Repair PDF", icon: <Wrench size={16} /> }
        ];
      default:
        return [];
    }
  };

  const submenuTools = getSubMenuTools(activeTab);

  if (submenuTools.length === 0) return null;

  // Position popover based on tab index
  const tabPositions: Record<string, number> = {
    "Convert": 96,
    "Organize": 176,
    "Edit": 256,
    "AI PDF": 416,
    "More": 496
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
          <span className="uw-submenu-btn-icon">{tool.icon}</span>
          <span className="uw-submenu-btn-text">{tool.name}</span>
          {tool.isBeta && <span className="uw-submenu-btn-badge">BETA</span>}
        </button>
      ))}
    </div>
  );
}
