/**
 * O'zbek Alifbo Konvertori — Conversion Engine Tests
 * 
 * Bu fayl conversion engine'ning to'g'ri ishlashini tekshiradi.
 * Console'da ishlaydi va natijalarni ko'rsatadi.
 */

import { convertText } from './converter';
import { normalize, normalizeApostrophes } from './normalize';
import { tokenize } from './tokenizer';
import { detectCase, applyCase } from './utils';

interface TestCase {
  name: string;
  input: string;
  expected: string;
  description?: string;
}

const testCases: TestCase[] = [
  // === 1. Oddiy so'zlar ===
  {
    name: 'Oddiy so\'z - sh',
    input: 'shahar',
    expected: 'şahar',
    description: 'sh → ş',
  },
  {
    name: 'Oddiy so\'z - ch',
    input: 'chiroyli',
    expected: 'çiroyli',
    description: 'ch → ç',
  },
  {
    name: 'Oddiy so\'z - o\'',
    input: 'o\'qish',
    expected: 'öqish',
    description: 'o\' → ö',
  },
  {
    name: 'Oddiy so\'z - g\'',
    input: 'g\'arbiy',
    expected: 'ğarbiy',
    description: 'g\' → ğ',
  },
  
  // === 2. Katta harf ===
  {
    name: 'Katta harf - Sh',
    input: 'Shahar',
    expected: 'Şahar',
    description: 'Sh → Ş',
  },
  {
    name: 'Katta harf - Ch',
    input: 'Chiroyli',
    expected: 'Çiroyli',
    description: 'Ch → Ç',
  },
  {
    name: 'Katta harf - O\'',
    input: 'O\'zbekiston',
    expected: 'Özbekiston',
    description: 'O\' → Ö',
  },
  {
    name: 'Katta harf - G\'',
    input: 'G\'arbiy',
    expected: 'Ğarbiy',
    description: 'G\' → Ğ',
  },
  
  // === 3. Kichik harf ===
  {
    name: 'Kichik harf - sh',
    input: 'shahar',
    expected: 'şahar',
    description: 'sh → ş',
  },
  {
    name: 'Kichik harf - ch',
    input: 'chana',
    expected: 'çana',
    description: 'ch → ç',
  },
  
  // === 4. Mixed case ===
  {
    name: 'Mixed case - SH',
    input: 'SHAHAR',
    expected: 'ŞAHAR',
    description: 'SH → Ş (katta)',
  },
  {
    name: 'Mixed case - CH',
    input: 'CHIROYLI',
    expected: 'ÇIROYLI',
    description: 'CH → Ç (katta)',
  },
  
  // === 5. sh kombinatsiyasi ===
  {
    name: 'sh - so\'z boshida',
    input: 'shirin',
    expected: 'şirin',
  },
  {
    name: 'sh - so\'z ichida',
    input: 'yashil',
    expected: 'yaşil',
  },
  {
    name: 'sh - so\'z oxirida',
    input: 'besh',
    expected: 'beş',
  },
  
  // === 6. ch kombinatsiyasi ===
  {
    name: 'ch - so\'z boshida',
    input: 'charchamoq',
    expected: 'çarçamoq',
  },
  {
    name: 'ch - so\'z ichida',
    input: 'yachka',
    expected: 'yaçka',
  },
  
  // === 7. o' kombinatsiyasi ===
  {
    name: 'o\' - so\'z boshida',
    input: 'o\'zbek',
    expected: 'özbek',
  },
  {
    name: 'o\' - so\'z ichida',
    input: 'to\'g\'ri',
    expected: 'töğri',
  },
  
  // === 8. g' kombinatsiyasi ===
  {
    name: 'g\' - so\'z boshida',
    input: 'g\'alaba',
    expected: 'ğalaba',
  },
  {
    name: 'g\' - so\'z ichida',
    input: 'tog\'li',
    expected: 'toğli',
  },
  
  // === 9. Turli apostrophe variantlari ===
  {
    name: 'Apostrophe - straight (\' )',
    input: "O'zbekiston",
    expected: 'Özbekiston',
    description: 'Straight apostrophe',
  },
  {
    name: 'Apostrophe - right curly (\u2019)',
    input: 'O\u2019zbekiston',
    expected: 'Özbekiston',
    description: 'Right single quotation mark',
  },
  {
    name: 'Apostrophe - left curly (\u2018)',
    input: 'O\u2018zbekiston',
    expected: 'Özbekiston',
    description: 'Left single quotation mark',
  },
  {
    name: 'Apostrophe - modifier (\u02BB)',
    input: 'O\u02BBzbekiston',
    expected: 'Özbekiston',
    description: 'Modifier letter turned comma',
  },
  {
    name: 'Apostrophe - modifier (\u02BC)',
    input: 'O\u02BCzbekiston',
    expected: 'Özbekiston',
    description: 'Modifier letter apostrophe',
  },
  
  // === 10. Punctuation ===
  {
    name: 'Punctuation - nuqta',
    input: 'Salom.',
    expected: 'Şalom.',
  },
  {
    name: 'Punctuation - vergul',
    input: 'Salom, dunyo',
    expected: 'Şalom, dunyo',
  },
  {
    name: 'Punctuation - so\'roq',
    input: 'Qanday?',
    expected: 'Qanday?',
  },
  {
    name: 'Punctuation - unqov',
    input: 'Salom!',
    expected: 'Şalom!',
  },
  
  // === 11. Raqamlar ===
  {
    name: 'Raqamlar - saqlanadi',
    input: '2026-yil',
    expected: '2026-yil',
  },
  {
    name: 'Raqamlar - kasr',
    input: '3.14',
    expected: '3.14',
  },
  
  // === 12. URL ===
  {
    name: 'URL - saqlanadi',
    input: 'Sayt: https://example.com',
    expected: 'Şayt: https://example.com',
  },
  
  // === 13. Email ===
  {
    name: 'Email - saqlanadi',
    input: 'Email: test@example.com',
    expected: 'Email: test@example.com',
  },
  
  // === 14. Paragraph ===
  {
    name: 'Paragraph - ko\'p qator',
    input: 'Salom.\nMen O\'zbekistondanman.\nChiroyli kun!',
    expected: 'Şalom.\nMen Özbekistondanman.\nÇiroyli kun!',
  },
  
  // === 15. Multiline text ===
  {
    name: 'Multiline - bo\'sh qatorlar',
    input: 'Birinchi qator.\n\nIkkinchi qator.',
    expected: 'Birinçi qator.\n\nİkkinçi qator.',
  },
  
  // === 16. Empty input ===
  {
    name: 'Empty input',
    input: '',
    expected: '',
  },
  
  // === 17. Very long input ===
  {
    name: 'Long input - 1000 belgi',
    input: 'shahar '.repeat(143),
    expected: 'şahar '.repeat(143),
  },
  
  // === 18. Exception words ===
  {
    name: 'Exception - O\'zbekiston',
    input: 'O\'zbekiston',
    expected: 'Özbekiston',
  },
  {
    name: 'Exception - o\'zbek',
    input: 'o\'zbek',
    expected: 'özbek',
  },
  {
    name: 'Exception - g\'arbiy',
    input: 'g\'arbiy',
    expected: 'ğarbiy',
  },
  
  // === 19. Real Uzbek words ===
  {
    name: 'Real so\'z - shirin',
    input: 'shirin',
    expected: 'şirin',
  },
  {
    name: 'Real so\'z - chiroq',
    input: 'chiroq',
    expected: 'çiroq',
  },
  {
    name: 'Real so\'z - o\'qituvchi',
    input: 'o\'qituvchi',
    expected: 'öqituvçi',
  },
  {
    name: 'Real so\'z - g\'alaba',
    input: 'g\'alaba',
    expected: 'ğalaba',
  },
  {
    name: 'Real so\'z - to\'g\'ri',
    input: 'to\'g\'ri',
    expected: 'töğri',
  },
];

