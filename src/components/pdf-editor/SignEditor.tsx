import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, FileText, Plus, Check, X, 
  Users, Edit2, Trash2, Calendar, Type, HelpCircle, PenTool,
  User, Stamp, GripVertical, Image
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

  // Upgrade features states & refs
  const [modalSection, setModalSection] = useState<"signature" | "initials" | "stamp">("signature");
  
  // Methods inside each section
  const [sigMethod, setSigMethod] = useState<"type" | "draw" | "upload">("type");
  const [initMethod, setInitMethod] = useState<"type" | "upload">("type");
  const [stampMethod, setStampMethod] = useState<"generate" | "upload">("generate");
  
  // Raw uploaded images (original scans)
  const [uploadedSigRaw, setUploadedSigRaw] = useState<string>("");
  const [uploadedInitRaw, setUploadedInitRaw] = useState<string>("");
  const [uploadedStampRaw, setUploadedStampRaw] = useState<string>("");
  
  // Sensitivity/Threshold levels for removing white background
  const [sigThreshold, setSigThreshold] = useState<number>(230);
  const [initThreshold, setInitThreshold] = useState<number>(230);
  const [stampThreshold, setStampThreshold] = useState<number>(230);
  
  // Keep original colors toggles
  const [sigKeepColor, setSigKeepColor] = useState<boolean>(true);
  const [initKeepColor, setInitKeepColor] = useState<boolean>(true);
  const [stampKeepColor, setStampKeepColor] = useState<boolean>(true);
  
  // Output URLs for the active states
  const [typedSignatureUrl, setTypedSignatureUrl] = useState<string>("");
  const [drawnSignatureUrl, setDrawnSignatureUrl] = useState<string>("");
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string>("");
  
  const [typedInitialsUrl, setTypedInitialsUrl] = useState<string>("");
  const [uploadedInitialsUrl, setUploadedInitialsUrl] = useState<string>("");
  
  const [generatedStampUrl, setGeneratedStampUrl] = useState<string>("");
  const [uploadedStampUrl, setUploadedStampUrl] = useState<string>("");

  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [stampText, setStampText] = useState({
    text1: "COMPANY STAMP",
    text2: "APPROVED",
    type: "rectangle" as "rectangle" | "round" | "none"
  });

  // Background Transparency & Tinting Filter
  function processUploadedImage(
    rawUrl: string, 
    threshold: number, 
    keepColor: boolean, 
    color: string
  ): Promise<string> {
    return new Promise((resolve) => {
      if (!rawUrl) {
        resolve("");
        return;
      }
      const img = new window.Image();
      img.src = rawUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let targetR = 30, targetG = 41, targetB = 59; // default blackish
        if (color.startsWith("#")) {
          const hex = color.replace("#", "");
          if (hex.length === 6) {
            targetR = parseInt(hex.substring(0, 2), 16);
            targetG = parseInt(hex.substring(2, 4), 16);
            targetB = parseInt(hex.substring(4, 6), 16);
          } else if (hex.length === 3) {
            targetR = parseInt(hex[0] + hex[0], 16);
            targetG = parseInt(hex[1] + hex[1], 16);
            targetB = parseInt(hex[2] + hex[2], 16);
          }
        }
        
        // Loop through pixels and remove white background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];
          
          if (r > threshold && g > threshold && b > threshold) {
            data[i+3] = 0; // alpha = 0 (transparent)
          } else if (!keepColor && a > 10) {
            // Tint dark/colored pixels with selected ink color
            const brightness = (r + g + b) / 3;
            const ratio = brightness / 255;
            data[i] = targetR + (255 - targetR) * ratio;
            data[i+1] = targetG + (255 - targetG) * ratio;
            data[i+2] = targetB + (255 - targetB) * ratio;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        resolve(rawUrl);
      };
    });
  }

  // Helper: dynamic stamp generator
  function generateStamp(text1: string, text2: string, color: string, type: "rectangle" | "round" | "none") {
    if (type === "none") return "";
    const canvas = document.createElement("canvas");
    if (type === "rectangle") {
      canvas.width = 250;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 230, 100);
        
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, 218, 88);
        
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(text1.toUpperCase() || "COMPANY STAMP", 125, 52);
        
        ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(text2.toUpperCase() || "APPROVED", 125, 82);
      }
    } else if (type === "round") {
      canvas.width = 150;
      canvas.height = 150;
      const ctxRound = canvas.getContext("2d");
      if (ctxRound) {
        ctxRound.strokeStyle = color;
        ctxRound.lineWidth = 4;
        ctxRound.beginPath();
        ctxRound.arc(75, 75, 65, 0, Math.PI * 2);
        ctxRound.stroke();
        
        ctxRound.lineWidth = 1.5;
        ctxRound.beginPath();
        ctxRound.arc(75, 75, 58, 0, Math.PI * 2);
        ctxRound.stroke();
        
        ctxRound.fillStyle = color;
        ctxRound.textAlign = "center";
        
        ctxRound.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
        ctxRound.fillText(text1.toUpperCase() || "STAMP", 75, 70);
        
        ctxRound.font = "11px 'Plus Jakarta Sans', sans-serif";
        ctxRound.fillText(text2.toUpperCase() || "APPROVED", 75, 95);
      }
    }
    return canvas.toDataURL();
  }

  // Helper: Text to base64 image generator
  function generateTextDataUrl(text: string, color: string) {
    const offscreen = document.createElement("canvas");
    offscreen.width = 300;
    offscreen.height = 60;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(text || "Type text...", 10, 40);
    }
    return offscreen.toDataURL();
  }

  // Draw Pad Freehand Coordinate maths
  function getDrawCoords(e: any) {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function handleDrawStart(e: any) {
    e.preventDefault();
    const coords = getDrawCoords(e);
    const ctx = drawingCanvasContextRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawingFreehand(true);
    }
  }

  function handleDrawMove(e: any) {
    if (!isDrawingFreehand) return;
    e.preventDefault();
    const coords = getDrawCoords(e);
    const ctx = drawingCanvasContextRef.current;
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }

  function handleDrawEnd() {
    setIsDrawingFreehand(false);
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setDrawnSignatureUrl(dataUrl);
    }
  }

  function clearDrawingCanvas() {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setDrawnSignatureUrl("");
    }
  }

  // File Upload Handlers
  function handleSigFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target?.result as string;
        setUploadedSigRaw(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleInitFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target?.result as string;
        setUploadedInitRaw(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleStampFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target?.result as string;
        setUploadedStampRaw(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  // Initialize context for drawing pad
  useEffect(() => {
    if (modalSection === "signature" && sigMethod === "draw" && drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      canvas.width = 430;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = signatureDetails.color;
        drawingCanvasContextRef.current = ctx;
      }
    }
  }, [modalSection, sigMethod, signatureDetails.color]);

  // Synchronize typed signature image preview when name or font or color changes
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = `italic 36px ${signatureDetails.signatureFont}`;
      ctx.fillStyle = signatureDetails.color;
      ctx.fillText(signatureDetails.fullName || "Signature", 20, 50);
    }
    setTypedSignatureUrl(canvas.toDataURL());
  }, [signatureDetails.fullName, signatureDetails.signatureFont, signatureDetails.color]);

  // Synchronize typed initials image preview
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = `italic 36px ${signatureDetails.initialsFont}`;
      ctx.fillStyle = signatureDetails.color;
      ctx.fillText(signatureDetails.initials || "AB", 20, 50);
    }
    setTypedInitialsUrl(canvas.toDataURL());
  }, [signatureDetails.initials, signatureDetails.initialsFont, signatureDetails.color]);

  // Update generated digital stamp DataUrl
  useEffect(() => {
    if (stampText.type !== "none") {
      const dataUrl = generateStamp(stampText.text1, stampText.text2, signatureDetails.color, stampText.type);
      setGeneratedStampUrl(dataUrl);
    }
  }, [stampText.text1, stampText.text2, stampText.type, signatureDetails.color]);

  // Process uploaded signature raw file
  useEffect(() => {
    if (uploadedSigRaw) {
      processUploadedImage(uploadedSigRaw, sigThreshold, sigKeepColor, signatureDetails.color)
        .then(res => setUploadedSignatureUrl(res));
    } else {
      setUploadedSignatureUrl("");
    }
  }, [uploadedSigRaw, sigThreshold, sigKeepColor, signatureDetails.color]);

  // Process uploaded initials raw file
  useEffect(() => {
    if (uploadedInitRaw) {
      processUploadedImage(uploadedInitRaw, initThreshold, initKeepColor, signatureDetails.color)
        .then(res => setUploadedInitialsUrl(res));
    } else {
      setUploadedInitialsUrl("");
    }
  }, [uploadedInitRaw, initThreshold, initKeepColor, signatureDetails.color]);

  // Process uploaded stamp raw file
  useEffect(() => {
    if (uploadedStampRaw) {
      processUploadedImage(uploadedStampRaw, stampThreshold, stampKeepColor, signatureDetails.color)
        .then(res => setUploadedStampUrl(res));
    } else {
      setUploadedStampUrl("");
    }
  }, [uploadedStampRaw, stampThreshold, stampKeepColor, signatureDetails.color]);

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
    if (!signatureDetails.signatureDataUrl) {
      setModalSection("signature");
      setSigMethod("type");
      setShowDetailsModal(true);
      return;
    }
    const newEl: OverlayElement = {
      id: "sig-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 35,
      y: 40,
      width: 28,
      height: 10,
      dataUrl: signatureDetails.signatureDataUrl
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function addInitialsToPage() {
    if (!signatureDetails.initialsDataUrl) {
      setModalSection("initials");
      setInitMethod("type");
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

  function addTextToPage() {
    const text = "Double click to edit text";
    const dataUrl = generateTextDataUrl(text, signatureDetails.color);
    const newEl: OverlayElement = {
      id: "text-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 35,
      y: 60,
      width: 25,
      height: 6,
      content: text,
      dataUrl
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function addStampToPage() {
    if (!signatureDetails.stampDataUrl) {
      setModalSection("stamp");
      setStampMethod("generate");
      setShowDetailsModal(true);
      return;
    }
    const newEl: OverlayElement = {
      id: "stamp-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 30,
      y: 35,
      width: 24,
      height: 14,
      dataUrl: signatureDetails.stampDataUrl
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }

  function handleApplyDetails() {
    if (modalSection === "signature") {
      let finalUrl = "";
      if (sigMethod === "type") finalUrl = typedSignatureUrl;
      else if (sigMethod === "draw") finalUrl = drawnSignatureUrl;
      else if (sigMethod === "upload") finalUrl = uploadedSignatureUrl;
      
      setSignatureDetails(prev => ({
        ...prev,
        signatureDataUrl: finalUrl
      }));
    } else if (modalSection === "initials") {
      let finalUrl = "";
      if (initMethod === "type") finalUrl = typedInitialsUrl;
      else if (initMethod === "upload") finalUrl = uploadedInitialsUrl;
      
      setSignatureDetails(prev => ({
        ...prev,
        initialsDataUrl: finalUrl
      }));
    } else if (modalSection === "stamp") {
      let finalUrl = "";
      if (stampMethod === "generate") finalUrl = generatedStampUrl;
      else if (stampMethod === "upload") finalUrl = uploadedStampUrl;
      
      setSignatureDetails(prev => ({
        ...prev,
        stampDataUrl: finalUrl
      }));
    }
    setShowDetailsModal(false);
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
                {el.id.startsWith("text-") ? (
                  <input
                    type="text"
                    value={el.content || ""}
                    onChange={e => {
                      const text = e.target.value;
                      const dataUrl = generateTextDataUrl(text, signatureDetails.color);
                      setElements(prev => prev.map(item => item.id === el.id ? { ...item, content: text, dataUrl } : item));
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: signatureDetails.color,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      textAlign: "center",
                      padding: 0
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : el.dataUrl ? (
                  <img src={el.dataUrl} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", mixBlendMode: "multiply" }} alt="sig" />
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
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              {/* Drag handles */}
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              
              {/* Left icon wrapper */}
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <PenTool size={14} />
              </div>
              
              {/* Preview Box */}
              <div style={{
                flex: 1,
                border: "1px dashed #cbd5e1",
                borderRadius: "4px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                overflow: "hidden",
                padding: "2px"
              }}>
                {signatureDetails.signatureDataUrl ? (
                  <img src={signatureDetails.signatureDataUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Signature" />
                ) : (
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>Set signature</span>
                )}
              </div>

              {/* Edit button */}
              <button 
                onClick={e => { e.stopPropagation(); setModalSection("signature"); setSigMethod("type"); setShowDetailsModal(true); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Edit2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Optional fields */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: "800", color: "rgba(0,0,0,0.5)", letterSpacing: "0.05em" }}>OPTIONAL FIELDS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
            
            {/* 1. Initials Card */}
            <div 
              onClick={addInitialsToPage}
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
            >
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#0ea5e9",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.74rem"
              }}>
                AC
              </div>
              <div style={{
                flex: 1,
                border: "1px dashed #cbd5e1",
                borderRadius: "4px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                overflow: "hidden",
                padding: "2px"
              }}>
                {signatureDetails.initialsDataUrl ? (
                  <img src={signatureDetails.initialsDataUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Initials" />
                ) : (
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>Set initials</span>
                )}
              </div>
              <button 
                onClick={e => { e.stopPropagation(); setModalSection("initials"); setInitMethod("type"); setShowDetailsModal(true); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Edit2 size={13} />
              </button>
            </div>

            {/* 2. Full Name Card */}
            <div 
              onClick={addNameToPage}
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
            >
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <User size={14} />
              </div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: "700", color: "#1e293b" }}>
                Full Name
              </div>
              <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.3)", paddingRight: "4px" }}>+</span>
            </div>

            {/* 3. Date Stamp Card */}
            <div 
              onClick={addDateToPage}
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
            >
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#14b8a6",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Calendar size={14} />
              </div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: "700", color: "#1e293b" }}>
                Date Stamp
              </div>
              <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.3)", paddingRight: "4px" }}>+</span>
            </div>

            {/* 4. Text Card */}
            <div 
              onClick={addTextToPage}
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
            >
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Type size={14} />
              </div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: "700", color: "#1e293b" }}>
                Text
              </div>
              <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.3)", paddingRight: "4px" }}>+</span>
            </div>

            {/* 5. Company Stamp Card */}
            <div 
              onClick={addStampToPage}
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)"}
            >
              <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#ec4899",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Stamp size={14} />
              </div>
              <div style={{
                flex: 1,
                border: signatureDetails.stampDataUrl ? "1px dashed #cbd5e1" : "none",
                borderRadius: "4px",
                height: signatureDetails.stampDataUrl ? "38px" : "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: signatureDetails.stampDataUrl ? "#f8fafc" : "transparent",
                overflow: "hidden",
                padding: signatureDetails.stampDataUrl ? "2px" : "0",
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "#1e293b",
                textAlign: "left"
              }}>
                {signatureDetails.stampDataUrl ? (
                  <img src={signatureDetails.stampDataUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Stamp" />
                ) : (
                  "Company Stamp"
                )}
              </div>
              <button 
                onClick={e => { e.stopPropagation(); setModalSection("stamp"); setStampMethod("generate"); setShowDetailsModal(true); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Edit2 size={13} />
              </button>
            </div>
            
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
            maxWidth: "680px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e6e6e6",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            height: "480px"
          }}>
            {/* Left Sidebar Sections */}
            <div style={{
              width: "170px",
              backgroundColor: "#f8fafc",
              borderRight: "1px solid #e2e8f0",
              padding: "24px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxSizing: "border-box"
            }}>
              {[
                { id: "signature", label: "Signature", icon: <PenTool size={15} /> },
                { id: "initials", label: "Initials", icon: <User size={15} /> },
                { id: "stamp", label: "Company Stamp", icon: <Stamp size={15} /> }
              ].map(sec => {
                const isSelected = modalSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setModalSection(sec.id as any)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: isSelected ? "#000000" : "transparent",
                      color: isSelected ? "#ffffff" : "#475569",
                      fontWeight: isSelected ? "700" : "550",
                      fontSize: "0.82rem",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {sec.icon}
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Pane Content */}
            <div style={{
              flex: 1,
              padding: "24px 24px 20px 24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
              position: "relative"
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>

              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1b1b1b", margin: "0 0 16px 0", paddingRight: "24px" }}>
                Set your {modalSection === "signature" ? "Signature" : modalSection === "initials" ? "Initials" : "Company Stamp"}
              </h3>

              {/* ── Section A: Signature Content ── */}
              {modalSection === "signature" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {/* Signature Sub-tabs */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px", gap: "12px" }}>
                    {[
                      { id: "type", label: "Keyboard" },
                      { id: "draw", label: "Drawing Pad" },
                      { id: "upload", label: "Upload Image" }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSigMethod(t.id as any)}
                        style={{
                          padding: "8px 8px 10px 8px",
                          border: "none",
                          background: "none",
                          borderBottom: sigMethod === t.id ? "2px solid #000" : "2px solid transparent",
                          fontWeight: sigMethod === t.id ? "700" : "500",
                          color: sigMethod === t.id ? "#000" : "#64748b",
                          fontSize: "0.78rem",
                          cursor: "pointer"
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {/* Method 1: Keyboard cursive */}
                    {sigMethod === "type" && (
                      <div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Full name:</label>
                          <input 
                            type="text"
                            placeholder="Your name"
                            value={signatureDetails.fullName}
                            onChange={e => setSignatureDetails(prev => ({ ...prev, fullName: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.8rem",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>

                        <div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Select font style:</span>
                          <div style={{
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            maxHeight: "130px",
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
                                onClick={() => setSignatureDetails(prev => ({ ...prev, signatureFont: font }))}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: `1px solid ${signatureDetails.signatureFont === font ? "#000" : "#e6e6e6"}`,
                                  background: signatureDetails.signatureFont === font ? "#fcfcfc" : "transparent",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                  fontFamily: font,
                                  color: signatureDetails.color,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <span>{signatureDetails.fullName || "Signature"}</span>
                                {signatureDetails.signatureFont === font && <Check size={12} style={{ color: "#000" }} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Method 2: Drawing Pad */}
                    {sigMethod === "draw" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ position: "relative", width: "100%", height: "150px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", overflow: "hidden" }}>
                          <canvas 
                            ref={drawingCanvasRef}
                            onMouseDown={handleDrawStart}
                            onMouseMove={handleDrawMove}
                            onMouseUp={handleDrawEnd}
                            onMouseLeave={handleDrawEnd}
                            onTouchStart={handleDrawStart}
                            onTouchMove={handleDrawMove}
                            onTouchEnd={handleDrawEnd}
                            style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }}
                          />
                          <button
                            type="button"
                            onClick={clearDrawingCanvas}
                            style={{
                              position: "absolute",
                              right: "10px",
                              bottom: "10px",
                              padding: "4px 8px",
                              fontSize: "0.65rem",
                              fontWeight: "700",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Method 3: Upload Image */}
                    {sigMethod === "upload" && (
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Select signature file:</label>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleSigFileUpload}
                              style={{ fontSize: "0.72rem", width: "100%" }}
                            />
                          </div>

                          {uploadedSigRaw && (
                            <>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                  <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Transparency threshold:</label>
                                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{sigThreshold}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="255"
                                  value={sigThreshold}
                                  onChange={e => setSigThreshold(parseInt(e.target.value))}
                                  style={{ width: "100%", cursor: "pointer" }}
                                />
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input 
                                  type="checkbox"
                                  id="sigKeepColor"
                                  checked={sigKeepColor}
                                  onChange={e => setSigKeepColor(e.target.checked)}
                                  style={{ cursor: "pointer" }}
                                />
                                <label htmlFor="sigKeepColor" style={{ fontSize: "0.68rem", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
                                  Keep original colors
                                </label>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Preview Box with Checkered background */}
                        <div style={{
                          width: "140px",
                          height: "140px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          padding: "6px",
                          backgroundImage: "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                          backgroundSize: "10px 10px",
                          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
                          backgroundColor: "#ffffff"
                        }}>
                          {uploadedSignatureUrl ? (
                            <img src={uploadedSignatureUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Signature Preview" />
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center" }}>No image uploaded</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section B: Initials Content ── */}
              {modalSection === "initials" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {/* Initials Sub-tabs */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px", gap: "12px" }}>
                    {[
                      { id: "type", label: "Keyboard" },
                      { id: "upload", label: "Upload Image" }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setInitMethod(t.id as any)}
                        style={{
                          padding: "8px 8px 10px 8px",
                          border: "none",
                          background: "none",
                          borderBottom: initMethod === t.id ? "2px solid #000" : "2px solid transparent",
                          fontWeight: initMethod === t.id ? "700" : "500",
                          color: initMethod === t.id ? "#000" : "#64748b",
                          fontSize: "0.78rem",
                          cursor: "pointer"
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {/* Method 1: Keyboard type initials */}
                    {initMethod === "type" && (
                      <div>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Initials:</label>
                          <input 
                            type="text"
                            placeholder="Initials"
                            value={signatureDetails.initials}
                            onChange={e => setSignatureDetails(prev => ({ ...prev, initials: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.8rem",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>

                        <div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Select font style:</span>
                          <div style={{
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            maxHeight: "130px",
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
                                onClick={() => setSignatureDetails(prev => ({ ...prev, initialsFont: font }))}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: `1px solid ${signatureDetails.initialsFont === font ? "#000" : "#e6e6e6"}`,
                                  background: signatureDetails.initialsFont === font ? "#fcfcfc" : "transparent",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                  fontFamily: font,
                                  color: signatureDetails.color,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <span>{signatureDetails.initials || "AB"}</span>
                                {signatureDetails.initialsFont === font && <Check size={12} style={{ color: "#000" }} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Method 2: Upload Initials */}
                    {initMethod === "upload" && (
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Select initials file:</label>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleInitFileUpload}
                              style={{ fontSize: "0.72rem", width: "100%" }}
                            />
                          </div>

                          {uploadedInitRaw && (
                            <>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                  <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Transparency threshold:</label>
                                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{initThreshold}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="255"
                                  value={initThreshold}
                                  onChange={e => setInitThreshold(parseInt(e.target.value))}
                                  style={{ width: "100%", cursor: "pointer" }}
                                />
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input 
                                  type="checkbox"
                                  id="initKeepColor"
                                  checked={initKeepColor}
                                  onChange={e => setInitKeepColor(e.target.checked)}
                                  style={{ cursor: "pointer" }}
                                />
                                <label htmlFor="initKeepColor" style={{ fontSize: "0.68rem", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
                                  Keep original colors
                                </label>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Preview Box with Checkered background */}
                        <div style={{
                          width: "140px",
                          height: "140px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          padding: "6px",
                          backgroundImage: "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                          backgroundSize: "10px 10px",
                          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
                          backgroundColor: "#ffffff"
                        }}>
                          {uploadedInitialsUrl ? (
                            <img src={uploadedInitialsUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Initials Preview" />
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center" }}>No image uploaded</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section C: Company Stamp Content ── */}
              {modalSection === "stamp" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {/* Stamp Sub-tabs */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px", gap: "12px" }}>
                    {[
                      { id: "generate", label: "Digital Stamp" },
                      { id: "upload", label: "Upload Stamp" }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setStampMethod(t.id as any)}
                        style={{
                          padding: "8px 8px 10px 8px",
                          border: "none",
                          background: "none",
                          borderBottom: stampMethod === t.id ? "2px solid #000" : "2px solid transparent",
                          fontWeight: stampMethod === t.id ? "700" : "500",
                          color: stampMethod === t.id ? "#000" : "#64748b",
                          fontSize: "0.78rem",
                          cursor: "pointer"
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {/* Method 1: Digital Stamp Generator */}
                    {stampMethod === "generate" && (
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Stamp shape:</label>
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                              {[
                                { id: "rectangle", label: "Rectangular" },
                                { id: "round", label: "Circular" }
                              ].map(st => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => setStampText(prev => ({ ...prev, type: st.id as any }))}
                                  style={{
                                    flex: 1,
                                    padding: "6px 4px",
                                    fontSize: "0.7rem",
                                    fontWeight: "750",
                                    backgroundColor: stampText.type === st.id ? "#000" : "#f1f5f9",
                                    color: stampText.type === st.id ? "#fff" : "#475569",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                  }}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Company name:</label>
                            <input 
                              type="text"
                              value={stampText.text1}
                              onChange={e => setStampText(prev => ({ ...prev, text1: e.target.value }))}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem", marginTop: "4px", boxSizing: "border-box" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Status text:</label>
                            <input 
                              type="text"
                              value={stampText.text2}
                              onChange={e => setStampText(prev => ({ ...prev, text2: e.target.value }))}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem", marginTop: "4px", boxSizing: "border-box" }}
                            />
                          </div>
                        </div>

                        {/* Stamp Preview */}
                        <div style={{
                          width: "140px",
                          height: "140px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          padding: "6px"
                        }}>
                          {generatedStampUrl ? (
                            <img src={generatedStampUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Stamp preview" />
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>No stamp text</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Method 2: Scanned stamp file upload */}
                    {stampMethod === "upload" && (
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Select company stamp image:</label>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleStampFileUpload}
                              style={{ fontSize: "0.72rem", width: "100%" }}
                            />
                          </div>

                          {uploadedStampRaw && (
                            <>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                  <label style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569" }}>Transparency threshold:</label>
                                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{stampThreshold}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="255"
                                  value={stampThreshold}
                                  onChange={e => setStampThreshold(parseInt(e.target.value))}
                                  style={{ width: "100%", cursor: "pointer" }}
                                />
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input 
                                  type="checkbox"
                                  id="stampKeepColor"
                                  checked={stampKeepColor}
                                  onChange={e => setStampKeepColor(e.target.checked)}
                                  style={{ cursor: "pointer" }}
                                />
                                <label htmlFor="stampKeepColor" style={{ fontSize: "0.68rem", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
                                  Keep original colors
                                </label>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Preview Box with Checkered background */}
                        <div style={{
                          width: "140px",
                          height: "140px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          padding: "6px",
                          backgroundImage: "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                          backgroundSize: "10px 10px",
                          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
                          backgroundColor: "#ffffff"
                        }}>
                          {uploadedStampUrl ? (
                            <img src={uploadedStampUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Stamp preview" />
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center" }}>No image uploaded</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom control row */}
              <div style={{
                marginTop: "auto",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>Ink color:</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[
                      { key: "black", hex: "#1e293b" },
                      { key: "red", hex: "#dc2626" },
                      { key: "blue", hex: "#2563eb" },
                      { key: "green", hex: "#16a34a" }
                    ].map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setSignatureDetails(prev => ({ ...prev, color: c.hex }))}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: c.hex,
                          border: signatureDetails.color === c.hex ? "2px solid #000" : "1px solid transparent",
                          cursor: "pointer",
                          padding: 0
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "transparent",
                      color: "#475569",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleApplyDetails}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#000000",
                      color: "#ffffff",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
