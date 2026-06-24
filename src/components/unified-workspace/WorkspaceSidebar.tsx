import React from "react";
import { 
  Minimize2, 
  RefreshCw, 
  FolderKanban, 
  Shield, 
  Sparkles, 
  FileText, 
  Settings,
  User
} from "lucide-react";

export type SidebarTab = 
  | "Compress" 
  | "Convert" 
  | "Organize" 
  | "Security" 
  | "AI Tools" 
  | "Documents";

interface WorkspaceSidebarProps {
  activeTab: SidebarTab | null;
  openDropdownTab: SidebarTab | null;
  onTabClick: (tab: SidebarTab) => void;
  onLogoClick: () => void;
  onSettingsClick: () => void;
}

export function WorkspaceSidebar({ 
  activeTab, 
  openDropdownTab,
  onTabClick, 
  onLogoClick,
  onSettingsClick
}: WorkspaceSidebarProps) {
  
  const sidebarItems: { tab: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { 
      tab: "Compress", 
      icon: <Minimize2 size={19} strokeWidth={1.4} />, 
      label: "Compress" 
    },
    { 
      tab: "Convert", 
      icon: <RefreshCw size={19} strokeWidth={1.4} />, 
      label: "Convert" 
    },
    { 
      tab: "Organize", 
      icon: <FolderKanban size={19} strokeWidth={1.4} />, 
      label: "Organize" 
    },
    { 
      tab: "Security", 
      icon: <Shield size={19} strokeWidth={1.4} />, 
      label: "Security" 
    },
    { 
      tab: "AI Tools", 
      icon: <Sparkles size={19} strokeWidth={1.4} />, 
      label: "AI Tools" 
    },
    { 
      tab: "Documents", 
      icon: <FileText size={19} strokeWidth={1.4} />, 
      label: "Docs" 
    }
  ];

  return (
    <aside className="uw-sidebar">
      {/* Brand Logo Icon */}
      <div className="uw-logo-btn" onClick={onLogoClick} title="PDFMount Home" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img 
          src="/favicon.png" 
          alt="PDFMount" 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover" 
          }} 
        />
      </div>

      {/* Navigation Tabs */}
      <div className="uw-sidebar-items">
        {sidebarItems.map(({ tab, icon, label }) => (
          <button
            key={tab}
            className={`uw-sidebar-item ${activeTab === tab || openDropdownTab === tab ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onTabClick(tab);
            }}
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
          <Settings size={19} strokeWidth={1.4} />
          <span className="uw-sidebar-label">Settings</span>
        </button>
        <button 
          className="uw-sidebar-item" 
          title="Account profile"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderRadius: 0, height: "56px" }}
        >
          <User size={19} strokeWidth={1.4} />
        </button>
      </div>
    </aside>
  );
}

