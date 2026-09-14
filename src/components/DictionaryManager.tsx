/**
 * O'zbek Alifbo Konvertori — Dictionary Manager
 * Admin panel uchun dictionary CRUD interfeysi
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';
import type { DictionaryEntry } from '../converter/types';

export function DictionaryManager() {
  const {
    entries,
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
    stats,
    categories,
  } = useDictionary();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add form state
  const [newEntry, setNewEntry] = useState({
    word: '',
    oldForm: '',
    newForm: '',
    category: 'common',
    priority: 5,
    active: true,
  });

  // Edit form state
  const [editEntry, setEditEntry] = useState<Partial<DictionaryEntry>>({});

  const handleAdd = () => {
    if (!newEntry.word || !newEntry.oldForm || !newEntry.newForm) {
      setNotification({ type: 'error', message: 'Barcha maydonlarni to\'ldiring' });
      return;
    }

    addEntry(newEntry);
    setNewEntry({ word: '', oldForm: '', newForm: '', category: 'common', priority: 5, active: true });
    setShowAddForm(false);
    setNotification({ type: 'success', message: 'So\'z qo\'shildi' });
  };

  const handleEdit = (word: string) => {
    const entry = entries.find(e => e.word === word);
    if (entry) {
      setEditingWord(word);
      setEditEntry({ oldForm: entry.oldForm, newForm: entry.newForm, category: entry.category, priority: entry.priority });
    }
  };

  const handleSaveEdit = () => {
    if (editingWord) {
      updateEntry(editingWord, editEntry);
      setEditingWord(null);
      setEditEntry({});
      setNotification({ type: 'success', message: 'So\'z yangilandi' });
    }
  };

  const handleDelete = (word: string, isCustom: boolean) => {
    if (!isCustom) {
      setNotification({ type: 'error', message: 'Default so\'zlarni o\'chirib bo\'lmaydi' });
      return;
    }

    if (window.confirm(`"${word}" so'zini o'chirmoqchimisiz?`)) {
      deleteEntry(word);
      setNotification({ type: 'success', message: 'So\'z o\'chirildi' });
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dictionary-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification({ type: 'success', message: 'Eksport qilindi' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const result = importData(json);
          if (result.success) {
            setNotification({ type: 'success', message: `${result.count} ta so'z import qilindi` });
          } else {
            setNotification({ type: 'error', message: result.errors.join(', ') });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearCustom = () => {
    if (window.confirm('Barcha custom so\'zlarni o\'chirmoqchimisiz?')) {
      clearCustom();
      setNotification({ type: 'success', message: 'Custom so\'zlar tozalandi' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Jami</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Custom</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.custom}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aktiv</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Kategoriyalar</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha kategoriyalar</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCustomOnly(!showCustomOnly)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            showCustomOnly
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          Faqat Custom
        </button>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Qo'shish
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 inline mr-2" />
          Eksport
        </button>

        <button
          onClick={handleImport}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Import
        </button>

        {stats.custom > 0 && (
          <button
            onClick={handleClearCustom}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Tozalash
          </button>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yangi so'z qo'shish</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="So'z (kichik harf)"
                value={newEntry.word}
                onChange={(e) => setNewEntry({ ...newEntry, word: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Eski shakl"
                value={newEntry.oldForm}
                onChange={(e) => setNewEntry({ ...newEntry, oldForm: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Yangi shakl"
                value={newEntry.newForm}
                onChange={(e) => setNewEntry({ ...newEntry, newForm: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="common">Umumiy</option>
                <option value="geography">Geografiya</option>
                <option value="nationality">Millat</option>
                <option value="language">Til</option>
                <option value="verb">Fe'l</option>
                <option value="noun">Ot</option>
                <option value="adjective">Sifat</option>
                <option value="adverb">Ravosh</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Qo'shish
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">So'z</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Eski</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Yangi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategoriya</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.slice(0, 50).map((entry) => (
                <tr key={entry.word} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                  {editingWord === entry.word ? (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{entry.word}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editEntry.oldForm || ''}
                          onChange={(e) => setEditEntry({ ...editEntry, oldForm: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editEntry.newForm || ''}
                          onChange={(e) => setEditEntry({ ...editEntry, newForm: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editEntry.category || ''}
                          onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="common">Umumiy</option>
                          <option value="geography">Geografiya</option>
                          <option value="nationality">Millat</option>
                          <option value="language">Til</option>
                          <option value="verb">Fe'l</option>
                          <option value="noun">Ot</option>
                          <option value="adjective">Sifat</option>
                          <option value="adverb">Ravosh</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {entry.isCustom ? 'Custom' : 'Default'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 mr-2"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingWord(null)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{entry.word}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{entry.oldForm}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{entry.newForm}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => entry.isCustom && toggleActive(entry.word)}
                          className={`flex items-center gap-1 text-sm ${
                            entry.active
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-600'
                          } ${!entry.isCustom && 'cursor-not-allowed'}`}
                          disabled={!entry.isCustom}
                        >
                          {entry.active ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                          {entry.active ? 'Aktiv' : 'Noaktiv'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {entry.isCustom && (
                          <>
                            <button
                              onClick={() => handleEdit(entry.word)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mr-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.word, entry.isCustom)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length > 50 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            {entries.length - 50} ta ko'proq natija bor. Qidirish yoki filtrni ishlatib ko'ring.
          </div>
        )}
      </div>
    </div>
  );
}
