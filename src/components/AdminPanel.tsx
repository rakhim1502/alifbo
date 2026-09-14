/**
 * O'zbek Alifbo Konvertori — Admin Panel
 * Dictionary, Rules va Settings boshqaruv paneli
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Settings, ArrowLeft, GitBranch } from 'lucide-react';
import { DictionaryManager } from './DictionaryManager';
import { RulesManager } from './RulesManager';
import { UserPreferencesPanel } from './UserPreferences';

type Tab = 'dictionary' | 'rules' | 'settings';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('dictionary');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Orqaga"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dictionary'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Dictionary
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rules'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 inline mr-2" />
            Qoidalar
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Sozlamalar
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'dictionary' && <DictionaryManager />}
          {activeTab === 'rules' && <RulesManager />}
          {activeTab === 'settings' && <UserPreferencesPanel />}
        </div>
      </div>
    </motion.div>
  );
}
