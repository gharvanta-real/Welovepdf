import { useState } from "react";
import { Header } from "./components/Header";
import { RecentJobs } from "./components/RecentJobs";
import { UploadPanel } from "./components/UploadPanel";
import { LandingPage } from "./components/LandingPage";
import { LoginModal } from "./components/LoginModal";
import { AccountDrawer } from "./components/AccountDrawer";
import { PricingPage } from "./components/PricingPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { TermsPage } from "./components/TermsPage";
import { FaqPage } from "./components/FaqPage";
import { ContactPage } from "./components/ContactPage";

export function App() {
  const [theme, setTheme] = useState<"white" | "light" | "dark">("white");
  const [selectedTool, setSelectedTool] = useState("Compress PDF");
  const [toast, setToast] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "workspace" | "pricing" | "privacy" | "terms" | "faq" | "contact">("home");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [hasStagedFiles, setHasStagedFiles] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; plan?: string } | null>(null);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  function formatBytes(bytes: number, decimals = 1) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  async function handleUpload(files: FileList, options?: any) {
    if (!files || files.length === 0) return;

    const totalSizeBytes = Array.from(files).reduce((acc, f) => acc + f.size, 0);
    const limitBytes = 50 * 1024 * 1024; // 50 MB
    if (totalSizeBytes > limitBytes) {
      setToast("Server load thoda high hai, Bhai! Free servers enforce a 50 MB limit to ensure fair usage.");
      window.setTimeout(() => setToast(""), 5000);
      return;
    }

    let endpoint = "";
    if (selectedTool === "Merge PDF") {
      endpoint = "/upload/merge-pdf";
    } else if (selectedTool === "Compress PDF") {
      endpoint = "/upload/compress";
    } else if (selectedTool === "JPG to PDF") {
      endpoint = "/upload/jpg-to-pdf";
    } else if (selectedTool === "PDF to JPG") {
      endpoint = "/upload/pdf-to-jpg";
    } else {
      const toolId = selectedTool.toLowerCase().replace(/\s+/g, "-");
      endpoint = `/upload/${toolId}`;
    }

    setToast(`Uploading and processing ${selectedTool}...`);

    const tempId = "temp-" + Date.now();
    const newJob = {
      id: tempId,
      tool: selectedTool,
      file: files.length === 1 ? files[0].name : `${files.length} files`,
      size: formatBytes(Array.from(files).reduce((acc, f) => acc + f.size, 0)),
      originalSizeBytes: Array.from(files).reduce((acc, f) => acc + f.size, 0),
      status: "Processing" as const,
      downloadUrl: ""
    };
    setJobs((prev) => [newJob, ...prev]);
    setActiveJobId(tempId);

    const headers: Record<string, string> = {};
    if (options) {
      for (const key in options) {
        if (options[key] !== undefined && options[key] !== null) {
          const headerKey = "x-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
          headers[headerKey] = String(options[key]);
        }
      }
    }

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = "Upload failed";
        try {
          const errObj = JSON.parse(errorText);
          errMsg = errObj.error || errMsg;
        } catch {
          if (errorText) errMsg = errorText;
        }
        throw new Error(errMsg);
      }

      const result = await response.json();
      const fileName = result.output_path.split(/[/\\]/).pop() || "output.pdf";
      const downloadUrl = `/download/${result.job_id}/${fileName}`;

      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === tempId) {
            return {
              ...job,
              id: result.job_id,
              status: "Done",
              size: formatBytes(result.bytes),
              finalSizeBytes: result.bytes,
              downloadUrl,
            };
          }
          return job;
        })
      );
      setActiveJobId(result.job_id);
      setToast(`${selectedTool} completed!`);
      window.setTimeout(() => setToast(""), 2200);
    } catch (error: any) {
      console.error(error);
      setToast(`Error: ${error.message || "Failed to process job"}`);
      window.setTimeout(() => setToast(""), 4000);
      setJobs((prev) => prev.filter((job) => job.id !== tempId));
      setActiveJobId(null);
    }
  }

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;

  const isVisualEditorActive =
    currentView === "workspace" &&
    hasStagedFiles &&
    [
      "Edit PDF",
      "PDF Annotator",
      "Sign PDF",
      "Watermark PDF",
      "Crop PDF",
      "Page Numbers",
      "Bates Numbering",
    ].includes(selectedTool);

  return (
    <div className={`app ${isVisualEditorActive ? "visual-editor-active" : ""}`} data-theme={theme}>
      {!isVisualEditorActive && (
        <Header
          onLogoClick={() => {
            setCurrentView("home");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
          onToolSelect={(toolName) => {
            setSelectedTool(toolName);
            setCurrentView("workspace");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
          onLoginClick={() => setIsLoginModalOpen(true)}
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            setToast("Logged out successfully");
            window.setTimeout(() => setToast(""), 2200);
          }}
          onAvatarClick={() => setIsAccountDrawerOpen(true)}
          onPricingClick={() => setCurrentView("pricing")}
        />
      )}
      
      {currentView === "home" ? (
        <LandingPage 
          onToolSelect={(toolName) => {
            setSelectedTool(toolName);
            setCurrentView("workspace");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }} 
          onViewChange={(view) => {
            setCurrentView(view);
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
        />
      ) : currentView === "pricing" ? (
        <PricingPage
          currentUser={currentUser}
          onUpgradeSuccess={(planName) => {
            setCurrentUser((prev) => prev ? { ...prev, plan: planName } : { name: "Premium User", email: "premium.user@example.com", plan: planName });
            setToast(`Upgraded to ${planName} successfully!`);
            window.setTimeout(() => setToast(""), 2500);
          }}
          onLoginRequired={() => {
            setIsLoginModalOpen(true);
            setToast("Please log in to upgrade your plan.");
            window.setTimeout(() => setToast(""), 3000);
          }}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "privacy" ? (
        <PrivacyPage onBack={() => setCurrentView("home")} />
      ) : currentView === "terms" ? (
        <TermsPage onBack={() => setCurrentView("home")} />
      ) : currentView === "faq" ? (
        <FaqPage onBack={() => setCurrentView("home")} />
      ) : currentView === "contact" ? (
        <ContactPage onBack={() => setCurrentView("home")} />
      ) : (
        <main className="workspace-page-wrapper">
          {activeJobId || hasStagedFiles ? (
            <UploadPanel 
              selectedTool={selectedTool} 
              onUpload={handleUpload} 
              onBack={() => {
                setCurrentView("home");
                setActiveJobId(null);
                setHasStagedFiles(false);
              }} 
              activeJob={activeJob}
              onReset={() => {
                setActiveJobId(null);
                setHasStagedFiles(false);
              }}
              onStagedChange={setHasStagedFiles}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
              <UploadPanel 
                selectedTool={selectedTool} 
                onUpload={handleUpload} 
                onBack={() => {
                  setCurrentView("home");
                  setActiveJobId(null);
                  setHasStagedFiles(false);
                }} 
                activeJob={activeJob}
                onReset={() => {
                  setActiveJobId(null);
                  setHasStagedFiles(false);
                }}
                onStagedChange={setHasStagedFiles}
              />
              {jobs.length > 0 && (
                <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "0 var(--space-6)", boxSizing: "border-box" }}>
                  <RecentJobs jobs={jobs} />
                </div>
              )}
            </div>
          )}
        </main>
      )}
      {toast && <div className="toast">{toast}</div>}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setToast(`Logged in as ${user.name || user.email}!`);
          window.setTimeout(() => setToast(""), 2500);
        }}
      />
      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setToast("Logged out successfully");
          window.setTimeout(() => setToast(""), 2200);
        }}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
