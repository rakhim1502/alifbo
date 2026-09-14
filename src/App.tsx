import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Converter } from './components/Converter';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Converter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
