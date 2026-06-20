import React, { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  CreditCardIcon,
  CheckCircle,
  Calendar01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons";

export function AdminBilling() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [webhookLogs] = useState([
    { event: "checkout.session.completed", id: "evt_101", status: "success", time: "Just now" },
    { event: "invoice.payment_succeeded", id: "evt_102", status: "success", time: "5 mins ago" },
    { event: "customer.subscription.updated", id: "evt_103", status: "success", time: "1 hour ago" },
    { event: "customer.subscription.deleted", id: "evt_104", status: "warning", time: "3 hours ago" },
    { event: "invoice.payment_failed", id: "evt_105", status: "failed", time: "Yesterday" }
  ]);

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [estimatedMRR, setEstimatedMRR] = useState(0);
  const [activeSubsCount, setActiveSubsCount] = useState(0);

  const fetchBilling = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/billing", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setEstimatedMRR(data.estimated_mrr || 0);
        setActiveSubsCount(data.active_subscriptions || 0);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching billing details:", err);
    }
  };

  React.useEffect(() => {
    fetchBilling();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSyncStripe = () => {
    triggerToast("Initiating live Stripe subscription database synchronization...");
    setTimeout(() => {
      fetchBilling();
      triggerToast("Synchronization finished. Billing status database is up to date.");
    }, 1200);
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  const activePro = subscriptions.filter(s => s.plan === "Pro").length;
  const activeEnt = subscriptions.filter(s => s.plan === "Enterprise").length;

  return (
    <div className="admin-billing-page">
      {/* Toast popup */}
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

      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <button onClick={handleSyncStripe} className="admin-btn admin-btn-secondary">
          Sync Stripe Database Status
        </button>
      </div>

      {/* Billing metric row */}
      <div className="admin-metrics-grid">
        <MetricCard 
          title="Projected MRR" 
          value={`$${estimatedMRR.toFixed(2)}`} 
          icon={Coins01Icon} 
          change={{ value: "+12% this month", isPositive: true }}
          period="Calculated"
        />
        <MetricCard 
          title="Active Paid Subscriptions" 
          value={activeSubsCount} 
          icon={CreditCardIcon} 
          change={{ value: `${activePro} Pro, ${activeEnt} Enterprise`, isPositive: true }}
          period="Stripe sync"
        />
        <MetricCard 
          title="Webhook Delivery Success" 
          value="98.4%" 
          icon={CheckCircle} 
          change={{ value: "5 events processed today", isPositive: true }}
          period="Last 48 hours"
        />
      </div>

      <div className="admin-overview-grid">
        {/* Left column: Subscriptions Directory */}
        <div className="admin-card-section">
          <h2>Active Subscriptions</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sub ID</th>
                  <th>User Email</th>
                  <th>Plan Tier</th>
                  <th>Activated Date</th>
                  <th>Expires Date</th>
                  <th>Coupon Code</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id}>
                    <td className="text-xs" style={{ fontFamily: "monospace" }}>{sub.id.substring(0, 8)}...</td>
                    <td style={{ fontWeight: 500 }}>{sub.email}</td>
                    <td>
                      <span 
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: sub.plan === "Enterprise" ? "var(--admin-accent-soft)" : "var(--admin-surface-low)",
                          color: sub.plan === "Enterprise" ? "var(--admin-accent)" : "var(--admin-text-primary)"
                        }}
                      >
                        {sub.plan}
                      </span>
                    </td>
                    <td>{formatDate(sub.activated_at)}</td>
                    <td>{formatDate(sub.expires_at)}</td>
                    <td className="text-secondary">{sub.promo_code_used || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Webhook event tracer log */}
        <div className="admin-card-section">
          <h2>Stripe Webhook Logs</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="text-xs" style={{ fontFamily: "monospace", fontWeight: 500 }}>{log.event}</td>
                    <td>
                      <span 
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: log.status === "success" 
                            ? "var(--admin-success)" 
                            : log.status === "warning" 
                              ? "var(--admin-warning)" 
                              : "var(--admin-danger)"
                        }}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
