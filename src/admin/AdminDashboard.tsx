import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminBilling } from "./pages/AdminBilling";
import { AdminToolStats } from "./pages/AdminToolStats";
import { AdminPromoCodes } from "./pages/AdminPromoCodes";
import { AdminSupport } from "./pages/AdminSupport";
import { AdminNotifications, NotificationItem } from "./pages/AdminNotifications";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

// Import isolated admin stylesheets
import "./styles/admin-variables.css";
import "./styles/admin-components.css";
import "./styles/admin-pages.css";

interface AdminDashboardProps {
  onBack: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLoginClick?: () => void;
}

export function AdminDashboard({ onBack, currentUser, onLoginClick }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Charcoal theme state
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "error",
      title: "Stripe Webhook Failure",
      message: "invoice.payment_failed returned 502 Bad Gateway response from endpoint /api/stripe-webhook.",
      time: "5 mins ago",
      isRead: false,
      linkPage: "billing",
      source: "Stripe Webhook"
    },
    {
      id: "notif-2",
      type: "warning",
      title: "Promo Code Usage Alert",
      message: "WELOVEPDF30 coupon has reached 95% usage capacity. Recommend seeding new batch.",
      time: "2 hours ago",
      isRead: false,
      linkPage: "promocodes",
      source: "Promo Campaigns"
    },
    {
      id: "notif-3",
      type: "info",
      title: "New High-Priority Inquiry",
      message: "Jessica Taylor submitted a support inquiry: 'Need high volume custom plan for enterprise PDF OCR'.",
      time: "4 hours ago",
      isRead: true,
      linkPage: "support",
      source: "Support Center"
    },
    {
      id: "notif-4",
      type: "warning",
      title: "CPU Threshold Exceeded",
      message: "Volatile subprocess pool (qpdf wrapper) reached 92% CPU load limit during heavy batch merge.",
      time: "6 hours ago",
      isRead: true,
      linkPage: "overview",
      source: "System Monitor"
    }
  ]);

  // Operational alerts / toast notification message
  const [toastMessage, setToastMessage] = useState("");

  // Sync themeMode with localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("pdfmount-admin-theme") as "light" | "dark";
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("pdfmount-admin-theme", newTheme);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => n.isRead ? n : { ...n, isRead: true }));
    setToastMessage("All alerts marked as read.");
  };

  const handleResolve = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToastMessage("Alert resolved and cleared from view.");
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    setToastMessage("Cleared all read notifications.");
  };

  const handleViewAllNotifications = () => {
    setActivePage("notifications");
  };

  // Toast autoclose
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Simulate real-time background operational alerts
  useEffect(() => {
    const alertTemplates = [
      {
        type: "info" as const,
        title: "Stripe Checkout Succeeded",
        message: "User upgrade: premium member created (plan: Pro Annual, user: client_982@gmail.com).",
        linkPage: "billing",
        source: "Stripe Webhook"
      },
      {
        type: "error" as const,
        title: "Database Lock Error",
        message: "Metadata query blocked: concurrent transaction timeout on active sessions table.",
        linkPage: "users",
        source: "Database Router"
      },
      {
        type: "warning" as const,
        title: "High Memory Utilization",
        message: "Node CLI subprocess memory footprint exceeded 85% of baseline allocation during OCR run.",
        linkPage: "overview",
        source: "System Monitor"
      },
      {
        type: "info" as const,
        title: "New Support Inquiry",
        message: "Support ticket #1084 raised: 'Cannot unlock encrypted secure PDF document'.",
        linkPage: "support",
        source: "Support Center"
      },
      {
        type: "warning" as const,
        title: "New Promo Code Seeded",
        message: "New automated flash coupon generated: AUTO_MINT_15 (15% off, expires in 24h).",
        linkPage: "promocodes",
        source: "Promo Campaigns"
      }
    ];

    const interval = setInterval(() => {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: template.type,
        title: template.title,
        message: template.message,
        time: "Just now",
        isRead: false,
        linkPage: template.linkPage,
        source: template.source
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setToastMessage(`New Operational Alert: ${newNotif.title}`);
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check permission: Is user signed in and is their plan 'Admin' or does their email end with @pdfmount.online?
    if (currentUser) {
      const isUserAdmin = 
        currentUser.plan === "Admin" || 
        currentUser.email.endsWith("@pdfmount.online") || 
        currentUser.email === "anshu@gemini.com" || // local developer fallback
        currentUser.email === "anshubhati190@gmail.com";
      
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
    setHasChecked(true);
  }, [currentUser]);

  // Handle local developer bypass so the dashboard can be tested without complex database edits
  const handleBypass = () => {
    setIsAdmin(true);
  };

  if (!hasChecked) {
    return (
      <div className="admin-auth-shield">
        <div style={{ color: "var(--admin-text-secondary)" }}>Verifying credentials...</div>
      </div>
    );
  }

  // Access Denied Shield Page
  if (!isAdmin) {
    return (
      <div className="admin-auth-shield">
        <div className="admin-shield-card">
          <HugeiconsIcon icon={AlertCircleIcon} size={48} className="admin-shield-icon" />
          <h2 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 12px 0" }}>Access Denied</h2>
          <p className="text-secondary" style={{ marginBottom: "28px", fontSize: "13px" }}>
            You do not have administrative permissions to access this area. If you believe this is an error, please contact systems support.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!currentUser && onLoginClick ? (
              <button 
                onClick={onLoginClick} 
                className="admin-btn admin-btn-primary" 
                style={{ width: "100%" }}
              >
                Log In to System
              </button>
            ) : null}
            <button 
              onClick={onBack} 
              className={!currentUser && onLoginClick ? "admin-btn admin-btn-secondary" : "admin-btn admin-btn-primary"} 
              style={{ width: "100%" }}
            >
              Return to PDFMount
            </button>
            <button 
              onClick={handleBypass} 
              className="admin-btn admin-btn-secondary" 
              style={{ width: "100%", fontSize: "11px" }}
            >
              Developer Bypass (Simulate Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active page contents mapping
  const renderPageContent = () => {
    switch (activePage) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <AdminUsers />;
      case "billing":
        return <AdminBilling />;
      case "toolstats":
        return <AdminToolStats />;
      case "promocodes":
        return <AdminPromoCodes />;
      case "support":
        return <AdminSupport />;
      case "notifications":
        return (
          <AdminNotifications
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onResolve={handleResolve}
            onClearAll={handleClearAllNotifications}
            onNavigateToPage={(page) => setActivePage(page)}
            onMarkAllRead={handleMarkAllRead}
          />
        );
      default:
        return <AdminOverview />;
    }
  };

  // Active page title / description mapping
  const getPageMeta = () => {
    switch (activePage) {
      case "overview":
        return {
          title: "System Health Overview",
          desc: "Live tracking of active PDF jobs queue, local subprocess wrappers, and server resources."
        };
      case "users":
        return {
          title: "User & Session Directory",
          desc: "Search user profiles, manage active memberships, upgrade plan levels, and terminate sessions."
        };
      case "billing":
        return {
          title: "Billing & Revenue Stats",
          desc: "Monitor MRR projections, active Stripe subscriptions, and inspect real-time webhook callbacks."
        };
      case "toolstats":
        return {
          title: "Tool Performance Analytics",
          desc: "Visual popularity metric indices across PDF tools and diagnostic stderr/stdout logs."
        };
      case "promocodes":
        return {
          title: "Promo Code Manager",
          desc: "Seed, inspect, and deactivate coupon codes that unlock premium tiers for users."
        };
      case "support":
        return {
          title: "Customer Support Inbox",
          desc: "Read user contact submissions and respond via email directly from the panel."
        };
      case "notifications":
        return {
          title: "Operational Alerts & Logs",
          desc: "Inspect real-time warnings, webhook signals, security detections, and hardware load."
        };
      default:
        return { title: "Admin Panel", desc: "" };
    }
  };

  const meta = getPageMeta();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`admin-panel-root ${themeMode === "dark" ? "dark" : ""}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "var(--admin-accent)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            zIndex: 1100,
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "var(--admin-font)"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 990
          }}
        />
      )}

      <div className="admin-shell">
        {/* Isolated Left Sidebar */}
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          activePage={activePage}
          onPageChange={(page) => {
            setActivePage(page);
            setIsMobileMenuOpen(false);
          }}
          onBackToApp={onBack}
          unreadCount={unreadCount}
          isMobileOpen={isMobileMenuOpen}
        />

        {/* Main Content Area */}
        <div className="admin-main">
          {/* Isolated Top Navigation */}
          <AdminHeader
            title={meta.title}
            description={meta.desc}
            userEmail={currentUser?.email || "dev@pdfmount.online"}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onViewAllNotifications={handleViewAllNotifications}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          {/* Subpage Viewport */}
          <main className="admin-content">
            {renderPageContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
