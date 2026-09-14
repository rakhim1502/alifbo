/**
 * O'zbek Alifbo Konvertori — Statistics Hook
 * Conversion statistics'ni boshqarish
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import type { Statistics, ConversionRecord } from '../services/storage';

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics>(storage.getStatistics());
  const [history, setHistory] = useState<ConversionRecord[]>(storage.getHistory());

  // Statistics'ni qayta yuklash
  const refresh = useCallback(() => {
    setStatistics(storage.getStatistics());
    setHistory(storage.getHistory());
  }, []);

  // Yangi conversion qo'shish
  const addConversion = useCallback(
    (record: Omit<ConversionRecord, 'id' | 'timestamp'>) => {
      storage.addConversion(record);
      refresh();
    },
    [refresh]
  );

  // History'ni tozalash
  const clearHistory = useCallback(() => {
    storage.clearHistory();
    refresh();
  }, [refresh]);

  // Format helpers
  const formatLastConversion = useCallback((timestamp: number | null): string => {
    if (!timestamp) return 'Hech qachon';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Hozirgina';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;

    return new Date(timestamp).toLocaleDateString('uz-UZ');
  }, []);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('uz-UZ').format(num);
  }, []);

  return {
    statistics,
    history,
    addConversion,
    clearHistory,
    refresh,
    formatLastConversion,
    formatNumber,
  };
}
