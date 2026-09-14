/**
 * O'zbek Alifbo Konvertori — Services Module
 */

export {
  parseFile,
  validateFile,
  detectFileType,
  formatFileSize,
  getFileAcceptString,
  SUPPORTED_FILE_TYPES,
} from './fileParser';
export type { ParseResult, SupportedFileType } from './fileParser';

export {
  exportAsTxt,
  exportAsDocx,
  exportFile,
  generateFileName,
} from './fileExporter';
export type { ExportResult, ExportFormat } from './fileExporter';
