export interface ToolHowToStep {
  name: string
  text: string
}

export interface ToolConfig {
  slug: string
  title: string
  h1: string
  subheading: string
  description: string
  keywords: string
  prose: string
  howToSteps: ToolHowToStep[]
}

export const toolsConfig: Record<string, ToolConfig> = {
  'edit-pdf': {
    slug: 'edit-pdf',
    title: 'Edit PDF Online Free – No Upload, No Sign-Up | LumiCore PDF',
    h1: 'Edit PDF Online for Free',
    subheading:
      'Add text, draw signatures, and annotate any PDF — entirely in your browser, with zero server uploads.',
    description:
      'Edit any PDF online for free. Add text, annotate pages, draw freehand shapes, and download the result instantly — no uploads, no registration required.',
    keywords: 'edit pdf online, pdf editor online, edit pdf free, annotate pdf',
    prose: `Need to edit a PDF but don't want to hand your document over to a cloud service? You're in the right place. LumiCore PDF Editor lets you open, annotate, and save any PDF file without sending a single byte to a remote server. Every edit happens inside your browser using WebAssembly technology — meaning your contracts, medical records, tax forms, and personal documents stay 100% on your device.\n\nGetting started takes seconds. There's no account to create, no email to verify, and no software to install. Simply open the editor, drop in your PDF, and start typing. Add text annotations anywhere on the page, choose your font size and colour, and draw freehand marks or signatures with your mouse or touchscreen. When you're done, hit Save and your browser immediately downloads the finished file.\n\nPrivacy is not an afterthought here — it's the architecture. We couldn't access your documents even if we wanted to because they never reach our servers. This makes our free PDF editor the safest choice for editing sensitive documents online. Works seamlessly in Chrome, Firefox, Safari, and Edge on desktop and mobile.`,
    howToSteps: [
      {
        name: 'Open the PDF Editor',
        text: 'Click "Open PDF Editor" on the homepage. No sign-up or installation is required.',
      },
      {
        name: 'Upload Your PDF',
        text: 'Drag and drop your PDF onto the canvas, or click the upload button to browse for the file. Files up to 25 MB are supported.',
      },
      {
        name: 'Edit Your Document',
        text: 'Use the toolbar to add text boxes, draw freehand shapes, or insert a signature on any page.',
      },
      {
        name: 'Download the Edited PDF',
        text: 'Click the Save / Download button. Your annotated PDF is assembled in the browser and downloaded instantly — nothing is stored online.',
      },
    ],
  },

  'sign-pdf-online': {
    slug: 'sign-pdf-online',
    title: 'Sign PDF Online Free – Draw Your Signature, No Upload Required',
    h1: 'Sign a PDF Online for Free',
    subheading:
      'Draw your signature directly on any PDF page using your mouse or touchscreen — no cloud uploads, no registration.',
    description:
      'Sign PDF documents online for free. Draw your handwritten signature or upload a signature image. No files are sent to any server. Private, instant, and completely free.',
    keywords:
      'sign pdf online, pdf signature, add signature to pdf, electronic signature pdf, draw signature pdf',
    prose: `Signing a PDF shouldn't require a subscription, an account, or handing your document to a third-party cloud. With LumiCore PDF Editor, you can place a handwritten electronic signature on any PDF page in under a minute — completely free and entirely within your browser.\n\nUse the Signature tool in the sidebar to open the signature pad. Draw your signature with your mouse, trackpad, or finger on a touchscreen device. Prefer an image? Upload a PNG of your handwritten signature instead. Once placed, you can resize and reposition the signature to sit exactly where the document requires it.\n\nBecause all processing is client-side, your signed document never touches a remote server. This is especially important for sensitive legal agreements, NDA documents, rental contracts, or medical consent forms where confidentiality is critical. No registration is needed, and the resulting PDF is downloaded directly to your device the moment you click Save. Fast, secure, and genuinely free.`,
    howToSteps: [
      {
        name: 'Open the PDF Editor',
        text: 'Navigate to the editor at pdfeditor.lumicore-labs.com/editor. No account is required.',
      },
      {
        name: 'Upload the Document to Sign',
        text: "Drag your PDF onto the canvas or use the file picker. Your document never leaves your browser's memory.",
      },
      {
        name: 'Open the Signature Tool',
        text: 'Click the Signature tool in the left toolbar. Draw your signature on the pad, or upload a PNG signature image.',
      },
      {
        name: 'Place and Resize Your Signature',
        text: 'Drag the signature to the correct position on the PDF page and resize it as needed.',
      },
      {
        name: 'Download the Signed PDF',
        text: 'Click Save to download the signed PDF directly to your device.',
      },
    ],
  },

  'free-pdf-editor': {
    slug: 'free-pdf-editor',
    title: 'Free PDF Editor Online – No Registration, No Watermarks, No Limits',
    h1: 'Free PDF Editor — No Registration, No Watermarks',
    subheading:
      'A fully-featured PDF editor that costs nothing, adds no watermarks, and requires no account — ever.',
    description:
      'The best free PDF editor online. Add text, sign, annotate, and extract text with OCR. No registration, no watermarks, no file uploads. Works in any modern browser.',
    keywords:
      'free pdf editor, pdf editor no watermark, pdf editor no sign up, best free pdf editor online',
    prose: `Finding a truly free PDF editor without hidden catches — no watermarks, no file limits behind a paywall, no forced account creation — is harder than it should be. LumiCore PDF Editor is the exception. Every feature is available immediately with no sign-up, no watermarks on your downloads, and no subscription required, ever.\n\nThe editor runs entirely inside your web browser. Powered by pdf.js for rendering and pdf-lib for saving, it handles standard PDF files up to 25 MB with full multi-page support. Add styled text annotations, draw freehand shapes, insert handwritten signatures, and use the built-in OCR engine to extract text from scanned documents — all at no cost.\n\nWhat makes this possible is the client-side architecture: there are no servers processing your files, so there are no infrastructure costs to recover through upsells. Your PDF is opened, edited, and saved entirely within your browser session. When you close the tab, the document is gone — nothing is retained or stored. That's the kind of free that actually means free.`,
    howToSteps: [
      {
        name: 'Go to the Editor',
        text: 'Visit pdfeditor.lumicore-labs.com and click "Open PDF Editor". No account or installation needed.',
      },
      {
        name: 'Load Your PDF',
        text: 'Drop your PDF file onto the editor canvas, or click the upload icon to select the file from your device.',
      },
      {
        name: 'Add Annotations',
        text: 'Choose a tool from the left sidebar: Text, Draw, Signature, or OCR. Customise the colour and size in the top toolbar.',
      },
      {
        name: 'Save Without Watermarks',
        text: 'Click the Save button to download the finished PDF. No watermarks are added — ever.',
      },
    ],
  },

  'ocr-pdf': {
    slug: 'ocr-pdf',
    title: 'OCR PDF Online Free – Extract Text from Scanned PDFs | LumiCore',
    h1: 'Extract Text from PDFs with Free Online OCR',
    subheading:
      'Convert scanned PDFs to selectable, copyable text using built-in OCR — no uploads, no external API calls, no cost.',
    description:
      'Free online PDF OCR tool. Extract text from scanned PDFs and image-based documents directly in your browser using Tesseract.js. No file uploads, no sign-up required.',
    keywords:
      'ocr pdf online, pdf text extraction, scan to text pdf, tesseract pdf, extract text from pdf free',
    prose: `Scanned PDFs — those made from photographed or photocopied documents — store pages as images, making text impossible to select or copy. OCR (Optical Character Recognition) solves this by analysing the image and reconstructing the underlying text. LumiCore PDF Editor includes a full OCR engine, powered by Tesseract.js, that runs directly inside your browser with no external API calls.\n\nTo use it, simply open any PDF, navigate to the page containing the scanned content, and activate the OCR tool from the sidebar. The engine analyses the page image and returns the recognised text within seconds. You can then copy the result, or use it as a reference while adding text annotations back onto the PDF.\n\nUnlike cloud OCR services, everything runs locally using WebAssembly. Your scanned document — whether it's a medical report, a historical archive, a legal brief, or a bank statement — never leaves your device. The OCR model (Tesseract English) is served from our own servers and cached in your browser after the first use, keeping subsequent runs fast. Free to use, no login required, and completely private.`,
    howToSteps: [
      {
        name: 'Open the PDF Editor',
        text: 'Go to pdfeditor.lumicore-labs.com/editor and upload the scanned PDF you want to extract text from.',
      },
      {
        name: 'Navigate to the Scanned Page',
        text: 'Use the page navigation controls to go to the page containing the scanned text or image.',
      },
      {
        name: 'Activate the OCR Tool',
        text: "Click the OCR button in the left sidebar. The Tesseract.js engine will begin analysing the page's image data.",
      },
      {
        name: 'Copy the Extracted Text',
        text: 'Once processing is complete, the recognised text appears in the sidebar panel. Select and copy it as needed.',
      },
    ],
  },
}

/** Ordered list of slugs for sitemap generation */
export const toolSlugs = Object.keys(toolsConfig)
