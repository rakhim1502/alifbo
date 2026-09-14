import { ArrowDown } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Eski yozuvni yangi alifboga oson o'giring
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          O'zbek tilidagi matnlarni yangi lotin alifbosiga tez va qulay konvertatsiya qiling.
        </p>
        <a
          href="#converter"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span className="text-sm font-medium">Boshlash</span>
          <ArrowDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
