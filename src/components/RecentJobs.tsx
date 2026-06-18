import React, { useState } from "react";
import { Download, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { ToolIcon } from "./ToolIcon";

type JobStatus = "Done" | "Processing" | "Queued" | "Failed";

type Job = {
  id: string;
  tool: string;
  file: string;
  size: string;
  status: JobStatus;
  downloadUrl?: string;
};

type RecentJobsProps = {
  jobs: Job[];
  onRetry?: (job: Job) => void;
  onDeleteJob?: (jobId: string) => void;
};

export function RecentJobs({ jobs, onRetry, onDeleteJob }: RecentJobsProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredBtnId, setHoveredBtnId] = useState<string | null>(null);

  function handleDownload(job: Job) {
    if (job.downloadUrl) {
      const link = document.createElement("a");
      link.href = job.downloadUrl;
      
      let downloadName = job.file;
      if (job.downloadUrl.toLowerCase().endsWith(".zip")) {
        if (downloadName.toLowerCase().endsWith(".pdf")) {
          downloadName = downloadName.slice(0, -4) + ".zip";
        } else if (!downloadName.toLowerCase().endsWith(".zip")) {
          downloadName = downloadName + ".zip";
        }
      }
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <section className="recent-jobs-section" id="jobs">
      <div className="recent-jobs-header">
        <div>
          <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>
            Recent jobs
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: 340, letterSpacing: "-0.5px", margin: "6px 0 0 0", color: "var(--s-primary)" }}>
            Processing queue
          </h2>
        </div>
      </div>
      
      <div className="recent-jobs-list">
        {jobs.length === 0 ? (
          <p className="recent-jobs-empty">
            No jobs in this session. Select a tool and choose files above to run a job.
          </p>
        ) : (
          jobs.map((job) => {
            const isRowHovered = hoveredRowId === job.id;
            return (
              <article 
                key={job.id}
                className="recent-job-row"
                onMouseEnter={() => setHoveredRowId(job.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                style={{ 
                  border: isRowHovered ? "1px solid var(--s-primary)" : "1px solid var(--s-hairline)",
                  backgroundColor: isRowHovered ? "var(--s-surface-low)" : "#ffffff",
                  transform: isRowHovered ? "translateY(-1px)" : "translateY(0)"
                }}
              >
                {/* Left: Icon + info */}
                <div className="recent-job-info">
                  <ToolIcon toolNameOrId={job.tool} size={20} style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0 }} />
                  <div className="recent-job-text">
                    <strong style={{ fontSize: "15px", fontWeight: "600", color: "var(--s-primary)", margin: 0 }}>{job.tool}</strong>
                    <span className="recent-job-meta">{job.file} · {job.size}</span>
                  </div>
                </div>
                
                {/* Right: Status + Actions */}
                <div className="recent-job-actions">
                  <span className="status" data-status={job.status.toLowerCase()}>
                    {job.status}
                  </span>

                  {job.status === "Failed" ? (
                    <button 
                      aria-label={`Retry ${job.file}`}
                      onClick={() => onRetry && onRetry(job)}
                      onMouseEnter={() => setHoveredBtnId(`${job.id}-retry`)}
                      onMouseLeave={() => setHoveredBtnId(null)}
                      className="recent-job-btn"
                      style={{
                        background: hoveredBtnId === `${job.id}-retry` ? "var(--s-surface-low)" : "transparent",
                        cursor: "pointer",
                        color: "#c62828",
                      }}
                    >
                      <RefreshCw size={16} />
                    </button>
                  ) : (
                    <button 
                      aria-label={`Download ${job.file}`}
                      onClick={() => handleDownload(job)}
                      disabled={job.status !== "Done"}
                      onMouseEnter={() => setHoveredBtnId(`${job.id}-dl`)}
                      onMouseLeave={() => setHoveredBtnId(null)}
                      className="recent-job-btn"
                      style={{
                        background: hoveredBtnId === `${job.id}-dl` ? "var(--s-surface-low)" : "transparent",
                        cursor: job.status === "Done" ? "pointer" : "not-allowed",
                        opacity: job.status === "Done" ? 1 : 0.3,
                      }}
                    >
                      <Download size={16} />
                    </button>
                  )}

                  {(job.status === "Done" || job.status === "Failed") && (
                    <button 
                      aria-label={`Delete ${job.file} permanently`}
                      onClick={() => onDeleteJob && onDeleteJob(job.id)}
                      onMouseEnter={() => setHoveredBtnId(`${job.id}-del`)}
                      onMouseLeave={() => setHoveredBtnId(null)}
                      className="recent-job-btn"
                      style={{
                        background: hoveredBtnId === `${job.id}-del` ? "var(--s-surface-low)" : "transparent",
                        cursor: "pointer",
                        color: "#ef4444",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <button 
                    aria-label={`More actions for ${job.file}`}
                    onMouseEnter={() => setHoveredBtnId(`${job.id}-more`)}
                    onMouseLeave={() => setHoveredBtnId(null)}
                    className="recent-job-btn"
                    style={{
                      background: hoveredBtnId === `${job.id}-more` ? "var(--s-surface-low)" : "transparent",
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
