import {
  Archive,
  FileImage,
  FileLock2,
  FileOutput,
  FileText,
  FolderKanban,
  Image,
  Layers,
  RefreshCw,
  RotateCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stamp,
  Table2,
  Type,
  Wrench,
  MessageSquare,
  Languages,
  PenTool,
  Crop,
  Hash,
  FileCode,
  Sliders,
  Zap,
  Droplet,
  Info,
  Heading,
  Maximize,
  Paintbrush,
  Binary,
} from "lucide-react";
import type { ComponentType } from "react";

export type ToolGroup = "Popular" | "Convert" | "Organize" | "Secure" | "AI";

export type SitemapGroup =
  | "Convert from PDF"
  | "Convert to PDF"
  | "Compress & Merge"
  | "View & Edit"
  | "Brand & Security";

export type PdfTool = {
  id: string;
  name: string;
  group: ToolGroup;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  sitemapGroup: SitemapGroup;
  status: "live" | "beta" | "coming-soon";
};

export const groups: ToolGroup[] = ["Popular", "Convert", "Organize", "Secure", "AI"];

export const sitemapGroups: SitemapGroup[] = [
  "Convert from PDF",
  "Convert to PDF",
  "Compress & Merge",
  "View & Edit",
  "Brand & Security",
];

export const tools: PdfTool[] = [
  // Popular / Compress & Merge
  { id: "merge", name: "Merge PDF", group: "Popular", description: "Combine multiple PDFs into one unified document", icon: Layers, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "split", name: "Split PDF", group: "Popular", description: "Separate pages into clean, standalone files", icon: Scissors, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "compress", name: "Compress PDF", group: "Popular", description: "Reduce the size of your PDF without losing quality", icon: Archive, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "flatten", name: "Flatten PDF", group: "Organize", description: "Flatten form fields and annotations into the page", icon: Layers, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "repair", name: "Repair PDF", group: "Organize", description: "Fix and recover corrupted or damaged PDF data", icon: Wrench, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "grayscale-pdf", name: "Grayscale PDF", group: "Organize", description: "Convert colored PDF pages to clean black & white format", icon: Droplet, sitemapGroup: "Compress & Merge", status: "live" },
  { id: "optimize-pdf", name: "Optimize PDF", group: "Popular", description: "Optimize and linearize PDF documents for fast web viewing", icon: Zap, sitemapGroup: "Compress & Merge", status: "live" },

  // Convert to PDF
  { id: "word-pdf", name: "Word to PDF", group: "Convert", description: "Convert DOCX and DOC files into stable PDFs", icon: FileText, sitemapGroup: "Convert to PDF", status: "live" },
  { id: "excel-pdf", name: "Excel to PDF", group: "Convert", description: "Convert spreadsheets to PDF document format", icon: Table2, sitemapGroup: "Convert to PDF", status: "live" },
  { id: "ppt-pdf", name: "PPT to PDF", group: "Convert", description: "Convert slides and presentations to stable PDFs", icon: FileText, sitemapGroup: "Convert to PDF", status: "live" },
  { id: "jpg-pdf", name: "JPG to PDF", group: "Popular", description: "Transform JPG, PNG, BMP, and GIF images to PDF", icon: Image, sitemapGroup: "Convert to PDF", status: "live" },
  { id: "html-pdf", name: "HTML to PDF", group: "Convert", description: "Convert webpage URLs or HTML files to PDF", icon: FileCode, sitemapGroup: "Convert to PDF", status: "live" },
  { id: "txt-pdf", name: "TXT to PDF", group: "Convert", description: "Convert plain text documents to format-aligned PDF", icon: FileText, sitemapGroup: "Convert to PDF", status: "live" },

  // Convert from PDF
  { id: "pdf-word", name: "PDF to Word", group: "Popular", description: "Convert PDFs to editable Microsoft Word documents", icon: FileOutput, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-excel", name: "PDF to Excel", group: "Convert", description: "Convert PDFs to clean Excel spreadsheets", icon: Table2, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-ppt", name: "PDF to PPT", group: "Convert", description: "Convert PDF slides to editable PowerPoint presentations", icon: FileOutput, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-jpg", name: "PDF to JPG", group: "Convert", description: "Export PDF pages as sharp, independent JPG images", icon: FileImage, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-txt", name: "PDF to TXT", group: "Convert", description: "Extract clean plain text from PDF document layout", icon: FileText, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-html", name: "PDF to HTML", group: "Convert", description: "Convert PDF pages to responsive HTML web pages", icon: FileCode, sitemapGroup: "Convert from PDF", status: "live" },
  { id: "pdf-png", name: "PDF to PNG", group: "Convert", description: "Export PDF pages as individual high-quality PNG images", icon: Image, sitemapGroup: "Convert from PDF", status: "live" },

  // View & Edit
  { id: "rotate", name: "Rotate PDF", group: "Organize", description: "Fix sideways pages or rotate entire documents", icon: RotateCw, sitemapGroup: "View & Edit", status: "live" },
  { id: "remove", name: "Remove Pages", group: "Organize", description: "Delete unnecessary pages before sharing", icon: FolderKanban, sitemapGroup: "View & Edit", status: "live" },
  { id: "extract", name: "Extract Pages", group: "Organize", description: "Extract specified page ranges into a new document", icon: Scissors, sitemapGroup: "View & Edit", status: "live" },
  { id: "organize", name: "Organize PDF", group: "Organize", description: "Reorder, delete, and structure pages visually", icon: FolderKanban, sitemapGroup: "View & Edit", status: "live" },
  { id: "crop-pdf", name: "Crop PDF", group: "Organize", description: "Crop page margins and define custom document boundaries", icon: Crop, sitemapGroup: "View & Edit", status: "live" },
  { id: "page-numbers", name: "Page Numbers", group: "Organize", description: "Number PDF pages automatically at custom locations", icon: Binary, sitemapGroup: "View & Edit", status: "live" },
  { id: "pdf-annotator", name: "PDF Annotator", group: "Popular", description: "Highlight, underline, draw, and add text comments to PDFs", icon: PenTool, sitemapGroup: "View & Edit", status: "live" },
  { id: "header-footer-pdf", name: "Header & Footer", group: "Organize", description: "Add customizable headers and footers to document pages", icon: Heading, sitemapGroup: "View & Edit", status: "beta" },
  { id: "resize-pdf", name: "Resize PDF Pages", group: "Organize", description: "Change paper layout boundaries to A4, Letter, or Legal size", icon: Maximize, sitemapGroup: "View & Edit", status: "beta" },

  // Sign & Protect
  { id: "esign", name: "Sign PDF", group: "Popular", description: "Draw or type electronic signatures onto documents", icon: Stamp, sitemapGroup: "Brand & Security", status: "live" },
  { id: "unlock", name: "Unlock PDF", group: "Secure", description: "Remove secure owner passwords and restrictions", icon: FileLock2, sitemapGroup: "Brand & Security", status: "live" },
  { id: "protect", name: "Protect PDF", group: "Secure", description: "Encrypt your PDF with standard owner/user passwords", icon: ShieldCheck, sitemapGroup: "Brand & Security", status: "live" },
  { id: "ocr", name: "PDF OCR", group: "AI", description: "Make scanned PDF pages fully searchable and editable", icon: RefreshCw, sitemapGroup: "Brand & Security", status: "live" },
  { id: "watermark-pdf", name: "Watermark PDF", group: "Popular", description: "Overlay customized text or image watermarks on pages", icon: Paintbrush, sitemapGroup: "Brand & Security", status: "live" },
  { id: "bates-numbering", name: "Bates Numbering", group: "Secure", description: "Index legal sheets with unique alphanumeric Bates numbering", icon: Hash, sitemapGroup: "Brand & Security", status: "beta" },
  { id: "metadata-pdf", name: "Edit PDF Metadata", group: "Secure", description: "Edit title, author, subject, and keywords fields in a PDF", icon: Info, sitemapGroup: "Brand & Security", status: "beta" },
];
