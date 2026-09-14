# Deployment Guide - O'zbek Alifbo Konvertori

## 📋 Deploy oldidan tekshiruv

### 1. Build tekshiruvi
```bash
npm run build
```

**Kutilgan natija:**
- ✅ Build muvaffaqiyatli tugashi kerak
- ✅ `dist/` papkasi yaratilishi kerak
- ⚠️ Chunk size warning (muhim emas)

### 2. Local testing
```bash
npm run preview
```

**Tekshirish:**
- [ ] Asosiy sahifa yuklanadi
- [ ] Converter ishlaydi
- [ ] Dark/Light mode ishlaydi
- [ ] File upload ishlaydi
- [ ] Admin panel ochiladi (Ctrl+Shift+A)
- [ ] Statistics ko'rinadi

### 3. Performance tekshiruvi
```bash
# Lighthouse (Chrome DevTools)
# yoki
npm install -g lighthouse
lighthouse https://your-domain.com
```

**Target metrics:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >95

---

## 🚀 Deployment variantlari

### Variant 1: Vercel (Tavsiya etiladi)

**1. Vercel hisob yaratish**
```bash
npm i -g vercel
vercel login
```

**2. Deploy**
```bash
vercel
```

**3. Production deploy**
```bash
vercel --prod
```

**Environment variables (agar kerak bo'lsa):**
- Vercel Dashboard → Settings → Environment Variables
- `.env.example` dagi o'zgaruvchilarni qo'shing

---

### Variant 2: Netlify

**1. Netlify hisob yaratish**
- https://netlify.com ga kiring
- "New site from Git" tanlang

**2. Build settings**
```
Build command: npm run build
Publish directory: dist
```

**3. Environment variables**
- Site settings → Environment variables
- `.env.example` dagi o'zgaruvchilarni qo'shing

**4. Deploy**
- Git push qiling yoki "Deploy manually" tanlang

---

### Variant 3: GitHub Pages

**1. GitHub repo yaratish**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/uzbconverter.git
git push -u origin main
```

**2. Vite config'ni yangilash**
```javascript
// vite.config.ts
export default defineConfig({
  base: '/uzbconverter/', // repo nomi
  // ...
})
```

**3. GitHub Actions workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**4. GitHub Pages sozlamalari**
- Repo → Settings → Pages
- Source: "Deploy from a branch"
- Branch: `gh-pages` / `root`

---

### Variant 4: Cloudflare Pages

**1. Cloudflare hisob yaratish**
- https://pages.cloudflare.com ga kiring

**2. Yangi loyiha**
- "Create a project" → "Connect to Git"
- GitHub/GitLab/Bitbucket tanlang

**3. Build settings**
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

**4. Deploy**
- Avtomatik deploy Git push'dan keyin

---

### Variant 5: Self-hosted (VPS)

**1. Server tayyorlash**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx nodejs npm

# Node.js 18+ o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

**2. Loyihani yuklash**
```bash
git clone https://github.com/yourusername/uzbconverter.git
cd uzbconverter
npm ci
npm run build
```

**3. Nginx konfiguratsiya**
```nginx
# /etc/nginx/sites-available/uzbconverter
server {
    listen 80;
    server_name uzbconverter.uz www.uzbconverter.uz;
    
    root /var/www/uzbconverter/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;" always;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**4. Saytni yoqish**
```bash
sudo ln -s /etc/nginx/sites-available/uzbconverter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. SSL sertifikat (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d uzbconverter.uz -d www.uzbconverter.uz
```

---

## 🔧 Post-deployment tekshiruv

### 1. Funksional test
- [ ] Matn kiritish va konvertatsiya
- [ ] Real-time mode
- [ ] Manual mode
- [ ] File upload (TXT, DOCX, PDF)
- [ ] Copy to clipboard
- [ ] Download (TXT, DOCX)
- [ ] Dark/Light mode
- [ ] Admin panel (Ctrl+Shift+A)
- [ ] Dictionary manager
- [ ] Rules manager
- [ ] Statistics dashboard
- [ ] Error handling

### 2. Performance test
```bash
# Lighthouse
lighthouse https://your-domain.com --output html

# WebPageTest
# https://www.webpagetest.org/
```

### 3. Security test
```bash
# Security headers tekshirish
curl -I https://your-domain.com

# SSL test
# https://www.ssllabs.com/ssltest/
```

### 4. SEO test
```bash
# Google Search Console
# https://search.google.com/search-console

# Bing Webmaster Tools
# https://www.bing.com/webmasters
```

---

## 📊 Monitoring

### Uptime monitoring
- **UptimeRobot** (bepul) - https://uptimerobot.com
- **Pingdom** (pullik) - https://www.pingdom.com

### Error monitoring
- **Sentry** (bepul tier) - https://sentry.io
- **LogRocket** - https://logrocket.com

### Analytics
- **Google Analytics** - https://analytics.google.com
- **Plausible** (privacy-friendly) - https://plausible.io

---

## 🔄 Update qilish

### Avtomatik update (Git-based)
```bash
# Local
git add .
git commit -m "Update: description"
git push origin main

# Auto-deploy (Vercel/Netlify/Cloudflare)
```

### Manual update (Self-hosted)
```bash
# Server'da
cd /var/www/uzbconverter
git pull origin main
npm ci
npm run build
# Nginx avtomatik yangi fayllarni ko'rsatadi
```

---

## 🆘 Muammolar va yechimlar

### 1. Build xatosi
```bash
# Node modules tozalash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. White screen
- Browser console'ni tekshiring
- Network tab'da 404 xatolar bormi?
- `base` path to'g'rimi? (GitHub Pages)

### 3. Slow loading
- Gzip yoqilganmi?
- CDN ishlatilganmi?
- Image'lar optimize qilinganmi?

### 4. CORS xatosi
- Backend API uchun CORS sozlang
- `.env` da `VITE_API_URL` to'g'rimi?

---

## 📞 Yordam

### Dokumentatsiya
- README.md - Asosiy yo'riqnoma
- DEPLOYMENT.md - Deploy guide (bu fayl)
- CONTRIBUTING.md - Hissa qo'shish (kelajakda)

### Aloqa
- Email: info@uzbconverter.uz
- GitHub Issues: https://github.com/yourusername/uzbconverter/issues

---

**Muvaffaqiyatli deployment!** 🎉
