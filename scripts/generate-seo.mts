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
    title: "Convert JPG to PDF Online - Free Image to PDF | PDFMount",
    desc: "Convert JPG, PNG, and TIFF images to PDF documents online. Group multiple images into a single PDF. Free, secure, and preserves high image resolution.",
    h1: "Convert JPG Images to PDF Online",
    intro: "Convert camera snapshots, paper scans, and digital designs into a unified, professional PDF document. PDFMount parses your uploaded image files—including JPG, JPEG, PNG, WEBP, and BMP formats—to compile them into standard PDF page objects. The conversion process preserves your source resolution, avoids destructive compression artifacts, and maintains accurate layout dimensions. By processing tasks on secure server containers, we ensure that your original images remain private and clean. You can customize margins, select vertical or horizontal orientations, and rearrange the sequence of your pages directly within your browser. There is no software installation or registration required to start.",
    steps: [
      "Upload your JPG, PNG, or BMP image files from your local storage using our secure drag-and-drop window above.",
      "Rearrange the sequence of your image pages in the layout grid to organize your PDF document correctly before compilation.",
      "Set your layout preferences by selecting vertical or horizontal orientation, custom page margins, and standard page sizes like A4 or Letter.",
      "Click the conversion button to trigger our image processing engine, which wraps each image file in a vector PDF container.",
      "Save the generated PDF document directly to your device storage, featuring original image quality and zero watermarks."
    ],
    faqs: [
      {
        q: "What is the maximum number of images and file size limit for conversion?",
        a: "Guest users can upload up to 20 images with a maximum size limit of 25MB per file. Free registered accounts can upload files up to 50MB each, while Pro subscribers can convert up to 100 images of up to 500MB per file in a single processing batch. The processing engine handles large image volumes within ten seconds."
      },
      {
        q: "Will the converter compress my high-resolution images or reduce DPI quality?",
        a: "No, PDFMount does not downsample or compress your source files during this standard conversion. The engine reads the original pixel matrix and embeds each image into the PDF structure at its native resolution, maintaining DPI scaling and vector coordinates. Your output document remains sharp for professional printing and digital viewing."
      },
      {
        q: "Can I combine different image file formats like JPG and PNG together?",
        a: "Yes, you can upload a mix of JPG, JPEG, PNG, BMP, and WEBP files simultaneously. The rendering script processes each format, standardizing them into uniform page sizes based on your selected page settings. This is useful for compiling receipts, identification cards, and scanned pages of various formats into one document."
      },
      {
        q: "Does PDFMount add any branding watermarks or logos to the generated PDF?",
        a: "No, PDFMount does not add any watermarks or promotional logos to your output files. We respect your document ownership, and all generated files remain entirely clean and professional. The output document is ready for official submissions, academic applications, or corporate presentations without restriction."
      },
      {
        q: "How does PDFMount ensure the security of my uploaded files?",
        a: "We implement strict security protocols to safeguard your personal data. All files are transferred using TLS 1.3 encryption protocols and processed in isolated, volatile server environments. Our automated cleanup script purges all uploaded images and converted PDFs from our temporary cache exactly 60 minutes after execution, leaving zero copies behind."
      }
    ],
    detailedContent: [
      "Our JPG to PDF converter employs an advanced image processing engine that directly wraps image streams into standard PDF containers. Instead of performing destructive rasterization or file compression, the system extracts the image payload and writes it directly to the page stream metadata, preserving every original pixel. The rendering engine computes the optimal bounding box for each image, adjusting page coordinates to prevent clipping or layout distortion. You can configure precise margins and scale images to match paper sizes like A4 or US Letter, ensuring standard layouts for print.",
      "Security is a core component of the PDFMount architecture. Every document conversion task runs within a secure, isolated sandbox environment that has no access to external networks. We do not read, extract, or share your document contents, ensuring absolute confidentiality for sensitive forms, identity scans, and invoices. The system enforces a strict zero retention policy. All uploaded image files and the resulting PDF documents are permanently deleted from our temporary storage drives exactly 60 minutes after processing, leaving no residual traces.",
      "This converter serves a wide range of professional and academic needs. Students can combine multiple homework snapshots or handwritten notes into a single document for online submissions. Legal professionals can compile photo evidence, receipt scans, and signed paper contracts into organized document archives. Corporate teams can convert design mockups and marketing drafts into polished PDF portfolios for client reviews. By offering a fast, web-native utility, PDFMount eliminates the need for expensive desktop licenses."
    ]
  },
  "pdf-jpg": {
    title: "Convert PDF to JPG Online - Export PDF Pages Free | PDFMount",
    desc: "Convert PDF pages to high-quality JPG or PNG images online. Extract images from PDF or rasterize pages to sharp images. Secure and no watermark.",
    h1: "Convert PDF Pages to JPG Images Online",
    intro: "Transform complex PDF pages into standard, high-resolution JPG or PNG image files. PDFMount uses a fast rendering engine that reads vector shapes, embedded text strings, and layout structures to convert each page into a separate image. The conversion process preserves the visual fidelity of your layout, rendering fine typography and vector graphics at standard DPI settings. This tool operates entirely inside secure, isolated sandbox containers on our servers, ensuring your files are never exposed. You can select specific pages to convert or batch-extract all pages into a consolidated ZIP archive. No account creation or installation is required.",
    steps: [
      "Select and upload the PDF document you wish to convert from your computer or mobile device into the secure upload box.",
      "Choose your preferred output format, selecting either JPG format for standard images or PNG format for lossless graphic files.",
      "Adjust the rendering quality setting, choosing between standard resolution for web use or high-DPI options for detailed print mockups.",
      "Click the processing button to trigger our rendering engine, which parses the PDF streams and rasterizes each page to image format.",
      "Download your converted image files immediately as a single compressed ZIP folder, keeping your original page sequences intact."
    ],
    faqs: [
      {
        q: "What are the file size and page limits for PDF to JPG conversion?",
        a: "Unregistered guest users can convert files up to 25MB, while registered free accounts can upload files up to 50MB. Pro tier subscribers can convert documents up to 500MB. The conversion system has no strict page limits and can process multi-page PDFs containing hundreds of pages into ZIP archives quickly."
      },
      {
        q: "Will the text and drawings remain sharp after conversion to images?",
        a: "Yes, our converter uses a high-fidelity rasterization engine that renders PDF vector paths, text objects, and margins at high resolution. You can select up to 300 DPI to ensure small fonts and technical diagrams remain legible. The resulting JPG files display clearly on all screens."
      },
      {
        q: "Can I choose to convert only a few specific pages from my PDF?",
        a: "Yes, you can specify individual pages or ranges in the settings panel prior to conversion. The interface displays a visual grid of your document, allowing you to select target sheets for rasterization. This prevents you from downloading unwanted images and saves local storage."
      },
      {
        q: "Are there any watermarks added to the exported JPG images?",
        a: "No, PDFMount has a strict policy against adding watermarks or branding text to your files. The exported images will contain only the exact content of your original PDF. They are suitable for commercial projects, website integration, or presentation slides."
      },
      {
        q: "How long does PDFMount keep my uploaded PDFs and converted JPG files?",
        a: "We enforce a strict security policy to protect client data. All uploaded documents and generated JPG files are stored in volatile server caches and are completely purged after 60 minutes. We do not inspect your document content, and no copies are stored on our servers."
      }
    ],
    detailedContent: [
      "Our PDF to JPG converter relies on a sophisticated rendering engine that parses PDF stream metadata to recreate vector lines, shapes, and font glyphs before rasterization. This ensures layout fidelity across all output images. The conversion pipeline dynamically handles embedded color spaces like CMYK and RGB, ensuring that color matching remains precise. You can select custom DPI scaling factors—ranging from 72 DPI for lightweight web displays to 300 DPI for high-quality printing—to achieve the perfect balance between file size and image clarity.",
      "Privacy is built directly into our document processing architecture. Every conversion task runs in an isolated virtual sandbox that has no persistent storage access. This prevents unauthorized processes from reading your documents. The platform operates under a strict zero retention policy, meaning we do not copy, share, or log your files. All source PDFs and resulting JPG images are permanently purged from our drives exactly 60 minutes after processing, ensuring compliance with strict data protection regulations.",
      "This converter is highly useful for professionals across various industries. Digital marketers can convert PDF design mockups into JPG images for easy social media sharing. Legal specialists can extract single pages of contracts as image files to insert into presentation decks or reports. Students can convert PDF slides and handouts into image files to view offline on mobile devices. By providing a secure, browser-based tool, PDFMount simplifies document management and eliminates the need for desktop installations."
    ]
  },
  "word-pdf": {
    title: "Word to PDF Converter - Convert DOCX to PDF Online | PDFMount",
    desc: "Convert Microsoft Word documents (DOCX and DOC) to PDF online free. Keep original formatting, styles, tables, and fonts. Secure, fast, and no watermark.",
    h1: "Convert Word (DOCX) to PDF Online",
    intro: "Convert your editable Microsoft Word documents into secure, non-editable PDF files online. PDFMount's conversion engine parses DOCX and DOC file structures, translating paragraph styles, font hierarchies, tables, and margins into standard PDF vector commands. This layout preservation ensures that your document looks exactly as intended on all devices, preventing the layout shifts that often occur when sharing raw editable documents. The conversion runs on secure, isolated server nodes, keeping your private documents confidential. You can upload large DOCX files and generate print-ready PDFs in seconds, without downloading desktop applications or creating an account.",
    steps: [
      "Upload your Word document in DOCX or DOC format from your computer or mobile storage using the secure upload tool.",
      "Configure optional page settings, such as page size standardizations, margin widths, and orientation configurations if required.",
      "Click the conversion button to initialize our layout parser, which maps Word paragraph styling directly to PDF vector paths.",
      "Wait a few seconds for the document processing engine to compile your new, stable PDF document on our secure servers.",
      "Save the converted PDF file directly to your device storage, ready for official submission and clean printing without watermarks."
    ],
    faqs: [
      {
        q: "What are the document size limits for converting Word to PDF?",
        a: "Guest users can upload Word documents up to 25MB in size. Registered free accounts can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our processing engine is optimized to handle complex, text-heavy reports containing hundreds of pages in under ten seconds."
      },
      {
        q: "Will the converter preserve my tables, custom fonts, and lists?",
        a: "Yes. The layout engine parses DOCX XML structures to reconstruct font weights, paragraph styles, numbered lists, and cell margins. Custom formatting is converted into vector coordinates inside the PDF document, ensuring that your output file maintains layout fidelity and remains readable."
      },
      {
        q: "Can I convert old Microsoft Word DOC formats as well?",
        a: "Yes, our converter supports both the newer DOCX format and the legacy binary DOC format. The conversion engine translates the older binary layouts into standard PDF structures, allowing you to modernize and preserve old business documents for digital archiving."
      },
      {
        q: "Does PDFMount place any watermarks on my converted PDF document?",
        a: "No, PDFMount does not add watermarks, branding elements, or promotional covers to your converted files. The output PDF remains clean and matches your original formatting exactly. This ensures that your documents look highly professional for business or academic submissions."
      },
      {
        q: "Is my document data secure when using the Word to PDF converter?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all uploaded files and converted PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our Word to PDF converter uses a proprietary layout engine that parses DOCX XML document structures rather than using basic HTML conversions. The parser maps paragraph properties, indentations, table grids, and embedded images directly to PDF vector coordinates, ensuring high layout fidelity. Fonts are embedded as subset vectors within the output file, preserving the original appearance of text without relying on system fonts. Embedded image files are kept at their native resolution, avoiding pixelation and keeping your graphics sharp.",
      "Security is integrated into every step of our file processing pipeline. Files are uploaded via encrypted channels using TLS 1.3 and executed inside isolated sandbox containers that are wiped after each task. We enforce a strict zero retention policy, meaning we do not inspect, index, or store your documents permanently. All uploaded Word files and converted PDF outputs are permanently deleted from our temporary storage systems exactly 60 minutes after the conversion, guaranteeing absolute confidentiality.",
      "This converter is ideal for professionals and students who require reliable document sharing. Business teams can convert contracts, invoices, and proposals to PDF to ensure formatting is locked prior to client signature. Legal professionals can convert briefs and letters, ensuring the text remains searchable and readable across different operating systems. Students can compile essays and research papers, ensuring that margins and references do not shift during grading. PDFMount provides a fast, browser-based solution that replaces expensive desktop software."
    ]
  },
  "pdf-word": {
    title: "PDF to Word Converter - Convert PDF to DOCX Online | PDFMount",
    desc: "Convert PDF documents to editable Microsoft Word files (DOCX) online. Reconstructs layouts, paragraphs, and tables. Secure and no watermark.",
    h1: "Convert PDF to Word Online Free",
    intro: "Convert non-editable PDF documents back into fully editable Microsoft Word DOCX files. PDFMount's reconstruction engine parses your PDF page by page, analyzing text placements, font weights, and table grids to build a dynamic Word document. Instead of just exporting raw text block streams, our converter attempts to reconstruct flowing paragraph blocks, bulleted lists, and structured tables, making manual editing simple. The entire conversion process occurs on secure, isolated server containers, protecting your private document contents from third-party access. You can upload large PDFs, extract tables, and start editing in Word immediately without installing external software or creating an account.",
    steps: [
      "Select and upload the PDF file you wish to convert from your computer or mobile storage using our secure upload panel.",
      "Choose your layout preference, opting for flowing text paragraphs for easy editing or structured frames to preserve exact layout boundaries.",
      "Click the conversion button to trigger the reconstruction engine, which translates PDF text streams into standard editable DOCX elements.",
      "Allow our document processing engine to parse the text nodes, identify tables, and compile the Word file in seconds.",
      "Save the generated DOCX file to your device storage, ready for editing in Microsoft Word with zero added watermarks."
    ],
    faqs: [
      {
        q: "What are the document size limits for converting PDF to Word?",
        a: "Guest users can upload PDF files up to 25MB for conversion. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload large documents up to 500MB. The conversion engine is optimized to process text-heavy books or reports in under fifteen seconds."
      },
      {
        q: "Will the Word document layout match my original PDF formatting?",
        a: "Our reconstruction engine uses advanced text grouping algorithms to identify paragraphs, headers, and lists. Complex designs with overlapping vectors might require minor adjustments, standard text documents, invoices, and resumes are reconstructed with high layout fidelity. This ensures your text remains editable and your font structures are preserved. The output file is fully compatible with Microsoft Word."
      },
      {
        q: "Can the tool convert scanned PDF documents using OCR?",
        a: "Yes, PDFMount integrates Optical Character Recognition (OCR) technology. If you upload a scanned PDF or a document containing pages saved as images, our OCR system extracts the text characters and compiles them into editable paragraph text within the resulting Word document. This allows you to edit scanned paper files easily."
      },
      {
        q: "Will my converted DOCX file contain any PDFMount watermarks?",
        a: "No, PDFMount does not inject branding overlays or watermark stamps into your converted files. The output Word document will contain only your original text and layout, keeping it ready for professional office edits, academic updates, or official submissions. You do not need to manually delete any advertisements."
      },
      {
        q: "How does PDFMount protect the privacy of my sensitive PDF files?",
        a: "Document privacy is our core priority. All transfers are secured using TLS 1.3 protocols, and files are processed inside isolated virtual sandboxes. All uploaded PDFs and converted Word files are permanently deleted from our servers after 60 minutes, ensuring your files remain private."
      }
    ],
    detailedContent: [
      "Our PDF to Word converter uses a structural layout reconstruction algorithm that goes beyond standard text extraction. The engine analyzes the visual flow of the PDF, grouping characters into words, words into lines, and lines into paragraph blocks. It automatically identifies font properties like weights, sizes, and colors, matching them to standard typography in Microsoft Word. Tables are reconstructed by detecting intersecting vector lines, allowing you to edit cell contents and adjust column widths directly within DOCX tables without breaking formatting.",
      "We prioritize data confidentiality in all operations. Our servers use TLS 1.3 encryption for secure file uploads and downloads. The conversion process is executed in isolated containers, which isolates your data from other users and prevents unauthorized access. The system is governed by a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded documents and processed Word files are permanently deleted from our cache after exactly 60 minutes.",
      "This tool is highly valuable for users who need to modify read-only files. Business professionals can convert PDF contracts to DOCX to make revisions or copy sections into new proposals. Legal assistants can convert PDF briefs to Word to extract case facts or edit boilerplate language. Students can convert reference guides and textbooks to copy quotes and format notes for study materials. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive software licenses."
    ]
  },
  rotate: {
    title: "Rotate PDF Pages Online - Rotate PDF Files Free | PDFMount",
    desc: "Rotate sideways PDF pages permanently online. Choose individual pages or rotate the entire document to vertical layout. Secure and no watermark.",
    h1: "Rotate PDF Pages Permanently Online",
    intro: "Correct the orientation of upside down or sideways PDF documents instantly in your browser. PDFMount's rotation tool provides a visual editing interface where you can rotate individual pages or the entire document to vertical or horizontal orientation. The rotation engine modifies the page geometry dictionary tags within the underlying PDF file structure permanently rather than just applying a temporary visual markup overlay. This ensures compatibility across all standard PDF viewers and print utilities without altering the text layers, vector assets, or font configurations. The tool is executed on secure, isolated servers, protecting your private files and business reports from external access.",
    steps: [
      "Select and upload the PDF file you wish to rotate from your computer, cloud storage, or mobile storage using our secure upload panel above.",
      "Hover over individual page previews in the grid and click the rotation arrows to turn them 90, 180, or 270 degrees.",
      "Select whether to apply the rotation to specific individual pages, even or odd pages, or the entire set of pages.",
      "Click the start button to execute the layout geometry adjustments permanently on our high-speed, secure server-side container nodes.",
      "Save the rotated PDF document directly to your device storage, keeping all internal formatting, vector files, and metadata intact."
    ],
    faqs: [
      {
        q: "What are the file size and page limitations for rotating PDFs?",
        a: "Guest users can upload PDF files up to 25MB for rotation tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limitations and rotates large files within ten seconds."
      },
      {
        q: "Is the page orientation permanent when I open it in other programs?",
        a: "Yes, our tool modifies the internal MediaBox and Rotate geometry tags within the PDF stream itself. This makes the rotation permanent, ensuring that the pages render in the corrected orientation on all standard web browsers, desktop readers, and office printers."
      },
      {
        q: "Can I rotate only a single page inside a large document?",
        a: "Yes, our interactive grid interface displays visual page previews, letting you select and rotate specific individual sheets without affecting the rest of the document. You can customize the layout of each page individually to correct scanning errors."
      },
      {
        q: "Does PDFMount add any watermark stamp to my rotated PDF file?",
        a: "No, PDFMount does not inject watermarks, branding elements, or promotional advertisements into your files. The output PDF remains clean and matches your original file formatting. It is ready for official B2B submissions, client contracts, and academic applications."
      },
      {
        q: "How does PDFMount protect the privacy of my uploaded documents?",
        a: "We prioritize document security. All file uploads are secured with TLS 1.3 encryption, and rotation tasks are executed in isolated sandboxes. All uploaded files and rotated output files are permanently deleted from our cache after 60 minutes."
      }
    ],
    detailedContent: [
      "Our PDF page rotation tool modifies the underlying PDF page dictionary, specifically updating the Rotate key which dictates visual rendering coordinates. Unlike tools that rasterize pages to images and rotate them—which degrades text readability and reduces DPI quality—our tool performs metadata geometry adjustments. This ensures layout fidelity, keeps text selectable, and preserves high-resolution vector assets and font definitions. Your document remains fully zoomable on all devices.",
      "We implement advanced security protocols to protect your documents. File transfers use TLS 1.3 encryption, and operations are run within isolated virtual sandboxes that prevent cross-user data access. We enforce a strict zero retention policy: we do not read, store, or log your document contents. All uploaded files and processed PDFs are permanently deleted from our temporary drives exactly 60 minutes after execution, leaving no residual traces.",
      "This tool is highly valuable for scanning workflows. Lawyers and administrators often deal with contract pages that are scanned sideways or upside down in document feeders. Students can orient scanned homework sheets or book pages to readable formats before online submissions. Business teams can correct page orientations in reports, invoices, and portfolios to present clean, professional layouts. PDFMount offers a fast, browser-native rotation utility that replaces expensive PDF editors."
    ]
  },
  remove: {
    title: "Delete PDF Pages Online - Remove Pages from PDF | PDFMount",
    desc: "Delete unnecessary pages from your PDF online free. View pages in an interactive grid and discard sheets before sharing. Secure, fast, and no watermark.",
    h1: "Delete Pages from PDF Online Free",
    intro: "Remove unwanted or confidential pages from your PDF documents online with ease. PDFMount's page removal tool displays your document pages in an interactive layout grid, allowing you to select and discard individual sheets, blank pages, or outdated sections. The processing engine rebuilds the PDF structure, updating the page tree index and removing associated object streams without affecting the quality of the remaining pages. The tool runs on secure, isolated servers, protecting your private files and business agreements. You can streamline your files, reduce their size, and share only the necessary pages with clients and team members instantly.",
    steps: [
      "Select and upload the PDF document containing pages you wish to delete into the secure upload drop zone above.",
      "View the visual page previews in the interactive grid interface to identify pages you want to remove.",
      "Click the delete icon on individual page previews or select a custom range of page numbers to discard.",
      "Click the start compilation button to execute the page stream removal process on our secure server-side container nodes in seconds.",
      "Save the updated PDF document directly to your local storage device, featuring a clean layout and zero watermark stamps."
    ],
    faqs: [
      {
        q: "What are the file size and page limitations for deleting PDF pages?",
        a: "Guest users can upload PDF files up to 25MB for page deletion tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and processes files in seconds."
      },
      {
        q: "Can I restore pages after deleting them and saving the file?",
        a: "No, once the page stream is removed and the new PDF is compiled, the discarded pages are permanently deleted from the document. We recommend keeping a backup copy of your original document in case you need to access those pages again."
      },
      {
        q: "Will deleting pages affect interactive form fields or links in the remaining pages?",
        a: "No, our engine updates the parent page tree references and object coordinates while keeping the remaining interactive elements intact. Active form fields, bookmarks, and internal link targets in the remaining pages continue to function as intended without formatting loss."
      },
      {
        q: "Does PDFMount add any branding watermarks to the output document?",
        a: "No, PDFMount does not add watermarks, promotional logos, or cover sheets to your files. The output PDF remains clean and matches the visual layout of your original pages. It is ready for official submissions, client contracts, and academic applications."
      },
      {
        q: "How long are my documents stored on PDFMount servers?",
        a: "We enforce a strict security policy to protect your personal data. All uploaded documents and processed PDFs are stored in volatile server caches and are completely purged after 60 minutes. We do not inspect your document content, and no copies are stored."
      }
    ],
    detailedContent: [
      "Our page removal tool operates by parsing the PDF cross-reference table and updating the page tree array. Instead of converting pages into rasterized images and re-saving them—which degrades image DPI and text sharpness—the engine performs clean object extraction. It strips the byte offsets of the deleted pages and rebuilds the file header, maintaining layout fidelity, keeping all remaining text selectable, and keeping internal links active.",
      "Data security is built into our document processing pipeline. All data transfers are encrypted using TLS 1.3 protocols, and files are processed inside isolated virtual sandboxes. We enforce a strict zero retention policy, meaning we do not read, share, or log your document contents. All uploaded files and output PDFs are permanently deleted from our servers exactly 60 minutes after processing, leaving no backup copies.",
      "Discarding private appendix pages, blank sheets, or outdated draft sections secures your documents and reduces file size. Lawyers can strip irrelevant case sheets before filing court documents, ensuring confidentiality. Business teams can remove outdated pricing charts or redundant slides from company presentations before sharing them with clients. Students can remove outdated page formats from homework assignments. PDFMount offers a fast, browser-native solution that replaces expensive desktop software."
    ]
  },
  extract: {
    title: "Extract PDF Pages Online - Save Specific PDF Pages | PDFMount",
    desc: "Extract specific pages from your PDF online. Select pages visually or input page ranges to create a new PDF containing only those pages free.",
    h1: "Extract Pages from PDF Online Free",
    intro: "Isolate and save specific pages from large PDF documents using our online extraction tool. PDFMount provides an interactive workspace where you can click individual pages to select them or input custom page ranges to compile a new, standalone PDF document. The extraction engine copies the target page streams and metadata objects, creating a lightweight file while maintaining the layout quality, text searchability, and graphic resolution of the original pages. The tool runs on secure, isolated servers, protecting your confidential files. You can extract essential pages from eBooks, reports, or invoices without downloading software.",
    steps: [
      "Upload the PDF document containing pages you wish to extract using our secure drag-and-drop zone above.",
      "View the visual page previews in the interactive layout grid and click the pages you want to select for extraction.",
      "Alternatively, input specific page numbers or custom page ranges like 1-5, 8, 12 in the manual options panel to define your target sheets.",
      "Click the start extraction button to trigger our engine, which copies the selected page streams on secure server containers.",
      "Save the generated PDF document directly to your device storage, featuring only your selected pages and zero watermark stamps."
    ],
    faqs: [
      {
        q: "What are the file size and page limitations for page extraction?",
        a: "Guest users can upload PDF files up to 25MB for page extraction tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page limits and processes files in seconds."
      },
      {
        q: "Will the extracted pages contain active links and searchability?",
        a: "Yes, our engine performs stream copy extraction rather than page rasterization. This preserves all text vectors, internal links, bookmarks, forms, and custom formatting, meaning your text remains searchable and all links stay active in the new document."
      },
      {
        q: "Can I extract non-consecutive pages into a single PDF?",
        a: "Yes, you can select any combination of non-consecutive pages using our visual grid or enter them as comma-separated values in the input box. The extraction tool will gather the selected pages and compile them into a unified PDF file."
      },
      {
        q: "Does PDFMount add any branding watermarks to the extracted PDF?",
        a: "No, PDFMount does not add watermarks, branding text, or covers to your extracted files. The output PDF remains clean and matches your original page layouts exactly, making it suitable for official submissions, client contracts, and academic applications."
      },
      {
        q: "Is my document data secure during the extraction process?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all files and extracted PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our page extraction tool uses a stream-level copying process that preserves the exact byte payload of your pages. By copying page dictionaries and cross-reference records rather than re-rendering pages, the engine avoids compressing images or reducing DPI quality. This layout preservation keeps your vector paths sharp, fonts embedded, and interactive link elements functioning, delivering a high-quality standalone file that is smaller and easier to share.",
      "Security is integrated into every step of our file processing pipeline. Files are uploaded via encrypted channels using TLS 1.3 and executed inside isolated sandbox containers that are wiped after each task. We enforce a strict zero retention policy, meaning we do not inspect, index, or store your documents permanently. All uploaded files and extracted outputs are permanently deleted from our temporary storage systems exactly 60 minutes after the conversion, guaranteeing absolute confidentiality.",
      "This tool is perfect for exporting chapters from ebooks, saving specific receipts from a bulk statement, or sending single contract sheets to clients. Lawyers can extract relevant evidentiary pages to share with courts. Business professionals can save project summaries from large corporate reports. Students can extract specific research paper articles for study materials. PDFMount provides a free, fast, browser-native page extraction utility that replaces expensive desktop software."
    ]
  },
  organize: {
    title: "Organize PDF Pages Online - Rearrange PDF Files | PDFMount",
    desc: "Reorder, delete, and rearrange pages in your PDF document online. Use a drag-and-drop page editor to structure PDFs free. Secure and no watermark.",
    h1: "Organize and Rearrange PDF Pages Online",
    intro: "Rearrange and restructure your PDF documents online with our visual organization tool. PDFMount provides a drag-and-drop canvas where you can reorder pages, rotate sideways sheets, or delete unwanted pages in real-time. The processing engine rebuilds the file structure, updating the page dictionary index and keeping the underlying text streams, vector graphics, and image assets intact. The tool runs on secure, isolated servers, protecting your confidential business reports and personal files. You can organize page layouts and clean up document structures inside your browser without installing desktop software.",
    steps: [
      "Select and upload the PDF file you wish to organize from your local device folder into the secure upload drop zone above.",
      "Drag and drop the page previews in the interactive grid to rearrange the page sequence according to your specific needs.",
      "Use the page options to rotate sideways pages or click the delete icon to remove unwanted sheets from the document.",
      "Click the start organization button to execute the layout reorganization process on our secure server-side container nodes.",
      "Save the organized PDF document directly to your local storage device, featuring a clean layout and zero watermark stamps."
    ],
    faqs: [
      {
        q: "What are the file size and page limits for organizing PDF pages?",
        a: "Guest users can upload PDF files up to 25MB for page organization tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and reorganizes files in seconds."
      },
      {
        q: "Will the organized pages retain interactive form fields and links?",
        a: "Yes, our engine performs file index reorganization rather than page rasterization. This preserves all text vectors, internal links, bookmarks, forms, and custom formatting, meaning your text remains searchable and all links stay active in the new document."
      },
      {
        q: "Can I combine and organize pages from multiple PDFs at once?",
        a: "Yes, you can upload multiple PDF documents simultaneously. The tool allows you to merge the files and then use the interactive canvas to arrange, delete, and reorder their combined sheets before compiling the final PDF document."
      },
      {
        q: "Does PDFMount add any branding watermarks to the organized document?",
        a: "No, PDFMount does not add watermarks, branding text, or cover sheets to your files. The output PDF remains clean and matches your original page layouts exactly, making it suitable for official submissions, client contracts, and academic applications."
      },
      {
        q: "Is my document data secure when organizing pages on this platform?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all files and organized PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our page organization tool operates by parsing the PDF cross-reference table and updating the page tree array. Instead of converting pages into rasterized images and re-saving them—which degrades image DPI and text sharpness—the engine performs clean object index relocation. It updates the byte offsets of the pages and rebuilds the file header, maintaining layout fidelity and keeping all remaining text selectable.",
      "We prioritize data confidentiality in all operations. Our servers use TLS 1.3 encryption for secure file uploads and downloads. The reorganization process is executed in isolated containers, which isolates your data from other users and prevents unauthorized access. The system is governed by a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded documents and organized files are permanently deleted from our cache after exactly 60 minutes.",
      "Having pages out of order makes documents look messy. Business managers can organize vendor contracts, reports, and presentations to present clean structures. Legal professionals can organize evidence sheets in preparation for filings, ensuring correct sequences. Students can reorder research articles and scanned homework sheets before online submissions. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive software licenses."
    ]
  },
  "crop-pdf": {
    title: "Crop PDF Online - Crop PDF Margins and Borders | PDFMount",
    desc: "Crop PDF pages online. Define custom margins and page boundaries to trim white spaces and crop PDF sheets free. Secure, fast, and no watermark.",
    h1: "Crop PDF Page Boundaries Online Free",
    intro: "Trim empty white margins and adjust page boundaries of your PDF files online with precision. PDFMount's crop tool provides an interactive interface where you can define crop margins for individual pages or standard paper dimensions for the entire document. The cropping engine modifies the page layout metadata tags, specifically updating the CropBox and MediaBox parameters within the PDF structure rather than rasterizing pages. This preserves the original visual quality of your text layers, embedded images, and vector assets. The tool runs on secure, isolated servers, protecting your files from third-party access.",
    steps: [
      "Upload the PDF document you wish to crop from your computer or mobile storage using the secure upload zone above.",
      "Use the interactive bounding box handles to visually define the target crop area on the page preview canvas.",
      "Alternatively, input precise margin dimensions in pixels or inches in the settings panel to define crop boundaries manually.",
      "Click the start crop button to execute the page boundary adjustments on our secure server-side container nodes instantly.",
      "Save the cropped PDF document directly to your device storage, featuring trimmed margins, sharp layouts, and zero watermark stamps."
    ],
    faqs: [
      {
        q: "What are the file size and page limits for cropping PDFs?",
        a: "Guest users can upload PDF files up to 25MB for page cropping tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page limits and crops files in seconds."
      },
      {
        q: "Does cropping permanently delete the content outside the cropped area?",
        a: "It clips the visual page boundaries by updating the MediaBox and CropBox layout tags. While the hidden content is not visible to PDF readers, it is not completely redacted. For highly confidential details, you should use a dedicated PDF redaction tool."
      },
      {
        q: "Can I apply different crop margins to different pages in the same PDF?",
        a: "Yes, our settings panel allows you to crop either the entire document, specific page ranges, or customize margins for individual pages. This is useful for trimming scanned pages that have uneven alignments."
      },
      {
        q: "Does PDFMount add any branding watermarks to the cropped PDF?",
        a: "No, PDFMount does not add watermarks, branding text, or cover sheets to your files. The output PDF remains clean and matches your cropped layouts, making it suitable for official submissions, client contracts, and academic applications."
      },
      {
        q: "Is my document data secure when cropping files on PDFMount?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all files and cropped PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our cropping tool operates by updating the CropBox and MediaBox parameters in the PDF page dictionary. Instead of converting pages into rasterized images and re-saving them—which degrades image DPI and text sharpness—the engine performs metadata adjustments. This layout preservation ensures that your vector paths remain sharp, fonts stay embedded, text remains selectable, and existing hyperlinks continue working, delivering a high-quality standalone file that displays cleanly.",
      "Security is a core priority for all document processing operations. All data transfers are encrypted using TLS 1.3 protocols, and file execution runs within isolated server container sandboxes. We enforce a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded files and cropped PDFs are permanently deleted from our cache after exactly 60 minutes, leaving no backup copies.",
      "Trimming scanned margins makes PDFs look clean on e-readers and mobile screens. Business managers can crop page margins to standardize presentation slides. Legal professionals can trim white spaces from scanned case files to fit standard print layouts. Students can crop excess margins from textbook pages to make reading on tablet screens more comfortable. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive desktop licenses."
    ]
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Online - Number PDF Pages | PDFMount",
    desc: "Add page numbers to your PDF document online. Choose custom positions, fonts, colors, and numbering formats (e.g. Page X of Y) free.",
    h1: "Add Page Numbers to PDF Online Free",
    intro: "Index your documents with clean, professional page numbering stamps automatically. PDFMount's page numbering tool provides an interactive interface where you can configure numbering formats, select specific font styles, adjust size coordinates, and choose text alignment. The stamping engine writes vector text layers directly into the PDF page dictionary structures rather than applying flat overlays, ensuring that your text remains searchable and fully zoomable. The tool operates on secure, isolated server nodes, keeping your confidential files protected from unauthorized access. You can number contracts, reports, or textbooks within seconds inside your browser without installing desktop software.",
    steps: [
      "Upload the PDF document you wish to index from your computer or mobile storage using our secure upload panel above.",
      "Choose your preferred layout position for the page numbers, selecting from options like bottom-center, top-right, or top-center.",
      "Select your text formatting preferences, choosing custom font sizes, text alignments, starting page numbers, and numbering styles like X of Y.",
      "Click the start numbering button to execute the vector stamping process on our secure, high-speed server-side container nodes instantly.",
      "Save the numbered PDF document directly to your device storage, featuring clean vector page stamps and zero branding watermarks."
    ],
    faqs: [
      {
        q: "What are the file size and page limitations for page numbering?",
        a: "Guest users can upload PDF files up to 25MB for page numbering tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limitations and numbers files in seconds."
      },
      {
        q: "Can I exclude the first page or cover sheet from numbering?",
        a: "Yes, our settings panel includes options to skip numbering on the first page. This allows you to maintain a clean cover sheet for formal reports, student assignments, and business presentations while keeping the remaining pages consecutively numbered."
      },
      {
        q: "Will adding page numbers flatten my document pages or lose layout quality?",
        a: "No, our tool stamps page numbers as an independent vector text layer inside the PDF structure. Your original fonts, embedded graphics, and text alignment coordinates are preserved at high resolution. The pages remain fully selectable and search-friendly."
      },
      {
        q: "Does PDFMount add any branding logos or watermarks to my document?",
        a: "No, PDFMount does not inject watermarks, cover pages, or branding headers into your files. The output PDF remains clean and matches your original page layouts exactly. The stamped page numbers are formatted in a highly professional styling of your choice."
      },
      {
        q: "How does PDFMount ensure the confidentiality of my uploaded documents?",
        a: "We take data privacy seriously. All file uploads are secured with TLS 1.3 encryption, and numbering tasks are executed in isolated sandboxes. All uploaded files and numbered output files are permanently deleted from our cache after exactly 60 minutes."
      }
    ],
    detailedContent: [
      "Our page numbering tool uses a vector canvas overlay engine that inserts text elements directly into the page content stream coordinates. The system calculates the page height and width, placing number characters at precise offsets based on your settings. By adding numbers as native vector text streams rather than rasterizing pages, the utility preserves layout fidelity, keeps text readable, and maintains high-resolution image details without changing the original file DPI.",
      "Security is integrated into every step of our file processing pipeline. Files are uploaded via encrypted channels using TLS 1.3 and executed inside isolated sandbox containers that are wiped after each task. We enforce a strict zero retention policy, meaning we do not inspect, index, or store your documents permanently. All uploaded files and numbered outputs are permanently deleted from our temporary storage systems exactly 60 minutes after execution, guaranteeing absolute confidentiality.",
      "Adding page numbers makes business reports, academic thesis papers, and legal case sheets easy to navigate. Lawyers can index multiple pages of discovery evidence to ensure structured reviews. Corporate teams can number draft presentations, handouts, and invoices before distributing them to clients. Students can format research assignments to meet submission guidelines. PDFMount provides a free, fast, browser-native page numbering utility that replaces expensive desktop software licenses."
    ]
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
    title: "Add Header and Footer to PDF Online | PDFMount",
    desc: "Add custom headers and footers to PDF files online free. Stamp titles, page numbers, dates, or company names on page headers and footers.",
    h1: "Add Header and Footer to PDF Online Free",
    intro: "Professionalize your documents by adding customized header and footer lines onto your PDF files online. PDFMount's stamping utility provides a flexible workspace where you can input custom text fields—such as document titles, company names, dates, or copyrights—and align them on page header or footer coordinates. The engine writes vector text layers directly into the PDF content stream, ensuring that your text remains searchable and prints cleanly. The tool operates on secure, isolated servers, protecting your B2B agreements and personal papers. You can standardise layouts and add branding coordinates without installing desktop software.",
    steps: [
      "Upload the PDF file you wish to modify from your computer or mobile storage using the secure upload tool above.",
      "Input your custom text fields for the header and footer margins inside the visual configuration panel.",
      "Select your text formatting options, including font sizes, custom colors, margin offsets, and the specific pages to be stamped.",
      "Click the start stamping button to execute the header and footer stamping process on our secure server-side container nodes.",
      "Save the stamped PDF document directly to your device storage, featuring professional margins, clean vector text, and zero watermarks."
    ],
    faqs: [
      {
        q: "What are the file size limits and tool quotas for adding headers and footers?",
        a: "Guest users can upload PDF files up to 25MB for header and footer tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and processes files in seconds."
      },
      {
        q: "Can I apply headers and footers to specific pages only?",
        a: "Yes, our settings panel allows you to customize the target page range. You can choose to skip the cover sheet, apply stamps to even or odd pages only, or select a custom range of page numbers to ensure proper document formatting."
      },
      {
        q: "Will adding headers and footers affect my original PDF content or formatting?",
        a: "No, our engine overlays headers and footers as independent vector layers inside the PDF structure. The underlying text, fonts, margins, and high-resolution images are preserved without formatting loss or page rasterization, keeping your document sharp on all screens."
      },
      {
        q: "Does PDFMount add any promotional branding to my stamped files?",
        a: "No, PDFMount does not add watermarks, promotional logos, or cover sheets to your files. The output PDF remains clean and matches your original layouts exactly. The stamped headers and footers are formatted in a highly professional styling of your choice."
      },
      {
        q: "Is my document data secure when stamping files on this platform?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all files and stamped PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our header and footer tool operates by injecting text objects directly into the PDF content stream coordinates. The system calculates the page height and width, placing text characters at precise offsets based on your settings. By adding metadata headers as native vector text streams rather than rasterizing pages, the utility preserves layout fidelity, keeps text readable, and maintains high-resolution image details without changing the original file DPI.",
      "Security is integrated into every step of our file processing pipeline. Files are uploaded via encrypted channels using TLS 1.3 and executed inside isolated sandbox containers that are wiped after each task. We enforce a strict zero retention policy, meaning we do not inspect, index, or store your documents permanently. All uploaded files and stamped outputs are permanently deleted from our temporary storage systems exactly 60 minutes after execution, guaranteeing absolute confidentiality.",
      "Stamping copyright text, date metadata, or branding titles on document headers makes them secure and structured. Lawyers can index multiple pages of discovery evidence with custom titles to ensure structured reviews. Corporate teams can number draft presentations, handouts, and invoices before distributing them to clients. Students can format research assignments to meet submission guidelines. PDFMount provides a free, fast, browser-native header and footer stamping utility that replaces expensive desktop software licenses."
    ]
  },
  "resize-pdf": {
    title: "Resize PDF Pages Online - Change PDF Page Size | PDFMount",
    desc: "Resize PDF pages online free. Change page size dimensions to standard A4, Letter, Legal, or custom sizes. Secure, fast, and no watermark.",
    h1: "Resize PDF Page Dimensions Online Free",
    intro: "Align your document page sizes and adjust layouts to standard paper dimensions with our online resizing tool. PDFMount's page resizer provides a simple interface where you can scale your pages to A4, Letter, Legal, or custom page boundaries. The scaling engine modifies the internal page boundary metrics—specifically updating the MediaBox, CropBox, and BleedBox parameters—proportionally without rasterizing the document contents. This layout preservation ensures that your text lines do not distort, fonts stay embedded, and image assets remain sharp. The tool runs on secure, isolated servers, protecting your files from unauthorized access.",
    steps: [
      "Select and upload the PDF file you wish to scale from your computer, cloud storage, or mobile storage using our secure upload panel above.",
      "Choose your target page size standard from the options, selecting standard formats like A4, US Letter, or Legal boundaries.",
      "Set your scaling preferences, choosing to scale page contents proportionally or add empty margins to fit target page dimensions.",
      "Click the start resize button to execute the layout boundary adjustments on our secure server-side container nodes instantly.",
      "Save the resized PDF document directly to your device storage, featuring standard layouts and zero branding watermarks."
    ],
    faqs: [
      {
        q: "What are the file size and page limits for resizing PDFs?",
        a: "Guest users can upload PDF files up to 25MB for page resizing tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and resizes files in seconds."
      },
      {
        q: "Will resizing stretch my text or distort my images?",
        a: "No, our layout resizer scales document contents proportionally based on the target aspect ratio. This prevents text distortion, font stretching, or image pixelation. Your vector graphics remain sharp, and text elements stay fully selectable and search-friendly."
      },
      {
        q: "Can I resize individual pages inside a multi-page PDF?",
        a: "Yes, our settings panel allows you to resize either the entire document, specific page ranges, or customize size metrics for individual pages. This is useful for standardizing layouts of documents compiled from different scanner sources."
      },
      {
        q: "Does PDFMount add any branding watermarks to my resized PDF file?",
        a: "No, PDFMount does not add watermarks, branding text, or cover sheets to your files. The output PDF remains clean and matches your resized layouts exactly, making it suitable for official submissions, client contracts, and academic applications."
      },
      {
        q: "Is my document data secure during the page resizing process?",
        a: "Yes, document security is guaranteed on our platform. All file transfers are secured with TLS 1.3 encryption protocols, and documents are processed in isolated virtual sandboxes. Our automated deletion script removes all files and resized PDFs after 60 minutes."
      }
    ],
    detailedContent: [
      "Our page resizing tool operates by updating the MediaBox and CropBox parameters in the PDF page dictionary. Instead of converting pages into rasterized images and re-saving them—which degrades image DPI and text sharpness—the engine performs metadata adjustments. This layout preservation ensures that your vector paths remain sharp, fonts stay embedded, text remains selectable, and existing hyperlinks continue working, delivering a high-quality standalone file that displays cleanly.",
      "Security is a core priority for all document processing operations. All data transfers are encrypted using TLS 1.3 protocols, and file execution runs within isolated server container sandboxes. We enforce a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded files and resized PDFs are permanently deleted from our cache after exactly 60 minutes, leaving no backup copies.",
      "Standardizing paper layout sizes is crucial for clean office printouts and submissions. Business managers can resize page layouts to match standard slide formats. Legal professionals can adjust page dimensions of scanned court records to fit legal paper sizes. Students can resize textbook pages to make reading on tablet screens more comfortable. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive desktop licenses."
    ]
  },
  esign: {
    title: "Sign PDF Online - Free Electronic Signatures | PDFMount",
    desc: "Draw, type, or upload electronic signatures to sign PDF documents online. Free, secure, legally binding, and no watermarks.",
    h1: "Sign PDF Documents Online Free",
    intro: "Apply secure electronic signatures to your contracts, agreements, and official forms online. PDFMount's e-sign tool provides a secure workspace where you can draw your signature with a mouse or touchscreen, type your name using elegant cursive fonts, or upload an image stamp of your handwritten sign. The system embeds your signature as a clean vector object directly onto the target pages of your PDF document. The tool runs on secure, isolated servers, protecting your legal agreements and personal data from unauthorized access. You can sign documents in seconds, avoiding the slow process of printing and scanning.",
    steps: [
      "Upload the PDF contract or agreement you need to sign from your computer or mobile storage using the secure upload zone.",
      "Select your signing method, choosing to draw with a mouse or touchscreen, type your name, or upload an image stamp.",
      "Drag and position your signature stamp onto the target pages of the document, adjusting the scale to fit signature boxes.",
      "Click the compilation button to trigger our signing engine, which embeds the signature data directly into the PDF layout streams.",
      "Save the signed PDF document to your device, featuring a clean layout and zero added watermarks or brand logos."
    ],
    faqs: [
      {
        q: "Are the signatures legally binding?",
        a: "Yes, the electronic signatures generated on our platform are standard electronic signatures. They comply with electronic transaction laws such as the eIDAS regulation in Europe and the ESIGN Act in the United States, making them suitable for business agreements, school forms, and vendor contracts. They carry legal validity for most general agreements."
      },
      {
        q: "Can I add multiple signatures or text blocks to the same PDF?",
        a: "Yes, you can add multiple signatures, initials, dates, and custom text inputs to any page of your document. This is useful for filling out forms, adding witness signatures, or signing complex agreements that require verification on multiple sections. You can place stamps on as many pages as needed."
      },
      {
        q: "What is the maximum file size limit for signing documents online?",
        a: "Guest users can upload documents up to 25MB for signing. Registered free accounts can process files up to 50MB, and Pro tier subscribers can upload documents up to 500MB. Our tool processes files of all sizes in under ten seconds. There are no page count restrictions on these uploads."
      },
      {
        q: "Will the layout or formatting of my contract be changed after signing?",
        a: "No, our signing tool preserves the original layout of your document. The system adds the signature as a separate vector overlay stream rather than rasterizing or compressing the document pages. This means your text remains searchable and all links stay active. The visual quality of your graphics is preserved."
      },
      {
        q: "How does PDFMount ensure the confidentiality of my signed contracts?",
        a: "We take contract security seriously. All documents are encrypted during transfer using TLS 1.3 and processed in isolated virtual sandboxes. Our automated deletion script removes all uploaded files, signatures, and signed outputs from our servers after exactly 60 minutes. No copy is kept on our systems."
      }
    ],
    detailedContent: [
      "Our electronic signature tool integrates signatures directly into the PDF page dictionary structure. Instead of flattening pages into images, the engine writes the signature as a vector graphic overlay object, preserving the layout fidelity of the underlying text. Any images uploaded as signatures are scaled proportionally to maintain resolution without blurring. The tool preserves existing interactive form fields and document structure metadata, ensuring that the PDF remains fully compliant with standard ISO PDF specifications for viewing on any PDF reader.",
      "Security is a core priority for all electronic agreements processed on our platform. All data exchanges are protected by TLS 1.3 encryption protocols, preventing interception. The e-sign editor runs within isolated server container sandboxes, separating your session from other users. We maintain a strict zero retention policy: we do not read, store, or share your contracts. All uploaded files, created signatures, and signed documents are permanently purged from our volatile memory systems exactly 60 minutes after execution, leaving no backup copies.",
      "This online signing utility supports many professional workflows. Business managers can sign vendor contracts, purchase orders, and employee agreements without printing. Legal teams can sign documents and client letters, ensuring they are saved securely in PDF format. Students and parents can sign permission slips and enrollment forms quickly from mobile devices. By providing a secure, browser-native signing workspace, PDFMount improves document processing times and helps businesses transition to paperless operations."
    ]
  },
  unlock: {
    title: "Unlock PDF - Remove PDF Password & Restrictions | PDFMount",
    desc: "Unlock password protected PDFs online. Remove print, copy, and edit restriction passwords from PDF files free. Secure, fast, and no watermark.",
    h1: "Unlock PDF Online Free",
    intro: "Remove restriction passwords and decryption locks from your PDF files online instantly. PDFMount's unlock tool decrypts locked documents, stripping away printing limits, copying restrictions, and editing blocks from the underlying file structure. The processing engine decrypts the document payload using standard crypto libraries, rebuilding the PDF header and restoring full accessibility without altering page content or layout properties. The tool operates inside secure, isolated sandbox containers on our servers, ensuring your files are never exposed to external threats. You can access, print, and edit your documents within seconds using any modern browser.",
    steps: [
      "Select and upload the locked PDF file from your computer, cloud storage, or local storage using our secure drag-and-drop panel above to begin.",
      "Enter the correct open password if the document requires user authorization to view the target contents.",
      "Click the unlock button to trigger our decryption engine, which strips owner permission restrictions and access controls.",
      "Wait a few seconds for the document processing engine to verify password credentials, decrypt files, and compile the unlocked file.",
      "Download your unrestricted PDF document directly to your device storage, ready for copying, printing, and editing without watermarks."
    ],
    faqs: [
      {
        q: "What are the file size limits and tool quotas for unlocking PDFs?",
        a: "Guest users can upload PDF files up to 25MB for unlocking tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and unlocks files in seconds."
      },
      {
        q: "Can I unlock a file if I do not know the open password?",
        a: "If the document is protected by an open user password, you must enter the password to allow decryption. However, if the file is locked with an owner password that restricts copying, printing, or editing, PDFMount can strip these restrictions without requiring a password."
      },
      {
        q: "Will unlocking my PDF file affect its layout, fonts, or searchability?",
        a: "No, our decryption engine decrypts the document wrapper headers while keeping the actual page content streams intact. Your original fonts, page structures, vector shapes, high-resolution graphics, and text alignments are preserved without formatting loss, maintaining layout fidelity."
      },
      {
        q: "Does PDFMount place any branding watermarks on the unlocked PDF?",
        a: "No, PDFMount does not add watermarks, branding elements, or promotional covers to your files. The output PDF remains clean and matches your original formatting exactly. This ensures that your documents look highly professional for business or academic submissions."
      },
      {
        q: "How secure is my data when uploading files for unlocking?",
        a: "Security is integrated into every step of our file processing pipeline. Files are uploaded via encrypted channels using TLS 1.3 and executed inside isolated sandbox containers that are wiped after each task. All files are permanently deleted from our cache after 60 minutes."
      }
    ],
    detailedContent: [
      "Our unlocking tool decrypts PDF wrappers by rewriting the encryption dictionary structure. It identifies the security handler tags, strips permission flags, and updates the cross-reference tables. By targeting metadata headers rather than rasterizing pages, the engine preserves layout fidelity, keeps text readable, and maintains high-resolution image details without changing the original file DPI. Your document remains fully zoomable on all devices.",
      "Security is a core priority for all decryption operations. All data transfers are encrypted using TLS 1.3 protocols, and file execution runs within isolated server container sandboxes. We enforce a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded files and unlocked PDFs are permanently deleted from our cache after exactly 60 minutes, leaving no backup copies.",
      "Unlocking files lets you compile pages or copy text layouts. Business professionals can unlock contracts to copy clauses or print agreements. Legal assistants can remove restriction flags from discovery files to compile case files. Students can unlock textbook PDFs to highlight text and format study notes. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive desktop licenses."
    ]
  },
  protect: {
    title: "Protect PDF - Encrypt PDF with Password | PDFMount",
    desc: "Encrypt your PDF documents with secure passwords. Protect PDF files online from unauthorized viewing and copying free. Secure, fast, and no watermark.",
    h1: "Protect PDF with Password Online Free",
    intro: "Secure confidential records by encrypting PDF files with strong user and owner passwords online. PDFMount's protection tool applies industry-standard encryption protocols to your document structure, preventing unauthorized viewing, text copying, editing, and printing. The engine wraps the page content streams and metadata objects in a secure cryptographic envelope that requires decryption keys for access. The tool operates inside secure, isolated sandbox environments on our servers, ensuring that your raw passwords and documents are never exposed. You can safeguard tax forms, contracts, and financial reports in seconds without downloading external security applications.",
    steps: [
      "Upload the PDF document you wish to secure from your computer, cloud storage, or mobile storage using the secure upload zone above to begin.",
      "Enter a strong, customized password in the input field to encrypt the document and prevent unauthorized file access.",
      "Select optional permission settings, such as restricting page printing, text copying, or document editing separately if required.",
      "Click the start protection button to execute the cryptographic encryption algorithm on our secure, isolated server-side container nodes.",
      "Save the encrypted, password-protected PDF file directly to your device storage, ready for secure sharing, archiving, and email distribution."
    ],
    faqs: [
      {
        q: "What are the file size limits and tool quotas for protecting PDFs?",
        a: "Guest users can upload PDF files up to 25MB for protection tasks. Registered users on the free plan can process files up to 50MB, and Pro tier members can upload documents up to 500MB. Our system has no page count limits and encrypts files in seconds."
      },
      {
        q: "What level of encryption is used to protect my PDF document?",
        a: "PDFMount uses industry-standard encryption algorithms to secure your documents. This ensures high-level security that prevents password cracking attempts and keeps your confidential business files, student records, and legal agreements safe from unauthorized viewers."
      },
      {
        q: "Will encrypting my PDF document change its visual quality or formatting?",
        a: "No, our encryption process wraps the file in a secure data envelope without modifying the page layouts, text vectors, or embedded images. Your original fonts, page structures, margins, and graphics are preserved, maintaining layout fidelity when opened with the correct password."
      },
      {
        q: "Does PDFMount add any branding watermarks to the protected PDF?",
        a: "No, PDFMount does not add watermarks, branding elements, or cover pages to your secured files. The output PDF remains clean and matches your original layouts exactly, making it suitable for official submissions, client contracts, and academic applications."
      },
      {
        q: "How does PDFMount protect the security of my passwords and uploads?",
        a: "All document transfers are secured with TLS 1.3 encryption protocols, and encryption tasks are processed in isolated virtual sandboxes. We enforce a strict zero retention policy, and all uploaded files, passwords, and protected PDFs are completely purged after 60 minutes."
      }
    ],
    detailedContent: [
      "Our protection tool secures PDF documents by rewriting the encryption dictionary, establishing handler tags, and encrypting stream objects using standard algorithms. By wrapping content streams in a cryptographic container rather than rasterizing pages, the engine preserves layout fidelity, keeps text readable, and maintains high-resolution image details without changing the original file DPI. Your document remains fully zoomable on all devices.",
      "Security is a core priority for all encryption operations. All data transfers are encrypted using TLS 1.3 protocols, and file execution runs within isolated server container sandboxes. We enforce a strict zero retention policy, meaning we do not inspect, share, or log your document contents. All uploaded files, passwords, and protected PDFs are permanently deleted from our cache after exactly 60 minutes, leaving no backup copies.",
      "Encrypting tax records, salary slips, or contract drafts secures them from unauthorized viewing when sent over email. Business managers can protect pricing sheets, customer data, and legal agreements. Legal teams can secure sensitive case sheets before filing or sending them to clients. Students can protect portfolios and thesis drafts from plagiarism. PDFMount provides a free, fast, and secure alternative that eliminates the need for expensive security software."
    ]
  },
  "watermark-pdf": {
    title: "Watermark PDF Online - Add Text or Image Stamps | PDFMount",
    desc: "Add custom text or image watermarks to your PDF documents online. Adjust position, rotation, opacity, and font settings free.",
    h1: "Add Watermark to PDF Online Free",
    intro: "Protect document ownership and prevent unauthorized copying by stamping custom text or image watermarks onto your PDF pages online using PDFMount. Our secure engine writes watermark elements directly into the page content stream coordinates, maintaining layout fidelity and font structures. You can configure text strings, select custom colors, adjust rotation angles, and set opacity levels to ensure readability while protecting your intellectual property. The system processes your files inside isolated server environments, preventing third-party access to your private contracts. You can stamp your logo or copyright headers across multiple pages instantly. This browser-based tool requires no installation, providing a fast, secure solution for business and personal workflows. Let our utility stamp files now.",
    steps: [
      "Select and upload the PDF document you wish to watermark from your computer or mobile storage using our secure upload box.",
      "Input your desired watermark text or upload an image stamp such as a company logo from your local files.",
      "Configure your styling preferences, adjusting position coordinates, rotation angles, opacity percentages, and font families using the interactive options panel.",
      "Click the start button to execute our vector stamping engine, which embeds the watermark data into the PDF stream.",
      "Download the watermarked PDF document directly to your device storage, featuring clean vector overlays and zero platform branding logos."
    ],
    faqs: [
      {
        q: "What are the file size and page limit restrictions for watermarking PDFs?",
        a: "Guest users can upload and watermark PDF documents up to a maximum file size limit of 25MB per file. Free registered accounts are granted uploads of up to 50MB per file, while Pro subscribers can upload documents up to 500MB. Our system has no page count limitations and processes files of all sizes in under ten seconds. The stamping engine applies watermarks across all pages in a single run."
      },
      {
        q: "Can watermarks added by PDFMount be easily removed by viewers?",
        a: "No, PDFMount embeds watermarks as native vector content elements directly into the page stream dictionary. This makes them secure against basic copy-paste actions and standard PDF viewing editors. To remove or alter the watermark, a user would need professional vector editing software. This ensures high-level protection for your drafts and confidential business contracts."
      },
      {
        q: "Can I choose which pages receive the watermark stamp?",
        a: "Yes, you can customize the target page range using the visual settings panel. The tool allows you to exclude the first cover page, stamp only even or odd pages, or define a specific comma-separated range of pages. This is useful for keeping cover sheets clean while securing the internal content pages. You can preview the placement before initiating the process."
      },
      {
        q: "Will adding a watermark flatten my PDF or reduce layout quality?",
        a: "No, our utility does not rasterize your document pages during the watermarking process. The system writes the watermark as a separate vector overlay stream, meaning your text remains searchable and links stay active. The visual quality of your graphics and fonts is preserved. The output file remains compatible with all standard PDF readers."
      },
      {
        q: "How does PDFMount protect the security of my uploaded files?",
        a: "We implement advanced encryption protocols using TLS 1.3 to safeguard all data transfers. The watermarking process is executed on isolated sandbox containers to prevent access by unauthorized third parties. All files are purged from our secure, volatile cache exactly 60 minutes after processing finishes. We do not keep logs or backup files of your sensitive files."
      }
    ],
    detailedContent: [
      "Our watermarking engine uses a precise vector injection technique that overlays text or graphic assets directly onto the PDF content stream coordinates. The system calculates page dimensions, applying rotation and scaling factors proportionally to ensure the watermark fits perfectly without clipping. By inserting watermarks as native PDF vector elements rather than rasterizing pages, our tool preserves the original typography, layout structures, and high-resolution image details. The file size remains optimized, and the document is ready for professional archiving or distribution.",
      "Security is a core component of the PDFMount architecture. Every document processing task is executed inside isolated virtual sandbox containers running in volatile memory without persistent disk access. We enforce a strict zero retention policy, meaning we do not inspect, log, or share your document content. All uploaded files and watermarked PDF outputs are permanently deleted from our servers exactly 60 minutes after processing. This automated cleanup routine ensures absolute confidentiality for your contracts, draft copies, and private records.",
      "This online utility supports a variety of professional and creative workflows. Businesses use the tool to stamp draft or confidential labels across proposals and contracts before client sharing. Legal professionals can apply watermark stamps to trial exhibits and depositions to ensure proper identification. Creators and designers can stamp low-resolution previews of their portfolios to protect intellectual property online. PDFMount provides a free, fast, browser-native watermarking workspace that replaces expensive desktop licenses."
    ]
  },
  "bates-numbering": {
    title: "Bates Numbering PDF - Index Legal PDF Pages | PDFMount",
    desc: "Index legal documents with Bates numbering online. Stamp custom prefixes, suffixes, and page sequences onto PDF sheets free.",
    h1: "Bates Numbering for PDF Files Online",
    intro: "Index and organize your legal documents and case files online with PDFMount's Bates numbering tool. The stamping utility provides a secure workspace where you can define custom prefixes, suffixes, and consecutive page sequences to stamp onto your PDF pages. The engine writes vector text layers directly into the PDF content stream coordinates, maintaining layout fidelity and font structures. This is essential for legal discovery processes where consecutive numbering is required. All processing runs on secure, isolated server nodes, keeping your confidential papers protected. You can configure margin offsets and select page positions to ensure standard formatting without downloading desktop software. Let our utility index files for discovery workflows now.",
    steps: [
      "Select and upload the PDF document containing pages you wish to index from your local computer or mobile storage using our secure upload panel.",
      "Input your Bates numbering options, defining custom prefixes, suffixes, starting page sequences, and number formatting details in the settings panel.",
      "Configure the visual layout position for your stamps, adjusting margin offsets to prevent overlapping with any existing page text elements.",
      "Click the start button to execute the consecutive vector stamping process on our secure, high-speed server-side container nodes instantly.",
      "Download the newly indexed PDF document directly to your local device storage, ready for official legal submission with zero watermarks."
    ],
    faqs: [
      {
        q: "What are the file size and page limit restrictions for Bates numbering?",
        a: "Guest users can upload and index PDF documents up to a maximum file size limit of 25MB per file. Free registered accounts are granted uploads of up to 50MB per file, while Pro subscribers can upload files up to 500MB. Our system does not restrict the number of pages processed in a single run. The stamping engine handles large multi-page legal briefs in under ten seconds."
      },
      {
        q: "Can I number multiple documents consecutively?",
        a: "Yes, you can stamp multiple documents consecutively using our advanced configuration panel. The tool allows you to specify any starting page number for the current sequence. This ensures that when you upload subsequent files, you can resume numbering from the next consecutive integer. This is highly useful for organizing multi-volume discovery sets."
      },
      {
        q: "Will adding Bates numbers flatten my PDF or reduce visual quality?",
        a: "No, our tool does not rasterize your pages or downsample any embedded graphics during the indexing process. The engine stamps Bates numbers as independent vector text objects directly inside the PDF structure. Your original fonts, page boundaries, and image details are preserved without formatting loss. The output document remains fully searchable, readable, and zoom-friendly for digital viewing."
      },
      {
        q: "Does PDFMount add any branding watermarks to my legal documents?",
        a: "No, PDFMount maintains a strict policy against injecting watermarks or promotional logos onto client files. The output PDF remains clean and matches your original layouts exactly. The stamped Bates numbers are formatted according to your selected style. This ensures that the document remains fully ready for official B2B transactions and court filings."
      },
      {
        q: "How does PDFMount secure my confidential legal documents?",
        a: "We implement advanced encryption protocols using TLS 1.3 to safeguard all data transfers. The indexing process is executed on isolated sandbox containers to prevent access by unauthorized third parties. All files are purged from our secure, volatile cache exactly 60 minutes after processing finishes. We do not keep logs or backup files of your sensitive records."
      }
    ],
    detailedContent: [
      "Our Bates numbering utility operates by injecting consecutive serial numbers directly into the PDF page dictionary structures as vector elements. The placement algorithm calculates page heights and widths, ensuring that prefix, number, and suffix strings are placed outside main content boundaries to avoid overlapping. Because the numbers are stamped as native vector text stream overlays, they remain readable at any zoom factor and do not alter underlying image DPI or page scaling. This layout preservation guarantees that documents are fully prepared for litigation workflows.",
      "Confidentiality is built directly into our document processing pipelines. All file uploads and downloads are encrypted using TLS 1.3 protocols, protecting your case files from external surveillance. The Bates numbering service executes within isolated sandbox environments that process data in memory without disk logging. Our strict zero retention policy means we do not read, store, or share your legal agreements. All files are permanently destroyed exactly 60 minutes after execution, leaving no residual records on our servers.",
      "This stamping utility is designed primarily for legal teams, corporate departments, and administrative professionals. Law firms use the tool to index trial records, discovery packages, and transaction folders consecutively. Corporate administrators use Bates stamping to organize multi-page financial audits, customer directories, and invoice portfolios for audit compliance. Students and researchers can index massive reference archives for systematic reviews. PDFMount provides a free, fast, browser-native alternative to complex, expensive legal software."
    ]
  },
  "metadata-pdf": {
    title: "Edit PDF Metadata - Change PDF Title & Author | PDFMount",
    desc: "Edit PDF metadata online free. Change the document title, author, subject, and keywords fields inside your PDF files.",
    h1: "Edit PDF Metadata Online Free",
    intro: "Update and sanitize your document information online using PDFMount's metadata editor. The processing engine parses the underlying PDF file structure, targeting the document information dictionary and metadata streams to update key attributes like title, author, subject, and keywords. Unlike tools that modify the layout pages, our utility writes directly to the file header metadata, ensuring that visual elements, vector assets, and original fonts remain untouched. The entire process runs on secure, isolated server nodes, keeping your private papers confidential. You can clean tracking metadata and personalize your files in seconds from any modern browser without installing software. Let our utility clean document properties today. Let it update your data now.",
    steps: [
      "Select and upload the PDF document whose metadata properties you wish to modify using our secure file transfer container.",
      "Input your desired metadata values including document title, creator author, file subject, and target keywords inside the configuration fields.",
      "Choose whether to purge any additional tracking indicators or software signature details from the document headers permanently for security.",
      "Click the start button to execute our metadata processing engine, which rewrites the document information dictionary on secure server nodes.",
      "Download the updated PDF file directly to your local device storage, featuring corrected document details and zero branding watermarks."
    ],
    faqs: [
      {
        q: "What are the file size limits and tool quotas for editing metadata?",
        a: "Guest users can upload and edit PDF metadata up to a maximum file size limit of 25MB per file. Free registered accounts are granted uploads of up to 50MB per file, while Pro subscribers can upload files up to 500MB. Our system has no page count limitations and processes files of all sizes in under ten seconds. The editing engine processes tasks quickly."
      },
      {
        q: "Will editing metadata change the visual content or formatting of my PDF?",
        a: "No, our editor only targets the document information dictionary and metadata stream headers inside the file. The actual visual pages, text coordinates, vector graphics, and embedded fonts remain completely untouched. This ensures layout fidelity across all devices without any changes. Your document remains fully searchable, readable, and zoomable."
      },
      {
        q: "Why should I clean or modify my PDF metadata before sharing?",
        a: "PDF files often contain hidden tracking data such as original author names, creation software types, local username details, and directory paths. Cleaning this metadata prevents the accidental exposure of private directories or internal business software details before public distribution. This is crucial for maintaining corporate security and protecting individual privacy. The editor allows you to sanitize these properties in seconds."
      },
      {
        q: "Does PDFMount add any watermarks or promotional logos to my files?",
        a: "No, PDFMount maintains a strict policy against injecting watermarks or promotional logos onto client files. The output PDF remains clean and matches your original formatting exactly. Only the metadata properties you configured will be updated in the file header. The document remains fully ready for professional presentations, academic submissions, or business contracts."
      },
      {
        q: "How does PDFMount secure my documents during metadata editing?",
        a: "We implement advanced encryption protocols using TLS 1.3 to safeguard all data transfers. The metadata editing process is executed on isolated sandbox containers to prevent access by unauthorized third parties. All files are purged from our secure, volatile cache exactly 60 minutes after processing finishes. We do not keep logs or backup files of your sensitive records."
      }
    ],
    detailedContent: [
      "Our metadata editor operates by modifying the Document Information Dictionary and the Extensible Metadata Platform (XMP) streams in the PDF file structure. By targeting the metadata dictionary directly, the engine changes document fields without re-saving page content objects, preserving layout fidelity and preventing font subset corruption. Embedded graphics and text arrays are not compressed or rasterized, ensuring that original file DPI and image scaling remain intact. This technical approach guarantees that the document continues to conform to PDF specifications.",
      "Data privacy is a core component of the PDFMount architecture. Every metadata modification task is processed inside an isolated virtual sandbox container that has no persistent storage access. We enforce a strict zero retention policy, meaning we do not inspect, copy, or log your files. All source PDFs and updated outputs are permanently purged from our volatile server caches exactly 60 minutes after processing. This automatic deletion routine ensures complete confidentiality for your corporate papers and private files.",
      "This metadata editor supports a wide range of professional, administrative, and academic needs. Businesses use the tool to sanitize corporate reports, removing local directory paths and username metadata before external distribution. Legal professionals can clear author details from trial briefs to ensure compliance with court filing rules. Academic researchers can update keyword lists and author fields before submitting papers to online journals. PDFMount provides a free, fast, browser-native utility that replaces expensive desktop software."
    ]
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
