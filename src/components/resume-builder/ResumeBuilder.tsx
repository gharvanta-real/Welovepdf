import React, { useState, useRef } from "react";
import { OnboardingWizard } from "./OnboardingWizard";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { compileResumeToHtml, COLOR_SCHEMES, FONT_COMBINATIONS, TEMPLATES, SAMPLE_RESUME_DATA } from "./templates";
import { ResumeData, ResumeStyles, OnboardingState, SpacingMode } from "./types";
import { FileText, Edit, Check, Settings2, Download, Undo2, Upload, ChevronDown } from "lucide-react";
import { exportToPdf } from "../document-editor/printService";
import { openInGoogleDocs } from "../../services/googleDrive";
import "../../styles/ResumeBuilder.css";

interface ResumeBuilderProps {
  onBack: () => void;
  onToolSelect: (toolName: string) => void;
}

export function ResumeBuilder({ onBack, onToolSelect }: ResumeBuilderProps) {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState<boolean>(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState<boolean>(false);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
  
  // Zoom mode and custom scaling
  const [zoomMode, setZoomMode] = useState<"auto" | "manual">("auto");
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // default 85% manual zoom

  // Backup Import Input Ref
  const importInputRef = useRef<HTMLInputElement>(null);

  // Styles selection
  const [styles, setStyles] = useState<ResumeStyles>({
    templateId: "traditional",
    colorScheme: "navy",
    fontFamily: "modern",
    spacing: "normal",
    showIcons: true
  });

  // Main Resume Data state
  const [resumeData, setResumeData] = useState<ResumeData>({
    basics: { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: ""
  });

  // Export JSON Backup file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ resumeData, styles }, null, 2));
    const downloadAnchor = document.createElement("a");
    const docTitle = resumeData.basics.name ? `resume_${resumeData.basics.name.toLowerCase().replace(/\s+/g, "_")}_backup.json` : "resume_backup.json";
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", docTitle);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger file dialog
  const triggerImportInput = () => {
    importInputRef.current?.click();
  };

  // Process uploaded JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.resumeData && parsed.styles) {
          setResumeData(parsed.resumeData);
          setStyles(parsed.styles);
          setIsOnboarding(false);
        } else {
          alert("Invalid backup file format. Make sure it contains resumeData and styles.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    e.target.value = "";
  };

  // On onboarding complete
  const handleOnboardingComplete = (wizardState: OnboardingState) => {
    setIsOnboarding(false);

    // 1. Initialise templates and colors based on ATS vs Recruiter choice
    setStyles({
      templateId: (wizardState.selectedTemplateId || "traditional") as import('./types').TemplateId,
      colorScheme: wizardState.focus === "recruiters" ? "royal" : "minimal-black",
      fontFamily: wizardState.focus === "ats" ? "classic" : "modern",
      spacing: "normal",
      showIcons: wizardState.focus === "ats" ? false : true // ATS focus defaults to clean text (no icons)
    });

    // 2. Pre-populate data based on user choice
    const anyState = wizardState as any;
    if (anyState._parsedData) {
      // User uploaded PDF or pasted text — use parsed resume data
      setResumeData(anyState._parsedData);
    } else if (wizardState.hasExistingResume) {
      // User chose "Load Sample Data"
      setResumeData(SAMPLE_RESUME_DATA);
    } else {
      // Start from scratch — empty structure with job title pre-filled
      setResumeData({
        basics: {
          name: "",
          label: wizardState.position || "",
          email: "",
          phone: "",
          url: "",
          summary: "",
          location: ""
        },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: ""
      });
    }
  };


  // PDF direct printing
  const handleDownloadPdf = () => {
    const html = compileResumeToHtml(resumeData, styles);
    const pdfTitle = resumeData.basics.name ? `Resume - ${resumeData.basics.name}` : "Resume";
    exportToPdf(html, pdfTitle);
  };

  // Google Docs Export Handler
  const [isGoogleDocsLoading, setIsGoogleDocsLoading] = useState(false);
  const [googleDocsStatus, setGoogleDocsStatus] = useState('');

  const handleEditInGoogleDocs = async () => {
    const html = compileResumeToHtml(resumeData, styles);
    const docTitle = resumeData.basics.name
      ? `Resume - ${resumeData.basics.name}`
      : 'Resume';

    setIsGoogleDocsLoading(true);
    setGoogleDocsStatus('Connecting to Google...');
    try {
      await openInGoogleDocs(html, docTitle, (msg) => setGoogleDocsStatus(msg));
      setGoogleDocsStatus('Opened in Google Docs!');
    } catch (err: any) {
      setErrorModalMsg(err.message || String(err));
      setGoogleDocsStatus('');
    } finally {
      setIsGoogleDocsLoading(false);
      setTimeout(() => setGoogleDocsStatus(''), 3000);
    }
  };

  // If in onboarding step, show onboarding wizard
  if (isOnboarding) {
    return (
      <div className="rb-root-wrapper onboarding-active theme-blue">
        <OnboardingWizard 
          onBackToApp={onBack}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  // Otherwise, render full workspace splits
  return (
    <div className="rb-root-wrapper workspace-active theme-blue">
      {/* Workspace Top Toolbar */}
      <header className="rb-workspace-header">
        <div className="rb-header-left">
          <button
            className="rb-back-btn"
            onClick={() => {
              if (window.confirm('Start a new resume? All current changes will be lost.')) {
                setIsOnboarding(true);
              }
            }}
          >
            <Undo2 size={16} /> New Resume
          </button>
          <div className="rb-header-title-block">
            <h1 className="rb-header-title">Resume Builder</h1>
            <span className="rb-header-subtitle">
              {resumeData.basics.name ? `Editing: ${resumeData.basics.name}` : "New Resume"}
            </span>
          </div>
        </div>

        <div className="rb-header-actions">
          {/* Hidden File Input for Import */}
          <input 
            type="file" 
            ref={importInputRef} 
            style={{ display: "none" }} 
            accept=".json" 
            onChange={handleImportJson} 
          />

          <button className="rb-action-btn rb-btn-outline" onClick={() => setIsDesignModalOpen(true)}>
            <Settings2 size={16} /> Customize Design
          </button>

          {/* More Actions Dropdown Menu */}
          <div className="rb-dropdown-container">
            <button 
              className={`rb-action-btn rb-btn-outline rb-dropdown-trigger ${isActionsDropdownOpen ? "active" : ""}`}
              onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
            >
              More Actions <ChevronDown size={14} />
            </button>
            
            {isActionsDropdownOpen && (
              <>
                <div className="rb-dropdown-backdrop" onClick={() => setIsActionsDropdownOpen(false)} />
                <div className="rb-dropdown-menu">
                  <button className="rb-dropdown-item" onClick={() => { handleExportJson(); setIsActionsDropdownOpen(false); }}>
                    <Download size={14} /> Export Backup (JSON)
                  </button>
                  <button className="rb-dropdown-item" onClick={() => { triggerImportInput(); setIsActionsDropdownOpen(false); }}>
                    <Upload size={14} /> Import Backup (JSON)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Download PDF — Primary visible action */}
          <button
            className="rb-action-btn rb-btn-outline rb-btn-download"
            onClick={handleDownloadPdf}
            title="Download as PDF"
          >
            <FileText size={16} /> Download PDF
          </button>
          <button
            className="rb-action-btn rb-btn-primary rb-btn-gdocs"
            onClick={handleEditInGoogleDocs}
            disabled={isGoogleDocsLoading}
          >
            {isGoogleDocsLoading ? (
              <>
                <span className="rb-spinner" />
                {googleDocsStatus || 'Opening...'}
              </>
            ) : (
              <><Edit size={16} /> Edit in Google Docs</>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Panels (Now cleaner 2-Column layout) */}
      <div className="rb-workspace-body">
        {/* Left Panel: Accordion Input Form */}
        <div className="rb-left-panel">
          <div className="rb-panel-header">
            <h2>Resume Details</h2>
          </div>
          <div className="rb-panel-content">
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </div>
        </div>

        {/* Right Panel: Print Preview Canvas */}
        <div className="rb-right-panel">
          <div className="rb-panel-header rb-preview-header">
            <h2>Realtime Preview (A4)</h2>
            <div className="rb-zoom-controls">
              <button 
                className={`rb-zoom-mode-btn ${zoomMode === "auto" ? "active" : ""}`}
                onClick={() => setZoomMode("auto")}
              >
                Auto Fit
              </button>
              <button 
                className="rb-zoom-btn"
                title="Zoom Out"
                onClick={() => {
                  setZoomMode("manual");
                  setZoomLevel(prev => Math.max(0.4, Number((prev - 0.05).toFixed(2))));
                }}
              >
                －
              </button>
              <span className="rb-zoom-percent">
                {zoomMode === "auto" ? "Fit" : `${Math.round(zoomLevel * 100)}%`}
              </span>
              <button 
                className="rb-zoom-btn"
                title="Zoom In"
                onClick={() => {
                  setZoomMode("manual");
                  setZoomLevel(prev => Math.min(1.5, Number((prev + 0.05).toFixed(2))));
                }}
              >
                ＋
              </button>
            </div>
          </div>
          <div className="rb-panel-content preview-scrollable">
            <ResumePreview 
              data={resumeData} 
              styles={styles} 
              zoomMode={zoomMode} 
              zoomLevel={zoomLevel} 
            />
          </div>
        </div>
      </div>

      {/* Design Presets Modal Dialog */}
      {isDesignModalOpen && (
        <div className="rb-modal-overlay" onClick={() => setIsDesignModalOpen(false)}>
          <div className="rb-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rb-modal-header">
              <h3>Customize Resume Design</h3>
              <button className="rb-modal-close-btn" onClick={() => setIsDesignModalOpen(false)}>✕</button>
            </div>
            
            <div className="rb-modal-body">
              {/* Left Column: Color & Typography */}
              <div className="rb-modal-col">
                {/* Color Scheme Picker */}
                <div className="rb-cust-section">
                  <span className="rb-cust-label">Primary Color</span>
                  <div className="rb-color-picker-grid">
                    {COLOR_SCHEMES.map((c) => (
                      <button
                        key={c.id}
                        className={`rb-color-swatch ${styles.colorScheme === c.id ? "active" : ""}`}
                        style={{ backgroundColor: c.primary }}
                        title={c.name}
                        onClick={() => setStyles((prev) => ({ ...prev, colorScheme: c.id as import('./types').ColorSchemeId }))}
                      >
                        {styles.colorScheme === c.id && <Check size={14} className="swatch-check" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Picker */}
                <div className="rb-cust-section">
                  <span className="rb-cust-label">Typography Combination</span>
                  <div className="rb-select-group">
                    {FONT_COMBINATIONS.map((f) => (
                      <button
                        key={f.id}
                        className={`rb-select-option-btn ${styles.fontFamily === f.id ? "active" : ""}`}
                        onClick={() => setStyles((prev) => ({ ...prev, fontFamily: f.id as import('./types').FontFamilyId }))}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Layout & Spacing */}
              <div className="rb-modal-col">
                {/* Layout Template Picker */}
                <div className="rb-cust-section">
                  <span className="rb-cust-label">Layout Template</span>
                  <div className="rb-templates-list-pane">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        className={`rb-template-select-item ${styles.templateId === t.id ? "active" : ""}`}
                        onClick={() => setStyles((prev) => ({ ...prev, templateId: t.id as import('./types').TemplateId }))}
                      >
                        <div className="rb-template-select-check">
                          <div className={`mock-bullet ${styles.templateId === t.id ? "checked" : ""}`}></div>
                        </div>
                        <div className="rb-template-select-info">
                          <strong className="rb-template-select-name">{t.name}</strong>
                          <span className="rb-template-select-desc">{t.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing Picker */}
                <div className="rb-cust-section">
                  <span className="rb-cust-label">Margin Spacing</span>
                  <div className="rb-spacing-group">
                    {(["compact", "normal", "spacious"] as SpacingMode[]).map((sp) => (
                      <button
                        key={sp}
                        className={`rb-spacing-option-btn ${styles.spacing === sp ? "active" : ""}`}
                        onClick={() => setStyles((prev) => ({ ...prev, spacing: sp }))}
                      >
                        {sp.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show/Hide Contact Emojis Toggle */}
                <div className="rb-cust-section" style={{ marginTop: "16px" }}>
                  <label className="rb-toggle-container" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={styles.showIcons}
                      onChange={(e) => setStyles((prev) => ({ ...prev, showIcons: e.target.checked }))}
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563EB" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#1F2937" }}>
                      Show contact icons (Emojis)
                    </span>
                  </label>
                  <span style={{ display: "block", fontSize: "11px", color: "#6B7280", marginTop: "4px", lineHeight: 1.4 }}>
                    Turn off icons for strict corporate layouts or ATS compatibility.
                  </span>
                </div>
              </div>
            </div>
            <div className="rb-modal-footer">
              <button className="rb-btn rb-btn-teal" style={{ padding: "10px 24px", fontSize: "14px", width: "100%" }} onClick={() => setIsDesignModalOpen(false)}>
                Apply Customizations
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Alert/Warning Modal (Less Roundness Card) */}
      {errorModalMsg && (
        <div className="rb-alert-modal-overlay">
          <div className="rb-alert-modal-card">
            <div className="rb-alert-modal-header">
              <h4>Google Docs Integration Notice</h4>
            </div>
            <div className="rb-alert-modal-body">
              <p>{errorModalMsg}</p>
            </div>
            <div className="rb-alert-modal-footer">
              <button 
                className="rb-alert-modal-close-btn" 
                onClick={() => setErrorModalMsg(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
