/**
 * O'zbek Alifbo Konvertori — Normalization module
 * Unicode normalization, whitespace normalization, apostrophe normalization
 */

// Turli apostrophe variantlari
const APOSTROPHE_VARIANTS = /[\u0027\u0060\u2018\u2019\u02BB\u02BC\uA78C]/g;
const STANDARD_APOSTROPHE = '\u2018'; // '

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
    // Ketma-ket 2+ space'larni bitta space'ga almashtirish
    normalized = normalized.replace(/ {2,}/g, ' ');
    // Bosh va oxiridagi space'larni olib tashlash
    normalized = normalized.trim();
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
 */
export function normalizeApostrophes(text: string): string {
  return text.replace(APOSTROPHE_VARIANTS, STANDARD_APOSTROPHE);
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
