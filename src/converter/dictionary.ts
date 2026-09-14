/**
 * O'zbek Alifbo Konvertori — Dictionary module
 * Exception so'zlar va maxsus qoidalar
 * 
 * Keyinchalik MongoDB'dan yuklanadi.
 * Hozircha static Map sifatida saqlanadi.
 */

import type { DictionaryEntry } from './types';

/**
 * Exception so'zlar dictionary
 * 
 * Bu so'zlar umumiy qoidadan chetga chiqadi.
 * Format: eski_shakl → yangi_shakl
 */
class Dictionary {
  private entries: Map<string, DictionaryEntry> = new Map();
  
  constructor() {
    this.loadDefaults();
  }
  
  /**
   * Default exception so'zlarni yuklash
   */
  private loadDefaults(): void {
    const defaults: DictionaryEntry[] = [
      // === Geografik nomlar ===
      { word: "o'zbekiston", oldForm: "O'zbekiston", newForm: "Özbekiston", category: 'geography', priority: 10, active: true },
      { word: "o'zbekistonga", oldForm: "O'zbekistonga", newForm: "Özbekistonga", category: 'geography', priority: 10, active: true },
      { word: "o'zbekistondan", oldForm: "O'zbekistondan", newForm: "Özbekistondan", category: 'geography', priority: 10, active: true },
      { word: "o'zbekistonda", oldForm: "O'zbekistonda", newForm: "Özbekistonda", category: 'geography', priority: 10, active: true },
      
      // === Millat/til nomlari ===
      { word: "o'zbek", oldForm: "o'zbek", newForm: "özbek", category: 'nationality', priority: 10, active: true },
      { word: "o'zbeklar", oldForm: "o'zbeklar", newForm: "özbeklar", category: 'nationality', priority: 10, active: true },
      { word: "o'zbekcha", oldForm: "o'zbekcha", newForm: "özbekcha", category: 'language', priority: 10, active: true },
      { word: "o'zbekning", oldForm: "o'zbekning", newForm: "özbekning", category: 'nationality', priority: 10, active: true },
      
      // === O' bilan boshlanadigan so'zlar ===
      { word: "o'qish", oldForm: "o'qish", newForm: "öqish", category: 'verb', priority: 5, active: true },
      { word: "o'qidi", oldForm: "o'qidi", newForm: "öqidi", category: 'verb', priority: 5, active: true },
      { word: "o'qiydi", oldForm: "o'qiydi", newForm: "öqiydi", category: 'verb', priority: 5, active: true },
      { word: "o'quvchi", oldForm: "o'quvchi", newForm: "öquvchi", category: 'noun', priority: 5, active: true },
      { word: "o'qituvchi", oldForm: "o'qituvchi", newForm: "öqituvchi", category: 'noun', priority: 5, active: true },
      { word: "o'rganmoq", oldForm: "o'rganmoq", newForm: "örganmoq", category: 'verb', priority: 5, active: true },
      { word: "o'rgandi", oldForm: "o'rgandi", newForm: "örgandi", category: 'verb', priority: 5, active: true },
      { word: "o'ylamoq", oldForm: "o'ylamoq", newForm: "öylamoq", category: 'verb', priority: 5, active: true },
      { word: "o'ylaydi", oldForm: "o'ylaydi", newForm: "öylaydi", category: 'verb', priority: 5, active: true },
      { word: "o'rnini", oldForm: "o'rnini", newForm: "örnini", category: 'noun', priority: 5, active: true },
      { word: "o'rta", oldForm: "o'rta", newForm: "örta", category: 'adjective', priority: 5, active: true },
      { word: "o'rtada", oldForm: "o'rtada", newForm: "örtada", category: 'adverb', priority: 5, active: true },
      { word: "o'tgan", oldForm: "o'tgan", newForm: "ötgan", category: 'verb', priority: 5, active: true },
      { word: "o'tkir", oldForm: "o'tkir", newForm: "ötkir", category: 'adjective', priority: 5, active: true },
      { word: "o'lim", oldForm: "o'lim", newForm: "ölim", category: 'noun', priority: 5, active: true },
      { word: "o'lgan", oldForm: "o'lgan", newForm: "ölgan", category: 'verb', priority: 5, active: true },
      
      // === G' bilan boshlanadigan so'zlar ===
      { word: "g'arbiy", oldForm: "g'arbiy", newForm: "ğarbiy", category: 'adjective', priority: 5, active: true },
      { word: "g'arbdan", oldForm: "g'arbdan", newForm: "ğarbdan", category: 'adverb', priority: 5, active: true },
      { word: "g'alaba", oldForm: "g'alaba", newForm: "ğalaba", category: 'noun', priority: 5, active: true },
      { word: "g'oyat", oldForm: "g'oyat", newForm: "ğoyat", category: 'adverb', priority: 5, active: true },
      { word: "g'oya", oldForm: "g'oya", newForm: "ğoya", category: 'noun', priority: 5, active: true },
      { word: "g'oyib", oldForm: "g'oyib", newForm: "ğoyib", category: 'adverb', priority: 5, active: true },
      { word: "g'isht", oldForm: "g'isht", newForm: "ğisht", category: 'noun', priority: 5, active: true },
      { word: "g'ildirak", oldForm: "g'ildirak", newForm: "ğildirak", category: 'noun', priority: 5, active: true },
      { word: "g'azab", oldForm: "g'azab", newForm: "ğazab", category: 'noun', priority: 5, active: true },
      { word: "g'amgin", oldForm: "g'amgin", newForm: "ğamgin", category: 'adjective', priority: 5, active: true },
      { word: "g'arib", oldForm: "g'arib", newForm: "ğarib", category: 'adjective', priority: 5, active: true },
    ];
    
    for (const entry of defaults) {
      this.entries.set(entry.word, entry);
    }
  }
  
  /**
   * So'z uchun exception qidirish
   */
  lookup(word: string): DictionaryEntry | null {
    const lower = word.toLowerCase();
    const entry = this.entries.get(lower);
    if (entry && entry.active) {
      return entry;
    }
    return null;
  }
  
  /**
   * So'z qo'shish
   */
  add(entry: DictionaryEntry): void {
    this.entries.set(entry.word, entry);
  }
  
  /**
   * So'z o'chirish (deactivate)
   */
  remove(word: string): void {
    const entry = this.entries.get(word.toLowerCase());
    if (entry) {
      entry.active = false;
    }
  }
  
  /**
   * Barcha so'zlarni olish
   */
  getAll(): DictionaryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }
  
  /**
   * So'zlar sonini olish
   */
  size(): number {
    return this.entries.size;
  }
}

// Singleton instance
export const dictionary = new Dictionary();
