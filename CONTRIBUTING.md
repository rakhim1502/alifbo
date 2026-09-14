# Contributing Guide - O'zbek Alifbo Konvertori

Loyihaga hissa qo'shganingiz uchun rahmat! 🎉

---

## 🚀 Quick Start

### 1. Fork va Clone
```bash
# Fork qiling (GitHub'da)
git clone https://github.com/YOUR_USERNAME/uzbconverter.git
cd uzbconverter
```

### 2. Dependencies
```bash
npm install
```

### 3. Development
```bash
npm run dev
```

### 4. Branch yaratish
```bash
git checkout -b feature/your-feature-name
# yoki
git checkout -b fix/your-bug-fix
```

---

## 📝 Code Style

### TypeScript
- Barcha fayllar `.ts` yoki `.tsx` bo'lishi kerak
- `any` tipidan foydalanmang (agar juda zarur bo'lsa, izohlang)
- Interface'lar `I` prefix'siz (masalan: `User`, `IUser` emas)
- Type'lar `type` keyword bilan

```typescript
// ✅ Yaxshi
interface User {
  id: string;
  name: string;
}

type Status = 'active' | 'inactive';

// ❌ Yomon
interface IUser {
  id: any;
  name: any;
}
```

### React
- Functional components ishlatiladi
- Hooks ishlatiladi (useState, useEffect, useCallback)
- Props interface'lar alohida
- Component nomlari PascalCase

```typescript
// ✅ Yaxshi
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Yomon
export const Button = (props: any) => {
  return <button>{props.label}</button>;
};
```

### Naming Conventions
- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase, `use` prefix (`useStatistics.ts`)
- **Services:** camelCase (`dictionaryService.ts`)
- **Utils:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Variables:** camelCase (`userName`)
- **Functions:** camelCase (`convertText`)

### Imports
```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Local imports (relative paths)
import { convertText } from '../converter';
import type { ConversionResult } from '../converter/types';

// 4. Style imports
import './Component.css';
```

---

## 🧪 Testing

### Test yozish
```typescript
// converter/tests.ts
describe('convertText', () => {
  it('should convert sh to ş', () => {
    const result = convertText('shahar');
    expect(result.convertedText).toBe('şahar');
  });
});
```

### Test ishga tushirish
```bash
# Browser console'da
window.runConversionTests();
```

---

## 📦 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Yangi funksiya
- `fix`: Xato tuzatish
- `docs`: Dokumentatsiya
- `style`: Formatting (kod o'zgarmaydi)
- `refactor`: Kodni qayta tuzish
- `test`: Test qo'shish
- `chore`: Build, CI, dependencies

### Examples
```bash
# ✅ Yaxshi
feat(converter): add support for PDF export
fix(dictionary): correct o'zbekiston conversion
docs(readme): update deployment instructions
style(components): format code with prettier
refactor(hooks): simplify useStatistics logic
test(converter): add edge case tests
chore(deps): update react to 18.2.0

# ❌ Yomon
update code
fixed bug
changes
wip
```

---

## 🔀 Pull Request Process

### 1. Branch yaratish
```bash
git checkout -b feature/your-feature
```

### 2. O'zgarishlar qilish
- Kod yozing
- Test qiling
- Dokumentatsiya yangilang

### 3. Commit qilish
```bash
git add .
git commit -m "feat(converter): add new feature"
```

### 4. Push qilish
```bash
git push origin feature/your-feature
```

### 5. PR yaratish
- GitHub'da "New Pull Request" bosing
- Title va description yozing
- Reviewer'lar tanlang
- "Create Pull Request" bosing

### PR Template
```markdown
## Description
Bu PR nima qiladi?

## Changes
- O'zgarish 1
- O'zgarish 2

## Testing
Qanday test qilindi?

## Screenshots
(Agar UI o'zgargan bo'lsa)

## Checklist
- [ ] Code review qilindi
- [ ] Testlar ishlayapti
- [ ] Dokumentatsiya yangilandi
- [ ] Build muvaffaqiyatli
```

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Minimalism** - Ortiqcha elementlar yo'q
2. **Consistency** - Bir xil dizayn tili
3. **Accessibility** - WCAG AA darajasi
4. **Performance** - Tez yuklanish
5. **Mobile-first** - Responsive design

### Colors
```css
/* Primary */
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Neutral */
--gray-50: #f9fafb;
--gray-900: #111827;

/* Dark mode */
--slate-800: #1e293b;
--slate-900: #0f172a;
```

### Spacing
```css
/* 4px grid system */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

### Typography
```css
/* Font family */
font-family: 'Inter', sans-serif;

/* Sizes */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

---

## 🐛 Bug Reports

### Bug Report Template
```markdown
## Description
Xato nima?

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
Nima bo'lishi kerak?

## Actual Behavior
Nima bo'ldi?

## Environment
- OS: [masalan: Windows 10]
- Browser: [masalan: Chrome 90]
- Version: [masalan: 1.0.0]

## Screenshots
(Agar iloji bo'lsa)

## Additional Context
Boshqa ma'lumotlar
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
## Problem
Qanday muammoni hal qiladi?

## Solution
Taklif qilinayotgan yechim

## Alternatives
Boshqa variantlar

## Benefits
Qanday foyda beradi?

## Implementation Ideas
Qanday amalga oshirish mumkin?
```

---

## 📚 Resources

### Dokumentatsiya
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

### Loyiha
- README.md - Asosiy yo'riqnoma
- DEPLOYMENT.md - Deploy guide
- PRODUCTION_CHECKLIST.md - Checklist
- FINAL_AUDIT_REPORT.md - Audit report

---

## 🤝 Code of Conduct

### Bizning va'damiz
- Hurmatli va inclusive muhit
- Konstruktiv feedback
- Hamkorlik va yordam
- Open communication

### Kutilgan xulq
- Professional va do'stona munosabat
- Fikrlarni hurmat qilish
- Konstruktiv kritik
- Loyiha manfaatlarini birinchi o'ringa qo'yish

### Noqobil xulq
- Haqoratli yoki kamsituvchi til
- Trolling yoki spam
- Shaxsiy hujumlar
- Boshqa noqobil xatti-harakatlar

---

## 📞 Yordam

### Savollar bormi?
- GitHub Issues oching
- Email: info@uzbconverter.uz
- Discord (kelajakda)

### Emergency?
- Critical bug: GitHub Issues'da "urgent" label qo'shing
- Security issue: info@uzbconverter.uz ga yozing (private)

---

## 🎉 Rahmat!

Hissa qo'shganingiz uchun rahmat! Har bir PR, issue, feedback loyihani yaxshilashga yordam beradi.

**Birgalikda yaxshi mahsulot yaratamiz!** 🚀

---

**So'nggi yangilanish:** 2026-01-15
