/**
 * O'zbek Alifbo Konvertori — Dictionary Hook
 * Admin panel uchun dictionary boshqaruvi
 */

import { useState, useCallback, useEffect } from 'react';
import { dictionaryService } from '../services/dictionaryService';
import type { CustomDictionaryEntry } from '../services/dictionaryService';
import type { DictionaryEntry } from '../converter/types';

export function useDictionary() {
  const [entries, setEntries] = useState<CustomDictionaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Load entries
  const refresh = useCallback(() => {
    setEntries(dictionaryService.getAll());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filtered entries
  const filteredEntries = entries.filter(entry => {
    // Custom only filter
    if (showCustomOnly && !entry.isCustom) return false;
    
    // Category filter
    if (categoryFilter && entry.category !== categoryFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.word.toLowerCase().includes(query) ||
        entry.oldForm.toLowerCase().includes(query) ||
        entry.newForm.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // CRUD operations
  const addEntry = useCallback((entry: Omit<DictionaryEntry, 'createdAt' | 'updatedAt'>) => {
    dictionaryService.add(entry);
    refresh();
  }, [refresh]);

  const updateEntry = useCallback((word: string, updates: Partial<DictionaryEntry>) => {
    dictionaryService.update(word, updates);
    refresh();
  }, [refresh]);

  const deleteEntry = useCallback((word: string) => {
    dictionaryService.delete(word);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((word: string) => {
    dictionaryService.toggleActive(word);
    refresh();
  }, [refresh]);

  const clearCustom = useCallback(() => {
    dictionaryService.clearCustom();
    refresh();
  }, [refresh]);

  // Export/Import
  const exportData = useCallback(() => {
    return dictionaryService.exportCustom();
  }, []);

  const importData = useCallback((json: string) => {
    const result = dictionaryService.importCustom(json);
    refresh();
    return result;
  }, [refresh]);

  // Stats
  const stats = dictionaryService.getStats();

  // Categories
  const categories = Array.from(new Set(entries.map(e => e.category))).sort();

  return {
    entries: filteredEntries,
    allEntries: entries,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    showCustomOnly,
    setShowCustomOnly,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleActive,
    clearCustom,
    exportData,
    importData,
    refresh,
    stats,
    categories,
  };
}
