import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { RecentJobs } from "./components/RecentJobs";
import { UploadPanel } from "./components/UploadPanel";
import { LandingPage } from "./components/LandingPage";
import { LoginModal } from "./components/LoginModal";
import { AccountDrawer } from "./components/AccountDrawer";
import { CookieBanner } from "./components/CookieBanner";
import { supabase } from "./utils/supabase";
import { tools } from "./data/tools";
import { seoPages } from "./data/seoPages";

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
const SecurityPage = lazy(() => import("./components/TrustPages").then(m => ({ default: m.SecurityPage })));
const FilePrivacyPage = lazy(() => import("./components/TrustPages").then(m => ({ default: m.FilePrivacyPage })));
const DataDeletionPage = lazy(() => import("./components/TrustPages").then(m => ({ default: m.DataDeletionPage })));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

const pathMap: Record<string, { view: "home" | "workspace" | "pricing" | "privacy" | "terms" | "faq" | "contact" | "tools" | "about" | "contact-sales" | "settings" | "dashboard" | "security" | "file-privacy" | "data-deletion" | "admin"; tool?: string }> = {
  "/": { view: "home" },
  "/pricing": { view: "pricing" },
  "/privacy": { view: "privacy" },
  "/terms": { view: "terms" },
  "/faq": { view: "faq" },
  "/contact": { view: "contact" },
  "/about": { view: "about" },
  "/contact-sales": { view: "contact-sales" },
  "/settings": { view: "settings" },
  "/dashboard": { view: "dashboard" },
  "/tools": { view: "tools" },
  "/security": { view: "security" },
  "/file-privacy": { view: "file-privacy" },
  "/data-deletion": { view: "data-deletion" },
  "/admin": { view: "admin" },
  
  // Tools
  "/merge-pdf": { view: "workspace", tool: "Merge PDF" },
  "/split-pdf": { view: "workspace", tool: "Split PDF" },
  "/compress-pdf": { view: "workspace", tool: "Compress PDF" },
  "/word-to-pdf": { view: "workspace", tool: "Word to PDF" },
  "/jpg-to-pdf": { view: "workspace", tool: "JPG to PDF" },
  "/pdf-to-word": { view: "workspace", tool: "PDF to Word" },
  "/pdf-to-jpg": { view: "workspace", tool: "PDF to JPG" },
  "/rotate-pdf": { view: "workspace", tool: "Rotate PDF" },
  "/remove-pages": { view: "workspace", tool: "Remove Pages" },
  "/extract-pages": { view: "workspace", tool: "Extract Pages" },
  "/organize-pdf": { view: "workspace", tool: "Organize PDF" },
  "/crop-pdf": { view: "workspace", tool: "Crop PDF" },
  "/page-numbers": { view: "workspace", tool: "Page Numbers" },
  "/pdf-annotator": { view: "workspace", tool: "PDF Annotator" },
  "/header-footer-pdf": { view: "workspace", tool: "Header & Footer" },
  "/resize-pdf": { view: "workspace", tool: "Resize PDF Pages" },
  "/sign-pdf": { view: "workspace", tool: "Sign PDF" },
  "/unlock-pdf": { view: "workspace", tool: "Unlock PDF" },
  "/protect-pdf": { view: "workspace", tool: "Protect PDF" },
  "/watermark-pdf": { view: "workspace", tool: "Watermark PDF" },
  "/bates-numbering": { view: "workspace", tool: "Bates Numbering" },
  "/edit-pdf-metadata": { view: "workspace", tool: "Edit PDF Metadata" },
  "/ocr-pdf": { view: "workspace", tool: "PDF OCR" },
};

