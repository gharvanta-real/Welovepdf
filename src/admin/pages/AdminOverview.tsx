import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MetricCard } from "../components/MetricCard";
import {
  CpuIcon,
  DatabaseIcon,
  Clock01Icon,
  HourglassIcon,
  Delete01Icon,
  Settings01Icon,
  CheckCircle,
  AlertCircleIcon
} from "@hugeicons/core-free-icons";

export function AdminOverview() {
  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramLoad, setRamLoad] = useState(0);
  const [diskUsage, setDiskUsage] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [avgProcessingTime, setAvgProcessingTime] = useState("0 seconds");
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/admin/overview", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setCpuLoad(data.cpu_load ?? 0);
            setRamLoad(data.ram_load ?? 0);
            setDiskUsage(data.disk_usage ?? 0);
            setActiveJobsCount(data.active_jobs_count ?? 0);
            setAvgProcessingTime(data.avg_processing_time ?? "N/A");
            setRecentJobs(data.recent_jobs ?? []);
            setIsMaintenance(data.is_maintenance ?? false);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching admin overview:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // ── Real workspace clear via API ────────────────────────────────────────
  const handleClearWorkspace = async () => {
    setIsClearing(true);
    triggerToast("Initiating volatile workspace cleanup...");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/system/clear-workspace", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const gb = (data.cleared_gb as number).toFixed(2);
        const files = data.cleared_files;
        triggerToast(`Workspace purged! ${files} files (${gb} GB) cleared.`);
        setDiskUsage(0);
      } else {
        triggerToast("Error: Could not clear workspace.");
      }
    } catch (err) {
      triggerToast("Network error clearing workspace.");
    } finally {
      setIsClearing(false);
    }
  };

  // ── Real maintenance mode toggle via API ────────────────────────────────
  const handleToggleMaintenance = async () => {
    const newState = !isMaintenance;
    setIsTogglingMaintenance(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/system/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: newState })
      });
      if (res.ok) {
        setIsMaintenance(newState);
        triggerToast(
          newState
            ? "Maintenance Mode activated. Public uploads will receive 503."
            : "Maintenance Mode deactivated. All systems operational."
        );
      } else {
        triggerToast("Failed to toggle maintenance mode.");
      }
    } catch (err) {
      triggerToast("Network error toggling maintenance mode.");
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-overview-page">
        <div className="admin-metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: "100px",
              borderRadius: "10px",
              backgroundColor: "var(--admin-surface-low)",
              animation: "pulse 1.5s infinite"
            }} />
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
          Loading system metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overview-page">
      {/* Toast Alert */}
      {toastMessage && (
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
          {toastMessage}
        </div>
      )}

      {/* Overview Metric Row */}
      <div className="admin-metrics-grid">
        <MetricCard
          title="CPU Core Load"
          value={`${cpuLoad.toFixed(1)}%`}
          icon={CpuIcon}
          change={{ value: "Live system data", isPositive: cpuLoad < 80 }}
          period="Real-time"
        />
        <MetricCard
          title="Temp Disk Workspace"
          value={`${diskUsage.toFixed(2)} GB`}
          icon={DatabaseIcon}
          change={{ value: `Temp output files`, isPositive: diskUsage < 15 }}
          period="Work directory"
        />
        <MetricCard
          title="Concurrent Active Jobs"
          value={activeJobsCount}
          icon={Clock01Icon}
          change={{ value: "Queue status healthy", isPositive: true }}
          period="Current moment"
        />
        <MetricCard
          title="Avg Processing Time"
          value={avgProcessingTime}
          icon={HourglassIcon}
          change={{ value: "CLI engine optimized", isPositive: true }}
          period="Last 24 hours"
        />
      </div>

      <div className="admin-overview-grid">
        {/* Left Side: Recent Active Jobs Table */}
        <div className="admin-card-section">
          <h2>Active Queue & Recent Actions</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Tool Type</th>
                  <th>User Email</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => (
                  <tr key={job.id}>
                    <td className="text-xs" style={{ fontFamily: "monospace" }}>{job.id.substring(0, 8)}...</td>
                    <td style={{ fontWeight: 500 }}>{job.tool_id.toUpperCase().replace(/_/g, " ")}</td>
                    <td>{job.user_email}</td>
                    <td>{formatBytes(job.bytes)}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: job.status === "completed"
                            ? "var(--admin-success)"
                            : job.status === "processing"
                              ? "var(--admin-accent)"
                              : "var(--admin-danger)"
                        }}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary">{formatDate(job.created_at)}</td>
                  </tr>
                ))}
                {recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-secondary)", padding: "24px" }}>
                      No jobs have been processed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: System Controls & Health Status */}
        <div className="admin-card-section" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2>System Infrastructure</h2>

          <div className="admin-system-health">
            <div className="admin-health-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Memory Allocation (RAM)</span>
                <strong>{ramLoad.toFixed(1)}%</strong>
              </div>
              <div className="admin-progress-track">
                <div
                  className={`admin-progress-fill ${ramLoad > 85 ? "danger" : ramLoad > 65 ? "warning" : ""}`}
                  style={{ width: `${Math.min(ramLoad, 100)}%` }}
                />
              </div>
            </div>

            <div className="admin-health-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CPU Utilization</span>
                <strong>{cpuLoad.toFixed(1)}%</strong>
              </div>
              <div className="admin-progress-track">
                <div
                  className={`admin-progress-fill ${cpuLoad > 90 ? "danger" : cpuLoad > 70 ? "warning" : "success"}`}
                  style={{ width: `${Math.min(cpuLoad, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--admin-border-subtle)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3>Administrative Commands</h3>

            <button
              onClick={handleClearWorkspace}
              disabled={isClearing}
              className="admin-btn admin-btn-secondary"
              style={{ width: "100%", justifyContent: "flex-start", opacity: isClearing ? 0.7 : 1 }}
            >
              <HugeiconsIcon icon={Delete01Icon} size={18} />
              {isClearing ? "Clearing..." : "Clear Volatile Workspace Directory"}
            </button>

            <button
              onClick={handleToggleMaintenance}
              disabled={isTogglingMaintenance}
              className={`admin-btn ${isMaintenance ? "admin-btn-primary" : "admin-btn-secondary"}`}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                backgroundColor: isMaintenance ? "var(--admin-danger)" : "",
                opacity: isTogglingMaintenance ? 0.7 : 1
              }}
            >
              <HugeiconsIcon icon={Settings01Icon} size={18} />
              {isTogglingMaintenance
                ? "Updating..."
                : isMaintenance
                  ? "Disable Maintenance Mode"
                  : "Activate Maintenance Mode"}
            </button>
          </div>

          <div
            style={{
              backgroundColor: "var(--admin-surface-low)",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <HugeiconsIcon
              icon={isMaintenance ? AlertCircleIcon : CheckCircle}
              size={20}
              color={isMaintenance ? "var(--admin-warning)" : "var(--admin-success)"}
            />
            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
              {isMaintenance
                ? "Maintenance is active. Public uploads will receive a 503 Service Unavailable code."
                : "Engine status normal. All systems functional. CLI tools (qpdf, poppler) are fully operational."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
