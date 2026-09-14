/**
 * O'zbek Alifbo Konvertori — Storage Service
 * LocalStorage bilan ishlash uchun wrapper
 * 
 * Ma'lumotlar:
 * - Conversion history
 * - Statistics
 * - User preferences
 */

export interface ConversionRecord {
  id: string;
  timestamp: number;
  inputLength: number;
  outputLength: number;
  wordCount: number;
  mode: 'old-to-new' | 'new-to-old';
}

export interface Statistics {
  totalConversions: number;
  totalCharactersConverted: number;
  totalWordsConverted: number;
  averageInputLength: number;
  averageOutputLength: number;
  lastConversion: number | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  realtimeMode: boolean;
  autoSaveHistory: boolean;
}

const STORAGE_KEYS = {
  HISTORY: 'uzb_converter_history',
  PREFERENCES: 'uzb_converter_preferences',
  STATISTICS: 'uzb_converter_statistics',
};

const MAX_HISTORY_ITEMS = 100;

/**
 * LocalStorage wrapper
 */
class StorageService {
  /**
   * Conversion history'ni olish
   */
  getHistory(): ConversionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  /**
   * Conversion history'ga yangi yozuv qo'shish
   */
  addConversion(record: Omit<ConversionRecord, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newRecord: ConversionRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      // Yangi yozuvni boshiga qo'shish
      history.unshift(newRecord);

      // Limitni saqlash
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.updateStatistics(newRecord);
    } catch (error) {
      console.error('Error saving conversion:', error);
    }
  }

  /**
   * History'ni tozalash
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STATISTICS);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  /**
   * Statistics'ni olish
   */
  getStatistics(): Statistics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      return data ? JSON.parse(data) : this.getDefaultStatistics();
    } catch (error) {
      console.error('Error loading statistics:', error);
      return this.getDefaultStatistics();
    }
  }

  /**
   * Statistics'ni yangilash
   */
  private updateStatistics(record: ConversionRecord): void {
    const stats = this.getStatistics();

    stats.totalConversions++;
    stats.totalCharactersConverted += record.inputLength;
    stats.totalWordsConverted += record.wordCount;
    stats.lastConversion = record.timestamp;

    // Average hisoblash
    stats.averageInputLength = Math.round(
      stats.totalCharactersConverted / stats.totalConversions
    );
    stats.averageOutputLength = Math.round(
      (stats.totalCharactersConverted * 0.95) / stats.totalConversions // Taxminan 5% qisqaradi
    );

    try {
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  }

  /**
   * Default statistics
   */
  private getDefaultStatistics(): Statistics {
    return {
      totalConversions: 0,
      totalCharactersConverted: 0,
      totalWordsConverted: 0,
      averageInputLength: 0,
      averageOutputLength: 0,
      lastConversion: null,
    };
  }

  /**
   * User preferences'ni olish
   */
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data
        ? JSON.parse(data)
        : {
            theme: 'light',
            realtimeMode: true,
            autoSaveHistory: true,
          };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {
        theme: 'light',
        realtimeMode: true,
        autoSaveHistory: true,
      };
    }
  }

  /**
   * User preferences'ni saqlash
   */
  savePreferences(prefs: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Barcha ma'lumotlarni tozalash
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export const storage = new StorageService();
