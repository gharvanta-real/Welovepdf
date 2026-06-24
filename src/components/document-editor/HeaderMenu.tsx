import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, Folder, CloudUpload, MessageSquare, Download, ChevronDown, ChevronUp, Lock, Sparkles, X, Hash, User,
  FilePlus, FolderOpen, Globe, FileText, Settings, BarChart2, Trash2, Undo, Redo, Scissors, Copy, Clipboard,
  CheckSquare, Search, Ruler, Layout, Maximize2, Image, Table, Link, Minus, Type, Calendar, Clock, Bold,
  Italic, Underline, Strikethrough, Superscript, Subscript, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent, Outdent, ChevronsUpDown, Eraser, BookOpen, Languages, Keyboard, Info, ChevronRight,
  Printer, FileMinus, Bookmark, Columns, Mic, MicOff, Edit, Eye, Save
} from 'lucide-react';

interface HeaderMenuProps {
  docTitle: string;
  onTitleChange: (title: string) => void;
  onNew: () => void;
  onExport: () => void;
  onClear: () => void;
  onInsertElement: (tag: string, value?: string) => void;
  onClose: () => void;
  onOpenFindReplace: () => void;
  onOpenWordCount: () => void;
  contentHtml: string;
  onContentChange: (html: string) => void;
  onOpenSpecialCharacters: () => void;
  onOpenDictionary: () => void;
  onOpenTranslation: () => void;
  onToggleSidebar: () => void;
  onOpenPageSetup: () => void;
  isToolbarCollapsed: boolean;
  onToggleToolbarCollapse: () => void;
  showRuler?: boolean;
  onToggleRuler?: () => void;
  layoutMode?: 'print' | 'web';
  onToggleLayoutMode?: (mode: 'print' | 'web') => void;
  isRecording?: boolean;
  onToggleVoiceTyping?: () => void;
  onShowDocDetails?: () => void;
  onInsertColumns?: (count: number) => void;
  onSetZoom?: (zoom: string) => void;
  onTextCase?: (caseType: 'upper' | 'lower' | 'title') => void;
  showGridlines?: boolean;
  onToggleGridlines?: () => void;
  editorMode?: 'editing' | 'viewing';
  onToggleEditorMode?: (mode: 'editing' | 'viewing') => void;
  onOpenSaveExport?: () => void;
}

