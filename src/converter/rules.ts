/**
 * O'zbek Alifbo Konvertori — Conversion Rules
 * Eski alifbodan yangi alifboga character/pattern mapping
 * 
 * Muhim: Bu qoidalar kelajakda kengaytiriladi.
 * Har bir qoida alohida va mustaqil.
 */

import type { CharacterMapping } from './types';

/**
 * Asosiy character mapping — eski → yangi
 * 
 * ESKi alifbo (amaldagi lotin):
 * a b d e f g g' h i j k l m n ng o o' p q r s sh t u v x y z ch
 * 
 * YANGI alifbo (taklif qilinayotgan):
 * a b d e f g ğ h i j k l m n ng ö p q r s ş t u v x y z ç
 */
export const CHARACTER_MAPPINGS: CharacterMapping[] = [
  // Ko'p harfli kombinatsiyalar (avval tekshiriladi)
  { old: 'sh', new: 'ş' },
  { old: 'Sh', new: 'Ş' },
  { old: 'SH', new: 'Ş' },
  { old: 'ch', new: 'ç' },
  { old: 'Ch', new: 'Ç' },
  { old: 'CH', new: 'ç' },
  { old: 'ng', new: 'ñ' },
  { old: 'Ng', new: 'Ñ' },
  { old: 'NG', new: 'Ñ' },
  
  // O' va G' kombinatsiyalari (apostrophe bilan)
  { old: "o\u2018", new: 'ö' },  // o' → ö
  { old: "O\u2018", new: 'Ö' },  // O' → Ö
  { old: "g\u2018", new: 'ğ' },  // g' → ğ
  { old: "G\u2018", new: 'Ğ' },  // G' → Ğ
];

/**
 * Keyinchalik qo'shiladigan exception so'zlar
 * Hozircha bo'sh — PHASE 3 da to'ldiriladi
 */
export const EXCEPTION_WORDS: Map<string, string> = new Map([
  // Kelajakda exception so'zlar qo'shiladi
  // Masalan: "o'zbek" → "özbek" (lekin "o'g'ri" → "öğri")
]);

/**
 * URL va email pattern'lari — konvertatsiya qilinmaydi
 */
export const PRESERVE_PATTERNS = {
  url: /https?:\/\/[^\s]+/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
};

/**
 * Qoidalar priority bo'yicha tartiblangan
 */
export function getSortedRules(): CharacterMapping[] {
  return [...CHARACTER_MAPPINGS].sort((a, b) => {
    // Ko'p harfli kombinatsiyalar avval
    return b.old.length - a.old.length;
  });
}
