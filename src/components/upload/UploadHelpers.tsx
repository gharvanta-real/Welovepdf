import React from "react";

export const processingSteps = [
  "Uploading your files safely...",
  "Reading the document layout...",
  "Working our magic on the pages...",
  "Double-checking formatting and details...",
  "Putting the final touches on your document...",
  "Wrapping up and generating your download link..."
];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getAcceptAttribute(tool: string): string {
  const t = tool.toLowerCase();
  if (t === "word to pdf") return ".docx,.doc";
  if (t === "excel to pdf") return ".xlsx,.xls";
  if (t === "ppt to pdf") return ".pptx,.ppt";
  if (t === "jpg to pdf") return "image/*";
  if (t === "html to pdf") return ".html,.htm";
  if (t === "txt to pdf") return ".txt";
  return ".pdf";
}

// Get block color per tool for Stitch design hero
export function getToolBlockColor(tool: string): string {
  const t = tool.toLowerCase();
  if (t === "watermark pdf") return "#D6C4FF"; // lilac
  if (t === "crop pdf") return "#FFC7C2"; // pink
  if (t === "page numbers") return "#A9DEF9"; // sky blue
  if (t === "bates numbering") return "#ADEFD1"; // mint
  if (t.includes("merge")) return "#D6C4FF"; // lilac
  if (t.includes("split")) return "#FFBDAE"; // coral
  if (t.includes("compress")) return "#FFC7C2"; // pink
  if (t.includes("sign") || t.includes("esign")) return "#ADEFD1"; // mint
  if (t.includes("rotate") || t.includes("organize")) return "#D3F57B"; // lime
  if (t.includes("watermark") || t.includes("annotate")) return "#D6C4FF"; // lilac
  if (t.includes("protect") || t.includes("password")) return "#ADEFD1"; // mint
  if (t.includes("unlock")) return "#FFC7C2"; // pink
  if (t.includes("word") || t.includes("excel") || t.includes("ppt")) return "#D3F57B"; // lime
  if (t.includes("jpg") || t.includes("image")) return "#FFC7C2"; // pink
  if (t.includes("ocr") || t.includes("translate") || t.includes("summarize") || t.includes("copilot")) return "#ADEFD1"; // mint
  if (t.includes("extract") || t.includes("remove") || t.includes("page")) return "#FFBDAE"; // coral
  if (t.includes("bates") || t.includes("number") || t.includes("crop")) return "#D3F57B"; // lime
  if (t.includes("flatten") || t.includes("repair")) return "#FFF9E5"; // cream
  return "#D6C4FF"; // lilac default
}

export function getToolHeroDescription(tool: string): string {
  const t = tool.toLowerCase();
  if (t.includes("merge")) return "Put your PDFs together in the exact order you want. It takes just a few seconds.";
  if (t.includes("split")) return "Save only the pages you need, or split a large document into separate files.";
  if (t.includes("compress")) return "Make your PDF file size smaller so it's easier to share, without ruining the quality.";
  if (t.includes("sign")) return "Quickly sign your PDFs online with a digital signature that looks clean and professional.";
  if (t.includes("rotate")) return "Fix upside-down pages by rotating individual sheets or the whole document.";
  if (t.includes("organize")) return "Drag and drop your pages to reorder them exactly how you need.";
  if (t.includes("watermark")) return "Add a custom text stamp or image overlay to protect your files.";
  if (t.includes("annotate")) return "Highlight text, write notes, and draw on your PDF right in your browser.";
  if (t.includes("protect")) return "Lock your PDF with a secure password so only the right people can read it.";
  if (t.includes("unlock")) return "Remove password locks from your PDFs so you can open them instantly.";
  if (t.includes("word")) return "Convert your Word documents to PDF format while keeping all layouts intact.";
  if (t.includes("excel")) return "Turn your spreadsheets into clean, printable PDFs with all columns aligned.";
  if (t.includes("ppt")) return "Save your slide decks as easy-to-share PDFs.";
  if (t.includes("jpg")) return "Convert your photos, scans, and drawings into a single clean PDF.";
  if (t.includes("ocr")) return "Make scanned documents searchable by extracting text from images.";
  if (t.includes("translate")) return "Translate your PDF into other languages while keeping the original layout.";
  if (t.includes("summarize")) return "Get a quick summary of a long PDF to find the main points in seconds.";
  if (t.includes("extract")) return "Choose and save only the pages you want to keep in a new file.";
  if (t.includes("remove")) return "Delete pages you don't need to clean up your document.";
  if (t.includes("crop")) return "Trim margins and crop pages to focus on the important content.";
  if (t.includes("flatten")) return "Flatten interactive forms and checkmarks so they cannot be edited.";
  if (t.includes("repair")) return "Fix broken or corrupted PDF files to recover your text and images.";
  if (t.includes("copilot")) return "Chat with your PDF to ask questions and get instant answers about its content.";
  return "Fast, free, and secure PDF tools that run right in your browser.";
}

