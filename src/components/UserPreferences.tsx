/**
 * O'zbek Alifbo Konvertori — User Preferences
 * Foydalanuvchi sozlamalari interfeysi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw } from 'lucide-react';
import { storage } from '../services/storage';
import type { UserPreferences as UserPrefs } from '../services/storage';

export function UserPreferencesPanel() {
  const [preferences, setPreferences] = useState<UserPrefs>(storage.getPreferences());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = () => {
    storage.savePreferences(preferences);
    setNotification({ type: 'success', message: 'Sozlamalar saqlandi' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    const defaults: UserPrefs = {
      theme: 'light',
      realtimeMode: true,
      autoSaveHistory: true,
    };
    setPreferences(defaults);
    storage.savePreferences(defaults);
    setNotification({ type: 'success', message: 'Sozlamalar tiklandi' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Preferences Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Umumiy sozlamalar
        </h3>

        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Yorug'</option>
              <option value="dark">Qorong'u</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Interfeys ko'rinishini tanlang
            </p>
          </div>

          {/* Realtime Mode */}
          <div>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Real-time konvertatsiya
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Matn kiritayotganda avtomatik konvertatsiya qilish
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences({ ...preferences, realtimeMode: !preferences.realtimeMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.realtimeMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.realtimeMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Auto Save History */}
          <div>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tarixni avtomatik saqlash
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Konvertatsiyalarni avtomatik ravishda tarixga qo'shish
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences({ ...preferences, autoSaveHistory: !preferences.autoSaveHistory })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoSaveHistory ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoSaveHistory ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Saqlash
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Tiklash
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Ma'lumot
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Sozlamalar browser'ning localStorage'ida saqlanadi. Barcha ma'lumotlar mahalliy saqlanadi va tashqariga yuborilmaydi.
        </p>
      </div>
    </div>
  );
}
