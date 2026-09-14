import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Trash2, Upload, Check, FileText, Loader2, AlertCircle } from 'lucide-react';
import { convertText } from '../converter';
import { parseFile, formatFileSize, getFileAcceptString } from '../services/fileParser';
import { exportFile, generateFileName } from '../services/fileExporter';
import type { ConversionResult } from '../converter';
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
  
  const dropRef = useRef<HTMLDivElement>(null);
  const convertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    const exampleText = `O'zbekiston — markaziy Osiyodagi davlat. Poytaxti Toshkent shahri. O'zbekiston Respublikasi 1991-yilda mustaqillik e'lon qilgan.

O'zbek tili — turkiy tillar oilasiga mansub. O'zbek xalqi boy madaniyat va tarixga ega. Shahar va qishloqlarda chiroyli me'morchilik yodgorliklari saqlangan.

G'arbiy va sharqiy madaniyatlar kesishgan joyda joylashgan O'zbekiston buyuk ipak yo'lining muhim markazi bo'lgan. Samarqand, Buxoro, Xiva kabi shaharlar dunyoga mashhur.

Batafsil: https://uz.wikipedia.org/wiki/O'zbekiston
Email: info@example.uz`;
    setInputText(exampleText);
    setUploadedFileName(null);
  }, []);

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
    <section id="converter" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={`text-sm ${
              notification.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

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
                placeholder="Matnni shu yerga kiriting yoki faylni tashlang (TXT, DOCX, PDF)..."
                className="w-full h-72 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
              
              {/* Loading overlay */}
              {isParsing && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fayl o'qilmoqda...</p>
                  </div>
                </div>
              )}
              
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/30 z-10">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Faylni shu yerga tashlang</p>
                    <p className="text-xs text-blue-500 mt-1">TXT, DOCX, PDF</p>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded file info */}
            {uploadedFileName && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FileText className="w-3 h-3" />
                <span>Yuklangan: {uploadedFileName}</span>
              </div>
            )}

            {/* Input Actions */}
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Yuklash</span>
                <input
                  type="file"
                  accept={getFileAcceptString()}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExample}
                disabled={!!inputText}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Misol</span>
              </button>
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
              
              {/* Download dropdown */}
              <div className="relative group">
                <button
                  onClick={() => handleDownload('txt')}
                  disabled={!result?.convertedText || isExporting}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>TXT</span>
                </button>
              </div>
              <button
                onClick={() => handleDownload('docx')}
                disabled={!result?.convertedText || isExporting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>DOCX</span>
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
