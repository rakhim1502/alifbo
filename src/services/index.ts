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

export { storage } from './storage';
export type { ConversionRecord, Statistics, UserPreferences } from './storage';

export { dictionaryService } from './dictionaryService';
export type { CustomDictionaryEntry } from './dictionaryService';
