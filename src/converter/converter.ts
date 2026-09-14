/**
 * O'zbek Alifbo Konvertori — Asosiy Converter
 * Conversion pipeline: Input → Validate → Normalize → Tokenize → Convert → Validate → Output
 */

import { normalize } from './normalize';
import { tokenize, tokensToText } from './tokenizer';
import { getSortedRules, isAbbreviation } from './rules';
import { dictionary } from './dictionary';
import { validateInput, validateOutput } from './validator';
import { detectCase, applyCase, escapeRegex, calculateStats } from './utils';
import type { ConversionResult, ConversionOptions, Token } from './types';

/**
 * Bitta so'zni konvertatsiya qiladi
 * 
 * Avval exception dictionary tekshiriladi,
 * keyin character mapping qoidalari qo'llaniladi.
 */
function convertWord(word: string): string {
  if (word.length === 0) return word;
  
  // Qisqartma tekshirish — konvertatsiya qilinmaydi
  if (isAbbreviation(word)) {
    return word;
  }
  
  // 1. Exception dictionary tekshirish
  const entry = dictionary.lookup(word);
  if (entry) {
    // Case preservation
    const caseType = detectCase(word);
    return applyCase(entry.newForm, caseType, word);
  }
  
  // 2. Character mapping qoidalarini qo'llash
  const rules = getSortedRules();
  let result = word;
  
  for (const rule of rules) {
    // Ko'p harfli kombinatsiyalarni almashtirish
    if (rule.old.length > 1) {
      const regex = new RegExp(escapeRegex(rule.old), 'g');
      result = result.replace(regex, rule.new);
    }
  }
  
  return result;
}

/**
 * Token'ni konvertatsiya qiladi
 * 
 * Faqat word token'lari konvertatsiya qilinadi.
 * Boshqa token turlari (URL, email, number, punctuation, abbreviation) o'zgarishsiz qoladi.
 */
function convertToken(token: Token): Token {
  if (token.type === 'word') {
    return {
      ...token,
      value: convertWord(token.value),
    };
  }
  // abbreviation, url, email, number, punctuation, whitespace — o'zgarishsiz
  return token;
}

/**
 * Asosiy konvertatsiya funksiyasi
 * Eski alifbodan yangi alifboga matnni o'giradi
 * 
 * Pipeline:
 * 1. Input validation
 * 2. Unicode normalization
 * 3. Apostrophe normalization
 * 4. Whitespace normalization
 * 5. Tokenization (URL/email protection)
 * 6. Word-level conversion (dictionary + rules)
 * 7. Output validation
 * 8. Return result
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
    preservePunctuation: true,
    ...options,
  };

  // 1. Input validation
  const inputValidation = validateInput(inputText);
  if (!inputValidation.valid) {
    return {
      success: false,
      originalText: typeof inputText === 'string' ? inputText : '',
      convertedText: '',
      stats: { characters: 0, words: 0, lines: 0 },
      errors: inputValidation.errors,
    };
  }

  // Empty input
  if (!inputText || inputText.trim().length === 0) {
    return {
      success: true,
      originalText: inputText || '',
      convertedText: '',
      stats: { characters: 0, words: 0, lines: 0 },
    };
  }

  try {
    // 2-4. Normalize
    let text = normalize(inputText, {
      normalizeApostrophes: defaultOptions.normalizeApostrophes,
    });

    // 5. Tokenize (URL/email protection ichida)
    const tokens = tokenize(text);

    // 6. Convert tokens
    const convertedTokens = tokens.map(convertToken);

    // 7. Reconstruct text
    let result = tokensToText(convertedTokens);

    // 8. Output validation
    const outputValidation = validateOutput(result);
    if (!outputValidation.valid) {
      return {
        success: false,
        originalText: inputText,
        convertedText: '',
        stats: { characters: 0, words: 0, lines: 0 },
        errors: outputValidation.errors,
      };
    }

    // 9. Return result
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
      errors: [error instanceof Error ? error.message : 'Nomaʼlum xatolik yuz berdi'],
    };
  }
}

/**
 * Real-time conversion (debounced)
 * Foydalanuvchi yozayotganda har bir o'zgarishda ishlatiladi
 */
export function convertRealtime(
  inputText: string,
  options?: ConversionOptions
): ConversionResult {
  return convertText(inputText, options);
}

/**
 * Performance test — katta matn bilan konvertatsiya
 */
export function performanceTest(textSize: number = 100000): {
  inputSize: number;
  outputSize: number;
  duration: number;
  wordsPerSecond: number;
} {
  // Test matni yaratish
  const testWords = [
    "O'zbekiston", "shahar", "chiroyli", "g'arbiy", "to'g'ri",
    "o'qish", "o'rganmoq", "g'alaba", "shirin", "chiroq",
    "https://example.com", "test@mail.com", "123", "2026",
  ];
  
  let testText = '';
  while (testText.length < textSize) {
    testText += testWords[Math.floor(Math.random() * testWords.length)] + ' ';
  }
  
  // Performance o'lchash
  const startTime = performance.now();
  const result = convertText(testText);
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  const wordsPerSecond = (result.stats.words / duration) * 1000;
  
  return {
    inputSize: testText.length,
    outputSize: result.convertedText.length,
    duration,
    wordsPerSecond,
  };
}
