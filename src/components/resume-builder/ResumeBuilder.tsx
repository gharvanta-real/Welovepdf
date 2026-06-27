import React, { useState, useRef, useEffect } from "react";
import { OnboardingWizard } from "./OnboardingWizard";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { compileResumeToHtml, COLOR_SCHEMES, FONT_COMBINATIONS, TEMPLATES, SAMPLE_RESUME_DATA } from "./templates";
import { ResumeData, ResumeStyles, OnboardingState, SpacingMode } from "./types";
import { FileText, Edit, Check, Settings2, Download, Undo2, Upload, ChevronDown } from "lucide-react";
import { exportToPdf } from "../document-editor/printService";
import { openInGoogleDocs } from "../../services/googleDrive";
import "../../styles/ResumeBuilder.css";

const POPULAR_FONTS = [
  "Poppins", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Oswald", "Nunito", "Raleway", "Ubuntu", "Merriweather", "Lora",
  "Playfair Display", "Fira Sans", "PT Sans", "PT Serif", "Work Sans",
  "Quicksand", "Inconsolata", "Source Sans 3", "Alegreya", "EB Garamond",
  "Mulish", "Cabin", "Heebo", "Kanit", "Dosis", "Manrope", "Outfit",
  "Cinzel", "Libre Baskerville", "Cardo", "DM Sans", "Josefin Sans"
];

interface ResumeBuilderProps {
  onBack: () => void;
  onToolSelect: (toolName: string) => void;
}

