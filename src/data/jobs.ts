export type JobStatus = "Done" | "Processing" | "Queued";

export type Job = {
  id: string;
  tool: string;
  file: string;
  size: string;
  status: JobStatus;
};

export const recentJobs: Job[] = [
  { id: "J-1042", tool: "Compress PDF", file: "exam-form.pdf", size: "1.8 MB", status: "Done" },
  { id: "J-1041", tool: "JPG to PDF", file: "marksheets.zip", size: "4.2 MB", status: "Processing" },
  { id: "J-1040", tool: "Merge PDF", file: "kyc-docs.pdf", size: "900 KB", status: "Queued" },
];
