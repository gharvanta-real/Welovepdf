import React, { useState, useEffect } from "react";
import { MetricCard } from "../components/MetricCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckCircle,
  DatabaseIcon,
  HelpCircleIcon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons";

export function AdminToolStats() {
  const [totalProcesses, setTotalProcesses] = useState(0);
  const [totalBandwidthGb, setTotalBandwidthGb] = useState(0);
  const [successRate, setSuccessRate] = useState(100.0);
  const [toolStats, setToolStats] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchToolStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin/tool-stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTotalProcesses(data.total_processes || 0);
        setTotalBandwidthGb(data.total_bandwidth_gb || 0.0);
        setSuccessRate(data.success_rate || 100.0);
        setToolStats(data.tool_performance || []);
        setErrorLogs(data.error_logs || []);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching tool stats:", err);
    }
  };

  useEffect(() => {
    fetchToolStats();
  }, []);

  const maxCount = toolStats.length > 0 ? Math.max(...toolStats.map(t => t.count)) : 0;

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="admin-tool-stats-page">
      {/* Tool metrics */}
      <div className="admin-metrics-grid">
        <MetricCard 
          title="Total PDF Processes" 
          value={totalProcesses.toLocaleString()} 
          icon={CheckCircle} 
          change={{ value: "Process engine active", isPositive: true }}
          period="Cumulative"
        />
        <MetricCard 
          title="Processed Bandwidth" 
          value={`${totalBandwidthGb.toFixed(2)} GB`} 
          icon={DatabaseIcon} 
          change={{ value: "Accumulated file sizes", isPositive: true }}
          period="Network payload"
        />
        <MetricCard 
          title="Engine Success Rate" 
          value={`${successRate.toFixed(1)}%`} 
          icon={CheckCircle} 
          change={{ value: "Health threshold verified", isPositive: successRate > 95 }}
          period="Engine compilation"
        />
      </div>

      <div className="admin-charts-container">
        {/* Left column: Tool Popularity Chart */}
        <div className="admin-card-section">
          <h2>Tool Popularity & Volumetrics</h2>
          <span className="text-xs text-secondary">Number of files processed by each tool ID</span>
          
          <div className="chart-bar-list" style={{ marginTop: "16px" }}>
            {toolStats.map((tool, idx) => {
              const percentage = maxCount > 0 ? (tool.count / maxCount) * 100 : 0;
              const name = tool.tool_id.toUpperCase().replace("_", " ");
              return (
                <div key={idx} className="chart-bar-row">
                  <span className="chart-bar-label" title={name}>{name}</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="chart-bar-value">{tool.count}</span>
                </div>
              );
            })}
            {toolStats.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--admin-text-secondary)", padding: "40px 0" }}>
                No tool usage stats logged in database yet.
              </div>
            )}
          </div>
        </div>

        {/* Right column: System error logs terminal */}
        <div className="admin-card-section" style={{ display: "flex", flexDirection: "column" }}>
          <h2>Engine logs & diagnostic output</h2>
          <span className="text-xs text-secondary" style={{ marginBottom: "16px" }}>Terminal capture of stderr/stdout from CLI tools</span>
          
          <div className="admin-terminal" style={{ flex: 1, minHeight: "260px" }}>
            {errorLogs.map((log, idx) => (
              <div 
                key={idx} 
                className="admin-terminal-line error"
              >
                [{formatDate(log.created_at)}] [{log.tool_id.toUpperCase()}] ERROR: {log.error_message} (Job: {log.id})
              </div>
            ))}
            {errorLogs.length === 0 && (
              <div className="admin-terminal-line info">
                [SYSTEM LOGS] All systems functional. Stderr terminal trace is clean.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
