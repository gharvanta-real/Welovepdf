import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Chart01Icon,
  UserGroupIcon,
  CreditCardIcon,
  DiscountIcon,
  Mail01Icon,
  Notification01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Logout01Icon,
  CpuIcon
} from "@hugeicons/core-free-icons";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
  onBackToApp: () => void;
  unreadCount?: number;
  isMobileOpen?: boolean;
}

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  activePage,
  onPageChange,
  onBackToApp,
  unreadCount = 0,
  isMobileOpen = false
}: AdminSidebarProps) {
  const navGroups = [
    {
      title: "Engine",
      items: [
        { id: "overview", name: "Overview", icon: DashboardSquare01Icon },
        { id: "toolstats", name: "Tool Stats", icon: Chart01Icon }
      ]
    },
    {
      title: "Management",
      items: [
        { id: "users", name: "Users & Sessions", icon: UserGroupIcon },
        { id: "billing", name: "Billing & MRR", icon: CreditCardIcon },
        { id: "templates", name: "Resume Templates", icon: CpuIcon }
      ]
    },
    {
      title: "Support & Alerts",
      items: [
        { id: "notifications", name: "System Alerts", icon: Notification01Icon },
        { id: "promocodes", name: "Promo Codes", icon: DiscountIcon },
        { id: "support", name: "Support Inbox", icon: Mail01Icon }
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
      {/* Logo Area */}
      <div className="admin-sidebar-logo">
        <img src="/logo.png" alt="PDFMount Admin" />
        {!isCollapsed && <span className="admin-logo-text">Admin Panel</span>}
      </div>

      {/* Navigation Group Items */}
      <div className="admin-sidebar-nav">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="admin-nav-group">
            <span className="admin-nav-group-title">{group.title}</span>
            {group.items.map(item => {
              const showBadge = item.id === "notifications" && unreadCount > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`admin-btn admin-nav-item ${activePage === item.id ? "active" : ""}`}
                  style={{ position: "relative" }}
                  title={item.name}
                >
                  <HugeiconsIcon icon={item.icon} size={20} className="admin-nav-icon" />
                  <span className="admin-nav-text" style={{ flex: 1, textAlign: "left" }}>{item.name}</span>
                  
                  {showBadge && !isCollapsed && (
                    <span 
                      style={{
                        backgroundColor: activePage === "notifications" ? "var(--admin-surface)" : "var(--admin-accent)",
                        color: activePage === "notifications" ? "var(--admin-accent)" : "#ffffff",
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        lineHeight: 1,
                        marginLeft: "auto",
                        minWidth: "18px",
                        textAlign: "center"
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}

                  {showBadge && isCollapsed && (
                    <span 
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--admin-accent)",
                        border: "1.5px solid var(--admin-surface)"
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Back to App Item (placed at the bottom of navigation) */}
        <div className="admin-nav-group" style={{ marginTop: "auto" }}>
          <button
            onClick={onBackToApp}
            className="admin-btn admin-nav-item"
            title="Back to PDFMount"
          >
            <HugeiconsIcon icon={Logout01Icon} size={20} className="admin-nav-icon" />
            <span className="admin-nav-text">Back to App</span>
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="admin-sidebar-footer">
        <button
          onClick={onToggleCollapse}
          className="admin-collapse-btn"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <HugeiconsIcon
            icon={isCollapsed ? ArrowRight01Icon : ArrowLeft01Icon}
            size={18}
          />
        </button>
      </div>
    </aside>
  );
}
