import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, User, Shield, CreditCard, LogOut, HardDrive, Plus, Edit, 
  Stamp, Archive, MoreHorizontal, Grid, List, FileText, Trash2, Download, 
  Copy, Phone, Globe, Briefcase, Users, Key, CheckCircle2, ChevronRight, Clock
} from "lucide-react";
import { getToolColor, ToolIcon, isMsOfficeTool } from "./ToolIcon";

interface UserDashboardPageProps {
  onBack: () => void;
  onToolSelect: (toolName: string) => void;
  onBrowseTools: () => void;
  jobs: any[];
  currentUser: { name: string; email: string; plan?: string } | null;
  onManageSubscription: () => void;
  onUpdateUser?: (user: { name: string; email: string; plan?: string }) => void;
  onLogout?: () => void;
  initialTab?: string;
}

export function UserDashboardPage({ 
  onBack, 
  onToolSelect, 
  onBrowseTools, 
  jobs, 
  currentUser, 
  onManageSubscription,
  onUpdateUser,
  onLogout,
  initialTab = "dashboard"
}: UserDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isListView, setIsListView] = useState(true);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem("userAvatar") || "/Avatar-1.webp";
  });

  const [dashboardJobs, setDashboardJobs] = useState<{ id: string; file: string; tool: string; size: string; time: string; downloadUrl?: string }[]>([]);

  // Helper to parse size strings (e.g. "4.2 MB", "900 KB") to MB
  const parseSizeToMB = (sizeStr: string): number => {
    if (!sizeStr) return 0;
    const cleanStr = sizeStr.toLowerCase().replace(/,/g, "").trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return 0;
    if (cleanStr.includes("gb")) {
      return num * 1024;
    }
    if (cleanStr.includes("kb")) {
      return num / 1024;
    }
    if (cleanStr.includes("bytes") || cleanStr.includes("b")) {
      if (cleanStr.endsWith("kb")) return num / 1024;
      if (cleanStr.endsWith("mb")) return num;
      return num / (1024 * 1024);
    }
    return num; // Default to MB
  };

  // Storage Reset Timer (1 hour auto-delete)
  const [resetTimer, setResetTimer] = useState<number>(3600);

  const resetStorageTimer = () => {
    const newTarget = Date.now() + 3600 * 1000;
    localStorage.setItem("workspace_reset_at", String(newTarget));
    setResetTimer(3600);
  };

  useEffect(() => {
    let targetTimeStr = localStorage.getItem("workspace_reset_at");
    let targetTime = targetTimeStr ? parseInt(targetTimeStr, 10) : 0;
    
    if (!targetTime || targetTime <= Date.now()) {
      targetTime = Date.now() + 3600 * 1000;
      localStorage.setItem("workspace_reset_at", String(targetTime));
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.round((targetTime - Date.now()) / 1000));
      if (remaining === 0) {
        setDashboardJobs([]);
        showToast("Workspace storage auto-cleared (1-hour safety limit).");
        
        const newTarget = Date.now() + 3600 * 1000;
        localStorage.setItem("workspace_reset_at", String(newTarget));
        setResetTimer(3600);
      } else {
        setResetTimer(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      resetStorageTimer();
    }
  }, [jobs.length]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };
  
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Profile Form Fields
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(`user_profile_${currentUser?.email}`);
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {}
    }
    
    // Construct fullName from parsed or currentUser
    const defaultFullName = currentUser?.name || "";
    const parsedFullName = parsed.fullName || 
      (parsed.firstName || parsed.lastName ? `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() : defaultFullName);

    // split parsedFullName or default into first and last name if they are not saved separately
    const parts = parsedFullName.split(" ");
    const defaultFirstName = parts[0] || "";
    const defaultLastName = parts.slice(1).join(" ") || "";

    return {
      firstName: parsed.firstName || defaultFirstName,
      lastName: parsed.lastName || defaultLastName,
      email: parsed.email || currentUser?.email || "",
      phone: parsed.phone || "",
    };
  });

  // Security Form Fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");


  // Billing states
  const [planInfo, setPlanInfo] = useState<{ plan: string; expires_at: string | null } | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !currentUser) return;
    setPlanLoading(true);
    fetch("/api/user/plan", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlanInfo(data); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const effectivePlan = planInfo?.plan || currentUser?.plan || "Free";

  const allDocs = [
    ...jobs.map(job => ({
      id: job.id,
      file: job.file,
      tool: job.tool,
      size: job.size,
      time: job.status === "Done" ? "Just now" : "Processing",
      downloadUrl: job.downloadUrl
    })),
    ...dashboardJobs
  ];

  const totalMB = allDocs.reduce((acc, doc) => acc + parseSizeToMB(doc.size), 0);
  const maxStorageMB = 100;
  const storagePercentage = Math.min((totalMB / maxStorageMB) * 100, 100);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      showToast(`Uploading ${files[0].name} to workspace...`);
      setTimeout(() => {
        onToolSelect("Edit PDF");
      }, 1200);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      showToast(`Uploading ${files[0].name} to workspace...`);
      setTimeout(() => {
        onToolSelect("Edit PDF");
      }, 1200);
    }
  };

  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDashboardJobs(prev => prev.filter(job => job.id !== id));
    showToast("Document deleted from workspace.");
    setActiveJobId(null);
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://pdfmount.online/shared/${id}`);
    showToast("Share link copied to clipboard!");
    setActiveJobId(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim();
    const saveData = {
      ...profileData,
      fullName
    };
    localStorage.setItem(`user_profile_${currentUser?.email}`, JSON.stringify(saveData));
    if (onUpdateUser && currentUser) {
      onUpdateUser({
        ...currentUser,
        name: fullName || currentUser.name
      });
    }
    showToast("Profile saved successfully!");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("userAvatar", base64);
        showToast("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      showToast("Please fill all password fields.");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("Passwords do not match.");
      return;
    }
    showToast("Password updated successfully!");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };



  const favoriteTools = [
    { name: "PDF to Word", desc: "Convert PDF to DOCX", toolName: "PDF to Word", icon: FileText },
    { name: "Form Filler", desc: "Fill out PDF sheets", toolName: "PDF Annotator", icon: Edit },
    { name: "E-Signature", desc: "Sign legal documents", toolName: "Sign PDF", icon: Stamp },
    { name: "Compress", desc: "Reduce visual file size", toolName: "Compress PDF", icon: Archive }
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "profile": return "Edit Profile";
      case "security": return "Security & Access";
      case "billing": return "Billing & Plans";
      case "tools": return "Tools Directory";
      default: return "Dashboard";
    }
  };

  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", height: "calc(100vh - 60px)", backgroundColor: "#ffffff", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "40px 24px 0 24px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0, boxSizing: "border-box" }}>
        
        {/* â”€â”€ Breadcrumbs â”€â”€ */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--v2-text-muted)", marginBottom: "32px", fontWeight: 500, flexShrink: 0 }}>
          <span style={{ cursor: "pointer" }} onClick={onBack}>My Account</span>
          <ChevronRight size={14} style={{ color: "var(--v2-text-light)" }} />
          <span style={{ color: "var(--v2-text-main)", fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
        </div>

        {/* â”€â”€ Dashboard Layout Grid â”€â”€ */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px", alignItems: "flex-start", flex: 1, minHeight: 0, overflow: "hidden", width: "100%" }}>
          
          {/* â”€â”€ Left Sidebar Navigation Placeholder â”€â”€ */}
          <div style={{ width: "240px", flexShrink: 0 }}>
            <aside style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "24px", 
              width: "240px"
            }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              
              <button 
                onClick={() => setActiveTab("dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "dashboard" ? "var(--v2-primary-soft)" : "transparent",
                  color: activeTab === "dashboard" ? "var(--v2-primary)" : "var(--v2-text-muted)",
                  fontWeight: activeTab === "dashboard" ? 700 : 500,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s"
                }}
              >
                <Grid size={16} /> Dashboard
              </button>

              <button 
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "profile" ? "var(--v2-primary-soft)" : "transparent",
                  color: activeTab === "profile" ? "var(--v2-primary)" : "var(--v2-text-muted)",
                  fontWeight: activeTab === "profile" ? 700 : 500,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s"
                }}
              >
                <User size={16} /> Edit Profile
              </button>

              <button 
                onClick={() => setActiveTab("security")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "security" ? "var(--v2-primary-soft)" : "transparent",
                  color: activeTab === "security" ? "var(--v2-primary)" : "var(--v2-text-muted)",
                  fontWeight: activeTab === "security" ? 700 : 500,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s"
                }}
              >
                <Shield size={16} /> Security & Access
              </button>

              <button 
                onClick={() => setActiveTab("tools")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "tools" ? "var(--v2-primary-soft)" : "transparent",
                  color: activeTab === "tools" ? "var(--v2-primary)" : "var(--v2-text-muted)",
                  fontWeight: activeTab === "tools" ? 700 : 500,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s"
                }}
              >
                <Archive size={16} /> Tools Directory
              </button>

            </div>

            {onLogout && (
              <button 
                onClick={onLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  fontWeight: 500,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  marginTop: "8px"
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--v2-border-light)", margin: "8px 0" }} />
            
            <button 
              onClick={onBack}
              className="v2-pill-outline" 
              style={{ width: "100%", padding: "12px", fontSize: "13px" }}
            >
              Back to Home
            </button>
          </aside>
        </div>

          {/* â”€â”€ Right Content Area â”€â”€ */}
          <main className="narrow-scrollbar" style={{ height: "100%", overflowY: "auto", paddingRight: "16px", paddingBottom: "100px", boxSizing: "border-box" }}>
            
            {/* 1ï¸âƒ£ DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", marginBottom: "28px" }}>
                  <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--v2-text-main)", margin: "0 0 6px 0", letterSpacing: "normal" }}>
                      Welcome back, {profileData.firstName || currentUser?.name?.split(" ")[0] || "User"}
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
                      Manage your processed files, check workspace storage, and browse favorite tools.
                    </p>
                  </div>
                  <div>
                    <button onClick={handleUploadClick} className="v2-pill-primary" style={{ padding: "10px 24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
                      <Plus size={16} /> Upload
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: "none" }} 
                      onChange={handleFileChange} 
                      accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />
                  </div>
                </div>

                {/* Storage Status Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "40px" }}>
                  
                  {/* Card 1: Storage Status & Privacy */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "10px", color: "var(--v2-text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>STORAGE STATUS</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                          <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>Temporary Session</span>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginBottom: "6px" }}>
                          <span style={{ color: "var(--v2-text-muted)" }}>Storage Used</span>
                          <strong style={{ color: "var(--v2-text-main)" }}>{totalMB.toFixed(1)} MB / {maxStorageMB} MB</strong>
                        </div>
                        <div style={{ height: "6px", width: "100%", backgroundColor: "#f4f4f4", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${storagePercentage}%`, backgroundColor: "var(--v2-primary)", borderRadius: "9999px", transition: "width 0.3s ease" }}></div>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "11px", color: "var(--v2-text-muted)", margin: 0, lineHeight: 1.4 }}>
                      To guarantee privacy, we do not store files permanently. Files are processed in-memory and permanently purged after 1 hour.
                    </p>
                  </div>

                  {/* Card 2: Session Files & Countdown */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--v2-text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>SESSION DETAILED STATUS</span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                        {/* Active Workspace Files */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "var(--v2-text-muted)" }}>Active Files</span>
                          <strong style={{ fontSize: "15px", fontWeight: "700", color: "var(--v2-text-main)" }}>{allDocs.length} {allDocs.length === 1 ? "Document" : "Documents"}</strong>
                        </div>

                        {/* Reset Timer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #f4f4f4", marginTop: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Clock size={15} style={{ color: "var(--v2-primary)" }} />
                            <span style={{ fontSize: "12.5px", color: "var(--v2-text-muted)" }}>Auto-deletes in</span>
                          </div>
                          <strong style={{ fontSize: "13.5px", color: "var(--v2-primary)", fontFamily: "monospace" }}>{formatTimer(resetTimer)}</strong>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "11px", color: "var(--v2-text-muted)", margin: 0, lineHeight: 1.4 }}>
                      Your session remains active as long as you keep uploading or processing files.
                    </p>
                  </div>

                </div>

                {/* Recent Documents Table */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--v2-text-main)", margin: 0 }}>
                    Recent Workspace Documents
                  </h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      onClick={() => setIsListView(false)}
                      style={{ border: "none", background: "none", color: !isListView ? "var(--v2-primary)" : "#94a3b8", cursor: "pointer", padding: "4px" }}
                    >
                      <Grid size={16} />
                    </button>
                    <button 
                      onClick={() => setIsListView(true)}
                      style={{ border: "none", background: "none", color: isListView ? "var(--v2-primary)" : "#94a3b8", cursor: "pointer", padding: "4px" }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>

                {isListView ? (
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--v2-border-light)" }}>
                          <th style={{ padding: "12px 20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)" }}>File Name</th>
                          <th style={{ padding: "12px 20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)" }}>Last Modified</th>
                          <th style={{ padding: "12px 20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)" }}>Size</th>
                          <th style={{ padding: "12px 20px", width: "40px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDocs.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: "48px 20px", textAlign: "center", color: "var(--v2-text-muted)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <FileText size={20} style={{ color: "var(--v2-text-muted)" }} />
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 500 }}>No processed files in this workspace session</span>
                                <span style={{ fontSize: "12px", color: "var(--v2-text-light)" }}>Upload a file above to start processing</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          allDocs.map((doc, idx) => (
                            <tr 
                              key={doc.id}
                              style={{ 
                                borderBottom: idx === allDocs.length - 1 ? "none" : "1px solid var(--v2-border-light)",
                                cursor: "pointer"
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                              onClick={() => {
                                if (doc.downloadUrl) {
                                  window.open(doc.downloadUrl, "_blank");
                                } else {
                                  showToast(`Simulated download for ${doc.file}`);
                                }
                              }}
                            >
                              <td style={{ padding: "14px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <FileText size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
                                  <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>{doc.file}</span>
                                </div>
                              </td>
                              <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--v2-text-muted)" }}>{doc.time}</td>
                              <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--v2-text-muted)" }}>{doc.size}</td>
                              <td style={{ padding: "14px 20px", position: "relative" }} onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => setActiveJobId(activeJobId === doc.id ? null : doc.id)}
                                  style={{ border: "none", background: "none", padding: "4px", cursor: "pointer", color: "var(--v2-text-light)" }}
                                >
                                  <MoreHorizontal size={14} />
                                </button>
                                
                                {activeJobId === doc.id && (
                                  <div style={{
                                    position: "absolute", right: "20px", top: "36px",
                                    backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)",
                                    borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                                    zIndex: 10, minWidth: "160px", padding: "4px 0"
                                  }}>
                                    <button 
                                      onClick={() => {
                                        if (doc.downloadUrl) window.open(doc.downloadUrl, "_blank");
                                        else showToast(`Downloading ${doc.file}`);
                                        setActiveJobId(null);
                                      }}
                                      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 14px", border: "none", background: "none", fontSize: "13px", textAlign: "left", cursor: "pointer" }}
                                    >
                                      <Download size={14} /> Download File
                                    </button>
                                    <button 
                                      onClick={(e) => handleCopyLink(doc.id, e)}
                                      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 14px", border: "none", background: "none", fontSize: "13px", textAlign: "left", cursor: "pointer" }}
                                    >
                                      <Copy size={14} /> Copy Share Link
                                    </button>
                                    <hr style={{ border: "none", borderTop: "1px solid var(--v2-border-light)", margin: "4px 0" }} />
                                    <button 
                                      onClick={(e) => handleDeleteJob(doc.id, e)}
                                      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 14px", border: "none", background: "none", fontSize: "13px", color: "#ef4444", textAlign: "left", cursor: "pointer" }}
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: allDocs.length === 0 ? "1fr" : "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                    {allDocs.length === 0 ? (
                      <div style={{ padding: "48px 24px", textAlign: "center", backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "12px", color: "var(--v2-text-muted)" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                          <FileText size={20} style={{ color: "var(--v2-text-muted)" }} />
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px 0" }}>No processed files in this workspace session</p>
                        <p style={{ fontSize: "12px", color: "var(--v2-text-light)", margin: 0 }}>Upload a file above to start processing</p>
                      </div>
                    ) : (
                      allDocs.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => {
                            if (doc.downloadUrl) window.open(doc.downloadUrl, "_blank");
                            else showToast(`Simulated download for ${doc.file}`);
                          }}
                          style={{ 
                            backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", 
                            borderRadius: "12px", padding: "16px", cursor: "pointer",
                            transition: "all 0.2s" 
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.borderColor = "var(--v2-primary)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "var(--v2-border-light)";
                          }}
                        >
                          <div style={{ width: "32px", height: "40px", backgroundColor: "#fef2f2", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                            <FileText size={16} style={{ color: "#ef4444" }} />
                          </div>
                          <strong style={{ fontSize: "13px", display: "block", color: "var(--v2-text-main)", marginBottom: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: 700 }}>
                            {doc.file}
                          </strong>
                          <span style={{ fontSize: "11px", color: "var(--v2-text-muted)" }}>{doc.size}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2ï¸âƒ£ EDIT PROFILE VIEW (Matching Image Fields exactly) */}
            {activeTab === "profile" && (
              <div style={{ border: "1px solid var(--v2-border-light)", borderRadius: "16px", padding: "32px", backgroundColor: "#ffffff" }}>
                
                {/* Header Banner info */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--v2-border-light)", marginBottom: "28px" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--v2-border)", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={40} style={{ color: "var(--v2-text-light)" }} />
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      style={{ display: "none" }} 
                      onChange={handleAvatarChange} 
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--v2-text-main)", margin: "0 0 4px 0" }}>
                      {`${profileData.firstName} ${profileData.lastName}`.trim() || "User Profile"}
                    </h2>
                    <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", margin: "0 0 8px 0" }}>
                      {profileData.email}
                    </p>
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      style={{ border: "none", background: "none", padding: 0, color: "var(--v2-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Change profile photo
                    </button>
                  </div>
                </div>
 
                {/* Form Warning */}
                <div style={{ fontSize: "12px", color: "var(--v2-text-muted)", marginBottom: "24px", fontStyle: "italic" }}>
                  All written information submitted must be in English. All fields marked with * are required.
                </div>
 
                {/* Form fields - Lightweight layout */}
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "640px" }}>
                  
                  {/* Row 1: First Name / Last Name */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        First Name*
                      </label>
                      <input 
                        type="text" 
                        required
                        value={profileData.firstName}
                        onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        Last Name*
                      </label>
                      <input 
                        type="text" 
                        required
                        value={profileData.lastName}
                        onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
 
                  {/* Row 2: Email Address / Phone Number */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)" }}>
                          Email Address*
                        </label>
                        <span style={{ fontSize: "10px", color: "var(--v2-text-light)", fontWeight: 500 }}>
                          System Locked
                        </span>
                      </div>
                      <input 
                        type="email" 
                        disabled
                        value={profileData.email}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box", backgroundColor: "#f8fafc", color: "var(--v2-text-muted)" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        Phone Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. +91 98765 43210"
                        value={profileData.phone}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
 
                  <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "8px" }}>
                    <button type="submit" className="v2-pill-primary" style={{ padding: "12px 32px", fontSize: "15px" }}>
                      Save Profile
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* 3ï¸âƒ£ SECURITY VIEW */}
            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                
                {/* Change Password Card */}
                <div style={{ border: "1px solid var(--v2-border-light)", borderRadius: "16px", padding: "32px", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--v2-text-main)", margin: "0 0 6px 0" }}>
                    Change Password
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                    Make sure to use a secure, unique password containing letters, numbers, and symbols.
                  </p>

                  <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        value={currentPass}
                        onChange={e => setCurrentPass(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        New Password
                      </label>
                      <input 
                        type="password" 
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--v2-text-muted)", marginBottom: "6px" }}>
                        Confirm New Password
                      </label>
                      <input 
                        type="password" 
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <button type="submit" className="v2-pill-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
                        Update Password
                      </button>
                    </div>

                  </form>
                </div>



              </div>
            )}

            {/* 5ï¸âƒ£ TOOLS VIEW */}
            {activeTab === "tools" && (
              <div>
                <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
                  <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--v2-text-main)", margin: "0 0 6px 0", letterSpacing: "normal" }}>
                      Quick Tool Access
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
                      Quickly click any shortcut to start editing your files in our workspace.
                    </p>
                  </div>
                  <button 
                    onClick={onBrowseTools}
                    className="v2-pill-outline"
                    style={{ padding: "10px 24px", fontSize: "14px" }}
                  >
                    View All Tools
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  {favoriteTools.map(fav => {
                    const toolColor = getToolColor(fav.toolName);
                    const softBg = `color-mix(in srgb, ${toolColor} 12%, #ffffff)`;
                    return (
                      <button 
                        key={fav.name}
                        onClick={() => onToolSelect(fav.toolName)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid var(--v2-border-light)",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "var(--v2-primary)";
                          e.currentTarget.style.boxShadow = "var(--v2-shadow-md)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "var(--v2-border-light)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <ToolIcon 
                          toolNameOrId={fav.toolName} 
                          size={18} 
                          style={{ 
                            borderRadius: "8px",
                            backgroundColor: isMsOfficeTool(fav.toolName) ? "transparent" : softBg,
                            color: toolColor
                          }} 
                        />
                        <div>
                          <strong style={{ fontSize: "15px", display: "block", color: "var(--v2-text-main)", fontWeight: 700 }}>{fav.name}</strong>
                          <span style={{ fontSize: "13px", color: "var(--v2-text-muted)" }}>{fav.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          backgroundColor: "var(--v2-primary)", color: "#ffffff",
          padding: "14px 24px", borderRadius: "9999px",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.2)",
          animation: "slideUp 0.3s ease-out"
        }}>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

