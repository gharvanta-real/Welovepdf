import { useState, useCallback } from 'react';
import { EditorState, TextFormat, TextAlignment, ListType } from './types';

const DEFAULT_STATE: EditorState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikeThrough: false,
  alignment: 'left',
  fontName: 'Arial',
  fontSize: '11pt',
  isLinkActive: false,
  foreColor: '#000000',
  backColor: 'transparent',
};

export function useEditorCommands() {
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_STATE);

  const querySelectionState = useCallback(() => {
    if (typeof document === 'undefined') return;

    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');
    const isStrikeThrough = document.queryCommandState('strikeThrough');
    
    let alignment: TextAlignment = 'left';
    if (document.queryCommandState('justifyCenter')) alignment = 'center';
    else if (document.queryCommandState('justifyRight')) alignment = 'right';
    else if (document.queryCommandState('justifyFull')) alignment = 'justify';

    let fontName = 'Arial';
    let fontSize = '11pt';
    let foreColor = '#000000';
    let backColor = 'transparent';
    
    // Check selection computed style
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
          if (style.fontFamily) {
            fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          }
          if (style.fontSize) {
            fontSize = style.fontSize;
          }
          if (style.color) {
            foreColor = style.color;
          }
          if (style.backgroundColor) {
            backColor = style.backgroundColor;
          }
        }
      }
    }

    // Check if parent node of selection is an anchor tag
    let isLinkActive = false;
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node: Node | null = range.startContainer;
        while (node && node.nodeName !== 'BODY') {
          if (node.nodeName === 'A') {
            isLinkActive = true;
            break;
          }
          node = node.parentNode;
        }
      }
    }

    setEditorState({
      isBold,
      isItalic,
      isUnderline,
      isStrikeThrough,
      alignment,
      fontName,
      fontSize,
      isLinkActive,
      foreColor,
      backColor,
    });
  }, []);

  const execute = useCallback((command: string, value: string = '') => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
    querySelectionState();
  }, [querySelectionState]);

  const toggleFormat = useCallback((format: TextFormat) => {
    execute(format);
  }, [execute]);

  const toggleAlignment = useCallback((alignment: TextAlignment) => {
    if (alignment === 'left') execute('justifyLeft');
    else if (alignment === 'center') execute('justifyCenter');
    else if (alignment === 'right') execute('justifyRight');
    else if (alignment === 'justify') execute('justifyFull');
  }, [execute]);

  const toggleList = useCallback((listType: ListType) => {
    if (listType === 'ordered') execute('insertOrderedList');
    else if (listType === 'unordered') execute('insertUnorderedList');
  }, [execute]);

  const changeFont = useCallback((fontName: string) => {
    if (typeof document === 'undefined') return;
    
    // Set styleWithCSS to true
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontName', false, 'DUMMY_FONT');
    
    const editor = document.querySelector('.gdoc-editor-content');
    if (editor) {
      const elements = editor.querySelectorAll('span, font');
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.fontFamily === 'DUMMY_FONT' || htmlEl.getAttribute('face') === 'DUMMY_FONT') {
          htmlEl.style.fontFamily = fontName;
          htmlEl.removeAttribute('face');
        }
      });
    }
    querySelectionState();
  }, [querySelectionState]);

  const changeFontSize = useCallback((size: string) => {
    if (typeof document === 'undefined') return;
    
    // Set styleWithCSS to true
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontSize', false, '7');
    
    const editor = document.querySelector('.gdoc-editor-content');
    if (editor) {
      const elements = editor.querySelectorAll('span, font');
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.fontSize === 'xxx-large' || htmlEl.getAttribute('size') === '7') {
          const hasUnit = size.endsWith('pt') || size.endsWith('px') || size.endsWith('em');
          htmlEl.style.fontSize = hasUnit ? size : `${size}pt`;
          htmlEl.removeAttribute('size');
        }
      });
    }
    querySelectionState();
  }, [querySelectionState]);

  const insertLink = useCallback((url: string) => {
    if (!url) {
      execute('unlink');
    } else {
      execute('createLink', url);
    }
  }, [execute]);

  const insertImage = useCallback((url: string) => {
    if (url) {
      execute('insertImage', url);
    }
  }, [execute]);

  return {
    editorState,
    querySelectionState,
    toggleFormat,
    toggleAlignment,
    toggleList,
    changeFont,
    changeFontSize,
    insertLink,
    insertImage,
    executeDirect: execute,
  };
}
