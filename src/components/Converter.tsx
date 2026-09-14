import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Trash2, Upload, Check, FileText, ArrowRight } from 'lucide-react';
import { convertText } from '../converter';
import type { ConversionResult } from '../converter';

export function Converter() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [realtimeMode, setRealtimeMode] = useState(true);
  const dropRef = useRef<HTMLDivElement>(null);
  const convertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time conversion (debounced)
  useEffect(() => {
    if (!realtimeMode) return;
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    if (convertTimeoutRef.current) {
      clearTimeout(convertTimeoutRef.current);
    }

    convertTimeoutRef.current = setTimeout(() => {
      const conversionResult = convertText(inputText);
      setResult(conversionResult);
    }, 150);

    return () => {
      if (convertTimeoutRef.current) {
        clearTimeout(convertTimeoutRef.current);
      }
    };
  }, [inputText, realtimeMode]);

  // Manual conversion
  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    const conversionResult = convertText(inputText);
    setResult(conversionResult);
  }, [inputText]);

  // Natijani nusxalash
  const handleCopy = useCallback(async () => {
    if (!result?.convertedText) return;
    
    try {
      await navigator.clipboard.writeText(result.convertedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.convertedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  // Natijani yuklab olish (TXT)
  const handleDownload = useCallback(() => {
    if (!result?.convertedText) return;
    
    const blob = new Blob([result.convertedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  // Tozalash
  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
  }, []);

  // Fayl yuklash
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.txt', '.text', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!file.type.startsWith('text/') && !validExtensions.includes(fileExtension)) {
      alert('Faqat TXT fayllar qo\'llab-quvvatlanadi. DOCX va PDF keyingi versiyada qo\'shiladi.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Fayl hajmi 5MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file, 'UTF-8');
    
    e.target.value = '';
  }, []);

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validExtensions = ['.txt', '.text', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!file.type.startsWith('text/') && !validExtensions.includes(fileExtension)) {
      alert('Faqat TXT fayllar qo\'llab-quvvatlanadi.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Fayl hajmi 5MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  return (
    <section id="converter" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setRealtimeMode(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                realtimeMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setRealtimeMode(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !realtimeMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tugma orqali
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ESKI ALIFBO
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {inputText.length} belgi · {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} so'z
              </span>
            </div>
            
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="relative"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Matnni shu yerga kiriting yoki faylni tashlang..."
                className="w-full h-72 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
              
              {isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/30 z-10">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Faylni shu yerga tashlang</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Actions */}
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Yuklash</span>
                <input
                  type="file"
                  accept=".txt,.text,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {!realtimeMode && (
                <button
                  onClick={handleConvert}
                  disabled={!inputText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Konvertatsiya</span>
                </button>
              )}
              <button
                onClick={handleClear}
                disabled={!inputText && !result}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tozalash</span>
              </button>
            </div>
          </div>

          {/* Arrow (desktop) */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ display: 'none' }}>
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                YANGI ALIFBO
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {result?.stats.characters ?? 0} belgi · {result?.stats.words ?? 0} so'z
              </span>
            </div>
            
            <textarea
              value={result?.convertedText ?? ''}
              readOnly
              placeholder="Konvertatsiya qilingan matn shu yerda ko'rinadi..."
              className="w-full h-72 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />

            {/* Output Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                disabled={!result?.convertedText}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={!result?.convertedText}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Yuklab olish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {result?.errors && result.errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400">
              Xatolik: {result.errors.join(', ')}
            </p>
          </div>
        )}

        {/* Stats bar */}
        {result && result.success && (
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span>Boshlang'ich: {result.originalText.length} belgi</span>
            <span>→</span>
            <span>Natija: {result.convertedText.length} belgi</span>
            <span>→</span>
            <span>{result.stats.words} so'z</span>
          </div>
        )}
      </div>
    </section>
  );
}
