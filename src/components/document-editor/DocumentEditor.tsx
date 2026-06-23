import { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, MoreVertical, Settings, Keyboard, Sliders, X, FileText, Printer, Mic, MicOff, Columns } from 'lucide-react';
import { HeaderMenu } from './HeaderMenu';
import { SidebarOutline } from './SidebarOutline';
import { Toolbar } from './Toolbar';
import { PageCanvas } from './PageCanvas';
import { useEditorCommands } from './useEditorCommands';
import { exportToPdf } from './printService';
import { FindReplaceModal } from './FindReplaceModal';
import { WordCountModal } from './WordCountModal';
import { SpecialCharactersModal } from './SpecialCharactersModal';
import { DictionaryModal } from './DictionaryModal';
import { TranslationModal } from './TranslationModal';

interface DocumentEditorProps {
  onClose: () => void;
  initialContent?: string;
}

export function DocumentEditor({ onClose, initialContent }: DocumentEditorProps) {
  const [docTitle, setDocTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdfmount-doc-title');
      return saved || 'Resume';
    }
    return 'Resume';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contentHtml, setContentHtml] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdfmount-doc-content');
      if (saved) return saved;
    }
    return `
    <h1 style="text-align:center;font-size:26px;font-weight:bold;margin:0 0 8px 0;font-family:Arial,sans-serif;color:#202124;">Your Name</h1>
    <p style="text-align:center;color:#5f6368;font-size:11pt;margin:0 0 32px 0;font-family:Arial,sans-serif;line-height:1.5;">your.email@example.com &nbsp;·&nbsp; (555) 555-5555 &nbsp;·&nbsp; City, State</p>

    <h3 style="color:#374151;text-transform:uppercase;font-size:10pt;margin:0 0 4px 0;font-weight:600;letter-spacing:1px;font-family:Arial,sans-serif;">Experience</h3>
    <hr style="border:none;border-top:1px solid #dadce0;margin:0 0 12px 0;" />
    <p style="font-family:Arial,sans-serif;font-size:11pt;margin:0 0 2px 0;line-height:1.5;"><strong>Company Name</strong> &mdash; <em>Job Title</em></p>
    <p style="color:#5f6368;font-size:10pt;margin:0 0 8px 0;font-family:Arial,sans-serif;line-height:1.5;">Month 20XX – Present</p>
    <ul style="font-size:11pt;color:#3c4043;font-family:Arial,sans-serif;padding-left:20px;margin:0 0 20px 0;line-height:1.6;">
      <li>Led cross-functional teams to deliver projects on time and within budget.</li>
      <li>Improved system performance by 40% through code optimization.</li>
    </ul>

    <h3 style="color:#374151;text-transform:uppercase;font-size:10pt;margin:0 0 4px 0;font-weight:600;letter-spacing:1px;font-family:Arial,sans-serif;">Skills</h3>
    <hr style="border:none;border-top:1px solid #dadce0;margin:0 0 12px 0;" />
    <ul style="font-size:11pt;color:#3c4043;font-family:Arial,sans-serif;padding-left:20px;margin:0;line-height:1.6;">
      <li>JavaScript, TypeScript, React, Node.js</li>
      <li>Project management and agile methodologies</li>
      <li>Communication and team leadership</li>
    </ul>
    `;
  });

  const {
    editorState,
    querySelectionState,
    toggleFormat,
    toggleAlignment,
    toggleList,
    changeFont,
    changeFontSize,
    insertLink,
    insertImage,
    executeDirect
  } = useEditorCommands();

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [showSpecialCharacters, setShowSpecialCharacters] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState('100%');
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [marginSize, setMarginSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdfmount-doc-margin') || '96px';
    }
    return '96px';
  });
  const [pageBgColor, setPageBgColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdfmount-doc-page-bg') || '#ffffff';
    }
    return '#ffffff';
  });
  const [showRuler, setShowRuler] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdfmount-doc-show-ruler') !== 'false';
    }
    return true;
  });
  const [layoutMode, setLayoutMode] = useState<'print' | 'web'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pdfmount-doc-layout-mode') as 'print' | 'web') || 'print';
    }
    return 'print';
  });
  const [margins, setMargins] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdfmount-doc-margins-obj');
      if (saved) return JSON.parse(saved);
    }
    return { top: 96, bottom: 96, left: 96, right: 96 };
  });
  const [pageSize, setPageSize] = useState<'letter' | 'a4' | 'legal' | 'executive'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pdfmount-doc-page-size') as any) || 'letter';
    }
    return 'letter';
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pdfmount-doc-orientation') as any) || 'portrait';
    }
    return 'portrait';
  });
  const [pageBorder, setPageBorder] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdfmount-doc-page-border');
      if (saved) return JSON.parse(saved);
    }
    return { width: '0px', style: 'none', color: '#dadce0' };
  });
  const [showGridlines, setShowGridlines] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pdfmount-doc-show-gridlines') === 'true';
    }
    return false;
  });
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editorMode, setEditorMode] = useState<'editing' | 'viewing'>('editing');
  const [showSaveExport, setShowSaveExport] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Background auto-save persistence
  useEffect(() => {
    localStorage.setItem('pdfmount-doc-title', docTitle);
  }, [docTitle]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-content', contentHtml);
  }, [contentHtml]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-margin', marginSize);
  }, [marginSize]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-page-bg', pageBgColor);
  }, [pageBgColor]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-show-ruler', String(showRuler));
  }, [showRuler]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-layout-mode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-margins-obj', JSON.stringify(margins));
  }, [margins]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-page-size', pageSize);
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-orientation', orientation);
  }, [orientation]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-page-border', JSON.stringify(pageBorder));
  }, [pageBorder]);

  useEffect(() => {
    localStorage.setItem('pdfmount-doc-show-gridlines', String(showGridlines));
  }, [showGridlines]);

  // Sync initialContent prop changes with editor content state
  useEffect(() => {
    if (initialContent) {
      setContentHtml(initialContent);
    }
  }, [initialContent]);

  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'settings' | 'format' | 'previews' | 'shortcuts'>('format');
  
  // Sync legacy marginSize with new margins state
  useEffect(() => {
    setMarginSize(`${margins.left}px`);
  }, [margins]);
  interface PaintFormatStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    foreColor: string;
    backColor: string;
    fontName: string;
    fontSize: string;
  }
  const [paintStyle, setPaintStyle] = useState<PaintFormatStyle | null>(null);

  const handlePaintClick = () => {
    if (paintStyle) {
      setPaintStyle(null);
    } else {
      if (typeof document === 'undefined') return;
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const strikeThrough = document.queryCommandState('strikeThrough');
      
      let foreColor = '#000000';
      let backColor = 'transparent';
      let fontName = 'Arial';
      let fontSize = '11pt';

      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node: Node | null = range.startContainer;
          if (node && node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
          }
          if (node && node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            if (style.color) foreColor = style.color;
            if (style.backgroundColor) backColor = style.backgroundColor;
            if (style.fontFamily) fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
            if (style.fontSize) fontSize = style.fontSize;
          }
        }
      }

      setPaintStyle({
        bold,
        italic,
        underline,
        strikeThrough,
        foreColor,
        backColor,
        fontName,
        fontSize,
      });
    }
  };

  const handleSelectionChange = () => {
    querySelectionState();

    if (paintStyle) {
      if (typeof document === 'undefined') return;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        // Execute formatting commands to match captured styles
        if (document.queryCommandState('bold') !== paintStyle.bold) {
          document.execCommand('bold', false);
        }
        if (document.queryCommandState('italic') !== paintStyle.italic) {
          document.execCommand('italic', false);
        }
        if (document.queryCommandState('underline') !== paintStyle.underline) {
          document.execCommand('underline', false);
        }
        if (document.queryCommandState('strikeThrough') !== paintStyle.strikeThrough) {
          document.execCommand('strikeThrough', false);
        }
        
        if (paintStyle.foreColor) {
          document.execCommand('foreColor', false, paintStyle.foreColor);
        }
        
        if (paintStyle.backColor && paintStyle.backColor !== 'rgba(0, 0, 0, 0)' && paintStyle.backColor !== 'transparent') {
          document.execCommand('backColor', false, paintStyle.backColor);
        } else {
          document.execCommand('backColor', false, 'transparent');
        }
        
        if (paintStyle.fontName) {
          document.execCommand('fontName', false, paintStyle.fontName);
        }
        
        if (paintStyle.fontSize) {
          let commandSize = '3';
          const sizePx = parseFloat(paintStyle.fontSize);
          if (!isNaN(sizePx)) {
            const pt = sizePx * 0.75;
            if (pt <= 9) commandSize = '1';
            else if (pt <= 11) commandSize = '2';
            else if (pt <= 14) commandSize = '3';
            else if (pt <= 18) commandSize = '4';
            else if (pt <= 24) commandSize = '5';
            else if (pt <= 36) commandSize = '6';
            else commandSize = '7';
          }
          document.execCommand('fontSize', false, commandSize);
        }

        setPaintStyle(null);
        querySelectionState();
      }
    }
  };

  const stats = useMemo(() => {
    if (typeof window === 'undefined') return { words: 0, chars: 0, pages: 1 };
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const text = doc.body.textContent || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const pages = Math.max(1, Math.ceil(words / 500));
    return { words, chars, pages };
  }, [contentHtml]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save / Export Modal
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveExport(true);
      }
      // Ctrl+F / Ctrl+H: Find & Replace
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) {
        e.preventDefault();
        setShowFindReplace(prev => !prev);
      }
      // Ctrl+Shift+C: Word Count
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setShowWordCount(prev => !prev);
      }
      // Ctrl+P: Print / Export PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportToPdf(contentHtml, docTitle);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contentHtml, docTitle]);

  const handleNew = () => {
    if (window.confirm("Start a new document? All current unsaved progress will be lost.")) {
      setContentHtml('<p></p>');
      setDocTitle('Untitled document');
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire document?")) {
      setContentHtml('');
    }
  };

  const toggleVoiceTyping = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech Recognition API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onstart = () => {
        setIsRecording(true);
      };
      rec.onresult = (event: any) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        document.execCommand('insertText', false, resultText);
      };
      rec.onerror = (e: any) => {
        console.error(e);
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = rec;
      rec.start();
    }
  };

  const changeTextCase = (caseType: 'upper' | 'lower' | 'title') => {
    const selection = window.getSelection();
    if (!selection || selection.toString() === '') return;
    const text = selection.toString();
    let newText = '';
    if (caseType === 'upper') {
      newText = text.toUpperCase();
    } else if (caseType === 'lower') {
      newText = text.toLowerCase();
    } else if (caseType === 'title') {
      newText = text.replace(/\b\w/g, c => c.toUpperCase());
    }
    document.execCommand('insertText', false, newText);
  };

  const insertColumnsLayout = (count: number) => {
    const selection = window.getSelection();
    if (!selection || selection.toString() === '') {
      if (editorRef.current) {
        editorRef.current.style.columnCount = count > 1 ? String(count) : 'unset';
        editorRef.current.style.columnGap = count > 1 ? '24px' : 'unset';
        setContentHtml(editorRef.current.innerHTML);
      }
    } else {
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.style.columnCount = String(count);
      div.style.columnGap = '24px';
      div.style.margin = '10px 0';
      range.surroundContents(div);
      if (editorRef.current) {
        setContentHtml(editorRef.current.innerHTML);
      }
    }
  };

  const handleInsertElement = (tag: string, _value?: string) => {
    if (tag === 'link') {
      const url = prompt("Enter URL link:");
      if (url) insertLink(url);
    } else if (tag === 'image') {
      if (typeof document !== 'undefined') {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e: any) => {
          const selFile = e.target.files?.[0];
          if (selFile) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
              if (event.target?.result) {
                insertImage(event.target.result);
              }
            };
            reader.readAsDataURL(selFile);
          }
        };
        fileInput.click();
      }
    } else if (tag === 'hr') {
      executeDirect('insertHorizontalRule');
    } else if (tag === 'pagebreak') {
      executeDirect('insertHTML', '<div class="hard-page-break" style="page-break-after:always;border-bottom:2px dashed rgba(37,99,235,0.3);margin:24px 0;text-align:center;color:#2563eb;font-size:10px;font-family:\'Google Sans\',sans-serif;user-select:none;padding:4px 0;">[ Hard Page Break ]</div>');
    } else if (tag === 'footnote') {
      const text = prompt("Enter footnote content:");
      if (text) {
        const footnoteId = `footnote-${Date.now()}`;
        executeDirect('insertHTML', `<sup><a href="#${footnoteId}" style="text-decoration:none;color:#2563eb;font-weight:bold;">[1]</a></sup>`);
        if (editorRef.current) {
          editorRef.current.innerHTML += `<div id="${footnoteId}" style="font-size:11px;color:#5f6368;border-top:1px solid #e0e0e0;margin-top:16px;padding-top:4px;font-family:Arial,sans-serif;">[1] ${text}</div>`;
          setContentHtml(editorRef.current.innerHTML);
        }
      }
    } else if (tag === 'table') {
      const rowsStr = prompt("Enter number of rows (1-20):", "3");
      const colsStr = prompt("Enter number of columns (1-10):", "3");
      const rows = parseInt(rowsStr || "", 10);
      const cols = parseInt(colsStr || "", 10);
      if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
        let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:8px 0;">';
        for (let r = 0; r < rows; r++) {
          tableHtml += '<tr>';
          for (let c = 0; c < cols; c++) {
            tableHtml += '<td style="border:1px solid #dadce0;padding:8px;min-width:60px;">&nbsp;</td>';
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        executeDirect('insertHTML', tableHtml);
      }
    }
  };

  return (
    <div
      className="document-editor-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#e8ebef',   /* canvas bg used everywhere */
        color: '#202124',
        overflow: 'hidden',
        fontFamily: "'Google Sans', Roboto, sans-serif",
      }}
    >
      {/* ═══ HEADER: white bg ═══ */}
      <div style={{ backgroundColor: '#ffffff', flexShrink: 0 }}>
        <HeaderMenu
          docTitle={docTitle}
          onTitleChange={setDocTitle}
          onNew={handleNew}
          onExport={() => exportToPdf(contentHtml, docTitle)}
          onClear={handleClear}
          onInsertElement={handleInsertElement}
          onClose={onClose}
          onOpenFindReplace={() => setShowFindReplace(true)}
          onOpenWordCount={() => setShowWordCount(true)}
          contentHtml={contentHtml}
          onContentChange={setContentHtml}
          onOpenSpecialCharacters={() => setShowSpecialCharacters(true)}
          onOpenDictionary={() => setShowDictionary(true)}
          onOpenTranslation={() => setShowTranslation(true)}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenPageSetup={() => setShowPageSetup(true)}
          isToolbarCollapsed={isToolbarCollapsed}
          onToggleToolbarCollapse={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
          showRuler={showRuler}
          onToggleRuler={() => setShowRuler(!showRuler)}
          layoutMode={layoutMode}
          onToggleLayoutMode={setLayoutMode}
          isRecording={isRecording}
          onToggleVoiceTyping={toggleVoiceTyping}
          onShowDocDetails={() => setShowDocDetails(true)}
          onInsertColumns={insertColumnsLayout}
          onSetZoom={setZoom}
          onTextCase={changeTextCase}
          showGridlines={showGridlines}
          onToggleGridlines={() => setShowGridlines(!showGridlines)}
          editorMode={editorMode}
          onToggleEditorMode={setEditorMode}
          onOpenSaveExport={() => setShowSaveExport(true)}
        />

        {/* ─── Toolbar: flat, no pill, same white bg ─── */}
        {!isToolbarCollapsed && editorMode === 'editing' && (
          <div style={{
            padding: '2px 8px 4px 8px',
            borderBottom: '1px solid #e0e0e0',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
          }}>
            <Toolbar
              state={editorState}
              onFormat={toggleFormat}
              onAlign={toggleAlignment}
              onList={toggleList}
              onFontChange={changeFont}
              onFontSizeChange={changeFontSize}
              onLink={insertLink}
              onImage={insertImage}
              onClear={() => executeDirect('removeFormat')}
              onPrint={() => exportToPdf(contentHtml, docTitle)}
              onOpenFindReplace={() => setShowFindReplace(true)}
              zoom={zoom}
              onZoomChange={setZoom}
              isPaintActive={!!paintStyle}
              onPaintClick={handlePaintClick}
              onCollapse={() => setIsToolbarCollapsed(true)}
            />
          </div>
        )}
      </div>

      {/* ═══ BODY: sidebar strip + canvas ═══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: '#e8ebef',
      }}>

        {/* ── Left vertical strip — always visible ── */}
        {isSidebarCollapsed ? (
          /* Collapsed: thin strip with + and ⋮ */
          <div style={{
            width: 48,
            flexShrink: 0,
            backgroundColor: '#e8ebef',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 12,
            gap: 6,
            borderRight: 'none',
          }}>
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              title="Show document outline"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#444746',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8eaed'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Plus size={18} />
            </button>
            {/* Blue rounded pill button with ⋮ */}
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              title="Open document tabs"
              style={{
                width: 28,
                height: 36,
                borderRadius: 20,
                border: 'none',
                backgroundColor: '#e8eaed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1f2937',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dadce0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#e8eaed'; }}
            >
              <MoreVertical size={15} />
            </button>
          </div>
        ) : (
          /* Expanded: full sidebar */
          <div style={{
            width: 240,
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}>
            <SidebarOutline
              contentHtml={contentHtml}
              onCollapse={() => setIsSidebarCollapsed(true)}
            />
          </div>
        )}

        {/* ── Canvas workspace ── */}
        <div style={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#e8ebef',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <PageCanvas
            contentHtml={contentHtml}
            onContentChange={setContentHtml}
            onSelectionChange={handleSelectionChange}
            editorRef={editorRef}
            zoom={zoom}
            margins={margins}
            pageBgColor={pageBgColor}
            showRuler={showRuler}
            onMarginsChange={setMargins}
            layoutMode={layoutMode}
            orientation={orientation}
            pageSize={pageSize}
            pageBorder={pageBorder}
            showGridlines={showGridlines}
            editorMode={editorMode}
          />
        </div>

        {/* ── Right Sidebar — Collapsible Format/Settings shortcuts ── */}
        {isRightSidebarCollapsed ? (
          /* Thin strip with settings, format and keyboard shortcut icons */
          <div style={{
            width: 48,
            flexShrink: 0,
            backgroundColor: '#e8ebef',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 12,
            gap: 12,
            borderLeft: '1px solid #dadce0',
          }}>
            <button
              onClick={() => { setShowPageSetup(true); }}
              title="Page settings"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#444746',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dadce0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => { setActiveRightTab('format'); setIsRightSidebarCollapsed(false); }}
              title="Quick formatting & tools"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#444746',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dadce0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Sliders size={18} />
            </button>
            <button
              onClick={() => { setActiveRightTab('previews'); setIsRightSidebarCollapsed(false); }}
              title="Page previews"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#444746',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dadce0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => { setActiveRightTab('shortcuts'); setIsRightSidebarCollapsed(false); }}
              title="Keyboard shortcuts"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#444746',
                outline: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dadce0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Keyboard size={18} />
            </button>
          </div>
        ) : (
          /* Expanded right sidebar panel */
          <div style={{
            width: 240,
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #dadce0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            fontFamily: "'Google Sans', Roboto, sans-serif",
            userSelect: 'none',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px 8px 16px',
              color: '#444746',
              height: '40px',
              boxSizing: 'border-box',
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>
                {activeRightTab === 'format' && 'Quick formatting'}
                {activeRightTab === 'previews' && 'Page previews'}
                {activeRightTab === 'shortcuts' && 'Shortcuts reference'}
              </span>
              <button
                onClick={() => setIsRightSidebarCollapsed(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#444746',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              margin: '2px 12px 6px 12px',
              flexShrink: 0,
            }} />

            {/* Content Area */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>


              {/* --- T2: Quick Formatting & Info --- */}
              {activeRightTab === 'format' && (
                <>
                  {/* Document Stats */}
                  <div style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 3, border: '1px solid #dadce0' }}>
                    <label style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5f6368',
                      display: 'block',
                      marginBottom: 6,
                      letterSpacing: '0.5px',
                      fontFamily: "'Google Sans', Roboto, sans-serif",
                    }}>
                      Document info
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Words</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{stats.words}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Characters</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{stats.chars}</span>
                      </div>
                    </div>
                  </div>

                  {/* Page Setup quick link */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Configure page size, margins, orientation & borders:</span>
                    <button
                      onClick={() => setShowPageSetup(true)}
                      style={{
                        width: '100%',
                        padding: '6px 12px',
                        backgroundColor: '#1f2937',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 3,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#111827'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f2937'}
                    >
                      Page Setup
                    </button>
                  </div>

                  {/* Quick Format Elements */}
                  <div>
                    <label style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5f6368',
                      display: 'block',
                      marginBottom: 8,
                      letterSpacing: '0.5px',
                      fontFamily: "'Google Sans', Roboto, sans-serif",
                    }}>
                      Quick elements
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => handleInsertElement('table')}
                        style={{
                          padding: '8px',
                          fontSize: 10,
                          fontWeight: 500,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Insert Table
                      </button>
                      <button
                        onClick={() => handleInsertElement('image')}
                        style={{
                          padding: '8px',
                          fontSize: 10,
                          fontWeight: 500,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Insert Image
                      </button>
                      <button
                        onClick={() => handleInsertElement('link')}
                        style={{
                          padding: '8px',
                          fontSize: 10,
                          fontWeight: 500,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Insert Link
                      </button>
                      <button
                        onClick={() => handleInsertElement('hr')}
                        style={{
                          padding: '8px',
                          fontSize: 10,
                          fontWeight: 500,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Horizontal Line
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <label style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5f6368',
                      display: 'block',
                      marginBottom: 8,
                      letterSpacing: '0.5px',
                      fontFamily: "'Google Sans', Roboto, sans-serif",
                    }}>
                      Actions
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => executeDirect('removeFormat')}
                        style={{
                          padding: '8px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          color: '#374151',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Clear Formatting
                      </button>
                      <button
                        onClick={() => { setShowFindReplace(true); }}
                        style={{
                          padding: '8px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: 3,
                          color: '#374151',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Find & Replace
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* --- T3: Page Previews --- */}
              {activeRightTab === 'previews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#5f6368',
                    display: 'block',
                    marginBottom: 4,
                    letterSpacing: '0.5px',
                    fontFamily: "'Google Sans', Roboto, sans-serif",
                  }}>
                    Document pages
                  </label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    alignItems: 'center',
                    maxHeight: 'calc(100vh - 150px)',
                    overflowY: 'auto',
                    padding: '8px 0',
                  }}>
                    {Array.from({ length: stats.pages }).map((_, idx) => {
                      const baseSize = paperSizes[pageSize] || paperSizes.letter;
                      const pWidth = orientation === 'portrait' ? baseSize.width : baseSize.height;
                      const pHeight = orientation === 'portrait' ? baseSize.height : baseSize.width;
                      const scale = 0.15;
                      const thumbWidth = pWidth * scale;
                      const thumbHeight = pHeight * scale;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const canvas = document.querySelector('.document-canvas-wrapper');
                            if (canvas) {
                              const zoomFactor = parseFloat(zoom) / 100;
                              canvas.scrollTo({
                                top: idx * pHeight * zoomFactor,
                                behavior: 'smooth'
                              });
                            }
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{
                            width: thumbWidth,
                            height: thumbHeight,
                            border: '1px solid #dadce0',
                            backgroundColor: pageBgColor,
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#1f2937';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#dadce0';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                          }}
                          >
                            <div style={{
                              transform: `scale(${scale})`,
                              transformOrigin: 'top left',
                              width: `${pWidth}px`,
                              height: `${pHeight * stats.pages}px`,
                              padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                              boxSizing: 'border-box',
                              marginTop: `-${idx * pHeight}px`,
                              pointerEvents: 'none',
                              userSelect: 'none',
                              color: '#202124',
                              fontFamily: 'Arial, sans-serif',
                              fontSize: '12pt',
                              lineHeight: '1.15',
                              textAlign: 'left',
                            }} dangerouslySetInnerHTML={{ __html: contentHtml }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#5f6368', fontWeight: 500 }}>Page {idx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- T4: Keyboard Shortcuts --- */}
              {activeRightTab === 'shortcuts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#5f6368',
                    display: 'block',
                    marginBottom: 8,
                    letterSpacing: '0.5px',
                    fontFamily: "'Google Sans', Roboto, sans-serif",
                  }}>
                    Quick reference
                  </label>
                  {[
                    { keys: 'Ctrl + Z', action: 'Undo action' },
                    { keys: 'Ctrl + Y', action: 'Redo action' },
                    { keys: 'Ctrl + S', action: 'Save document as HTML' },
                    { keys: 'Ctrl + P', action: 'Export to PDF file' },
                    { keys: 'Ctrl + H', action: 'Find and Replace text' },
                    { keys: 'Ctrl + Shift + C', action: 'Word count stats' },
                  ].map(sh => (
                    <div key={sh.keys} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid #f1f3f4' }}>
                      <span style={{ fontSize: 10, color: '#4b5563' }}>{sh.action}</span>
                      <kbd style={{
                        fontSize: 9,
                        fontFamily: 'monospace',
                        backgroundColor: '#f1f3f4',
                        padding: '2px 6px',
                        borderRadius: 3,
                        border: '1px solid #d1d5db',
                        color: '#1f2937',
                      }}>
                        {sh.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ STATUS BAR ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        fontSize: '13px',
        color: '#5f6368',
        height: '24px',
        flexShrink: 0,
        fontFamily: "'Google Sans', Roboto, sans-serif",
      }}>
        {/* CSS for Mic Dictation pulsing animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes micPulse {
            0% { opacity: 0.4; transform: scale(0.95); }
            50% { opacity: 1.0; transform: scale(1.05); }
            100% { opacity: 0.4; transform: scale(0.95); }
          }
          .pulse-mic-icon {
            animation: micPulse 1.5s infinite ease-in-out;
          }
        `}} />
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Page {stats.pages} of {stats.pages}</span>
          <span>{stats.words} words</span>
          <span>{stats.chars} characters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isRecording && (
            <span style={{ fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span className="pulse-mic-icon" style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                display: 'inline-block',
              }} />
              🎙 Dictating...
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }} title="Changes saved to local storage">
            <span style={{ fontSize: '12px' }}>✓</span> Saved locally
          </span>
          <span>English (US)</span>
        </div>
      </div>

      {/* Modals */}
      {showFindReplace && (
        <FindReplaceModal
          onClose={() => setShowFindReplace(false)}
          editorRef={editorRef}
        />
      )}
      {showWordCount && (
        <WordCountModal
          contentHtml={contentHtml}
          onClose={() => setShowWordCount(false)}
        />
      )}
      {showSpecialCharacters && (
        <SpecialCharactersModal
          onClose={() => setShowSpecialCharacters(false)}
          editorRef={editorRef}
        />
      )}
      {showDictionary && (
        <DictionaryModal
          onClose={() => setShowDictionary(false)}
        />
      )}
      {showTranslation && (
        <TranslationModal
          onClose={() => setShowTranslation(false)}
          contentHtml={contentHtml}
          onContentChange={setContentHtml}
        />
      )}
      {showDocDetails && (
        <DocDetailsModal
          onClose={() => setShowDocDetails(false)}
          stats={stats}
          margins={margins}
          pageBgColor={pageBgColor}
          layoutMode={layoutMode}
        />
      )}
      {showPageSetup && (
        <PageSetupModal
          onClose={() => setShowPageSetup(false)}
          margins={margins}
          onApplyMargins={setMargins}
          pageSize={pageSize}
          onApplyPageSize={setPageSize}
          orientation={orientation}
          onApplyOrientation={setOrientation}
          pageBgColor={pageBgColor}
          onApplyPageBgColor={setPageBgColor}
          pageBorder={pageBorder}
          onApplyPageBorder={setPageBorder}
          showGridlines={showGridlines}
          onApplyShowGridlines={setShowGridlines}
        />
      )}
      {showSaveExport && (
        <SaveExportModal
          onClose={() => setShowSaveExport(false)}
          docTitle={docTitle}
          onTitleChange={setDocTitle}
          contentHtml={contentHtml}
          onExportPdf={() => exportToPdf(contentHtml, docTitle)}
        />
      )}
    </div>
  );
}

interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface PageBorder {
  width: string;
  style: string;
  color: string;
}

const paperSizes = {
  letter: { width: 816, height: 1056 },
  a4: { width: 794, height: 1123 },
  legal: { width: 816, height: 1344 },
  executive: { width: 696, height: 1008 },
};

interface DocDetailsModalProps {
  onClose: () => void;
  stats: { pages: number; words: number; chars: number };
  margins: Margins;
  pageBgColor: string;
  layoutMode: string;
}

function DocDetailsModal({ onClose, stats, margins, pageBgColor, layoutMode }: DocDetailsModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        width: '380px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#202124',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Document Details & Properties</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Total pages:</span>
            <span style={{ fontWeight: 600 }}>{stats.pages}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Word count:</span>
            <span style={{ fontWeight: 600 }}>{stats.words}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Character count:</span>
            <span style={{ fontWeight: 600 }}>{stats.chars}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Margin dimensions:</span>
            <span style={{ fontWeight: 600 }}>T:{margins.top}px, B:{margins.bottom}px, L:{margins.left}px, R:{margins.right}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Page background color:</span>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: pageBgColor, border: '1px solid #dadce0', display: 'inline-block' }} />
              {pageBgColor}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Layout Mode:</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{layoutMode} Layout</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Storage:</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>Local Sandbox (Offline-Ready)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#5f6368' }}>Last saved:</span>
            <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#1f2937',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
            alignSelf: 'flex-end',
          }}
        >
          Close Properties
        </button>
      </div>
    </div>
  );
}

interface PageSetupModalProps {
  onClose: () => void;
  margins: Margins;
  onApplyMargins: (margins: Margins) => void;
  pageSize: 'letter' | 'a4' | 'legal' | 'executive';
  onApplyPageSize: (size: 'letter' | 'a4' | 'legal' | 'executive') => void;
  orientation: 'portrait' | 'landscape';
  onApplyOrientation: (orientation: 'portrait' | 'landscape') => void;
  pageBgColor: string;
  onApplyPageBgColor: (color: string) => void;
  pageBorder: PageBorder;
  onApplyPageBorder: (border: PageBorder) => void;
  showGridlines: boolean;
  onApplyShowGridlines: (show: boolean) => void;
}

function PageSetupModal({
  onClose,
  margins: initialMargins,
  onApplyMargins,
  pageSize: initialPageSize,
  onApplyPageSize,
  orientation: initialOrientation,
  onApplyOrientation,
  pageBgColor: initialPageBgColor,
  onApplyPageBgColor,
  pageBorder: initialPageBorder,
  onApplyPageBorder,
  showGridlines: initialShowGridlines,
  onApplyShowGridlines,
}: PageSetupModalProps) {
  const [localMargins, setLocalMargins] = useState(initialMargins);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);
  const [localOrientation, setLocalOrientation] = useState(initialOrientation);
  const [localPageBgColor, setLocalPageBgColor] = useState(initialPageBgColor);
  const [localPageBorder, setLocalPageBorder] = useState(initialPageBorder);
  const [localShowGridlines, setLocalShowGridlines] = useState(initialShowGridlines);

  const handleOK = () => {
    onApplyMargins(localMargins);
    onApplyPageSize(localPageSize);
    onApplyOrientation(localOrientation);
    onApplyPageBgColor(localPageBgColor);
    onApplyPageBorder(localPageBorder);
    onApplyShowGridlines(localShowGridlines);
    onClose();
  };

  const baseSize = paperSizes[localPageSize] || paperSizes.letter;
  const w = localOrientation === 'portrait' ? baseSize.width : baseSize.height;
  const h = localOrientation === 'portrait' ? baseSize.height : baseSize.width;
  
  // Fit inside the preview panel nicely
  const scale = Math.min(160 / w, 200 / h);
  const previewWidth = w * scale;
  const previewHeight = h * scale;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        width: '580px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#202124',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Page Setup</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Columns */}
        <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
          {/* Left: configuration inputs */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
            
            {/* Paper Size */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paper Size</label>
              <select 
                value={localPageSize}
                onChange={(e) => setLocalPageSize(e.target.value as any)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', color: '#202124', outline: 'none' }}
              >
                <option value="letter">Letter (8.5" x 11")</option>
                <option value="a4">A4 (210mm x 297mm)</option>
                <option value="legal">Legal (8.5" x 14")</option>
                <option value="executive">Executive (7.25" x 10.5")</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orientation</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setLocalOrientation('portrait')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: localOrientation === 'portrait' ? '2px solid #1f2937' : '1px solid #dadce0',
                    backgroundColor: localOrientation === 'portrait' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: localOrientation === 'portrait' ? 600 : 500,
                    color: '#202124',
                    outline: 'none',
                  }}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setLocalOrientation('landscape')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: localOrientation === 'landscape' ? '2px solid #1f2937' : '1px solid #dadce0',
                    backgroundColor: localOrientation === 'landscape' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: localOrientation === 'landscape' ? 600 : 500,
                    color: '#202124',
                    outline: 'none',
                  }}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Margins */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margins (pixels, 24px - 300px)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#5f6368', display: 'block', marginBottom: '2px' }}>Top</span>
                  <input
                    type="number"
                    min={24}
                    max={300}
                    value={localMargins.top}
                    onChange={(e) => setLocalMargins({ ...localMargins, top: parseInt(e.target.value, 10) || 0 })}
                    onBlur={() => setLocalMargins({ ...localMargins, top: Math.max(24, Math.min(300, localMargins.top)) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5f6368', display: 'block', marginBottom: '2px' }}>Bottom</span>
                  <input
                    type="number"
                    min={24}
                    max={300}
                    value={localMargins.bottom}
                    onChange={(e) => setLocalMargins({ ...localMargins, bottom: parseInt(e.target.value, 10) || 0 })}
                    onBlur={() => setLocalMargins({ ...localMargins, bottom: Math.max(24, Math.min(300, localMargins.bottom)) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5f6368', display: 'block', marginBottom: '2px' }}>Left</span>
                  <input
                    type="number"
                    min={24}
                    max={300}
                    value={localMargins.left}
                    onChange={(e) => setLocalMargins({ ...localMargins, left: parseInt(e.target.value, 10) || 0 })}
                    onBlur={() => setLocalMargins({ ...localMargins, left: Math.max(24, Math.min(300, localMargins.left)) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5f6368', display: 'block', marginBottom: '2px' }}>Right</span>
                  <input
                    type="number"
                    min={24}
                    max={300}
                    value={localMargins.right}
                    onChange={(e) => setLocalMargins({ ...localMargins, right: parseInt(e.target.value, 10) || 0 })}
                    onBlur={() => setLocalMargins({ ...localMargins, right: Math.max(24, Math.min(300, localMargins.right)) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page Background Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { name: 'White', value: '#ffffff' },
                  { name: 'Ivory', value: '#fdfbf7' },
                  { name: 'Cool Gray', value: '#f4f5f7' },
                  { name: 'Soft Cream', value: '#faf6f0' },
                  { name: 'Pastel Blue', value: '#f0f4f8' },
                  { name: 'Muted Green', value: '#f0f4f1' },
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => setLocalPageBgColor(color.value)}
                    title={color.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color.value,
                      border: localPageBgColor === color.value ? '2px solid #1f2937' : '1px solid #dadce0',
                      cursor: 'pointer',
                      boxShadow: localPageBgColor === color.value ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none',
                      outline: 'none',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={localPageBgColor.startsWith('#') && localPageBgColor.length === 7 ? localPageBgColor : '#ffffff'}
                  onChange={(e) => setLocalPageBgColor(e.target.value)}
                  style={{
                    width: '28px',
                    height: '24px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: 'transparent',
                    outline: 'none',
                  }}
                  title="Custom color"
                />
              </div>
            </div>

            {/* Page Borders */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page Border</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={localPageBorder.style}
                  onChange={(e) => setLocalPageBorder({ ...localPageBorder, style: e.target.value })}
                  style={{ flex: 1.2, padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', outline: 'none' }}
                >
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
                <select
                  value={localPageBorder.width}
                  onChange={(e) => setLocalPageBorder({ ...localPageBorder, width: e.target.value })}
                  style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', outline: 'none' }}
                >
                  <option value="0px">0px</option>
                  <option value="1px">1px</option>
                  <option value="2px">2px</option>
                  <option value="3px">3px</option>
                  <option value="4px">4px</option>
                </select>
                <input
                  type="color"
                  value={localPageBorder.color}
                  onChange={(e) => setLocalPageBorder({ ...localPageBorder, color: e.target.value })}
                  style={{
                    width: '32px',
                    height: '31px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: 'transparent',
                    outline: 'none',
                  }}
                  title="Border color"
                />
              </div>
            </div>

            {/* Gridlines */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="modal-gridlines-chk"
                checked={localShowGridlines}
                onChange={(e) => setLocalShowGridlines(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="modal-gridlines-chk" style={{ fontSize: '13px', color: '#202124', cursor: 'pointer', userSelect: 'none' }}>
                Show document layout gridlines
              </label>
            </div>

          </div>

          {/* Right: live visual grid preview */}
          <div style={{
            flex: 0.8,
            borderLeft: '1px solid #e0e0e0',
            paddingLeft: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            minHeight: '260px',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              top: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#5f6368',
              textTransform: 'uppercase',
            }}>
              Live Preview
            </span>

            {/* Preview Sheet Container */}
            <div style={{
              width: previewWidth,
              height: previewHeight,
              backgroundColor: localPageBgColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: localPageBorder.style === 'none' || localPageBorder.width === '0px'
                ? '1px solid #dadce0'
                : `${localPageBorder.width} ${localPageBorder.style} ${localPageBorder.color}`,
              boxSizing: 'border-box',
              position: 'relative',
              backgroundImage: localShowGridlines
                ? 'linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)'
                : 'none',
              backgroundSize: localShowGridlines ? `${20 * scale}px ${20 * scale}px` : 'none',
              transition: 'all 0.15s ease',
            }}>
              {/* Margin boundary indicators */}
              <div style={{
                position: 'absolute',
                top: localMargins.top * scale,
                bottom: localMargins.bottom * scale,
                left: localMargins.left * scale,
                right: localMargins.right * scale,
                border: '1px dashed rgba(59, 130, 246, 0.4)',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }} />
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: '#5f6368', textAlign: 'center', lineHeight: '1.4' }}>
              <strong style={{ textTransform: 'capitalize' }}>{localOrientation}</strong> · <span style={{ textTransform: 'uppercase' }}>{localPageSize}</span><br />
              Margins: T:{localMargins.top}px B:{localMargins.bottom}px<br />
              L:{localMargins.left}px R:{localMargins.right}px
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#444746',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleOK}
            style={{
              backgroundColor: '#1f2937',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

interface SaveExportModalProps {
  onClose: () => void;
  docTitle: string;
  onTitleChange: (title: string) => void;
  contentHtml: string;
  onExportPdf: () => void;
}

function SaveExportModal({
  onClose,
  docTitle,
  onTitleChange,
  contentHtml,
  onExportPdf,
}: SaveExportModalProps) {
  const [localTitle, setLocalTitle] = useState(docTitle);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html' | 'txt' | 'md'>('pdf');

  const handleSave = () => {
    onTitleChange(localTitle);
    
    // Perform download based on exportFormat
    if (exportFormat === 'pdf') {
      onExportPdf();
    } else if (exportFormat === 'html') {
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${localTitle}</title></head><body>${contentHtml}</body></html>`], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${localTitle || 'document'}.html`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else if (exportFormat === 'txt') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentHtml, 'text/html');
      const text = doc.body.textContent || '';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${localTitle || 'document'}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else if (exportFormat === 'md') {
      // Basic HTML to Markdown converter
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentHtml, 'text/html');
      let markdown = '';
      
      doc.body.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          if (tagName === 'h1') {
            markdown += `# ${el.textContent}\n\n`;
          } else if (tagName === 'h2') {
            markdown += `## ${el.textContent}\n\n`;
          } else if (tagName === 'h3') {
            markdown += `### ${el.textContent}\n\n`;
          } else if (tagName === 'p') {
            markdown += `${el.textContent}\n\n`;
          } else if (tagName === 'ul') {
            el.querySelectorAll('li').forEach(li => {
              markdown += `- ${li.textContent}\n`;
            });
            markdown += '\n';
          } else if (tagName === 'ol') {
            el.querySelectorAll('li').forEach((li, i) => {
              markdown += `${i + 1}. ${li.textContent}\n`;
            });
            markdown += '\n';
          } else if (tagName === 'hr') {
            markdown += `---\n\n`;
          } else {
            markdown += `${el.textContent}\n\n`;
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          markdown += `${node.textContent}\n\n`;
        }
      });
      
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${localTitle || 'document'}.md`;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    localStorage.setItem('pdfmount-doc-content', contentHtml);
    localStorage.setItem('pdfmount-doc-title', localTitle);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        width: '450px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#202124',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Save / Export Document</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>File Name</label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
              placeholder="Enter document title..."
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Choose Format</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'pdf', name: 'PDF Document (.pdf)', desc: 'High-fidelity print format.' },
                { id: 'html', name: 'Web Page / Word Source (.html)', desc: 'Full editable webpage markup.' },
                { id: 'txt', name: 'Plain Text (.txt)', desc: 'Simple text document without styles.' },
                { id: 'md', name: 'Markdown Document (.md)', desc: 'Standard markdown formatting.' },
              ].map(format => (
                <label
                  key={format.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '4px',
                    border: exportFormat === format.id ? '2px solid #1f2937' : '1px solid #dadce0',
                    backgroundColor: exportFormat === format.id ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="export-format"
                    checked={exportFormat === format.id}
                    onChange={() => setExportFormat(format.id as any)}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{format.name}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{format.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            <span>✓</span> Auto-saved locally
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                color: '#444746',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              Save & Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