function getPathForState(view: string, tool?: string): string {
  if (view === "workspace" && tool) {
    switch (tool) {
      case "Merge PDF": return "/merge-pdf";
      case "Split PDF": return "/split-pdf";
      case "Compress PDF": return "/compress-pdf";
      case "Word to PDF": return "/word-to-pdf";
      case "JPG to PDF": return "/jpg-to-pdf";
      case "PDF to Word": return "/pdf-to-word";
      case "PDF to JPG": return "/pdf-to-jpg";
      case "Rotate PDF": return "/rotate-pdf";
      case "Remove Pages": return "/remove-pages";
      case "Extract Pages": return "/extract-pages";
      case "Organize PDF": return "/organize-pdf";
      case "Crop PDF": return "/crop-pdf";
      case "Page Numbers": return "/page-numbers";
      case "PDF Annotator": return "/pdf-annotator";
      case "Header & Footer": return "/header-footer-pdf";
      case "Resize PDF Pages": return "/resize-pdf";
      case "Sign PDF": return "/sign-pdf";
      case "Unlock PDF": return "/unlock-pdf";
      case "Protect PDF": return "/protect-pdf";
      case "Watermark PDF": return "/watermark-pdf";
      case "Bates Numbering": return "/bates-numbering";
      case "Edit PDF Metadata": return "/edit-pdf-metadata";
      case "PDF OCR": return "/ocr-pdf";
      default: return "/";
    }
  }
  
  switch (view) {
    case "pricing": return "/pricing";
    case "privacy": return "/privacy";
    case "terms": return "/terms";
    case "faq": return "/faq";
    case "contact": return "/contact";
    case "about": return "/about";
    case "contact-sales": return "/contact-sales";
    case "settings": return "/settings";
    case "dashboard": return "/dashboard";
    case "tools": return "/tools";
    case "security": return "/security";
    case "file-privacy": return "/file-privacy";
    case "data-deletion": return "/data-deletion";
    case "admin": return "/admin";
    default: return "/";
  }
}

const viewMetadata: Record<string, { title: string; desc: string }> = {
  home: {
    title: "PDFMount - Free Online PDF Tools & Editor",
    desc: "Merge, split, compress, convert, sign, and secure PDF files online. Free, secure, and fast PDF tools inside your browser.",
  },
  pricing: {
    title: "Simple Pricing Plans - PDFMount Pro & Enterprise",
    desc: "Check out our affordable plans. Get larger file limits, batch processing, and priority support for PDFMount. Start free, upgrade anytime.",
  },
  privacy: {
    title: "Privacy Policy - PDFMount",
    desc: "Learn how PDFMount secures and handles your documents. We do not store files permanently. Files are auto-deleted after 60 minutes.",
  },
  terms: {
    title: "Terms of Service - PDFMount",
    desc: "Review the terms and conditions for using PDFMount's online PDF tools. No hidden clauses — transparent usage policies.",
  },
  faq: {
    title: "Frequently Asked Questions - PDFMount Help",
    desc: "Find answers to common questions about PDFMount, file limits, security, billing, and our free PDF tools.",
  },
  contact: {
    title: "Contact Us - PDFMount Support",
    desc: "Get in touch with the PDFMount team for support, feedback, or enterprise inquiries. We respond within 24 hours.",
  },
  "contact-sales": {
    title: "Contact Sales - PDFMount Enterprise Solutions",
    desc: "Talk to our sales team about custom enterprise limits, integrations, and dedicated support.",
  },
  about: {
    title: "About Us - PDFMount",
    desc: "Learn about PDFMount, our mission to build fast and secure PDF tools for everyone. Trusted by thousands of users worldwide.",
  },
  tools: {
    title: "All PDF Tools - PDFMount",
    desc: "Explore all 23+ free online PDF tools. Merge, split, compress, convert, rotate, and secure your files in seconds. No registration required.",
  },
  dashboard: {
    title: "User Dashboard - PDFMount",
    desc: "Manage your processed PDF files, check job statuses, and update your subscription settings.",
  },
  settings: {
    title: "Account Settings - PDFMount",
    desc: "Update your profile information, password, and manage your PDFMount account settings.",
  },
  security: {
    title: "Security Policy - PDFMount",
    desc: "Learn about PDFMount's volatile in-memory sandboxing, TLS 1.3 encryption, and zero third-party data handover security standards.",
  },
  "file-privacy": {
    title: "File Privacy Policy - PDFMount",
    desc: "We prioritize your privacy. Learn how your files are processed with zero human surveillance and auto-deleted after 60 minutes.",
  },
  "data-deletion": {
    title: "Data Deletion Policy - PDFMount",
    desc: "Details on our 60-minute auto-purge lifecycle and immediate manual data wiping controls. Complete data deletion policy.",
  },
  admin: {
    title: "PDFMount Admin Panel Dashboard",
    desc: "Administrative system console for managing user databases, Stripe transactions, tool statistics, and CLI engine status.",
  },
};

