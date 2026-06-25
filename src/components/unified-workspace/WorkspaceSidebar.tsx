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
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M12 7v4M12 17v-4" />
          <path d="M9 10l3 3 3-3" />
          <path d="M9 14l3-3 3 3" />
        </svg>
      ), 
      label: "Compress" 
    },
    { 
      tab: "Convert", 
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      ), 
      label: "Convert" 
    },
    { 
      tab: "Organize", 
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="6" y1="11" x2="18" y2="11" />
          <line x1="6" y1="15" x2="14" y2="15" />
        </svg>
      ), 
      label: "Organize" 
    },
    { 
      tab: "Security", 
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 11l2 2 4-4" />
        </svg>
      ), 
      label: "Security" 
    },
    { 
      tab: "AI Tools", 
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="20" x2="15" y2="9" />
          <line x1="15" y1="9" x2="18" y2="6" strokeWidth="3" />
          <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z" fill="currentColor" />
          <path d="M11 2l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z" fill="currentColor" />
          <path d="M21 11l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z" fill="currentColor" />
        </svg>
      ), 
      label: "AI Tools" 
    },
    { 
      tab: "Documents", 
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9L12 2z" />
          <polyline points="12 2 12 9 19 9" />
          <line x1="6" y1="13" x2="13" y2="13" />
          <line x1="6" y1="17" x2="11" y2="17" />
          <path d="M15 15.5l4-4 1.5 1.5-4 4z" />
          <path d="M15 15.5l-0.8 1.8 1.8-0.8z" fill="currentColor" />
        </svg>
      ), 
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
          <Settings size={19} strokeWidth={2.2} />
          <span className="uw-sidebar-label">Settings</span>
        </button>
        <button 
          className="uw-sidebar-item" 
          title="Account profile"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderRadius: 0, height: "56px" }}
        >
          <User size={19} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}

