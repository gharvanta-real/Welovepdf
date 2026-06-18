import React from "react";
import {
  CompressSettings,
  MergeSettings,
  JpgToPdfSettings,
  PdfToJpgSettings,
  SplitSettings,
  WatermarkSettings,
  SignSettings,
  PasswordSettings,
  TranslateSettings,
  SummarizeSettings,
  BatesSettings,
  PageNumberSettings,
  CropSettings,
  CopilotSettings,
  TxtToPdfSettings,
  HtmlToPdfSettings,
  RotateSettings,
  RemoveSettings,
  ExtractSettings,
  OrganizeSettings,
  FlattenSettings,
  RepairSettings,
  WordToPdfSettings,
  ExcelToPdfSettings,
  PptToPdfSettings,
  PdfToWordSettings,
  PdfToExcelSettings,
  PdfToPptSettings,
  AnnotateSettings,
  OcrSettings,
  DefaultSettings,
  GrayscaleSettings,
  OptimizeSettings,
  PdfToTxtSettings,
  PdfToHtmlSettings,
  PdfToPngSettings,
  EditMetadataSettings,
  HeaderFooterSettings,
  ResizeSettings
} from "../tool-configs";

interface OptionsSidebarProps {
  selectedTool: string;
  toolColor: string;
  runProcess: () => void;
  clearSelection: () => void;

  // Compression
  compressionLevel: "extreme" | "recommended" | "less";
  setCompressionLevel: (val: "extreme" | "recommended" | "less") => void;

  // Merge
  fileNameStamps: boolean;
  setFileNameStamps: (val: boolean) => void;
  includeTOC: boolean;
  setIncludeTOC: (val: boolean) => void;

  // JPG to PDF / Convert
  pageOrientation: "portrait" | "landscape";
  setPageOrientation: (val: "portrait" | "landscape") => void;
  pageSize: "a4" | "letter" | "fit";
  setPageSize: (val: "a4" | "letter" | "fit") => void;
  pageMargin: "none" | "small" | "big";
  setPageMargin: (val: "none" | "small" | "big") => void;
  mergeAll: boolean;
  setMergeAll: (val: boolean) => void;

  // PDF to JPG
  conversionMode: "page" | "extract";
  setConversionMode: (val: "page" | "extract") => void;

  // Split
  splitMode: "ranges" | "extract";
  setSplitMode: (val: "ranges" | "extract") => void;
  splitRanges: string;
  setSplitRanges: (val: string) => void;

  // Watermark
  watermarkText: string;
  setWatermarkText: (val: string) => void;
  watermarkColor: string;
  setWatermarkColor: (val: string) => void;
  watermarkOpacity: string;
  setWatermarkOpacity: (val: string) => void;

  // Sign
  signatureText: string;
  setSignatureText: (val: string) => void;
  signatureStyle: string;
  setSignatureStyle: (val: string) => void;

  // Password
  pdfPassword: string;
  setPdfPassword: (val: string) => void;

  // Translate
  translateLang: string;
  setTranslateLang: (val: string) => void;

  // Summarize
  summarizeLength: "short" | "medium" | "long";
  setSummarizeLength: (val: "short" | "medium" | "long") => void;

  // Bates
  batesPrefix: string;
  setBatesPrefix: (val: string) => void;
  batesStart: string;
  setBatesStart: (val: string) => void;

  // Page Numbers
  pageNumberPos: string;
  setPageNumberPos: (val: string) => void;
  pageNumberSize: string;
  setPageNumberSize: (val: string) => void;

  // Crop
  cropMargin: string;
  setCropMargin: (val: string) => void;

  // Copilot
  copilotMode: string;
  setCopilotMode: (val: string) => void;

  // TXT to PDF
  txtFontSize: string;
  setTxtFontSize: (val: string) => void;

  // HTML to PDF
  htmlPageSize: string;
  setHtmlPageSize: (val: string) => void;

  // Page manipulation maps
  totalPdfPages: number;
  rotationMap: { [pageNum: number]: number };
  setRotationMap: React.Dispatch<React.SetStateAction<{ [pageNum: number]: number }>>;
  removedPages: Set<number>;
  setRemovedPages: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectedPages: Set<number>;
  setSelectedPages: React.Dispatch<React.SetStateAction<Set<number>>>;
  setPageOrder: React.Dispatch<React.SetStateAction<number[]>>;

  // Flatten
  flattenMode: "all" | "forms" | "annotations";
  setFlattenMode: (val: "all" | "forms" | "annotations") => void;

