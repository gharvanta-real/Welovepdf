export interface OverlayElement {
  id: string;
  type: "text" | "drawing" | "highlight" | "shape" | "signature" | "redact" | "image" | "comment" | "link" | "stamp";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  opacity?: number;
  thickness?: number;
  points?: { x: number; y: number }[];
  shapeType?: "rectangle" | "circle" | "line" | "arrow" | "diamond";
  dataUrl?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  align?: "left" | "center" | "right" | "justify";
  redactText?: string;
  linkUrl?: string;
  stampType?: string;
  commentText?: string;
  zIndex?: number;
  locked?: boolean;
}

export interface PdfEditorProps {
  file: File;
  selectedTool: string;
  onClose: () => void;
  onSave: (files: FileList, options?: any) => void;
}

export type ActiveTool = "pan" | "select" | "text" | "pen" | "highlight" | "shape" | "signature" | "redact" | "image" | "comment" | "link" | "stamp" | "crop" | "eraser";
export type RibbonTab = "home" | "insert" | "draw" | "layout" | "view";

export const FONTS = [
  "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana",
  "Arial", "Trebuchet MS", "Garamond", "Palatino Linotype", "Comic Sans MS"
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 60, 72];

export const PRESET_COLORS = [
  "#000000", "#1e293b", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#f1f5f9", "#fecaca", "#fed7aa", "#fef9c3",
  "#bbf7d0", "#a5f3fc", "#bfdbfe", "#ddd6fe", "#fbcfe8"
];

export const STAMP_TYPES = ["APPROVED", "DRAFT", "CONFIDENTIAL", "REVIEWED", "VOID", "CERTIFIED", "URGENT"];
