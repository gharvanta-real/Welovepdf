import React, { useState, useEffect } from "react";
import { WorkspaceSidebar, SidebarTab } from "./WorkspaceSidebar";
import { WorkspaceSubMenu } from "./WorkspaceSubMenu";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { WorkspaceOptions } from "./WorkspaceOptions";
import { SuccessState } from "../upload/SuccessState";
import { SignEditor } from "../pdf-editor/SignEditor";
import { CropEditor } from "../pdf-editor/CropEditor";
import { PdfEditor } from "../PdfEditor";
import "../../styles/layout-unified-workspace.css";

type UnifiedWorkspaceProps = {
  selectedTool: string;
  onUpload: (files: FileList, options?: any) => void;
  onBack: () => void;
  activeJob: any;
  onReset: () => void;
  onStagedChange?: (hasStaged: boolean) => void;
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
  jobs?: any[];
  initialFiles?: File[] | null;
};

export function UnifiedWorkspace({
  selectedTool,
  onUpload,
  onBack,
  activeJob,
  onReset,
  onStagedChange,
  onToolSelect,
  onViewChange,
  jobs,
  initialFiles = null
}: UnifiedWorkspaceProps) {
  
  const [activeTab, setActiveTab] = useState<SidebarTab | null>("Compress");
  const [activeTool, setActiveTool] = useState<string>(selectedTool || "Compress PDF");
  const [stagedFiles, setStagedFiles] = useState<File[] | null>(initialFiles);

  useEffect(() => {
    if (initialFiles) {
      setStagedFiles(initialFiles);
    }
  }, [initialFiles]);
  
  // Popover state
  const [openDropdownTab, setOpenDropdownTab] = useState<SidebarTab | null>(null);

  // Options states
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "less">("recommended");
  const [conversionMode, setConversionMode] = useState<"page" | "extract">("page");
  const [outputQuality, setOutputQuality] = useState<"normal" | "high" | "compact">("normal");
  const [pdfPassword, setPdfPassword] = useState("pdfmount");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [translateLang, setTranslateLang] = useState("hi");
  const [copied, setCopied] = useState(false);

  // Progress Bar states & effect (3 second rules sync)
  const [progressPercent, setProgressPercent] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  // Determine current view mode: staged, processing, completed
  const isProcessing = activeJob?.status === "Processing" || (activeJob?.status === "Done" && !activeJob?.downloadUrl);

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setShowProgressBar(true);
      setProgressPercent(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 2800) {
          // smoothly go to 95%
          const current = Math.floor((elapsed / 2800) * 95);
          setProgressPercent(current);
        } else {
          setProgressPercent(95);
        }
      }, 50);
    } else {
      // Completed or idle
      if (showProgressBar) {
        setProgressPercent(100);
        const timeout = setTimeout(() => {
          setShowProgressBar(false);
          setProgressPercent(0);
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, showProgressBar]);

  const handleShare = () => {
    if (activeJob?.downloadUrl) {
      const fullUrl = window.location.origin + activeJob.downloadUrl;
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const mapToolToCategory = (toolName: string): SidebarTab | null => {
    if (toolName.includes("Compress") || toolName.includes("Optimize") || toolName.includes("Grayscale") || toolName.includes("Flatten") || toolName.includes("Edit") || toolName.includes("Annotate") || toolName.includes("Annotator")) {
      return "Compress";
    } else if (toolName.includes("to PDF") || toolName.includes("PDF to") || toolName.includes("to Word") || toolName.includes("Excel to") || toolName.includes("PPT to")) {
      return "Convert";
    } else if (toolName.includes("Merge") || toolName.includes("Split") || toolName.includes("Repair") || toolName.includes("Crop")) {
      return "Organize";
    } else if (toolName.includes("Protect") || toolName.includes("Unlock") || toolName.includes("Metadata") || toolName.includes("Watermark") || toolName.includes("Sign")) {
      return "Security";
    } else if (toolName.includes("OCR") || toolName.includes("Summarize") || toolName.includes("Translate")) {
      return "AI Tools";
    }
    return null;
  };

  useEffect(() => {
    if (selectedTool) {
      setActiveTool(selectedTool);
      const cat = mapToolToCategory(selectedTool);
      if (cat) {
        setActiveTab(cat);
      }
    }
  }, [selectedTool]);

  const handleTabClick = (tab: SidebarTab) => {
    if (tab === "Documents") {
      setOpenDropdownTab(null);
      onViewChange("dashboard");
    } else {
      setOpenDropdownTab(prev => prev === tab ? null : tab);
    }
  };

  const handleToolSelect = (toolName: string) => {
    setActiveTool(toolName);
    const cat = mapToolToCategory(toolName);
    if (cat) {
      setActiveTab(cat);
    }
    onToolSelect(toolName);
    setOpenDropdownTab(null);
  };

  const handleFilesSelected = (files: FileList) => {
    const fileList = Array.from(files);
    setStagedFiles(fileList);
    onStagedChange?.(true);
  };

  const handleRemoveFile = (index: number) => {
    if (!stagedFiles) return;
    const updated = stagedFiles.filter((_, idx) => idx !== index);
    if (updated.length === 0) {
      setStagedFiles(null);
      onReset();
      onStagedChange?.(false);
    } else {
      setStagedFiles(updated);
    }
  };

  const handleExecute = () => {
    if (!stagedFiles || stagedFiles.length === 0) return;

    // Build options object
    const options: any = {
      compressionLevel,
      conversionMode,
      outputQuality,
      pdfPassword,
      watermarkText,
      translateLang
    };

    // Create FileList using DataTransfer API
    const dataTransfer = new DataTransfer();
    stagedFiles.forEach(file => dataTransfer.items.add(file));

    onUpload(dataTransfer.files, options);
  };

  const isCompleted = activeJob?.status === "Done" && !!activeJob?.downloadUrl;

  const isVisualEditorTool = ["Edit PDF", "PDF Annotator"].includes(activeTool);
  const isSignTool = activeTool === "Sign PDF";
  const isCropTool = activeTool === "Crop PDF";
  const hasStaged = stagedFiles && stagedFiles.length > 0;

  return (
    <div className="unified-workspace-container" onClick={() => setOpenDropdownTab(null)}>
      {/* 1. Left Sidebar Navigation */}
      <WorkspaceSidebar
        activeTab={activeTab}
        openDropdownTab={openDropdownTab}
        onTabClick={handleTabClick}
        onLogoClick={onBack}
        onSettingsClick={() => onViewChange("settings")}
      />

      {/* 2. Floating popover submenu (droplist on click) */}
      {openDropdownTab && openDropdownTab !== "Documents" && (
        <div onClick={(e) => e.stopPropagation()}>
          <WorkspaceSubMenu
            activeTab={openDropdownTab}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
          />
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="uw-main-wrapper" style={{ position: "relative" }}>
        {showProgressBar && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #E2E8F0",
            zIndex: 9999
          }}>
            <div 
              style={{ 
                height: "100%",
                width: `${progressPercent}%`,
                transition: "width 0.05s linear",
                backgroundColor: "#2563eb"
              }} 
            />
          </div>
        )}
        <WorkspaceHeader
          activeTool={activeTool}
          onBack={onBack}
          onLoginClick={() => onViewChange("login")}
          onProClick={() => onViewChange("pricing")}
        />

        <div className="uw-body">
          {hasStaged && !isProcessing && !isCompleted && isSignTool ? (
            <SignEditor
              file={stagedFiles[0]}
              onClose={() => {
                setStagedFiles(null);
                onReset();
              }}
              onSave={(files, options) => {
                onUpload(files, options);
              }}
            />
          ) : hasStaged && !isProcessing && !isCompleted && isCropTool ? (
            <CropEditor
              file={stagedFiles[0]}
              onClose={() => {
                setStagedFiles(null);
                onReset();
              }}
              onSave={(files, options) => {
                onUpload(files, options);
              }}
            />
          ) : hasStaged && !isProcessing && !isCompleted && isVisualEditorTool ? (
            <PdfEditor
              file={stagedFiles[0]}
              selectedTool={activeTool}
              onClose={() => {
                setStagedFiles(null);
                onReset();
              }}
              onSave={(files, options) => {
                onUpload(files, options);
              }}
            />
          ) : (
            <>
              {/* Central Canvas Workspace */}
              <WorkspaceCanvas
                activeTool={activeTool}
                stagedFiles={stagedFiles}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onAddMoreClick={() => {}}
                onExecute={handleExecute}
                isProcessing={isProcessing}
                isCompleted={isCompleted}
                activeJob={activeJob}
                progressPercent={progressPercent}
              />

              {/* Right Options Sidebar Panel */}
              {((stagedFiles && stagedFiles.length > 0) || isCompleted) && (
                <WorkspaceOptions
                  activeTool={activeTool}
                  stagedFiles={stagedFiles}
                  onExecute={handleExecute}
                  isProcessing={isProcessing}
                  isCompleted={isCompleted}
                  activeJob={activeJob}
                  copied={copied}
                  handleShare={handleShare}
                  clearSelection={() => {
                    setStagedFiles(null);
                    onReset();
                  }}
                  compressionLevel={compressionLevel}
                  setCompressionLevel={setCompressionLevel}
                  conversionMode={conversionMode}
                  setConversionMode={setConversionMode}
                  outputQuality={outputQuality}
                  setOutputQuality={setOutputQuality}
                  pdfPassword={pdfPassword}
                  setPdfPassword={setPdfPassword}
                  watermarkText={watermarkText}
                  setWatermarkText={setWatermarkText}
                  translateLang={translateLang}
                  setTranslateLang={setTranslateLang}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
