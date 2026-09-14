/**
 * O'zbek Alifbo Konvertori — Asosiy Converter
 * Conversion pipeline: Input → Normalize → Tokenize → Convert → Validate → Output
 */

import { normalize } from './normalize';
import { getSortedRules, PRESERVE_PATTERNS, EXCEPTION_WORDS } from './rules';
import type { ConversionResult, ConversionOptions, ConversionStats } from './types';

/**
 * Matnni statistikalarini hisoblaydi
 */
function calculateStats(text: string): ConversionStats {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  
  return { characters, words, lines };
}

/**
 * URL va email'larni placeholder bilan almashtiradi
 * Konvertatsiya paytida ular buzilmasligi uchun
 */
function protectPatterns(text: string): { protectedText: string; placeholders: Map<string, string> } {
  const placeholders = new Map<string, string>();
  let counter = 0;
  let protectedText = text;

  // URL'larni himoyalash
  protectedText = protectedText.replace(PRESERVE_PATTERNS.url, (match) => {
    const key = `__URL_PLACEHOLDER_${counter}__`;
    placeholders.set(key, match);
    counter++;
    return key;
  });

  // Email'larni himoyalash
  protectedText = protectedText.replace(PRESERVE_PATTERNS.email, (match) => {
    const key = `__EMAIL_PLACEHOLDER_${counter}__`;
    placeholders.set(key, match);
    counter++;
    return key;
  });

  return { protectedText, placeholders };
}

/**
 * Placeholder'larni asl matn bilan qaytaradi
 */
function restorePatterns(text: string, placeholders: Map<string, string>): string {
  let result = text;
  for (const [key, value] of placeholders) {
    result = result.replace(key, value);
  }
  return result;
}

/**
 * Bitta so'zni konvertatsiya qiladi
 */
function convertWord(word: string): string {
  // Exception dictionary tekshirish
  const lowerWord = word.toLowerCase();
  if (EXCEPTION_WORDS.has(lowerWord)) {
    const exceptionResult = EXCEPTION_WORDS.get(lowerWord)!;
    // Case preservation
    if (word === word.toUpperCase()) {
      return exceptionResult.toUpperCase();
    }
    if (word[0] === word[0].toUpperCase()) {
      return exceptionResult[0].toUpperCase() + exceptionResult.slice(1);
    }
    return exceptionResult;
  }

  // Qoidalar bo'yicha konvertatsiya
  const rules = getSortedRules();
  let result = word;

  for (const rule of rules) {
    // Ko'p harfli kombinatsiyalarni almashtirish
    if (rule.old.length > 1) {
      // Case-sensitive almashtirish
      const regex = new RegExp(escapeRegex(rule.old), 'g');
      result = result.replace(regex, rule.new);
    }
  }

  return result;
}

/**
 * Regex uchun maxsus belgilarni escape qiladi
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Asosiy konvertatsiya funksiyasi
 * Eski alifbodan yangi alifboga matnni o'giradi
 */
export function convertText(
  inputText: string,
  options: ConversionOptions = {}
): ConversionResult {
  const defaultOptions: ConversionOptions = {
    preserveCase: true,
    normalizeApostrophes: true,
    preserveUrls: true,
    preserveEmails: true,
    preserveNumbers: true,
    ...options,
  };

  // Input validation
  if (!inputText || typeof inputText !== 'string') {
    return {
      success: true,
      originalText: inputText || '',
      convertedText: '',
      stats: { characters: 0, words: 0, lines: 0 },
    };
  }

  try {
    // 1. Normalize
    let text = normalize(inputText, {
      normalizeApostrophes: defaultOptions.normalizeApostrophes,
    });

    // 2. URL va email'larni himoyalash
    let placeholders = new Map<string, string>();
    if (defaultOptions.preserveUrls || defaultOptions.preserveEmails) {
      const protected_ = protectPatterns(text);
      text = protected_.protectedText;
      placeholders = protected_.placeholders;
    }

    // 3. Tokenization va conversion
    // So'zlar va bo'sh joylarni alohida ajratish
    const tokens = text.split(/(\s+)/);
    const convertedTokens = tokens.map(token => {
      // Bo'sh joylarni o'zgartirmaslik
      if (/^\s+$/.test(token)) {
        return token;
      }
      // Placeholder'larni o'zgartirmaslik
      if (token.startsWith('__') && token.endsWith('__')) {
        return token;
      }
      // So'zni konvertatsiya qilish
      return convertWord(token);
    });

    let result = convertedTokens.join('');

    // 4. Placeholder'larni qaytarish
    if (placeholders.size > 0) {
      result = restorePatterns(result, placeholders);
    }

    // 5. Natija
    return {
      success: true,
      originalText: inputText,
      convertedText: result,
      stats: calculateStats(result),
    };
  } catch (error) {
    return {
      success: false,
      originalText: inputText,
      convertedText: '',
      stats: { characters: 0, words: 0, lines: 0 },
      errors: [error instanceof Error ? error.message : 'Nomaʼlum xatolik'],
    };
  }
}
