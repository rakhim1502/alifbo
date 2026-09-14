/**
 * O'zbek Alifbo Konvertori — Rules Hook
 * Conversion qoidalarini boshqarish
 */

import { useState, useCallback, useEffect } from 'react';
import { rulesService } from '../services/rulesService';
import type { CustomRule } from '../services/rulesService';
import type { CharacterMapping } from '../converter/types';

export function useRules() {
  const [rules, setRules] = useState<CustomRule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Load rules
  const refresh = useCallback(() => {
    setRules(rulesService.getAll());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filtered rules
  const filteredRules = rules.filter(rule => {
    // Custom only filter
    if (showCustomOnly && !rule.isCustom) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rule.old.toLowerCase().includes(query) ||
        rule.new.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // CRUD operations
  const addRule = useCallback((rule: Omit<CharacterMapping, 'createdAt' | 'updatedAt'>) => {
    rulesService.add(rule);
    refresh();
  }, [refresh]);

  const updateRule = useCallback((id: string, updates: Partial<CharacterMapping>) => {
    rulesService.update(id, updates);
    refresh();
  }, [refresh]);

  const deleteRule = useCallback((id: string) => {
    rulesService.delete(id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    rulesService.toggleActive(id);
    refresh();
  }, [refresh]);

  const clearCustom = useCallback(() => {
    rulesService.clearCustom();
    refresh();
  }, [refresh]);

  // Export/Import
  const exportData = useCallback(() => {
    return rulesService.exportCustom();
  }, []);

  const importData = useCallback((json: string) => {
    const result = rulesService.importCustom(json);
    refresh();
    return result;
  }, [refresh]);

  // Stats
  const stats = rulesService.getStats();

  return {
    rules: filteredRules,
    allRules: rules,
    searchQuery,
    setSearchQuery,
    showCustomOnly,
    setShowCustomOnly,
    addRule,
    updateRule,
    deleteRule,
    toggleActive,
    clearCustom,
    exportData,
    importData,
    refresh,
    stats,
  };
}
