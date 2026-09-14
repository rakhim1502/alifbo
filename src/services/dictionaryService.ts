/**
 * O'zbek Alifbo Konvertori — Dictionary Service
 * Admin panel uchun dictionary CRUD operatsiyalari
 */

import { dictionary } from '../converter/dictionary';
import type { DictionaryEntry } from '../converter/types';

const STORAGE_KEY = 'uzb_converter_custom_dictionary';

export interface CustomDictionaryEntry extends DictionaryEntry {
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

class DictionaryService {
  /**
   * Barcha so'zlarni olish (default + custom)
   */
  getAll(): CustomDictionaryEntry[] {
    const customEntries = this.getCustomEntries();
    const defaultEntries = dictionary.getAll();
    
    // Custom entries'ni标记 qilish
    const customMarked = customEntries.map(entry => ({
      ...entry,
      isCustom: true,
    }));
    
    // Default entries'ni标记 qilish
    const defaultMarked = defaultEntries.map(entry => ({
      ...entry,
      isCustom: false,
      createdAt: 0,
      updatedAt: 0,
    }));
    
    return [...customMarked, ...defaultMarked];
  }

  /**
   * Custom so'zlarni olish
   */
  getCustomEntries(): CustomDictionaryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading custom dictionary:', error);
      return [];
    }
  }

  /**
   * Yangi so'z qo'shish
   */
  add(entry: Omit<DictionaryEntry, 'createdAt' | 'updatedAt'>): CustomDictionaryEntry {
    const customEntries = this.getCustomEntries();
    const now = Date.now();
    
    const newEntry: CustomDictionaryEntry = {
      ...entry,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };
    
    customEntries.push(newEntry);
    this.saveCustomEntries(customEntries);
    
    // Runtime dictionary'ga ham qo'shish
    dictionary.add(entry);
    
    return newEntry;
  }

  /**
   * So'zni yangilash
   */
  update(word: string, updates: Partial<DictionaryEntry>): CustomDictionaryEntry | null {
    const customEntries = this.getCustomEntries();
    const index = customEntries.findIndex(e => e.word === word);
    
    if (index === -1) {
      return null;
    }
    
    const updatedEntry: CustomDictionaryEntry = {
      ...customEntries[index],
      ...updates,
      updatedAt: Date.now(),
    };
    
    customEntries[index] = updatedEntry;
    this.saveCustomEntries(customEntries);
    
    // Runtime dictionary'ni yangilash
    if (updates.active !== undefined || updates.newForm !== undefined) {
      dictionary.add(updatedEntry);
    }
    
    return updatedEntry;
  }

  /**
   * So'zni o'chirish (faqat custom)
   */
  delete(word: string): boolean {
    const customEntries = this.getCustomEntries();
    const filtered = customEntries.filter(e => e.word !== word);
    
    if (filtered.length === customEntries.length) {
      return false; // Topilmadi
    }
    
    this.saveCustomEntries(filtered);
    
    // Runtime dictionary'dan o'chirish
    dictionary.remove(word);
    
    return true;
  }

  /**
   * So'zni aktiv/deaktiv qilish
   */
  toggleActive(word: string): boolean {
    const customEntries = this.getCustomEntries();
    const entry = customEntries.find(e => e.word === word);
    
    if (!entry) {
      return false;
    }
    
    entry.active = !entry.active;
    entry.updatedAt = Date.now();
    
    this.saveCustomEntries(customEntries);
    dictionary.add(entry);
    
    return true;
  }

  /**
   * Kategoriya bo'yicha filtrlash
   */
  getByCategory(category: string): CustomDictionaryEntry[] {
    return this.getAll().filter(e => e.category === category);
  }

  /**
   * Qidiruv
   */
  search(query: string): CustomDictionaryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(e => 
      e.word.toLowerCase().includes(lowerQuery) ||
      e.oldForm.toLowerCase().includes(lowerQuery) ||
      e.newForm.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Statistika
   */
  getStats(): { total: number; custom: number; active: number; byCategory: Record<string, number> } {
    const all = this.getAll();
    const custom = all.filter(e => e.isCustom);
    const active = all.filter(e => e.active);
    
    const byCategory: Record<string, number> = {};
    all.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    });
    
    return {
      total: all.length,
      custom: custom.length,
      active: active.length,
      byCategory,
    };
  }

  /**
   * Custom entries'ni saqlash
   */
  private saveCustomEntries(entries: CustomDictionaryEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving custom dictionary:', error);
    }
  }

  /**
   * Barcha custom so'zlarni tozalash
   */
  clearCustom(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing custom dictionary:', error);
    }
  }

  /**
   * Export (JSON)
   */
  exportCustom(): string {
    return JSON.stringify(this.getCustomEntries(), null, 2);
  }

  /**
   * Import (JSON)
   */
  importCustom(json: string): { success: boolean; count: number; errors: string[] } {
    try {
      const entries = JSON.parse(json);
      
      if (!Array.isArray(entries)) {
        return { success: false, count: 0, errors: ['Invalid format: expected array'] };
      }
      
      const errors: string[] = [];
      let count = 0;
      
      for (const entry of entries) {
        if (!entry.word || !entry.oldForm || !entry.newForm) {
          errors.push(`Invalid entry: ${JSON.stringify(entry)}`);
          continue;
        }
        
        this.add({
          word: entry.word,
          oldForm: entry.oldForm,
          newForm: entry.newForm,
          category: entry.category || 'common',
          priority: entry.priority || 5,
          active: entry.active !== false,
        });
        count++;
      }
      
      return { success: true, count, errors };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        errors: [error instanceof Error ? error.message : 'Parse error'] 
      };
    }
  }
}

export const dictionaryService = new DictionaryService();
