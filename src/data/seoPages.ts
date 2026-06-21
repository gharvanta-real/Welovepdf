export interface SeoPageData {
  title: string;
  desc: string;
  h1: string;
  intro: string;
  steps: string[];
  faqs: { q: string; a: string }[];
  detailedContent: string[];
}

export const seoPages: Record<string, SeoPageData> = {
  "merge": {
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
  "split": {
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
  "compress": {
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
    steps: [
      "Select one or more JPG, PNG, or GIF image files.",
      "Adjust page orientation (portrait/landscape) and margins if needed.",
      "Click the 'Start' button to generate the PDF document.",
      "Download your compiled image portfolio."
    ],
    faqs: [
      {
        q: "Can I convert multiple JPGs into a single PDF?",
        a: "Yes. You can upload multiple images at once, rearrange them, and PDFMount will compile them into one multi-page PDF."
      },
      {
        q: "Will my images be compressed during conversion?",
        a: "No. PDFMount embeds your images at their original resolutions, wrapping them securely in standard PDF vectors to preserve details."
      }
    ],
    detailedContent: [
      "Converting scans of PAN cards, Aadhars, receipts, or contracts into a single PDF makes them easy to print and store. Our converter aligns image boundaries automatically, preventing awkward cropping or layout overflows commonly found in basic converters.",
      "This tool supports PNG, BMP, GIF, and WebP, rendering them in standard PDF pages suitable for official application portals."
    ]
  },
  "pdf-jpg": {
    title: "PDF to JPG Converter - Export PDF Pages as Images | PDFMount",
    desc: "Convert PDF pages to high-quality JPG or PNG images online. Extract pictures from PDFs or turn whole pages into sharp image files free.",
    h1: "Convert PDF Pages to JPG Images",
    intro: "Turn PDF pages into sharp, independent image files. Perfect for extracting slides, embedding document previews on websites, or reviewing artwork.",
    steps: [
      "Upload your PDF document.",
      "Click the 'Start' button to render page sheets as images.",
      "Download the generated JPG files (saved inside a consolidated ZIP archive)."
    ],
    faqs: [
      {
        q: "Can I convert only specific pages?",
        a: "Yes, you can extract target sheets by selecting pages in the interactive preview workspace before executing conversion."
      },
      {
        q: "What image formats are supported?",
        a: "We support exporting pages as high-quality JPGs by default. PDF to PNG conversion is also supported."
      }
    ],
    detailedContent: [
      "Sharing document mockups as JPGs is faster and safer than sending complete vector PDFs. Our rendering engine rasterizes fonts and layouts at high resolution (150-300 DPI), ensuring small fine prints remain readable.",
      "This is perfect for creative designers who need to export layout drafts, presentation slides, or portfolio sheets as standard web-friendly images."
    ]
  },
  "word-pdf": {
    title: "Word to PDF Converter - Convert DOCX to PDF Online | PDFMount",
    desc: "Convert Microsoft Word documents (DOCX and DOC) to PDF online free. Maintains original styles, fonts, margins, and formatting.",
    h1: "Convert Word (DOCX) to PDF Online",
    intro: "Convert editable Microsoft Word files into secure, non-editable PDFs. Our layout engine parses styles, list structures, and tables accurately.",
    steps: [
      "Upload your DOCX or DOC file.",
      "Customize optional margins and page layout configurations if desired.",
      "Click the 'Start' button to convert Word to PDF.",
      "Save your stable, print-ready PDF."
    ],
    faqs: [
      {
        q: "Does this tool use LibreOffice on the server?",
        a: "No. We parse and construct the layout using a custom ReportLab parser, which is extremely fast and has minimal server overhead."
      },
      {
        q: "Will my margins and lists be preserved?",
        a: "Yes. Our engine is mapped to translate DOCX font styles, heading weights, bullet lists, and borders to PDF vectors."
      }
    ],
    detailedContent: [
      "Sending resumes or business agreements as Word files can lead to layout distortions on different screen sizes. Converting to PDF locks in your formatting so it displays exactly the same on any device.",
      "Our lightweight python-docx converter operates instantly, returning clean, standard PDF documents ready for signatures and archiving."
    ]
  },
  "pdf-word": {
    title: "PDF to Word Converter - Edit PDF in Microsoft Word | PDFMount",
    desc: "Convert PDF documents to editable Microsoft Word files (DOCX) online. Uses layout reconstruction to turn PDF sheets into editable paragraphs.",
    h1: "Convert PDF to Word Online Free",
    intro: "Make locked PDF documents editable. PDFMount parses PDF text blocks, headers, and bullet lists, mapping them into standard DOCX paragraph elements.",
    steps: [
      "Upload the PDF you wish to edit in Word.",
      "Select conversion preferences (e.g. flowing text or framed templates).",
      "Click the 'Start' button to convert.",
      "Download the editable DOCX file."
    ],
    faqs: [
      {
        q: "Can I convert scanned PDFs to Word?",
        a: "Yes. PDFMount uses OCR to extract text from images and scanned PDF pages before converting them to DOCX format."
      },
      {
        q: "Will the layout of my PDF be ruined?",
        a: "No. Our layout reconstruction algorithm attempts to map text blocks logically, sorting headings, lists, and normal lines."
      }
    ],
    detailedContent: [
      "Editing PDFs directly is notoriously difficult. By converting them back to Word, you can use standard office processors to adjust copy, rewrite tables, and re-arrange paragraphs easily.",
      "PDFMount's PDF-to-Word engine operates with layout preservation, making it much more than a simple text extractor."
    ]
  },
  "rotate": {
    title: "Rotate PDF Pages - Rotate PDF Files Online Free | PDFMount",
    desc: "Rotate sideways PDF pages permanently online. Choose individual pages or rotate the entire document to standard portrait layout.",
    h1: "Rotate PDF Pages Permanently",
    intro: "Fix scanned documents that loaded upside down or sideways. PDFMount lets you visually rotate specific pages and saves them permanently.",
    steps: [
      "Upload the PDF document.",
      "Hover over individual pages in the grid and click the rotate icon to turn them 90 degrees.",
      "Click the 'Start' button to write rotations permanently to the file.",
      "Download your corrected PDF."
    ],
    faqs: [
      {
        q: "Can I rotate only a single page in a 100-page PDF?",
        a: "Yes. Our layout grid lets you select and rotate individual sheets without affecting the rest of the document."
      },
      {
        q: "Is the rotation temporary?",
        a: "No. Unlike browser viewer rotations, PDFMount rewrites the page geometry tags permanently into the PDF structures."
      }
    ],
    detailedContent: [
      "Scanned forms and contracts are often oriented sideways due to document feeder issues. Sending them like this looks unprofessional and makes them hard to read. Our rotation tool corrects these pages in seconds, adjusting page geometry tags without recompiling fonts."
    ]
  },
  "remove": {
    title: "Remove Pages from PDF - Delete PDF Pages Online | PDFMount",
    desc: "Delete unnecessary pages from your PDF online free. View pages in an interactive grid and discard sheets before sharing.",
    h1: "Delete Pages from PDF Online",
    intro: "Discard confidential sections or layout blanks before sending documents. Select and delete PDF pages visually.",
    steps: [
      "Select and upload the PDF file.",
      "Select the pages you want to delete from the visual grid.",
      "Click the 'Start' button to save the updated PDF.",
      "Download your cleaned document."
    ],
    faqs: [
      {
        q: "Can I restore deleted pages?",
        a: "No, once the file is processed and downloaded, the deleted pages are removed permanently. Keep a backup copy of your original file if needed."
      }
    ],
    detailedContent: [
      "Discarding private appendix pages, placeholder sheets, or template drafts secures your documents and reduces file size. PDFMount strips page references cleanly, removing unwanted contents entirely."
    ]
  },
  "extract": {
    title: "Extract PDF Pages - Save Specific PDF Pages Free | PDFMount",
    desc: "Extract specific pages from your PDF online. Select pages visually or input page ranges to create a new PDF containing only those pages.",
    h1: "Extract Pages from PDF Online",
    intro: "Extract single pages, ranges, or non-consecutive sheets into a new, independent PDF file.",
    steps: [
      "Upload the PDF document.",
      "Select pages visually in the grid or define target page ranges.",
      "Click the 'Start' button to extract.",
      "Download your new PDF."
    ],
    faqs: [
      {
        q: "Are the links and bookmarks preserved?",
        a: "Yes, our page extraction tool keeps all interactive elements active inside the selected ranges."
      }
    ],
    detailedContent: [
      "This is perfect for exporting chapters from ebooks, saving specific receipts from a bulk statement, or sending single contract sheets to clients."
    ]
  },
  "organize": {
    title: "Organize PDF Pages - Rearrange PDF Files Online | PDFMount",
    desc: "Reorder, delete, and rearrange pages in your PDF document online. Use a drag-and-drop page editor to structure PDFs free.",
    h1: "Organize and Reorder PDF Pages",
    intro: "Sort your document page hierarchy visually. Drag pages to new positions, insert sections, or remove blanks in real-time.",
    steps: [
      "Upload the PDF file.",
      "Drag and drop pages in the visual grid to reorder them.",
      "Click the 'Start' button to compile the new structure.",
      "Save your organized PDF."
    ],
    faqs: [
      {
        q: "Can I organize pages from multiple PDFs?",
        a: "Yes, you can merge multiple files first and then use the organize tool to arrange their combined sheets."
      }
    ],
    detailedContent: [
      "Having pages out of order makes documents look messy. Our interactive canvas lets you restructure PDFs instantly in your browser before downloading a clean copy."
    ]
  },
  "crop-pdf": {
    title: "Crop PDF Online - Crop Page Margins and Borders | PDFMount",
    desc: "Crop PDF pages online. Define custom margins and page boundaries to trim white spaces and crop PDF sheets free.",
    h1: "Crop PDF Page Boundaries",
    intro: "Crop empty white margins from documents. Define page crop dimensions to adjust layout boundaries.",
    steps: [
      "Upload the PDF file.",
      "Set preferred crop margins in the workspace panel.",
      "Click the 'Start' button to crop the file.",
      "Save your cropped PDF."
    ],
    faqs: [
      {
        q: "Does cropping delete underlying content?",
        a: "It clips the visual margins. Highly confidential data hidden by cropping should be redacted using an editing tool."
      }
    ],
    detailedContent: [
      "Trimming scanned margins makes PDFs look clean on e-readers and mobile screens. PDFMount adjusts the MediaBox layout tags to trim page boundaries."
    ]
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF - Number PDF Pages | PDFMount",
    desc: "Add page numbers to your PDF document online. Choose positions, fonts, and numbering formats (e.g. Page X of Y) easily.",
    h1: "Add Page Numbers to PDF Online",
    intro: "Index your documents with clean page numbering. Select custom positions and styles to stamp pages automatically.",
    steps: [
      "Upload the PDF file.",
      "Select numbers position (e.g. bottom-center, top-right) and formatting style.",
      "Click the 'Start' button to apply numbering.",
      "Download your numbered PDF."
    ],
    faqs: [
      {
        q: "Can I exclude the first page from numbering?",
        a: "Yes. Our advanced options let you skip stamping the cover page."
      }
    ],
    detailedContent: [
      "Adding page numbers makes business reports and academic documents easy to navigate. PDFMount embeds vector page stamps onto your sheets cleanly."
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
    title: "Add Header and Footer to PDF - Custom Layouts | PDFMount",
    desc: "Add custom headers and footers to PDF files online. Stamp titles, dates, or company names on page headers and footers free.",
    h1: "Add Header and Footer to PDF",
    intro: "Professionalize your PDFs by overlaying custom header and footer lines onto your documents.",
    steps: [
      "Upload the PDF file.",
      "Input header/footer text and select page positions.",
      "Click the 'Start' button to stamp headers/footers.",
      "Download your stamped PDF."
    ],
    faqs: [
      {
        q: "Can I format the text size and font?",
        a: "Yes. PDFMount supports customizable font sizes and alignments in the options panel."
      }
    ],
    detailedContent: [
      "Stamping copyright text, date metadata, or branding titles on document headers makes them secure and structured."
    ]
  },
  "resize-pdf": {
    title: "Resize PDF Pages - Change PDF Page Size Online | PDFMount",
    desc: "Resize PDF pages online. Change page size dimensions to standard A4, Letter, or Legal boundaries free.",
    h1: "Resize PDF Page Dimensions",
    intro: "Align document dimensions by resizing pages to standard paper sizes.",
    steps: [
      "Upload the PDF document.",
      "Select target page dimensions (A4, Letter, or Legal).",
      "Click the 'Start' button to resize.",
      "Download your resized PDF."
    ],
    faqs: [
      {
        q: "Will resizing stretch my text?",
        a: "No. The layout scaling is adjusted proportionally so text lines do not distort."
      }
    ],
    detailedContent: [
      "Standardizing paper layout sizes is crucial for clean office printouts. PDFMount scales page boundaries to match target specifications."
    ]
  },
  "esign": {
    title: "Sign PDF Online - Free Electronic Signatures | PDFMount",
    desc: "Draw or type electronic signatures onto your PDF files online. Sign PDFs securely in seconds without printing.",
    h1: "Sign PDF Documents Online",
    intro: "Place electronic signatures onto contracts. Draw, type, or upload signature stamps securely.",
    steps: [
      "Upload the PDF document.",
      "Draw or type your signature inside the e-sign editor.",
      "Place and scale the signature stamp on target pages.",
      "Download your signed PDF."
    ],
    faqs: [
      {
        q: "Are the signatures legally binding?",
        a: "Yes, PDFMount signatures are standard electronic signatures suitable for general contracts and agreements."
      }
    ],
    detailedContent: [
      "E-signing avoids printing, signing manually, and scanning. PDFMount embeds vector signature stamps onto pages securely."
    ]
  },
  "unlock": {
    title: "Unlock PDF - Remove PDF Password & Restrictions | PDFMount",
    desc: "Unlock password protected PDFs online. Remove print, copy, and edit restriction passwords from PDF files free.",
    h1: "Unlock PDF Online Free",
    intro: "Remove restrict passwords from PDFs so you can edit, print, or copy text content freely.",
    steps: [
      "Upload the locked PDF file.",
      "Provide the password if the file requires an open password.",
      "Click the 'Start' button to unlock.",
      "Download your unrestricted PDF."
    ],
    faqs: [
      {
        q: "Can I unlock a file if I don't know the owner password?",
        a: "Yes, PDFMount can strip owner-restriction passwords instantly. You must know the open password if the file is encrypted."
      }
    ],
    detailedContent: [
      "Unlocking files lets you compile pages or copy text layouts. We strip PDF encryption headers cleanly, returning fully editable versions."
    ]
  },
  "protect": {
    title: "Protect PDF - Encrypt PDF with Password | PDFMount",
    desc: "Encrypt your PDF documents with secure passwords. Protect PDF files online from unauthorized viewing and copying.",
    h1: "Protect PDF with Password Online",
    intro: "Secure confidential records by encrypting PDF files with strong user and owner passwords.",
    steps: [
      "Upload the PDF document.",
      "Input a secure password.",
      "Click the 'Start' button to encrypt.",
      "Save your protected PDF."
    ],
    faqs: [
      {
        q: "What encryption strength is used?",
        a: "PDFMount uses industry-standard encryption, preventing unauthorized access."
      }
    ],
    detailedContent: [
      "Encrypting tax records, salary slips, or contract drafts secures them from unauthorized viewing when sent over email."
    ]
  },
  "watermark-pdf": {
    title: "Watermark PDF Online - Add Text or Image Overlays | PDFMount",
    desc: "Add text or image watermarks to your PDF online free. Choose positions, fonts, colors, and opacity for custom document stamps.",
    h1: "Add Watermark to PDF Online",
    intro: "Protect copyright by stamping customized text or image watermarks across PDF pages.",
    steps: [
      "Upload the PDF document.",
      "Input watermark text or upload an image stamp.",
      "Configure text color, position, rotation, and opacity.",
      "Click the 'Start' button to apply.",
      "Download your watermarked PDF."
    ],
    faqs: [
      {
        q: "Can watermarks be easily removed?",
        a: "PDFMount embeds watermarks as flattened elements, making them secure against basic editing tools."
      }
    ],
    detailedContent: [
      "Watermarking drafts or copy sheets prevents content theft and establishes clear ownership before legal publications."
    ]
  },
  "bates-numbering": {
    title: "Bates Numbering PDF - Index Legal PDF Pages | PDFMount",
    desc: "Index legal documents with Bates numbering. Stamp custom prefixes, suffixes, and page counts onto PDF sheets online.",
    h1: "Bates Numbering for PDF Files",
    intro: "Index and organize legal case sheets. Stamp consecutive Bates numbers on PDF files automatically.",
    steps: [
      "Upload the PDF document.",
      "Input bates prefix (e.g. CASE-), start number, and page positions.",
      "Click the 'Start' button to stamp.",
      "Save your indexed PDF."
    ],
    faqs: [
      {
        q: "Can I stamp multiple documents consecutively?",
        a: "Yes. Our Bates numbering supports starting sequence numbers from any specified count."
      }
    ],
    detailedContent: [
      "Consecutive numbering is a mandatory requirement in legal discovery and litigation workflows. PDFMount automates this stamping in seconds."
    ]
  },
  "metadata-pdf": {
    title: "Edit PDF Metadata - Change PDF Title & Author | PDFMount",
    desc: "Edit PDF metadata online free. Change the document title, author, subject, and keywords fields inside your PDF files.",
    h1: "Edit PDF Metadata online",
    intro: "Adjust document metadata properties. Clean or set title, author, subject, and keyword fields easily.",
    steps: [
      "Upload the PDF document.",
      "Input new metadata values (Title, Author, Subject, Keywords) in the panel.",
      "Click the 'Start' button to save properties.",
      "Download your updated PDF."
    ],
    faqs: [
      {
        q: "Will editing metadata change the PDF contents?",
        a: "No. Only the document's header metadata dictionary is updated; the page pages remain untouched."
      }
    ],
    detailedContent: [
      "Cleaning internal metadata attributes protects private details (like creator names or software versions) before public sharing."
    ]
  }
};
