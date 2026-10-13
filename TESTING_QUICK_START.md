# 🚀 Testing Quick Start - 5 Minutes

Quick commands to test all features in 5 minutes!

---

## 1️⃣ Start Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

---

## 2️⃣ Test Login (30 seconds)

```bash
# 1. Open http://localhost:3000/dashboard/login
# 2. Enter password: 01533
# 3. Click "Log in"
# Expected: Redirected to dashboard ✓

# Or via curl:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"01533"}' \
  -c cookies.txt
```

---

## 3️⃣ Test Translation (1 minute)

```bash
# 1. Visit http://localhost:3000/dashboard/new
# 2. In title field, enter: আমি বাংলা ভালোবাসি
# 3. Click "🌐 Translate to English"
# 4. Wait for spinner to finish
# Expected: Title changes to English ✓

# Or via curl:
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"আমি বাংলা ভালোবাসি","targetLanguage":"en"}'
```

---

## 4️⃣ Test Image URL Validation (1 minute)

```bash
# 1. Visit http://localhost:3000/dashboard/new
# 2. Click "🔗 URL" tab
# 3. Paste: https://picsum.photos/400/500
# 4. Wait for green checkmark
# Expected: URL validates ✓

# Test invalid URL:
# Paste: https://httpstat.us/404
# Expected: Error message appears ✓
```

---

## 5️⃣ Test Direct Browser Upload (2 minutes)

```bash
# 1. Visit http://localhost:3000/dashboard/new
# 2. Find "📤 Direct Browser Upload" section
# 3. Select an image file from your computer
# 4. Preview appears immediately
# 5. Click "📤 Upload to Blob"
# 6. Wait for success message
# Expected: 
#   - Upload success ✓
#   - URL shown ✓
#   - URL is publicly accessible ✓

# Test via API directly:
# Create test image
convert -size 400x500 xc:blue test-image.jpg

# Upload via API
curl -X POST "http://localhost:3000/api/upload/image?filename=test.jpg" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-image.jpg \
  -b cookies.txt

# Expected response:
# {
#   "url": "https://xxx.public.blob.vercel-storage.com/...",
#   "pathname": "...",
#   "contentType": "image/jpeg"
# }
```

---

## 6️⃣ Test Mobile Responsiveness (30 seconds)

```bash
# In DevTools:
# 1. Press F12 to open DevTools
# 2. Press Ctrl+Shift+M to toggle device toolbar
# 3. Select "iPhone 12"
# 4. Visit http://localhost:3000/dashboard/new
# 5. Check tabs fit without horizontal scroll
# Expected:
#   - Tabs show "📤 Upload" / "🔗 URL"
#   - No horizontal scroll ✓
#   - Form inputs full width ✓
```

---

## 7️⃣ Check Analytics Setup (instant)

```bash
# In DevTools Console:
console.log(window.__vercel_insights__)

# Expected: Object or undefined (loads after build)
# Once deployed to Vercel:
# Check vercel.com/dashboard → Project → Analytics
```

---

## ✅ Test Checklist (5 minutes total)

- [ ] Login works (30s)
- [ ] Translation converts text (1m)
- [ ] Image URL validates (1m)
- [ ] Direct upload works (2m)
- [ ] Mobile responsive (30s)

---

## 📊 What Gets Tracked (Free Vercel Plan)

### Analytics
- ✓ Page views
- ✓ Unique visitors
- ✓ Device types
- ✓ Geographic data
- ✓ Referrers
- ✓ Top pages

### Speed Insights
- ✓ Largest Contentful Paint (LCP)
- ✓ First Input Delay (FID)
- ✓ Cumulative Layout Shift (CLS)
- ✓ Page load time
- ✓ Response time

---

## 🔧 Useful DevTools Tricks

### Check Image Upload Success
```javascript
// After uploading, in Console:
fetch('YOUR_BLOB_URL')
  .then(r => r.blob())
  .then(b => console.log('✓ File exists!', b.size, 'bytes'))
  .catch(e => console.error('✗ File not found', e))
```

### Check Session Cookie
```javascript
// In Console:
console.log(document.cookie)
// Should contain: erki_admin=...
```

### Monitor Upload Progress
```javascript
// Network tab (F12 → Network → Upload request)
// Shows upload size, time, and status
```

### View Analytics Loading
```javascript
// Network tab → XHR/Fetch
// Filter by "vercel"
// See analytics requests being sent
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Login fails | Check password is `01533` |
| Translation fails | Check HTTPS is not required (dev uses HTTP) |
| URL won't validate | Use public image URL (e.g., picsum.photos) |
| Upload fails | Check file size < 5MB |
| Analytics not showing | Wait 5+ minutes, must be on Vercel production |

---

## 📱 Quick Commands Reference

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run tests (if configured)
npm test

# Check types
npm run typecheck

# Lint code
npm run lint
```

---

## 🌐 URLs to Test

| Feature | URL |
|---------|-----|
| Home | http://localhost:3000 |
| Login | http://localhost:3000/dashboard/login |
| Dashboard | http://localhost:3000/dashboard |
| Create Meme | http://localhost:3000/dashboard/new |
| Analytics (after deploy) | vercel.com/dashboard |

---

## 📝 Example Test Results

### Successful Login
```
✓ Status: 200 OK
✓ Redirect: /dashboard
✓ Cookie: erki_admin=...
✓ Page: Dashboard loaded
```

### Successful Translation
```
✓ Status: 200 OK
✓ Input: আমি বাংলা ভালোবাসি
✓ Output: I love Bengali
✓ Time: < 2 seconds
```

### Successful Upload
```
✓ Status: 201 Created
✓ URL: https://xxx.public.blob.vercel-storage.com/...
✓ Size: 500KB
✓ Publicly accessible: ✓
```

### Successful Analytics
```
✓ Pageview tracked
✓ Device: Desktop/Mobile
✓ Location: Detected
✓ Time: Real-time on Vercel dashboard
```

---

**That's it! You've tested all major features in ~5 minutes!** 🎉

For detailed testing, see `TESTING_GUIDE.md`
