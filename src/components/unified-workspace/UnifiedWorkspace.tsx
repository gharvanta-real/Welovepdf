import React, { useState, useEffect } from "react";
import { WorkspaceSidebar, SidebarTab } from "./WorkspaceSidebar";
import { WorkspaceSubMenu } from "./WorkspaceSubMenu";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { WorkspaceOptions } from "./WorkspaceOptions";
import { SuccessState } from "../upload/SuccessState";
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
  jobs
}: UnifiedWorkspaceProps) {
  
  const [activeTab, setActiveTab] = useState<SidebarTab | null>("Compress");
  const [activeTool, setActiveTool] = useState<string>(selectedTool || "Compress PDF");
  const [stagedFiles, setStagedFiles] = useState<File[] | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Options states
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "less">("recommended");
  const [conversionMode, setConversionMode] = useState<"page" | "extract">("page");
  const [outputQuality, setOutputQuality] = useState<"normal" | "high" | "compact">("normal");
  const [pdfPassword, setPdfPassword] = useState("pdfmount");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [translateLang, setTranslateLang] = useState("hi");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (activeJob?.downloadUrl) {
      const fullUrl = window.location.origin + activeJob.downloadUrl;
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    if (selectedTool) {
      setActiveTool(selectedTool);
      // Map tool to corresponding sidebar category
      if (selectedTool.includes("Compress") || selectedTool.includes("Flatten")) {
        setActiveTab("Compress");
      } else if (selectedTool.includes("to")) {
        setActiveTab("Convert");
      } else if (selectedTool.includes("Merge") || selectedTool.includes("Split") || selectedTool.includes("Rotate") || selectedTool.includes("Remove") || selectedTool.includes("Extract")) {
        setActiveTab("Organize");
      } else if (selectedTool.includes("Annotator") || selectedTool.includes("Crop") || selectedTool.includes("Watermark") || selectedTool.includes("Numbers") || selectedTool.includes("Editor")) {
        setActiveTab("Edit");
      } else if (selectedTool.includes("Sign")) {
        setActiveTab("Sign");
      } else if (selectedTool.includes("OCR") || selectedTool.includes("Chat") || selectedTool.includes("Summarize") || selectedTool.includes("Translate")) {
        setActiveTab("AI PDF");
      } else {
        setActiveTab("More");
      }
    }
  }, [selectedTool]);

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(tab);
    if (tab === "Compress") {
      setActiveTool("Compress PDF");
      onToolSelect("Compress PDF");
      setIsPopoverOpen(false);
    } else if (tab === "Sign") {
      setActiveTool("Sign PDF");
      onToolSelect("Sign PDF");
      setIsPopoverOpen(false);
    } else if (tab === "Documents") {
      onViewChange("dashboard");
      setIsPopoverOpen(false);
    } else {
      setIsPopoverOpen(true);
    }
  };

  const handleToolSelect = (toolName: string) => {
    setActiveTool(toolName);
    onToolSelect(toolName);
    setIsPopoverOpen(false);
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

  // Determine current view mode: staged, processing, completed
  const isProcessing = activeJob?.status === "Processing";
  const isCompleted = activeJob?.status === "Done";

  return (
    <div className="unified-workspace-container" onClick={() => setIsPopoverOpen(false)}>
      {/* 1. Left Sidebar Navigation */}
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        onLogoClick={onBack}
        onSettingsClick={() => onViewChange("settings")}
      />

      {/* 2. Floating popover submenu */}
      {isPopoverOpen && activeTab && (
        <div onClick={(e) => e.stopPropagation()}>
          <WorkspaceSubMenu
            activeTab={activeTab}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
          />
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="uw-main-wrapper">
        <WorkspaceHeader
          activeTool={activeTool}
          onBack={onBack}
          onLoginClick={() => onViewChange("login")}
          onProClick={() => onViewChange("pricing")}
        />

        <div className="uw-body">
          {isCompleted && activeJob ? (
            <div className="uw-canvas-container">
              <SuccessState
                selectedTool={activeTool}
                blockColor="#3b82f6"
                activeJob={activeJob}
                copied={copied}
                handleShare={handleShare}
                clearSelection={() => {
                  setStagedFiles(null);
                  onReset();
                }}
                onToolSelect={onToolSelect}
                onViewChange={onViewChange}
              />
            </div>
          ) : (
            <>
              {/* Central Canvas Workspace */}
              <WorkspaceCanvas
                activeTool={activeTool}
                stagedFiles={stagedFiles}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onAddMoreClick={() => {}}
                pageOrder={[]}
                rotationMap={{}}
                removedPages={new Set()}
                selectedPages={new Set()}
              />

              {/* Right Options Sidebar Panel */}
              <WorkspaceOptions
                activeTool={activeTool}
                stagedFiles={stagedFiles}
                onExecute={handleExecute}
                isProcessing={isProcessing}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
