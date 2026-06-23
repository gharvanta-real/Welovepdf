export type TextFormat = 'bold' | 'italic' | 'underline' | 'strikeThrough';

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export type ListType = 'ordered' | 'unordered';

export interface EditorState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikeThrough: boolean;
  alignment: TextAlignment;
  fontName: string;
  fontSize: string;
  isLinkActive: boolean;
  foreColor?: string;
  backColor?: string;
}

export interface DocumentPage {
  id: string;
  contentHtml: string;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}
