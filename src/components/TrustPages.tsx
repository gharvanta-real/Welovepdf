import { Shield, Lock, CheckCircle, Mail, EyeOff, Trash2, Clock, Server } from "lucide-react";

interface PageProps {
  onBack: () => void;
}

/* ─── Shared page shell ─── */
function PageShell({
  title,
  subtitle,
  effectiveDate,
  illustration,
  children,
}: {
  title: string;
  subtitle: string;
  effectiveDate?: string;
  illustration: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="stitch-landing-v2 theme-blue"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "var(--v2-text-main)",
        fontFamily: "var(--v2-font-sans)",
        paddingBottom: "100px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Hero */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "48px",
            padding: "64px 0 56px",
            borderBottom: "1px solid var(--v2-border)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                lineHeight: 1.15,
                color: "var(--v2-text-main)",
                margin: "0 0 16px",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--v2-text-muted)",
                lineHeight: 1.65,
                margin: "0 0 20px",
                maxWidth: "520px",
              }}
            >
              {subtitle}
            </p>
            {effectiveDate && (
              <p style={{ fontSize: "13px", color: "var(--v2-text-light)", margin: 0 }}>
                {effectiveDate}
              </p>
            )}
          </div>
          <img
            src={illustration}
            alt={title}
            style={{ width: "clamp(160px, 20vw, 280px)", objectFit: "contain" }}
          />
        </div>

        {/* Body */}
        {children}

      </div>
    </div>
  );
}

