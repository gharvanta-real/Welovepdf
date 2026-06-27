import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CpuIcon,
  CheckCircle,
  Download01Icon,
  NotebookIcon
} from "@hugeicons/core-free-icons";

interface AdminTemplateItem {
  id: string;
  name: string;
  description: string;
  useCount: number;
  status: "Active" | "Draft";
  created: string;
  html: string;
}

export function AdminResumeTemplates() {
  const [templates, setTemplates] = useState<AdminTemplateItem[]>([
    {
      id: "traditional",
      name: "Traditional Professional",
      description: "Classic black and white layout, ideal for academic and strict corporate roles.",
      useCount: 1420,
      status: "Active",
      created: "2026-01-10",
      html: "<!-- Default Traditional Template -->"
    },
    {
      id: "modern-split",
      name: "Modern Split Column",
      description: "2-column layout emphasizing sidebar details and clear chronological work details.",
      useCount: 980,
      status: "Active",
      created: "2026-02-15",
      html: "<!-- Default Modern Split Template -->"
    },
    {
      id: "executive",
      name: "Executive Centered",
      description: "Centered header design suited for mid to senior leadership profiles.",
      useCount: 640,
      status: "Active",
      created: "2026-03-01",
      html: "<!-- Default Executive Template -->"
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<AdminTemplateItem | null>(templates[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [guidelines, setGuidelines] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [previewTab, setPreviewTab] = useState<"code" | "meta">("code");
  const [toastMessage, setToastMessage] = useState("");

  // Simulated LLM generation steps
  const generationSteps = [
    "Uploading layout reference to Vision Model...",
    "Analyzing structure, grid lines, and column ratios...",
    "Generating semantic markup with clean inline styling...",
    "Adding dynamic handlebar loops ({{basics.name}}, {{#each work}})...",
    "Validating CSS compliance and generating template package..."
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setTemplateName(file.name.split(".")[0].replace(/[_-]/g, " ") + " AI");
    }
  };

  const handleGenerateTemplate = () => {
    if (!uploadedFile) {
      alert("Please upload a resume design image/screenshot first.");
      return;
    }
    if (!templateName.trim()) {
      alert("Please enter a name for the new template.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            // Add new mock AI-generated template to list
            const newTemplate: AdminTemplateItem = {
              id: templateName.toLowerCase().replace(/\s+/g, "-"),
              name: templateName,
              description: `AI-generated template from design: ${uploadedFile.name}. Guidelines applied: ${guidelines || "None"}`,
              useCount: 0,
              status: "Draft",
              created: new Date().toISOString().split("T")[0],
              html: `<!-- AI Generated Template: ${templateName} -->\n<div style="font-family: var(--font-body); padding: 30px; background-color: #fff;">\n  <header style="border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px;">\n    <h1 style="font-size: 24pt; color: #1B1B1B; margin: 0;">{{basics.name}}</h1>\n    <p style="font-size: 11pt; color: #4B5563; margin: 4px 0 0 0;">{{basics.label}}</p>\n  </header>\n  \n  <section style="margin-bottom: 20px;">\n    <h2 style="font-size: 14pt; color: #2563EB; text-transform: uppercase;">Experience</h2>\n    {{#each work}}\n    <div style="margin-bottom: 12px;">\n      <strong style="font-size: 11pt;">{{position}}</strong> at <span>{{company}}</span>\n      <div style="font-size: 9.5pt; color: #6B7280;">{{startDate}} - {{endDate}}</div>\n    </div>\n    {{/each}}\n  </section>\n</div>`
            };

            setTemplates((prevList) => [...prevList, newTemplate]);
            setSelectedTemplate(newTemplate);
            setIsGenerating(false);
            setUploadedFile(null);
            setGuidelines("");
            setToastMessage("AI Template generated and added to drafts!");
          }, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const handleStatusToggle = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "Active" ? "Draft" : "Active";
          if (selectedTemplate?.id === id) {
            setSelectedTemplate({ ...t, status: nextStatus });
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    setToastMessage("Template status updated.");
  };

  return (
    <div className="admin-page-container">
      {toastMessage && (
        <div className="admin-toast success" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "var(--admin-primary)", color: "#fff", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HugeiconsIcon icon={CheckCircle} size={16} />
            <span>{toastMessage}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToastMessage("")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" }}>×</button>
        </div>
      )}

      {/* Stats Summary Strip */}
      <div className="admin-overview-header-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
        <div className="admin-metric-card" style={{ minHeight: "100px", padding: "18px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Templates</span>
          <strong style={{ fontSize: "28px", fontWeight: 600, color: "var(--admin-text-primary)", marginTop: "6px" }}>{templates.length}</strong>
        </div>
        <div className="admin-metric-card" style={{ minHeight: "100px", padding: "18px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Layouts</span>
          <strong style={{ fontSize: "28px", fontWeight: 600, color: "var(--admin-text-primary)", marginTop: "6px" }}>
            {templates.filter((t) => t.status === "Active").length}
          </strong>
        </div>
        <div className="admin-metric-card" style={{ minHeight: "100px", padding: "18px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Compilations</span>
          <strong style={{ fontSize: "28px", fontWeight: 600, color: "var(--admin-text-primary)", marginTop: "6px" }}>3,040</strong>
        </div>
      </div>

      <div className="admin-split-layout" style={{ display: "flex", gap: "24px" }}>
        {/* Left Column — List & Upload */}
        <div className="admin-split-left" style={{ flex: 1, minWidth: "320px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* AI Generator Panel */}
          <div className="admin-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <HugeiconsIcon icon={CpuIcon} size={20} color="var(--admin-accent)" />
              <h3 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>AI Template Generator</h3>
            </div>
            
            <p style={{ fontSize: "12.5px", color: "var(--admin-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Upload any resume layout design (image/screenshot). Our Vision LLM will automatically parse the layout, write dynamic HTML/CSS code, and inject data placeholders.
            </p>

            <div 
              style={{
                border: "2px dashed var(--admin-border)",
                borderRadius: "8px",
                padding: "24px 16px",
                textAlign: "center",
                background: "var(--admin-surface-low)",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => document.getElementById("ai-file-upload")?.click()}
            >
              <input
                id="ai-file-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <HugeiconsIcon icon={Download01Icon} size={32} color="var(--admin-text-secondary)" style={{ margin: "0 auto 10px", display: "block" }} />
              {uploadedFile ? (
                <div>
                  <strong style={{ fontSize: "12px", color: "var(--admin-text-primary)" }}>{uploadedFile.name}</strong>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: "4px" }}>
                    Click to change design file
                  </span>
                </div>
              ) : (
                <div>
                  <strong style={{ fontSize: "12.5px", color: "var(--admin-text-primary)", display: "block" }}>
                    Upload Resume Screenshot
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", display: "block", marginTop: "4px" }}>
                    Supports PNG, JPG, or PDF previews
                  </span>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="admin-form-group animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>Template Name</label>
                <input
                  type="text"
                  className="admin-input-field"
                  placeholder="e.g. Modern Minimalist Teal"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "8px 12px", color: "var(--admin-text-primary)", fontSize: "13px" }}
                />

                <label style={{ fontSize: "12px", fontWeight: 500, marginTop: "6px" }}>Additional LLM Prompt Guidelines (Optional)</label>
                <textarea
                  className="admin-input-field"
                  rows={3}
                  placeholder="e.g. Use sans-serif Inter font, keep page margins to 24px, color accent should be dark slate."
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "8px 12px", color: "var(--admin-text-primary)", fontSize: "12.5px", resize: "none" }}
                />

                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleGenerateTemplate}
                  disabled={isGenerating}
                  style={{ width: "100%", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <HugeiconsIcon icon={CpuIcon} size={16} />
                  {isGenerating ? "Processing AI Generation..." : "Generate AI Template Code"}
                </button>
              </div>
            )}

            {isGenerating && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="admin-spinner" style={{ width: "14px", height: "14px", border: "2px solid var(--admin-border)", borderTopColor: "var(--admin-primary)", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  <strong style={{ fontSize: "12px" }}>AI Engine Step {generationStep + 1} of {generationSteps.length}</strong>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)", lineHeight: 1.4 }}>
                  {generationSteps[generationStep]}
                </div>
                <div style={{ width: "100%", height: "4px", background: "var(--admin-surface-low)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%`, height: "100%", background: "var(--admin-primary)", transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}
          </div>

          {/* Template Lists */}
          <div className="admin-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HugeiconsIcon icon={NotebookIcon} size={18} /> Available Templates
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: selectedTemplate?.id === t.id ? "1.5px solid var(--admin-primary)" : "1.5px solid var(--admin-border)",
                    background: selectedTemplate?.id === t.id ? "var(--admin-surface-low)" : "var(--admin-surface)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "13px", color: "var(--admin-text-primary)" }}>{t.name}</strong>
                    <span 
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        background: t.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
                        color: t.status === "Active" ? "#10B981" : "#6B7280"
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                    {t.description.length > 80 ? t.description.slice(0, 80) + "..." : t.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                    <span>Used: {t.useCount} times</span>
                    <span>Created: {t.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Details & Sandbox Code Preview */}
        <div className="admin-split-right" style={{ flex: 1.4, minWidth: "420px" }}>
          {selectedTemplate ? (
            <div className="admin-card" style={{ padding: "24px", minHeight: "560px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px 0" }}>{selectedTemplate.name}</h3>
                  <span style={{ fontSize: "12.5px", color: "var(--admin-text-secondary)" }}>ID: {selectedTemplate.id}</span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => handleStatusToggle(selectedTemplate.id)}
                    className="admin-btn admin-btn-outline" 
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Set as {selectedTemplate.status === "Active" ? "Draft" : "Active"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "8px" }}>
                <button
                  onClick={() => setPreviewTab("code")}
                  style={{
                    background: "none",
                    border: "none",
                    paddingBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: previewTab === "code" ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                    borderBottom: previewTab === "code" ? "2px solid var(--admin-primary)" : "none",
                    cursor: "pointer"
                  }}
                >
                  Template Markup
                </button>
                <button
                  onClick={() => setPreviewTab("meta")}
                  style={{
                    background: "none",
                    border: "none",
                    paddingBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: previewTab === "meta" ? "var(--admin-primary)" : "var(--admin-text-secondary)",
                    borderBottom: previewTab === "meta" ? "2px solid var(--admin-primary)" : "none",
                    cursor: "pointer"
                  }}
                >
                  Layout Guidelines & Metadata
                </button>
              </div>

              {/* Code editor view */}
              {previewTab === "code" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                      Editable HTML/CSS Code Sandbox (uses standard placeholders)
                    </span>
                  </div>
                  <textarea
                    className="admin-code-editor"
                    value={selectedTemplate.html}
                    onChange={(e) => {
                      const updatedHtml = e.target.value;
                      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, html: updatedHtml } : t));
                      setSelectedTemplate(prev => prev ? { ...prev, html: updatedHtml } : null);
                    }}
                    style={{
                      width: "100%",
                      flex: 1,
                      minHeight: "340px",
                      background: "#1E1E1E",
                      color: "#9CDCFE",
                      fontFamily: "Consolas, Monaco, monospace",
                      fontSize: "12px",
                      padding: "16px",
                      border: "none",
                      borderRadius: "8px",
                      lineHeight: 1.6,
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>
              )}

              {/* Metadata view */}
              {previewTab === "meta" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
                  <div>
                    <strong>Description:</strong>
                    <p style={{ color: "var(--admin-text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                    <div>
                      <strong>Created Date:</strong>
                      <div style={{ color: "var(--admin-text-secondary)", marginTop: "4px" }}>{selectedTemplate.created}</div>
                    </div>
                    <div>
                      <strong>Compilation Statistics:</strong>
                      <div style={{ color: "var(--admin-text-secondary)", marginTop: "4px" }}>{selectedTemplate.useCount} times compiled</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "560px", color: "var(--admin-text-secondary)", fontSize: "14px" }}>
              Select a template to view details or generate one using AI on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
