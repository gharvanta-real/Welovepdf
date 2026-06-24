import React, { useState, useRef } from "react";
import { ArrowLeft, Plus, HardDrive, Sparkles, Edit, Stamp, Archive, MoreHorizontal, Grid, List, FileText, Trash2, Download, Copy, ExternalLink, HelpCircle } from "lucide-react";
import { getToolColor, ToolIcon } from "./ToolIcon";

interface UserDashboardPageProps {
  onBack: () => void;
  onToolSelect: (toolName: string) => void;
  onBrowseTools: () => void;
  jobs: any[];
  currentUser: { name: string; email: string } | null;
  onManageSubscription: () => void;
}

export function UserDashboardPage({ onBack, onToolSelect, onBrowseTools, jobs, currentUser, onManageSubscription }: UserDashboardPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dashboardJobs, setDashboardJobs] = useState<{ id: string; file: string; tool: string; size: string; time: string; downloadUrl?: string }[]>([
    { id: "mock-1", file: "Q4_Revenue_Report.pdf", tool: "Compress PDF", size: "4.2 MB", time: "2 hours ago" },
    { id: "mock-2", file: "Client_Proposal_v2.pdf", tool: "PDF to Word", size: "1.8 MB", time: "Yesterday" },
    { id: "mock-3", file: "Legal_Terms_Final.pdf", tool: "Sign PDF", size: "12.5 MB", time: "Oct 24, 2023" },
    { id: "mock-4", file: "Team_Offsite_Agenda.pdf", tool: "Merge PDF", size: "0.9 MB", time: "Oct 20, 2023" }
  ]);
  
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [isListView, setIsListView] = useState(true);

  // Combine parent app jobs with our mock jobs for rendering
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
      processSelectedFiles(files);
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
      processSelectedFiles(files);
    }
  };

  const processSelectedFiles = (files: FileList) => {
    showToast(`Uploading ${files[0].name} to workspace...`);
    
    // Simulate upload finish and staging in a workspace tool
    setTimeout(() => {
      // Pick a default tool like Edit PDF
      onToolSelect("Edit PDF");
    }, 1200);
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

  // Sidebar Favorite Tools matching Figma exactly
  const favoriteTools = [
    { name: "PDF to Word", desc: "Convert PDF to DOCX", toolName: "PDF to Word", color: "var(--s-block-lilac)", icon: FileText },
    { name: "Form Filler", desc: "Fill out PDF sheets", toolName: "Edit PDF", color: "var(--s-block-coral)", icon: Edit },
    { name: "E-Signature", desc: "Sign legal documents", toolName: "Sign PDF", color: "var(--s-block-lime)", icon: Stamp },
    { name: "Compress", desc: "Reduce visual file size", toolName: "Compress PDF", color: "var(--s-block-pink)", icon: Archive }
  ];

  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px" }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="v2-pill-outline"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 20px", 
            fontSize: "14px", 
            marginBottom: "24px"
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Workspace Dashboard
            </span>
            <h1 style={{ fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 600, letterSpacing: "-0.6px", margin: "8px 0 0 0", color: "var(--v2-text-main)", lineHeight: 1.15 }}>
              Welcome back, {currentUser?.name || currentUser?.email?.split("@")[0] || "User"}
            </h1>
          </div>
        </div>

        {/* Hero Upload/Status Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>
          
          {/* Mint Upload Block */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            style={{ 
              gridColumn: "span 2", 
              backgroundColor: "#f4fcf7", 
              borderRadius: "16px", 
              padding: "clamp(24px, 4vw, 40px)", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              cursor: "pointer", 
              border: isDragOver ? "2px solid var(--v2-primary)" : "1.5px dashed #c2ecd5",
              transform: isDragOver ? "scale(1.01)" : "scale(1)",
              transition: "all 0.2s",
              minHeight: "240px"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>GET STARTED</span>
               <h2 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.3px", margin: "12px 0 24px 0", lineHeight: 1.25, color: "var(--v2-text-main)" }}>
                Drop files here to start editing.
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <button className="v2-pill-primary" style={{ padding: "12px 28px", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={16} /> Upload Document
              </button>
              <span style={{ fontSize: "14px", color: "var(--v2-text-muted)", fontWeight: "500" }}>Maximum file size: 500MB</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleFileChange} 
              accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
          </div>

          {/* Harddrive Storage Indicator */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--v2-text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>WORKSPACE STATUS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", marginBottom: "8px" }}>
                    <span style={{ color: "var(--v2-text-muted)", fontWeight: "500" }}>Storage</span>
                    <strong style={{ fontWeight: "700", color: "var(--v2-text-main)" }}>8.2 GB / 20 GB</strong>
                  </div>
                  <div style={{ height: "6px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "41%", backgroundColor: "var(--v2-primary)", borderRadius: "9999px" }}></div>
                  </div>
                </div>
                
                <div>
                  <span style={{ fontSize: "14px", color: "var(--v2-text-muted)", display: "block", fontWeight: "500" }}>Active Projects</span>
                  <strong style={{ fontSize: "20px", fontWeight: "700", display: "block", marginTop: "4px", color: "var(--v2-text-main)" }}>{allDocs.length} Documents</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Split Section: Sidebar favorites vs Content Area recent files */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px", alignItems: "flex-start" }}>
          
          {/* Favorite Tools Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ color: "var(--v2-text-muted)", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                Favorite Tools
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {favoriteTools.map(fav => {
                const FavIcon = fav.icon;
                return (
                  <button 
                    key={fav.name}
                    onClick={() => onToolSelect(fav.toolName)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid var(--v2-border-light)",
                      backgroundColor: "#f8fafc",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "var(--v2-primary)";
                      e.currentTarget.style.boxShadow = "var(--v2-shadow-sm, 0 2px 8px rgba(0,0,0,0.04))";
                      const iconBox = e.currentTarget.querySelector(".icon-box") as HTMLDivElement;
                      if (iconBox) iconBox.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.borderColor = "var(--v2-border-light)";
                      e.currentTarget.style.boxShadow = "none";
                      const iconBox = e.currentTarget.querySelector(".icon-box") as HTMLDivElement;
                      if (iconBox) iconBox.style.transform = "translateY(0)";
                    }}
                  >
                    <div 
                      className="icon-box"
                      style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "8px", 
                        backgroundColor: fav.color, 
                        color: "var(--v2-primary)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        transition: "transform 0.2s" 
                      }}
                    >
                      <FavIcon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "16px", display: "block", color: "var(--v2-text-main)", fontWeight: "700" }}>{fav.name}</strong>
                      <span style={{ fontSize: "13px", color: "var(--v2-text-muted)" }}>{fav.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={onBrowseTools}
              className="v2-pill-outline" 
              style={{ width: "100%", padding: "14px", fontSize: "14px" }}
            >
              Browse All Tools
            </button>
          </aside>

          {/* Recent Documents Section */}
          <section style={{ flex: "1 1 500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ color: "var(--v2-text-muted)", textTransform: "uppercase", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                Recent Documents
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => setIsListView(false)}
                  style={{ border: "none", background: "none", color: !isListView ? "var(--v2-primary)" : "#94a3b8", cursor: "pointer", padding: "4px" }}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setIsListView(true)}
                  style={{ border: "none", background: "none", color: isListView ? "var(--v2-primary)" : "#94a3b8", cursor: "pointer", padding: "4px" }}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {isListView ? (
              /* Table Layout */
              <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--v2-border-light)" }}>
                      <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>File Name</th>
                      <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>Last Modified</th>
                      <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>Size</th>
                      <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDocs.map((doc, idx) => (
                      <tr 
                        key={doc.id}
                        style={{ 
                          borderBottom: idx === allDocs.length - 1 ? "none" : "1px solid var(--v2-border-light)",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
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
                        <td style={{ padding: "18px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <FileText size={20} style={{ color: "#ef4444" }} />
                            <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--v2-text-main)" }}>{doc.file}</span>
                          </div>
                        </td>
                        <td style={{ padding: "18px 24px", fontSize: "14px", color: "var(--v2-text-muted)" }}>{doc.time}</td>
                        <td style={{ padding: "18px 24px", fontSize: "14px", color: "var(--v2-text-muted)" }}>{doc.size}</td>
                        <td style={{ padding: "18px 24px", position: "relative" }} onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => setActiveJobId(activeJobId === doc.id ? null : doc.id)}
                            style={{ border: "none", background: "none", padding: "6px", cursor: "pointer", color: "var(--v2-text-muted)" }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {activeJobId === doc.id && (
                            <div style={{
                              position: "absolute",
                              right: "24px",
                              top: "44px",
                              backgroundColor: "#ffffff",
                              border: "1px solid var(--v2-border-light)",
                              borderRadius: "8px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                              zIndex: 10,
                              minWidth: "160px",
                              padding: "4px 0"
                            }}>
                              <button 
                                onClick={(e) => {
                                  if (doc.downloadUrl) {
                                    window.open(doc.downloadUrl, "_blank");
                                  } else {
                                    showToast(`Downloading ${doc.file}`);
                                  }
                                  setActiveJobId(null);
                                }}
                                style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 16px", border: "none", background: "none", fontSize: "13px", textAlign: "left", cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--s-surface-low)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                <Download size={14} /> Download File
                              </button>
                              <button 
                                onClick={(e) => handleCopyLink(doc.id, e)}
                                style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 16px", border: "none", background: "none", fontSize: "13px", textAlign: "left", cursor: "pointer", color: "var(--v2-text-main)" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                <Copy size={14} /> Copy Share Link
                              </button>
                              <hr style={{ border: "none", borderTop: "1px solid var(--v2-border-light)", margin: "4px 0" }} />
                              <button 
                                onClick={(e) => handleDeleteJob(doc.id, e)}
                                style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 16px", border: "none", background: "none", fontSize: "13px", color: "#ef4444", textAlign: "left", cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid Layout */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                {allDocs.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => {
                      if (doc.downloadUrl) {
                        window.open(doc.downloadUrl, "_blank");
                      } else {
                        showToast(`Simulated download for ${doc.file}`);
                      }
                    }}
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid var(--v2-border-light)", 
                      borderRadius: "12px", 
                      padding: "20px", 
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" 
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "var(--v2-primary)";
                      e.currentTarget.style.boxShadow = "var(--v2-shadow-md)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--v2-border-light)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ width: "36px", height: "48px", backgroundColor: "#fef2f2", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                      <FileText size={18} style={{ color: "#ef4444" }} />
                    </div>
                    <strong style={{ fontSize: "14px", display: "block", color: "var(--v2-text-main)", marginBottom: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: "700" }} title={doc.file}>
                      {doc.file}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--v2-text-muted)", display: "block", fontWeight: "500" }}>{doc.size} • {doc.time}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          backgroundColor: "var(--v2-primary)",
          color: "#ffffff",
          padding: "14px 24px",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.2)",
          animation: "slideUp 0.3s ease-out"
        }}>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
