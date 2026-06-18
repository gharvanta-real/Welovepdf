import React from "react";
import { Shield, Lock, Trash2, ArrowLeft, CheckCircle, Mail, EyeOff } from "lucide-react";

interface PageProps {
  onBack: () => void;
}

export function SecurityPage({ onBack }: PageProps) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 100px", fontFamily: "Plus Jakarta Sans, sans-serif", color: "#1f2937" }}>
      <button 
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#4b5563", fontSize: "15px", cursor: "pointer", marginBottom: "32px", padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
          <Shield size={28} />
        </div>
        <div>
          <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#10b981", letterSpacing: "1px", textTransform: "uppercase" }}>TRUST & COMPLIANCE</span>
          <h1 style={{ fontSize: "36px", fontWeight: 340, color: "#111827", margin: 0, letterSpacing: "-1px" }}>Security Policy</h1>
        </div>
      </div>

      <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#4b5563", marginBottom: "40px", fontWeight: 320 }}>
        At PDFMount, security isn't an afterthought; it is our foundation. We process your pages with a commitment to absolute data isolation, secure encryption, and zero server persistence.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={18} style={{ color: "#10b981" }} /> 1. Volatile In-Memory Sandboxing
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            Files processed by our conversion and engineering tools are processed in ephemeral server instances. Unlike typical cloud suites that index documents, PDFMount writes files into temporary memory workspaces. The moment your task completes, the original uploads are closed and queueing keys are scheduled for deletion.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={18} style={{ color: "#10b981" }} /> 2. Transport Layer Security (TLS)
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            All documents uploaded to PDFMount are encrypted in transit using industry-standard HTTPS (TLS 1.3). This prevents any potential eavesdropping or data interception by third parties on public networks. Your files travel directly to our secure APIs and nowhere else.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} style={{ color: "#10b981" }} /> 3. No Third-Party Data Handover
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            We strictly enforce a policy of zero vendor dependencies for core file rendering. We run our own Rust backend, SQLite instance, and local scripts under sandboxed environments. Your files are never sent to external APIs, translators, or commercial parsers.
          </p>
        </section>

        <section style={{ background: "rgba(243, 244, 246, 0.5)", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginTop: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: "8px" }}>Security Questions?</h3>
          <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#4b5563", margin: "0 0 16px" }}>
            If you have questions about our infrastructure, audits, or enterprise security options, reach out to our support team.
          </p>
          <a href="mailto:support@gharvanta.in" style={{ fontSize: "14px", fontWeight: 600, color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <Mail size={14} /> support@gharvanta.in
          </a>
        </section>
      </div>
    </div>
  );
}

export function FilePrivacyPage({ onBack }: PageProps) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 100px", fontFamily: "Plus Jakarta Sans, sans-serif", color: "#1f2937" }}>
      <button 
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#4b5563", fontSize: "15px", cursor: "pointer", marginBottom: "32px", padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
          <EyeOff size={28} />
        </div>
        <div>
          <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#6366f1", letterSpacing: "1px", textTransform: "uppercase" }}>GUARANTEED PRIVACY</span>
          <h1 style={{ fontSize: "36px", fontWeight: 340, color: "#111827", margin: 0, letterSpacing: "-1px" }}>File Privacy</h1>
        </div>
      </div>

      <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#4b5563", marginBottom: "40px", fontWeight: 320 }}>
        Your files contain sensitive personal data, contracts, and finances. We believe you should maintain 100% ownership and control over who accesses them.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            🔒 Client-Side Prioritization
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            Whenever possible, PDFMount utilizes client-side WebAssembly to execute page rearrangements, rotations, merges, and minor tasks directly inside your browser. This means your files do not even travel across the network, ensuring complete offline privacy.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            🚫 Zero Human Surveillance
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            We do not index, analyze, or categorize the contents of your files. All processes are automated. No employee, engineer, or third party has visual access to your documents. The files are parsed solely by our system engines and converted output is immediately piped back to you.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            📁 Document Security Controls
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            Once you download your processed document, you can click "Delete file now" in the dashboard or workspace to wipe it immediately. If you forget, our server purges all remnants after exactly 1 hour.
          </p>
        </section>
      </div>
    </div>
  );
}

export function DataDeletionPage({ onBack }: PageProps) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 100px", fontFamily: "Plus Jakarta Sans, sans-serif", color: "#1f2937" }}>
      <button 
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#4b5563", fontSize: "15px", cursor: "pointer", marginBottom: "32px", padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
          <Trash2 size={28} />
        </div>
        <div>
          <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#ef4444", letterSpacing: "1px", textTransform: "uppercase" }}>PURGE STANDARDS</span>
          <h1 style={{ fontSize: "36px", fontWeight: 340, color: "#111827", margin: 0, letterSpacing: "-1px" }}>Data Deletion Policy</h1>
        </div>
      </div>

      <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#4b5563", marginBottom: "40px", fontWeight: 320 }}>
        We store only the bare minimum operational log metadata necessary to enforce plan limits. We never keep your processed documents or assets.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            ⏱️ 60-Minute Automated Cron
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            Every hour, an automated cleanup script scans our volatile scratch workspace and purges all file uploads, working intermediates, and compiled outputs that are older than 60 minutes. Once deleted, they are unrecoverable.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            ⚡ Immediate Manual Deletion
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            Don't want to wait 60 minutes? In the completed job panel, click the trash/delete icon next to your file. Our system immediately deletes the workspace files and folder from the storage disk.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            🧹 Account Deletion
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#4b5563", margin: 0, fontWeight: 320 }}>
            If you delete your PDFMount account from the account dashboard settings, all associated email registries, history metadata logs, and subscriptions are purged from our database immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
