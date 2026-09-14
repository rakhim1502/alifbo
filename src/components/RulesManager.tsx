/**
 * O'zbek Alifbo Konvertori — Rules Manager
 * Conversion qoidalarini boshqarish interfeysi
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRules } from '../hooks/useRules';
import type { CharacterMapping } from '../converter/types';

export function RulesManager() {
  const {
    rules,
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
    stats,
  } = useRules();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add form state
  const [newRule, setNewRule] = useState({
    old: '',
    new: '',
    caseMode: 'any' as CharacterMapping['caseMode'],
    active: true,
  });

  // Edit form state
  const [editRule, setEditRule] = useState<Partial<CharacterMapping>>({});

  const handleAdd = () => {
    if (!newRule.old || !newRule.new) {
      setNotification({ type: 'error', message: 'Eski va yangi belgilarni kiriting' });
      return;
    }

    addRule(newRule);
    setNewRule({ old: '', new: '', caseMode: 'any', active: true });
    setShowAddForm(false);
    setNotification({ type: 'success', message: 'Qoida qo\'shildi' });
  };

  const handleEdit = (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (rule) {
      setEditingId(id);
      setEditRule({ old: rule.old, new: rule.new, caseMode: rule.caseMode });
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateRule(editingId, editRule);
      setEditingId(null);
      setEditRule({});
      setNotification({ type: 'success', message: 'Qoida yangilandi' });
    }
  };

  const handleDelete = (id: string, isCustom: boolean) => {
    if (!isCustom) {
      setNotification({ type: 'error', message: 'Default qoidalarni o\'chirib bo\'lmaydi' });
      return;
    }

    if (window.confirm('Bu qoidani o\'chirmoqchimisiz?')) {
      deleteRule(id);
      setNotification({ type: 'success', message: 'Qoida o\'chirildi' });
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rules-export-${new Date().toISOString().slice(0, 10)}.json`;
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
            setNotification({ type: 'success', message: `${result.count} ta qoida import qilindi` });
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
    if (window.confirm('Barcha custom qoidalarni o\'chirmoqchimisiz?')) {
      clearCustom();
      setNotification({ type: 'success', message: 'Custom qoidalar tozalandi' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Jami qoidalar</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Custom qoidalar</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.custom}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aktiv qoidalar</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yangi qoida qo'shish</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Eski belgi/kombinatsiya
                </label>
                <input
                  type="text"
                  placeholder="Masalan: sh"
                  value={newRule.old}
                  onChange={(e) => setNewRule({ ...newRule, old: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yangi belgi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: ş"
                  value={newRule.new}
                  onChange={(e) => setNewRule({ ...newRule, new: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Case mode
                </label>
                <select
                  value={newRule.caseMode}
                  onChange={(e) => setNewRule({ ...newRule, caseMode: e.target.value as CharacterMapping['caseMode'] })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Har qanday</option>
                  <option value="lower">Kichik harf</option>
                  <option value="upper">Katta harf</option>
                  <option value="title">Bosh harf katta</option>
                </select>
              </div>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Eski</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Yangi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                  {editingId === rule.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editRule.old || ''}
                          onChange={(e) => setEditRule({ ...editRule, old: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editRule.new || ''}
                          onChange={(e) => setEditRule({ ...editRule, new: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editRule.caseMode || 'any'}
                          onChange={(e) => setEditRule({ ...editRule, caseMode: e.target.value as CharacterMapping['caseMode'] })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="any">Har qanday</option>
                          <option value="lower">Kichik</option>
                          <option value="upper">Katta</option>
                          <option value="title">Bosh harf</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {rule.isCustom ? 'Custom' : 'Default'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 mr-2"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{rule.old}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{rule.new}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {rule.caseMode || 'any'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => rule.isCustom && toggleActive(rule.id)}
                          className={`flex items-center gap-1 text-sm ${
                            rule.active !== false
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-600'
                          } ${!rule.isCustom && 'cursor-not-allowed'}`}
                          disabled={!rule.isCustom}
                        >
                          {rule.active !== false ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                          {rule.active !== false ? 'Aktiv' : 'Noaktiv'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rule.isCustom && (
                          <>
                            <button
                              onClick={() => handleEdit(rule.id)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mr-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id, rule.isCustom)}
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
      </div>
    </div>
  );
}