/* ─── Shared Section Row ─── */
function SectionRow({
  index,
  icon: Icon,
  title,
  body,
  email,
  isLast,
}: {
  index: number;
  icon: any;
  title: string;
  body: string;
  email?: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr",
        gap: "20px",
        padding: "36px 0",
        borderBottom: isLast ? "none" : "1px solid var(--v2-border)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          backgroundColor: "var(--v2-primary-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <Icon size={18} style={{ color: "var(--v2-primary)" }} />
      </div>
      <div>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--v2-text-main)", margin: "0 0 10px" }}>
          {index}. {title}
        </h2>
        <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
          {body}
        </p>
        {email && (
          <a
            href={`mailto:${email}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "12px",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--v2-primary)",
              textDecoration: "none",
            }}
          >
            <Mail size={15} /> {email}
          </a>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   1. Security Page
══════════════════════════════ */
export function SecurityPage({ onBack }: PageProps) {
  const sections = [
    {
      icon: Lock,
      title: "Temporary Processing Workspaces",
      body: "Files you upload are processed inside ephemeral, temporary server workspaces. Unlike cloud storage services that index or save documents, we hold your file only during the operation you request. Once completed, it is immediately queued for deletion.",
    },
    {
      icon: Shield,
      title: "Encrypted Connections (TLS / HTTPS)",
      body: "Every file transferred between your browser and our servers is encrypted using industry-standard HTTPS/TLS. Your documents travel in a fully encrypted tunnel — protected from any network interception or man-in-the-middle attacks.",
    },
    {
      icon: Server,
      title: "No Third-Party Cloud Services",
      body: "We run all file rendering and conversions on our own secure, self-managed servers. Your documents are never forwarded to external APIs, third-party cloud processors, or commercial rendering suites. Your data stays within our secure infrastructure boundaries.",
    },
    {
      icon: CheckCircle,
      title: "Automated Rate Limiting",
      body: "To protect our servers and all users from abuse, we enforce automated rate limits per IP address. This prevents bots, scrapers, and malicious actors from overloading the service while ensuring fair access for legitimate users.",
    },
    {
      icon: Mail,
      title: "Got Security Questions?",
      body: "If you have any questions about our hosting, infrastructure, or security practices, reach out to our team directly.",
      email: "support@pdfmount.online",
    },
  ];

  return (
    <PageShell

      title="Security Policy"
      subtitle="How we protect your documents with absolute data isolation, encrypted connections, and automated server purges."
      effectiveDate="Last updated: June 2025"
      illustration="/illus-security.png"
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sections.map((s, i) => (
          <SectionRow
            key={i}
            index={i + 1}
            icon={s.icon}
            title={s.title}
            body={s.body}
            email={s.email}
            isLast={i === sections.length - 1}
          />
        ))}
      </div>
    </PageShell>
  );
}

/* ══════════════════════════════
   2. File Privacy Page
══════════════════════════════ */
export function FilePrivacyPage({ onBack }: PageProps) {
  const sections = [
    {
      icon: Lock,
      title: "Client-Side Processing Where Possible",
      body: "Whenever possible, PDFMount runs processing tools directly inside your web browser using client-side WebAssembly code. This means tasks like rotating, rearranging, or deleting pages happen entirely on your device — your files never even travel to our servers.",
    },
    {
      icon: EyeOff,
      title: "Fully Automated — No Human Surveillance",
      body: "We do not open, read, or catalog your files. All operations are handled entirely by automated scripts. No employee, engineer, or third party ever views your documents. Your files are automatically parsed, processed, and immediately returned to your browser.",
    },
    {
      icon: Trash2,
      title: "Manual and Automatic Deletion Controls",
      body: "Once you download your processed document, you can click \"Delete file now\" in the dashboard to wipe it from our servers immediately. If you forget, our automated cleanup system removes all files after exactly 60 minutes — no exceptions.",
    },
    {
      icon: Shield,
      title: "No File Indexing or Cataloguing",
      body: "We do not build any database of your uploaded files, their names, their contents, or their metadata. Files are stored only in a temporary processing folder with a random UUID identifier — completely disconnected from your identity.",
    },
    {
      icon: Mail,
      title: "Questions About File Privacy?",
      body: "If you have any concerns about how your documents are handled on our platform, reach out anytime.",
      email: "support@pdfmount.online",
    },
  ];

  return (
    <PageShell

      title="File Privacy"
      subtitle="Your documents contain sensitive details, contracts, and personal information. We guarantee you retain total control over who can access them."
      effectiveDate="Last updated: June 2025"
      illustration="/illus-privacy.png"
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sections.map((s, i) => (
          <SectionRow
            key={i}
            index={i + 1}
            icon={s.icon}
            title={s.title}
            body={s.body}
            email={s.email}
            isLast={i === sections.length - 1}
          />
        ))}
      </div>
    </PageShell>
  );
}

/* ══════════════════════════════
   3. Data Deletion Page
══════════════════════════════ */
export function DataDeletionPage({ onBack }: PageProps) {
  const sections = [
    {
      icon: Clock,
      title: "Automatic Deletion After 1 Hour",
      body: "We run an automated cleanup script on our servers every hour. This script completely wipes all uploaded files, in-progress jobs, and output files that are older than 60 minutes. Once deleted, these files cannot be recovered by anyone — including our own team.",
    },
    {
      icon: Trash2,
      title: "Instant Manual Deletion",
      body: "If you prefer not to wait for the automatic cleanup, you can click the trash icon next to your completed file in the app dashboard. This triggers an immediate deletion of all your associated files from our storage disks — no delay.",
    },
    {
      icon: Shield,
      title: "Account Deletion",
      body: "If you choose to delete your account from your settings dashboard, we immediately remove all your personal details, email address, usage logs, and account history from our database. No archived copies are retained.",
    },
    {
      icon: Lock,
      title: "What We Retain (And Why)",
      body: "We only retain basic anonymous server logs (IP address, browser type, request timestamps) for up to 30 days, strictly to prevent abuse and enforce fair usage limits. These logs do not contain any file contents or identifiable personal data beyond what is standard for web servers.",
    },
    {
      icon: Mail,
      title: "Data Deletion Requests",
      body: "If you want to request manual deletion of any data tied to your account or email, contact us and we will action it within 48 hours.",
      email: "support@pdfmount.online",
    },
  ];

  return (
    <PageShell

      title="Data Deletion Policy"
      subtitle="We only keep the minimum details necessary to run our services. We never save your processed files, and we give you full control to delete your data instantly."
      effectiveDate="Last updated: June 2025"
      illustration="/illus-security.png"
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sections.map((s, i) => (
          <SectionRow
            key={i}
            index={i + 1}
            icon={s.icon}
            title={s.title}
            body={s.body}
            email={s.email}
            isLast={i === sections.length - 1}
          />
        ))}
      </div>
    </PageShell>
  );
}
