/**
 * generate-seo.mts
 * =================
 * Post-build script that runs after `vite build`.
 *
 * What it does:
 *   1. Reads dist/index.html (compiled Vite output)
 *   2. For EVERY known route — tool pages AND static pages — it generates a
 *      separate dist/<route>/index.html with:
 *        • Unique <title>
 *        • Unique <meta name="description">
 *        • <link rel="canonical">
 *        • <meta property="og:*"> Open Graph tags
 *        • JSON-LD schemas (SoftwareApplication, HowTo, FAQPage)
 *        • Fully visible H1 + intro + steps + FAQs + body text in the #root div
 *          so Googlebot sees real text BEFORE JavaScript executes
 *   3. Writes dist/sitemap.xml with all public routes
 *   4. Pre-renders RICH content for ALL static pages (privacy, terms, faq,
 *      about, security, file-privacy, data-deletion, pricing) — not empty shells.
 *      This is critical for Google AdSense "thin content" approval.
 *
 * Run: node --loader ts-node/esm scripts/generate-seo.mts
 * OR via package.json "build" script (using tsx)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const DOMAIN = "https://pdfmount.online";

// ─────────────────────────────────────────────────────────────────────────────
// 1.  COMPLETE SEO DATA  (mirrors src/data/seoPages.ts — kept in sync here)
// ─────────────────────────────────────────────────────────────────────────────
interface SeoPage {
  title: string;
  desc: string;
  h1: string;
  intro: string;
  steps: string[];
  faqs: { q: string; a: string }[];
  detailedContent: string[];
}

const seoPages: Record<string, SeoPage> = {
  merge: {
    title: "Merge PDF Online - Combine Multiple PDF Files Free | PDFMount",
    desc: "Combine multiple PDF files into one single document online. Quick, secure, and no installation required. Merge PDF files free without watermark.",
    h1: "Merge PDF Files Online",
    intro: "Streamline document organization by combining multiple PDF files into one clean, consolidated document. PDFMount's online merging engine operates inside your browser, processing files via secure, isolated server nodes. Our technology ensures that fonts, formatting coordinates, and image resolutions are preserved, avoiding the typical formatting loss found in standard online converters. Keep all files organized in one place for easier distribution. The tool is designed to work on any modern browser without software installations.",
    steps: [
      "Drag and drop the multiple PDF documents you want to combine into the secure upload zone above.",
      "Rearrange the order of the uploaded files by dragging the visual cards left or right in the preview grid.",
      "Select page ranges for individual files if you only want to merge specific sections of a document.",
      "Click the 'Start' button to execute the high-speed stream concatenation process on our secure servers.",
      "Download your merged PDF file instantly, featuring clean vector paths and zero added watermarks."
    ],
    faqs: [
      {
        q: "How many files can I combine at once, and what are the size limits?",
        a: "Guest users can combine up to 5 files with a maximum size limit of 25 MB per file. Free registered accounts can upload files up to 50 MB each, while Pro subscribers can combine up to 100 documents of up to 500 MB per file. The merging system processes tasks quickly, handling even large files in under ten seconds."
      },
      {
        q: "Will the formatting, links, and text formatting be preserved in the merged file?",
        a: "Yes. Our engine performs binary stream concatenation rather than converting pages into images. This preserves all text vectors, internal links, bookmarks, forms, and custom formatting. Your text remains searchable, and graphics stay sharp regardless of zoom level."
      },
      {
        q: "Does PDFMount add a watermark or brand logo to the output document?",
        a: "No. All tools on PDFMount are free of watermarks. The output PDF remains clean and professional, matching the quality of the original input files. There are no restrictions or logos placed on your pages."
      },
      {
        q: "Can I merge password-protected or restricted PDF files?",
        a: "No. If a document is protected by an open password or has edit restrictions, you must unlock it first. Use the Unlock tool to remove these restriction flags before uploading them to the merging tool."
      },
      {
        q: "Is it safe to merge confidential business documents on this platform?",
        a: "Yes, data security is guaranteed. We process files in isolated sandbox environments with TLS 1.3 encryption for all transfers. Our automated system purges all files from our temporary cache exactly 60 minutes after processing, ensuring your documents remain private."
      }
    ],
    detailedContent: [
      "Combining reports, coursework, or invoices manually is slow and prone to errors. Our online merging engine provides a high-fidelity workspace where pages from multiple documents are joined without rasterizing text or compressing vectors, keeping your fonts and layouts razor-sharp.",
      "PDFMount's interface lets you visually drag and drop files to rearrange page orders before compiling. This gives you complete control over the final structure of your document, preventing page ordering mistakes before they happen.",
      "The platform is fully compliant with modern security standards. We do not read, view, or retain your files. Once the 60-minute automatic deletion script runs, your data is gone forever, making PDFMount a safe choice for enterprise-level operations."
    ]
  },
  split: {
    title: "Split PDF - Extract Pages from PDF Free | PDFMount",
    desc: "Separate pages from your PDF file into clean, standalone documents. Define custom page ranges and extract pages from PDF online instantly.",
    h1: "Split PDF Online by Page Ranges",
    intro: "Divide large PDF files into smaller, manageable documents with our precise online splitting tool. PDFMount lets you extract specific page ranges or split entire files into separate single-page documents. The splitting engine runs in secure, isolated server containers, maintaining layout parameters, form fields, and text fonts. This is ideal for extracting chapters, invoices, or specific contract pages without installing software.",
    steps: [
      "Select and upload the PDF file you want to split from your computer or mobile device.",
      "Input custom page ranges (e.g. 1-5, 8, 12-15) or select pages visually in the grid to define split points.",
      "Choose whether to compile all selected pages into a single file or extract each page as a separate document.",
      "Click the 'Start' button to execute the layout partitioning process on our high-speed server nodes.",
      "Download your split documents instantly, saved in a clean ZIP archive for easy sharing."
    ],
    faqs: [
      {
        q: "What are the file size and page count limits for splitting PDFs?",
        a: "Guest users can upload files up to 25 MB, while registered free users can split files up to 50 MB. Pro tier members enjoy a limit of 500 MB per file and can extract thousands of pages in a single run. The system processes these large files in seconds without memory limits."
      },
      {
        q: "Can I extract specific non-consecutive pages from my PDF?",
        a: "Yes. You can extract pages by entering comma-separated page numbers (e.g. 1, 4, 7) or custom ranges (e.g. 1-3, 5-9) in the options panel. The splitting engine will isolate only those pages and compile them into a new file."
      },
      {
        q: "Will the output documents retain links, interactive form fields, and fonts?",
        a: "Yes. The splitting process isolates the pages while keeping all page structures, interactive links, annotations, and embedded fonts intact. The text remains fully searchable, and interactive form fields remain active."
      },
      {
        q: "Can I split encrypted or password-protected PDF files?",
        a: "No. If a document is protected by an open password or has edit restrictions, you must unlock it first. Use the Unlock tool to remove these restriction flags before uploading them to the splitting tool."
      },
      {
        q: "How secure is my split document on PDFMount?",
        a: "We prioritize user privacy. File transfers are protected by TLS 1.3 protocols. All files are processed in volatile, isolated server environments. Our automated system wipes all temp data and output files exactly 60 minutes after processing, preventing any third-party access."
      }
    ],
    detailedContent: [
      "Large documents can be slow to email and hard to navigate. By splitting your PDF, you can discard redundant sections and focus solely on the critical pages. Our split engine preserves form fields, annotations, and metadata in the extracted ranges, ensuring no structural data is lost.",
      "This tool is highly optimized for lawyers, accountants, and administrators who frequently need to extract single pages or specific chapters from large contracts or financial statements.",
      "The platform is fully compliant with modern security standards. We do not read, view, or retain your files. Once the 60-minute automatic deletion script runs, your data is gone forever, making PDFMount a safe choice for enterprise-level operations."
    ]
  },
  compress: {
    title: "Compress PDF - Reduce PDF File Size Online Free | PDFMount",
    desc: "Reduce the size of your PDF files online without losing visual quality. Compress PDFs under 100KB for easy email sharing and upload forms.",
    h1: "Compress PDF Document Size Online",
    intro: "Reduce the file size of your PDF documents online without compromising visual quality. PDFMount's compression tool uses intelligent algorithms to scale down high-resolution images, flatten font subsets, and remove redundant metadata structures. This ensures that your text remains sharp and readable while making files small enough for email attachments and government upload portals. The compression process runs entirely on secure, isolated servers.",
    steps: [
      "Upload the PDF document you want to optimize from your computer or mobile storage.",
      "Select your preferred compression level: Recommended (best balance), Extreme (smallest size), or Less (highest quality).",
      "Click the 'Start' button to execute the image optimization and stream compression algorithms.",
      "Wait for the engine to compile the optimized file, showing the percentage of file size saved.",
      "Download your compressed PDF file instantly, keeping layouts and vectors sharp."
    ],
    faqs: [
      {
        q: "What are the file size limits and tool quotas for compression?",
        a: "Guest users can compress files up to 25 MB, while registered free users can optimize files up to 50 MB. Pro tier members can upload large files up to 500 MB. Users are allowed up to 10 compression tasks per day on the free plans, and 100 on the Pro plan."
      },
      {
        q: "Will my images and text lose quality during the compression process?",
        a: "The 'Recommended Compression' setting uses a smart downsampling algorithm that maintains 150 DPI resolution for images, which is perfect for screens and standard printing. Text lines, vectors, and layouts are preserved, ensuring high readability."
      },
      {
        q: "How can I reduce a PDF file to under 100KB?",
        a: "To shrink your PDF to under 100KB, choose the 'Extreme Compression' setting. This setting downsamples images to 72 DPI and cleans up non-essential formatting data, which is ideal for basic text sheets and scanned forms."
      },
      {
        q: "Can I compress password-protected or restricted PDF files?",
        a: "No. If a document is protected by an open password or has edit restrictions, you must unlock it first. Use the Unlock tool to remove these restriction flags before uploading them to the compression tool."
      },
      {
        q: "Is my confidential data safe during PDFMount's compression process?",
        a: "Yes. All file transfers are secured with TLS 1.3 encryption. The compression process is executed in isolated sandbox environments, and all uploaded documents and optimized outputs are permanently deleted from our cache after 60 minutes."
      }
    ],
    detailedContent: [
      "Many government portals, job application forms, and email clients enforce strict size limits. PDFMount's compression tool uses advanced algorithms to compress embedded images, remove redundant metadata, and clean up orphan streams without altering the actual content layout of your document.",
      "For professional portfolios and legal briefs, choose 'Less Compression' to keep image DPI high while stripping out underlying bloat, ensuring your files look crisp on any retina display.",
      "The platform is fully compliant with modern security standards. We do not read, view, or retain your files. Once the 60-minute automatic deletion script runs, your data is gone forever, making PDFMount a safe choice for enterprise-level operations."
    ]
  },
  "jpg-pdf": {
    title: "JPG to PDF Converter - Convert Images to PDF Online | PDFMount",
    desc: "Convert JPG, PNG, and image files to PDF documents online. Create clean, high-resolution PDF portfolios from your scanned documents.",
    h1: "Convert JPG Images to PDF online",
    intro: "Convert camera snapshots, scans, and graphic designs into a unified PDF document. PDFMount aligns margins and sizes for high-fidelity layouts.",
    steps: ["Select one or more JPG, PNG, or GIF image files.", "Adjust page orientation (portrait/landscape) and margins if needed.", "Click the 'Start' button to generate the PDF document.", "Download your compiled image portfolio."],
    faqs: [{ q: "Can I convert multiple JPGs into a single PDF?", a: "Yes. You can upload multiple images at once, rearrange them, and PDFMount will compile them into one multi-page PDF." }, { q: "Will my images be compressed during conversion?", a: "No. PDFMount embeds your images at their original resolutions, wrapping them securely in standard PDF vectors to preserve details." }],
    detailedContent: ["Converting scans of PAN cards, Aadhars, receipts, or contracts into a single PDF makes them easy to print and store.", "This tool supports PNG, BMP, GIF, and WebP, rendering them in standard PDF pages suitable for official application portals."],
  },
  "pdf-jpg": {
    title: "PDF to JPG Converter - Export PDF Pages as Images | PDFMount",
    desc: "Convert PDF pages to high-quality JPG or PNG images online. Extract pictures from PDFs or turn whole pages into sharp image files free.",
    h1: "Convert PDF Pages to JPG Images",
    intro: "Turn PDF pages into sharp, independent image files. Perfect for extracting slides, embedding document previews on websites, or reviewing artwork.",
    steps: ["Upload your PDF document.", "Click the 'Start' button to render page sheets as images.", "Download the generated JPG files (saved inside a consolidated ZIP archive)."],
    faqs: [{ q: "Can I convert only specific pages?", a: "Yes, you can extract target sheets by selecting pages in the interactive preview workspace before executing conversion." }, { q: "What image formats are supported?", a: "We support exporting pages as high-quality JPGs by default. PDF to PNG conversion is also supported." }],
    detailedContent: ["Sharing document mockups as JPGs is faster and safer than sending complete vector PDFs. Our rendering engine rasterizes fonts and layouts at high resolution (150-300 DPI).", "This is perfect for creative designers who need to export layout drafts, presentation slides, or portfolio sheets as standard web-friendly images."],
  },
  "word-pdf": {
    title: "Word to PDF Converter - Convert DOCX to PDF Online | PDFMount",
    desc: "Convert Microsoft Word documents (DOCX and DOC) to PDF online free. Maintains original styles, fonts, margins, and formatting.",
    h1: "Convert Word (DOCX) to PDF Online",
    intro: "Convert editable Microsoft Word files into secure, non-editable PDFs. Our layout engine parses styles, list structures, and tables accurately.",
    steps: ["Upload your DOCX or DOC file.", "Customize optional margins and page layout configurations if desired.", "Click the 'Start' button to convert Word to PDF.", "Save your stable, print-ready PDF."],
    faqs: [{ q: "Will my margins and lists be preserved?", a: "Yes. Our engine is mapped to translate DOCX font styles, heading weights, bullet lists, and borders to PDF vectors." }],
    detailedContent: ["Sending resumes or business agreements as Word files can lead to layout distortions on different screen sizes. Converting to PDF locks in your formatting.", "Our lightweight python-docx converter operates instantly, returning clean, standard PDF documents ready for signatures and archiving."],
  },
  "pdf-word": {
    title: "PDF to Word Converter - Edit PDF in Microsoft Word | PDFMount",
    desc: "Convert PDF documents to editable Microsoft Word files (DOCX) online. Uses layout reconstruction to turn PDF sheets into editable paragraphs.",
    h1: "Convert PDF to Word Online Free",
    intro: "Make locked PDF documents editable. PDFMount parses PDF text blocks, headers, and bullet lists, mapping them into standard DOCX paragraph elements.",
    steps: ["Upload the PDF you wish to edit in Word.", "Select conversion preferences (e.g. flowing text or framed templates).", "Click the 'Start' button to convert.", "Download the editable DOCX file."],
    faqs: [{ q: "Can I convert scanned PDFs to Word?", a: "Yes. PDFMount uses OCR to extract text from images and scanned PDF pages before converting them to DOCX format." }, { q: "Will the layout of my PDF be ruined?", a: "No. Our layout reconstruction algorithm attempts to map text blocks logically, sorting headings, lists, and normal lines." }],
    detailedContent: ["Editing PDFs directly is notoriously difficult. By converting them back to Word, you can use standard office processors to adjust copy, rewrite tables, and re-arrange paragraphs easily.", "PDFMount's PDF-to-Word engine operates with layout preservation, making it much more than a simple text extractor."],
  },
  rotate: {
    title: "Rotate PDF Pages - Rotate PDF Files Online Free | PDFMount",
    desc: "Rotate sideways PDF pages permanently online. Choose individual pages or rotate the entire document to standard portrait layout.",
    h1: "Rotate PDF Pages Permanently",
    intro: "Fix scanned documents that loaded upside down or sideways. PDFMount lets you visually rotate specific pages and saves them permanently.",
    steps: ["Upload the PDF document.", "Hover over individual pages in the grid and click the rotate icon to turn them 90 degrees.", "Click the 'Start' button to write rotations permanently to the file.", "Download your corrected PDF."],
    faqs: [{ q: "Can I rotate only a single page in a 100-page PDF?", a: "Yes. Our layout grid lets you select and rotate individual sheets without affecting the rest of the document." }, { q: "Is the rotation temporary?", a: "No. Unlike browser viewer rotations, PDFMount rewrites the page geometry tags permanently into the PDF structures." }],
    detailedContent: ["Scanned forms and contracts are often oriented sideways due to document feeder issues. Sending them like this looks unprofessional and makes them hard to read. Our rotation tool corrects these pages in seconds."],
  },
  remove: {
    title: "Remove Pages from PDF - Delete PDF Pages Online | PDFMount",
    desc: "Delete unnecessary pages from your PDF online free. View pages in an interactive grid and discard sheets before sharing.",
    h1: "Delete Pages from PDF Online",
    intro: "Discard confidential sections or layout blanks before sending documents. Select and delete PDF pages visually.",
    steps: ["Select and upload the PDF file.", "Select the pages you want to delete from the visual grid.", "Click the 'Start' button to save the updated PDF.", "Download your cleaned document."],
    faqs: [{ q: "Can I restore deleted pages?", a: "No, once the file is processed and downloaded, the deleted pages are removed permanently. Keep a backup copy of your original file if needed." }],
    detailedContent: ["Discarding private appendix pages, placeholder sheets, or template drafts secures your documents and reduces file size."],
  },
  extract: {
    title: "Extract PDF Pages - Save Specific PDF Pages Free | PDFMount",
    desc: "Extract specific pages from your PDF online. Select pages visually or input page ranges to create a new PDF containing only those pages.",
    h1: "Extract Pages from PDF Online",
    intro: "Extract single pages, ranges, or non-consecutive sheets into a new, independent PDF file.",
    steps: ["Upload the PDF document.", "Select pages visually in the grid or define target page ranges.", "Click the 'Start' button to extract.", "Download your new PDF."],
    faqs: [{ q: "Are the links and bookmarks preserved?", a: "Yes, our page extraction tool keeps all interactive elements active inside the selected ranges." }],
    detailedContent: ["This is perfect for exporting chapters from ebooks, saving specific receipts from a bulk statement, or sending single contract sheets to clients."],
  },
  organize: {
    title: "Organize PDF Pages - Rearrange PDF Files Online | PDFMount",
    desc: "Reorder, delete, and rearrange pages in your PDF document online. Use a drag-and-drop page editor to structure PDFs free.",
    h1: "Organize and Reorder PDF Pages",
    intro: "Sort your document page hierarchy visually. Drag pages to new positions, insert sections, or remove blanks in real-time.",
    steps: ["Upload the PDF file.", "Drag and drop pages in the visual grid to reorder them.", "Click the 'Start' button to compile the new structure.", "Save your organized PDF."],
    faqs: [{ q: "Can I organize pages from multiple PDFs?", a: "Yes, you can merge multiple files first and then use the organize tool to arrange their combined sheets." }],
    detailedContent: ["Having pages out of order makes documents look messy. Our interactive canvas lets you restructure PDFs instantly in your browser before downloading a clean copy."],
  },
  "crop-pdf": {
    title: "Crop PDF Online - Crop Page Margins and Borders | PDFMount",
    desc: "Crop PDF pages online. Define custom margins and page boundaries to trim white spaces and crop PDF sheets free.",
    h1: "Crop PDF Page Boundaries",
    intro: "Crop empty white margins from documents. Define page crop dimensions to adjust layout boundaries.",
    steps: ["Upload the PDF file.", "Set preferred crop margins in the workspace panel.", "Click the 'Start' button to crop the file.", "Save your cropped PDF."],
    faqs: [{ q: "Does cropping delete underlying content?", a: "It clips the visual margins. Highly confidential data hidden by cropping should be redacted using an editing tool." }],
    detailedContent: ["Trimming scanned margins makes PDFs look clean on e-readers and mobile screens. PDFMount adjusts the MediaBox layout tags to trim page boundaries."],
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF - Number PDF Pages | PDFMount",
    desc: "Add page numbers to your PDF document online. Choose positions, fonts, and numbering formats (e.g. Page X of Y) easily.",
    h1: "Add Page Numbers to PDF Online",
    intro: "Index your documents with clean page numbering. Select custom positions and styles to stamp pages automatically.",
    steps: ["Upload the PDF file.", "Select numbers position (e.g. bottom-center, top-right) and formatting style.", "Click the 'Start' button to apply numbering.", "Download your numbered PDF."],
    faqs: [{ q: "Can I exclude the first page from numbering?", a: "Yes. Our advanced options let you skip stamping the cover page." }],
    detailedContent: ["Adding page numbers makes business reports and academic documents easy to navigate. PDFMount embeds vector page stamps onto your sheets cleanly."],
  },
  "pdf-annotator": {
    title: "Edit PDF & Annotate - Highlight and Draw on PDF | PDFMount",
    desc: "Edit and annotate PDF documents online. Draw shapes, highlight text blocks, add comments, and save changes securely in your browser without watermarks.",
    h1: "Annotate and Edit PDF Documents Online",
    intro: "Perform comprehensive document review directly inside your web browser. PDFMount provides an interactive workspace to overlay text comments, draw vector markups, and highlight critical text lines on standard PDF documents. Our system maintains original document layers and layout parameters without rasterizing text or altering source fonts. It works under isolated execution, ensuring private papers are never retained on our drives. The tool is designed to work on any modern browser without software installations.",
    steps: [
      "Select the target PDF file from your device folder and drag it into the secure upload drop zone above.",
      "Select drawing pencils, geometric shapes, or text tools from the editing sidebar to start adding annotations.",
      "Position comment boxes and adjust highlight colors on individual page sheets using the interactive editor interface.",
      "Click the 'Start' button to compile the new annotation metadata layer directly into the PDF file structure.",
      "Save the output file on your local storage device instantly, keeping all interactive markups fully editable."
    ],
    faqs: [
      {
        q: "Are the annotations added by PDFMount compatible with other PDF readers?",
        a: "Yes. The editor writes annotations conforming strictly to the Adobe PDF specification. Highlights, text boxes, and hand-drawn paths are saved as standard annotation objects. This means popular readers like Adobe Acrobat, Google Chrome PDF Viewer, or Apple Preview will detect, display, and allow editing or deleting of these comments on any device."
      },
      {
        q: "Can I remove existing text or redact confidential data using this tool?",
        a: "This tool is designed for adding review markups, highlights, and annotations to the document layout. It does not overwrite or permanently delete the underlying text layers. For permanent removal of sensitive data, you must use a dedicated PDF redaction tool that sanitizes the underlying PDF streams rather than just overlaying shapes."
      },
      {
        q: "What is the maximum file size limit for annotating documents?",
        a: "Unregistered guest users can upload and edit files up to 25 MB. Registered users on our free plan can process documents up to 50 MB, while Pro tier subscribers can edit large files up to 500 MB. Our server-side processing is optimized to handle multi-page documents containing complex vector layouts without memory limits."
      },
      {
        q: "Does WeLovePDF rasterize pages or degrade image resolution after editing?",
        a: "No. The editor preserves the vector nature of the original document. We do not convert pages into images or reduce the DPI of embedded graphics. The new markings are injected as a separate vector overlay stream, meaning your fonts, links, and high-resolution layouts remain sharp and fully zoomable."
      },
      {
        q: "How secure is my data when uploading files for annotation?",
        a: "Security is built into our core pipeline. File transfers use TLS 1.3 encryption. Uploaded documents are processed in volatile, isolated server sandboxes. Our automated system wipes all temp data and output files exactly 60 minutes after processing, preventing any third-party access."
      }
    ],
    detailedContent: [
      "Our annotation engine parses the document structure to inject standard PDF annotation dictionaries. Drawing vectors are rendered as markup annotations, while text inputs map to free-text comment blocks. By conforming to standardized document formatting guidelines, WeLovePDF ensures cross-platform compatibility across enterprise software systems without breaking layout metadata.",
      "We prioritize data confidentiality above all else. Your files are processed on dedicated, isolated servers with strict access controls. There is no human surveillance, and no data is sent to external AI processors. The 60-minute cleanup script guarantees that files are permanently deleted from our cache, leaving no residual traces behind.",
      "This online annotator is an essential tool for legal professionals reviewing contracts, students highlighting research papers, and remote teams collaborating on layout drafts. It eliminates the need for expensive desktop licenses, providing a fast, secure, browser-native alternative for daily document review tasks."
    ]
  },
  "header-footer-pdf": {
    title: "Add Header and Footer to PDF - Custom Layouts | PDFMount",
    desc: "Add custom headers and footers to PDF files online. Stamp titles, dates, or company names on page headers and footers free.",
    h1: "Add Header and Footer to PDF",
    intro: "Professionalize your PDFs by overlaying custom header and footer lines onto your documents.",
    steps: ["Upload the PDF file.", "Input header/footer text and select page positions.", "Click the 'Start' button to stamp headers/footers.", "Download your stamped PDF."],
    faqs: [{ q: "Can I format the text size and font?", a: "Yes. PDFMount supports customizable font sizes and alignments in the options panel." }],
    detailedContent: ["Stamping copyright text, date metadata, or branding titles on document headers makes them secure and structured."],
  },
  "resize-pdf": {
    title: "Resize PDF Pages - Change PDF Page Size Online | PDFMount",
    desc: "Resize PDF pages online. Change page size dimensions to standard A4, Letter, or Legal boundaries free.",
    h1: "Resize PDF Page Dimensions",
    intro: "Align document dimensions by resizing pages to standard paper sizes.",
    steps: ["Upload the PDF document.", "Select target page dimensions (A4, Letter, or Legal).", "Click the 'Start' button to resize.", "Download your resized PDF."],
    faqs: [{ q: "Will resizing stretch my text?", a: "No. The layout scaling is adjusted proportionally so text lines do not distort." }],
    detailedContent: ["Standardizing paper layout sizes is crucial for clean office printouts. PDFMount scales page boundaries to match target specifications."],
  },
  esign: {
    title: "Sign PDF Online - Free Electronic Signatures | PDFMount",
    desc: "Draw or type electronic signatures onto your PDF files online. Sign PDFs securely in seconds without printing.",
    h1: "Sign PDF Documents Online",
    intro: "Place electronic signatures onto contracts. Draw, type, or upload signature stamps securely.",
    steps: ["Upload the PDF document.", "Draw or type your signature inside the e-sign editor.", "Place and scale the signature stamp on target pages.", "Download your signed PDF."],
    faqs: [{ q: "Are the signatures legally binding?", a: "Yes, PDFMount signatures are standard electronic signatures suitable for general contracts and agreements." }],
    detailedContent: ["E-signing avoids printing, signing manually, and scanning. PDFMount embeds vector signature stamps onto pages securely."],
  },
  unlock: {
    title: "Unlock PDF - Remove PDF Password & Restrictions | PDFMount",
    desc: "Unlock password protected PDFs online. Remove print, copy, and edit restriction passwords from PDF files free.",
    h1: "Unlock PDF Online Free",
    intro: "Remove restrict passwords from PDFs so you can edit, print, or copy text content freely.",
    steps: ["Upload the locked PDF file.", "Provide the password if the file requires an open password.", "Click the 'Start' button to unlock.", "Download your unrestricted PDF."],
    faqs: [{ q: "Can I unlock a file if I don't know the owner password?", a: "Yes, PDFMount can strip owner-restriction passwords instantly. You must know the open password if the file is encrypted." }],
    detailedContent: ["Unlocking files lets you compile pages or copy text layouts. We strip PDF encryption headers cleanly, returning fully editable versions."],
  },
  protect: {
    title: "Protect PDF - Encrypt PDF with Password | PDFMount",
    desc: "Encrypt your PDF documents with secure passwords. Protect PDF files online from unauthorized viewing and copying.",
    h1: "Protect PDF with Password Online",
    intro: "Secure confidential records by encrypting PDF files with strong user and owner passwords.",
    steps: ["Upload the PDF document.", "Input a secure password.", "Click the 'Start' button to encrypt.", "Save your protected PDF."],
    faqs: [{ q: "What encryption strength is used?", a: "PDFMount uses industry-standard encryption, preventing unauthorized access." }],
    detailedContent: ["Encrypting tax records, salary slips, or contract drafts secures them from unauthorized viewing when sent over email."],
  },
  "watermark-pdf": {
    title: "Watermark PDF Online - Add Text or Image Overlays | PDFMount",
    desc: "Add text or image watermarks to your PDF online free. Choose positions, fonts, colors, and opacity for custom document stamps.",
    h1: "Add Watermark to PDF Online",
    intro: "Protect copyright by stamping customized text or image watermarks across PDF pages.",
    steps: ["Upload the PDF document.", "Input watermark text or upload an image stamp.", "Configure text color, position, rotation, and opacity.", "Click the 'Start' button to apply.", "Download your watermarked PDF."],
    faqs: [{ q: "Can watermarks be easily removed?", a: "PDFMount embeds watermarks as flattened elements, making them secure against basic editing tools." }],
    detailedContent: ["Watermarking drafts or copy sheets prevents content theft and establishes clear ownership before legal publications."],
  },
  "bates-numbering": {
    title: "Bates Numbering PDF - Index Legal PDF Pages | PDFMount",
    desc: "Index legal documents with Bates numbering. Stamp custom prefixes, suffixes, and page counts onto PDF sheets online.",
    h1: "Bates Numbering for PDF Files",
    intro: "Index and organize legal case sheets. Stamp consecutive Bates numbers on PDF files automatically.",
    steps: ["Upload the PDF document.", "Input bates prefix (e.g. CASE-), start number, and page positions.", "Click the 'Start' button to stamp.", "Save your indexed PDF."],
    faqs: [{ q: "Can I stamp multiple documents consecutively?", a: "Yes. Our Bates numbering supports starting sequence numbers from any specified count." }],
    detailedContent: ["Consecutive numbering is a mandatory requirement in legal discovery and litigation workflows. PDFMount automates this stamping in seconds."],
  },
  "metadata-pdf": {
    title: "Edit PDF Metadata - Change PDF Title & Author | PDFMount",
    desc: "Edit PDF metadata online free. Change the document title, author, subject, and keywords fields inside your PDF files.",
    h1: "Edit PDF Metadata online",
    intro: "Adjust document metadata properties. Clean or set title, author, subject, and keyword fields easily.",
    steps: ["Upload the PDF document.", "Input new metadata values (Title, Author, Subject, Keywords) in the panel.", "Click the 'Start' button to save properties.", "Download your updated PDF."],
    faqs: [{ q: "Will editing metadata change the PDF contents?", a: "No. Only the document's header metadata dictionary is updated; the page pages remain untouched." }],
    detailedContent: ["Cleaning internal metadata attributes protects private details (like creator names or software versions) before public sharing."],
  },
  "ocr-pdf": {
    title: "PDF OCR - Make Scanned PDFs Searchable | PDFMount",
    desc: "Convert scanned PDF documents into searchable and editable text using OCR technology online free.",
    h1: "PDF OCR - Make Scanned PDFs Searchable",
    intro: "Use Optical Character Recognition to make scanned PDFs fully text-searchable and copy-paste ready.",
    steps: ["Upload your scanned PDF document.", "Click the 'Start' button to run OCR processing.", "Download your searchable PDF."],
    faqs: [{ q: "What languages does OCR support?", a: "PDFMount's OCR supports multiple languages including English, Hindi, and many European languages." }],
    detailedContent: ["Scanned documents are images without text layers. Our OCR engine adds a transparent text layer so you can select, copy, and search within the content."],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2.  ROUTE MAP  (URL path → seoPage key)
// ─────────────────────────────────────────────────────────────────────────────
const toolRoutes: Record<string, string> = {
  "/merge-pdf": "merge",
  "/split-pdf": "split",
  "/compress-pdf": "compress",
  "/word-to-pdf": "word-pdf",
  "/jpg-to-pdf": "jpg-pdf",
  "/pdf-to-word": "pdf-word",
  "/pdf-to-jpg": "pdf-jpg",
  "/rotate-pdf": "rotate",
  "/remove-pages": "remove",
  "/extract-pages": "extract",
  "/organize-pdf": "organize",
  "/crop-pdf": "crop-pdf",
  "/page-numbers": "page-numbers",
  "/pdf-annotator": "pdf-annotator",
  "/header-footer-pdf": "header-footer-pdf",
  "/resize-pdf": "resize-pdf",
  "/sign-pdf": "esign",
  "/unlock-pdf": "unlock",
  "/protect-pdf": "protect",
  "/watermark-pdf": "watermark-pdf",
  "/bates-numbering": "bates-numbering",
  "/edit-pdf-metadata": "metadata-pdf",
  "/ocr-pdf": "ocr-pdf",
};

// Homepage JSON-LD schemas (WebSite + Organization)
const homepageJsonLd = (): string => {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PDFMount",
      url: DOMAIN,
      description: "Free online PDF tools — merge, split, compress, convert, sign, and secure PDF files in seconds.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${DOMAIN}/tools?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PDFMount",
      url: DOMAIN,
      logo: `${DOMAIN}/logo.png`,
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${DOMAIN}/contact`,
        availableLanguage: ["English", "Hindi"],
      },
    },
  ];
  return schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n  ");
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  STATIC PAGE RICH CONTENT BUILDERS
//     Each function returns fully pre-rendered HTML for its route.
//     This text is visible to crawlers in raw HTML before JS runs.
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const NAV_LINKS = `
      <nav style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;display:flex;flex-wrap:wrap;gap:16px;font-size:14px">
        <a href="/" style="color:#2563eb">Home</a>
        <a href="/tools" style="color:#2563eb">All PDF Tools</a>
        <a href="/pricing" style="color:#2563eb">Pricing</a>
        <a href="/faq" style="color:#2563eb">FAQ</a>
        <a href="/privacy" style="color:#2563eb">Privacy Policy</a>
        <a href="/terms" style="color:#2563eb">Terms of Service</a>
        <a href="/contact" style="color:#2563eb">Contact Us</a>
        <a href="/about" style="color:#2563eb">About</a>
        <a href="/security" style="color:#2563eb">Security</a>
      </nav>`;

// Homepage pre-rendered H1 + content block
const homepageContent = `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:900px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2.2rem;font-weight:700;margin-bottom:16px">Free Online PDF Tools — Fast, Secure &amp; No Sign-up</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#444;margin-bottom:32px">PDFMount gives you a complete suite of free browser-based PDF tools. Merge, split, compress, convert Word/JPG to PDF, rotate, watermark, sign, unlock, protect and edit PDF files — all without installing any software or creating an account.</p>
      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:16px">Popular PDF Tools</h2>
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;list-style:none;padding:0">
        <li><a href="/merge-pdf" style="color:#2563eb">Merge PDF</a> — Combine multiple PDFs into one</li>
        <li><a href="/compress-pdf" style="color:#2563eb">Compress PDF</a> — Reduce file size instantly</li>
        <li><a href="/split-pdf" style="color:#2563eb">Split PDF</a> — Extract pages by range</li>
        <li><a href="/pdf-to-word" style="color:#2563eb">PDF to Word</a> — Convert to editable DOCX</li>
        <li><a href="/word-to-pdf" style="color:#2563eb">Word to PDF</a> — Convert DOCX to PDF</li>
        <li><a href="/jpg-to-pdf" style="color:#2563eb">JPG to PDF</a> — Images to PDF document</li>
        <li><a href="/pdf-to-jpg" style="color:#2563eb">PDF to JPG</a> — Export pages as images</li>
        <li><a href="/sign-pdf" style="color:#2563eb">Sign PDF</a> — Free electronic signature</li>
        <li><a href="/rotate-pdf" style="color:#2563eb">Rotate PDF</a> — Fix sideways pages</li>
        <li><a href="/watermark-pdf" style="color:#2563eb">Watermark PDF</a> — Add text/image overlay</li>
        <li><a href="/protect-pdf" style="color:#2563eb">Protect PDF</a> — Encrypt with password</li>
        <li><a href="/unlock-pdf" style="color:#2563eb">Unlock PDF</a> — Remove password restrictions</li>
        <li><a href="/remove-pages" style="color:#2563eb">Remove Pages</a> — Delete unwanted pages</li>
        <li><a href="/extract-pages" style="color:#2563eb">Extract Pages</a> — Save specific pages</li>
        <li><a href="/organize-pdf" style="color:#2563eb">Organize PDF</a> — Reorder pages freely</li>
        <li><a href="/ocr-pdf" style="color:#2563eb">OCR PDF</a> — Make scanned PDFs searchable</li>
        <li><a href="/crop-pdf" style="color:#2563eb">Crop PDF</a> — Trim page margins</li>
        <li><a href="/page-numbers" style="color:#2563eb">Page Numbers</a> — Add numbering stamps</li>
        <li><a href="/header-footer-pdf" style="color:#2563eb">Header &amp; Footer</a> — Custom headers/footers</li>
        <li><a href="/bates-numbering" style="color:#2563eb">Bates Numbering</a> — Legal indexing</li>
      </ul>
      <div style="margin-top:40px;padding:24px;background:#f0f7ff;border-radius:12px;border-left:4px solid #2563eb">
        <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Why use PDFMount?</h2>
        <ul style="color:#444;line-height:2;padding-left:20px">
          <li>100% Free — no watermarks, no sign-up required</li>
          <li>Secure processing — files auto-deleted after 60 minutes</li>
          <li>Fast browser-based tools — no software to install</li>
          <li>23+ PDF tools covering every document need</li>
          <li>Trusted by thousands of users worldwide</li>
        </ul>
      </div>
      ${NAV_LINKS}
    </div>`;

function buildPrivacyContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:8px">Privacy Policy</h1>
      <p style="color:#888;font-size:14px;margin-bottom:32px">Last updated: June 17, 2026 &middot; PDFMount holds your document privacy as our highest priority.</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:40px">
        <div style="padding:20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">
          <h3 style="font-size:1rem;font-weight:600;margin-bottom:6px">&#x23F0; Auto Deletion</h3>
          <p style="font-size:14px;color:#374151;margin:0">All uploaded files are automatically and permanently deleted from our servers after exactly 1 hour.</p>
        </div>
        <div style="padding:20px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe">
          <h3 style="font-size:1rem;font-weight:600;margin-bottom:6px">&#x1F6AB; No File Inspection</h3>
          <p style="font-size:14px;color:#374151;margin:0">We never open, read, or inspect your document contents. All processing is fully automated.</p>
        </div>
        <div style="padding:20px;background:#fdf4ff;border-radius:12px;border:1px solid #e9d5ff">
          <h3 style="font-size:1rem;font-weight:600;margin-bottom:6px">&#x1F512; SSL Encrypted</h3>
          <p style="font-size:14px;color:#374151;margin:0">Files are transferred via secure HTTPS (TLS 1.3) streams and processed on isolated secure servers.</p>
        </div>
      </div>

      <div style="background:#fff;padding:40px;border-radius:16px;border:1px solid #e5e7eb;display:flex;flex-direction:column;gap:28px">
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">1. Information We Collect</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">Pdfmount.online is a zero-registration document helper. We do not ask for personal details unless you contact support or submit feedback. We collect basic server logging information (such as anonymized IP addresses and browser configurations) solely to run rate limits and optimize server performance. We do not collect any personally identifiable information from guest users.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">2. Document File Safety</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">Any PDF, image, or document file uploaded to our website is held strictly in temporary server workspaces. Our automated cleanup task purges all session folders older than 60 minutes. Your files are never shared with third parties or stored in database logs. We do not sell, rent, or distribute any user data or uploaded content to third parties.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">3. Cookies &amp; Advertising</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0 0 12px 0">We use standard session cookies to remember your workspace preferences. Our monetization model relies on display advertisements. Third-party ad networks (like Google AdSense) set cookies to serve personalized ads based on your visits to our site and other sites on the Internet.</p>
          <ul style="font-size:15px;color:#4b5563;line-height:1.8;padding-left:20px">
            <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" style="color:#2563eb">Google Ads Settings</a>.</li>
          </ul>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">4. Compliance</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">We adhere strictly to secure data processing standards. We do not sell user data. Our server storage pipelines follow ISO/IEC 27001 security standards. We are compliant with GDPR requirements for EU users and applicable Indian data protection laws.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">5. Contact Us</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">If you have any questions regarding this Privacy Policy, please contact us at <a href="mailto:support@pdfmount.online" style="color:#2563eb">support@pdfmount.online</a>.</p>
        </div>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildTermsContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:8px">Terms of Service</h1>
      <p style="color:#888;font-size:14px;margin-bottom:40px">Last updated: June 17, 2026 &middot; Please read these terms carefully before utilizing our tools.</p>

      <div style="background:#fff;padding:40px;border-radius:16px;border:1px solid #e5e7eb;display:flex;flex-direction:column;gap:28px">
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">1. Acceptance of Terms</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">By accessing and using Pdfmount.online, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the Service.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">2. Free Starter Plan &amp; Premium Subscriptions</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">PDFMount offers a generous Free Starter plan with a daily limit on file processing tasks. Optional Pro ($19/month) and Enterprise subscription tiers are available to increase limits and enable advanced capabilities. We do not sell user data and enforce strict quotas to ensure server stability.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">3. Usage Restrictions &amp; Quotas</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">You agree to use Pdfmount.online only for lawful purposes. You must not attempt to scrape our web tools, automate uploads via external scripts, upload malicious files containing viruses, or intentionally overload our servers. We enforce a client-side and server-side rate limit per IP address to ensure fair server availability for all users.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">4. Intellectual Property</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">You retain full ownership of all PDF documents, images, and texts you upload. Pdfmount.online does not claim any rights, copyright, or ownership over your files. The PDFMount platform, design, code, and trademarks are owned exclusively by PDFMount and its developers.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">5. File Storage &amp; Privacy</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">All uploaded files are temporarily stored for processing and automatically deleted after 60 minutes. We do not review, distribute, or retain your file contents beyond this window. See our <a href="/privacy" style="color:#2563eb">Privacy Policy</a> and <a href="/file-privacy" style="color:#2563eb">File Privacy Policy</a> for full details.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">6. Disclaimer of Warranties</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">Our tools are provided "as is" and "as available". While we strive for high conversion fidelity, Pdfmount.online makes no warranties regarding the accuracy, completeness, or reliability of converted outputs. Always keep a backup of your original documents before processing.</p>
        </div>
        <div>
          <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:10px">7. Contact</h2>
          <p style="font-size:16px;color:#4b5563;line-height:1.7;margin:0">For questions about these terms, contact us at <a href="mailto:support@pdfmount.online" style="color:#2563eb">support@pdfmount.online</a>.</p>
        </div>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildFaqContent(): string {
  const faqs = [
    { q: "Is Pdfmount.online really free to use?", a: "Yes, 100% free! You can use all conversions, page organization, and security tools without paying anything. We support server expenses by showing clean, non-intrusive advertisements and accepting optional subscriptions." },
    { q: "Is my personal document secure on your servers?", a: "Absolutely. We employ an automated server cleanup task that deletes all uploaded documents and processed outputs exactly 1 hour after conversion. We do not read, scan, store, or share your document contents with any third party." },
    { q: "Are there size limits for uploading files?", a: "Free users can upload up to 50 MB per session. Pro users get up to 500 MB per file. Most normal documents, presentations, and images fall well within the free limit." },
    { q: "Can I cancel or delete my files before the 1-hour auto-delete timer?", a: "Yes. You can clear your session history or delete files instantly by clicking the 'Reset' button in the dashboard, which purges your staged file cache immediately." },
    { q: "What PDF tools does PDFMount offer?", a: "PDFMount offers 23+ PDF tools including Merge PDF, Split PDF, Compress PDF, PDF to Word, Word to PDF, JPG to PDF, PDF to JPG, Sign PDF, Watermark PDF, Protect PDF, Unlock PDF, Rotate PDF, Organize PDF, Add Page Numbers, PDF OCR, and many more." },
    { q: "Does PDFMount work on mobile devices?", a: "Yes. PDFMount is fully responsive and works on any modern browser on smartphones, tablets, and desktop computers without any app installation." },
    { q: "How can I support Pdfmount.online?", a: "If our free tools saved you time, you can upgrade to a Pro plan or share Pdfmount.online with your colleagues and friends — that is a huge help!" },
    { q: "What file formats does PDFMount support?", a: "PDFMount supports PDF, DOCX, DOC, JPG, PNG, GIF, BMP, WebP, and more as input formats across different tools. All outputs are high-quality PDF or image files." },
  ];

  const faqItems = faqs.map((f, idx) =>
    `<div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:12px">
      <h3 style="font-size:1rem;font-weight:600;margin:0 0 8px 0;color:#111827">${idx + 1}. ${escapeHtml(f.q)}</h3>
      <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">${escapeHtml(f.a)}</p>
    </div>`
  ).join("\n");

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  });

  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <script type="application/ld+json">${faqSchema}</script>
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:8px">Frequently Asked Questions</h1>
      <p style="color:#4b5563;font-size:1.1rem;margin-bottom:40px">Everything you need to know about our free PDF tools, security, and usage.</p>
      ${faqItems}
      ${NAV_LINKS}
    </div>`;
}

function buildAboutContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">About PDFMount</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#4b5563;margin-bottom:32px">PDFMount was founded with a clear mission: to make professional PDF tools accessible to everyone — for free. We believe that static documents should not hold back dynamic ideas. Our platform bridges the gap between fixed-format reliability and fluid creative potential.</p>

      <div style="background:#10162f;color:#fff;padding:40px;border-radius:16px;margin-bottom:32px">
        <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:16px">Our Mission</h2>
        <p style="font-size:1rem;line-height:1.7;opacity:0.85;margin:0">We believe that static documents shouldn't hold back dynamic ideas. Pdfmount.online was founded to bridge the gap between fixed-format reliability and fluid creative potential — making every PDF tool free, fast, and secure for individuals, students, and professionals around the world.</p>
      </div>

      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:16px">What We Stand For</h2>
      <ul style="color:#4b5563;line-height:2.2;padding-left:20px;margin-bottom:32px">
        <li><strong>Free Access:</strong> All core PDF tools are completely free, no registration required.</li>
        <li><strong>Security First:</strong> Files are processed in isolated environments and auto-deleted after 60 minutes.</li>
        <li><strong>Speed:</strong> Browser-based tools with server-side processing where needed, ensuring fast results.</li>
        <li><strong>Transparency:</strong> We clearly communicate how your data is handled — no hidden clauses.</li>
        <li><strong>Accessibility:</strong> Works on any device, any browser, anywhere in the world.</li>
      </ul>

      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:16px">Our PDF Tool Suite</h2>
      <p style="color:#4b5563;line-height:1.7;margin-bottom:20px">PDFMount offers 23+ production-grade PDF tools including Merge, Split, Compress, Convert, Sign, Watermark, OCR, Annotate, and many more — all processing on enterprise-grade servers with a Rust-powered backend.</p>
      ${NAV_LINKS}
    </div>`;
}

function buildSecurityContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">Security Policy</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#4b5563;margin-bottom:40px">At PDFMount, security isn't an afterthought; it is our foundation. We process your pages with a commitment to absolute data isolation, secure encryption, and zero server persistence.</p>

      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;color:#065f46;margin-bottom:10px">1. Volatile In-Memory Sandboxing</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">Files processed by our conversion and engineering tools are processed in ephemeral server instances. Unlike typical cloud suites that index documents, PDFMount writes files into temporary memory workspaces. The moment your task completes, the original uploads are closed and scheduled for deletion. No file is persisted beyond the 60-minute auto-purge window.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;color:#065f46;margin-bottom:10px">2. Transport Layer Security (TLS 1.3)</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">All documents uploaded to PDFMount are encrypted in transit using industry-standard HTTPS with TLS 1.3. This prevents any potential eavesdropping or data interception by third parties on public networks. Your files travel directly to our secure APIs and nowhere else.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;color:#065f46;margin-bottom:10px">3. No Third-Party Data Handover</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">We strictly enforce a policy of zero vendor dependencies for core file rendering. We run our own Rust backend, SQLite instance, and local Python scripts under sandboxed environments. Your files are never sent to external APIs, translators, or commercial parsers. All processing is done on our own servers.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;color:#065f46;margin-bottom:10px">4. Content Security Policy</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">PDFMount enforces strict HTTP security headers including Content-Security-Policy, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), and HSTS (Strict-Transport-Security) with a 2-year max-age. These headers protect against XSS attacks, clickjacking, and other common web vulnerabilities.</p>
        </div>
      </div>
      <p style="margin-top:32px;font-size:15px;color:#4b5563">Security questions? Contact <a href="mailto:support@pdfmount.online" style="color:#2563eb">support@pdfmount.online</a></p>
      ${NAV_LINKS}
    </div>`;
}

function buildFilePrivacyContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">File Privacy Policy</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#4b5563;margin-bottom:40px">Your files contain sensitive personal data, contracts, and finances. We believe you should maintain 100% ownership and control over who accesses them. Here is exactly how we handle your uploaded files.</p>

      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F512; Client-Side Prioritization</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">Whenever possible, PDFMount utilizes client-side processing to execute page rearrangements, rotations, and minor tasks directly inside your browser. This means your files do not even travel across the network, ensuring complete offline privacy for simple operations.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F6AB; Zero Human Surveillance</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">We do not index, analyze, or categorize the contents of your files. All processes are automated. No employee, engineer, or third party has visual access to your documents. The files are parsed solely by our system engines and converted output is immediately piped back to you.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F4C1; Document Security Controls</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">Once you download your processed document, you can click "Delete file now" in the dashboard or workspace to wipe it immediately from our servers. If you forget, our server purges all remnants after exactly 60 minutes. We also do not maintain any database records of your file contents — only job status metadata for authenticated users.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F4E4; Data Transfer</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">All file transfers between your device and our servers are protected by TLS 1.3 (HTTPS). We never transmit your files to any third-party service. Our backend is a self-contained Rust API that processes your documents entirely within our own infrastructure.</p>
        </div>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildDataDeletionContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">Data Deletion Policy</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#4b5563;margin-bottom:40px">We store only the bare minimum operational log metadata necessary to enforce plan limits. We never keep your processed documents or assets. Here is our complete data lifecycle policy.</p>

      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x23F1;&#xFE0F; 60-Minute Automated Deletion</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">Every hour, an automated cleanup script scans our volatile scratch workspace and purges all file uploads, working intermediates, and compiled outputs that are older than 60 minutes. Once deleted, they are completely unrecoverable — even by our own team.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x26A1; Immediate Manual Deletion</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">Don't want to wait 60 minutes? In the completed job panel, click the trash/delete icon next to your file. Our system immediately deletes the workspace files and folder from the storage disk. This manual deletion is reflected instantly in your job history dashboard.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F9F9; Account Deletion</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">If you delete your PDFMount account from the account dashboard settings, all associated email registries, history metadata logs, and subscription records are purged from our database immediately. We do not retain any personally identifiable information after account deletion.</p>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:28px">
          <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">&#x1F4CB; What We Retain</h2>
          <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">For authenticated users, we retain: the job ID, the tool used, the output filename, and the file size — solely to display your job history in the dashboard. We do not retain the file content itself. Anonymous/guest users have zero data retained after their files are deleted.</p>
        </div>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildPricingContent(): string {
  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:8px">Simple, Transparent Pricing</h1>
      <p style="font-size:1.1rem;color:#4b5563;line-height:1.7;margin-bottom:40px">Start for free. No credit card required. Upgrade when you need more power.</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;margin-bottom:40px">
        <div style="background:#fff;border-radius:16px;border:2px solid #e5e7eb;padding:32px">
          <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">Starter</h2>
          <p style="font-size:2rem;font-weight:700;margin:12px 0 4px">$0<span style="font-size:1rem;font-weight:400;color:#6b7280">/month</span></p>
          <p style="color:#6b7280;font-size:14px;margin-bottom:20px">For individuals &amp; light projects.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:14px;color:#374151">
            <li>&#x2705; 10 jobs per day</li>
            <li>&#x2705; 50 MB file size limit</li>
            <li>&#x2705; All core PDF tools</li>
            <li>&#x2705; Basic annotations</li>
            <li>&#x2705; Standard processing speed</li>
            <li>&#x2705; Community support</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:16px;border:2px solid #10b981;padding:32px;position:relative">
          <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px">MOST POPULAR</span>
          <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;color:#059669">Pro</h2>
          <p style="font-size:2rem;font-weight:700;margin:12px 0 4px">$19<span style="font-size:1rem;font-weight:400;color:#6b7280">/month</span></p>
          <p style="color:#6b7280;font-size:14px;margin-bottom:20px">For professionals and heavy users.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:14px;color:#374151">
            <li>&#x2705; 100 jobs per day</li>
            <li>&#x2705; 500 MB file size limit</li>
            <li>&#x2705; All core PDF tools</li>
            <li>&#x2705; Priority processing</li>
            <li>&#x2705; Advanced annotations &amp; editor</li>
            <li>&#x2705; Priority support (24/5)</li>
            <li>&#x2705; Billed monthly, cancel anytime</li>
          </ul>
        </div>
        <div style="background:#fff;border-radius:16px;border:2px solid #6366f1;padding:32px">
          <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;color:#6366f1">Enterprise</h2>
          <p style="font-size:2rem;font-weight:700;margin:12px 0 4px">Custom</p>
          <p style="color:#6b7280;font-size:14px;margin-bottom:20px">For teams requiring control and scale.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:14px;color:#374151">
            <li>&#x2705; Unlimited daily jobs</li>
            <li>&#x2705; Unlimited file size</li>
            <li>&#x2705; Dedicated processing servers</li>
            <li>&#x2705; SSO &amp; Advanced Security</li>
            <li>&#x2705; Admin dashboard</li>
            <li>&#x2705; Unlimited storage</li>
            <li>&#x2705; 24/7 VIP dedicated support</li>
            <li>&#x2705; Custom API integration</li>
          </ul>
        </div>
      </div>

      <div style="background:#f0f9ff;border-radius:12px;padding:24px;border:1px solid #bae6fd;margin-bottom:32px">
        <h2 style="font-size:1rem;font-weight:600;margin-bottom:8px">&#x2728; All plans include:</h2>
        <ul style="color:#374151;line-height:2;padding-left:20px;margin:0">
          <li>Access to all 23+ PDF tools</li>
          <li>No watermarks on any processed files</li>
          <li>Files auto-deleted after 60 minutes (your privacy is guaranteed)</li>
          <li>SSL-encrypted file transfers</li>
          <li>Works on any device — mobile, tablet, desktop</li>
        </ul>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildToolsContent(): string {
  const tools = [
    { href: "/merge-pdf", name: "Merge PDF", desc: "Combine multiple PDFs into one document" },
    { href: "/split-pdf", name: "Split PDF", desc: "Extract pages by custom ranges" },
    { href: "/compress-pdf", name: "Compress PDF", desc: "Reduce file size without quality loss" },
    { href: "/word-to-pdf", name: "Word to PDF", desc: "Convert DOCX to PDF online" },
    { href: "/pdf-to-word", name: "PDF to Word", desc: "Convert PDF to editable DOCX" },
    { href: "/jpg-to-pdf", name: "JPG to PDF", desc: "Convert images to PDF" },
    { href: "/pdf-to-jpg", name: "PDF to JPG", desc: "Export PDF pages as images" },
    { href: "/sign-pdf", name: "Sign PDF", desc: "Free electronic signature tool" },
    { href: "/rotate-pdf", name: "Rotate PDF", desc: "Fix sideways or upside-down pages" },
    { href: "/watermark-pdf", name: "Watermark PDF", desc: "Add text or image watermarks" },
    { href: "/protect-pdf", name: "Protect PDF", desc: "Encrypt PDF with a password" },
    { href: "/unlock-pdf", name: "Unlock PDF", desc: "Remove PDF password restrictions" },
    { href: "/remove-pages", name: "Remove Pages", desc: "Delete unwanted PDF pages" },
    { href: "/extract-pages", name: "Extract Pages", desc: "Save specific pages as new PDF" },
    { href: "/organize-pdf", name: "Organize PDF", desc: "Reorder pages with drag-and-drop" },
    { href: "/crop-pdf", name: "Crop PDF", desc: "Trim page margins and borders" },
    { href: "/page-numbers", name: "Add Page Numbers", desc: "Stamp numbered pages on PDF" },
    { href: "/header-footer-pdf", name: "Header & Footer", desc: "Add custom headers and footers" },
    { href: "/resize-pdf", name: "Resize PDF", desc: "Change PDF page dimensions" },
    { href: "/pdf-annotator", name: "PDF Annotator", desc: "Highlight and draw on PDF pages" },
    { href: "/bates-numbering", name: "Bates Numbering", desc: "Legal document indexing stamps" },
    { href: "/edit-pdf-metadata", name: "Edit Metadata", desc: "Change PDF title, author, keywords" },
    { href: "/ocr-pdf", name: "PDF OCR", desc: "Make scanned PDFs searchable" },
  ];

  const items = tools.map(t =>
    `<li style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:20px">
      <a href="${t.href}" style="color:#2563eb;font-weight:600;font-size:1rem;text-decoration:none">${escapeHtml(t.name)}</a>
      <p style="color:#6b7280;font-size:14px;margin:4px 0 0">${escapeHtml(t.desc)}</p>
    </li>`
  ).join("\n");

  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:960px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:8px">All PDF Tools</h1>
      <p style="font-size:1.1rem;color:#4b5563;line-height:1.7;margin-bottom:40px">Explore our complete suite of 23+ free online PDF tools. Process your documents instantly, securely, and without any software installation.</p>
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;list-style:none;padding:0;margin-bottom:40px">
        ${items}
      </ul>
      <div style="background:#f0f9ff;border-radius:12px;padding:24px;border:1px solid #bae6fd">
        <h2 style="font-size:1rem;font-weight:600;margin-bottom:8px">Why PDFMount is the best free PDF tool online</h2>
        <ul style="color:#374151;line-height:2;padding-left:20px;margin:0">
          <li>No registration required — start working immediately</li>
          <li>No watermarks on any output files</li>
          <li>All files auto-deleted after 60 minutes for your privacy</li>
          <li>Works on Windows, Mac, Android, iOS — any browser</li>
          <li>Powered by a fast Rust backend for professional-grade results</li>
        </ul>
      </div>
      ${NAV_LINKS}
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  TOOL PAGE HTML BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildToolContent(page: SeoPage): string {
  const stepsHtml = page.steps
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("\n        ");

  const faqsHtml = page.faqs
    .map(
      (f) =>
        `<div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:20px">
        <h3 style="font-size:1rem;font-weight:600;margin:0 0 8px">${escapeHtml(f.q)}</h3>
        <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0">${escapeHtml(f.a)}</p>
      </div>`
    )
    .join("\n        ");

  const detailHtml = page.detailedContent
    .map((d) => `<p>${escapeHtml(d)}</p>`)
    .join("\n        ");

  return `
    <div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">${escapeHtml(page.h1)}</h1>
      <p style="font-size:1.1rem;line-height:1.7;color:#444;margin-bottom:32px">${escapeHtml(page.intro)}</p>
      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:12px">How to use</h2>
      <ol style="padding-left:20px;line-height:2;color:#374151">
        ${stepsHtml}
      </ol>
      ${
        page.faqs.length > 0
          ? `<h2 style="font-size:1.3rem;font-weight:600;margin:32px 0 12px">Frequently Asked Questions</h2>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${faqsHtml}
      </div>`
          : ""
      }
      ${
        page.detailedContent.length > 0
          ? `<div style="margin-top:32px;line-height:1.8;color:#555">
        ${detailHtml}
      </div>`
          : ""
      }
      <div style="margin-top:40px;padding:20px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd">
        <strong>Why use PDFMount?</strong>
        <ul style="margin:8px 0 0;padding-left:20px;color:#374151;line-height:2">
          <li>100% Free — no watermarks, no hidden fees</li>
          <li>Secure — files auto-deleted after 60 minutes</li>
          <li>No sign-up required — start immediately</li>
        </ul>
      </div>
      ${NAV_LINKS}
    </div>`;
}

function buildJsonLd(route: string, page: SeoPage): string {
  const schemas: object[] = [];

  // BreadcrumbList
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${DOMAIN}/` },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${DOMAIN}${route}` },
    ],
  });

  // SoftwareApplication
  schemas.push({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.h1,
    operatingSystem: "All",
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: page.desc,
    url: `${DOMAIN}${route}`,
  });

  // HowTo
  if (page.steps.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to ${page.h1}`,
      step: page.steps.map((text, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        text,
      })),
    });
  }

  // FAQPage
  if (page.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }

  return schemas
    .map(
      (s) =>
        `<script type="application/ld+json">${JSON.stringify(s)}</script>`
    )
    .join("\n  ");
}

// OG image URL — same for all pages (site-wide brand image)
const OG_IMAGE = `${DOMAIN}/android-chrome-512x512.png`;

function injectMeta(
  template: string,
  route: string,
  title: string,
  desc: string,
  bodyContent: string,
  jsonLd: string
): string {
  const canonicalUrl = `${DOMAIN}${route}`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);

  return template
    // Replace <title>
    .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
    // Replace meta description
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${safeDesc}" />`
    )
    // Inject canonical + OG + JSON-LD right before </head>
    .replace(
      "</head>",
      `  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:site_name" content="PDFMount" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  ${jsonLd}
</head>`
    )
    // Replace empty <div id="root"></div> with static content
    .replace(
      /<div id="root"><\/div>/,
      `<div id="root">${bodyContent}</div>`
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.  SITEMAP BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildSitemap(allRoutes: string[]): string {
  const today = new Date().toISOString().split("T")[0];
  const urls = allRoutes
    .map(
      (r) => `  <url>
    <loc>${DOMAIN}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${r === "/" ? "1.0" : r.startsWith("/merge") || r.startsWith("/compress") ? "0.9" : "0.8"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.  MAIN
// ─────────────────────────────────────────────────────────────────────────────
function main() {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌  dist/index.html not found. Run `vite build` first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  const allPublicRoutes: string[] = [];
  let generated = 0;

  // --- Process tool routes ---
  for (const [route, seoKey] of Object.entries(toolRoutes)) {
    const page = seoPages[seoKey];
    if (!page) {
      console.warn(`⚠️  No SEO data for key "${seoKey}" (route: ${route})`);
      continue;
    }

    const staticContent = buildToolContent(page);
    const jsonLd = buildJsonLd(route, page);
    const html = injectMeta(template, route, page.title, page.desc, staticContent, jsonLd);

    const outDir = path.join(DIST, route.slice(1));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);

    allPublicRoutes.push(route);
    generated++;
    console.log(`✅  ${route}`);
  }

  // --- Static pages with RICH pre-rendered content ---
  const staticPageBuilders: Record<string, { title: string; desc: string; content: string }> = {
    "/": {
      title: "PDFMount - Free Online PDF Tools & Editor",
      desc: "Merge, split, compress, convert, sign, and secure PDF files online. Free, secure, and fast PDF tools inside your browser.",
      content: homepageContent,
    },
    "/pricing": {
      title: "Simple Pricing Plans - PDFMount Pro & Enterprise",
      desc: "Check out our affordable plans. Get larger file limits, batch processing, and priority support for PDFMount. Start free, upgrade anytime.",
      content: buildPricingContent(),
    },
    "/tools": {
      title: "All PDF Tools - PDFMount",
      desc: "Explore all 23+ free online PDF tools. Merge, split, compress, convert, rotate, and secure your files in seconds. No registration required.",
      content: buildToolsContent(),
    },
    "/about": {
      title: "About Us - PDFMount",
      desc: "Learn about PDFMount, our mission to build fast and secure PDF tools for everyone. Trusted by thousands of users worldwide.",
      content: buildAboutContent(),
    },
    "/faq": {
      title: "Frequently Asked Questions - PDFMount Help",
      desc: "Find answers to common questions about PDFMount, file limits, security, billing, and our free PDF tools.",
      content: buildFaqContent(),
    },
    "/contact": {
      title: "Contact Us - PDFMount Support",
      desc: "Get in touch with the PDFMount team for support, feedback, or enterprise inquiries. We respond within 24 hours.",
      content: `<div id="ssg-shell" style="font-family:system-ui,sans-serif;max-width:860px;margin:60px auto;padding:0 24px;color:#1a1a2e">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px">Contact Us</h1>
      <p style="font-size:1.1rem;color:#4b5563;line-height:1.7;margin-bottom:32px">Have questions, feedback, or need enterprise support? We'd love to hear from you. Reach out using the contact form on this page or email us directly.</p>
      <div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:32px;margin-bottom:32px">
        <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:16px">Get in Touch</h2>
        <p style="color:#4b5563;margin-bottom:12px">&#x1F4E7; Email: <a href="mailto:support@pdfmount.online" style="color:#2563eb">support@pdfmount.online</a></p>
        <p style="color:#4b5563;margin:0">We typically respond within 24 business hours.</p>
      </div>
      <div style="background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;padding:24px">
        <h2 style="font-size:1rem;font-weight:600;margin-bottom:12px">Common Topics</h2>
        <ul style="color:#374151;line-height:2;padding-left:20px;margin:0">
          <li>General support and tool issues</li>
          <li>Enterprise and team pricing inquiries</li>
          <li>Privacy and data security questions</li>
          <li>Feature requests and feedback</li>
          <li>Billing and subscription management</li>
        </ul>
      </div>
      ${NAV_LINKS}
    </div>`,
    },
    "/privacy": {
      title: "Privacy Policy - PDFMount",
      desc: "Learn how PDFMount secures and handles your documents. We do not store files permanently. Files are auto-deleted after 60 minutes.",
      content: buildPrivacyContent(),
    },
    "/terms": {
      title: "Terms of Service - PDFMount",
      desc: "Review the terms and conditions for using PDFMount's online PDF tools. No hidden clauses — transparent usage policies.",
      content: buildTermsContent(),
    },
    "/security": {
      title: "Security Policy - PDFMount",
      desc: "Learn about PDFMount's volatile in-memory sandboxing, TLS 1.3 encryption, and zero third-party data handover security standards.",
      content: buildSecurityContent(),
    },
    "/file-privacy": {
      title: "File Privacy Policy - PDFMount",
      desc: "We prioritize your privacy. Learn how your files are processed with zero human surveillance and auto-deleted after 60 minutes.",
      content: buildFilePrivacyContent(),
    },
    "/data-deletion": {
      title: "Data Deletion Policy - PDFMount",
      desc: "Details on our 60-minute auto-purge lifecycle and immediate manual data wiping controls. Complete data deletion policy.",
      content: buildDataDeletionContent(),
    },
  };

  for (const [route, meta] of Object.entries(staticPageBuilders)) {
    const homeJsonLd = route === "/" ? homepageJsonLd() : "";
    const html = injectMeta(template, route, meta.title, meta.desc, meta.content, homeJsonLd);

    const isPrivate = ["/dashboard", "/settings"].includes(route);

    if (route === "/") {
      fs.writeFileSync(templatePath, html);
      console.log(`✅  / (root index.html updated with rich content + JSON-LD)`);
    } else {
      const outDir = path.join(DIST, route.slice(1));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
      console.log(`✅  ${route}`);
    }

    if (!isPrivate) {
      allPublicRoutes.push(route);
    }
    generated++;
  }

  // De-duplicate and sort
  const uniqueRoutes = [...new Set(allPublicRoutes)].sort();

  // --- Write sitemap.xml ---
  const sitemap = buildSitemap(uniqueRoutes);
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
  console.log(`\n🗺  sitemap.xml written with ${uniqueRoutes.length} URLs`);

  console.log(`\n🎉  SEO pre-render complete — ${generated} pages generated`);
}

main();
