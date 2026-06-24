import React, { useRef, useState } from "react";
import { UploadCloud, ChevronDown } from "lucide-react";
import { getAcceptAttribute } from "../upload/UploadHelpers";

interface WorkspaceUploadZoneProps {
  activeTool: string;
  onFilesSelected: (files: FileList) => void;
}

export function WorkspaceUploadZone({
  activeTool,
  onFilesSelected
}: WorkspaceUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const acceptAttr = getAcceptAttribute(activeTool);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Determine formats list text
  const getFormatsText = () => {
    if (activeTool === "Word to PDF") return ["DOCX", "DOC"];
    if (activeTool === "Excel to PDF") return ["XLSX", "XLS"];
    if (activeTool === "PPT to PDF") return ["PPTX", "PPT"];
    if (activeTool === "JPG to PDF") return ["PNG", "JPG", "JPEG", "WEBP", "BMP"];
    if (activeTool === "HTML to PDF") return ["HTML", "URL"];
    if (activeTool === "TXT to PDF") return ["TXT"];
    return ["PDF"];
  };

  const formats = getFormatsText();

  return (
    <div 
      className={`uw-upload-zone ${isDragActive ? "drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        multiple
        accept={acceptAttr}
      />

      <div className="uw-upload-icon-container">
        <UploadCloud size={40} strokeWidth={2} />
      </div>

      <div className="uw-select-btn-group" onClick={(e) => e.stopPropagation()}>
        <button className="uw-select-btn" onClick={triggerFileInput}>
          Select files
        </button>
        <button 
          className="uw-select-arrow" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <p className="uw-upload-text">
        or drag and drop files here to start processing
      </p>

      <div className="uw-supported-formats">
        <span>Supported formats:</span>
        {formats.map(fmt => (
          <span key={fmt} className="uw-format-tag">{fmt}</span>
        ))}
      </div>
    </div>
  );
}
