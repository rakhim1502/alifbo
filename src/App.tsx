import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Converter } from './components/Converter';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200"
      >
        <a 
          href="#converter" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
        >
          Konvertorga o'tish
        </a>
        
        <Header theme={theme} toggleTheme={toggleTheme} />
        
        <main id="main-content" role="main">
          <ErrorBoundary fallback={<div className="p-8 text-center">Converter'da xatolik yuz berdi</div>}>
            <Hero />
            <Converter />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Statistika yuklanmadi</div>}>
            <StatisticsDashboard />
          </ErrorBoundary>
        </main>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