export function getToolEyebrow(tool: string): string {
  const t = tool.toLowerCase();
  if (t.includes("merge") || t.includes("split") || t.includes("compress") || t.includes("rotate") || t.includes("organize") || t.includes("extract") || t.includes("remove")) {
    return "PDF Tools / " + tool.replace(" PDF", "").replace("PDF ", "");
  }
  if (t.includes("word") || t.includes("excel") || t.includes("ppt") || t.includes("jpg") || t.includes("html") || t.includes("txt")) {
    return "Convert / " + tool;
  }
  if (t.includes("sign") || t.includes("protect") || t.includes("unlock") || t.includes("watermark")) {
    return "Security / " + tool.replace(" PDF", "");
  }
  if (t.includes("ocr") || t.includes("translate") || t.includes("summarize") || t.includes("copilot") || t.includes("annotate")) {
    return "AI Tools / " + tool.replace(" PDF", "");
  }
  return "PDF Tools / " + tool.replace(" PDF", "");
}

export function getToolFeatures(tool: string): { icon: string; title: string; desc: string; color: string }[] {
  const t = tool.toLowerCase();
  const base = [
    { icon: "🛡️", title: "Safe & Secure", desc: "Your files are safe with us. We process documents in your browser when possible, and delete everything else right away.", color: "#ADEFD1" },
    { icon: "⚡", title: "Instant Results", desc: "No waiting around. We process your documents in seconds, even large files.", color: "#FFC7C2" },
    { icon: "✨", title: "Perfect Quality", desc: "Your texts, layouts, and images will look exactly as they did before.", color: "#D3F57B" }
  ];
  if (t.includes("merge")) return [
    { icon: "🛡️", title: "Private & Secure", desc: "Everything is private. Your uploaded files are deleted from our servers automatically.", color: "#ADEFD1" },
    { icon: "⚡", title: "Done in Seconds", desc: "We merge all your files instantly.", color: "#FFC7C2" },
    { icon: "🌍", title: "Works Anywhere", desc: "Works on your phone, tablet, or computer.", color: "#D3F57B" }
  ];
  if (t.includes("split")) return [
    { icon: "🛡️", title: "Private & Secure", desc: "Files are handled in your browser or deleted instantly.", color: "#ADEFD1" },
    { icon: "⚡", title: "Split Instantly", desc: "We chop up your document in the blink of an eye.", color: "#FFC7C2" },
    { icon: "🎯", title: "Layouts Kept", desc: "No fonts or formatting will break.", color: "#D3F57B" }
  ];
  if (t.includes("compress")) return [
    { icon: "📦", title: "Smart Shrinking", desc: "It makes the file size smaller without making it look blurry.", color: "#ADEFD1" },
    { icon: "⚡", title: "Super Fast", desc: "Compress your file in a couple of clicks.", color: "#D3F57B" },
    { icon: "🔒", title: "Privacy First", desc: "We don't store your documents, they belong to you.", color: "#FFC7C2" }
  ];
  return base;
}

export function getToolIllustration(tool: string, blockColor: string): React.ReactElement {
  const t = tool.toLowerCase();
  if (t.includes("merge")) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: "160px", height: "210px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-8deg) translateX(-30px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
          <div style={{ width: "100%", height: "50%", background: "#f5f5f5", borderRadius: "6px" }}></div>
          <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "55%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
        <div style={{ position: "absolute", width: "160px", height: "210px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(4deg) translateX(30px) translateY(20px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px" }}>⊕</span>
            <span style={{ fontSize: "10px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace" }}>MERGED</span>
          </div>
          <div style={{ width: "100%", height: "40%", background: blockColor + "40", borderRadius: "6px", border: `2px dashed ${blockColor}` }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "66%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
      </div>
    );
  }
  if (t.includes("split")) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: "150px", height: "200px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-6deg) translateX(-25px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
          <div style={{ width: "100%", height: "50%", background: "#f5f5f5", borderRadius: "6px" }}></div>
          <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
        <div style={{ position: "absolute", width: "150px", height: "200px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(3deg) translateX(30px) translateY(15px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>✂️</span>
            <span style={{ fontSize: "9px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace" }}>PAGE 12-24</span>
          </div>
          <div style={{ width: "100%", height: "45%", background: blockColor + "40", borderRadius: "6px", border: `2px dashed ${blockColor}` }}></div>
          <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
          <div style={{ height: "6px", width: "66%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        </div>
      </div>
    );
  }
  // Generic illustration for other tools
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "155px", height: "205px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(-5deg) translateX(-20px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
        <div style={{ width: "100%", height: "48%", background: "#f5f5f5", borderRadius: "6px" }}></div>
        <div style={{ height: "6px", width: "75%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        <div style={{ height: "6px", width: "50%", background: "#E6E6E6", borderRadius: "99px" }}></div>
      </div>
      <div style={{ position: "absolute", width: "155px", height: "205px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "rotate(4deg) translateX(28px) translateY(18px)", display: "flex", flexDirection: "column", padding: "16px", gap: "8px", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "18px", filter: "grayscale(1)" }}>📄</span>
          <span style={{ fontSize: "9px", opacity: 0.4, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.5px" }}>OUTPUT</span>
        </div>
        <div style={{ width: "100%", height: "40%", background: blockColor + "50", borderRadius: "6px", border: `1.5px dashed ${blockColor}` }}></div>
        <div style={{ height: "6px", width: "100%", background: "#E6E6E6", borderRadius: "99px" }}></div>
        <div style={{ height: "6px", width: "70%", background: "#E6E6E6", borderRadius: "99px" }}></div>
      </div>
    </div>
  );
}
