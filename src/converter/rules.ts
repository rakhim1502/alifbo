/**
 * O'zbek Alifbo Konvertori — Conversion Rules
 * Eski alifbodan yangi alifboga character/pattern mapping
 * 
 * Muhim: Bu qoidalar kelajakda kengaytiriladi.
 * Har bir qoida alohida va mustaqil.
 * 
 * Qoida tuzilishi:
 * - Ko'p harfli kombinatsiyalar avval tekshiriladi (sh, ch, ng, o', g')
 * - Keyin yolg'iz harflar
 * - Case preservation: katta/kichik/mixed harflar saqlanadi
 */

import type { CharacterMapping } from './types';
import { STANDARD_APOSTROPHE } from './normalize';

/**
 * Asosiy character mapping — eski → yangi
 * 
 * Eski alifbo (amaldagi lotin):
 * a b d e f g g' h i j k l m n ng o o' p q r s sh t u v x y z ch
 * 
 * Yangi alifbo (taklif qilinayotgan):
 * a b d e f g ğ h i j k l m n ng ö p q r s ş t u v x y z ç
 * 
 * Priority: ko'p harfli kombinatsiyalar yuqori priority'ga ega
 */
export const CHARACTER_MAPPINGS: CharacterMapping[] = [
  // === Ko'p harfli kombinatsiyalar (yuqori priority) ===
  
  // sh → ş
  { old: 'sh', new: 'ş', caseMode: 'lower' },
  { old: 'Sh', new: 'Ş', caseMode: 'title' },
  { old: 'SH', new: 'Ş', caseMode: 'upper' },
  
  // ch → ç
  { old: 'ch', new: 'ç', caseMode: 'lower' },
  { old: 'Ch', new: 'Ç', caseMode: 'title' },
  { old: 'CH', new: 'Ç', caseMode: 'upper' },
  
  // ng → ñ (so'z ichida)
  { old: 'ng', new: 'ñ', caseMode: 'lower' },
  { old: 'Ng', new: 'Ñ', caseMode: 'title' },
  { old: 'NG', new: 'Ñ', caseMode: 'upper' },
  
  // o' → ö (apostrophe bilan)
  { old: `o${STANDARD_APOSTROPHE}`, new: 'ö', caseMode: 'lower' },
  { old: `O${STANDARD_APOSTROPHE}`, new: 'Ö', caseMode: 'title' },
  
  // g' → ğ (apostrophe bilan)
  { old: `g${STANDARD_APOSTROPHE}`, new: 'ğ', caseMode: 'lower' },
  { old: `G${STANDARD_APOSTROPHE}`, new: 'Ğ', caseMode: 'title' },
];

/**
 * Exception so'zlar — maxsus qoidalar
 * 
 * Bu so'zlar umumiy qoidadan chetga chiqadi.
 * Masalan: "o'zbek" → "özbek" (lekin "o'g'ri" → "öğri")
 * 
 * Keyinchalik MongoDB'dan yuklanadi.
 */
export const EXCEPTION_WORDS: Map<string, string> = new Map([
  // Geografik nomlar
  ["o'zbekiston", "özbekiston"],
  ["o'zbekistonga", "özbekistonga"],
  ["o'zbekistondan", "özbekistondan"],
  ["o'zbekistonda", "özbekistonda"],
  
  // Millat/ti nomlari
  ["o'zbek", "özbek"],
  ["o'zbeklar", "özbeklar"],
  ["o'zbekcha", "özbekcha"],
  ["o'zbekning", "özbekning"],
  
  // Keng tarqalgan so'zlar
  ["o'qish", "öqish"],
  ["o'qidi", "öqidi"],
  ["o'qiydi", "öqiydi"],
  ["o'quvchi", "öquvchi"],
  
  // G' bilan boshlanadigan so'zlar
  ["g'arbiy", "ğarbiy"],
  ["g'arbdan", "ğarbdan"],
  ["g'alaba", "ğalaba"],
  ["g'oyat", "ğoyat"],
  ["g'oya", "ğoya"],
  ["g'oyib", "ğoyib"],
  ["g'isht", "ğisht"],
  ["g'ildirak", "ğildirak"],
  
  // Katta harf bilan
  ["O'zbekiston", "Özbekiston"],
  ["O'zbek", "Özbek"],
  ["G'arbiy", "Ğarbiy"],
  ["G'alaba", "Ğalaba"],
]);

/**
 * URL va email pattern'lari — konvertatsiya qilinmaydi
 */
export const PRESERVE_PATTERNS = {
  url: /https?:\/\/[^\s<>"')\]]+/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Raqamlar va punctuation saqlanadi
  number: /\b\d+([.,]\d+)*\b/g,
};

/**
 * Punctuation belgilari — konvertatsiya qilinmaydi
 */
export const PUNCTUATION = new Set<string>([
  '.', ',', '!', '?', ':', ';', '-', '\u2014', '\u2013',
  '(', ')', '[', ']', '{', '}',
  '\u0022', '\u201C', '\u201D', '\u2018', '\u2019',
  '%', '\u2116', '&', '#', '@',
  '/', '\\', '|', '<', '>',
  '+', '=', '*', '~', '^',
]);

/**
 * Qisqartmalar — konvertatsiya qilinmaydi
 */
export const ABBREVIATIONS = new Set<string>([
  'km', 'm', 'sm', 'mm', 'kg', 'g', 'mg',
  'ml', 'l', 'dl',
  'soat', 'min', 'sek',
  'hoz', 'yr', 'yil',
  'MS', 'PhD', 'BA', 'MA',
  'USA', 'UK', 'EU', 'UN',
  'AI', 'IT', 'API', 'URL',
]);

/**
 * Qoidalar priority bo'yicha tartiblangan
 * Ko'p harfli kombinatsiyalar avval tekshiriladi
 */
export function getSortedRules(): CharacterMapping[] {
  return [...CHARACTER_MAPPINGS].sort((a, b) => {
    // Ko'p harfli kombinatsiyalar avval (length bo'yicha)
    return b.old.length - a.old.length;
  });
}

/**
 * So'z uchun exception tekshirish
 */
export function getException(word: string): string | null {
  const lower = word.toLowerCase();
  if (EXCEPTION_WORDS.has(lower)) {
    return EXCEPTION_WORDS.get(lower)!;
  }
  return null;
}

/**
 * So'z qisqartma ekanligini tekshirish
 */
export function isAbbreviation(word: string): boolean {
  return ABBREVIATIONS.has(word) || ABBREVIATIONS.has(word.toLowerCase());
}

/**
 * Barcha qoidalarni olish (exception + character mappings)
 */
export function getAllRules() {
  return {
    characterMappings: getSortedRules(),
    exceptions: EXCEPTION_WORDS,
    preservePatterns: PRESERVE_PATTERNS,
    punctuation: PUNCTUATION,
    abbreviations: ABBREVIATIONS,
  };
}
