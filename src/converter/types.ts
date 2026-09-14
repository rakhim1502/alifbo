/**
 * O'zbek Alifbo Konvertori — Type definitions
 * Conversion engine uchun barcha TypeScript interfeyslari
 */

export interface ConversionResult {
  success: boolean;
  originalText: string;
  convertedText: string;
  stats: ConversionStats;
  errors?: string[];
}

export interface ConversionStats {
  characters: number;
  words: number;
  lines: number;
}

export interface ConversionRule {
  name: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  priority: number;
  active: boolean;
  description?: string;
}

export interface CharacterMapping {
  old: string;
  new: string;
  context?: 'start' | 'middle' | 'end' | 'any';
  caseMode?: 'lower' | 'upper' | 'title' | 'any';
}

export interface ConversionOptions {
  preserveCase?: boolean;
  normalizeApostrophes?: boolean;
  preserveUrls?: boolean;
  preserveEmails?: boolean;
  preserveNumbers?: boolean;
  preservePunctuation?: boolean;
}

export interface DictionaryEntry {
  word: string;
  oldForm: string;
  newForm: string;
  category: string;
  priority: number;
  active: boolean;
}

export type Token = {
  type: 'word' | 'whitespace' | 'punctuation' | 'number' | 'url' | 'email' | 'abbreviation' | 'placeholder' | 'unknown';
  value: string;
  index: number;
};

export type ConversionMode = 'old-to-new' | 'new-to-old';