  // Repair
  repairMode: "streams" | "tables" | "catalog";
  setRepairMode: (val: "streams" | "tables" | "catalog") => void;
  repairCompatibility: string;
  setRepairCompatibility: (val: string) => void;

  // Word/Excel/PPT settings
  wordMargins: "standard" | "narrow" | "wide";
  setWordMargins: (val: "standard" | "narrow" | "wide") => void;
  wordBookmarks: boolean;
  setWordBookmarks: (val: boolean) => void;
  wordLinkColors: boolean;
  setWordLinkColors: (val: boolean) => void;
  excelOrientation: "portrait" | "landscape";
  setExcelOrientation: (val: "portrait" | "landscape") => void;
  excelSheetRendering: "fit-width" | "actual-size" | "fit-all-columns";
  setExcelSheetRendering: (val: "fit-width" | "actual-size" | "fit-all-columns") => void;
  excelGridlines: boolean;
  setExcelGridlines: (val: boolean) => void;
  pptOrientation: "landscape" | "portrait";
  setPptOrientation: (val: "landscape" | "portrait") => void;
  pptSlidesLayout: "1-slide" | "2-slides" | "4-slides";
  setPptSlidesLayout: (val: "1-slide" | "2-slides" | "4-slides") => void;
  pptNotes: boolean;
  setPptNotes: (val: boolean) => void;

  // Conversions from PDF
  pdfToWordMode: "flowing" | "frames" | "text-only";
  setPdfToWordMode: (val: "flowing" | "frames" | "text-only") => void;
  pdfToWordOcr: boolean;
  setPdfToWordOcr: (val: boolean) => void;
  pdfToWordLang: string;
  setPdfToWordLang: (val: string) => void;
  pdfToExcelData: "all-tables" | "single-sheet" | "table-per-page";
  setPdfToExcelData: (val: "all-tables" | "single-sheet" | "table-per-page") => void;
  pdfToExcelSeparator: "period" | "comma";
  setPdfToExcelSeparator: (val: "period" | "comma") => void;
  pdfToExcelDetectNum: boolean;
  setPdfToExcelDetectNum: (val: boolean) => void;
  pdfToPptLayout: "auto" | "page-image";
  setPdfToPptLayout: (val: "auto" | "page-image") => void;
  pdfToPptBorders: boolean;
  setPdfToPptBorders: (val: boolean) => void;
  pdfToPptCompress: boolean;
  setPdfToPptCompress: (val: boolean) => void;

  // Annotate / OCR
  annotateTool: "highlight" | "pen" | "text-comment";
  setAnnotateTool: (val: "highlight" | "pen" | "text-comment") => void;
  annotateColor: string;
  setAnnotateColor: (val: string) => void;
  annotateText: string;
  setAnnotateText: (val: string) => void;
  annotateOpacity: string;
  setAnnotateOpacity: (val: string) => void;
  annotateThickness: string;
  setAnnotateThickness: (val: string) => void;
  ocrEngineMode: "fast" | "balanced" | "quality";
  setOcrEngineMode: (val: "fast" | "balanced" | "quality") => void;
  ocrLanguage: string;
  setOcrLanguage: (val: string) => void;

  // Additional settings
  grayscaleMode: "all" | "images" | "text";
  setGrayscaleMode: (val: "all" | "images" | "text") => void;
  optimizeLevel: "standard" | "maximum" | "minimum";
  setOptimizeLevel: (val: "standard" | "maximum" | "minimum") => void;
  txtEncoding: string;
  setTxtEncoding: (val: string) => void;
  htmlLayout: "formatted" | "simple";
  setHtmlLayout: (val: "formatted" | "simple") => void;
  pngDpi: string;
  setPngDpi: (val: string) => void;
  metadataTitle: string;
  setMetadataTitle: (val: string) => void;
  metadataAuthor: string;
  setMetadataAuthor: (val: string) => void;
  metadataSubject: string;
  setMetadataSubject: (val: string) => void;
  metadataKeywords: string;
  setMetadataKeywords: (val: string) => void;
  headerText: string;
  setHeaderText: (val: string) => void;
  footerText: string;
  setFooterText: (val: string) => void;
  resizePageSize: "a4" | "letter" | "legal";
  setResizePageSize: (val: "a4" | "letter" | "legal") => void;
  outputQuality: "normal" | "high" | "compact";
  setOutputQuality: (val: "normal" | "high" | "compact") => void;
}

