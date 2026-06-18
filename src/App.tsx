import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { RecentJobs } from "./components/RecentJobs";
import { UploadPanel } from "./components/UploadPanel";
import { LandingPage } from "./components/LandingPage";
import { LoginModal } from "./components/LoginModal";
import { AccountDrawer } from "./components/AccountDrawer";
import { CookieBanner } from "./components/CookieBanner";
import { supabase } from "./utils/supabase";

// Lazy-loaded auxiliary pages to decrease initial bundle size and boost page load times
const PricingPage = lazy(() => import("./components/PricingPage").then(m => ({ default: m.PricingPage })));
const PrivacyPage = lazy(() => import("./components/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then(m => ({ default: m.TermsPage })));
const FaqPage = lazy(() => import("./components/FaqPage").then(m => ({ default: m.FaqPage })));
const ContactPage = lazy(() => import("./components/ContactPage").then(m => ({ default: m.ContactPage })));
const AllToolsPage = lazy(() => import("./components/AllToolsPage").then(m => ({ default: m.AllToolsPage })));
const AboutPage = lazy(() => import("./components/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactSalesPage = lazy(() => import("./components/ContactSalesPage").then(m => ({ default: m.ContactSalesPage })));
const AccountSettingsPage = lazy(() => import("./components/AccountSettingsPage").then(m => ({ default: m.AccountSettingsPage })));
const UserDashboardPage = lazy(() => import("./components/UserDashboardPage").then(m => ({ default: m.UserDashboardPage })));

export function App() {
  const theme = "white";
  const [selectedTool, setSelectedTool] = useState("Compress PDF");
  const [toast, setToast] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "workspace" | "pricing" | "privacy" | "terms" | "faq" | "contact" | "tools" | "about" | "contact-sales" | "settings" | "dashboard">("home");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [hasStagedFiles, setHasStagedFiles] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; plan?: string } | null>(null);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const jobInputsRef = useRef<Record<string, { files: File[]; options?: any; toolName: string }>>({});

  // Restore session on application load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(async (res) => {
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        } else if (res.status === 401 || res.status === 403) {
          // Only discard token if the server explicitly rejects it
          localStorage.removeItem("authToken");
        }
      })
      .catch(err => console.error("Error restoring session:", err));
    }
  }, []);

  // Listen for Supabase auth state changes (crucial for Google OAuth redirects)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const token = localStorage.getItem("authToken");
        if (!token) {
          try {
            const res = await fetch("/api/auth/supabase-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0]
              })
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem("authToken", data.token);
              setCurrentUser(data.user);
              setToast(`Welcome back, ${data.user.name || data.user.email}!`);
              window.setTimeout(() => setToast(""), 2000);
            }
          } catch (e) {
            console.error("Supabase sync failed:", e);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch recent jobs from SQLite database when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && currentUser) {
      fetch("/api/user/jobs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(async (res) => {
        if (res.ok) {
          const serverJobs = await res.json();
          const mappedJobs = serverJobs.map((j: any) => {
            const fileName = j.output_path.split(/[/\\]/).pop() || "output.pdf";
            return {
              id: j.job_id,
              tool: j.tool_id.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
              file: fileName,
              size: formatBytes(j.bytes),
              status: "Done" as const,
              downloadUrl: `/download/${j.job_id}/${fileName}`
            };
          });
          setJobs(mappedJobs);
        }
      })
      .catch(err => console.error("Error fetching jobs:", err));
    }
  }, [currentUser]);

  // Scroll to top on view or tool change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedTool]);

  async function handleLogout() {
    const token = localStorage.getItem("authToken");
    
    // Sign out from Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signout error:", e);
    }

    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
    localStorage.removeItem("authToken");
    setCurrentUser(null);
    setJobs([]);
    setToast("Logged out successfully");
    window.setTimeout(() => setToast(""), 2200);
  }

  async function handleUpgrade(planName: string) {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const res = await fetch("/api/user/upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ plan: planName }),
        });
        if (!res.ok) {
          throw new Error("Failed to upgrade plan on server.");
        }
      } catch (err: any) {
        setToast(`Upgrade error: ${err.message}`);
        window.setTimeout(() => setToast(""), 4000);
        return;
      }
    }
    setCurrentUser((prev) => prev ? { ...prev, plan: planName } : { name: "Premium User", email: "premium.user@example.com", plan: planName });
    setToast(`Upgraded to ${planName} successfully!`);
    window.setTimeout(() => setToast(""), 2500);
  }


  function formatBytes(bytes: number, decimals = 1) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  async function handleUpload(files: FileList | File[], options?: any) {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const totalSizeBytes = filesArray.reduce((acc, f) => acc + f.size, 0);
    const limitBytes = currentUser 
      ? (currentUser.plan === "Pro" ? 500 * 1024 * 1024 : 50 * 1024 * 1024)
      : 10 * 1024 * 1024; // 10 MB for anonymous/guests

    if (totalSizeBytes > limitBytes) {
      if (!currentUser) {
        setToast("Guest users get a 10 MB limit. Please log in to raise it to 50 MB!");
        setIsLoginModalOpen(true);
      } else if (currentUser.plan !== "Pro") {
        setToast("Bhai, Free users enforce a 50 MB limit. Upgrade to Pro to get 500 MB!");
        setCurrentView("pricing");
      } else {
        setToast("Bhai, Pro users have a 500 MB file limit!");
      }
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
    jobInputsRef.current[tempId] = { files: filesArray, options, toolName: selectedTool };
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
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

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
      const errMsg = error.message || "Failed to process job";
      setToast(`Error: ${errMsg}`);
      window.setTimeout(() => setToast(""), 5000);
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === tempId) {
            return { ...job, status: "Failed" as const };
          }
          return job;
        })
      );
      setActiveJobId(null);

      // Handle daily rate limit responses
      if (errMsg.toLowerCase().includes("limit")) {
        if (!currentUser) {
          setIsLoginModalOpen(true);
        } else if (currentUser.plan !== "Pro") {
          setCurrentView("pricing");
        }
      }
    }
  }

  async function handleRetryJob(job: any) {
    const cached = jobInputsRef.current[job.id];
    if (!cached) {
      setToast("Error: Job files are no longer in memory. Please upload again.");
      window.setTimeout(() => setToast(""), 3000);
      return;
    }
    
    // Remove the failed job from the list
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    
    setSelectedTool(cached.toolName);
    handleUpload(cached.files, cached.options);
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
          onLogout={handleLogout}
          onAvatarClick={() => setIsAccountDrawerOpen(true)}
          onPricingClick={() => setCurrentView("pricing")}
          onToolsClick={() => {
            setCurrentView("tools");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
          onContactSalesClick={() => {
            setCurrentView("contact-sales");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
          onWorkspaceClick={() => {
            setCurrentView("dashboard");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
        />
      )}
      
      <Suspense fallback={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", fontSize: "15px", fontFamily: "sans-serif" }}>
          <div style={{ width: "28px", height: "28px", border: "2.5px solid var(--border)", borderTopColor: "var(--c-accent, #0074f0)", borderRadius: "50%", animation: "spinnerRotate 0.8s linear infinite", marginBottom: "12px" }}></div>
          <span>Loading...</span>
        </div>
      }>
        {currentView === "home" ? (
          <LandingPage 
            onToolSelect={(toolName) => {
              setSelectedTool(toolName);
              setCurrentView("workspace");
              setActiveJobId(null);
              setHasStagedFiles(false);
            }} 
            onViewChange={(view) => {
              if (view === "contact") {
                setCurrentView("contact-sales");
              } else {
                setCurrentView(view);
              }
              setActiveJobId(null);
              setHasStagedFiles(false);
            }}
          />
        ) : currentView === "tools" ? (
          <AllToolsPage 
            onToolSelect={(toolName) => {
              setSelectedTool(toolName);
              setCurrentView("workspace");
              setActiveJobId(null);
              setHasStagedFiles(false);
            }}
            onPricingClick={() => setCurrentView("pricing")}
            onContactSalesClick={() => setCurrentView("contact-sales")}
            onBack={() => setCurrentView("home")}
            onViewChange={(view) => {
              if (view === "contact") {
                setCurrentView("contact-sales");
              } else {
                setCurrentView(view);
              }
              setActiveJobId(null);
              setHasStagedFiles(false);
            }}
          />
        ) : currentView === "about" ? (
          <AboutPage onBack={() => setCurrentView("home")} />
        ) : currentView === "contact-sales" ? (
          <ContactSalesPage onBack={() => setCurrentView("home")} />
        ) : currentView === "settings" ? (
          <AccountSettingsPage 
            onBack={() => setCurrentView("home")} 
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
            onPricingClick={() => setCurrentView("pricing")}
          />

        ) : currentView === "dashboard" ? (
          <UserDashboardPage 
            onBack={() => setCurrentView("home")} 
            onToolSelect={(toolName) => {
              setSelectedTool(toolName);
              setCurrentView("workspace");
              setActiveJobId(null);
              setHasStagedFiles(false);
            }}
            onBrowseTools={() => setCurrentView("tools")}
            jobs={jobs}
            currentUser={currentUser}
            onManageSubscription={() => setCurrentView("pricing")}
          />
        ) : currentView === "pricing" ? (
          <PricingPage
            currentUser={currentUser}
            onUpgradeSuccess={handleUpgrade}
            onLoginRequired={() => {
              setIsLoginModalOpen(true);
              setToast("Please log in to upgrade your plan.");
              window.setTimeout(() => setToast(""), 3000);
            }}
            onBack={() => setCurrentView("home")}
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
        ) : currentView === "privacy" ? (
          <PrivacyPage onBack={() => setCurrentView("home")} />
        ) : currentView === "terms" ? (
          <TermsPage onBack={() => setCurrentView("home")} />
        ) : currentView === "contact" ? (
          <ContactPage onBack={() => setCurrentView("home")} />
        ) : (
          <main className={`workspace-page-wrapper ${hasStagedFiles && activeJob?.status !== "Done" ? "staged-view-active" : ""}`}>
            <div className="workspace-full-bleed-container">
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
                onToolSelect={(toolName) => {
                  setSelectedTool(toolName);
                  setCurrentView("workspace");
                  setActiveJobId(null);
                  setHasStagedFiles(false);
                }}
                onViewChange={(view) => {
                  if (view === "contact") {
                    setCurrentView("contact-sales");
                  } else {
                    setCurrentView(view);
                  }
                  setActiveJobId(null);
                  setHasStagedFiles(false);
                }}
                jobs={jobs}
                onRetry={handleRetryJob}
              />
            </div>
          </main>
        )}
      </Suspense>
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
        onLogout={handleLogout}
        onSettingsClick={() => {
          setCurrentView("settings");
          setIsAccountDrawerOpen(false);
        }}
      />
      <CookieBanner onPrivacyPolicyClick={() => setCurrentView("privacy")} />
    </div>
  );
}
