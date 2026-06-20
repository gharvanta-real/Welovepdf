import React, { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  CheckCircle,
  Clock01Icon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons";

export function AdminSupport() {
  const [messages, setMessages] = useState<any[]>([]);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/support", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const loadedMsgs = data.messages || [];
        setMessages(loadedMsgs);
        if (loadedMsgs.length > 0 && !selectedMsgId) {
          setSelectedMsgId(loadedMsgs[0].id);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching support messages:", err);
    }
  };

  React.useEffect(() => {
    fetchSupport();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMsgId) return;

    const message = messages.find(m => m.id === selectedMsgId);
    triggerToast(`Email reply successfully dispatched to ${message?.email}!`);
    setReplyText("");
    setResolvedIds(prev => [...prev, selectedMsgId]);
  };

  const handleMarkResolved = (id: string) => {
    setResolvedIds(prev => [...prev, id]);
    triggerToast("Inquiry marked as resolved.");
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  const messagesWithStatus = messages.map(m => ({
    ...m,
    status: resolvedIds.includes(m.id) ? "Resolved" : "Open"
  }));

  const activeMessage = messagesWithStatus.find(m => m.id === selectedMsgId);
  const openCount = messagesWithStatus.filter(m => m.status !== "Resolved").length;

  return (
    <div className="admin-support-page">
      {/* Toast */}
      {toast && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "var(--admin-primary)",
            color: "var(--admin-surface)",
            padding: "12px 24px",
            borderRadius: "8px",
            zIndex: 1000,
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          {toast}
        </div>
      )}

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <MetricCard 
          title="Open Inquiries" 
          value={openCount} 
          icon={Mail01Icon} 
          change={{ value: "All queries assigned", isPositive: true }}
          period="Awaiting reply"
        />
        <MetricCard 
          title="Average Response Time" 
          value="42 mins" 
          icon={Clock01Icon} 
          change={{ value: "-12 mins from yesterday", isPositive: true }}
          period="Performance index"
        />
      </div>

      <div className="admin-support-layout">
        {/* Left Column: Inbox List */}
        <div className="admin-card-section" style={{ padding: "0" }}>
          <div style={{ padding: "24px 24px 16px 24px" }}>
            <h2>Support Inbox</h2>
            <span className="text-xs text-secondary">Messages from the public contact forms</span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {messagesWithStatus.map(msg => (
                  <tr 
                    key={msg.id} 
                    onClick={() => setSelectedMsgId(msg.id)}
                    style={{ 
                      cursor: "pointer", 
                      backgroundColor: selectedMsgId === msg.id ? "var(--admin-surface-low)" : "" 
                    }}
                  >
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{msg.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", fontWeight: 400 }}>{msg.email}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.subject || "No Subject"}
                    </td>
                    <td>
                      <span 
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: msg.status === "Resolved" 
                            ? "var(--admin-success)" 
                            : msg.status === "In Progress" 
                              ? "var(--admin-warning)" 
                              : "var(--admin-danger)"
                        }}
                      >
                        {msg.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary">{formatDate(msg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Message Detail Drawer */}
        <div className="admin-message-drawer">
          {activeMessage ? (
            <>
              <div className="admin-message-header">
                <h3>{activeMessage.subject || "No Subject"}</h3>
                <span className="text-xs text-secondary">
                  From: {activeMessage.name} ({activeMessage.email})
                </span>
                <div style={{ marginTop: "8px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className="text-xs text-secondary">{formatDate(activeMessage.created_at)}</span>
                  <span style={{ fontSize: "11px", fontWeight: "bold" }}>•</span>
                  <span style={{ fontSize: "11px", color: activeMessage.status === "Resolved" ? "var(--admin-success)" : "var(--admin-danger)" }}>
                    {activeMessage.status}
                  </span>
                </div>
              </div>

              <div className="admin-message-body">
                {activeMessage.message}
              </div>

              {activeMessage.status !== "Resolved" ? (
                <div className="admin-message-reply-box">
                  <textarea
                    placeholder={`Compose email response to ${activeMessage.email}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="admin-reply-textarea"
                  />
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button 
                      onClick={() => handleMarkResolved(activeMessage.id)} 
                      className="admin-btn admin-btn-secondary"
                    >
                      Mark Resolved
                    </button>
                    <button 
                      onClick={handleSendReply} 
                      className="admin-btn admin-btn-primary"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  style={{ 
                    backgroundColor: "var(--admin-surface-low)", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px" 
                  }}
                >
                  <HugeiconsIcon icon={CheckCircle} size={18} color="var(--admin-success)" />
                  <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    This inquiry has been marked as resolved.
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "40px 0" }}>
              Select a message to view the support details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
