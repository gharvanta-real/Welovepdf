import { Shield, Lock, CheckCircle, Mail, EyeOff, Trash2, Clock } from "lucide-react";

interface PageProps {
  onBack: () => void;
}

export function SecurityPage({ onBack }: PageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Trust & Compliance
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Security Policy
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            How we protect your documents with absolute data isolation, secure connections, and automated server purges.
          </p>
        </div>

        {/* Flat Content Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={20} style={{ color: "var(--v2-primary)" }} /> 1. Temporary Processing
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Files you upload are processed in ephemeral, temporary memory workspaces. Unlike typical cloud storage services that index or save your documents, we only hold them while performing the action you request. Once completed, your files are marked for immediate deletion.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={20} style={{ color: "var(--v2-primary)" }} /> 2. Secure Connections (TLS)
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Every file you upload to PDFMount is encrypted in transit using industry-standard secure HTTPS connections. This means your files travel safely between your web browser and our servers, completely protected from any network intercepts.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle size={20} style={{ color: "var(--v2-primary)" }} /> 3. No Third-Party Tools
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              We run all our file rendering and conversions locally on our own secure servers. Your documents are never sent to external APIs, translators, or commercial third-party rendering suites. Your data stays entirely within our secure software borders.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              Got Security Questions?
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              If you have any questions about our hosting, security practices, or server infrastructure, please reach out to our team at:
            </p>
            <a href="mailto:support@pdfmount.online" style={{ fontSize: "15px", fontWeight: 600, color: "var(--v2-primary)", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <Mail size={16} /> support@pdfmount.online
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

export function FilePrivacyPage({ onBack }: PageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Guaranteed Privacy
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            File Privacy
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Your documents contain sensitive details, contracts, and personal info. We guarantee you retain total control over who can access them.
          </p>
        </div>

        {/* Flat Content Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={20} style={{ color: "var(--v2-primary)" }} /> 1. Running Tools in Your Browser
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Whenever possible, PDFMount runs processing tools directly inside your web browser using client-side code. This means tasks like rotating, rearranging, or deleting pages happen entirely on your computer, and your files never even need to travel to our servers.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <EyeOff size={20} style={{ color: "var(--v2-primary)" }} /> 2. Automated Processing (No Human Surveillance)
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              We do not open, check, or catalog your files. All operations are completely handled by automatic scripts. No employee, engineer, or third party ever looks at your documents. Your files are automatically parsed by our script engines, processed, and immediately sent back to you.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Trash2 size={20} style={{ color: "var(--v2-primary)" }} /> 3. Deletion Controls
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Once you download your processed document, you can click "Delete file now" in the dashboard to delete it immediately. If you forget, don't worry—our servers automatically clear all cache folders after exactly 1 hour.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export function DataDeletionPage({ onBack }: PageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Purge Standards
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Data Deletion Policy
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            We only keep the minimum details necessary to run our services and enforce plan limits. We never save your processed files.
          </p>
        </div>

        {/* Flat Content Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={20} style={{ color: "var(--v2-primary)" }} /> 1. Automatic Deletion after 1 Hour
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              We run an automated cleaner script on our servers every hour. This script completely deletes all uploaded files, work in progress, and outputs that are older than 60 minutes. Once deleted, these files cannot be recovered.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Trash2 size={20} style={{ color: "var(--v2-primary)" }} /> 2. Instant Manual Deletion
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              If you prefer not to wait for the automatic cleaner, you can click the trash icon next to your completed file in the app. This deletes all your files from our storage disks immediately.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={20} style={{ color: "var(--v2-primary)" }} /> 3. Account Deletion
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              If you choose to delete your account from your settings dashboard, we delete all your details, email address, logs, and account history from our database immediately.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
