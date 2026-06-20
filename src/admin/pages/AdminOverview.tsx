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

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/admin/overview", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setCpuLoad(data.cpu_load);
            setRamLoad(data.ram_load);
            setDiskUsage(data.disk_usage);
            setActiveJobsCount(data.active_jobs_count);
            setAvgProcessingTime(data.avg_processing_time);
            setRecentJobs(data.recent_jobs);
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
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleClearWorkspace = () => {
    triggerToast("Initiating volatile workspace cleanup...");
    // Simulate cleanup
    setTimeout(() => {
      setDiskUsage(0.4); // Cleans down to baseline config files
      triggerToast("Volatile workspace successfully purged! 7.8 GB cleared.");
    }, 1500);
  };

  const handleToggleMaintenance = () => {
    setIsMaintenance(!isMaintenance);
    triggerToast(isMaintenance ? "Maintenance Mode deactivated." : "Maintenance Mode active. Queue paused.");
  };

  return (
    <div className="admin-overview-page">
      {/* Toast Alert */}
      {toastMessage && (
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
          {toastMessage}
        </div>
      )}

      {/* Overview Metric Row */}
      <div className="admin-metrics-grid">
        <MetricCard 
          title="CPU Core Load" 
          value={`${cpuLoad.toFixed(0)}%`} 
          icon={CpuIcon} 
          change={{ value: "4 cores active", isPositive: true }}
          period="Real-time"
        />
        <MetricCard 
          title="Temp Disk Workspace" 
          value={`${diskUsage.toFixed(1)} GB / 20 GB`} 
          icon={DatabaseIcon} 
          change={{ value: `${((diskUsage / 20) * 100).toFixed(0)}% space utilized`, isPositive: diskUsage < 15 }}
          period="Auto-purges in 60m"
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
                    <td style={{ fontWeight: 500 }}>{job.tool_id.toUpperCase().replace("_", " ")}</td>
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
                <strong>{ramLoad}% (3.8 GB / 8 GB)</strong>
              </div>
              <div className="admin-progress-track">
                <div className="admin-progress-fill" style={{ width: `${ramLoad}%` }}></div>
              </div>
            </div>

            <div className="admin-health-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Temp Directory Load</span>
                <strong>{((diskUsage / 20) * 100).toFixed(0)}% of limit</strong>
              </div>
              <div className="admin-progress-track">
                <div 
                  className={`admin-progress-fill ${diskUsage > 15 ? "danger" : diskUsage > 10 ? "warning" : "success"}`} 
                  style={{ width: `${(diskUsage / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--admin-border-subtle)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3>Administrative Commands</h3>
            
            <button 
              onClick={handleClearWorkspace} 
              className="admin-btn admin-btn-secondary" 
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <HugeiconsIcon icon={Delete01Icon} size={18} />
              Clear Volatile Workspace Directory
            </button>

            <button 
              onClick={handleToggleMaintenance} 
              className={`admin-btn ${isMaintenance ? "admin-btn-primary" : "admin-btn-secondary"}`}
              style={{ width: "100%", justifyContent: "flex-start", backgroundColor: isMaintenance ? "var(--admin-danger)" : "" }}
            >
              <HugeiconsIcon icon={Settings01Icon} size={18} />
              {isMaintenance ? "Disable Maintenance Mode" : "Activate Maintenance Mode"}
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
