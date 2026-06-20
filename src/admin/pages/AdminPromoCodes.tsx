import React, { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DiscountIcon,
  CheckCircle,
  Add01Icon,
  Delete01Icon
} from "@hugeicons/core-free-icons";

export function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newPlan, setNewPlan] = useState("Pro");
  const [newMaxUses, setNewMaxUses] = useState(100);
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/promo-codes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.codes || []);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching promo codes:", err);
    }
  };

  React.useEffect(() => {
    fetchPromoCodes();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const codeUpper = newCode.trim().toUpperCase();
    if (promoCodes.some(p => p.code === codeUpper)) {
      triggerToast("Error: This promo code already exists.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/promo-codes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: codeUpper,
          plan: newPlan,
          max_uses: Number(newMaxUses),
          expires_at: newExpiry
        })
      });
      if (res.ok) {
        setNewCode("");
        triggerToast(`Promo code ${codeUpper} created successfully!`);
        fetchPromoCodes();
      } else {
        triggerToast("Failed to seed promo code.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error creating promo code.");
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete and revoke promo code ${code}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/promo-codes/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        triggerToast(`Promo code ${code} deactivated and deleted.`);
        fetchPromoCodes();
      } else {
        triggerToast("Failed to delete promo code.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error deleting promo code.");
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

  const totalRedeemed = promoCodes.reduce((sum, p) => sum + (p.uses_so_far || 0), 0);

  return (
    <div className="admin-promocodes-page">
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
          title="Active Promo Campaigns" 
          value={promoCodes.length} 
          icon={DiscountIcon} 
          change={{ value: "All campaigns healthy", isPositive: true }}
          period="Seeded active"
        />
        <MetricCard 
          title="Total Redemptions" 
          value={totalRedeemed} 
          icon={CheckCircle} 
          change={{ value: "avg 78 redemptions/code", isPositive: true }}
          period="Cumulative uses"
        />
      </div>

      <div className="admin-overview-grid">
        {/* Left column: Promo Code list */}
        <div className="admin-card-section">
          <h2>Seeded Promo Codes</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code String</th>
                  <th>Target Plan</th>
                  <th>Uses So Far</th>
                  <th>Limit</th>
                  <th>Expires Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map(promo => (
                  <tr key={promo.code}>
                    <td style={{ fontFamily: "monospace", fontWeight: 500 }}>{promo.code}</td>
                    <td>{promo.plan}</td>
                    <td style={{ fontWeight: 500 }}>{promo.uses_so_far}</td>
                    <td>{promo.max_uses}</td>
                    <td className="text-secondary">{formatDate(promo.expires_at)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        onClick={() => handleDeleteCode(promo.code)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "6px" }}
                        title="Deactivate code"
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={15} color="var(--admin-danger)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Form to seed a new code */}
        <div className="admin-card-section">
          <h2>Seed New Code</h2>
          <span className="text-xs text-secondary" style={{ marginBottom: "16px", display: "block" }}>
            Add a coupon code that can be entered by users on check-out/settings to unlock premium subscriptions.
          </span>

          <form onSubmit={handleCreateCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Coupon Code String</label>
              <input 
                type="text" 
                placeholder="e.g. SUMMERPRO2026" 
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="admin-input"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Unlocks Plan Tier</label>
              <select 
                value={newPlan} 
                onChange={(e) => setNewPlan(e.target.value)} 
                className="admin-select"
              >
                <option value="Pro">Pro ($19/mo value)</option>
                <option value="Enterprise">Enterprise ($29/mo value)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Max Usages Limit</label>
              <input 
                type="number" 
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(Number(e.target.value))}
                className="admin-input"
                min={1}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Expiration Date</label>
              <input 
                type="date" 
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="admin-input"
                required
              />
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: "8px" }}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Seed Coupon Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