// Derive the initial view and tool from the URL path synchronously so the
// very first render matches the requested route (no homepage flash, no
// "Loading interactive workspace…" flicker visible to crawlers or SSG shells).
function getInitialState(): { view: "home" | "workspace" | "pricing" | "privacy" | "terms" | "faq" | "contact" | "tools" | "about" | "contact-sales" | "settings" | "dashboard" | "security" | "file-privacy" | "data-deletion" | "admin"; tool: string } {
  if (typeof window !== "undefined" && window.location.hostname === "admin.pdfmount.online") {
    return { view: "admin", tool: "Compress PDF" };
  }
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const match = pathMap[path];
  if (match) {
    return { view: match.view as any, tool: match.tool || "Compress PDF" };
  }
  return { view: "home", tool: "Compress PDF" };
}

export function App() {
  const theme = "white";
  const _initial = getInitialState();
  const [selectedTool, setSelectedTool] = useState(_initial.tool);
  const [toast, setToast] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "workspace" | "pricing" | "privacy" | "terms" | "faq" | "contact" | "tools" | "about" | "contact-sales" | "settings" | "dashboard" | "security" | "file-privacy" | "data-deletion" | "admin">(_initial.view);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [hasStagedFiles, setHasStagedFiles] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; plan?: string } | null>(null);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const jobInputsRef = useRef<Record<string, { files: File[]; options?: any; toolName: string }>>({});

  // Synchronize state with pathname on load and browser navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined" && window.location.hostname === "admin.pdfmount.online") {
        setCurrentView("admin");
        setActiveJobId(null);
        setHasStagedFiles(false);
        return;
      }
      const path = window.location.pathname;
      const match = pathMap[path] || { view: "home" };
      setCurrentView(match.view);
      if (match.tool) {
        setSelectedTool(match.tool);
      }
      setActiveJobId(null);
      setHasStagedFiles(false);
    };

    window.addEventListener("popstate", handlePopState);
    // Parse current path on mount
    handlePopState();

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Synchronize browser URL history when state changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "admin.pdfmount.online") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        window.history.pushState(null, "", "/");
      }
      return;
    }
    const currentPath = window.location.pathname;
    const targetPath = getPathForState(currentView, currentView === "workspace" ? selectedTool : undefined);
    if (currentPath !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [currentView, selectedTool]);

  // Dynamically update document title, meta tags, and structured JSON-LD schemas
  useEffect(() => {
    let title = "PDFMount - Free Online PDF Tools & Editor";
    let desc = "Merge, split, compress, convert, sign, and secure PDF files online. Free, secure, and fast PDF tools inside your browser.";
    
    if (currentView === "workspace") {
      const matchedTool = tools.find(t => t.name === selectedTool);
      const toolId = matchedTool?.id;
      if (toolId && seoPages[toolId]) {
        title = seoPages[toolId].title;
        desc = seoPages[toolId].desc;
      }
    } else if (viewMetadata[currentView]) {
      title = viewMetadata[currentView].title;
      desc = viewMetadata[currentView].desc;
    }
    
    document.title = title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", desc);
    
    // Update canonical link
    const canonicalUrl = `https://pdfmount.online${getPathForState(currentView, currentView === "workspace" ? selectedTool : undefined)}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);
    
    // Inject schema scripts
    const existingSchemas = document.querySelectorAll('script[data-seo-schema="true"]');
    existingSchemas.forEach(el => el.remove());
    
    const schemas: any[] = [];
    
    // BreadcrumbList Schema (if not home)
    if (currentView !== "home") {
      const path = getPathForState(currentView, currentView === "workspace" ? selectedTool : undefined);
      const pageName = currentView === "workspace" ? selectedTool : (currentView.charAt(0).toUpperCase() + currentView.slice(1));
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://pdfmount.online/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": pageName,
            "item": `https://pdfmount.online${path}`
          }
        ]
      });
    }
    
    // Tool-specific JSON-LD schemas
    if (currentView === "workspace") {
      const matchedTool = tools.find(t => t.name === selectedTool);
      const toolId = matchedTool?.id;
      if (toolId && seoPages[toolId]) {
        const pageData = seoPages[toolId];
        
        // SoftwareApplication
        schemas.push({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": pageData.h1,
          "operatingSystem": "All",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": pageData.desc
        });
        
        // HowTo Steps
        if (pageData.steps && pageData.steps.length > 0) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to use ${selectedTool}`,
            "step": pageData.steps.map((stepText, idx) => ({
              "@type": "HowToStep",
              "position": idx + 1,
              "text": stepText
            }))
          });
        }
        
        // FAQs
        if (pageData.faqs && pageData.faqs.length > 0) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": pageData.faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          });
        }
      }
    }
    
    // Inject scripts
    schemas.forEach(schemaData => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-schema", "true");
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });
    
  }, [currentView, selectedTool]);

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
    const syncSupabaseSession = async (session: any) => {
      if (!session?.user) return;
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
        }
      } catch (e) {
        console.error("Supabase sync failed:", e);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const isOAuthProvider = session.user?.app_metadata?.provider !== "email";
        const hasToken = !!localStorage.getItem("authToken");

        // Always sync OAuth logins (Google, Apple) to ensure correct user is shown.
        // For email/password logins, only sync if we don't already have a token.
        if (isOAuthProvider || !hasToken) {
          await syncSupabaseSession(session);
          setToast(`Welcome, ${session.user.user_metadata?.full_name || session.user.email}!`);
          window.setTimeout(() => setToast(""), 2500);
        }
      } else if (event === "INITIAL_SESSION" && session) {
        // Page was reloaded and Supabase restored an existing OAuth session.
        // Sync to ensure our backend token reflects the correct user.
        const isOAuthProvider = session.user?.app_metadata?.provider !== "email";
        if (isOAuthProvider && !localStorage.getItem("authToken")) {
          await syncSupabaseSession(session);
        }
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("authToken");
        setCurrentUser(null);
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

  function handleToolSelect(toolName: string) {
    const matched = tools.find(t => t.name === toolName);
    if (matched && matched.status === "coming-soon") {
      setToast("This tool is coming soon in a future release! Please stay tuned.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    setSelectedTool(toolName);
    setCurrentView("workspace");
    setActiveJobId(null);
    setHasStagedFiles(false);
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

    // Validate file extensions - block executable and dangerous types
    const blockedExtensions = [
      "exe", "bat", "cmd", "sh", "vbs", "msi", "scr", "pif", "com", "js", "ts", "lnk",
      "sys", "dll", "bin", "jar", "py", "pl", "rb", "ps1", "wsf"
    ];
    for (const file of filesArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (blockedExtensions.includes(ext)) {
        setToast(`Error: File format .${ext} is blocked for security reasons.`);
        window.setTimeout(() => setToast(""), 5000);
        return;
      }
    }

    const totalSizeBytes = filesArray.reduce((acc, f) => acc + f.size, 0);
    const limitBytes = currentUser 
      ? (currentUser.plan === "Pro" ? 500 * 1024 * 1024 : 50 * 1024 * 1024)
      : 25 * 1024 * 1024; // 25 MB for anonymous/guests

    if (totalSizeBytes > limitBytes) {
      if (!currentUser) {
        setToast("Free limit is 25 MB. Log in to get 50 MB upload limit!");
        setIsLoginModalOpen(true);
      } else if (currentUser.plan !== "Pro") {
        setToast("Free plan has a 50 MB file limit. Upgrade to Pro for 500 MB!");
        setCurrentView("pricing");
      } else {
        setToast("Pro plan allows up to 500 MB per upload.");
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
      const rawMsg = error.message || "";
      let friendlyMsg = "Failed to process job. Please check your document and try again.";
      
      const lowerMsg = rawMsg.toLowerCase();
      if (lowerMsg.includes("uploaded file exceeds max size")) {
        friendlyMsg = "File size exceeds your plan's upload limits. Please compress your file or upgrade your plan.";
      } else if (lowerMsg.includes("failed to launch python") || lowerMsg.includes("python")) {
        friendlyMsg = "Internal processing error on the server. Our development team has been notified.";
      } else if (lowerMsg.includes("limit") || lowerMsg.includes("rate limit") || lowerMsg.includes("quota")) {
        friendlyMsg = "Daily request quota reached. Please log in or upgrade to Pro for higher limits.";
      } else if (lowerMsg.includes("password") || lowerMsg.includes("encrypt")) {
        friendlyMsg = "Password-protected file. Please unlock it or enter the correct password.";
      } else if (lowerMsg.includes("corrupted") || lowerMsg.includes("invalid pdf")) {
        friendlyMsg = "The uploaded file appears to be corrupted. Try repairing it first.";
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }
      
      setToast(`Error: ${friendlyMsg}`);
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

      // Handle daily rate limit responses — parse structured backend error
      // Format: DAILY_LIMIT_REACHED:LOGIN_REQUIRED:message
      //      or DAILY_LIMIT_REACHED:UPGRADE_REQUIRED:message
      if (rawMsg.includes("DAILY_LIMIT_REACHED")) {
        if (rawMsg.includes("LOGIN_REQUIRED")) {
          // Anonymous user hit 10 job limit → show login wall
          setToast("You've used your 10 free tool uses today. Log in to keep going!");
          window.setTimeout(() => setToast(""), 4000);
          setIsLoginModalOpen(true);
        } else if (rawMsg.includes("UPGRADE_REQUIRED")) {
          // Logged-in free user hit 10 job limit → show pricing
          setToast("Daily limit reached. Upgrade to Pro for 100 jobs/day!");
          window.setTimeout(() => setToast(""), 4000);
          setCurrentView("pricing");
        }
      } else if (rawMsg.toLowerCase().includes("limit")) {
        // Legacy fallback
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

  async function handleDeleteJob(jobId: string) {
    // 1. Remove from local state immediately
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setToast("File purged from storage successfully.");
    window.setTimeout(() => setToast(""), 2200);

    // 2. Call backend deletion API if it is a real job_id
    if (!jobId.startsWith("temp-")) {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      try {
        await fetch(`/api/jobs/${jobId}/delete`, {
          method: "POST",
          headers,
        });
      } catch (e) {
        console.error("Failed to notify backend of manual delete:", e);
      }
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

  if (currentView === "admin") {
    return (
      <Suspense fallback={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#71717a", fontSize: "14px", fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
          <span>Loading Admin Console...</span>
        </div>
      }>
        <AdminDashboard 
          onBack={() => {
            if (typeof window !== "undefined" && window.location.hostname === "admin.pdfmount.online") {
              window.location.href = "https://pdfmount.online";
            } else {
              setCurrentView("home");
              setActiveJobId(null);
              setHasStagedFiles(false);
            }
          }} 
          currentUser={currentUser} 
        />
      </Suspense>
    );
  }

  return (
    <div className={`app ${isVisualEditorActive ? "visual-editor-active" : ""}`} data-theme={theme}>
      {!isVisualEditorActive && (
        <Header
          onLogoClick={() => {
            setCurrentView("home");
            setActiveJobId(null);
            setHasStagedFiles(false);
          }}
          onToolSelect={handleToolSelect}
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
            onToolSelect={handleToolSelect} 
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
            onToolSelect={handleToolSelect}
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
          <AboutPage 
            onBack={() => setCurrentView("home")} 
            onViewChange={(view) => {
              setCurrentView(view);
              setActiveJobId(null);
              setHasStagedFiles(false);
            }}
          />
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
            onToolSelect={handleToolSelect}
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
            onToolSelect={handleToolSelect}
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
        ) : currentView === "security" ? (
          <SecurityPage onBack={() => setCurrentView("home")} />
        ) : currentView === "file-privacy" ? (
          <FilePrivacyPage onBack={() => setCurrentView("home")} />
        ) : currentView === "data-deletion" ? (
          <DataDeletionPage onBack={() => setCurrentView("home")} />
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
                onToolSelect={handleToolSelect}
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
                onDeleteJob={handleDeleteJob}
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
        onSupportClick={() => {
          setCurrentView("contact");
          setIsAccountDrawerOpen(false);
        }}
      />
      <CookieBanner onPrivacyPolicyClick={() => setCurrentView("privacy")} />
    </div>
  );
}
