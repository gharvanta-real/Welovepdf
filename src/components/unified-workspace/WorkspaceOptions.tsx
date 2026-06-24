import React, { useState } from "react";
import { Play, CheckCircle2, Download, Share2, RotateCcw, File, ChevronDown, ChevronUp, Check, Printer, Trash2, ChevronRight } from "lucide-react";
import { ToolIcon } from "../ToolIcon";

interface WorkspaceOptionsProps {
  activeTool: string;
  stagedFiles: File[] | null;
  onExecute: () => void;
  isProcessing: boolean;
  isCompleted?: boolean;
  activeJob?: any;
  copied?: boolean;
  handleShare?: () => void;
  clearSelection?: () => void;

  // Compress
  compressionLevel: "extreme" | "recommended" | "less";
  setCompressionLevel: (val: "extreme" | "recommended" | "less") => void;

  // Convert
  conversionMode: "page" | "extract";
  setConversionMode: (val: "page" | "extract") => void;

  outputQuality: "normal" | "high" | "compact";
  setOutputQuality: (val: "normal" | "high" | "compact") => void;

  // Security
  pdfPassword: string;
  setPdfPassword: (val: string) => void;

  watermarkText: string;
  setWatermarkText: (val: string) => void;

  // AI
  translateLang: string;
  setTranslateLang: (val: string) => void;
}

// ----------- Small reusable UI helpers -----------
const RadioCard = ({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) => (
  <div className={`uw-radio-card ${active ? "active" : ""}`} onClick={onClick}>
    <div className="uw-radio-circle" />
    <div>
      <span className="uw-radio-card-title">{title}</span>
      <span className="uw-radio-card-desc">{desc}</span>
    </div>
  </div>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="uw-options-section">
    <span className="uw-options-label">{label}</span>
    {children}
  </div>
);

const ToggleRow = ({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      background: "#f4f4f4",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      marginBottom: "6px",
    }}
    onClick={() => onChange(!checked)}
  >
    <div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{label}</div>
      {desc && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{desc}</div>}
    </div>
    <div
      style={{
        width: "36px",
        height: "20px",
        borderRadius: "10px",
        backgroundColor: checked ? "#2563eb" : "#cbd5e1",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: checked ? "18px" : "3px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  </div>
);

const StyledInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#1e293b",
      background: "#fff",
      boxSizing: "border-box",
      outline: "none",
    }}
  />
);

const StyledSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#1e293b",
      backgroundColor: "#fff",
      cursor: "pointer",
      outline: "none",
    }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// ----------- Main Component -----------
