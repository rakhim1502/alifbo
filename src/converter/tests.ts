/**
 * O'zbek Alifbo Konvertori — Conversion Engine Tests
 * 
 * Bu fayl conversion engine'ning to'g'ri ishlashini tekshiradi.
 * Browser console'da: window.runConversionTests()
 */

import { convertText, performanceTest } from './converter';
import { normalizeApostrophes } from './normalize';
import { tokenize, getTokenStats } from './tokenizer';
import { detectCase, applyCase } from './utils';
import { dictionary } from './dictionary';

interface TestCase {
  name: string;
  input: string;
  expected: string;
  description?: string;
  category: string;
}

const testCases: TestCase[] = [
  // === 1. Oddiy so'zlar ===
  { name: 'sh - so\'z boshida', input: 'shahar', expected: 'şahar', category: 'basic' },
  { name: 'ch - so\'z boshida', input: 'chiroyli', expected: 'çiroyli', category: 'basic' },
  { name: 'o\' - so\'z boshida', input: 'o\'qish', expected: 'öqish', category: 'basic' },
  { name: 'g\' - so\'z boshida', input: 'g\'arbiy', expected: 'ğarbiy', category: 'basic' },
  { name: 'sh - so\'z ichida', input: 'yashil', expected: 'yaşil', category: 'basic' },
  { name: 'ch - so\'z ichida', input: 'yachka', expected: 'yaçka', category: 'basic' },
  { name: 'sh - so\'z oxirida', input: 'besh', expected: 'beş', category: 'basic' },
  { name: 'ng - so\'z ichida', input: 'tilingiz', expected: 'tiliñiz', category: 'basic' },
  
  // === 2. Case preservation ===
  { name: 'Title case - Sh', input: 'Shahar', expected: 'Şahar', category: 'case' },
  { name: 'Title case - Ch', input: 'Chiroyli', expected: 'Çiroyli', category: 'case' },
  { name: 'Title case - O\'', input: 'O\'zbekiston', expected: 'Özbekiston', category: 'case' },
  { name: 'Title case - G\'', input: 'G\'arbiy', expected: 'Ğarbiy', category: 'case' },
  { name: 'Upper case - SH', input: 'SHAHAR', expected: 'ŞAHAR', category: 'case' },
  { name: 'Upper case - CH', input: 'CHIROYLI', expected: 'ÇIROYLI', category: 'case' },
  { name: 'Lower case - sh', input: 'shahar', expected: 'şahar', category: 'case' },
  { name: 'Lower case - ch', input: 'chana', expected: 'çana', category: 'case' },
  
  // === 3. Exception words ===
  { name: 'Exception - O\'zbekiston', input: 'O\'zbekiston', expected: 'Özbekiston', category: 'exception' },
  { name: 'Exception - o\'zbek', input: 'o\'zbek', expected: 'özbek', category: 'exception' },
  { name: 'Exception - o\'zbekiston', input: 'o\'zbekiston', expected: 'özbekiston', category: 'exception' },
  { name: 'Exception - o\'qish', input: 'o\'qish', expected: 'öqish', category: 'exception' },
  { name: 'Exception - o\'qituvchi', input: 'o\'qituvchi', expected: 'öqituvçi', category: 'exception' },
  { name: 'Exception - g\'alaba', input: 'g\'alaba', expected: 'ğalaba', category: 'exception' },
  { name: 'Exception - g\'arbiy', input: 'g\'arbiy', expected: 'ğarbiy', category: 'exception' },
  { name: 'Exception - o\'z', input: 'o\'z', expected: 'öz', category: 'exception' },
  { name: 'Exception - o\'zi', input: 'o\'zi', expected: 'özi', category: 'exception' },
  { name: 'Exception - o\'rtada', input: 'o\'rtada', expected: 'örtada', category: 'exception' },
  { name: 'Exception - o\'tgan', input: 'o\'tgan', expected: 'ötgan', category: 'exception' },
  
  // === 4. Apostrophe variants ===
  { name: 'Apostrophe - straight', input: "O'zbekiston", expected: 'Özbekiston', category: 'apostrophe' },
  { name: 'Apostrophe - right curly', input: 'O\u2019zbekiston', expected: 'Özbekiston', category: 'apostrophe' },
  { name: 'Apostrophe - left curly', input: 'O\u2018zbekiston', expected: 'Özbekiston', category: 'apostrophe' },
  { name: 'Apostrophe - modifier ʻ', input: 'O\u02BBzbekiston', expected: 'Özbekiston', category: 'apostrophe' },
  { name: 'Apostrophe - modifier ʼ', input: 'O\u02BCzbekiston', expected: 'Özbekiston', category: 'apostrophe' },
  { name: 'Apostrophe - grave', input: 'O\u0060zbekiston', expected: 'Özbekiston', category: 'apostrophe' },
  
  // === 5. Punctuation preservation ===
  { name: 'Punctuation - nuqta', input: 'Salom.', expected: 'Şalom.', category: 'punctuation' },
  { name: 'Punctuation - vergul', input: 'Salom, dunyo', expected: 'Şalom, dunyo', category: 'punctuation' },
  { name: 'Punctuation - so\'roq', input: 'Qanday?', expected: 'Qanday?', category: 'punctuation' },
  { name: 'Punctuation - unqov', input: 'Salom!', expected: 'Şalom!', category: 'punctuation' },
  { name: 'Punctuation - qo\'shtirnoq', input: '"Salom"', expected: '"Şalom"', category: 'punctuation' },
  { name: 'Punctuation - qavs', input: '(Salom)', expected: '(Şalom)', category: 'punctuation' },
  { name: 'Punctuation - tire', input: 'Salom - dunyo', expected: 'Şalom - dunyo', category: 'punctuation' },
  
  // === 6. Numbers preservation ===
  { name: 'Numbers - yil', input: '2026-yil', expected: '2026-yil', category: 'numbers' },
  { name: 'Numbers - kasr', input: '3.14', expected: '3.14', category: 'numbers' },
  { name: 'Numbers - matn bilan', input: '5 ta shahar', expected: '5 ta şahar', category: 'numbers' },
  
  // === 7. URL preservation ===
  { name: 'URL - http', input: 'Sayt: http://example.com', expected: 'Şayt: http://example.com', category: 'url' },
  { name: 'URL - https', input: 'Sayt: https://example.com/path', expected: 'Şayt: https://example.com/path', category: 'url' },
  { name: 'URL - matn bilan', input: 'Ko\'ring: https://uz.wikipedia.org', expected: 'Ko\'riñ: https://uz.wikipedia.org', category: 'url' },
  
  // === 8. Email preservation ===
  { name: 'Email - saqlanadi', input: 'Email: test@example.com', expected: 'Email: test@example.com', category: 'email' },
  { name: 'Email - matn bilan', input: 'Yubor: o\'zbek@mail.uz ga', expected: 'Yubor: özbek@mail.uz ga', category: 'email' },
  
  // === 9. Abbreviations ===
  { name: 'Abbreviation - km', input: '10 km', expected: '10 km', category: 'abbreviation' },
  { name: 'Abbreviation - kg', input: '5 kg', expected: '5 kg', category: 'abbreviation' },
  { name: 'Abbreviation - PhD', input: 'PhD daraja', expected: 'PhD daraja', category: 'abbreviation' },
  
  // === 10. Complex sentences ===
  { name: 'Sentence - oddiy', input: 'Men O\'zbekistonda yashayman.', expected: 'Men Özbekistonda yaşayman.', category: 'sentence' },
  { name: 'Sentence - sh/ch', input: 'Shahar chiroyli.', expected: 'Şahar çiroyli.', category: 'sentence' },
  { name: 'Sentence - o\'/g\'', input: 'O\'qituvchi g\'alaba qozondi.', expected: 'Öqituvçi ğalaba qozondi.', category: 'sentence' },
  { name: 'Sentence - aralash', input: 'To\'g\'ri shahar chetida.', expected: 'Töğri şahar çetida.', category: 'sentence' },
  
  // === 11. Paragraphs ===
  { name: 'Paragraph - ko\'p qator', input: 'Salom.\nMen O\'zbekistondanman.', expected: 'Şalom.\nMen Özbekistondanman.', category: 'paragraph' },
  { name: 'Paragraph - bo\'sh qator', input: 'Birinchi.\n\nIkkinchi.', expected: 'Birinçi.\n\nİkkinçi.', category: 'paragraph' },
  
  // === 12. Edge cases ===
  { name: 'Empty input', input: '', expected: '', category: 'edge' },
  { name: 'Whitespace only', input: '   ', expected: '', category: 'edge' },
  { name: 'Single char', input: 'a', expected: 'a', category: 'edge' },
  { name: 'Numbers only', input: '12345', expected: '12345', category: 'edge' },
  { name: 'Punctuation only', input: '.,!?;', expected: '.,!?;', category: 'edge' },
  
  // === 13. Real Uzbek text ===
  { name: 'Real - shirin', input: 'shirin meva', expected: 'şirin meva', category: 'real' },
  { name: 'Real - chiroq', input: 'chiroq yoqildi', expected: 'çiroq yoqildi', category: 'real' },
  { name: 'Real - to\'g\'ri', input: 'to\'g\'ri yo\'l', expected: 'töğri yö\'l', category: 'real' },
  { name: 'Real - O\'zbekiston', input: 'O\'zbekiston Respublikasi', expected: 'Özbekiston Respublikasi', category: 'real' },
];

