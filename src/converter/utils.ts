/**
 * O'zbek Alifbo Konvertori — Utility functions
 * Umumiy yordamchi funksiyalar
 */

/**
 * Regex uchun maxsus belgilarni escape qilish
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * So'zning case pattern'ini aniqlash
 * 
 * Returns:
 * - 'lower': barcha kichik (shahar)
 * - 'upper': barcha katta (SHAHAR)
 * - 'title': birinchi katta (Shahar)
 * - 'mixed': aralash (sHahar)
 */
export function detectCase(word: string): 'lower' | 'upper' | 'title' | 'mixed' {
  if (word.length === 0) return 'lower';
  
  const allUpper = word === word.toUpperCase() && word !== word.toLowerCase();
  const allLower = word === word.toLowerCase() && word !== word.toUpperCase();
  const titleCase = word[0] === word[0].toUpperCase() && 
                    word.slice(1) === word.slice(1).toLowerCase() &&
                    word[0] !== word[0].toLowerCase();
  
  if (allUpper) return 'upper';
  if (titleCase) return 'title';
  if (allLower) return 'lower';
  return 'mixed';
}

/**
 * So'zga case pattern qo'llash
 */
export function applyCase(text: string, caseType: 'lower' | 'upper' | 'title' | 'mixed', originalWord: string): string {
  switch (caseType) {
    case 'upper':
      return text.toUpperCase();
    case 'title':
      return text[0].toUpperCase() + text.slice(1).toLowerCase();
    case 'lower':
      return text.toLowerCase();
    case 'mixed':
      // Original word'ning case pattern'ini saqlash
      let result = '';
      for (let i = 0; i < text.length && i < originalWord.length; i++) {
        if (originalWord[i] === originalWord[i].toUpperCase() && 
            originalWord[i] !== originalWord[i].toLowerCase()) {
          result += text[i].toUpperCase();
        } else {
          result += text[i].toLowerCase();
        }
      }
      // Agar text uzunroq bo'lsa, qolgan qismini lowercase qo'shish
      if (text.length > originalWord.length) {
        result += text.slice(originalWord.length).toLowerCase();
      }
      return result;
    default:
      return text;
  }
}

/**
 * Debounce funksiyasi
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle funksiyasi
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Matn statistikalarini hisoblash
 */
export function calculateStats(text: string): { characters: number; words: number; lines: number } {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  
  return { characters, words, lines };
}

/**
 * Fayl hajmini formatlash
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
