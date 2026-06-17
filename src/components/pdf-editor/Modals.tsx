import React, { useState, useRef } from "react";
import { ModalOverlay, PropLabel, quietBtn, primaryBtn, modalInput } from "./shared-components";

// ── Signature Modal ────────────────────────────────────────────────────────
interface SignatureModalProps {
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
  toolColor: string;
}

export function SignatureModal({ onClose, onSaveSignature, toolColor }: SignatureModalProps) {
  const [sigMode, setSigMode] = useState<"draw" | "type">("draw");
  const [typedSig, setTypedSig] = useState("");
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawingSig(false);
  }

  function clearSig() {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleSave() {
    let dataUrl = "";
    if (sigMode === "draw") {
      const canvas = sigCanvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL();
    } else {
      // Render typed signature to canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = 392;
      offscreen.height = 100;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        ctx.font = `italic 48px 'Brush Script MT', cursive`;
        ctx.fillStyle = "#0f172a";
        ctx.fillText(typedSig || "Signature", 20, 70);
      }
      dataUrl = offscreen.toDataURL();
    }
    onSaveSignature(dataUrl);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: "480px", width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "4px" }}>
          Electronic Signature
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Draw or type your signature to insert it into the document.
        </p>

        <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
          {(["draw", "type"] as const).map(m => (
            <button
              key={m}
              onClick={() => setSigMode(m)}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: `1px solid ${sigMode === m ? toolColor : "var(--border)"}`,
                background: sigMode === m ? `${toolColor}15` : "var(--c-bg)",
                color: sigMode === m ? toolColor : "var(--c-text)",
                fontWeight: sigMode === m ? "700" : "500",
                fontSize: "0.8rem",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {sigMode === "draw" ? (
          <canvas
            ref={sigCanvasRef}
            width={432}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "8px",
              backgroundColor: "var(--c-bg)",
              display: "block",
              cursor: "crosshair",
              width: "100%"
            }}
          />
        ) : (
          <input
            type="text"
            value={typedSig}
            onChange={e => setTypedSig(e.target.value)}
            placeholder="Type your signature..."
            style={{
              width: "100%",
              padding: "16px",
              border: "2px dashed var(--border)",
              borderRadius: "16px",
              backgroundColor: "var(--c-bg)",
              font: "italic 36px 'Brush Script MT', cursive",
              color: "var(--c-text)",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          {sigMode === "draw" && (
            <button onClick={clearSig} style={quietBtn}>
              Clear
            </button>
          )}
          <button onClick={onClose} style={quietBtn}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}>
            Insert Signature
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Comment Modal ──────────────────────────────────────────────────────────
interface CommentModalProps {
  onClose: () => void;
  onAddComment: (commentText: string) => void;
  toolColor: string;
}

export function CommentModal({ onClose, onAddComment, toolColor }: CommentModalProps) {
  const [commentDraft, setCommentDraft] = useState("");

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: "360px", width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>
          Add Comment
        </h3>
        <textarea
          value={commentDraft}
          onChange={e => setCommentDraft(e.target.value)}
          placeholder="Write your comment..."
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            fontSize: "0.85rem",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            color: "var(--c-text)",
            backgroundColor: "var(--c-bg)"
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
          <button onClick={onClose} style={quietBtn}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (commentDraft.trim()) {
                onAddComment(commentDraft);
              }
            }}
            style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}
          >
            Add Comment
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Link Modal ──────────────────────────────────────────────────────────────
interface LinkModalProps {
  onClose: () => void;
  onInsertLink: (linkText: string, linkUrl: string) => void;
  toolColor: string;
}

export function LinkModal({ onClose, onInsertLink, toolColor }: LinkModalProps) {
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: "360px", width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>
          Insert Hyperlink
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            value={linkText}
            onChange={e => setLinkText(e.target.value)}
            placeholder="Display text (optional)"
            style={modalInput}
          />
          <input
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            style={modalInput}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
          <button onClick={onClose} style={quietBtn}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (linkUrl.trim()) {
                onInsertLink(linkText, linkUrl);
              }
            }}
            style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}
          >
            Insert Link
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── Watermark Modal ─────────────────────────────────────────────────────────
interface WatermarkModalProps {
  onClose: () => void;
  onApplyWatermark: (watermarkText: string, opacity: number) => void;
  toolColor: string;
}

export function WatermarkModal({ onClose, onApplyWatermark, toolColor }: WatermarkModalProps) {
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15);

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: "360px", width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--c-text)", marginBottom: "12px" }}>
          Add Watermark
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <PropLabel>Text</PropLabel>
            <input
              value={watermarkText}
              onChange={e => setWatermarkText(e.target.value)}
              style={modalInput}
              placeholder="CONFIDENTIAL"
            />
          </div>
          <div>
            <PropLabel>Opacity ({Math.round(watermarkOpacity * 100)}%)</PropLabel>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={watermarkOpacity}
              onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "var(--c-bg)",
              borderRadius: "8px",
              border: "1px solid var(--border)"
            }}
          >
            <span
              style={{
                color: `rgba(100,116,139,${watermarkOpacity * 4})`,
                fontSize: "28px",
                fontWeight: "900",
                transform: "rotate(-30deg)",
                display: "inline-block",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              {watermarkText || "PREVIEW"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
          <button onClick={onClose} style={quietBtn}>
            Cancel
          </button>
          <button
            onClick={() => onApplyWatermark(watermarkText, watermarkOpacity)}
            style={{ ...primaryBtn, backgroundColor: toolColor, borderColor: toolColor }}
          >
            Apply Watermark
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
