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
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/support", {
        headers: { Authorization: `Bearer ${token}` }
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

  // ── Real reply API — persists reply + marks resolved in DB ───────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMsgId) return;
    const message = messages.find(m => m.id === selectedMsgId);
    if (!message) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedMsgId, reply_text: replyText })
      });

      if (res.ok) {
        // Update local state immediately (optimistic)
        setMessages(prev => prev.map(m =>
          m.id === selectedMsgId
            ? { ...m, status: "resolved", reply: replyText }
            : m
        ));
        setReplyText("");
        triggerToast(`Reply saved & ${message.email} marked resolved.`);
      } else {
        triggerToast("Failed to save reply. Please try again.");
      }
    } catch (err) {
      triggerToast("Network error. Reply not sent.");
    } finally {
      setIsSending(false);
    }
  };

  // ── Persist resolved status in DB ────────────────────────────────────────
  const handleMarkResolved = async (id: string) => {
    setIsResolving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, reply_text: "" })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, status: "resolved" } : m
        ));
        triggerToast("Inquiry marked as resolved.");
      } else {
        triggerToast("Failed to mark as resolved.");
      }
    } catch (err) {
      triggerToast("Network error.");
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  // Status comes from DB now — fallback to "open" if null
  const messagesWithStatus = messages.map(m => ({
    ...m,
    status: m.status || "open"
  }));

  const activeMessage = messagesWithStatus.find(m => m.id === selectedMsgId);
  const openCount = messagesWithStatus.filter(m => m.status !== "resolved").length;

  if (loading) {
    return (
      <div className="admin-support-page">
        <div className="admin-metrics-grid">
          {[1, 2].map(i => (
            <div key={i} style={{ height: "100px", borderRadius: "10px", backgroundColor: "var(--admin-surface-low)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
          Loading support inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support-page">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "84px",
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
          change={{ value: "Awaiting admin response", isPositive: openCount === 0 }}
          period="Awaiting reply"
        />
        <MetricCard
          title="Total Messages"
          value={messages.length}
          icon={Clock01Icon}
          change={{ value: `${messages.length - openCount} resolved`, isPositive: true }}
          period="All time"
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
                {messagesWithStatus.length > 0 ? (
                  messagesWithStatus.map(msg => (
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
                            color: msg.status === "resolved"
                              ? "var(--admin-success)"
                              : "var(--admin-danger)"
                          }}
                        >
                          {(msg.status || "OPEN").toUpperCase()}
                        </span>
                      </td>
                      <td className="text-secondary">{formatDate(msg.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-muted)" }}>
                      No support messages yet.
                    </td>
                  </tr>
                )}
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
                  <span style={{ fontSize: "11px", color: activeMessage.status === "resolved" ? "var(--admin-success)" : "var(--admin-danger)" }}>
                    {(activeMessage.status || "open").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="admin-message-body">
                {activeMessage.message}
              </div>

              {/* Show previous reply if exists */}
              {activeMessage.reply && (
                <div style={{
                  backgroundColor: "var(--admin-surface-low)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  borderLeft: "3px solid var(--admin-success)"
                }}>
                  <span style={{ fontSize: "11px", color: "var(--admin-success)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                    Admin Reply (saved):
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>{activeMessage.reply}</span>
                </div>
              )}

              {activeMessage.status !== "resolved" ? (
                <div className="admin-message-reply-box">
                  <textarea
                    placeholder={`Compose reply to ${activeMessage.email}... (will be saved to DB)`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="admin-reply-textarea"
                  />
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleMarkResolved(activeMessage.id)}
                      className="admin-btn admin-btn-secondary"
                      disabled={isResolving}
                      style={{ opacity: isResolving ? 0.6 : 1 }}
                    >
                      {isResolving ? "Saving..." : "Mark Resolved"}
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="admin-btn admin-btn-primary"
                      disabled={isSending || !replyText.trim()}
                      style={{ opacity: isSending || !replyText.trim() ? 0.6 : 1 }}
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      {isSending ? "Saving..." : "Save Reply & Resolve"}
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
                    This inquiry has been resolved and persisted in the database.
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
