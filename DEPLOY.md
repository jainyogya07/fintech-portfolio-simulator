# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

**One Command Deploy:**
```bash
npx vercel --prod
```

**Or via Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Click Deploy
4. Get your live URL!

---

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy
npx netlify deploy --prod --dir=dist
```

**Or via Dashboard:**
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `dist` folder
3. Done!

---

### Option 3: GitHub Pages

**Add to package.json:**
```json
{
  "homepage": "https://yourusername.github.io/fintech-portfolio-simulator",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Install & Deploy:**
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

### Option 4: Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## Build Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build |
| `npm run preview` | Preview build locally |
| `npm run test:run` | Run tests before deploy |

---

## Environment Variables

No environment variables required! The app works with:
- Demo data by default
- Optional Alpha Vantage API key (set in app)

---

## CI/CD (GitHub Actions)

Already configured! On every push:
1. ✅ Runs 95 tests
2. ✅ Lints code
3. ✅ Builds production

See `.github/workflows/ci.yml`

---

## Post-Deploy Checklist

- [ ] Test all features work
- [ ] Check mobile responsiveness
- [ ] Verify PWA installs correctly
- [ ] Test offline functionality
- [ ] Share your live URL! 🎉
