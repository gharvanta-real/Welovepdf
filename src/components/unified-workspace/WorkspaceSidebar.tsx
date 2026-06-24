import React from "react";
import { 
  Archive, 
  RefreshCw, 
  FolderKanban, 
  PenTool, 
  FileText, 
  Sparkles, 
  Wrench,
  User,
  Settings
} from "lucide-react";

export type SidebarTab = 
  | "Compress" 
  | "Convert" 
  | "Organize" 
  | "Edit" 
  | "Sign" 
  | "AI PDF" 
  | "More" 
  | "Documents";

interface WorkspaceSidebarProps {
  activeTab: SidebarTab | null;
  onTabClick: (tab: SidebarTab) => void;
  onLogoClick: () => void;
  onSettingsClick: () => void;
}

export function WorkspaceSidebar({ 
  activeTab, 
  onTabClick, 
  onLogoClick,
  onSettingsClick
}: WorkspaceSidebarProps) {
  
  const sidebarItems: { tab: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { 
      tab: "Compress", 
      icon: <Archive size={20} strokeWidth={1.6} />, 
      label: "Compress" 
    },
    { 
      tab: "Convert", 
      icon: <RefreshCw size={20} strokeWidth={1.6} />, 
      label: "Convert" 
    },
    { 
      tab: "Organize", 
      icon: <FolderKanban size={20} strokeWidth={1.6} />, 
      label: "Organize" 
    },
    { 
      tab: "Edit", 
      icon: <PenTool size={20} strokeWidth={1.6} />, 
      label: "Edit" 
    },
    { 
      tab: "Sign", 
      icon: <FileText size={20} strokeWidth={1.6} />, 
      label: "Sign" 
    },
    { 
      tab: "AI PDF", 
      icon: <Sparkles size={20} strokeWidth={1.6} />, 
      label: "AI PDF" 
    },
    { 
      tab: "More", 
      icon: <Wrench size={20} strokeWidth={1.6} />, 
      label: "More" 
    },
    { 
      tab: "Documents", 
      icon: <FileText size={20} strokeWidth={1.6} />, 
      label: "Docs" 
    }
  ];

  return (
    <aside className="uw-sidebar">
      {/* Brand Logo Icon */}
      <div className="uw-logo-btn" onClick={onLogoClick} title="PDFMount Home">
        P
      </div>

      {/* Navigation Tabs */}
      <div className="uw-sidebar-items">
        {sidebarItems.map(({ tab, icon, label }) => (
          <button
            key={tab}
            className={`uw-sidebar-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => onTabClick(tab)}
            title={tab}
          >
            <span className="uw-sidebar-icon">{icon}</span>
            <span className="uw-sidebar-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Profile/Settings */}
      <div className="uw-sidebar-bottom">
        <button 
          className="uw-sidebar-item" 
          onClick={onSettingsClick} 
          title="Account Settings"
        >
          <Settings size={20} strokeWidth={1.6} />
          <span className="uw-sidebar-label">Settings</span>
        </button>
        <button 
          className="uw-sidebar-item" 
          title="Account profile"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderRadius: 0, height: "56px" }}
        >
          <User size={20} strokeWidth={1.6} />
        </button>
      </div>
    </aside>
  );
}