/**
 * Test'ni ishga tushirish
 */
export function runTests(): void {
  console.log('=== O\'zbek Alifbo Konvertori — Test Suite ===\n');
  
  let passed = 0;
  let failed = 0;
  const failedTests: TestCase[] = [];
  
  for (const test of testCases) {
    const result = convertText(test.input);
    const actual = result.convertedText;
    const success = actual === test.expected;
    
    if (success) {
      passed++;
      console.log(`✓ [${test.category}] ${test.name}`);
    } else {
      failed++;
      failedTests.push(test);
      console.log(`✗ [${test.category}] ${test.name}`);
      console.log(`  Input:    "${test.input}"`);
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual:   "${actual}"`);
    }
  }
  
  console.log('\n=== Test Results ===');
  console.log(`Total:  ${testCases.length}`);
  console.log(`Passed: ${passed} (${((passed / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n=== Failed Tests ===');
    for (const test of failedTests) {
      console.log(`- [${test.category}] ${test.name}`);
    }
  }
  
  return;
}

/**
 * Category bo'yicha test natijalari
 */
export function runTestsByCategory(): void {
  console.log('=== Tests by Category ===\n');
  
  const categories = new Map<string, { passed: number; failed: number }>();
  
  for (const test of testCases) {
    const result = convertText(test.input);
    const success = result.convertedText === test.expected;
    
    if (!categories.has(test.category)) {
      categories.set(test.category, { passed: 0, failed: 0 });
    }
    
    const stats = categories.get(test.category)!;
    if (success) {
      stats.passed++;
    } else {
      stats.failed++;
    }
  }
  
  for (const [category, stats] of categories) {
    const total = stats.passed + stats.failed;
    const rate = ((stats.passed / total) * 100).toFixed(1);
    console.log(`${category}: ${stats.passed}/${total} (${rate}%)`);
  }
}

/**
 * Normalization test
 */
export function testNormalization(): void {
  console.log('\n=== Normalization Tests ===\n');
  
  const tests = [
    { input: "O'zbekiston", expected: 'O\u2019zbekiston', name: 'Straight apostrophe' },
    { input: "O\u2018zbekiston", expected: 'O\u2019zbekiston', name: 'Left curly' },
    { input: "O\u2019zbekiston", expected: 'O\u2019zbekiston', name: 'Right curly' },
    { input: "O\u02BBzbekiston", expected: 'O\u2019zbekiston', name: 'Modifier comma' },
    { input: "O\u02BCzbekiston", expected: 'O\u2019zbekiston', name: 'Modifier apostrophe' },
  ];
  
  let passed = 0;
  for (const test of tests) {
    const result = normalizeApostrophes(test.input);
    const success = result === test.expected;
    if (success) passed++;
    console.log(`${success ? '✓' : '✗'} ${test.name}`);
    if (!success) {
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual:   "${result}"`);
    }
  }
  console.log(`\nPassed: ${passed}/${tests.length}`);
}

/**
 * Tokenizer test
 */
export function testTokenizer(): void {
  console.log('\n=== Tokenizer Tests ===\n');
  
  const input = 'Salom, dunyo! https://example.com test@mail.com 123 km';
  const tokens = tokenize(input);
  const stats = getTokenStats(tokens);
  
  console.log(`Input: "${input}"`);
  console.log(`Total tokens: ${tokens.length}`);
  console.log('Stats:', stats);
  console.log('\nTokens:');
  tokens.forEach((t, i) => {
    console.log(`  ${i}: [${t.type}] "${t.value}"`);
  });
}

/**
 * Case detection test
 */
export function testCaseDetection(): void {
  console.log('\n=== Case Detection Tests ===\n');
  
  const tests = [
    { input: 'shahar', expected: 'lower' },
    { input: 'SHAHAR', expected: 'upper' },
    { input: 'Shahar', expected: 'title' },
    { input: 'sHaHaR', expected: 'mixed' },
  ];
  
  let passed = 0;
  for (const test of tests) {
    const result = detectCase(test.input);
    const success = result === test.expected;
    if (success) passed++;
    console.log(`${success ? '✓' : '✗'} "${test.input}" → ${result}`);
  }
  console.log(`\nPassed: ${passed}/${tests.length}`);
}

/**
 * Dictionary test
 */
export function testDictionary(): void {
  console.log('\n=== Dictionary Tests ===\n');
  
  console.log(`Total entries: ${dictionary.size()}`);
  console.log(`Geography: ${dictionary.getByCategory('geography').length}`);
  console.log(`Nationality: ${dictionary.getByCategory('nationality').length}`);
  console.log(`Verb: ${dictionary.getByCategory('verb').length}`);
  console.log(`Noun: ${dictionary.getByCategory('noun').length}`);
  console.log(`Adjective: ${dictionary.getByCategory('adjective').length}`);
  
  const testWords = ["o'zbek", "o'zbekiston", "g'alaba", "unknown"];
  console.log('\nLookup tests:');
  for (const word of testWords) {
    const entry = dictionary.lookup(word);
    console.log(`  "${word}" → ${entry ? entry.newForm : 'NOT FOUND'}`);
  }
}

/**
 * Performance test
 */
export function runPerformanceTest(): void {
  console.log('\n=== Performance Tests ===\n');
  
  const sizes = [1000, 10000, 100000, 1000000];
  
  for (const size of sizes) {
    const result = performanceTest(size);
    console.log(`Size: ${(result.inputSize / 1000).toFixed(0)}KB`);
    console.log(`  Duration: ${result.duration.toFixed(2)}ms`);
    console.log(`  Words/sec: ${result.wordsPerSecond.toFixed(0)}`);
  }
}

// Browser'da ishga tushirish
if (typeof window !== 'undefined') {
  (window as any).runConversionTests = () => {
    runTests();
    testNormalization();
    testTokenizer();
    testCaseDetection();
    testDictionary();
    runTestsByCategory();
  };
  
  (window as any).runPerformanceTest = runPerformanceTest;
}