export function ResumeBuilder({ onBack, onToolSelect }: ResumeBuilderProps) {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => {
    try {
      const savedData = localStorage.getItem("pdfmount_resume_data");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.basics?.name?.trim() || parsed.work?.length > 0 || parsed.education?.length > 0) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  });
  const [isDesignModalOpen, setIsDesignModalOpen] = useState<boolean>(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState<boolean>(false);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
  const [showFontSuggestions, setShowFontSuggestions] = useState<boolean>(false);
  
  // Zoom mode and custom scaling
  const [zoomMode, setZoomMode] = useState<"auto" | "manual">("auto");
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // default 85% manual zoom

  // Backup Import Input Ref
  const importInputRef = useRef<HTMLInputElement>(null);

  // Styles selection
  const [styles, setStyles] = useState<ResumeStyles>(() => {
    try {
      const saved = localStorage.getItem("pdfmount_resume_styles");
      return saved ? JSON.parse(saved) : {
        templateId: "traditional",
        colorScheme: "navy",
        fontFamily: "modern",
        spacing: "normal",
        showIcons: true,
        fontSize: "normal",
        titleWork: "",
        titleEducation: "",
        titleSkills: "",
        titleProjects: "",
        titleCertifications: ""
      };
    } catch {
      return {
        templateId: "traditional",
        colorScheme: "navy",
        fontFamily: "modern",
        spacing: "normal",
        showIcons: true,
        fontSize: "normal",
        titleWork: "",
        titleEducation: "",
        titleSkills: "",
        titleProjects: "",
        titleCertifications: ""
      };
    }
  });

  // Main Resume Data state
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem("pdfmount_resume_data");
      return saved ? JSON.parse(saved) : {
        basics: { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: ""
      };
    } catch {
      return {
        basics: { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" },
        work: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: ""
      };
    }
  });

  // Auto-save styles to localStorage when modified
  useEffect(() => {
    localStorage.setItem("pdfmount_resume_styles", JSON.stringify(styles));
  }, [styles]);

  // Auto-save resumeData to localStorage when modified
  useEffect(() => {
    localStorage.setItem("pdfmount_resume_data", JSON.stringify(resumeData));
  }, [resumeData]);

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
      showIcons: wizardState.focus === "ats" ? false : true, // ATS focus defaults to clean text (no icons)
      fontSize: "normal",
      titleWork: "",
      titleEducation: "",
      titleSkills: "",
      titleProjects: "",
      titleCertifications: ""
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

  // Word (.doc) direct client-side export
  const handleDownloadDoc = () => {
    const html = compileResumeToHtml(resumeData, styles);
    // Wrap with MS Word meta headers to ensure proper layout and font rendering
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Document to Word</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + html + footer;
    
    const blob = new Blob(['\ufeff' + sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    const docTitle = resumeData.basics.name 
      ? `Resume_${resumeData.basics.name.replace(/\s+/g, "_")}.doc` 
      : "Resume.doc";
    downloadAnchor.href = url;
    downloadAnchor.download = docTitle;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
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

  const filteredFonts = (styles.customFontFamily || "").trim()
    ? POPULAR_FONTS.filter(f => f.toLowerCase().includes((styles.customFontFamily || "").toLowerCase())).slice(0, 5)
    : POPULAR_FONTS.slice(0, 5);

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
                const freshData = {
                  basics: { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" },
                  work: [],
                  education: [],
                  skills: [],
                  projects: [],
                  certifications: [],
                  languages: ""
                };
                setResumeData(freshData);
                localStorage.setItem("pdfmount_resume_data", JSON.stringify(freshData));
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

          {isGoogleDocsLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#2563EB", marginRight: "6px", fontWeight: 500 }}>
              <span className="rb-spinner" style={{ width: "12px", height: "12px", border: "2px solid #2563EB", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
              {googleDocsStatus || 'Connecting...'}
            </div>
          )}

          <button className="rb-action-btn rb-btn-outline" onClick={() => setIsDesignModalOpen(true)}>
            <Settings2 size={16} /> Customize Design
          </button>

          {/* Consolidated Export / Download Dropdown Menu */}
          <div className="rb-dropdown-container">
            <button 
              className={`rb-action-btn rb-btn-primary rb-dropdown-trigger ${isActionsDropdownOpen ? "active" : ""}`}
              onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
              style={{ display: "flex", gap: "6px", alignItems: "center", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none" }}
            >
              <Download size={16} /> Download & Export <ChevronDown size={14} />
            </button>
            
            {isActionsDropdownOpen && (
              <>
                <div className="rb-dropdown-backdrop" onClick={() => setIsActionsDropdownOpen(false)} />
                <div className="rb-dropdown-menu" style={{ minWidth: "240px", right: 0, left: "auto" }}>
                  <button className="rb-dropdown-item" onClick={() => { handleDownloadPdf(); setIsActionsDropdownOpen(false); }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#EF4444" />
                        <text x="12" y="14" fill="#FFFFFF" fontSize="8px" fontWeight="bold" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif">PDF</text>
                      </svg>
                      Download PDF
                    </span>
                  </button>

                  <button className="rb-dropdown-item" onClick={() => { handleDownloadDoc(); setIsActionsDropdownOpen(false); }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                      <img 
                        src="/microsoft-word.svg" 
                        alt="Word" 
                        style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: 0, display: "block" }} 
                      />
                      Download Word (.doc)
                    </span>
                  </button>

                  <button 
                    className="rb-dropdown-item" 
                    onClick={() => { handleEditInGoogleDocs(); setIsActionsDropdownOpen(false); }}
                    disabled={isGoogleDocsLoading}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="4" y="3" width="16" height="18" rx="2" fill="#4285F4" />
                        <rect x="7" y="7" width="10" height="2" rx="0.5" fill="#FFFFFF" />
                        <rect x="7" y="11" width="10" height="2" rx="0.5" fill="#FFFFFF" />
                        <rect x="7" y="15" width="6" height="2" rx="0.5" fill="#FFFFFF" />
                      </svg>
                      Edit in Google Docs
                    </span>
                  </button>

                  <div style={{ height: "1px", background: "#E5E7EB", margin: "6px 0" }} />

                  <button className="rb-dropdown-item" onClick={() => { handleExportJson(); setIsActionsDropdownOpen(false); }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Download size={15} style={{ color: "#4B5563" }} />
                      Export Backup (JSON)
                    </span>
                  </button>

                  <button className="rb-dropdown-item" onClick={() => { triggerImportInput(); setIsActionsDropdownOpen(false); }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Upload size={15} style={{ color: "#4B5563" }} />
                      Import Backup (JSON)
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
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

                    {/* Custom Color Selector Swatch */}
                    <div style={{ position: "relative", width: "36px", height: "36px" }}>
                      <input
                        type="color"
                        value={styles.colorScheme === "custom" && styles.customColor ? styles.customColor : "#2563EB"}
                        onChange={(e) => setStyles((prev) => ({ 
                          ...prev, 
                          colorScheme: "custom", 
                          customColor: e.target.value 
                        }))}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                          zIndex: 10
                        }}
                      />
                      <button
                        className={`rb-color-swatch custom-swatch ${styles.colorScheme === "custom" ? "active" : ""}`}
                        style={{
                          background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                          width: "100%",
                          height: "100%",
                          border: "1.5px solid #dbeafe"
                        }}
                        title="Choose custom color"
                      >
                        {styles.colorScheme === "custom" ? (
                          <Check size={14} className="swatch-check" style={{ color: "#FFFFFF", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }} />
                        ) : (
                          <span style={{ fontSize: "16px", color: "#FFFFFF", fontWeight: "bold", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>＋</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {styles.colorScheme === "custom" && (
                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#4B5563", fontWeight: 500 }}>Custom HEX:</span>
                      <input
                        type="text"
                        value={styles.customColor || "#2563EB"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStyles((prev) => ({ ...prev, customColor: val }));
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          border: "1px solid #D1D5DB",
                          borderRadius: "4px",
                          width: "90px",
                          textTransform: "uppercase"
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Typography Picker */}
                <div className="rb-cust-section">
                  <span className="rb-cust-label">Typography Combination</span>
                  <div className="rb-select-group" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {FONT_COMBINATIONS.map((f) => (
                      <button
                        key={f.id}
                        className={`rb-select-option-btn ${styles.fontFamily === f.id ? "active" : ""}`}
                        onClick={() => setStyles((prev) => ({ ...prev, fontFamily: f.id as import('./types').FontFamilyId }))}
                      >
                        {f.name}
                      </button>
                    ))}
                    
                    <button
                      className={`rb-select-option-btn ${styles.fontFamily === "custom" ? "active" : ""}`}
                      onClick={() => setStyles((prev) => ({ 
                        ...prev, 
                        fontFamily: "custom",
                        customFontFamily: prev.customFontFamily || "Poppins"
                      }))}
                    >
                      Custom Font
                    </button>
                  </div>

                   {styles.fontFamily === "custom" && (
                    <div style={{ marginTop: "12px", position: "relative" }}>
                      <span className="rb-cust-label" style={{ fontSize: "11.5px", color: "#4B5563", marginBottom: "4px", display: "block" }}>
                        Enter Google Font Name:
                      </span>
                      <input
                        type="text"
                        value={styles.customFontFamily || ""}
                        placeholder="e.g. Poppins, Montserrat, Open Sans, Roboto"
                        onFocus={() => setShowFontSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowFontSuggestions(false), 200)}
                        onChange={(e) => setStyles((prev) => ({ ...prev, customFontFamily: e.target.value }))}
                        style={{
                          padding: "8px 12px",
                          fontSize: "13px",
                          border: "1px solid #D1D5DB",
                          borderRadius: "4px",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                      />
                      
                      {showFontSuggestions && (
                        <div className="rb-autocomplete-dropdown" style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "4px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 1000,
                          marginTop: "4px",
                          maxHeight: "160px",
                          overflowY: "auto"
                        }}>
                          {filteredFonts.length > 0 ? (
                            filteredFonts.map((font) => (
                              <button
                                key={font}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setStyles((prev) => ({ ...prev, customFontFamily: font }));
                                  setShowFontSuggestions(false);
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontFamily: `'${font}', sans-serif`
                                }}
                                className="rb-autocomplete-item"
                              >
                                {font}
                              </button>
                            ))
                          ) : (
                            <div style={{ padding: "8px 12px", fontSize: "12px", color: "#6B7280" }}>
                              Press Enter to use "{styles.customFontFamily}"
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span style={{ fontSize: "10.5px", color: "#6B7280", marginTop: "5px", display: "block", lineHeight: 1.35 }}>
                        Type any font from Google Fonts (e.g. Poppins, Montserrat, Lato). It will load and print dynamically.
                      </span>
                    </div>
                  )}
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

                  {/* Font Size Picker */}
                  <div className="rb-cust-section" style={{ marginTop: "16px" }}>
                    <span className="rb-cust-label">Base Font Size</span>
                    <div className="rb-spacing-group">
                      {(["compact", "normal", "spacious"] as const).map((sz) => (
                        <button
                          key={sz}
                          className={`rb-spacing-option-btn ${styles.fontSize === sz ? "active" : ""}`}
                          onClick={() => setStyles((prev) => ({ ...prev, fontSize: sz }))}
                        >
                          {sz.toUpperCase()}
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

                  {/* Rename Resume Sections */}
                  <div className="rb-cust-section" style={{ marginTop: "16px", borderTop: "1px solid #E5E7EB", paddingTop: "12px" }}>
                    <span className="rb-cust-label" style={{ fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Rename Resume Sections</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "11.5px", color: "#4B5563", minWidth: "90px" }}>Experience:</span>
                        <input
                          type="text"
                          value={styles.titleWork || ""}
                          placeholder="Work Experience"
                          onChange={(e) => setStyles((prev) => ({ ...prev, titleWork: e.target.value }))}
                          style={{ padding: "5px 8px", fontSize: "12.5px", border: "1px solid #D1D5DB", borderRadius: "4px", width: "100%", maxWidth: "150px" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "11.5px", color: "#4B5563", minWidth: "90px" }}>Education:</span>
                        <input
                          type="text"
                          value={styles.titleEducation || ""}
                          placeholder="Education"
                          onChange={(e) => setStyles((prev) => ({ ...prev, titleEducation: e.target.value }))}
                          style={{ padding: "5px 8px", fontSize: "12.5px", border: "1px solid #D1D5DB", borderRadius: "4px", width: "100%", maxWidth: "150px" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "11.5px", color: "#4B5563", minWidth: "90px" }}>Skills:</span>
                        <input
                          type="text"
                          value={styles.titleSkills || ""}
                          placeholder="Skills"
                          onChange={(e) => setStyles((prev) => ({ ...prev, titleSkills: e.target.value }))}
                          style={{ padding: "5px 8px", fontSize: "12.5px", border: "1px solid #D1D5DB", borderRadius: "4px", width: "100%", maxWidth: "150px" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "11.5px", color: "#4B5563", minWidth: "90px" }}>Projects:</span>
                        <input
                          type="text"
                          value={styles.titleProjects || ""}
                          placeholder="Projects"
                          onChange={(e) => setStyles((prev) => ({ ...prev, titleProjects: e.target.value }))}
                          style={{ padding: "5px 8px", fontSize: "12.5px", border: "1px solid #D1D5DB", borderRadius: "4px", width: "100%", maxWidth: "150px" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "11.5px", color: "#4B5563", minWidth: "90px" }}>Certifications:</span>
                        <input
                          type="text"
                          value={styles.titleCertifications || ""}
                          placeholder="Certifications"
                          onChange={(e) => setStyles((prev) => ({ ...prev, titleCertifications: e.target.value }))}
                          style={{ padding: "5px 8px", fontSize: "12.5px", border: "1px solid #D1D5DB", borderRadius: "4px", width: "100%", maxWidth: "150px" }}
                        />
                      </div>
                    </div>
                  </div>
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
