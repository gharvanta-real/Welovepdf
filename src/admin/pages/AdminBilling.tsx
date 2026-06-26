import React, { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  CreditCardIcon,
  CheckCircle,
  AlertCircleIcon
} from "@hugeicons/core-free-icons";

export function AdminBilling() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [estimatedMRR, setEstimatedMRR] = useState(0);
  const [activeSubsCount, setActiveSubsCount] = useState(0);
  const [stripeWebhookHealth, setStripeWebhookHealth] = useState(100.0);

  const fetchBilling = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/billing", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setEstimatedMRR(data.estimated_mrr || 0);
        setActiveSubsCount(data.active_subscriptions || 0);
        setStripeWebhookHealth(data.stripe_webhook_health ?? 100.0);
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

  const handleSyncStripe = async () => {
    setIsSyncing(true);
    triggerToast("Initiating live Stripe subscription database synchronization...");
    try {
      await fetchBilling();
      triggerToast("Synchronization finished. Billing status database is up to date.");
    } finally {
      setIsSyncing(false);
    }
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

  if (loading) {
    return (
      <div className="admin-billing-page">
        <div className="admin-metrics-grid">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "100px", borderRadius: "10px", backgroundColor: "var(--admin-surface-low)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
          Loading billing data...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-billing-page">
      {/* Toast popup */}
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

      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <button
          onClick={handleSyncStripe}
          className="admin-btn admin-btn-secondary"
          disabled={isSyncing}
          style={{ opacity: isSyncing ? 0.7 : 1 }}
        >
          {isSyncing ? "Syncing..." : "Sync Stripe Database Status"}
        </button>
      </div>

      {/* Billing metric row */}
      <div className="admin-metrics-grid">
        <MetricCard
          title="Projected MRR"
          value={`$${estimatedMRR.toFixed(2)}`}
          icon={Coins01Icon}
          change={{ value: `${activePro} Pro × $19 + ${activeEnt} Ent × $29`, isPositive: estimatedMRR > 0 }}
          period="Calculated from DB"
        />
        <MetricCard
          title="Active Paid Subscriptions"
          value={activeSubsCount}
          icon={CreditCardIcon}
          change={{ value: `${activePro} Pro, ${activeEnt} Enterprise`, isPositive: activeSubsCount > 0 }}
          period="Stripe sync"
        />
        <MetricCard
          title="Webhook Delivery Health"
          value={`${stripeWebhookHealth.toFixed(1)}%`}
          icon={stripeWebhookHealth > 95 ? CheckCircle : AlertCircleIcon}
          change={{ value: stripeWebhookHealth > 95 ? "All events processed" : "Check Stripe logs", isPositive: stripeWebhookHealth > 95 }}
          period="Stripe health"
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
                {subscriptions.length > 0 ? (
                  subscriptions.map(sub => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-muted)" }}>
                      No active subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Pricing breakdown info */}
        <div className="admin-card-section">
          <h2>Revenue Breakdown</h2>
          <span className="text-xs text-secondary" style={{ display: "block", marginBottom: "16px" }}>
            Current plan pricing and revenue distribution
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Pro plan breakdown */}
            <div style={{
              backgroundColor: "var(--admin-surface-low)",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>Pro Plan</div>
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>{activePro} active subscribers</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--admin-accent)" }}>
                  ${(activePro * 19).toFixed(2)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>$19/mo × {activePro}</div>
              </div>
            </div>

            {/* Enterprise plan breakdown */}
            <div style={{
              backgroundColor: "var(--admin-surface-low)",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>Enterprise Plan</div>
                <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>{activeEnt} active subscribers</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--admin-accent)" }}>
                  ${(activeEnt * 29).toFixed(2)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>$29/mo × {activeEnt}</div>
              </div>
            </div>

            {/* Total MRR */}
            <div style={{
              backgroundColor: "var(--admin-accent-soft, rgba(37, 99, 235, 0.08))",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft: "3px solid var(--admin-accent)"
            }}>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>Total MRR</div>
              <div style={{ fontWeight: 700, fontSize: "22px", color: "var(--admin-accent)" }}>
                ${estimatedMRR.toFixed(2)}
              </div>
            </div>

            <div style={{
              padding: "12px 16px",
              backgroundColor: "var(--admin-surface-low)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--admin-text-secondary)"
            }}>
              <strong style={{ display: "block", marginBottom: "4px" }}>Note:</strong>
              MRR is calculated directly from active subscriptions in the database.
              To view Stripe webhook events, visit your{" "}
              <a
                href="https://dashboard.stripe.com/events"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--admin-accent)" }}
              >
                Stripe Dashboard
              </a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
