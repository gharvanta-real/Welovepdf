import React, { useState, useEffect } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  UserGroupIcon,
  Search01Icon,
  LockKeyIcon,
  Delete01Icon
} from "@hugeicons/core-free-icons";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dau24h, setDau24h] = useState(0);
  const [proCount, setProCount] = useState(0);
  const [entCount, setEntCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalUsers(data.total_users || 0);
        setDau24h(data.dau_24h || 0);
        
        const dist = data.plan_distribution || {};
        setFreeCount(dist.Free || 0);
        setProCount(dist.Pro || 0);
        setEntCount(dist.Enterprise || 0);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handlePlanChange = async (userId: string, newPlan: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId, plan: newPlan })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        triggerToast(`User plan updated to ${newPlan}.`);
        fetchUsers();
      } else {
        triggerToast("Failed to update user plan.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error updating plan.");
    }
  };

  const handleRevokeSessions = async (userId: string, email: string) => {
    setRevokingId(userId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/users/revoke-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId })
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(`Revoked ${data.revoked} session(s) for ${email}.`);
      } else {
        triggerToast(`Failed to revoke sessions for ${email}.`);
      }
    } catch (err) {
      triggerToast("Network error revoking sessions.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleBanUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete/ban account ${email}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId })
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        triggerToast(`User ${email} has been deleted.`);
        fetchUsers();
      } else {
        triggerToast("Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error deleting user.");
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "N/A";
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  // Filter logic
  const filteredUsers = users.filter(user => {
    const nameStr = user.name || "";
    const emailStr = user.email || "";
    const idStr = user.id || "";
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emailStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "all" || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-metrics-grid">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "100px", borderRadius: "10px", backgroundColor: "var(--admin-surface-low)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
          Loading user directory...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {/* Toast notifications */}
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

      {/* User metrics */}
      <div className="admin-metrics-grid">
        <MetricCard 
          title="Total Registered Accounts" 
          value={totalUsers} 
          icon={UserGroupIcon} 
          change={{ value: `${dau24h} active in 24h`, isPositive: true }}
          period="Cumulative"
        />
        <MetricCard 
          title="Premium Plan Ratio" 
          value={totalUsers > 0 ? `${(((proCount + entCount) / totalUsers) * 100).toFixed(0)}%` : "0%"} 
          icon={UserIcon} 
          change={{ value: `${proCount} Pro, ${entCount} Enterprise`, isPositive: true }}
          period="Conversion rate"
        />
        <MetricCard 
          title="Free Accounts active" 
          value={freeCount} 
          icon={UserIcon} 
          change={{ value: totalUsers > 0 ? `${((freeCount / totalUsers) * 100).toFixed(0)}% of userbase` : "0%", isPositive: false }}
          period="Regular tiers"
        />
      </div>

      {/* Directory Section */}
      <div className="admin-card-section">
        {/* Table Filter Controls */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            flexWrap: "wrap", 
            gap: "16px",
            marginBottom: "24px"
          }}
        >
          <div className="admin-search-wrapper">
            <HugeiconsIcon icon={Search01Icon} size={16} className="admin-search-icon" />
            <input 
              type="text" 
              placeholder="Search user name, ID, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input admin-search-input"
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>Plan Tier:</span>
            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="admin-select"
              style={{ width: "160px" }}
            >
              <option value="all">All Plans</option>
              <option value="Admin">Admin</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Pro">Pro</option>
              <option value="Free">Free</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Active Plan</th>
                <th>Registration Date</th>
                <th>Jobs Run</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="text-xs" style={{ fontFamily: "monospace" }} title={user.id}>{user.id.substring(0, 8)}...</td>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.plan === "Admin" ? (
                        <span style={{ fontWeight: 500, color: "var(--admin-accent)" }}>Admin</span>
                      ) : (
                        <select 
                          value={user.plan}
                          onChange={(e) => handlePlanChange(user.id, e.target.value)}
                          className="admin-select"
                          style={{ padding: "4px 8px", width: "110px", fontSize: "12px" }}
                        >
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      )}
                    </td>
                    <td className="text-secondary">{formatDate(user.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>{user.jobs_count}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => handleRevokeSessions(user.id, user.email)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "6px", opacity: revokingId === user.id ? 0.5 : 1 }}
                          title={revokingId === user.id ? "Revoking..." : "Revoke all session tokens"}
                          disabled={revokingId === user.id}
                        >
                          <HugeiconsIcon icon={LockKeyIcon} size={15} />
                        </button>
                        {user.plan !== "Admin" && (
                          <button 
                            onClick={() => handleBanUser(user.id, user.email)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "6px" }}
                            title="Ban user account"
                          >
                            <HugeiconsIcon icon={Delete01Icon} size={15} color="var(--admin-danger)" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-muted)" }}>
                    No users match the search criteria.
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
