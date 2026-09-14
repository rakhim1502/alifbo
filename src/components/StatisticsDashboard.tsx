/**
 * O'zbek Alifbo Konvertori — Statistics Dashboard
 * Conversion statistics va history ko'rsatish
 */

import { motion } from 'framer-motion';
import { BarChart3, Clock, FileText, Hash, Trash2 } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';

export function StatisticsDashboard() {
  const {
    statistics,
    history,
    clearHistory,
    formatLastConversion,
    formatNumber,
  } = useStatistics();

  const handleClearHistory = () => {
    if (window.confirm('Barcha konvertatsiya tarixini o\'chirmoqchimisiz?')) {
      clearHistory();
    }
  };

  return (
    <section id="statistics" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Statistika
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Tarixni tozalash"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Tozalash</span>
            </button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Jami konvertatsiyalar"
            value={formatNumber(statistics.totalConversions)}
            color="blue"
          />
          <StatCard
            icon={<Hash className="w-6 h-6" />}
            label="Belgilar soni"
            value={formatNumber(statistics.totalCharactersConverted)}
            color="green"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="So'zlar soni"
            value={formatNumber(statistics.totalWordsConverted)}
            color="purple"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Oxirgi konvertatsiya"
            value={formatLastConversion(statistics.lastConversion)}
            color="orange"
          />
        </div>

        {/* History Table */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                So'nggi konvertatsiyalar
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" aria-label="Konvertatsiyalar tarixi">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vaqt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kirish
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chiqish
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      So'zlar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.slice(0, 10).map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatLastConversion(record.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(record.inputLength)} belgi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(record.outputLength)} belgi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(record.wordCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Hali konvertatsiyalar qilinmagan
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Matn konvertatsiya qilganingizda statistika shu yerda ko'rinadi
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );
}
