/**
 * O'zbek Alifbo Konvertori — File Parser Service
 * 
 * DOCX, PDF va TXT fayllardan text extract qiladi.
 * Barcha parsing browser'da amalga oshiriladi (hech qanday server upload yo'q).
 * 
 * Fayl hajmi limiti: 5MB
 * Qo'llab-quvvatlanadigan formatlar: TXT, DOCX, PDF
 */

// mammoth — dynamic import orqali
async function getMammoth() {
  return await import('mammoth');
}

// PDF.js worker konfiguratsiyasi — Vite uchun
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Worker'ni jsdelivr CDN'dan yuklash (ishonchli va tez)
    const version = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

/**
 * Qo'llab-quvvatlanadigan fayl turlari
 */
export const SUPPORTED_FILE_TYPES = {
  txt: {
    mime: ['text/plain'],
    extensions: ['.txt', '.text'],
    label: 'TXT',
  },
  docx: {
    mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
    label: 'DOCX',
  },
  pdf: {
    mime: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF',
  },
  md: {
    mime: ['text/markdown'],
    extensions: ['.md', '.markdown'],
    label: 'Markdown',
  },
} as const;

export type SupportedFileType = keyof typeof SUPPORTED_FILE_TYPES;

/**
 * Fayl parsing natijasi
 */
export interface ParseResult {
  success: boolean;
  text: string;
  fileName: string;
  fileType: SupportedFileType;
  fileSize: number;
  errors?: string[];
}

/**
 * Fayl hajmi limiti (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Fayl turini aniqlash
 */
export function detectFileType(file: File): SupportedFileType | null {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  for (const [type, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if ((config.extensions as readonly string[]).includes(extension as string)) {
      return type as SupportedFileType;
    }
    if ((config.mime as readonly string[]).includes(file.type)) {
      return type as SupportedFileType;
    }
  }
  
  return null;
}

/**
 * Faylni validate qilish
 */
export function validateFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Hajm tekshirish
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Fayl hajmi juda katta. Maksimal: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  if (file.size === 0) {
    errors.push('Fayl bo\'sh');
  }
  
  // Tur tekshirish
  const fileType = detectFileType(file);
  if (!fileType) {
    errors.push('Qo\'llab-quvvatlanmaydigan fayl turi. TXT, DOCX yoki PDF yuklang.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * TXT faylni o'qish
 */
async function parseTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Faylni o\'qishda xatolik'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * DOCX faylni o'qish (mammoth orqali)
 */
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const mammoth = await getMammoth();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * PDF faylni o'qish (pdfjs-dist orqali)
 */
async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const lib = await getPdfLib();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  
  let fullText = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Text items'ni birlashtirish
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText;
    
    // Sahifalar orasiga yangi qator qo'shish
    if (i < numPages) {
      fullText += '\n\n';
    }
  }
  
  return fullText;
}

/**
 * Markdown faylni o'qish
 */
async function parseMarkdown(file: File): Promise<string> {
  return parseTxt(file); // Markdown ham oddiy text sifatida o'qiladi
}

/**
 * Asosiy fayl parsing funksiyasi
 * Fayl turini avtomatik aniqlaydi va text extract qiladi
 */
export async function parseFile(file: File): Promise<ParseResult> {
  // Validation
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      text: '',
      fileName: file.name,
      fileType: 'txt',
      fileSize: file.size,
      errors: validation.errors,
    };
  }
  
  const fileType = detectFileType(file)!;
  
  try {
    let text: string;
    
    switch (fileType) {
      case 'txt':
        text = await parseTxt(file);
        break;
      case 'docx':
        text = await parseDocx(file);
        break;
      case 'pdf':
        text = await parsePdf(file);
        break;
      case 'md':
        text = await parseMarkdown(file);
        break;
      default:
        throw new Error('Qo\'llab-quvvatlanmaydigan fayl turi');
    }
    
    return {
      success: true,
      text,
      fileName: file.name,
      fileType,
      fileSize: file.size,
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      fileName: file.name,
      fileType,
      fileSize: file.size,
      errors: [error instanceof Error ? error.message : 'Faylni o\'qishda xatolik'],
    };
  }
}

/**
 * Fayl hajmini formatlash
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Accept attribute qiymatini olish
 */
export function getFileAcceptString(): string {
  const allExtensions: string[] = [];
  for (const config of Object.values(SUPPORTED_FILE_TYPES)) {
    allExtensions.push(...config.extensions);
  }
  return allExtensions.join(',');
}
