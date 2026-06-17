import { Download, MoreHorizontal } from "lucide-react";
import { ToolIcon } from "./ToolIcon";

type JobStatus = "Done" | "Processing" | "Queued";

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
};

export function RecentJobs({ jobs }: RecentJobsProps) {
  function handleDownload(job: Job) {
    if (job.downloadUrl) {
      const link = document.createElement("a");
      link.href = job.downloadUrl;
      link.download = job.file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <section className="panel compact" id="jobs">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Recent jobs</p>
          <h2>Processing queue</h2>
        </div>
        <button className="quiet-button">View all</button>
      </div>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "24px 0" }}>
            No jobs in this session. Select a tool and choose files above to run a job.
          </p>
        ) : (
          jobs.map((job) => (
            <article className="job-row" key={job.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ToolIcon toolNameOrId={job.tool} size={20} style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <strong>{job.tool}</strong>
                  <span>{job.file} · {job.size}</span>
                </div>
              </div>
              <span className="status" data-status={job.status.toLowerCase()}>
                {job.status}
              </span>
              <button 
                className="icon-button" 
                aria-label={`Download ${job.file}`}
                onClick={() => handleDownload(job)}
                disabled={job.status !== "Done"}
                style={{
                  opacity: job.status === "Done" ? 1 : 0.4,
                  cursor: job.status === "Done" ? "pointer" : "not-allowed"
                }}
              >
                <Download size={17} />
              </button>
              <button className="icon-button" aria-label={`More actions for ${job.file}`}>
                <MoreHorizontal size={17} />
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

