/**
 * Utility to load and retrieve the PDF.js library asynchronously.
 * This guarantees the library is available on `window` even if it loads
 * after components are mounted, preventing "PDFJS library not loaded" errors.
 */

let loadingPromise: Promise<any> | null = null;

export function getPdfjsLib(): Promise<any> {
  if ((window as any).pdfjsLib) {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    }
    return Promise.resolve(pdfjsLib);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if the script is already added in index.html
    let script = document.querySelector('script[src="/pdf.min.js"]') as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.src = "/pdf.min.js";
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        clearInterval(checkInterval);
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        resolve(lib);
      }
    }, 50);

    const onLoad = () => {
      clearInterval(checkInterval);
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdfjsLib not found on window after script load"));
      }
    };

    const onError = () => {
      clearInterval(checkInterval);
      reject(new Error("Failed to load PDFJS script"));
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("Timeout waiting for pdfjsLib to load"));
      }
    }, 10000);
  });

  return loadingPromise;
}
