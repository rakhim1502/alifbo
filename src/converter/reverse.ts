/**
 * O'zbek Alifbo Konvertori — Reverse Converter
 * Yangi alifbodan eski alifboga konvertatsiya
 * 
 * Yangi alifbo: a b d e f g ğ h i j k l m n ñ o ö p q r s ş t u v x y z ç
 * Eski alifbo: a b d e f g g' h i j k l m n ng o o' p q r s sh t u v x y z ch
 */

import { normalize } from './normalize';
import { tokenize, tokensToText } from './tokenizer';
import { PRESERVE_PATTERNS } from './rules';
import { validateInput, validateOutput } from './validator';
import { escapeRegex, calculateStats } from './utils';
import type { ConversionResult, ConversionOptions, Token } from './types';
import { STANDARD_APOSTROPHE } from './normalize';

/**
 * Yangi → Eski character mapping
 */
export const REVERSE_CHARACTER_MAPPINGS = [
  // Ko'p harfli kombinatsiyalar (avval tekshiriladi)
  { old: 'ş', new: 'sh' },
  { old: 'Ş', new: 'Sh' },
  { old: 'ç', new: 'ch' },
  { old: 'Ç', new: 'Ch' },
  { old: 'ñ', new: 'ng' },
  { old: 'Ñ', new: 'Ng' },
  
  // Ö → O'
  { old: 'ö', new: `o${STANDARD_APOSTROPHE}` },
  { old: 'Ö', new: `O${STANDARD_APOSTROPHE}` },
  
  // Ğ → G'
  { old: 'ğ', new: `g${STANDARD_APOSTROPHE}` },
  { old: 'Ğ', new: `G${STANDARD_APOSTROPHE}` },
];

/**
 * Reverse exception dictionary
 * Yangi alifbodagi so'zlar → Eski alifbodagi so'zlar
 */
export const REVERSE_EXCEPTION_WORDS: Map<string, string> = new Map([
  // Geografik nomlar
  ['özbekiston', "O'zbekiston"],
  ['özbekistonga', "O'zbekistonga"],
  ['özbekistondan', "O'zbekistondan"],
  ['özbekistonda', "O'zbekistonda"],
  
  // Millat/til nomlari
  ['özbek', "o'zbek"],
  ['özbeklar', "o'zbeklar"],
  ['özbekcha', "o'zbekcha"],
  ['özbekning', "o'zbekning"],
  
  // Keng tarqalgan so'zlar
  ['öqish', "o'qish"],
  ['öqidi', "o'qidi"],
  ['öqiydi', "o'qiydi"],
  ['öquvchi', "o'quvchi"],
  ['öqituvçi', "o'qituvchi"],
  ['örganmoq', "o'rganmoq"],
  ['örgandi', "o'rgandi"],
  ['öylamoq', "o'ylamoq"],
  ['öylaydi', "o'ylaydi"],
  ['örnini', "o'rnini"],
  ['örta', "o'rta"],
  ['örtada', "o'rtada"],
  ['ötgan', "o'tgan"],
  ['ötkir', "o'tkir"],
  ['ölim', "o'lim"],
  ['ölgan', "o'lgan"],
  ['öz', "o'z"],
  ['özi', "o'zi"],
  ['özim', "o'zim"],
  ['öziñiz', "o'zingiz"],
  ['özini', "o'zini"],
  ['özaro', "o'zaro"],
  
  // G' bilan boshlanadigan so'zlar
  ['ğarbiy', "g'arbiy"],
  ['ğarbdan', "g'arbdan"],
  ['ğarb', "g'arb"],
  ['ğalaba', "g'alaba"],
  ['ğoyat', "g'oyat"],
  ['ğoya', "g'oya"],
  ['ğoyib', "g'oyib"],
  ['ğisht', "g'isht"],
  ['ğildirak', "g'ildirak"],
  ['ğazab', "g'azab"],
  ['ğamgin', "g'amgin"],
  ['ğarib', "g'arib"],
  ['ğam', "g'am"],
  
  // Katta harf bilan
  ['Özbekiston', "O'zbekiston"],
  ['Özbek', "O'zbek"],
  ['Ğarbiy', "G'arbiy"],
  ['Ğalaba', "G'alaba"],
  ['Öz', "O'z"],
]);

/**
 * Bitta so'zni teskari konvertatsiya qiladi
 */
function reverseConvertWord(word: string): string {
  if (word.length === 0) return word;
  
  // 1. Exception dictionary tekshirish
  const lowerWord = word.toLowerCase();
  if (REVERSE_EXCEPTION_WORDS.has(lowerWord)) {
    const exceptionResult = REVERSE_EXCEPTION_WORDS.get(lowerWord)!;
    
    // Case preservation
    if (word === word.toUpperCase() && word !== word.toLowerCase()) {
      return exceptionResult.toUpperCase();
    }
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return exceptionResult[0].toUpperCase() + exceptionResult.slice(1);
    }
    return exceptionResult;
  }
  
  // 2. Character mapping qoidalarini qo'llash
  let result = word;
  
  for (const rule of REVERSE_CHARACTER_MAPPINGS) {
    const regex = new RegExp(escapeRegex(rule.old), 'g');
    result = result.replace(regex, rule.new);
  }
  
  return result;
}

/**
 * Token'ni teskari konvertatsiya qiladi
 */
function reverseConvertToken(token: Token): Token {
  if (token.type === 'word') {
    return {
      ...token,
      value: reverseConvertWord(token.value),
    };
  }
  return token;
}

/**
 * Asosiy teskari konvertatsiya funksiyasi
 * Yangi alifbodan eski alifboga matnni o'giradi
 */
export function convertTextReverse(
  inputText: string,
  options: ConversionOptions = {}
): ConversionResult {
  const defaultOptions: ConversionOptions = {
    preserveCase: true,
    normalizeApostrophes: false, // Teskari konvertatsiyada apostrophe'ni saqlash
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
    // 2. Normalize (faqat whitespace)
    let text = normalize(inputText, {
      normalizeApostrophes: defaultOptions.normalizeApostrophes,
    });

    // 3. Tokenize (URL/email protection)
    const tokens = tokenize(text);

    // 4. Reverse convert tokens
    const convertedTokens = tokens.map(reverseConvertToken);

    // 5. Reconstruct text
    let result = tokensToText(convertedTokens);

    // 6. Output validation
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

    // 7. Return result
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
