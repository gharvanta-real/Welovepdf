import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Sun01Icon,
  MoonIcon,
  Notification01Icon,
  AlertCircleIcon,
  CheckCircle,
  CreditCardIcon,
  DiscountIcon,
  Mail01Icon,
  Clock01Icon,
  Menu01Icon
} from "@hugeicons/core-free-icons";

interface AdminHeaderProps {
  title: string;
  description?: string;
  userEmail?: string;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  notifications: any[];
  onMarkRead: (id: string) => void;
  onViewAllNotifications: () => void;
  onToggleMobileMenu?: () => void;
  children?: React.ReactNode;
}

export function AdminHeader({
  title,
  description,
  userEmail,
  themeMode,
  onToggleTheme,
  notifications,
  onMarkRead,
  onViewAllNotifications,
  onToggleMobileMenu,
  children
}: AdminHeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (source: string, type: string) => {
    if (type === "error") return AlertCircleIcon;
    switch (source) {
      case "Stripe Webhook": return CreditCardIcon;
      case "Promo Campaigns": return DiscountIcon;
      case "Support Center": return Mail01Icon;
      default: return Clock01Icon;
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {onToggleMobileMenu && (
          <button 
            onClick={onToggleMobileMenu} 
            className="admin-mobile-menu-toggle"
            title="Toggle Menu"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {description && <span className="text-xs text-secondary">{description}</span>}
        </div>
      </div>

      <div className="admin-header-right">
        {/* Page Actions / Controls Area */}
        {children && <div className="admin-header-actions">{children}</div>}

        {/* Theme Toggle Button */}
        <button 
          onClick={onToggleTheme} 
          className="admin-btn admin-btn-secondary"
          style={{ padding: "8px", borderRadius: "50%" }}
          title={themeMode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <HugeiconsIcon icon={themeMode === "light" ? MoonIcon : Sun01Icon} size={18} />
        </button>

        {/* Stateful Notifications Bell Trigger */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="admin-btn admin-btn-secondary"
            style={{ padding: "8px", borderRadius: "50%", position: "relative" }}
            title="Operational Alerts"
          >
            <HugeiconsIcon icon={Notification01Icon} size={18} />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--admin-accent, #2563eb)",
                  border: "1.5px solid var(--admin-surface)"
                }}
              />
            )}
          </button>

          {/* Stateful Dropdown List */}
          {isNotifOpen && (
            <div className="admin-notif-dropdown">
              <div className="admin-notif-dropdown-header">
                <span>Operational Alerts</span>
                {unreadCount > 0 && <span className="unread-label">{unreadCount} unread</span>}
              </div>

              <div className="admin-notif-dropdown-body">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(notif => {
                    const IconComponent = getIcon(notif.source, notif.type);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          onMarkRead(notif.id);
                          setIsNotifOpen(false);
                          onViewAllNotifications();
                        }}
                        className={`admin-notif-item ${notif.isRead ? "" : "unread"}`}
                      >
                        <div className="admin-notif-item-icon">
                          <HugeiconsIcon icon={IconComponent} size={15} color="var(--admin-text-secondary)" />
                        </div>
                        <div className="admin-notif-item-content">
                          <span className="admin-notif-item-title">{notif.title}</span>
                          <span className="admin-notif-item-desc">{notif.message}</span>
                          <span className="admin-notif-item-time">{notif.time}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "12px" }}>
                    No alerts triggered.
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setIsNotifOpen(false);
                  onViewAllNotifications();
                }}
                className="admin-notif-dropdown-footer"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>

        {/* Admin Profile Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} title={`Logged in as ${userEmail || "Administrator"}`}>
          <div 
            style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              backgroundColor: "var(--admin-surface-low)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <HugeiconsIcon icon={UserIcon} size={16} color="var(--admin-text-secondary)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.2 }}>Admin</span>
            {userEmail && (
              <span style={{ fontSize: "10px", color: "var(--admin-text-muted)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
