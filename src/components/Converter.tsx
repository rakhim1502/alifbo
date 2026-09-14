import { useState, useCallback, useRef } from 'react';
import { Copy, Download, Trash2, Upload, Check, FileText } from 'lucide-react';
import { convertText } from '../converter';
import type { ConversionResult } from '../converter';

export function Converter() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Konvertatsiya qilish
  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    
    setIsConverting(true);
    // Simulate async operation for future API integration
    setTimeout(() => {
      const conversionResult = convertText(inputText);
      setResult(conversionResult);
      setIsConverting(false);
    }, 100);
  }, [inputText]);

  // Natijani nusxalash
  const handleCopy = useCallback(async () => {
    if (!result?.convertedText) return;
    
    try {
      await navigator.clipboard.writeText(result.convertedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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

    // Fayl turini tekshirish
    const validTypes = ['text/plain', 'text/html', 'application/json'];
    const validExtensions = ['.txt', '.text', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      alert('Faqat TXT fayllar qo\'llab-quvvatlanadi. DOCX va PDF keyingi versiyada qo\'shiladi.');
      return;
    }

    // Fayl hajmini tekshirish (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fayl hajmi 5MB dan oshmasligi kerak.');
      return;
    }

    // Faylni o'qish
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file, 'UTF-8');
    
    // Input ni tozalash
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
    // Faqat container dan chiqqanda dragging'ni o'chirish
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  return (
    <section id="converter" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ESKI ALIFBO
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {inputText.length} belgi
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
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
              
              {/* Drop zone overlay */}
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
              <button
                onClick={handleConvert}
                disabled={!inputText.trim() || isConverting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Konvertatsiya...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Konvertatsiya</span>
                  </>
                )}
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
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none"
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
              <button
                onClick={handleClear}
                disabled={!inputText && !result}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tozalash</span>
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
      </div>
    </section>
  );
}
