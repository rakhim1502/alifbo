import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Trash2, Upload, Check, FileText, Loader2, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertText, convertTextReverse } from '../converter';
import { parseFile, formatFileSize, getFileAcceptString } from '../services/fileParser';
import { exportFile, generateFileName } from '../services/fileExporter';
import { useStatistics } from '../hooks/useStatistics';
import { performanceMonitor } from '../utils/performance';
import type { ConversionResult, ConversionMode } from '../converter';
import type { ExportFormat } from '../services/fileExporter';

export function Converter() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [realtimeMode, setRealtimeMode] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('old-to-new');
  
  const dropRef = useRef<HTMLDivElement>(null);
  const convertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { addConversion } = useStatistics();
  const lastSavedRef = useRef<string | null>(null);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Save conversion to history (debounced - faqat 2 soniya tinchganda)
  useEffect(() => {
    if (!result?.success || !result.convertedText) return;
    
    // Duplicate saqlashni oldini olish
    const resultKey = `${result.originalText.length}-${result.convertedText.length}`;
    if (lastSavedRef.current === resultKey) return;
    
    const timer = setTimeout(() => {
      addConversion({
        inputLength: result.originalText.length,
        outputLength: result.convertedText.length,
        wordCount: result.stats.words,
        mode: conversionMode,
      });
      lastSavedRef.current = resultKey;
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [result, addConversion, conversionMode]);

  // Conversion funksiyasi - mode'ga qarab
  const performConversion = useCallback((text: string) => {
    if (conversionMode === 'old-to-new') {
      return convertText(text);
    } else {
      return convertTextReverse(text);
    }
  }, [conversionMode]);

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
      const conversionResult = performanceMonitor.measureConversion(
        () => performConversion(inputText),
        inputText.length,
        0 // Output length keyin yangilanadi
      );
      setResult(conversionResult);
    }, 150);

    return () => {
      if (convertTimeoutRef.current) {
        clearTimeout(convertTimeoutRef.current);
      }
    };
  }, [inputText, realtimeMode]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to convert
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputText.trim() && !realtimeMode) {
          handleConvert();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, realtimeMode]);

  // Manual conversion
  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    const conversionResult = performConversion(inputText);
    setResult(conversionResult);
  }, [inputText, performConversion]);

  // Mode almashtirish
  const handleModeChange = useCallback(() => {
    setConversionMode(prev => prev === 'old-to-new' ? 'new-to-old' : 'old-to-new');
    // Natijani tozalash
    setResult(null);
    lastSavedRef.current = null;
  }, []);

  // Natijani nusxalash
  const handleCopy = useCallback(async () => {
    if (!result?.convertedText) return;
    
    try {
      await navigator.clipboard.writeText(result.convertedText);
      setCopied(true);
      setNotification({ type: 'success', message: 'Matn nusxalandi!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.convertedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setNotification({ type: 'success', message: 'Matn nusxalandi!' });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  // Natijani yuklab olish
  const handleDownload = useCallback(async (format: ExportFormat = 'txt') => {
    if (!result?.convertedText) return;
    
    setIsExporting(true);
    try {
      const fileName = generateFileName(uploadedFileName || undefined, format);
      const exportResult = await exportFile(result.convertedText, format, fileName);
      
      if (exportResult.success) {
        setNotification({ type: 'success', message: `${format.toUpperCase()} fayl yuklab olindi!` });
      } else {
        setNotification({ type: 'error', message: exportResult.errors?.join(', ') || 'Export xatosi' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Yuklab olishda xatolik yuz berdi' });
    } finally {
      setIsExporting(false);
    }
  }, [result, uploadedFileName]);

  // Tozalash
  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
    setUploadedFileName(null);
    if (inputTextareaRef.current) {
      inputTextareaRef.current.focus();
    }
  }, []);

  // Fayl yuklash (universal — TXT, DOCX, PDF)
  const handleFileUpload = useCallback(async (file: File) => {
    setIsParsing(true);
    setNotification(null);
    
    try {
      const parseResult = await parseFile(file);
      
      if (parseResult.success) {
        setInputText(parseResult.text);
        setUploadedFileName(file.name);
        setNotification({
          type: 'success',
          message: `${parseResult.fileType.toUpperCase()} fayl o'qildi (${formatFileSize(file.size)})`,
        });
      } else {
        setNotification({
          type: 'error',
          message: parseResult.errors?.join(', ') || 'Faylni o\'qishda xatolik',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Faylni o\'qishda xatolik',
      });
    } finally {
      setIsParsing(false);
    }
  }, []);

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  }, [handleFileUpload]);

  // Example text
  const handleExample = useCallback(() => {
    const exampleText = conversionMode === 'old-to-new'
      ? `O'zbekiston — markaziy Osiyodagi davlat. Poytaxti Toshkent shahri. O'zbekiston Respublikasi 1991-yilda mustaqillik e'lon qilgan.

O'zbek tili — turkiy tillar oilasiga mansub. O'zbek xalqi boy madaniyat va tarixga ega. Shahar va qishloqlarda chiroyli me'morchilik yodgorliklari saqlangan.

G'arbiy va sharqiy madaniyatlar kesishgan joyda joylashgan O'zbekiston buyuk ipak yo'lining muhim markazi bo'lgan. Samarqand, Buxoro, Xiva kabi shaharlar dunyoga mashhur.

Batafsil: https://uz.wikipedia.org/wiki/O'zbekiston
Email: info@example.uz`
      : `Özbekiston — markaziy Osiyodagi davlat. Poytaxti Toshkent şaharı. Özbekiston Respublikası 1991-yilda mustaqillik e'lon kılgan.

Özbek tili — turkiy tillar oilasına mansub. Özbek xalkı boy madaniyat va tarixga ega. Şahar va kışloklarda çirøyli me'morçilik yodgorlikları saklgan.

Ğarbiy va şarkiy madaniyatlar keşişgan joyda joylaşgan Özbekiston buyuk ipak yo'lining muhim markazı bo'lgan. Samarƣand, Buxoro, Xiva kabı şaharlar dunyoga maşhur.

Batafsil: https://uz.wikipedia.org/wiki/Özbekiston
Email: info@example.uz`;
    setInputText(exampleText);
    setUploadedFileName(null);
  }, [conversionMode]);

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

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
    <section id="converter" className="py-12 px-4 sm:px-6 lg:px-8" aria-label="Matn konvertori">
      <div className="max-w-6xl mx-auto">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                notification.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" aria-hidden="true" />
              )}
              <p className={`text-sm ${
                notification.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {notification.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Direction toggle */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={handleModeChange}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Konvertatsiya yo'nalishini o'zgartirish"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>
              {conversionMode === 'old-to-new' ? 'Eski → Yangi' : 'Yangi → Eski'}
            </span>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="radiogroup" aria-label="Konvertatsiya rejimi">
            <button
              onClick={() => setRealtimeMode(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                realtimeMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="radio"
              aria-checked={realtimeMode}
            >
              Real-time
            </button>
            <button
              onClick={() => setRealtimeMode(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                !realtimeMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="radio"
              aria-checked={!realtimeMode}
            >
              Tugma orqali
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversionMode === 'old-to-new' ? 'ESKI ALIFBO' : 'YANGI ALIFBO'}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
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
                ref={inputTextareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={conversionMode === 'old-to-new' 
                  ? "Matnni shu yerga kiriting yoki faylni tashlang (TXT, DOCX, PDF)..."
                  : "Yangi alifbodagi matnni shu yerga kiriting..."}
                className="w-full h-72 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-label={conversionMode === 'old-to-new' ? "Eski alifbodagi matn" : "Yangi alifbodagi matn"}
                aria-describedby="input-help"
              />
              
              {/* Loading overlay */}
              <AnimatePresence>
                {isParsing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center z-10"
                  >
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fayl o'qilmoqda...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Drag overlay */}
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/30 z-10"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-blue-600 dark:text-blue-400 font-medium">Faylni shu yerga tashlang</p>
                      <p className="text-xs text-blue-500 mt-1">TXT, DOCX, PDF</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p id="input-help" className="sr-only">
              Matnni kiriting yoki TXT, DOCX, PDF faylni yuklang. Maksimal hajm: 5MB.
            </p>

            {/* Uploaded file info */}
            {uploadedFileName && (
              <motion.div 
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FileText className="w-3 h-3" aria-hidden="true" />
                <span>Yuklangan: {uploadedFileName}</span>
              </motion.div>
            )}

            {/* Input Actions */}
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900">
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Yuklash</span>
                <input
                  type="file"
                  accept={getFileAcceptString()}
                  onChange={handleFileInputChange}
                  className="sr-only"
                  aria-label="Fayl yuklash"
                />
              </label>
              <button
                onClick={handleExample}
                disabled={!!inputText}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Misol matn qo'shish"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Misol</span>
              </button>
              {!realtimeMode && (
                <button
                  onClick={handleConvert}
                  disabled={!inputText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Konvertatsiya qilish (Ctrl+Enter)"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>Konvertatsiya</span>
                </button>
              )}
              <button
                onClick={handleClear}
                disabled={!inputText && !result}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Matnni tozalash"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Tozalash</span>
              </button>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversionMode === 'old-to-new' ? 'YANGI ALIFBO' : 'ESKI ALIFBO'}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                {result?.stats.characters ?? 0} belgi · {result?.stats.words ?? 0} so'z
              </span>
            </div>
            
            <textarea
              value={result?.convertedText ?? ''}
              readOnly
              placeholder="Konvertatsiya qilingan matn shu yerda ko'rinadi..."
              className="w-full h-72 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none font-mono text-sm leading-relaxed"
              spellCheck={false}
              aria-label="Yangi alifbodagi natija"
              aria-readonly="true"
            />

            {/* Output Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                disabled={!result?.convertedText}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label={copied ? 'Nusxalandi' : 'Natijani nusxalash'}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleDownload('txt')}
                disabled={!result?.convertedText || isExporting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="TXT formatida yuklab olish"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4" aria-hidden="true" />
                )}
                <span>TXT</span>
              </button>
              
              <button
                onClick={() => handleDownload('docx')}
                disabled={!result?.convertedText || isExporting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="DOCX formatida yuklab olish"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>DOCX</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Error display */}
        <AnimatePresence>
          {result?.errors && result.errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              role="alert"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                Xatolik: {result.errors.join(', ')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats bar */}
        <AnimatePresence>
          {result && result.success && (
            <motion.div 
              className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              aria-live="polite"
            >
              <span>Boshlang'ich: {result.originalText.length} belgi</span>
              <span aria-hidden="true">→</span>
              <span>Natija: {result.convertedText.length} belgi</span>
              <span aria-hidden="true">→</span>
              <span>{result.stats.words} so'z</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
