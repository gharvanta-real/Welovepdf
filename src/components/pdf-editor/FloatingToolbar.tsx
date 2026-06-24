import React, { useState, useRef, useEffect } from "react";
import {
  MousePointer, Type, PenTool, Highlighter, Square, 
  CheckCircle, MessageSquare, Crop, Droplets, MoreHorizontal,
  Image, Link, Layers, Hash, RotateCcw, RotateCw, 
  FileUp, FileSpreadsheet, Move, Copy, Trash2,
  Minimize2, Maximize2, ZoomIn, EyeOff, GitCompare
} from "lucide-react";
import { ActiveTool } from "./types";

function getHotkeyLabel(toolId: string): string {
  switch (toolId) {
    case "select": return "V";
    case "text": return "T";
    case "pen": return "P";
    case "highlight": return "H";
    case "shape": return "S";
    case "signature": return "G";
    case "comment": return "C";
    case "crop": return "O";
    case "watermark": return "W";
    default: return "";
  }
}

interface FloatingToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onSelectMoreAction: (actionKey: string) => void;
  showCommentModal: () => void;
  showWatermarkModal: () => void;
  showSignatureModal: () => void;
  showLinkModal: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  selectedTool?: string;
}

export function FloatingToolbar({
  activeTool,
  setActiveTool,
  onSelectMoreAction,
  showCommentModal,
  showWatermarkModal,
  showSignatureModal,
  showLinkModal,
  onDragStart,
  selectedTool
}: FloatingToolbarProps) {
  const [showPopover, setShowPopover] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        toolbarRef.current && 
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allCoreTools = [
    { id: "select" as ActiveTool, label: "Select", icon: <MousePointer size={15} /> },
    { id: "text" as ActiveTool, label: "Text", icon: <Type size={15} /> },
    { id: "pen" as ActiveTool, label: "Pen", icon: <PenTool size={15} /> },
    { id: "highlight" as ActiveTool, label: "Highlighter", icon: <Highlighter size={15} /> },
    { id: "shape" as ActiveTool, label: "Shapes", icon: <Square size={15} /> },
    { id: "signature" as ActiveTool, label: "Signature", icon: <CheckCircle size={15} />, action: showSignatureModal },
    { id: "comment" as ActiveTool, label: "Comment", icon: <MessageSquare size={15} /> },
    { id: "crop" as ActiveTool, label: "Crop", icon: <Crop size={15} /> },
    { id: "watermark" as ActiveTool, label: "Watermark", icon: <Droplets size={15} />, action: showWatermarkModal },
  ];

  const coreTools = selectedTool === "PDF Annotator"
    ? allCoreTools.filter(t => (t.id as string) !== "crop" && (t.id as string) !== "watermark")
    : allCoreTools;

  const rawPopoverMenu = [
    {
      category: "INSERT",
      items: [
        { label: "Image", icon: <Image size={13} />, key: "insert_image" },
        { label: "Link", icon: <Link size={13} />, key: "insert_link", action: showLinkModal },
        { label: "Header & Footer", icon: <Layers size={13} />, key: "insert_header_footer" },
        { label: "Page Number", icon: <Hash size={13} />, key: "insert_page_number" }
      ]
    },
    {
      category: "EDIT",
      items: [
        { label: "Rotate Left", icon: <RotateCcw size={13} />, key: "edit_rotate_left" },
        { label: "Rotate Right", icon: <RotateCw size={13} />, key: "edit_rotate_right" },
        { label: "Extract Page", icon: <FileUp size={13} />, key: "edit_extract_page" },
        { label: "Replace Page", icon: <FileSpreadsheet size={13} />, key: "edit_replace_page" }
      ]
    },
    {
      category: "ORGANIZE",
      items: [
        { label: "Move Page", icon: <Move size={13} />, key: "organize_move" },
        { label: "Duplicate Page", icon: <Copy size={13} />, key: "organize_duplicate" },
        { label: "Delete Page", icon: <Trash2 size={13} />, key: "organize_delete" }
      ]
    },
    {
      category: "VIEW",
      items: [
        { label: "Fit to Width", icon: <Minimize2 size={13} />, key: "view_fit_width" },
        { label: "Fit to Page", icon: <Maximize2 size={13} />, key: "view_fit_page" },
        { label: "Actual Size", icon: <ZoomIn size={13} />, key: "view_actual_size" }
      ]
    },
    {
      category: "OTHER",
      items: [
        { label: "Redact", icon: <EyeOff size={13} />, key: "other_redact" },
        { label: "Compare Documents", icon: <GitCompare size={13} />, key: "other_compare" }
      ]
    }
  ];

  const popoverMenu = selectedTool === "PDF Annotator"
    ? rawPopoverMenu.filter(g => g.category !== "EDIT" && g.category !== "ORGANIZE")
    : rawPopoverMenu;

  const handleToolClick = (tool: typeof coreTools[0]) => {
    if (tool.action) {
      tool.action();
    } else {
      setActiveTool(tool.id);
    }
    setShowPopover(false);
  };

  const handlePopoverItemClick = (item: { key: string; action?: () => void }) => {
    if (item.action) {
      item.action();
    } else {
      onSelectMoreAction(item.key);
    }
    setShowPopover(false);
  };

  return (
    <div style={{ position: "relative" }} ref={toolbarRef}>
      {/* Floating capsule toolbar */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "8px 8px 10px 8px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)",
        alignItems: "center",
        width: "48px",
        boxSizing: "border-box"
      }}>
        {/* Grip Handle */}
        {onDragStart && (
          <div 
            onMouseDown={onDragStart}
            style={{
              cursor: "grab",
              padding: "4px 0",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              color: "#94a3b8"
            }}
            title="Drag to reposition toolbar"
          >
            {/* Grip dots */}
            <div style={{ display: "flex", gap: "2px" }}>
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
            </div>
            <div style={{ display: "flex", gap: "2px" }}>
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor" }} />
            </div>
          </div>
        )}

        {/* Divider after Grip */}
        {onDragStart && (
          <div style={{
            width: "22px",
            height: "1px",
            backgroundColor: "#f1f5f9",
            marginBottom: "2px"
          }} />
        )}
        {coreTools.map((tool) => {
          const isActive = activeTool === tool.id;
          const isSelectTool = tool.id === "select";

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="editor-tooltip editor-tooltip-right"
              data-tooltip={`${tool.label} (${getHotkeyLabel(tool.id)})`}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "none",
                background: isActive 
                  ? (isSelectTool ? "#eff6ff" : "#f1f5f9") 
                  : "transparent",
                color: isActive 
                  ? (isSelectTool ? "#2563eb" : "#1e293b") 
                  : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                padding: 0,
                outline: "none"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.color = "#1e293b";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              {tool.icon}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{
          width: "22px",
          height: "1px",
          backgroundColor: "#f1f5f9",
          margin: "4px 0"
        }} />

        {/* More Actions Button */}
        <button
          onClick={() => setShowPopover(!showPopover)}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            background: showPopover ? "#f1f5f9" : "transparent",
            color: showPopover ? "#1e293b" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            padding: 0,
            outline: "none"
          }}
          onMouseEnter={(e) => {
            if (!showPopover) {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.color = "#1e293b";
            }
          }}
          onMouseLeave={(e) => {
            if (!showPopover) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#64748b";
            }
          }}
          className="editor-tooltip editor-tooltip-right"
          data-tooltip="More tools (...)"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Popover More actions menu */}
      {showPopover && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            left: "58px",
            top: "100px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)",
            padding: "8px",
            width: "180px",
            maxHeight: "440px",
            overflowY: "auto",
            zIndex: 100,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}
        >
          {popoverMenu.map((group, gIdx) => (
            <div key={group.category} style={{ marginBottom: gIdx < popoverMenu.length - 1 ? "10px" : "0" }}>
              {/* Category label */}
              <div style={{
                fontSize: "0.58rem",
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: "0.05em",
                padding: "4px 8px 2px",
                textTransform: "uppercase"
              }}>
                {group.category}
              </div>
              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handlePopoverItemClick(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "5px 8px",
                      border: "none",
                      background: "transparent",
                      color: "#475569",
                      fontSize: "0.72rem",
                      fontWeight: "500",
                      textAlign: "left",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.1s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.color = "#1e293b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    <span style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