export function OptionsSidebar({
  selectedTool,
  toolColor,
  runProcess,
  clearSelection,
  compressionLevel,
  setCompressionLevel,
  fileNameStamps,
  setFileNameStamps,
  includeTOC,
  setIncludeTOC,
  pageOrientation,
  setPageOrientation,
  pageSize,
  setPageSize,
  pageMargin,
  setPageMargin,
  mergeAll,
  setMergeAll,
  conversionMode,
  setConversionMode,
  splitMode,
  setSplitMode,
  splitRanges,
  setSplitRanges,
  watermarkText,
  setWatermarkText,
  watermarkColor,
  setWatermarkColor,
  watermarkOpacity,
  setWatermarkOpacity,
  signatureText,
  setSignatureText,
  signatureStyle,
  setSignatureStyle,
  pdfPassword,
  setPdfPassword,
  translateLang,
  setTranslateLang,
  summarizeLength,
  setSummarizeLength,
  batesPrefix,
  setBatesPrefix,
  batesStart,
  setBatesStart,
  pageNumberPos,
  setPageNumberPos,
  pageNumberSize,
  setPageNumberSize,
  cropMargin,
  setCropMargin,
  copilotMode,
  setCopilotMode,
  txtFontSize,
  setTxtFontSize,
  htmlPageSize,
  setHtmlPageSize,
  totalPdfPages,
  rotationMap,
  setRotationMap,
  removedPages,
  setRemovedPages,
  selectedPages,
  setSelectedPages,
  setPageOrder,
  flattenMode,
  setFlattenMode,
  repairMode,
  setRepairMode,
  repairCompatibility,
  setRepairCompatibility,
  wordMargins,
  setWordMargins,
  wordBookmarks,
  setWordBookmarks,
  wordLinkColors,
  setWordLinkColors,
  excelOrientation,
  setExcelOrientation,
  excelSheetRendering,
  setExcelSheetRendering,
  excelGridlines,
  setExcelGridlines,
  pptOrientation,
  setPptOrientation,
  pptSlidesLayout,
  setPptSlidesLayout,
  pptNotes,
  setPptNotes,
  pdfToWordMode,
  setPdfToWordMode,
  pdfToWordOcr,
  setPdfToWordOcr,
  pdfToWordLang,
  setPdfToWordLang,
  pdfToExcelData,
  setPdfToExcelData,
  pdfToExcelSeparator,
  setPdfToExcelSeparator,
  pdfToExcelDetectNum,
  setPdfToExcelDetectNum,
  pdfToPptLayout,
  setPdfToPptLayout,
  pdfToPptBorders,
  setPdfToPptBorders,
  pdfToPptCompress,
  setPdfToPptCompress,
  annotateTool,
  setAnnotateTool,
  annotateColor,
  setAnnotateColor,
  annotateText,
  setAnnotateText,
  annotateOpacity,
  setAnnotateOpacity,
  annotateThickness,
  setAnnotateThickness,
  ocrEngineMode,
  setOcrEngineMode,
  ocrLanguage,
  setOcrLanguage,
  grayscaleMode,
  setGrayscaleMode,
  optimizeLevel,
  setOptimizeLevel,
  txtEncoding,
  setTxtEncoding,
  htmlLayout,
  setHtmlLayout,
  pngDpi,
  setPngDpi,
  metadataTitle,
  setMetadataTitle,
  metadataAuthor,
  setMetadataAuthor,
  metadataSubject,
  setMetadataSubject,
  metadataKeywords,
  setMetadataKeywords,
  headerText,
  setHeaderText,
  footerText,
  setFooterText,
  resizePageSize,
  setResizePageSize,
  outputQuality,
  setOutputQuality,
}: OptionsSidebarProps) {
  const isCompress = selectedTool === "Compress PDF";
  const isMerge = selectedTool === "Merge PDF";
  const isJpgToPdf = selectedTool === "JPG to PDF";
  const isPdfToJpg = selectedTool === "PDF to JPG";
  const isSplit = selectedTool === "Split PDF";
  const isWatermark = selectedTool === "Watermark PDF";
  const isSign = selectedTool === "Sign PDF";
  const isProtect = selectedTool === "Protect PDF";
  const isUnlock = selectedTool === "Unlock PDF";
  const isTranslate = selectedTool === "Translate PDF";
  const isSummarize = selectedTool === "Summarize PDF";
  const isBates = selectedTool === "Bates Numbering";
  const isPageNumber = selectedTool === "Page Numbers";
  const isCrop = selectedTool === "Crop PDF";
  const isCopilot = selectedTool === "AI Document Copilot";
  const isTxtToPdf = selectedTool === "TXT to PDF";
  const isHtmlToPdf = selectedTool === "HTML to PDF";

  // New tools variables
  const isFlatten = selectedTool === "Flatten PDF";
  const isRepair = selectedTool === "Repair PDF";
  const isWordToPdf = selectedTool === "Word to PDF";
  const isExcelToPdf = selectedTool === "Excel to PDF";
  const isPptToPdf = selectedTool === "PPT to PDF";
  const isPdfToWord = selectedTool === "PDF to Word";
  const isPdfToExcel = selectedTool === "PDF to Excel";
  const isPdfToPpt = selectedTool === "PDF to PPT";
  const isAnnotate = selectedTool === "PDF Annotator";
  const isOcr = selectedTool === "PDF OCR";
  
  // Additional tools variables
  const isGrayscale = selectedTool === "Grayscale PDF";
  const isOptimize = selectedTool === "Optimize PDF";
  const isPdfToTxt = selectedTool === "PDF to TXT";
  const isPdfToHtml = selectedTool === "PDF to HTML";
  const isPdfToPng = selectedTool === "PDF to PNG";
  const isEditMetadata = selectedTool === "Edit PDF Metadata";
  const isHeaderFooter = selectedTool === "Header & Footer";
  const isResize = selectedTool === "Resize PDF Pages";

  return (
    <>
      <h3 className="sidebar-heading">{selectedTool} Options</h3>
      <div style={{ overflowY: "auto", flex: 1, paddingBottom: "12px" }}>

      {isCompress && (
        <CompressSettings
          compressionLevel={compressionLevel}
          setCompressionLevel={setCompressionLevel}
          toolColor={toolColor}
        />
      )}

      {isMerge && (
        <MergeSettings
          fileNameStamps={fileNameStamps}
          setFileNameStamps={setFileNameStamps}
          includeTOC={includeTOC}
          setIncludeTOC={setIncludeTOC}
        />
      )}

      {isJpgToPdf && (
        <JpgToPdfSettings
          pageOrientation={pageOrientation}
          setPageOrientation={setPageOrientation}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageMargin={pageMargin}
          setPageMargin={setPageMargin}
          mergeAll={mergeAll}
          setMergeAll={setMergeAll}
          toolColor={toolColor}
        />
      )}

      {isPdfToJpg && (
        <PdfToJpgSettings
          conversionMode={conversionMode}
          setConversionMode={setConversionMode}
          toolColor={toolColor}
        />
      )}

      {isSplit && (
        <SplitSettings
          splitMode={splitMode}
          setSplitMode={setSplitMode}
          splitRanges={splitRanges}
          setSplitRanges={setSplitRanges}
          toolColor={toolColor}
        />
      )}

      {isWatermark && (
        <WatermarkSettings
          watermarkText={watermarkText}
          setWatermarkText={setWatermarkText}
          watermarkColor={watermarkColor}
          setWatermarkColor={setWatermarkColor}
          watermarkOpacity={watermarkOpacity}
          setWatermarkOpacity={setWatermarkOpacity}
        />
      )}

      {isSign && (
        <SignSettings
          signatureText={signatureText}
          setSignatureText={setSignatureText}
          signatureStyle={signatureStyle}
          setSignatureStyle={setSignatureStyle}
        />
      )}

      {(isProtect || isUnlock) && (
        <PasswordSettings
          pdfPassword={pdfPassword}
          setPdfPassword={setPdfPassword}
          isProtect={isProtect}
        />
      )}

      {isTranslate && (
        <TranslateSettings
          translateLang={translateLang}
          setTranslateLang={setTranslateLang}
        />
      )}

      {isSummarize && (
        <SummarizeSettings
          summarizeLength={summarizeLength}
          setSummarizeLength={setSummarizeLength}
          toolColor={toolColor}
        />
      )}

      {isBates && (
        <BatesSettings
          batesPrefix={batesPrefix}
          setBatesPrefix={setBatesPrefix}
          batesStart={batesStart}
          setBatesStart={setBatesStart}
        />
      )}

      {isPageNumber && (
        <PageNumberSettings
          pageNumberPos={pageNumberPos}
          setPageNumberPos={setPageNumberPos}
          pageNumberSize={pageNumberSize}
          setPageNumberSize={setPageNumberSize}
        />
      )}

      {isCrop && (
        <CropSettings
          cropMargin={cropMargin}
          setCropMargin={setCropMargin}
        />
      )}

      {isCopilot && (
        <CopilotSettings
          copilotMode={copilotMode}
          setCopilotMode={setCopilotMode}
          toolColor={toolColor}
        />
      )}

      {isTxtToPdf && (
        <TxtToPdfSettings
          txtFontSize={txtFontSize}
          setTxtFontSize={setTxtFontSize}
        />
      )}

      {isHtmlToPdf && (
        <HtmlToPdfSettings
          htmlPageSize={htmlPageSize}
          setHtmlPageSize={setHtmlPageSize}
        />
      )}

      {selectedTool === "Rotate PDF" && (
        <RotateSettings
          totalPdfPages={totalPdfPages}
          rotationMap={rotationMap}
          setRotationMap={setRotationMap}
        />
      )}

      {selectedTool === "Remove Pages" && (
        <RemoveSettings
          removedPages={removedPages}
          setRemovedPages={setRemovedPages}
        />
      )}

      {selectedTool === "Extract Pages" && (
        <ExtractSettings
          selectedPages={selectedPages}
          setSelectedPages={setSelectedPages}
          totalPdfPages={totalPdfPages}
        />
      )}

      {selectedTool === "Organize PDF" && (
        <OrganizeSettings
          setPageOrder={setPageOrder}
          totalPdfPages={totalPdfPages}
        />
      )}

      {isFlatten && (
        <FlattenSettings
          flattenMode={flattenMode}
          setFlattenMode={setFlattenMode}
          toolColor={toolColor}
        />
      )}

      {isRepair && (
        <RepairSettings
          repairMode={repairMode}
          setRepairMode={setRepairMode}
          repairCompatibility={repairCompatibility}
          setRepairCompatibility={setRepairCompatibility}
          toolColor={toolColor}
        />
      )}

      {isWordToPdf && (
        <WordToPdfSettings
          wordMargins={wordMargins}
          setWordMargins={setWordMargins}
          wordBookmarks={wordBookmarks}
          setWordBookmarks={setWordBookmarks}
          wordLinkColors={wordLinkColors}
          setWordLinkColors={setWordLinkColors}
        />
      )}

      {isExcelToPdf && (
        <ExcelToPdfSettings
          excelOrientation={excelOrientation}
          setExcelOrientation={setExcelOrientation}
          excelSheetRendering={excelSheetRendering}
          setExcelSheetRendering={setExcelSheetRendering}
          excelGridlines={excelGridlines}
          setExcelGridlines={setExcelGridlines}
          toolColor={toolColor}
        />
      )}

      {isPptToPdf && (
        <PptToPdfSettings
          pptOrientation={pptOrientation}
          setPptOrientation={setPptOrientation}
          pptSlidesLayout={pptSlidesLayout}
          setPptSlidesLayout={setPptSlidesLayout}
          pptNotes={pptNotes}
          setPptNotes={setPptNotes}
          toolColor={toolColor}
        />
      )}

      {isPdfToWord && (
        <PdfToWordSettings
          pdfToWordMode={pdfToWordMode}
          setPdfToWordMode={setPdfToWordMode}
          pdfToWordOcr={pdfToWordOcr}
          setPdfToWordOcr={setPdfToWordOcr}
          pdfToWordLang={pdfToWordLang}
          setPdfToWordLang={setPdfToWordLang}
          toolColor={toolColor}
        />
      )}

      {isPdfToExcel && (
        <PdfToExcelSettings
          pdfToExcelData={pdfToExcelData}
          setPdfToExcelData={setPdfToExcelData}
          pdfToExcelSeparator={pdfToExcelSeparator}
          setPdfToExcelSeparator={setPdfToExcelSeparator}
          pdfToExcelDetectNum={pdfToExcelDetectNum}
          setPdfToExcelDetectNum={setPdfToExcelDetectNum}
          toolColor={toolColor}
        />
      )}

      {isPdfToPpt && (
        <PdfToPptSettings
          pdfToPptLayout={pdfToPptLayout}
          setPdfToPptLayout={setPdfToPptLayout}
          pdfToPptBorders={pdfToPptBorders}
          setPdfToPptBorders={setPdfToPptBorders}
          pdfToPptCompress={pdfToPptCompress}
          setPdfToPptCompress={setPdfToPptCompress}
          toolColor={toolColor}
        />
      )}

      {isAnnotate && (
        <AnnotateSettings
          annotateTool={annotateTool}
          setAnnotateTool={setAnnotateTool}
          annotateColor={annotateColor}
          setAnnotateColor={setAnnotateColor}
          annotateText={annotateText}
          setAnnotateText={setAnnotateText}
          annotateOpacity={annotateOpacity}
          setAnnotateOpacity={setAnnotateOpacity}
          annotateThickness={annotateThickness}
          setAnnotateThickness={setAnnotateThickness}
          toolColor={toolColor}
        />
      )}

      {isOcr && (
        <OcrSettings
          ocrEngineMode={ocrEngineMode}
          setOcrEngineMode={setOcrEngineMode}
          ocrLanguage={ocrLanguage}
          setOcrLanguage={setOcrLanguage}
          toolColor={toolColor}
        />
      )}

      {isGrayscale && (
        <GrayscaleSettings
          grayscaleMode={grayscaleMode}
          setGrayscaleMode={setGrayscaleMode}
          toolColor={toolColor}
        />
      )}

      {isOptimize && (
        <OptimizeSettings
          optimizeLevel={optimizeLevel}
          setOptimizeLevel={setOptimizeLevel}
          toolColor={toolColor}
        />
      )}

      {isPdfToTxt && (
        <PdfToTxtSettings
          txtEncoding={txtEncoding}
          setTxtEncoding={setTxtEncoding}
        />
      )}

      {isPdfToHtml && (
        <PdfToHtmlSettings
          htmlLayout={htmlLayout}
          setHtmlLayout={setHtmlLayout}
          toolColor={toolColor}
        />
      )}

      {isPdfToPng && (
        <PdfToPngSettings
          pngDpi={pngDpi}
          setPngDpi={setPngDpi}
        />
      )}

      {isEditMetadata && (
        <EditMetadataSettings
          metadataTitle={metadataTitle}
          setMetadataTitle={setMetadataTitle}
          metadataAuthor={metadataAuthor}
          setMetadataAuthor={setMetadataAuthor}
          metadataSubject={metadataSubject}
          setMetadataSubject={setMetadataSubject}
          metadataKeywords={metadataKeywords}
          setMetadataKeywords={setMetadataKeywords}
        />
      )}

      {isHeaderFooter && (
        <HeaderFooterSettings
          headerText={headerText}
          setHeaderText={setHeaderText}
          footerText={footerText}
          setFooterText={setFooterText}
        />
      )}

      {isResize && (
        <ResizeSettings
          resizePageSize={resizePageSize}
          setResizePageSize={setResizePageSize}
          toolColor={toolColor}
        />
      )}

      {!isCompress && !isMerge && !isJpgToPdf && !isPdfToJpg && !isSplit && 
       !isWatermark && !isSign && !isProtect && !isUnlock && !isTranslate && !isSummarize && 
       !isBates && !isPageNumber && !isCrop && !isCopilot && !isTxtToPdf && !isHtmlToPdf && 
       !isFlatten && !isRepair && !isWordToPdf && !isExcelToPdf && !isPptToPdf && 
       !isPdfToWord && !isPdfToExcel && !isPdfToPpt && !isAnnotate && !isOcr && 
       !isGrayscale && !isOptimize && !isPdfToTxt && !isPdfToHtml && !isPdfToPng && 
       !isEditMetadata && !isHeaderFooter && !isResize && 
       selectedTool !== "Rotate PDF" && selectedTool !== "Remove Pages" && 
       selectedTool !== "Extract Pages" && selectedTool !== "Organize PDF" && (
         <DefaultSettings
           outputQuality={outputQuality}
           setOutputQuality={setOutputQuality}
           toolColor={toolColor}
         />
      )}

      </div>
      <div className="sidebar-action-footer" style={{ background: "transparent", borderTop: "none", paddingTop: "8px" }}>
        <button 
          className="primary-button process-sidebar-btn" 
          onClick={runProcess}
        >
          {selectedTool.toUpperCase()} →
        </button>
        <button 
          className="cancel-sidebar-btn" 
          onClick={clearSelection}
          style={{
            background: "#ffffff",
            color: "#000000",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            minHeight: "44px",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "9999px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, border-color 0.15s",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            width: "100%"
          }}
          onMouseOver={e => { e.currentTarget.style.background = "#f5f5f7"; e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.15)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.15)"; }}
        >
          Cancel &amp; Back
        </button>
        <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(0, 0, 0, 0.6)", margin: "4px 0 0", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>No registration required</p>
      </div>
    </>
  );
}