/**
 * Test'ni ishga tushirish
 */
export function runTests(): void {
  console.log('=== O\'zbek Alifbo Konvertori — Test Suite ===\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    const result = convertText(test.input);
    const actual = result.convertedText;
    const success = actual === test.expected;
    
    if (success) {
      passed++;
      console.log(`✓ ${test.name}`);
    } else {
      failed++;
      console.log(`✗ ${test.name}`);
      console.log(`  Input:    "${test.input}"`);
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual:   "${actual}"`);
      if (test.description) {
        console.log(`  Note:     ${test.description}`);
      }
    }
  }
  
  console.log('\n=== Test Results ===');
  console.log(`Total:  ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
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
  ];
  
  for (const test of tests) {
    const result = normalizeApostrophes(test.input);
    const success = result === test.expected;
    console.log(`${success ? '✓' : '✗'} ${test.name}`);
    if (!success) {
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual:   "${result}"`);
    }
  }
}

/**
 * Tokenizer test
 */
export function testTokenizer(): void {
  console.log('\n=== Tokenizer Tests ===\n');
  
  const input = 'Salom, dunyo! https://example.com test@mail.com 123';
  const tokens = tokenize(input);
  
  console.log(`Input: "${input}"`);
  console.log(`Tokens: ${tokens.length}`);
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
  
  for (const test of tests) {
    const result = detectCase(test.input);
    const success = result === test.expected;
    console.log(`${success ? '✓' : '✗'} "${test.input}" → ${result}`);
  }
}

// Browser'da ishga tushirish
if (typeof window !== 'undefined') {
  (window as any).runConversionTests = () => {
    runTests();
    testNormalization();
    testTokenizer();
    testCaseDetection();
  };
}