export function HeaderMenu({
  docTitle,
  onTitleChange,
  onNew,
  onExport,
  onClear,
  onInsertElement,
  onClose,
  onOpenFindReplace,
  onOpenWordCount,
  contentHtml,
  onContentChange,
  onOpenSpecialCharacters,
  onOpenDictionary,
  onOpenTranslation,
  onToggleSidebar,
  onOpenPageSetup,
  isToolbarCollapsed,
  onToggleToolbarCollapse,
  showRuler = true,
  onToggleRuler,
  layoutMode = 'print',
  onToggleLayoutMode,
  isRecording = false,
  onToggleVoiceTyping,
  onShowDocDetails,
  onInsertColumns,
  onSetZoom,
  onTextCase,
  showGridlines = false,
  onToggleGridlines,
  editorMode = 'editing',
  onToggleEditorMode,
  onOpenSaveExport,
}: HeaderMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadHtml = () => {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${docTitle}</title></head><body>${contentHtml}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${docTitle || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleDownloadTxt = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const text = doc.body.textContent || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${docTitle || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.txt';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target?.result as string;
          if (file.name.endsWith('.html')) {
            const parser = new DOMParser();
            const parsed = parser.parseFromString(text, 'text/html');
            onContentChange(parsed.body.innerHTML);
          } else {
            onContentChange(text.replace(/\n/g, '<br>'));
          }
          onTitleChange(file.name.replace(/\.[^/.]+$/, ""));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePaste = () => {
    navigator.clipboard?.readText().then(text => {
      document.execCommand('insertText', false, text);
    }).catch(() => {
      alert("Clipboard access blocked by browser. Please use Ctrl+V.");
    });
  };

  const menus = [
    {
      name: 'File',
      items: [
        { label: 'New document', shortcut: '', icon: <FilePlus size={14} />, action: onNew },
        { label: 'Open', shortcut: 'Ctrl+O', icon: <FolderOpen size={14} />, action: handleOpenFile },
        { type: 'divider' },
        { label: 'Save / Export...', shortcut: 'Ctrl+S', icon: <Save size={14} />, action: onOpenSaveExport },
        { type: 'divider' },
        {
          label: 'Download as...',
          icon: <Download size={14} />,
          submenu: [
            { label: 'Web Page (.html)', icon: <Globe size={14} />, action: handleDownloadHtml },
            { label: 'Plain Text (.txt)', icon: <FileText size={14} />, action: handleDownloadTxt },
            { label: 'PDF Document (.pdf)', icon: <FileText size={14} />, action: onExport }
          ]
        },
        { type: 'divider' },
        { label: 'Page setup', icon: <Settings size={14} />, action: onOpenPageSetup },
        { label: 'Word count', shortcut: 'Ctrl+Shift+C', icon: <BarChart2 size={14} />, action: onOpenWordCount },
        { label: 'Print', shortcut: 'Ctrl+P', icon: <Printer size={14} />, action: () => window.print() },
        { label: 'Document details...', icon: <Info size={14} />, action: onShowDocDetails },
        { type: 'divider' },
        { label: 'Clear document', icon: <Trash2 size={14} />, action: onClear, danger: true },
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo size={14} />, action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', icon: <Redo size={14} />, action: () => document.execCommand('redo') },
        { type: 'divider' },
        { label: 'Cut', shortcut: 'Ctrl+X', icon: <Scissors size={14} />, action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', icon: <Copy size={14} />, action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', icon: <Clipboard size={14} />, action: handlePaste },
        { type: 'divider' },
        { label: 'Select all', shortcut: 'Ctrl+A', icon: <CheckSquare size={14} />, action: () => document.execCommand('selectAll') },
        { label: 'Find & Replace', shortcut: 'Ctrl+H', icon: <Search size={14} />, action: () => { onOpenFindReplace(); } },
      ]
    },
    {
      name: 'View',
      items: [
        { label: 'Show ruler', icon: <Ruler size={14} />, checked: showRuler, action: onToggleRuler },
        { label: 'Print Layout', icon: <Layout size={14} />, checked: layoutMode === 'print', action: () => onToggleLayoutMode?.('print') },
        { label: 'Web Layout', icon: <Globe size={14} />, checked: layoutMode === 'web', action: () => onToggleLayoutMode?.('web') },
        { label: 'Gridlines', icon: <Layout size={14} />, checked: showGridlines, action: onToggleGridlines },
        { label: 'Toggle outline sidebar', icon: <Layout size={14} />, action: onToggleSidebar },
        { label: 'Page setup options', icon: <Settings size={14} />, action: onOpenPageSetup },
        { type: 'divider' },
        { label: 'Mode: Editing', icon: <Edit size={14} />, checked: editorMode === 'editing', action: () => onToggleEditorMode?.('editing') },
        { label: 'Mode: Viewing (Read-only)', icon: <Eye size={14} />, checked: editorMode === 'viewing', action: () => onToggleEditorMode?.('viewing') },
        { type: 'divider' },
        {
          label: 'Zoom',
          icon: <Search size={14} />,
          submenu: [
            { label: '50%', action: () => onSetZoom?.('50%') },
            { label: '75%', action: () => onSetZoom?.('75%') },
            { label: '100%', action: () => onSetZoom?.('100%') },
            { label: '125%', action: () => onSetZoom?.('125%') },
            { label: '150%', action: () => onSetZoom?.('150%') },
            { label: '200%', action: () => onSetZoom?.('200%') }
          ]
        },
        { type: 'divider' },
        { label: 'Full screen', icon: <Maximize2 size={14} />, action: () => document.documentElement.requestFullscreen?.() },
      ]
    },
    {
      name: 'Insert',
      items: [
        { label: 'Image', icon: <Image size={14} />, action: () => onInsertElement('image') },
        { label: 'Table', icon: <Table size={14} />, action: () => onInsertElement('table') },
        { type: 'divider' },
        { label: 'Link', shortcut: 'Ctrl+K', icon: <Link size={14} />, action: () => onInsertElement('link') },
        { type: 'divider' },
        { label: 'Horizontal line', icon: <Minus size={14} />, action: () => onInsertElement('hr') },
        { label: 'Page break', icon: <FileMinus size={14} />, action: () => onInsertElement('pagebreak') },
        { label: 'Footnote', icon: <Bookmark size={14} />, action: () => onInsertElement('footnote') },
        { label: 'Special characters...', icon: <Type size={14} />, action: onOpenSpecialCharacters },
        { type: 'divider' },
        { label: 'Date & Time', icon: <Calendar size={14} />, action: () => document.execCommand('insertText', false, new Date().toLocaleString()) },
      ]
    },
    {
      name: 'Format',
      items: [
        {
          label: 'Text',
          icon: <Type size={14} />,
          submenu: [
            { label: 'Bold', icon: <Bold size={14} />, action: () => document.execCommand('bold') },
            { label: 'Italic', icon: <Italic size={14} />, action: () => document.execCommand('italic') },
            { label: 'Underline', icon: <Underline size={14} />, action: () => document.execCommand('underline') },
            { label: 'Strikethrough', icon: <Strikethrough size={14} />, action: () => document.execCommand('strikeThrough') },
            { label: 'Superscript', icon: <Superscript size={14} />, action: () => document.execCommand('superscript') },
            { label: 'Subscript', icon: <Subscript size={14} />, action: () => document.execCommand('subscript') }
          ]
        },
        {
          label: 'Text Case',
          icon: <Type size={14} />,
          submenu: [
            { label: 'UPPERCASE', action: () => onTextCase?.('upper') },
            { label: 'lowercase', action: () => onTextCase?.('lower') },
            { label: 'Title Case', action: () => onTextCase?.('title') }
          ]
        },
        {
          label: 'Align & indent',
          icon: <AlignLeft size={14} />,
          submenu: [
            { label: 'Left align', icon: <AlignLeft size={14} />, action: () => document.execCommand('justifyLeft') },
            { label: 'Center align', icon: <AlignCenter size={14} />, action: () => document.execCommand('justifyCenter') },
            { label: 'Right align', icon: <AlignRight size={14} />, action: () => document.execCommand('justifyRight') },
            { label: 'Justify align', icon: <AlignJustify size={14} />, action: () => document.execCommand('justifyFull') },
            { label: 'Increase indent', icon: <Indent size={14} />, action: () => document.execCommand('indent') },
            { label: 'Decrease indent', icon: <Outdent size={14} />, action: () => document.execCommand('outdent') }
          ]
        },
        {
          label: 'Page columns',
          icon: <Columns size={14} />,
          submenu: [
            { label: '1 Column', icon: <AlignJustify size={14} />, action: () => onInsertColumns?.(1) },
            { label: '2 Columns', icon: <Columns size={14} />, action: () => onInsertColumns?.(2) },
            { label: '3 Columns', icon: <Columns size={14} />, action: () => onInsertColumns?.(3) }
          ]
        },
        {
          label: 'Line spacing',
          icon: <ChevronsUpDown size={14} />,
          submenu: [
            { label: 'Single spacing (1.0)', icon: <AlignJustify size={14} />, action: () => document.execCommand('insertHTML', false, '<div style="line-height:1.0;">') },
            { label: 'Normal spacing (1.15)', icon: <AlignJustify size={14} />, action: () => document.execCommand('insertHTML', false, '<div style="line-height:1.15;">') },
            { label: 'Double spacing (2.0)', icon: <AlignJustify size={14} />, action: () => document.execCommand('insertHTML', false, '<div style="line-height:2.0;">') }
          ]
        },
        { type: 'divider' },
        { label: 'Clear formatting', shortcut: 'Ctrl+\\', icon: <Eraser size={14} />, action: () => document.execCommand('removeFormat') },
      ]
    },
    {
      name: 'Tools',
      items: [
        { label: 'Word count', shortcut: 'Ctrl+Shift+C', icon: <BarChart2 size={14} />, action: () => { onOpenWordCount(); } },
        { label: 'Find & Replace', shortcut: 'Ctrl+H', icon: <Search size={14} />, action: () => { onOpenFindReplace(); } },
        { type: 'divider' },
        { 
          label: isRecording ? 'Recording (click to stop)' : 'Voice typing (Dictate)', 
          icon: isRecording ? <MicOff size={14} style={{ color: '#dc2626' }} /> : <Mic size={14} />, 
          action: onToggleVoiceTyping 
        },
        { label: 'Dictionary lookup...', icon: <BookOpen size={14} />, action: onOpenDictionary },
        { label: 'Translate document...', icon: <Languages size={14} />, action: onOpenTranslation },
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'Keyboard shortcuts', shortcut: 'Ctrl+/', icon: <Keyboard size={14} />, action: () => alert('Keyboard Shortcuts:\n\nBold: Ctrl+B\nItalic: Ctrl+I\nUnderline: Ctrl+U\nFind: Ctrl+F\nFind & Replace: Ctrl+H\nWord Count: Ctrl+Shift+C\nSave as HTML: Ctrl+S\nPrint: Ctrl+P\nSelect all: Ctrl+A\nUndo: Ctrl+Z\nRedo: Ctrl+Y') },
        { type: 'divider' },
        { label: 'About PDFMount Editor', icon: <Info size={14} />, action: () => alert('PDFMount Editor v1.0\nProfessional Document Editing in your browser.') },
      ]
    }
  ];

  return (
    <div
      className="pme-header-root"
      ref={menuContainerRef}
      style={{
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Google Sans', Roboto, sans-serif",
        boxSizing: 'border-box',
        padding: '0',
        userSelect: 'none',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== HEADER ICON BUTTON ===== */
        .pme-hdr-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #4b5563;
          outline: none;
          transition: background-color 0.15s;
          flex-shrink: 0;
        }
        .pme-hdr-icon-btn:hover {
          background-color: #f3f4f6;
        }

        /* ===== MENU BAR BUTTON ===== */
        .pme-menu-btn {
          background: transparent;
          border: none;
          padding: 4px 8px;
          font-size: 13px;
          line-height: 1.25;
          color: #374151;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Google Sans', Roboto, sans-serif;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 3px;
          outline: none;
          transition: background-color 0.12s;
          white-space: nowrap;
        }
        .pme-menu-btn:hover {
          background-color: #f3f4f6;
        }
        .pme-menu-btn.pme-menu-active {
          background-color: #f1f3f4;
          color: #111827;
        }

        /* ===== DROPDOWN PANEL ===== */
        .pme-dropdown-panel {
          position: absolute;
          top: calc(100% + 2px);
          left: 0;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
          border-radius: 8px;
          padding: 4px 0;
          min-width: 220px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
        }

        /* ===== DROPDOWN ITEM ===== */
        .pme-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 34px;
          font-size: 13px;
          font-family: 'Google Sans', Roboto, sans-serif;
          color: #374151;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          white-space: nowrap;
          outline: none;
          gap: 8px;
          transition: background-color 0.1s;
          position: relative;
        }
        .pme-dropdown-item:hover {
          background-color: #f9fafb;
        }
        .pme-dropdown-item.pme-danger {
          color: #dc2626;
        }
        .pme-dropdown-item.pme-danger:hover {
          background-color: #fef2f2;
        }
        
        /* ===== SUBMENU PANEL ===== */
        .pme-dropdown-submenu {
          display: none;
          position: absolute;
          left: 100%;
          top: 0;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
          border-radius: 4px;
          padding: 4px 0;
          min-width: 180px;
          z-index: 2100;
          border: 1px solid #e5e7eb;
          flex-direction: column;
        }
        .pme-dropdown-item:hover .pme-dropdown-submenu {
          display: flex;
        }
        .pme-submenu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 32px;
          font-size: 12px;
          font-family: 'Google Sans', Roboto, sans-serif;
          color: #374151;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          white-space: nowrap;
          outline: none;
          transition: background-color 0.1s;
        }
        .pme-submenu-item:hover {
          background-color: #f9fafb;
          color: #111827;
        }

        /* ===== DIVIDER ===== */
        .pme-dropdown-divider {
          height: 1px;
          background-color: #f3f4f6;
          margin: 3px 0;
        }

        /* ===== SHORTCUT SPAN ===== */
        .pme-dropdown-shortcut {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 400;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* ===== TITLE INPUT ===== */
        .pme-title-input {
          border: none;
          outline: none;
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          padding: 3px 6px;
          border-radius: 4px;
          border: 1px solid transparent;
          max-width: 320px;
          min-width: 80px;
          background-color: transparent;
          font-family: 'Google Sans', Roboto, sans-serif;
          transition: background-color 0.1s, border-color 0.1s;
        }
        .pme-title-input:hover {
          background-color: #f3f4f6;
          border-color: #e5e7eb;
        }
        .pme-title-input:focus {
          background-color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
        }

        /* ===== SHARE BUTTON ===== */
        .pme-share-btn {
          background-color: #f1f3f4;
          color: #374151;
          border: none;
          border-radius: 24px;
          padding: 0 18px;
          height: 34px;
          font-size: 14px;
          font-family: 'Google Sans', Roboto, sans-serif;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          outline: none;
          transition: background-color 0.12s;
          flex-shrink: 0;
        }
        .pme-share-btn:hover {
          background-color: #e8eaed;
        }

        /* ===== USER AVATAR ===== */
        .pme-avatar-btn {
          background-color: #f1f3f4;
          color: #374151;
          border: none;
          transition: background-color 0.12s;
        }
        .pme-avatar-btn:hover {
          background-color: #e8eaed;
        }
      `}} />

      {/* ──────────────── TOP ROW: Logo + Title + Right Actions ──────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 16px 4px 12px',
        gap: '4px',
        minHeight: '48px',
      }}>
        {/* PDFMount Logo/Icon — clicking goes back */}
        <div
          onClick={onClose}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', marginRight: '6px', flexShrink: 0 }}
          title="Back to PDFMount"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="4" fill="#1f2937"/>
            <path d="M8 9h13l7 7v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z" fill="white" fillOpacity="0.9"/>
            <path d="M21 9v7h7" fill="none" stroke="#1f2937" strokeWidth="1.5"/>
            <line x1="11" y1="18" x2="23" y2="18" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="22" x2="23" y2="22" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="26" x2="17" y2="26" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Document Title + icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <input
              type="text"
              value={docTitle}
              onChange={e => onTitleChange(e.target.value)}
              className="pme-title-input"
              onFocus={e => e.target.select()}
              spellCheck={false}
              placeholder="Untitled Document"
            />
          </div>

          {/* Menu bar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            {menus.map(menu => (
              <div key={menu.name} style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
                  className={`pme-menu-btn ${activeMenu === menu.name ? 'pme-menu-active' : ''}`}
                  onMouseEnter={() => { if (activeMenu && activeMenu !== menu.name) setActiveMenu(menu.name); }}
                >
                  {menu.name}
                </button>

                {activeMenu === menu.name && (
                  <div className="pme-dropdown-panel">
                    {menu.items.map((item: any, idx) => {
                      if (item.type === 'divider') {
                        return <div key={idx} className="pme-dropdown-divider" />;
                      }
                      return (
                        <div
                          key={idx}
                          className={`pme-dropdown-item${item.danger ? ' pme-danger' : ''}`}
                          onClick={(e) => {
                            if (item.submenu) {
                              e.stopPropagation();
                              return;
                            }
                            item.action?.();
                            setActiveMenu(null);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            {item.checked !== undefined ? (
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold', width: 14, flexShrink: 0 }}>
                                {item.checked ? '✓' : ''}
                              </span>
                            ) : item.icon ? (
                              <span style={{ display: 'flex', alignItems: 'center', color: '#5f6368', flexShrink: 0 }}>
                                {item.icon}
                              </span>
                            ) : (
                              <div style={{ width: 14 }} />
                            )}
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {item.label}
                            </span>
                          </div>
                          <span className="pme-dropdown-shortcut" style={{ display: 'flex', alignItems: 'center' }}>
                            {item.submenu ? <ChevronRight size={13} style={{ color: '#9ca3af' }} /> : item.shortcut || ''}
                          </span>

                          {item.submenu && (
                            <div className="pme-dropdown-submenu" onClick={e => e.stopPropagation()}>
                              {item.submenu.map((subItem: any, subIdx: number) => (
                                <button
                                  key={subIdx}
                                  className="pme-submenu-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    subItem.action?.();
                                    setActiveMenu(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: '0 14px',
                                    height: '32px',
                                    fontFamily: 'inherit',
                                    fontSize: '12px',
                                    color: '#374151',
                                  }}
                                >
                                  {subItem.icon ? (
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#5f6368', flexShrink: 0 }}>
                                      {subItem.icon}
                                    </span>
                                  ) : (
                                    <div style={{ width: 14 }} />
                                  )}
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {subItem.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right side: download, share, avatar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Download button */}
          <button className="pme-hdr-icon-btn" style={{ width: 34, height: 34 }} title="Download document" onClick={handleDownloadHtml}>
            <Download size={17} />
          </button>

          {/* Share button */}
          <button className="pme-share-btn" title="Share document" onClick={() => alert('Sharing is handled automatically by PDFMount. Anyone with this link can view.')}>
            <Lock size={15} />
            Share
          </button>

          {/* User avatar */}
          <div
            className="pme-avatar-btn"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
              marginLeft: 2,
            }}
            title="Account"
          >
            <User size={15} />
          </div>

          {/* Expand Toggle Button (only shown when collapsed) */}
          {isToolbarCollapsed && (
            <button
              className="pme-hdr-icon-btn"
              style={{
                width: 30,
                height: 30,
                borderRadius: '3px', // sharp corners
                marginLeft: 4,
                color: '#374151',
              }}
              title="Expand toolbar"
              onClick={onToggleToolbarCollapse}
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