export function WorkspaceOptions({
  activeTool,
  stagedFiles,
  onExecute,
  isProcessing,
  isCompleted = false,
  activeJob,
  copied = false,
  handleShare,
  clearSelection,
  compressionLevel,
  setCompressionLevel,
  conversionMode,
  setConversionMode,
  outputQuality,
  setOutputQuality,
  pdfPassword,
  setPdfPassword,
  watermarkText,
  setWatermarkText,
  translateLang,
  setTranslateLang,
}: WorkspaceOptionsProps) {
  const hasFiles = stagedFiles && stagedFiles.length > 0;

  // Local state for advanced options
  const [imageColorMode, setImageColorMode] = useState<"color" | "grayscale">("color");
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [flattenAnnotations, setFlattenAnnotations] = useState(false);
  const [jpgQuality, setJpgQuality] = useState(85);
  const [imageDpi, setImageDpi] = useState<"72" | "150" | "300">("150");
  const [splitMode, setSplitMode] = useState<"range" | "every" | "size">("range");
  const [splitRanges, setSplitRanges] = useState("1-3, 4-6");
  const [splitEvery, setSplitEvery] = useState("1");
  const [mergeSort, setMergeSort] = useState<"upload" | "name" | "size">("upload");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [metadataTitle, setMetadataTitle] = useState("");
  const [metadataAuthor, setMetadataAuthor] = useState("");
  const [metadataSubject, setMetadataSubject] = useState("");
  const [metadataKeywords, setMetadataKeywords] = useState("");
  const [ocrLang, setOcrLang] = useState("eng");
  const [ocrOutput, setOcrOutput] = useState<"pdf" | "text">("pdf");
  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "detailed">("medium");
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(40);
  const [watermarkPosition, setWatermarkPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right">("center");
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [excelSheets, setExcelSheets] = useState<"all" | "active">("all");
  const [pptLayout, setPptLayout] = useState<"slide" | "notes">("slide");
  const [optimizeFor, setOptimizeFor] = useState<"web" | "print" | "mobile">("web");
  const [grayscaleMode, setGrayscaleMode] = useState<"all" | "images">("all");
  const [flattenMode, setFlattenMode] = useState<"all" | "forms" | "annotations">("all");

  const renderToolOptions = () => {
    switch (activeTool) {
      // ============ COMPRESS CATEGORY ============
      case "Compress PDF":
        return (
          <>
            <Section label="Compression Level">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={compressionLevel === "recommended"}
                  onClick={() => setCompressionLevel("recommended")}
                  title="Recommended"
                  desc="Best balance of size and quality (150 DPI)"
                />
                <RadioCard
                  active={compressionLevel === "extreme"}
                  onClick={() => setCompressionLevel("extreme")}
                  title="Extreme Compression"
                  desc="Maximum size reduction, lower quality (72 DPI)"
                />
                <RadioCard
                  active={compressionLevel === "less"}
                  onClick={() => setCompressionLevel("less")}
                  title="Less Compression"
                  desc="High quality preserved, slight size reduction"
                />
              </div>
            </Section>
            <Section label="Advanced Options">
              <ToggleRow
                label="Remove Metadata"
                desc="Strip author, title, creation date info"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
              />
              <ToggleRow
                label="Convert Images to Grayscale"
                desc="Reduce color image data to save space"
                checked={imageColorMode === "grayscale"}
                onChange={(v) => setImageColorMode(v ? "grayscale" : "color")}
              />
            </Section>
          </>
        );

      case "Optimize PDF":
        return (
          <>
            <Section label="Optimise For">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={optimizeFor === "web"}
                  onClick={() => setOptimizeFor("web")}
                  title="Web & Screen"
                  desc="Fast loading for browser and email sharing"
                />
                <RadioCard
                  active={optimizeFor === "print"}
                  onClick={() => setOptimizeFor("print")}
                  title="Print Quality"
                  desc="Preserve high-res for professional printing"
                />
                <RadioCard
                  active={optimizeFor === "mobile"}
                  onClick={() => setOptimizeFor("mobile")}
                  title="Mobile"
                  desc="Smallest file size for mobile viewing"
                />
              </div>
            </Section>
            <Section label="Additional">
              <ToggleRow
                label="Flatten Transparent Layers"
                checked={flattenAnnotations}
                onChange={setFlattenAnnotations}
                desc="Merge transparency for better compatibility"
              />
              <ToggleRow
                label="Strip Embedded Fonts"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
                desc="Replace with standard fonts to reduce size"
              />
            </Section>
          </>
        );

      case "Grayscale PDF":
        return (
          <>
            <Section label="Grayscale Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={grayscaleMode === "all"}
                  onClick={() => setGrayscaleMode("all")}
                  title="Full Document"
                  desc="Convert all colors including text and graphics"
                />
                <RadioCard
                  active={grayscaleMode === "images"}
                  onClick={() => setGrayscaleMode("images")}
                  title="Images Only"
                  desc="Only convert embedded images, keep text black"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Preserve Metadata"
                desc="Keep author, date, and title information"
                checked={!removeMetadata}
                onChange={(v) => setRemoveMetadata(!v)}
              />
            </Section>
          </>
        );

      case "Flatten PDF":
        return (
          <>
            <Section label="Flatten Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={flattenMode === "all"}
                  onClick={() => setFlattenMode("all")}
                  title="Everything"
                  desc="Flatten all interactive elements and annotations"
                />
                <RadioCard
                  active={flattenMode === "forms"}
                  onClick={() => setFlattenMode("forms")}
                  title="Forms Only"
                  desc="Flatten form fields into static content"
                />
                <RadioCard
                  active={flattenMode === "annotations"}
                  onClick={() => setFlattenMode("annotations")}
                  title="Annotations Only"
                  desc="Flatten comments, highlights, sticky notes"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Remove Hidden Layers"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
                desc="Also flatten hidden content layers"
              />
            </Section>
          </>
        );

      // ============ CONVERT CATEGORY ============
      case "Word to PDF":
        return (
          <>
            <Section label="Output Quality">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={outputQuality === "normal"}
                  onClick={() => setOutputQuality("normal")}
                  title="Standard"
                  desc="Office-compatible rendering (recommended)"
                />
                <RadioCard
                  active={outputQuality === "high"}
                  onClick={() => setOutputQuality("high")}
                  title="High Fidelity"
                  desc="Preserve advanced formatting and fonts"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Embed All Fonts"
                checked={!removeMetadata}
                onChange={(v) => setRemoveMetadata(!v)}
                desc="Ensure text renders identically on all devices"
              />
              <ToggleRow
                label="Preserve Hyperlinks"
                checked={allowPrint}
                onChange={setAllowPrint}
                desc="Keep clickable links active in output PDF"
              />
            </Section>
          </>
        );

      case "PDF to Word":
        return (
          <>
            <Section label="Conversion Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={conversionMode === "page"}
                  onClick={() => setConversionMode("page")}
                  title="Editable Flow"
                  desc="Reflowable text paragraphs easy to edit"
                />
                <RadioCard
                  active={conversionMode === "extract"}
                  onClick={() => setConversionMode("extract")}
                  title="Exact Layout"
                  desc="Preserve visual formatting with text boxes"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Retain Images"
                checked={!removeMetadata}
                onChange={(v) => setRemoveMetadata(!v)}
                desc="Include embedded images in output document"
              />
              <ToggleRow
                label="Detect Tables"
                checked={allowCopy}
                onChange={setAllowCopy}
                desc="Convert PDF tables to editable Word tables"
              />
            </Section>
          </>
        );

      case "JPG to PDF":
        return (
          <>
            <Section label="Output Orientation">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={outputQuality === "normal"}
                  onClick={() => setOutputQuality("normal")}
                  title="Auto (from Image)"
                  desc="Detect orientation from each image automatically"
                />
                <RadioCard
                  active={outputQuality === "high"}
                  onClick={() => setOutputQuality("high")}
                  title="Portrait (A4)"
                  desc="Force all images into portrait A4 pages"
                />
                <RadioCard
                  active={outputQuality === "compact"}
                  onClick={() => setOutputQuality("compact")}
                  title="Landscape (A4)"
                  desc="Force all images into landscape A4 pages"
                />
              </div>
            </Section>
            <Section label="Image Margin">
              <StyledSelect
                value={imageDpi}
                onChange={(v) => setImageDpi(v as any)}
                options={[
                  { value: "72", label: "No margin (edge to edge)" },
                  { value: "150", label: "Small margin (10px)" },
                  { value: "300", label: "Medium margin (20px)" },
                ]}
              />
            </Section>
          </>
        );

      case "PDF to JPG":
        return (
          <>
            <Section label="Export Resolution">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={imageDpi === "72"}
                  onClick={() => setImageDpi("72")}
                  title="Low — 72 DPI"
                  desc="Small file size, for web and previews"
                />
                <RadioCard
                  active={imageDpi === "150"}
                  onClick={() => setImageDpi("150")}
                  title="Medium — 150 DPI"
                  desc="Balanced resolution for most uses"
                />
                <RadioCard
                  active={imageDpi === "300"}
                  onClick={() => setImageDpi("300")}
                  title="High — 300 DPI"
                  desc="Print-ready quality, larger file sizes"
                />
              </div>
            </Section>
            <Section label="JPEG Quality">
              <div style={{ padding: "4px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Quality</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb" }}>{jpgQuality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#2563eb" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Smaller</span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Higher quality</span>
                </div>
              </div>
            </Section>
          </>
        );

      case "Excel to PDF":
        return (
          <>
            <Section label="Which Sheets">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={excelSheets === "all"}
                  onClick={() => setExcelSheets("all")}
                  title="All Sheets"
                  desc="Convert every worksheet to separate PDF pages"
                />
                <RadioCard
                  active={excelSheets === "active"}
                  onClick={() => setExcelSheets("active")}
                  title="Active Sheet Only"
                  desc="Convert only the currently selected worksheet"
                />
              </div>
            </Section>
            <Section label="Page Fit">
              <StyledSelect
                value={optimizeFor}
                onChange={(v) => setOptimizeFor(v as any)}
                options={[
                  { value: "web", label: "Fit to Page Width" },
                  { value: "print", label: "Actual Size (may overflow)" },
                  { value: "mobile", label: "Shrink to Fit Page" },
                ]}
              />
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Include Gridlines"
                checked={allowCopy}
                onChange={setAllowCopy}
                desc="Show spreadsheet grid in output PDF"
              />
              <ToggleRow
                label="Include Headers & Footers"
                checked={allowPrint}
                onChange={setAllowPrint}
                desc="Print area headers, row/column labels"
              />
            </Section>
          </>
        );

      case "PPT to PDF":
        return (
          <>
            <Section label="Slide Layout">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={pptLayout === "slide"}
                  onClick={() => setPptLayout("slide")}
                  title="Slides Only"
                  desc="Each slide becomes a full PDF page"
                />
                <RadioCard
                  active={pptLayout === "notes"}
                  onClick={() => setPptLayout("notes")}
                  title="Slides + Notes"
                  desc="Include speaker notes below each slide"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Hidden Slides"
                checked={allowCopy}
                onChange={setAllowCopy}
                desc="Include hidden slides in the output"
              />
              <ToggleRow
                label="Embed Fonts"
                checked={allowPrint}
                onChange={setAllowPrint}
                desc="Ensure text renders correctly on all devices"
              />
            </Section>
          </>
        );

      // ============ ORGANIZE CATEGORY ============
      case "Merge PDF":
        return (
          <>
            <Section label="File Order">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={mergeSort === "upload"}
                  onClick={() => setMergeSort("upload")}
                  title="Upload Order"
                  desc="Merge files in the order you added them"
                />
                <RadioCard
                  active={mergeSort === "name"}
                  onClick={() => setMergeSort("name")}
                  title="Alphabetically by Name"
                  desc="Sort files A–Z before merging"
                />
                <RadioCard
                  active={mergeSort === "size"}
                  onClick={() => setMergeSort("size")}
                  title="By File Size"
                  desc="Smaller files first in the merged output"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Add Bookmarks"
                desc="Create a bookmark per merged file in the output"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
              <ToggleRow
                label="Add Blank Page Between Files"
                desc="Insert an empty page as separator between docs"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
            </Section>
          </>
        );

      case "Split PDF":
        return (
          <>
            <Section label="Split Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={splitMode === "range"}
                  onClick={() => setSplitMode("range")}
                  title="By Page Ranges"
                  desc="Define custom page ranges (e.g. 1-3, 4-6)"
                />
                <RadioCard
                  active={splitMode === "every"}
                  onClick={() => setSplitMode("every")}
                  title="Fixed Intervals"
                  desc="Split every N pages into separate files"
                />
                <RadioCard
                  active={splitMode === "size"}
                  onClick={() => setSplitMode("size")}
                  title="One Page Per File"
                  desc="Each page becomes an individual PDF"
                />
              </div>
            </Section>
            {splitMode === "range" && (
              <Section label="Page Ranges">
                <StyledInput
                  value={splitRanges}
                  onChange={setSplitRanges}
                  placeholder="e.g. 1-3, 4-7, 8"
                />
                <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                  Use commas to separate ranges
                </span>
              </Section>
            )}
            {splitMode === "every" && (
              <Section label="Split Every N Pages">
                <StyledInput
                  value={splitEvery}
                  onChange={setSplitEvery}
                  placeholder="e.g. 2"
                  type="number"
                />
              </Section>
            )}
          </>
        );

      case "Repair PDF":
        return (
          <>
            <Section label="Repair Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={conversionMode === "page"}
                  onClick={() => setConversionMode("page")}
                  title="Standard Repair"
                  desc="Fix common corruption, cross-ref errors, and broken structure"
                />
                <RadioCard
                  active={conversionMode === "extract"}
                  onClick={() => setConversionMode("extract")}
                  title="Deep Recovery"
                  desc="Attempt to recover content from severely damaged files"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Recover Embedded Images"
                desc="Attempt to preserve images even if corrupted"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
              <ToggleRow
                label="Rebuild Cross-Reference Table"
                desc="Fix broken page index for proper navigation"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
            </Section>
          </>
        );

      // ============ SECURITY CATEGORY ============
      case "Protect PDF":
        return (
          <>
            <Section label="Document Password">
              <StyledInput
                value={pdfPassword}
                onChange={setPdfPassword}
                type="password"
                placeholder="Enter a secure password"
              />
            </Section>
            <Section label="Confirm Password">
              <StyledInput
                value={pdfPassword}
                onChange={setPdfPassword}
                type="password"
                placeholder="Re-enter password to confirm"
              />
            </Section>
            <Section label="Permissions">
              <ToggleRow
                label="Allow Printing"
                desc="Readers can print the document"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
              <ToggleRow
                label="Allow Copying Text"
                desc="Readers can copy text from the document"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
            </Section>
            <Section label="Encryption">
              <StyledSelect
                value={compressionLevel}
                onChange={(v) => setCompressionLevel(v as any)}
                options={[
                  { value: "recommended", label: "AES 128-bit (Standard)" },
                  { value: "extreme", label: "AES 256-bit (Maximum)" },
                ]}
              />
            </Section>
          </>
        );

      case "Unlock PDF":
        return (
          <>
            <Section label="Document Password">
              <StyledInput
                value={unlockPassword}
                onChange={setUnlockPassword}
                type="password"
                placeholder="Enter the document password"
              />
              <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                Required only if the PDF is password-protected
              </span>
            </Section>
            <Section label="After Unlocking">
              <ToggleRow
                label="Remove All Permissions Restrictions"
                desc="Strip print, copy, and edit restrictions"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
            </Section>
          </>
        );

      case "Edit PDF Metadata":
        return (
          <>
            <Section label="Document Title">
              <StyledInput
                value={metadataTitle}
                onChange={setMetadataTitle}
                placeholder="e.g. Annual Report 2024"
              />
            </Section>
            <Section label="Author">
              <StyledInput
                value={metadataAuthor}
                onChange={setMetadataAuthor}
                placeholder="e.g. John Smith"
              />
            </Section>
            <Section label="Subject">
              <StyledInput
                value={metadataSubject}
                onChange={setMetadataSubject}
                placeholder="e.g. Financial Summary"
              />
            </Section>
            <Section label="Keywords">
              <StyledInput
                value={metadataKeywords}
                onChange={setMetadataKeywords}
                placeholder="e.g. finance, report, 2024"
              />
              <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                Separate keywords with commas
              </span>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Clear Creation Date"
                desc="Remove original creation timestamp"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
              />
            </Section>
          </>
        );

      // ============ AI TOOLS CATEGORY ============
      case "PDF OCR":
        return (
          <>
            <Section label="Recognition Language">
              <StyledSelect
                value={ocrLang}
                onChange={setOcrLang}
                options={[
                  { value: "eng", label: "English" },
                  { value: "hin", label: "Hindi" },
                  { value: "ara", label: "Arabic" },
                  { value: "fra", label: "French" },
                  { value: "deu", label: "German" },
                  { value: "spa", label: "Spanish" },
                  { value: "chi_sim", label: "Chinese (Simplified)" },
                  { value: "jpn", label: "Japanese" },
                  { value: "kor", label: "Korean" },
                  { value: "por", label: "Portuguese" },
                  { value: "rus", label: "Russian" },
                ]}
              />
            </Section>
            <Section label="Output Format">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={ocrOutput === "pdf"}
                  onClick={() => setOcrOutput("pdf")}
                  title="Searchable PDF"
                  desc="Keep original layout with hidden text layer"
                />
                <RadioCard
                  active={ocrOutput === "text"}
                  onClick={() => setOcrOutput("text")}
                  title="Plain Text (.txt)"
                  desc="Extract raw text content only"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Auto-Detect Language"
                desc="Let AI identify language per page automatically"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
              <ToggleRow
                label="Deskew Pages"
                desc="Auto-correct tilted scanned pages"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
            </Section>
          </>
        );

      case "Summarize PDF":
        return (
          <>
            <Section label="Summary Length">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={summaryLength === "short"}
                  onClick={() => setSummaryLength("short")}
                  title="Brief (1–2 paragraphs)"
                  desc="Key takeaways only, very concise"
                />
                <RadioCard
                  active={summaryLength === "medium"}
                  onClick={() => setSummaryLength("medium")}
                  title="Standard (3–5 paragraphs)"
                  desc="Balanced overview of main sections"
                />
                <RadioCard
                  active={summaryLength === "detailed"}
                  onClick={() => setSummaryLength("detailed")}
                  title="Detailed (full outline)"
                  desc="Section-by-section structured summary"
                />
              </div>
            </Section>
            <Section label="Output Language">
              <StyledSelect
                value={translateLang}
                onChange={setTranslateLang}
                options={[
                  { value: "en", label: "English" },
                  { value: "hi", label: "Hindi" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "ar", label: "Arabic" },
                ]}
              />
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Include Key Points List"
                desc="Add bullet-point highlights after summary"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
            </Section>
          </>
        );

      case "Translate PDF":
        return (
          <>
            <Section label="Target Language">
              <StyledSelect
                value={translateLang}
                onChange={setTranslateLang}
                options={[
                  { value: "hi", label: "Hindi" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "ar", label: "Arabic" },
                  { value: "zh", label: "Chinese (Simplified)" },
                  { value: "ja", label: "Japanese" },
                  { value: "ko", label: "Korean" },
                  { value: "pt", label: "Portuguese" },
                  { value: "ru", label: "Russian" },
                  { value: "it", label: "Italian" },
                  { value: "nl", label: "Dutch" },
                  { value: "pl", label: "Polish" },
                  { value: "tr", label: "Turkish" },
                  { value: "uk", label: "Ukrainian" },
                ]}
              />
            </Section>
            <Section label="Translation Mode">
              <div className="uw-radio-card-group">
                <RadioCard
                  active={conversionMode === "page"}
                  onClick={() => setConversionMode("page")}
                  title="Preserve Layout"
                  desc="Translate text in place, keep original formatting"
                />
                <RadioCard
                  active={conversionMode === "extract"}
                  onClick={() => setConversionMode("extract")}
                  title="Text Only"
                  desc="Extract and translate text as clean document"
                />
              </div>
            </Section>
            <Section label="Options">
              <ToggleRow
                label="Keep Original Page Alongside"
                desc="Export bilingual PDF with original + translation"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
            </Section>
          </>
        );

      case "Edit PDF":
        return (
          <>
            <Section label="Edit Options">
              <ToggleRow
                label="Optimize PDF for Web"
                desc="Linearize and rebuild document structure for fast online viewing"
                checked={allowPrint}
                onChange={setAllowPrint}
              />
              <ToggleRow
                label="Strip Document Metadata"
                desc="Remove author, title, and creator details from document tags"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
              />
              <ToggleRow
                label="Flatten Transparent Elements"
                desc="Merge page overlapping layers to improve reader compatibility"
                checked={flattenAnnotations}
                onChange={setFlattenAnnotations}
              />
            </Section>
          </>
        );

      case "PDF Annotator":
        return (
          <>
            <Section label="Annotation Options">
              <ToggleRow
                label="Flatten All Annotations"
                desc="Render and lock comments/markup directly onto page graphics"
                checked={flattenAnnotations}
                onChange={setFlattenAnnotations}
              />
              <ToggleRow
                label="Compress Text & Vector Streams"
                desc="Minimize raw stream data sizes without affecting visual layout"
                checked={removeMetadata}
                onChange={setRemoveMetadata}
              />
              <ToggleRow
                label="Strip Sticky Note Comments"
                desc="Completely delete popup text comment fields and labels"
                checked={allowCopy}
                onChange={setAllowCopy}
              />
            </Section>
          </>
        );

      default:
        return (
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
              marginTop: "20px",
              padding: "16px",
              background: "#f4f4f4",
              borderRadius: "8px",
              border: "none",
            }}
          >
            Ready to process. No extra configuration needed.
          </div>
        );
    }
  };

  // =========== Processing State ===========
  if (isProcessing) {
    return (
      <aside className="uw-options-panel">
        <div className="uw-options-scroll">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <ToolIcon toolNameOrId={activeTool} size={22} style={{ borderRadius: "5px" }} />
            <h2 className="uw-options-header" style={{ margin: 0, fontSize: "18px" }}>
              {activeTool}
            </h2>
          </div>
          <span className="uw-options-subtitle">Processing settings...</span>
          <div className="uw-simple-processing">
            <div className="uw-processing-spinner" />
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              Please wait, this will only take a moment
            </span>
          </div>
        </div>
        <div className="uw-options-footer">
          <button className="uw-action-btn" disabled style={{ opacity: 0.7 }}>
            <span>Processing...</span>
          </button>
        </div>
      </aside>
    );
  }

  // =========== Completed / Success State ===========
  if (isCompleted && activeJob) {
    const isCompress = activeTool === "Compress PDF";
    const hasSavingsData =
      isCompress && activeJob.originalSizeBytes && activeJob.finalSizeBytes;
    const savingsPercent = hasSavingsData
      ? Math.round(
          ((activeJob.originalSizeBytes - activeJob.finalSizeBytes) /
            activeJob.originalSizeBytes) *
            100
        )
      : 0;

    const formatBytes = (bytes: number) => {
      if (!bytes) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const originalSizeStr = hasSavingsData ? formatBytes(activeJob.originalSizeBytes) : "";
    const finalSizeStr = hasSavingsData ? formatBytes(activeJob.finalSizeBytes) : "";
    const fillPercent = hasSavingsData
      ? Math.max(5, Math.min(100, (activeJob.finalSizeBytes / activeJob.originalSizeBytes) * 100))
      : 100;

    // "Or continue in" — suggest related tools based on current tool
    const continueTools: { name: string; color: string; emoji: string }[] = [
      { name: "Merge PDF",         color: "#7c3aed", emoji: "⊞" },
      { name: "Protect PDF",       color: "#dc2626", emoji: "🔒" },
      { name: "Split PDF",         color: "#d97706", emoji: "✂️" },
      { name: "PDF to Word",       color: "#2563eb", emoji: "W" },
      { name: "Compress PDF",      color: "#16a34a", emoji: "↓" },
    ].filter(t => t.name !== activeTool).slice(0, 4);

    return (
      <aside className="uw-options-panel">
        <div className="uw-options-scroll">
          {/* Header Section (same as default options panel) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <ToolIcon toolNameOrId={activeTool} size={22} style={{ borderRadius: "5px" }} />
            <h2 className="uw-options-header" style={{ margin: 0, fontSize: "18px" }}>
              {activeTool}
            </h2>
          </div>
          <span className="uw-options-subtitle" style={{ color: "#16a34a", fontWeight: 600 }}>
            Done! File processed successfully
          </span>

          {/* Simple file details container */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#f4f4f4",
              borderRadius: "6px",
              border: "none",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b", wordBreak: "break-all", marginBottom: "4px" }}>
              {activeJob.file}
            </div>
            <div style={{ fontSize: "12.5px", color: "#64748b" }}>
              {hasSavingsData ? (
                <>
                  <span>{originalSizeStr}</span>
                  <span style={{ margin: "0 4px" }}>→</span>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>{finalSizeStr}</span>
                  <span style={{ color: "#16a34a", fontWeight: 700, marginLeft: "4px" }}>
                    ({savingsPercent}% smaller)
                  </span>
                </>
              ) : (
                <span>{activeJob.size || "Ready"}</span>
              )}
            </div>
          </div>

          {/* Secondary Actions */}
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleShare}
              style={{
                width: "100%",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#fff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              title={copied ? "Copied!" : "Copy share link"}
            >
              <Share2 size={16} />
              <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
            </button>
            <button
              onClick={() => window.print()}
              style={{
                width: "100%",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#fff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Printer size={16} />
              <span>Print Page</span>
            </button>
          </div>
        </div>

        {/* Primary Footer Actions (same as default options panel) */}
        <div className="uw-options-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <a
            href={activeJob.downloadUrl}
            download={activeJob.file}
            className="uw-action-btn"
            style={{ textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            <Download size={16} />
            <span>Download file</span>
          </a>

          <button
            onClick={clearSelection}
            style={{
              width: "100%",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            <span>Start over</span>
          </button>
        </div>
      </aside>
    );
  }

  // =========== Default Options Panel ===========
  return (
    <aside className="uw-options-panel">
      <div className="uw-options-scroll">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <ToolIcon toolNameOrId={activeTool} size={22} style={{ borderRadius: "5px" }} />
          <h2 className="uw-options-header" style={{ margin: 0, fontSize: "18px" }}>
            {activeTool}
          </h2>
        </div>
        <span className="uw-options-subtitle">
          {hasFiles ? "Configure settings before processing" : "Please select files to continue"}
        </span>

        {hasFiles && renderToolOptions()}
      </div>

      <div className="uw-options-footer">
        <button
          className="uw-action-btn"
          onClick={onExecute}
          disabled={!hasFiles || isProcessing}
        >
          <Play size={16} fill="currentColor" />
          <span>{isProcessing ? "Processing..." : `Execute ${activeTool}`}</span>
        </button>
      </div>
    </aside>
  );
}
