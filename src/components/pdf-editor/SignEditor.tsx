import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, FileText, Plus, Check, X, 
  Users, Edit2, Trash2, Calendar, Type, HelpCircle, PenTool
} from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { OverlayElement, ActiveTool } from "./types";

interface SignEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function SignEditor({ file, onClose, onSave }: SignEditorProps) {
  const [step, setStep] = useState<"who-signs" | "editor" | "invite-sent">("who-signs");
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  
  // Signature Overlay Elements State
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Signature settings
  const [signatureDetails, setSignatureDetails] = useState<{
    fullName: string;
    initials: string;
    signatureFont: string;
    initialsFont: string;
    color: string;
    signatureDataUrl: string;
    initialsDataUrl: string;
    stampDataUrl: string;
  }>({
    fullName: "",
    initials: "",
    signatureFont: "'Dancing Script', cursive",
    initialsFont: "'Dancing Script', cursive",
    color: "#1e293b",
    signatureDataUrl: "",
    initialsDataUrl: "",
    stampDataUrl: ""
  });
  
  // Modals state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [emailInvites, setEmailInvites] = useState<string[]>([""]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF document and generate page order + thumbnails
  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      try {
        const pdfjsLib = await getPdfjsLib();
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        const order = [];
        for (let i = 1; i <= pdf.numPages; i++) order.push(i);
        setPageOrder(order);

        // Generate thumbnails
        const thumbUrls: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.14 });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            thumbUrls.push(canvas.toDataURL());
          }
        }
        setThumbnails(thumbUrls);
      } catch (err) {
        console.error("Error loading PDF in SignEditor:", err);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }, [file]);

  // Render current page to canvas viewport
  useEffect(() => {
    if (pdfDoc && pageOrder[currentPage - 1]) {
      const pageNum = pageOrder[currentPage - 1];
      let active = true;
      async function renderPage() {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: zoom / 100 });
          if (!active) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
        } catch (err) {
          console.error("SignEditor Page render error:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, zoom, pageOrder, step]);

  // Coordinate math
  function getCanvasCoords(e: React.MouseEvent) {
    const container = overlayContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  // Handle Dragging
  function handleMouseDown(e: React.MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    const clickedEl = elements.find(el => {
      if (el.page !== currentPage) return false;
      const w = el.width || 22;
      const h = el.height || 10;
      return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
    });

    if (clickedEl) {
      setSelectedElementId(clickedEl.id);
      setIsDragging(true);
      setDragOffset({ x: x - clickedEl.x, y: y - clickedEl.y });
    } else {
      setSelectedElementId(null);
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging && selectedElementId) {
      const { x, y } = getCanvasCoords(e);
      const updated = elements.map(el => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            x: Math.min(Math.max(x - dragOffset.x, 0), 100 - (el.width || 22)),
            y: Math.min(Math.max(y - dragOffset.y, 0), 100 - (el.height || 10)),
          };
        }
        return el;
      });
      setElements(updated);
    }
  }

  // Mouse up event
  function handleMouseUp() {
    setIsDragging(false);
  }

  // Element modifiers
  function deleteElement(id: string) {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementId(null);
  }

  // Add items directly to page
  function addSignatureToPage() {
    if (!signatureDetails.signatureDataUrl && !signatureDetails.stampDataUrl) {
      setShowDetailsModal(true);
      return;
    }
    const dataUrl = signatureDetails.signatureDataUrl || signatureDetails.stampDataUrl;
    const newEl: OverlayElement = {
      id: "sig-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 35,
      y: 40,
      width: 28,
      height: 10,
      dataUrl
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function addInitialsToPage() {
    if (!signatureDetails.initialsDataUrl) {
      setShowDetailsModal(true);
      return;
    }
    const newEl: OverlayElement = {
      id: "init-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 40,
      y: 45,
      width: 15,
      height: 8,
      dataUrl: signatureDetails.initialsDataUrl
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function addNameToPage() {
    const text = signatureDetails.fullName || "Your Name";
    // Generate text as an image via canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = 300;
    offscreen.height = 60;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = signatureDetails.color;
      ctx.fillText(text, 10, 40);
    }
    const newEl: OverlayElement = {
      id: "name-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 35,
      y: 50,
      width: 25,
      height: 6,
      dataUrl: offscreen.toDataURL()
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function addDateToPage() {
    const today = new Date();
    const formatted = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    const offscreen = document.createElement("canvas");
    offscreen.width = 200;
    offscreen.height = 60;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = signatureDetails.color;
      ctx.fillText(formatted, 10, 40);
    }
    const newEl: OverlayElement = {
      id: "date-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 35,
      y: 55,
      width: 20,
      height: 6,
      dataUrl: offscreen.toDataURL()
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  // Complete signature process
  function handleSignComplete() {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const options: any = {
      editorOverlays: JSON.stringify(elements),
      pageOrder: pageOrder.join(","),
      rotatePages: "",
      removePages: ""
    };
    onSave(dataTransfer.files, options);
  }

  // ── Step 1: Who signs popup ──
  if (step === "who-signs") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
        backgroundColor: "#f9f9f9",
        padding: "20px",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          maxWidth: "760px",
          width: "100%",
          textAlign: "center",
          border: "1px solid #e6e6e6"
        }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "750", color: "#1b1b1b", marginBottom: "32px" }}>
            Who will sign this document?
          </h2>
          
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "36px" }}>
            {/* Option A: Only me */}
            <div style={{
              flex: 1,
              minWidth: "250px",
              border: "1px solid #e6e6e6",
              borderRadius: "12px",
              padding: "28px 20px",
              backgroundColor: "#fcfcfc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FileText size={32} />
              </div>
              <button 
                onClick={() => setStep("editor")}
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#262626"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#000000"}
              >
                Only me
              </button>
              <span style={{ fontSize: "0.74rem", color: "#5d5f5f", fontWeight: "500" }}>Sign this document</span>
            </div>

            {/* Option B: Several people */}
            <div style={{
              flex: 1,
              minWidth: "250px",
              border: "1px solid #e6e6e6",
              borderRadius: "12px",
              padding: "28px 20px",
              backgroundColor: "#fcfcfc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Users size={32} />
              </div>
              <button 
                onClick={() => {
                  const email = prompt("Enter signer email address:");
                  if (email) {
                    setEmailInvites([email]);
                    setStep("invite-sent");
                  }
                }}
                style={{
                  backgroundColor: "transparent",
                  color: "#000000",
                  border: "1px solid #000000",
                  borderRadius: "8px",
                  padding: "9px 24px",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Several people
              </button>
              <span style={{ fontSize: "0.74rem", color: "#5d5f5f", fontWeight: "500" }}>Invite others to sign</span>
            </div>
          </div>

          <div style={{ fontSize: "0.76rem", color: "#5d5f5f" }}>
            Uploaded documents: <strong>{file.name}</strong>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1.5: Invite Sent Success view ──
  if (step === "invite-sent") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "75vh", backgroundColor: "#f9f9f9" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", maxWidth: "500px", width: "100%", textAlign: "center", border: "1px solid #e6e6e6" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check size={32} />
          </div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "750", marginBottom: "12px", color: "#1b1b1b" }}>Signature Invitation Sent!</h3>
          <p style={{ fontSize: "0.82rem", color: "#5d5f5f", marginBottom: "24px" }}>We have sent a signing request email to <strong>{emailInvites[0]}</strong> to review and electronically sign this document.</p>
          <button 
            onClick={onClose}
            style={{ backgroundColor: "#000000", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", width: "100%" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Main Editor Workspace View ──
  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 80px)", // minus header height
      width: "100%",
      backgroundColor: "#f3f3f3",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: "hidden"
    }}>
      {/* Left Sidebar: Pages List */}
      <div style={{
        width: "180px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e6e6e6",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1b1b1b", letterSpacing: "0.03em" }}>PAGES</span>
          <span style={{ fontSize: "0.72rem", color: "#5d5f5f" }}>{currentPage} / {totalPages || 1}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {pageOrder.map((pageNum, idx) => {
            const isActive = currentPage === idx + 1;
            return (
              <div 
                key={pageNum}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  borderRadius: "6px",
                  border: `2px solid ${isActive ? "#000000" : "transparent"}`,
                  padding: "4px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#f9f9f9" : "transparent",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{
                  width: "100%",
                  aspectRatio: "0.75",
                  background: "#ffffff",
                  border: "1px solid #e6e6e6",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {thumbnails[pageNum - 1] ? (
                    <img src={thumbnails[pageNum - 1]} style={{ width: "90%", height: "90%", objectFit: "contain" }} alt={`Page ${pageNum}`} />
                  ) : (
                    <FileText size={20} style={{ color: "#94a3b8" }} />
                  )}
                </div>
                <div style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: "600", color: "#5d5f5f", marginTop: "4px" }}>Page {pageNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Canvas Workspace Viewport */}
      <div style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        position: "relative"
      }}>
        {/* Floating Toolbar on Left */}
        <div style={{
          position: "absolute",
          left: "24px",
          top: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e6e6e6",
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          zIndex: 10
        }}>
          {[
            { icon: <Type size={14} />, label: "Text", action: addNameToPage },
            { icon: <PenTool size={14} />, label: "Signature", action: addSignatureToPage },
            { icon: <Calendar size={14} />, label: "Date", action: addDateToPage }
          ].map((btn, idx) => (
            <button 
              key={idx}
              onClick={btn.action}
              className="editor-tooltip editor-tooltip-right"
              data-tooltip={btn.label}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                border: "none",
                background: "transparent",
                color: "#1b1b1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* PDF Page Canvas Frame wrapper */}
        <div 
          ref={overlayContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "relative",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            border: "1px solid #e6e6e6"
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
          
          {/* Elements overlay layer */}
          {elements.filter(el => el.page === currentPage).map(el => {
            const isSel = selectedElementId === el.id;
            return (
              <div 
                key={el.id}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width || 22}%`,
                  height: `${el.height || 10}%`,
                  border: isSel ? "1.5px dashed #2563eb" : "1.5px solid transparent",
                  cursor: "move",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={e => { e.stopPropagation(); setSelectedElementId(el.id); }}
              >
                {el.dataUrl ? (
                  <img src={el.dataUrl} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} alt="sig" />
                ) : (
                  <span style={{ fontSize: "12px", color: "#777777" }}>Signature</span>
                )}
                {isSel && (
                  <button 
                    onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                    style={{
                      position: "absolute",
                      top: "-24px",
                      right: "0",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      fontSize: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar: Signing options panel */}
      <div style={{
        width: "260px",
        backgroundColor: "#ADEFD1", // Mint branding color
        borderLeft: "1px solid #e6e6e6",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "20px 16px",
        boxSizing: "border-box"
      }}>
        {/* Back Link */}
        <button 
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(0,0,0,0.6)",
            fontSize: "0.74rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "0",
            marginBottom: "14px",
            textAlign: "left"
          }}
        >
          <ChevronLeft size={12} /> Sign PDF
        </button>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#000000", margin: "0 0 16px 0" }}>
          Signing options
        </h3>

        {/* Section: Type */}
        <div style={{ marginBottom: "18px" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: "800", color: "rgba(0,0,0,0.5)", letterSpacing: "0.05em" }}>TYPE</span>
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <div style={{
              flex: 1,
              backgroundColor: "#ffffff",
              border: "2px solid #000000",
              borderRadius: "8px",
              padding: "10px 6px",
              textAlign: "center",
              cursor: "pointer"
            }}>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: "750", color: "#000000" }}>Simple</span>
              <span style={{ display: "block", fontSize: "0.55rem", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>Signature</span>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "8px",
              padding: "10px 6px",
              textAlign: "center",
              opacity: 0.6,
              cursor: "not-allowed"
            }}>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", color: "#000000" }}>Digital 👑</span>
              <span style={{ display: "block", fontSize: "0.55rem", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>Cryptographic</span>
            </div>
          </div>
        </div>

        {/* Section: Required fields */}
        <div style={{ marginBottom: "18px" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: "800", color: "rgba(0,0,0,0.5)", letterSpacing: "0.05em" }}>REQUIRED FIELDS</span>
          <div style={{ marginTop: "6px" }}>
            <div 
              onClick={addSignatureToPage}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px dashed rgba(0,0,0,0.2)",
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "4px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Type size={12} />
                </div>
                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#1b1b1b" }}>Signature</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(0,0,0,0.5)", marginTop: "1px" }}>
                    {signatureDetails.fullName || "Click to add details"}
                  </div>
                </div>
              </div>
              <button 
                onClick={e => { e.stopPropagation(); setShowDetailsModal(true); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.4)", padding: "4px" }}
              >
                <Edit2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Optional fields */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.62rem", fontWeight: "800", color: "rgba(0,0,0,0.5)", letterSpacing: "0.05em" }}>OPTIONAL FIELDS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
            {[
              { label: "Initials", desc: signatureDetails.initials || "AB", action: addInitialsToPage },
              { label: "Full Name", desc: signatureDetails.fullName || "Name", action: addNameToPage },
              { label: "Date Stamp", desc: "Today's Date", action: addDateToPage }
            ].map((f, i) => (
              <div 
                key={i}
                onClick={f.action}
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
              >
                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#1b1b1b" }}>{f.label}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.4)" }}>{f.desc}</div>
                </div>
                <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.3)" }}>+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Bottom Button */}
        <button 
          onClick={handleSignComplete}
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "0.9rem",
            fontWeight: "750",
            cursor: "pointer",
            width: "100%",
            marginTop: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          Sign PDF &rarr;
        </button>
      </div>

      {/* ── Signature Details popup modal ── */}
      {showDetailsModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15,23,42,0.3)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            maxWidth: "520px",
            width: "100%",
            padding: "28px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e6e6e6",
            position: "relative"
          }}>
            <button 
              onClick={() => setShowDetailsModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1b1b1b", marginBottom: "20px" }}>
              Set your signature details
            </h3>

            {/* Inputs: Full Name & Initials */}
            <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "#475569" }}>Full name:</label>
                <input 
                  type="text"
                  placeholder="Your name"
                  value={signatureDetails.fullName}
                  onChange={e => {
                    const val = e.target.value;
                    setSignatureDetails(prev => {
                      const canvas = document.createElement("canvas");
                      canvas.width = 300;
                      canvas.height = 80;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.font = `italic 36px ${prev.signatureFont}`;
                        ctx.fillStyle = prev.color;
                        ctx.fillText(val || "Signature", 20, 50);
                      }
                      return { ...prev, fullName: val, signatureDataUrl: canvas.toDataURL() };
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.82rem",
                    outline: "none",
                    marginTop: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "#475569" }}>Initials:</label>
                <input 
                  type="text"
                  placeholder="Initials"
                  value={signatureDetails.initials}
                  onChange={e => {
                    const val = e.target.value;
                    setSignatureDetails(prev => {
                      const canvas = document.createElement("canvas");
                      canvas.width = 150;
                      canvas.height = 80;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.font = `italic 36px ${prev.initialsFont}`;
                        ctx.fillStyle = prev.color;
                        ctx.fillText(val || "AB", 10, 50);
                      }
                      return { ...prev, initials: val, initialsDataUrl: canvas.toDataURL() };
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.82rem",
                    outline: "none",
                    marginTop: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Signature styles previews */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#475569" }}>Cursive style previews:</span>
              <div style={{
                border: "1px solid #e6e6e6",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "6px",
                maxHeight: "180px",
                overflowY: "auto"
              }}>
                {[
                  "'Dancing Script', cursive",
                  "'Great Vibes', cursive",
                  "'Sacramento', cursive",
                  "'Caveat', cursive"
                ].map((font, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSignatureDetails(prev => {
                      const canvasSig = document.createElement("canvas");
                      canvasSig.width = 300;
                      canvasSig.height = 80;
                      const ctxSig = canvasSig.getContext("2d");
                      if (ctxSig) {
                        ctxSig.font = `italic 36px ${font}`;
                        ctxSig.fillStyle = prev.color;
                        ctxSig.fillText(prev.fullName || "Signature", 20, 50);
                      }
                      const canvasInit = document.createElement("canvas");
                      canvasInit.width = 150;
                      canvasInit.height = 80;
                      const ctxInit = canvasInit.getContext("2d");
                      if (ctxInit) {
                        ctxInit.font = `italic 36px ${font}`;
                        ctxInit.fillStyle = prev.color;
                        ctxInit.fillText(prev.initials || "AB", 10, 50);
                      }
                      return { 
                        ...prev, 
                        signatureFont: font, 
                        initialsFont: font,
                        signatureDataUrl: canvasSig.toDataURL(),
                        initialsDataUrl: canvasInit.toDataURL()
                      };
                    })}
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      border: `1px solid ${signatureDetails.signatureFont === font ? "#000" : "#e6e6e6"}`,
                      background: signatureDetails.signatureFont === font ? "#fcfcfc" : "transparent",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      fontFamily: font,
                      color: signatureDetails.color,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>{signatureDetails.fullName || "Signature"}</span>
                    {signatureDetails.signatureFont === font && <Check size={14} style={{ color: "#000" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#475569" }}>Ink color:</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { key: "black", hex: "#1e293b" },
                  { key: "red", hex: "#dc2626" },
                  { key: "blue", hex: "#2563eb" },
                  { key: "green", hex: "#16a34a" }
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSignatureDetails(prev => {
                      const canvasSig = document.createElement("canvas");
                      canvasSig.width = 300;
                      canvasSig.height = 80;
                      const ctxSig = canvasSig.getContext("2d");
                      if (ctxSig) {
                        ctxSig.font = `italic 36px ${prev.signatureFont}`;
                        ctxSig.fillStyle = c.hex;
                        ctxSig.fillText(prev.fullName || "Signature", 20, 50);
                      }
                      const canvasInit = document.createElement("canvas");
                      canvasInit.width = 150;
                      canvasInit.height = 80;
                      const ctxInit = canvasInit.getContext("2d");
                      if (ctxInit) {
                        ctxInit.font = `italic 36px ${prev.initialsFont}`;
                        ctxInit.fillStyle = c.hex;
                        ctxInit.fillText(prev.initials || "AB", 10, 50);
                      }
                      return { 
                        ...prev, 
                        color: c.hex, 
                        signatureDataUrl: canvasSig.toDataURL(), 
                        initialsDataUrl: canvasInit.toDataURL() 
                      };
                    })}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: c.hex,
                      border: signatureDetails.color === c.hex ? "2.5px solid #000" : "1.5px solid transparent",
                      cursor: "pointer",
                      padding: 0
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "transparent",
                  color: "#475569",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#000000",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
