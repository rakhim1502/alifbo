/**
 * O'zbek Alifbo Konvertori — Rules Service
 * Conversion qoidalarini boshqarish
 */

import { CHARACTER_MAPPINGS } from '../converter/rules';
import type { CharacterMapping } from '../converter/types';

const STORAGE_KEY = 'uzb_converter_custom_rules';

export interface CustomRule extends CharacterMapping {
  id: string;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

class RulesService {
  /**
   * Barcha qoidalarni olish (default + custom)
   */
  getAll(): CustomRule[] {
    const customRules = this.getCustomRules();
    const defaultRules = CHARACTER_MAPPINGS;
    
    // Custom rules'ni标记 qilish
    const customMarked = customRules.map(rule => ({
      ...rule,
      isCustom: true,
    }));
    
    // Default rules'ni标记 qilish
    const defaultMarked = defaultRules.map((rule, index) => ({
      ...rule,
      id: `default-${index}`,
      isCustom: false,
      createdAt: 0,
      updatedAt: 0,
    }));
    
    return [...customMarked, ...defaultMarked];
  }

  /**
   * Custom qoidalarni olish
   */
  getCustomRules(): CustomRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading custom rules:', error);
      return [];
    }
  }

  /**
   * Yangi qoida qo'shish
   */
  add(rule: Omit<CharacterMapping, 'createdAt' | 'updatedAt'>): CustomRule {
    const customRules = this.getCustomRules();
    const now = Date.now();
    
    const newRule: CustomRule = {
      ...rule,
      id: `custom-${now}`,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };
    
    customRules.push(newRule);
    this.saveCustomRules(customRules);
    
    return newRule;
  }

  /**
   * Qoidani yangilash
   */
  update(id: string, updates: Partial<CharacterMapping>): CustomRule | null {
    const customRules = this.getCustomRules();
    const index = customRules.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedRule: CustomRule = {
      ...customRules[index],
      ...updates,
      updatedAt: Date.now(),
    };
    
    customRules[index] = updatedRule;
    this.saveCustomRules(customRules);
    
    return updatedRule;
  }

  /**
   * Qoidani o'chirish (faqat custom)
   */
  delete(id: string): boolean {
    const customRules = this.getCustomRules();
    const filtered = customRules.filter(r => r.id !== id);
    
    if (filtered.length === customRules.length) {
      return false; // Topilmadi
    }
    
    this.saveCustomRules(filtered);
    
    return true;
  }

  /**
   * Qoidani aktiv/deaktiv qilish
   */
  toggleActive(id: string): boolean {
    const customRules = this.getCustomRules();
    const rule = customRules.find(r => r.id === id);
    
    if (!rule) {
      return false;
    }
    
    rule.active = rule.active === false ? true : false;
    rule.updatedAt = Date.now();
    
    this.saveCustomRules(customRules);
    
    return true;
  }

  /**
   * Statistika
   */
  getStats(): { total: number; custom: number; active: number } {
    const all = this.getAll();
    const custom = all.filter(r => r.isCustom);
    const active = all.filter(r => r.active !== false);
    
    return {
      total: all.length,
      custom: custom.length,
      active: active.length,
    };
  }

  /**
   * Custom qoidalarni saqlash
   */
  private saveCustomRules(rules: CustomRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error('Error saving custom rules:', error);
    }
  }

  /**
   * Barcha custom qoidalarni tozalash
   */
  clearCustom(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing custom rules:', error);
    }
  }

  /**
   * Export (JSON)
   */
  exportCustom(): string {
    return JSON.stringify(this.getCustomRules(), null, 2);
  }

  /**
   * Import (JSON)
   */
  importCustom(json: string): { success: boolean; count: number; errors: string[] } {
    try {
      const rules = JSON.parse(json);
      
      if (!Array.isArray(rules)) {
        return { success: false, count: 0, errors: ['Invalid format: expected array'] };
      }
      
      const errors: string[] = [];
      let count = 0;
      
      for (const rule of rules) {
        if (!rule.old || !rule.new) {
          errors.push(`Invalid rule: ${JSON.stringify(rule)}`);
          continue;
        }
        
        this.add({
          old: rule.old,
          new: rule.new,
          caseMode: rule.caseMode || 'any',
          active: rule.active !== false,
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

export const rulesService = new RulesService();
