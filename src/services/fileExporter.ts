/**
 * O'zbek Alifbo Konvertori — File Exporter Service
 * 
 * Konvertatsiya qilingan matnni turli formatlarda yuklab olish
 * Qo'llab-quvvatlanadigan formatlar: TXT, DOCX
 * 
 * Kelajakda: PDF export
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export type ExportFormat = 'txt' | 'docx';

/**
 * Export natijasi
 */
export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  fileName: string;
  errors?: string[];
}

/**
 * TXT formatida yuklab olish
 */
export function exportAsTxt(text: string, fileName: string = 'converted-text'): ExportResult {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${fileName}.txt`);
    
    return {
      success: true,
      format: 'txt',
      fileName: `${fileName}.txt`,
    };
  } catch (error) {
    return {
      success: false,
      format: 'txt',
      fileName: `${fileName}.txt`,
      errors: [error instanceof Error ? error.message : 'TXT export xatosi'],
    };
  }
}

/**
 * DOCX formatida yuklab olish
 * Professional formatlash bilan
 */
export async function exportAsDocx(
  text: string,
  fileName: string = 'converted-text',
  options: {
    title?: string;
    author?: string;
    description?: string;
  } = {}
): Promise<ExportResult> {
  try {
    // Matnni paragraflarga ajratish
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    // DOCX document yaratish
    const docParagraphs = paragraphs.map(para => {
      return new Paragraph({
        children: [
          new TextRun({
            text: para,
            size: 24, // 12pt
            font: 'Arial',
          }),
        ],
        spacing: {
          after: 200, // 10pt
        },
      });
    });
    
    // Document yaratish
    const doc = new Document({
      creator: options.author || 'O\'zbek Alifbo Konvertori',
      title: options.title || 'Konvertatsiya qilingan matn',
      description: options.description || 'O\'zbek alifbo konvertori orqali yaratilgan',
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 24,
            },
          },
        },
      },
      sections: [{
        properties: {},
        children: docParagraphs,
      }],
    });
    
    // DOCX faylni generatsiya qilish
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
    
    return {
      success: true,
      format: 'docx',
      fileName: `${fileName}.docx`,
    };
  } catch (error) {
    return {
      success: false,
      format: 'docx',
      fileName: `${fileName}.docx`,
      errors: [error instanceof Error ? error.message : 'DOCX export xatosi'],
    };
  }
}

/**
 * Universal export funksiyasi
 */
export async function exportFile(
  text: string,
  format: ExportFormat,
  fileName: string = 'converted-text'
): Promise<ExportResult> {
  switch (format) {
    case 'txt':
      return exportAsTxt(text, fileName);
    case 'docx':
      return exportAsDocx(text, fileName);
    default:
      return {
        success: false,
        format,
        fileName: `${fileName}.${format}`,
        errors: ['Qo\'llab-quvvatlanmaydigan format'],
      };
  }
}

/**
 * Fayl nomi generatsiya qilish
 */
export function generateFileName(originalName?: string, format: ExportFormat = 'txt'): string {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  if (originalName) {
    // Original fayl nomidan asosiy qismini olish
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `${baseName}-converted-${timestamp}`;
  }
  
  return `converted-${timestamp}`;
}
