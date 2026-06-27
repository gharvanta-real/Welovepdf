import React, { useState, useRef } from "react";
import { ArrowLeft, Check, FileText, Sparkles, Upload, ClipboardPaste } from "lucide-react";
import { OnboardingState, TemplateId } from "./types";
import { TEMPLATES } from "./templates";
import { extractTextFromPdf, parseResumeText } from "../../utils/resumeParser";

interface OnboardingWizardProps {
  onBackToApp: () => void;
  onComplete: (state: OnboardingState) => void;
}

// Color-coded template preview configs
const TEMPLATE_PREVIEW_COLORS: Record<string, { accent: string; sidebar: boolean; centered: boolean }> = {
  "traditional":    { accent: "#1E3A8A", sidebar: false, centered: false },
  "modern-split":   { accent: "#2563EB", sidebar: true,  centered: false },
  "executive":      { accent: "#065F46", sidebar: false, centered: true  },
  "creative-tech":  { accent: "#0F766E", sidebar: true,  centered: false },
  "minimalist":     { accent: "#374151", sidebar: false, centered: false },
};

import { SUGGESTED_JOB_TITLES } from "../../data/jobTitles";

export function OnboardingWizard({ onBackToApp, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [state, setState] = useState<OnboardingState>({
    hasExistingResume: null,
    position: "",
    focus: null,
    selectedTemplateId: null,
  });
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseError, setParseError] = useState("");
  const [showPasteMode, setShowPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleNextStep = () => setStep((prev) => prev + 1);

  const handlePrevStep = () => {
    if (step === 1) onBackToApp();
    else { setShowPasteMode(false); setParseError(""); setStep((prev) => prev - 1); }
  };

  // Upload PDF → extract text → parse → skip to step 4
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setIsParsingResume(true);
    try {
      const text   = await extractTextFromPdf(file);
      const parsed = parseResumeText(text);
      onComplete({ ...state, hasExistingResume: true, selectedTemplateId: null, _parsedData: parsed } as any);
    } catch (err: any) {
      setParseError("Could not read PDF. Try pasting your resume text instead.");
    } finally {
      setIsParsingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Paste plain text → parse → skip to step 4
  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    setParseError("");
    setIsParsingResume(true);
    try {
      const parsed = parseResumeText(pastedText);
      onComplete({ ...state, hasExistingResume: true, selectedTemplateId: null, _parsedData: parsed } as any);
    } catch {
      setParseError("Could not parse the text. Please check and try again.");
    } finally {
      setIsParsingResume(false);
    }
  };

  const selectTemplate = (templateId: string) => {
    const finalState = { ...state, selectedTemplateId: templateId as TemplateId };
    setState(finalState);
    onComplete(finalState);
  };

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (!state.focus) return true;
    return t.category === state.focus || t.category === "ats";
  });

  const totalSteps = 4;

  return (
    <div className="rb-wizard-container">
      {/* Wizard Top Navigation */}
      <div className="rb-wizard-nav">
        <button className="rb-wizard-back" onClick={handlePrevStep} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>

        {/* Step indicator */}
        <div className="rb-step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <React.Fragment key={s}>
              <div className={`rb-step-bubble ${step === s ? "active" : ""} ${step > s ? "completed" : ""}`}>
                {step > s ? <Check size={13} strokeWidth={3} /> : s}
              </div>
              {s < totalSteps && (
                <div className={`rb-step-line ${step > s ? "completed" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step label - replaces dead Login button */}
        <span className="rb-wizard-step-label">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Main Wizard Card */}
      <div className="rb-wizard-card">
        {/* Avatar illustration (steps 1-3 only) */}
        {step < 4 && (
          <div className="rb-avatar-illustration">
            <div className="rb-avatar-blob">
              <img
                src="/Avatar-lady-1.webp"
                alt="Resume builder assistant"
                className="rb-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    `<span style="font-size:40px">✨</span>`;
                }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: Starting point ── */}
        {step === 1 && (
          <div className="rb-step-content animate-fade-in">
            <h2 className="rb-step-title">Let's build your resume!</h2>
            <p className="rb-step-subtitle">How would you like to start?</p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handlePdfUpload}
            />

            {/* Parse error */}
            {parseError && (
              <div className="rb-parse-error">⚠ {parseError}</div>
            )}

            {/* Loading state */}
            {isParsingResume && (
              <div className="rb-parsing-loader">
                <span className="rb-spinner" style={{ borderColor: "rgba(37,99,235,0.2)", borderTopColor: "#2563EB" }} />
                Reading your resume…
              </div>
            )}

            {/* Paste mode textarea */}
            {showPasteMode && !isParsingResume && (
              <div className="rb-paste-mode">
                <p className="rb-paste-hint">Paste the text content of your resume below:</p>
                <textarea
                  className="rb-paste-textarea"
                  rows={10}
                  placeholder={"John Doe\nSoftware Engineer\njohn@email.com | +91 9876543210\n\nExperience\n...\n\nSkills\nReact, TypeScript, Node.js"}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  autoFocus
                />
                <div className="rb-paste-actions">
                  <button className="rb-action-btn rb-btn-outline" onClick={() => { setShowPasteMode(false); setPastedText(""); }}>
                    Cancel
                  </button>
                  <button
                    className="rb-action-btn rb-btn-primary"
                    onClick={handlePasteSubmit}
                    disabled={!pastedText.trim()}
                  >
                    Import Resume
                  </button>
                </div>
              </div>
            )}

            {!showPasteMode && !isParsingResume && (
              <div className="rb-choice-cards rb-choice-cards-3col">
                {/* Option 1: Upload PDF */}
                <button
                  className="rb-choice-card rb-choice-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src="/resume_upload_ill.png" alt="Upload" className="rb-choice-ill-img" />
                  <strong>Upload My Resume</strong>
                  <span>Upload PDF to auto-fill sections.</span>
                  <em className="rb-choice-badge">PDF supported</em>
                </button>

                {/* Option 2: Paste text */}
                <button
                  className="rb-choice-card rb-choice-paste"
                  onClick={() => setShowPasteMode(true)}
                >
                  <img src="/resume_paste_ill.png" alt="Paste" className="rb-choice-ill-img" />
                  <strong>Paste Resume Text</strong>
                  <span>Paste text from Word/Docs.</span>
                  <em className="rb-choice-badge">Any format</em>
                </button>

                {/* Option 3: Load Sample */}
                <button
                  className="rb-choice-card rb-choice-sample"
                  onClick={() => { updateState({ hasExistingResume: true }); handleNextStep(); }}
                >
                  <img src="/resume_sample_ill.png" alt="Sample" className="rb-choice-ill-img" />
                  <strong>Load Sample Data</strong>
                  <span>Start with pre-filled sample.</span>
                </button>
              </div>
            )}

            {!showPasteMode && !isParsingResume && (
              <button
                className="rb-skip-link"
                onClick={() => { updateState({ hasExistingResume: false }); handleNextStep(); }}
              >
                Or start from scratch →
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Job position ── */}
        {step === 2 && (() => {
          const query = state.position.trim().toLowerCase();
          const suggestions = query && showSuggestions
            ? SUGGESTED_JOB_TITLES.filter(title => 
                title.toLowerCase().includes(query) && 
                title.toLowerCase() !== query
              ).slice(0, 5)
            : [];

          return (
            <div className="rb-step-content animate-fade-in">
              <h2 className="rb-step-title">What is your target job title?</h2>
              <p className="rb-step-subtitle">We'll recommend the best resume templates for your role.</p>
              <div className="rb-input-wrapper" style={{ position: "relative" }}>
                <input
                  type="text"
                  className="rb-text-input"
                  placeholder="e.g. Software Engineer, Marketing Manager..."
                  value={state.position}
                  autoFocus
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Small delay to allow click event on suggestions list to fire
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onChange={(e) => updateState({ position: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && state.position.trim()) handleNextStep();
                  }}
                />

                {suggestions.length > 0 && (
                  <ul className="rb-suggestions-dropdown animate-fade-in">
                    {suggestions.map((title) => (
                      <li 
                        key={title} 
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input blur from firing and hiding dropdown before selection registers
                          updateState({ position: title });
                          setShowSuggestions(false);
                        }}
                        className="rb-suggestion-item"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  className="rb-btn rb-btn-teal"
                  disabled={!state.position.trim()}
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </div>
              <button
                className="rb-skip-link"
                onClick={() => { updateState({ position: "Professional" }); handleNextStep(); }}
              >
                Skip this step
              </button>
            </div>
          );
        })()}

        {/* ── STEP 3: ATS vs Recruiter ── */}
        {step === 3 && (
          <div className="rb-step-content animate-fade-in">
            <h2 className="rb-step-title">What's your primary goal?</h2>
            <p className="rb-step-subtitle">
              This helps us pick the right layout. You can always change it later.
            </p>
            <div className="rb-choice-cards">
              <button
                className="rb-choice-card"
                onClick={() => { updateState({ focus: "recruiters" }); handleNextStep(); }}
              >
                <span className="rb-choice-icon" style={{ color: "#2563EB" }}>🎯</span>
                <strong>Impress Recruiters</strong>
                <span>Visually rich, modern layouts that stand out in a human-reviewed stack.</span>
              </button>
              <button
                className="rb-choice-card"
                onClick={() => { updateState({ focus: "ats" }); handleNextStep(); }}
              >
                <span className="rb-choice-icon" style={{ color: "#059669" }}>🤖</span>
                <strong>Pass ATS Systems</strong>
                <span>Clean, machine-readable formats that beat automated screening filters.</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Template selection ── */}
        {step === 4 && (
          <div className="rb-step-content templates-step animate-fade-in">
            <h2 className="rb-step-title" style={{ textAlign: "center" }}>
              Choose your resume template
            </h2>
            <p className="rb-step-subtitle" style={{ textAlign: "center" }}>
              {state.focus === "ats"
                ? "Showing ATS-optimized templates. Click any to start building."
                : "Showing recruiter-friendly templates. Click any to start building."}
            </p>

            <div className="rb-templates-grid">
              {filteredTemplates.map((template) => {
                const preview = TEMPLATE_PREVIEW_COLORS[template.id] || { accent: "#2563EB", sidebar: false, centered: false };
                return (
                  <div
                    key={template.id}
                    className="rb-template-card"
                    onClick={() => selectTemplate(template.id)}
                  >
                    <div className="rb-template-thumbnail">
                      {/* Rich color-coded preview mock */}
                      <div className="rb-thumbnail-mock-v2">
                        {/* Header bar */}
                        <div className="rb-mock-v2-header" style={{ backgroundColor: preview.accent }}>
                          <div className="rb-mock-v2-name" />
                          {preview.centered && <div className="rb-mock-v2-name rb-mock-v2-name-sm" />}
                        </div>
                        {/* Contact row */}
                        <div className="rb-mock-v2-contact-row">
                          <div className="rb-mock-v2-dot" />
                          <div className="rb-mock-v2-dot" />
                          <div className="rb-mock-v2-dot" />
                        </div>
                        {/* Body layout */}
                        <div className="rb-mock-v2-body">
                          {preview.sidebar && (
                            <div className="rb-mock-v2-sidebar" style={{ borderColor: preview.accent }}>
                              <div className="rb-mock-v2-pill" style={{ backgroundColor: preview.accent + "22" }} />
                              <div className="rb-mock-v2-pill rb-mock-v2-pill-sm" style={{ backgroundColor: preview.accent + "15" }} />
                              <div className="rb-mock-v2-pill rb-mock-v2-pill-sm" style={{ backgroundColor: preview.accent + "15" }} />
                            </div>
                          )}
                          <div className="rb-mock-v2-main">
                            <div className="rb-mock-v2-section-head" style={{ backgroundColor: preview.accent }} />
                            <div className="rb-mock-v2-line" />
                            <div className="rb-mock-v2-line rb-mock-v2-line-short" />
                            <div className="rb-mock-v2-section-head rb-mock-v2-section-head-mt" style={{ backgroundColor: preview.accent }} />
                            <div className="rb-mock-v2-line" />
                            <div className="rb-mock-v2-line rb-mock-v2-line-short" />
                          </div>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="rb-template-hover-overlay">
                        <span className="rb-hover-btn" style={{ backgroundColor: preview.accent }}>
                          Use Template
                        </span>
                      </div>
                    </div>

                    <div className="rb-template-info">
                      <span className="rb-template-name">{template.name}</span>
                      <span
                        className="rb-template-badge"
                        style={{
                          backgroundColor: preview.accent + "18",
                          color: preview.accent
                        }}
                      >
                        {template.category === "ats" ? "✅ ATS-Friendly" : "⭐ Recruiter Pick"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
