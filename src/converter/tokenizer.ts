/**
 * O'zbek Alifbo Konvertori — Tokenizer module
 * Matnni tokenlarga ajratish: so'zlar, bo'sh joylar, punctuation, URL, email
 */

import { PRESERVE_PATTERNS } from './rules';
import type { Token } from './types';

/**
 * Matnni tokenlarga ajratish
 * 
 * Token turlari:
 * - word: harfli so'zlar
 * - whitespace: bo'sh joylar
 * - punctuation: tinish belgilari
 * - number: raqamlar
 * - url: URL manzillari
 * - email: email manzillari
 * - placeholder: himoyalangan pattern'lar
 * - unknown: noma'lum belgilar
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let currentIndex = 0;
  
  // Avval URL va email'larni topish va placeholder bilan almashtirish
  let processedText = text;
  const placeholders = new Map<string, { value: string; type: 'url' | 'email' }>();
  let placeholderCounter = 0;
  
  // URL'larni topish
  const urlMatches = [...text.matchAll(PRESERVE_PATTERNS.url)];
  for (const match of urlMatches) {
    const key = `\x00URL_${placeholderCounter}\x00`;
    placeholders.set(key, { value: match[0], type: 'url' });
    processedText = processedText.replace(match[0], key);
    placeholderCounter++;
  }
  
  // Email'larni topish
  const emailMatches = [...processedText.matchAll(PRESERVE_PATTERNS.email)];
  for (const match of emailMatches) {
    const key = `\x00EMAIL_${placeholderCounter}\x00`;
    placeholders.set(key, { value: match[0], type: 'email' });
    processedText = processedText.replace(match[0], key);
    placeholderCounter++;
  }
  
  // Tokenizatsiya regex
  // So'zlar, raqamlar, bo'sh joylar, punctuation va placeholder'larni ajratish
  const tokenRegex = /(\x00(?:URL|EMAIL)_\d+\x00|[a-zA-Z\u00C0-\u024F\u0100-\u017F\u2019']+|\d+([.,]\d+)*|\s+|[^\s])/g;
  
  let match;
  while ((match = tokenRegex.exec(processedText)) !== null) {
    const value = match[0];
    const index = match.index;
    
    let type: Token['type'] = 'unknown';
    
    if (value.startsWith('\x00')) {
      type = 'placeholder';
    } else if (/^\s+$/.test(value)) {
      type = 'whitespace';
    } else if (/^\d/.test(value)) {
      type = 'number';
    } else if (/^[a-zA-Z\u00C0-\u024F\u0100-\u017F\u2019']+$/.test(value)) {
      type = 'word';
    } else if (value.length === 1) {
      type = 'punctuation';
    }
    
    tokens.push({ type, value, index });
    currentIndex = index + value.length;
  }
  
  // Placeholder'larni tokenlarga qo'shish (asl qiymatlari bilan)
  const finalTokens: Token[] = [];
  for (const token of tokens) {
    if (token.type === 'placeholder') {
      const placeholder = placeholders.get(token.value);
      if (placeholder) {
        finalTokens.push({
          type: placeholder.type,
          value: placeholder.value,
          index: token.index,
        });
      } else {
        finalTokens.push(token);
      }
    } else {
      finalTokens.push(token);
    }
  }
  
  return finalTokens;
}

/**
 * Token'larni qayta matnga birlashtirish
 */
export function tokensToText(tokens: Token[]): string {
  return tokens.map(t => t.value).join('');
}

/**
 * Faqat so'z tokenlarini olish
 */
export function getWordTokens(tokens: Token[]): Token[] {
  return tokens.filter(t => t.type === 'word');
}
