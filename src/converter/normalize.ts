/**
 * O'zbek Alifbo Konvertori — Normalization module
 * Unicode normalization, whitespace normalization, apostrophe normalization
 */

/**
 * Barcha apostrophe variantlari — turli Unicode belgilar
 * 
 * \u0027 — ' (apostrophe / straight quote)
 * \u0060 — ` (grave accent)
 * \u2018 — ' (left single quotation mark)
 * \u2019 — ' (right single quotation mark)
 * \u02BB — ʻ (modifier letter turned comma)
 * \u02BC — ʼ (modifier letter apostrophe)
 * \uA78C — ꞌ (small letter low left corner bracket — kam uchraydi)
 * \u2032 — ′ (prime)
 * \u0313 — ◌̓ (combining comma above)
 */
const APOSTROPHE_VARIANTS = /[\u0027\u0060\u2018\u2019\u02BB\u02BC\uA78C\u2032]/g;

/**
 * Standart apostrophe — o'zbek tilida ishlatiladigan
 * Right single quotation mark (') — eng keng tarqalgan
 */
export const STANDARD_APOSTROPHE = '\u2019'; // '

/**
 * Unicode NFKC normalization
 * Turli Unicode variantlarini bir xil shaklga keltiradi
 */
export function normalizeUnicode(text: string): string {
  return text.normalize('NFKC');
}

/**
 * Whitespace normalization
 * Ortiqcha bo'sh joylarni olib tashlaydi, lekin paragraph structure'ni saqlaydi
 */
export function normalizeWhitespace(text: string): string {
  // Har bir qatordagi ortiqcha bo'sh joylarni olib tashlash
  const lines = text.split('\n');
  const normalizedLines = lines.map(line => {
    // Tab'larni space'ga almashtirish
    let normalized = line.replace(/\t/g, ' ');
    // Non-breaking space'ni oddiy space'ga almashtirish
    normalized = normalized.replace(/\u00A0/g, ' ');
    // Ketma-ket 2+ space'larni bitta space'ga almashtirish
    normalized = normalized.replace(/ {2,}/g, ' ');
    return normalized;
  });
  
  // Ketma-ket 3+ qator bo'sh joylarni 2 ta qator bo'sh joyga almashtirish
  return normalizedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Apostrophe normalization
 * Turli apostrophe belgilarini bir xil standart shaklga keltiradi
 * 
 * Masalan:
 * O'zbekiston → O\u2019zbekiston
 * O'zbekiston → O\u2019zbekiston
 * Oʻzbekiston → O\u2019zbekiston
 * Oʼzbekiston → O\u2019zbekiston
 */
export function normalizeApostrophes(text: string): string {
  return text.replace(APOSTROPHE_VARIANTS, STANDARD_APOSTROPHE);
}

/**
 * Apostrophe turini aniqlash
 * Matnda qanday apostrophe ishlatilganini tekshiradi
 */
export function detectApostropheType(text: string): string | null {
  const match = text.match(APOSTROPHE_VARIANTS);
  if (!match) return null;
  
  // Eng ko'p ishlatilgan variantni qaytarish
  const counts = new Map<string, number>();
  for (const char of match) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  
  let maxChar = match[0];
  let maxCount = 0;
  for (const [char, count] of counts) {
    if (count > maxCount) {
      maxChar = char;
      maxCount = count;
    }
  }
  
  return maxChar;
}

/**
 * To'liq normalization pipeline
 */
export function normalize(text: string, options: { normalizeApostrophes?: boolean } = {}): string {
  let result = text;
  
  // 1. Unicode normalization
  result = normalizeUnicode(result);
  
  // 2. Apostrophe normalization (agar so'ralgan bo'lsa)
  if (options.normalizeApostrophes !== false) {
    result = normalizeApostrophes(result);
  }
  
  // 3. Whitespace normalization
  result = normalizeWhitespace(result);
  
  return result;
}
