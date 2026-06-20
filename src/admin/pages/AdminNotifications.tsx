import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckCircle,
  Clock01Icon,
  DiscountIcon,
  CreditCardIcon,
  Mail01Icon
} from "@hugeicons/core-free-icons";

export interface NotificationItem {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  linkPage: string;
  source: string;
}

interface AdminNotificationsProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onResolve: (id: string) => void;
  onClearAll: () => void;
  onNavigateToPage: (page: string) => void;
  onMarkAllRead?: () => void;
}

export function AdminNotifications({
  notifications,
  onMarkRead,
  onResolve,
  onClearAll,
  onNavigateToPage,
  onMarkAllRead
}: AdminNotificationsProps) {
  
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
    <div className="admin-notifications-page">
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "12px", 
          marginBottom: "24px" 
        }}
      >
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={onMarkAllRead || (() => notifications.forEach(n => !n.isRead && onMarkRead(n.id)))}
            className="admin-btn admin-btn-secondary"
          >
            Mark All as Read
          </button>
        )}
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="admin-btn admin-btn-secondary"
            style={{ color: "var(--admin-danger)" }}
          >
            Clear Resolved Alerts
          </button>
        )}
      </div>

      <div className="admin-card-section" style={{ padding: "0" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>Source</th>
                <th>Alert Title / Description</th>
                <th>Triggered Time</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map(notif => {
                  const IconComponent = getIcon(notif.source, notif.type);
                  return (
                    <tr 
                      key={notif.id}
                      style={{ 
                        opacity: notif.isRead ? 0.7 : 1,
                        backgroundColor: notif.isRead ? "" : "var(--admin-surface-low)"
                      }}
                    >
                      <td>
                        <div 
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: notif.isRead ? "transparent" : "var(--admin-accent)"
                          }}
                        />
                      </td>
                      <td>
                        <span 
                          style={{ 
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <HugeiconsIcon icon={IconComponent} size={15} color="var(--admin-text-secondary)" />
                          {notif.source}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 500 }}>{notif.title}</span>
                          <span className="text-secondary" style={{ fontSize: "12px" }}>{notif.message}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{notif.time}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          {!notif.isRead && (
                            <button 
                              onClick={() => onMarkRead(notif.id)}
                              className="admin-btn admin-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "11px" }}
                            >
                              Mark Read
                            </button>
                          )}
                          <button 
                            onClick={() => onNavigateToPage(notif.linkPage)}
                            className="admin-btn admin-btn-accent"
                            style={{ padding: "6px 12px", fontSize: "11px" }}
                          >
                            Investigate
                          </button>
                          <button 
                            onClick={() => onResolve(notif.id)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "6px", color: "var(--admin-success)" }}
                            title="Resolve Alert"
                          >
                            <HugeiconsIcon icon={CheckCircle} size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-muted)" }}>
                    All clear! There are no unresolved active alerts at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
