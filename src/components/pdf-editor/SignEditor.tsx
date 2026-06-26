import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, FileText, Plus, Check, X, 
  Users, Edit2, Trash2, Calendar, Type, HelpCircle, PenTool,
  User, Stamp, GripVertical, Image, ChevronDown, Download, FolderKanban,
  Hand, MousePointer, Undo, Redo, Crown, Lock, Database, Zap
} from "lucide-react";
import { getPdfjsLib } from "../../utils/pdfjs";
import { OverlayElement, ActiveTool } from "./types";

interface SignEditorProps {
  file: File;
  onClose: () => void;
  onSave: (files: FileList, options: any) => void;
}

export function SignEditor({ file, onClose, onSave }: SignEditorProps) {
  const [step, setStep] = useState<"editor" | "invite-sent">("editor");
  const [onboardingModal, setOnboardingModal] = useState<"who-signs" | "sealing-type" | null>("who-signs");
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [activeCursorTool, setActiveCursorTool] = useState<"pointer" | "hand">("pointer");

  // History stack for Undo/Redo
  const [history, setHistory] = useState<OverlayElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoingRedoing = useRef(false);
  
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
  const [showPremiumWarning, setShowPremiumWarning] = useState(false);
  const [emailInputMode, setEmailInputMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
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
    text1: "Company Stamp",
    text2: "Approved",
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
        ctx.font = "bold 20px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(text1 || "Company Stamp", 125, 52);
        
        ctx.font = "14px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(text2 || "Approved", 125, 82);
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
        
        ctxRound.font = "bold 14px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
        ctxRound.fillText(text1 || "Stamp", 75, 70);
        
        ctxRound.font = "11px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
        ctxRound.fillText(text2 || "Approved", 75, 95);
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
      ctx.font = "bold 24px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
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
          const viewport = page.getViewport({ scale: 0.35 });
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
          const pixelRatio = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: (zoom / 100) * pixelRatio });
          if (!active) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / pixelRatio}px`;
          canvas.style.height = `${viewport.height / pixelRatio}px`;
          await page.render({ canvasContext: context, viewport }).promise;
        } catch (err) {
          console.error("SignEditor Page render error:", err);
        }
      }
      renderPage();
      return () => { active = false; };
    }
  }, [pdfDoc, currentPage, zoom, pageOrder, step]);

  // Track history for undo/redo
  useEffect(() => {
    if (isUndoingRedoing.current) {
      isUndoingRedoing.current = false;
      return;
    }
    const nextHistory = history.slice(0, historyIndex + 1);
    const currentElementsStr = JSON.stringify(elements);
    const lastHistoryStr = nextHistory.length > 0 ? JSON.stringify(nextHistory[nextHistory.length - 1]) : "";
    if (currentElementsStr !== lastHistoryStr) {
      nextHistory.push(elements);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  }, [elements]);

  const undo = () => {
    if (historyIndex > 0) {
      isUndoingRedoing.current = true;
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      isUndoingRedoing.current = true;
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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
    if (activeCursorTool === "hand") return; // Hand tool ignores element manipulation
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
      ctx.font = "bold 24px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
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
      ctx.font = "bold 24px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
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

  function addCheckmarkToPage() {
    const offscreen = document.createElement("canvas");
    offscreen.width = 60;
    offscreen.height = 60;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.font = "bold 44px 'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = signatureDetails.color;
      ctx.fillText("✓", 10, 48);
    }
    const newEl: OverlayElement = {
      id: "check-" + Date.now(),
      type: "signature",
      page: currentPage,
      x: 45,
      y: 45,
      width: 6,
      height: 6,
      dataUrl: offscreen.toDataURL()
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

  // Who-signs onboarding modal is now rendered as an overlay inside the main editor view

  // ── Step 1.5: Invite Sent Success view ──
  if (step === "invite-sent") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#f3f3f3",
        padding: "20px",
        fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", maxWidth: "500px", width: "100%", textAlign: "center", border: "1px solid #e6e6e6" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check size={32} />
          </div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "750", marginBottom: "12px", color: "#1b1b1b" }}>Signature Invitation Sent!</h3>
          <p style={{ fontSize: "0.82rem", color: "#5d5f5f", marginBottom: "24px" }}>We have sent a signing request email to <strong>{emailInvites[0]}</strong> to review and electronically sign this document.</p>
          <button 
            onClick={onClose}
            className="primary-button"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Main Editor Workspace View ──
  const toolbarButtonStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--c-bg, #ffffff)",
    color: "var(--c-text, #1e293b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
    padding: 0
  };

  const zoomButtonStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    border: "1px solid var(--border, #cbd5e1)",
    background: "var(--c-bg, #ffffff)",
    color: "var(--c-text, #1e293b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold" as const,
    padding: 0
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      backgroundColor: "var(--c-bg, #ffffff)",
      fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* ── TOP TOOLBAR ── */}
      <div style={{
        height: "56px",
        width: "100%",
        backgroundColor: "var(--c-bg, #ffffff)",
        borderBottom: "1px solid var(--border, #cbd5e1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxSizing: "border-box",
        flexShrink: 0
      }}>
        {/* Left Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid var(--border, #cbd5e1)",
              backgroundColor: showLeftSidebar ? "var(--c-surface, #f1f5f9)" : "var(--c-bg, #ffffff)",
              color: "var(--c-text, #1e293b)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
            title="Toggle Sidebar Pages"
          >
            <FolderKanban size={16} />
          </button>
          
          <div style={{ display: "flex", borderRadius: "6px", border: "1px solid var(--border, #cbd5e1)", overflow: "hidden" }}>
            <button 
              onClick={() => setActiveCursorTool("hand")}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: activeCursorTool === "hand" ? "var(--c-surface, #f1f5f9)" : "var(--c-bg, #ffffff)",
                color: "var(--c-text, #1e293b)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Pan Hand Tool"
            >
              <Hand size={14} />
            </button>
            <button 
              onClick={() => setActiveCursorTool("pointer")}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: activeCursorTool === "pointer" ? "var(--c-surface, #f1f5f9)" : "var(--c-bg, #ffffff)",
                color: "var(--c-text, #1e293b)",
                cursor: "pointer",
                borderLeft: "1px solid var(--border, #cbd5e1)",
                display: "flex",
                alignItems: "center"
              }}
              title="Select / Drag Tool"
            >
              <MousePointer size={14} />
            </button>
          </div>
        </div>

        {/* Center Quick Insertion Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={() => { setModalSection("signature"); setSigMethod("type"); setShowDetailsModal(true); }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid var(--border, #cbd5e1)",
              backgroundColor: "var(--c-bg, #ffffff)",
              color: "var(--c-text, #1e293b)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            <PenTool size={14} />
            <span>Signatures</span>
            <ChevronDown size={12} />
          </button>

          <button 
            onClick={() => {
              const email = prompt("Enter signer email address:");
              if (email) {
                setEmailInvites([email]);
                setStep("invite-sent");
              }
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid var(--border, #cbd5e1)",
              backgroundColor: "var(--c-bg, #ffffff)",
              color: "var(--c-text, #1e293b)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            <Users size={14} />
            <span>Add signees</span>
          </button>

          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border, #cbd5e1)" }} />

          <button onClick={addDateToPage} style={toolbarButtonStyle} title="Add Date Stamp"><Calendar size={15} /></button>
          <button onClick={addTextToPage} style={toolbarButtonStyle} title="Add Text"><Type size={15} /></button>
          <button onClick={addCheckmarkToPage} style={toolbarButtonStyle} title="Add Checkmark"><Check size={15} /></button>

          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border, #cbd5e1)" }} />

          <button onClick={undo} disabled={!canUndo} style={{ ...toolbarButtonStyle, opacity: canUndo ? 1 : 0.4, cursor: canUndo ? "pointer" : "not-allowed" }} title="Undo"><Undo size={14} /></button>
          <button onClick={redo} disabled={!canRedo} style={{ ...toolbarButtonStyle, opacity: canRedo ? 1 : 0.4, cursor: canRedo ? "pointer" : "not-allowed" }} title="Redo"><Redo size={14} /></button>
        </div>

        {/* Right Zoom and Completion Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={zoomButtonStyle}>-</button>
            <span style={{ fontSize: "12px", minWidth: "36px", textAlign: "center", color: "var(--c-text)" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={zoomButtonStyle}>+</button>
          </div>

          <button 
            onClick={handleSignComplete}
            className="v2-pill-primary"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            Finish &rarr;
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE BODY ── */}
      <div style={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "calc(100% - 56px)",
        overflow: "hidden"
      }}>
        {/* Left Sidebar: Pages List */}
        {showLeftSidebar && (
          <div style={{
            width: "180px",
            backgroundColor: "var(--c-bg, #ffffff)",
            borderRight: "1px solid var(--border, #cbd5e1)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexShrink: 0
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #cbd5e1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--c-text)", letterSpacing: "0.03em" }}>PAGES</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{currentPage} / {totalPages || 1}</span>
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
                      border: `2px solid ${isActive ? "var(--c-accent, #2563eb)" : "transparent"}`,
                      padding: "4px",
                      cursor: "pointer",
                      backgroundColor: isActive ? "var(--c-surface-soft, #f8fafc)" : "transparent",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{
                      width: "100%",
                      aspectRatio: "0.75",
                      background: "#ffffff",
                      border: "1px solid var(--border, #cbd5e1)",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden"
                    }}>
                      {thumbnails[pageNum - 1] ? (
                        <img src={thumbnails[pageNum - 1]} style={{ width: "90%", height: "90%", objectFit: "contain" }} alt={`Page ${pageNum}`} />
                      ) : (
                        <FileText size={20} style={{ color: "var(--text-muted, #94a3b8)" }} />
                      )}
                    </div>
                    <div style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: "600", color: "var(--c-text)", marginTop: "4px" }}>Page {pageNum}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Center Canvas Workspace Viewport */}
        <div style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          position: "relative",
          backgroundColor: "var(--c-bg-page, #f8fafc)",
          cursor: activeCursorTool === "hand" ? "grab" : "default"
        }}>
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
              border: "1px solid var(--border, #cbd5e1)"
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
                    border: isSel ? "1.5px dashed var(--c-accent, #2563eb)" : "1.5px solid transparent",
                    cursor: activeCursorTool === "hand" ? "grab" : "move",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onClick={e => { e.stopPropagation(); if (activeCursorTool !== "hand") setSelectedElementId(el.id); }}
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
                        fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif",
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
        <div 
          className="workspace-sidebar"
          style={{
            width: "320px",
            background: "var(--c-surface, #f8fafc)",
            borderLeft: "1px solid var(--border, #cbd5e1)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            flexShrink: 0
          }}
        >
          {/* Header section with back button */}
          <div style={{ padding: "24px 24px 12px" }}>
            <button 
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "0",
                marginBottom: "8px",
                textAlign: "left",
                fontFamily: "inherit"
              }}
            >
              <ChevronLeft size={12} /> Sign PDF
            </button>
            <h3 className="sidebar-heading" style={{ padding: 0, margin: 0, color: "var(--c-text)" }}>
              Signing options
            </h3>
          </div>

          {/* Section: Type */}
          <div className="options-group" style={{ marginBottom: "20px", padding: "0 24px" }}>
            <label className="options-label" style={{ color: "var(--c-text)", fontWeight: "600" }}>Type</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <div style={{
                flex: 1,
                backgroundColor: "var(--c-bg, #ffffff)",
                border: "2px solid var(--c-accent, #2563eb)",
                borderRadius: "8px",
                padding: "10px 6px",
                textAlign: "center",
                cursor: "pointer"
              }}>
                <span style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--c-text)" }}>Simple</span>
                <span style={{ display: "block", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>Signature</span>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                border: "1px solid var(--border, #cbd5e1)",
                borderRadius: "8px",
                padding: "10px 6px",
                textAlign: "center",
                opacity: 0.6,
                cursor: "not-allowed"
              }}>
                <span style={{ display: "flex", fontSize: "0.78rem", fontWeight: "600", color: "var(--c-text)", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  Digital <Crown size={12} style={{ color: "#f59e0b" }} />
                </span>
                <span style={{ display: "block", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>Cryptographic</span>
              </div>
            </div>
          </div>

          {/* Section: Required fields */}
          <div className="options-group" style={{ marginBottom: "20px", padding: "0 24px" }}>
            <label className="options-label" style={{ color: "var(--c-text)", fontWeight: "600" }}>Required Fields</label>
            <div className="options-vertical-list" style={{ marginTop: "4px" }}>
              <div 
                onClick={addSignatureToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {/* Drag handles */}
                <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
                
                {/* Left icon wrapper */}
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "var(--c-accent, #2563eb)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <PenTool size={14} />
                </div>
                
                {/* Preview Box */}
                <div style={{
                  flex: 1,
                  border: "1px dashed var(--border, #cbd5e1)",
                  borderRadius: "4px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--c-surface, #f8fafc)",
                  overflow: "hidden",
                  padding: "2px"
                }}>
                  {signatureDetails.signatureDataUrl ? (
                    <img src={signatureDetails.signatureDataUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Signature" />
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Set signature</span>
                  )}
                </div>

                {/* Edit button */}
                <button 
                  onClick={e => { e.stopPropagation(); setModalSection("signature"); setSigMethod("type"); setShowDetailsModal(true); }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-soft, rgba(0,0,0,0.05))"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Edit2 size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Optional fields */}
          <div className="options-group" style={{ flex: 1, overflowY: "auto", marginBottom: "20px", padding: "0 24px" }}>
            <label className="options-label" style={{ color: "var(--c-text)", fontWeight: "600" }}>Optional Fields</label>
            <div className="options-vertical-list" style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
              
              {/* 1. Initials Card */}
              <div 
                onClick={addInitialsToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
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
                  fontSize: "0.74rem",
                  flexShrink: 0
                }}>
                  AC
                </div>
                <div style={{
                  flex: 1,
                  border: "1px dashed var(--border, #cbd5e1)",
                  borderRadius: "4px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--c-surface, #f8fafc)",
                  overflow: "hidden",
                  padding: "2px"
                }}>
                  {signatureDetails.initialsDataUrl ? (
                    <img src={signatureDetails.initialsDataUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} alt="Initials" />
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Set initials</span>
                  )}
                </div>
                <button 
                  onClick={e => { e.stopPropagation(); setModalSection("initials"); setInitMethod("type"); setShowDetailsModal(true); }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-soft, rgba(0,0,0,0.05))"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Edit2 size={13} />
                </button>
              </div>

              {/* 2. Full Name Card */}
              <div 
                onClick={addNameToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
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
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <User size={14} />
                </div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "var(--c-text)" }}>
                  Full Name
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", paddingRight: "4px" }}>+</span>
              </div>

              {/* 3. Date Stamp Card */}
              <div 
                onClick={addDateToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
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
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Calendar size={14} />
                </div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "var(--c-text)" }}>
                  Date Stamp
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", paddingRight: "4px" }}>+</span>
              </div>

              {/* 4. Text Card */}
              <div 
                onClick={addTextToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
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
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Type size={14} />
                </div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "var(--c-text)" }}>
                  Text
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", paddingRight: "4px" }}>+</span>
              </div>

              {/* 5. Company Stamp Card */}
              <div 
                onClick={addStampToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
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
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Stamp size={14} />
                </div>
                <div style={{
                  flex: 1,
                  border: signatureDetails.stampDataUrl ? "1px dashed var(--border, #cbd5e1)" : "none",
                  borderRadius: "4px",
                  height: signatureDetails.stampDataUrl ? "36px" : "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: signatureDetails.stampDataUrl ? "var(--c-surface, #f8fafc)" : "transparent",
                  overflow: "hidden",
                  padding: signatureDetails.stampDataUrl ? "2px" : "0",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  color: "var(--c-text)",
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
                    color: "var(--text-muted)",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-soft, rgba(0,0,0,0.05))"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Edit2 size={13} />
                </button>
              </div>

              {/* 6. Checkbox Card */}
              <div 
                onClick={addCheckmarkToPage}
                className="option-card"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--c-bg, #ffffff)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Check size={14} />
                </div>
                <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: "600", color: "var(--c-text)" }}>
                  Checkbox / Tick
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", paddingRight: "4px" }}>+</span>
              </div>

            </div>
          </div>

          {/* Sign Bottom Button */}
          <div style={{ padding: "16px 24px 24px", flexShrink: 0 }}>
            <button 
              onClick={handleSignComplete}
              className="v2-pill-primary"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>Sign PDF</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
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
                      padding: "6px 16px",
                      borderRadius: "9999px",
                      border: "1px solid var(--s-hairline)",
                      background: "transparent",
                      color: "var(--s-on-surface-variant)",
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
                      padding: "6px 18px",
                      borderRadius: "9999px",
                      border: "none",
                      background: "var(--s-primary)",
                      color: "var(--s-on-primary)",
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

      {/* ── ONBOARDING OVERLAY MODAL ── */}
      {onboardingModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "24px",
          boxSizing: "border-box"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            width: "100%",
            maxWidth: "580px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setOnboardingModal(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(241, 245, 249, 0.8)",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e2e8f0"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(241, 245, 249, 0.8)"}
              title="Skip and go to editor"
            >
              <X size={15} />
            </button>

            {/* Email Invite input mode vs Main Option cards Selection mode */}
            {emailInputMode ? (
              <div style={{ padding: "40px" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Users size={24} />
                  </div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
                    Get Signatures from Others
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                    Enter the email address of the person you'd like to request a signature from.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (inviteEmail.trim()) {
                    setEmailInvites([inviteEmail.trim()]);
                    setStep("invite-sent");
                    setEmailInputMode(false);
                    setOnboardingModal(null);
                  }
                }}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "0.74rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Signer Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., signer@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        outline: "none",
                        transition: "all 0.2s"
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--c-accent, #2563eb)"}
                      onBlur={e => e.currentTarget.style.borderColor = "#cbd5e1"}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setEmailInputMode(false)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "9999px",
                        border: "1px solid #cbd5e1",
                        background: "transparent",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 2,
                        padding: "12px",
                        borderRadius: "9999px",
                        border: "none",
                        background: "var(--c-accent, #2563eb)",
                        color: "#ffffff",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Send Signature Invite
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ padding: "40px" }}>
                {onboardingModal === "who-signs" ? (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                      <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
                        Choose who's signing
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                        Select the signing option that fits your document needs.
                      </p>
                    </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Option 1: Sign myself */}
                        <div
                          onClick={() => setOnboardingModal("sealing-type")}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            backgroundColor: "#ffffff",
                            overflow: "hidden",
                            height: "100%",
                            boxSizing: "border-box",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "var(--c-accent, #2563eb)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 10px 20px -10px rgba(37, 99, 235, 0.15)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                          }}
                        >
                          <div style={{
                            height: "140px",
                            backgroundColor: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "16px"
                          }}>
                            <img 
                              src="/sign_myself.png" 
                              alt="Sign Myself" 
                              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} 
                            />
                          </div>
                          <div style={{ padding: "20px" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "#0f172a", margin: "0 0 8px 0" }}>
                              Sign myself
                            </h3>
                            <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: "1.45" }}>
                              I want to place my own signatures, text, dates, or checkboxes.
                            </p>
                          </div>
                        </div>

                        {/* Option 2: Get signatures from others */}
                        <div
                          onClick={() => setEmailInputMode(true)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            backgroundColor: "#ffffff",
                            overflow: "hidden",
                            height: "100%",
                            boxSizing: "border-box",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "var(--c-accent, #2563eb)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 10px 20px -10px rgba(37, 99, 235, 0.15)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                          }}
                        >
                          <div style={{
                            height: "140px",
                            backgroundColor: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "16px"
                          }}>
                            <img 
                              src="/sign_others.png" 
                              alt="Get Signatures from Others" 
                              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} 
                            />
                          </div>
                          <div style={{ padding: "20px" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "#0f172a", margin: "0 0 8px 0" }}>
                              Get signatures from others
                            </h3>
                            <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: "1.45" }}>
                              Send invitation requests to other users to sign via email.
                            </p>
                          </div>
                        </div>
                      </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                      <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
                        Choose sealing type
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                        Select the type of seal or verification you'd like to apply.
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {/* Option 1: Simple seal */}
                      <div
                        onClick={() => setOnboardingModal(null)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "24px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          backgroundColor: "#ffffff",
                          height: "100%",
                          boxSizing: "border-box"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "var(--c-accent, #2563eb)";
                          e.currentTarget.style.backgroundColor = "var(--c-surface-soft, #f8fafc)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        <div style={{ marginBottom: "16px" }}>
                          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#f0fdf4"/>
                            <rect x="15" y="11" width="18" height="26" rx="3" stroke="#22c55e" strokeWidth="2.5"/>
                            <path d="M20 24L23 27L28 21" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "#0f172a", margin: "0 0 8px 0" }}>
                            Sign without a seal
                          </h3>
                          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: "1.45" }}>
                            Apply a standard, non-certified electronic signature. Ideal for quick approvals.
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Digital seal (Premium) */}
                      <div
                        onClick={() => setShowPremiumWarning(true)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "24px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          backgroundColor: "#ffffff",
                          position: "relative",
                          height: "100%",
                          boxSizing: "border-box"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#f59e0b";
                          e.currentTarget.style.backgroundColor = "#fffde6";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        <span style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          backgroundColor: "#fff3c4",
                          color: "#b45309",
                          fontSize: "0.62rem",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "9999px",
                          border: "1px solid #fcd34d",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em"
                        }}>
                          Premium <Crown size={10} style={{ fill: "currentColor" }} />
                        </span>
                        
                        <div style={{ marginBottom: "16px" }}>
                          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#fffbeb"/>
                            <circle cx="24" cy="19" r="7" stroke="#f59e0b" strokeWidth="2.5"/>
                            <path d="M19 25L17 35L24 32L31 35L29 25" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 18L23 20L27 16" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize: "0.95rem", fontWeight: "750", color: "#0f172a", margin: "0 0 8px 0" }}>
                            Sign with digital seal
                          </h3>
                          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: "1.45" }}>
                            Add a cryptographic, tamper-proof seal containing verification certificates.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setOnboardingModal("who-signs")}
                      style={{
                        marginTop: "24px",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginRight: "auto",
                        padding: 0
                      }}
                    >
                      &larr; Back to sign options
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PREMIUM UPSELL WARNING OVERLAY ── */}
      {showPremiumWarning && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "24px",
          boxSizing: "border-box"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            width: "100%",
            maxWidth: "500px",
            padding: "40px",
            textAlign: "center",
            boxSizing: "border-box",
            position: "relative"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Crown size={28} style={{ fill: "currentColor" }} />
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
              Unlock Digital Seals with Premium
            </h3>
            
            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5", marginBottom: "24px" }}>
              Cryptographic digital seals are legally-binding certificates that ensure your document cannot be altered after signing. Secure your workflows with professional credentials.
            </p>

            <div style={{
              textAlign: "left",
              backgroundColor: "var(--c-surface-soft, #f8fafc)",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "28px",
              border: "1px solid #e2e8f0"
            }}>
              <h4 style={{ fontSize: "0.78rem", fontWeight: "750", color: "#475569", margin: "0 0 10px 0", textTransform: "uppercase" }}>
                Included in Premium:
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "0.8rem", color: "#475569", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={14} style={{ color: "#d97706", flexShrink: 0 }} /> Legally compliant cryptographic signatures
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PenTool size={14} style={{ color: "#d97706", flexShrink: 0 }} /> Access to signature drawing pads, stamp templates
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database size={14} style={{ color: "#d97706", flexShrink: 0 }} /> Secure, unlimited document backup & history log
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={14} style={{ color: "#d97706", flexShrink: 0 }} /> Priority processing speeds
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowPremiumWarning(false);
                  setOnboardingModal(null); // Bypass warning and enter editor
                }}
                className="v2-pill-primary"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "700"
                }}
              >
                Try Premium Free for 7 Days
              </button>

              <button
                onClick={() => {
                  setShowPremiumWarning(false);
                  setOnboardingModal(null); // Continue to editor without premium
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#64748b",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
              >
                Continue with simple signature instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
