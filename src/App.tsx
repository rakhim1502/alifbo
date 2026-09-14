import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Converter } from './components/Converter';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { useTheme } from './hooks/useTheme';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [showAdmin, setShowAdmin] = useState(false);

  // Admin panel'ni ochish (Ctrl+Shift+A)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setShowAdmin(true);
    }
  };

  return (
    <div 
      className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <a 
        href="#converter" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Konvertorga o'tish
      </a>
      
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main id="main-content" role="main">
        <Hero />
        <Converter />
        <StatisticsDashboard />
      </main>
      
      <Footer />

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
