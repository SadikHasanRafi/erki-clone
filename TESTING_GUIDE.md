# 🧪 Testing Guide - Erki Meme CRM

Complete testing guide for all features including Vercel Blob uploads, analytics, and speed insights.

---

## Table of Contents
1. [Setup for Testing](#setup-for-testing)
2. [Test Scenarios](#test-scenarios)
3. [Vercel Blob Upload Testing](#vercel-blob-upload-testing)
4. [Analytics & Speed Insights Testing](#analytics--speed-insights-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Troubleshooting](#troubleshooting)

---

## Setup for Testing

### Prerequisites

```bash
# Ensure you have all dependencies
npm install

# Make sure .env is configured
cat .env | grep -E "PASSWORD|VERCEL_BLOB|SESSION_SECRET|MONGODB"
```

### Required Environment Variables

```env
PASSWORD=01533
SESSION_SECRET=test-secret-key
MONGODB_URI=your-mongodb-connection
VERCEL_BLOB_READ_WRITE_TOKEN=your-token-here
```

### Start Dev Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

---

## Test Scenarios

### Scenario 1: Login Flow ✅

**Steps:**
1. Visit http://localhost:3000/dashboard/login
2. Enter password: `01533`
3. Click "Log in"

**Expected Results:**
- ✓ Redirect to dashboard
- ✓ Session cookie created (check DevTools → Application → Cookies)
- ✓ Can see dashboard page

**How to Test in Browser:**
```javascript
// Open DevTools Console (F12)
// Check if session exists:
console.log(document.cookie);
// Should contain: erki_admin=...
```

---

### Scenario 2: Form Validation 🛡️

**Test Invalid Inputs:**

| Field | Test Value | Expected |
|-------|-----------|----------|
| Title | (empty) | Error: "Title is required" |
| Title | 121+ chars | Error: "max 120 characters" |
| Description | 1001+ chars | Error: "max 1000 characters" |
| Category | Invalid | Error: "invalid category" |
| Image | None | Error: "Please choose image" |

**How to Test:**
1. Go to `/dashboard/new`
2. Leave title empty
3. Click "Upload meme"
4. Should see error message at top

---

### Scenario 3: Translation Feature 🌐

**Test Bangla to English Translation:**

**Steps:**
1. Go to `/dashboard/new`
2. In title field, enter: `আমার প্রিয় খাবার`
3. Click "🌐 Translate to English" button
4. Wait for loading spinner to finish

**Expected Results:**
- ✓ Loading spinner appears
- ✓ Title changes to translated text (e.g., "My favorite food")
- ✓ No errors in console

**Test Cases:**

```
Input: আমি বাংলা ভালোবাসি
Expected: I love Bengali

Input: এটি একটি মজার মেম
Expected: This is a fun meme

Input: আপনার নাম কি?
Expected: What is your name?
```

**How to Debug:**
```javascript
// Open DevTools → Network tab
// Filter by "translate"
// Check request/response payloads
```

---

### Scenario 4: Image Upload (Traditional) 📤

**Steps:**
1. Go to `/dashboard/new`
2. Click tab "📤 Upload" (should be selected by default)
3. Click on file input
4. Select an image (JPG, PNG, WEBP, GIF)
5. Image preview appears
6. Fill other form fields
7. Click "Upload meme"

**Expected Results:**
- ✓ Image preview shows in preview area
- ✓ Form submits successfully
- ✓ Redirect to dashboard
- ✓ New meme appears in list

**Test Files to Use:**

```bash
# Create test images
mkdir -p /tmp/test-images

# Small valid image (using ImageMagick)
convert -size 400x500 xc:blue /tmp/test-images/valid.jpg

# Large image (should fail)
convert -size 2000x3000 xc:red /tmp/test-images/large.jpg

# Wrong format
echo "not an image" > /tmp/test-images/fake.pdf
```

---

### Scenario 5: Image URL Input 🔗

**Steps:**
1. Go to `/dashboard/new`
2. Click tab "🔗 URL"
3. Paste image URL: `https://picsum.photos/400/500`
4. Wait for validation spinner
5. See green checkmark when valid
6. Fill other form fields
7. Click "Upload meme"

**Expected Results:**
- ✓ Validation spinner appears
- ✓ Green checkmark when valid
- ✓ URL accessible from browser
- ✓ Form submits successfully
- ✓ Image appears in post using external URL

**Test URLs:**

```
✓ Valid URLs:
- https://picsum.photos/400/500
- https://via.placeholder.com/400x500
- https://i.imgur.com/anything.jpg

✗ Invalid URLs:
- https://invalid-domain-12345.com/image.jpg
- https://example.com/notanimage.txt
- http://broken-link.com/ (404)
```

**How to Test Invalid URLs:**
1. Paste: `https://httpstat.us/404`
2. Wait for spinner
3. Should show error: "Image not found or not accessible"

---

### Scenario 6: Direct Browser Upload (New!) 📤✨

**New Feature: BrowserImageUpload Component**

**Steps:**
1. Go to `/dashboard/new`
2. Scroll down to find "📤 Direct Browser Upload" section
3. Click file input
4. Select an image
5. Image preview appears
6. Click "📤 Upload to Blob" button
7. Wait for loading spinner

**Expected Results:**
- ✓ Preview image shows
- ✓ Upload spinner appears
- ✓ Success message with URL
- ✓ URL is publicly accessible
- ✓ Can view file by clicking link

**How to Test:**

```javascript
// In DevTools Console, after successful upload:
// The URL should load
fetch('YOUR_BLOB_URL')
  .then(r => r.blob())
  .then(blob => console.log('File exists!', blob.size, 'bytes'))
```

---

## Vercel Blob Upload Testing

### Test 1: Basic Upload via API

```bash
# Get your Vercel Blob token first
TOKEN="your-token-here"

# Create a test image
curl https://picsum.photos/400/500 -o test-image.jpg

# Upload via API endpoint
curl -X POST "http://localhost:3000/api/upload/image?filename=test.jpg" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-image.jpg

# Expected response:
# {
#   "url": "https://xxx.public.blob.vercel-storage.com/test-xxx.jpg",
#   "pathname": "test-xxx.jpg",
#   "contentType": "image/jpeg",
#   "contentDisposition": "..."
# }
```

### Test 2: Large File Rejection

```bash
# Create a 10 MB test file
dd if=/dev/zero bs=1M count=10 of=/tmp/large.bin

# Try to upload (should fail with 400 error)
curl -X POST "http://localhost:3000/api/upload/image?filename=large.bin" \
  --data-binary @/tmp/large.bin

# Expected: 400 Bad Request or stream error
```

### Test 3: File Retrieval

```bash
# After uploading, test retrieval
BLOB_URL="https://xxx.public.blob.vercel-storage.com/image-xxx.jpg"

# Should load in browser
curl -I $BLOB_URL
# Expected: HTTP 200 OK
```

### Test 4: File Deletion

**Method 1: Via Dashboard**
1. Go to dashboard
2. Find a meme with uploaded image
3. Click edit
4. Delete the meme
5. Check Vercel dashboard - file should be removed

**Method 2: Via API**

```javascript
// In app, when deleting a meme
// The deleteImage() function calls del() from @vercel/blob
// This removes file from Vercel Blob storage
```

---

## Analytics & Speed Insights Testing

### Test 1: Verify Analytics is Loaded

**In Browser DevTools:**

```javascript
// Open Console (F12)
// Check if Analytics script loaded:
console.log(window.__vercel_insights__)

// Should log an object if loaded
```

**Vercel Dashboard:**
1. Go to vercel.com/dashboard
2. Select your project
3. Go to "Analytics" tab
4. Should see data after 5+ minutes

### Test 2: Track Page Views

**Steps:**
1. Start dev server
2. Visit different pages:
   - `/` (home)
   - `/dashboard/login` (login)
   - `/dashboard` (dashboard)
   - `/meme/[slug]` (meme detail)
3. Wait 5-10 minutes
4. Check Vercel Dashboard → Analytics

**Expected Metrics:**
- ✓ Page views tracked
- ✓ Unique visitors counted
- ✓ Geographic data shown
- ✓ Device types identified

### Test 3: Speed Insights Metrics

**Test Page Load Performance:**

```javascript
// DevTools Console
// Check Core Web Vitals:
console.log(window.__VERCEL_SPEED_INSIGHTS__)

// Also visible in Lighthouse report:
// DevTools → Lighthouse → Generate report
```

**Local Performance Check:**

```bash
# Using curl to measure response time
time curl http://localhost:3000/dashboard

# Measure dashboard load:
# Should be < 1 second
```

---

## Performance Testing

### Load Test

```bash
# Using Apache Bench (ab)
# Install: apt-get install apache2-utils

# Test dashboard endpoint
ab -n 100 -c 10 http://localhost:3000/dashboard/login

# Test upload endpoint
ab -n 50 -c 5 http://localhost:3000/api/admin/memes
```

### Memory Test

```bash
# Monitor memory usage
npm run dev

# In another terminal, check Node memory:
ps aux | grep node

# Should remain stable (not growing continuously)
```

### Database Test

```javascript
// In your app, create 1000 memes
// Check if queries are fast

// Monitor slow queries:
// Add logging to lib/store.ts
```

---

## Security Testing

### Test 1: Authentication Bypass

**Attempt:**
1. Try accessing `/dashboard` without login
2. Should redirect to `/dashboard/login`

**Code:**
```bash
curl -L http://localhost:3000/dashboard
# Should show login form, not dashboard
```

### Test 2: Wrong Password

**Steps:**
1. Go to login page
2. Enter wrong password (e.g., `wrong123`)
3. Click "Log in"

**Expected:**
- ✓ Error message appears
- ✓ Not redirected to dashboard
- ✓ No session created

### Test 3: Session Expiry

**Steps:**
1. Login successfully
2. Check session cookie expiry time
3. Wait for expiry (12 hours in production, shorter in dev)
4. Try accessing protected page

**Expected:**
- ✓ Session expires after TTL
- ✓ Automatic redirect to login
- ✓ Must login again

**How to Test:**

```javascript
// In console after login:
document.cookie // Check erki_admin token

// Manually set expired token:
// Create a new session to see it work
```

### Test 4: CSRF Protection

```bash
# Attempt form submission from different origin
# Should fail with proper CSRF protection
```

### Test 5: File Access Control

```bash
# Try accessing uploaded files without auth
# Files in Vercel Blob with access: "public" should work
# But admin-only endpoints should require auth
```

---

## Mobile Responsiveness Testing

### Test 1: Tab Responsiveness

**On Mobile (DevTools):**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12"
4. Go to `/dashboard/new`
5. Check tabs shrink correctly

**Expected:**
- ✓ Tabs show "📤 Upload" / "🔗 URL" (short labels)
- ✓ No horizontal scroll on tabs
- ✓ Input fields are full width

### Test 2: Image Preview on Mobile

**Steps:**
1. Upload image on mobile
2. Check preview renders correctly
3. Aspect ratio maintained (4:5)
4. Not distorted

---

## Troubleshooting

### Issue: "VERCEL_BLOB_READ_WRITE_TOKEN is not set"

**Solution:**
```bash
# Check .env file
cat .env | grep VERCEL_BLOB

# If missing, get token from Vercel:
# 1. vercel.com/dashboard
# 2. Project → Storage → Blob
# 3. Create API Token
# 4. Add to .env

# Restart dev server:
npm run dev
```

### Issue: Upload returns 401 Unauthorized

**Solution:**
```bash
# Check if user is authenticated
# Make sure you're logged in first
# Cookie should contain: erki_admin=...

# Try logging out and back in:
# Visit /api/auth/logout
# Then login again
```

### Issue: Image preview won't load

**Solution:**
```bash
# Check image URL is correct
# Open DevTools → Network tab
# Look for image request
# Check status code (should be 200)

# Verify content-type is image/*
# Check CORS headers if external URL
```

### Issue: Analytics not showing data

**Solution:**
```bash
# Analytics takes 5-10 minutes to appear
# Check if Analytics script loaded:
console.log(window.__vercel_insights__)

# For production, ensure project is deployed to Vercel
# Local dev data may not sync to Vercel
```

### Issue: Speed Insights metrics not updating

**Solution:**
```bash
# Speed Insights requires real user data
# Local testing won't show all metrics
# Deploy to production to see full metrics

# Local check:
# Open DevTools → Lighthouse
# Run performance audit
```

---

## Test Checklist

- [ ] Login with correct password
- [ ] Login fails with wrong password
- [ ] Session expires after 12 hours
- [ ] Form validation works
- [ ] Translation converts Bangla to English
- [ ] Image upload preview works
- [ ] Image URL validation works
- [ ] Direct browser upload to Vercel Blob works
- [ ] Uploaded images are publicly accessible
- [ ] Files deleted when meme deleted
- [ ] Mobile tabs responsive
- [ ] Analytics data appears in Vercel Dashboard
- [ ] Speed Insights tracking works
- [ ] No console errors
- [ ] Database operations are fast
- [ ] Large files are rejected

---

## CI/CD Testing (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm run test
```

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load | < 2s | ✓ |
| API Response | < 500ms | ✓ |
| Image Upload | < 5s | ✓ |
| Database Query | < 100ms | ✓ |
| Lighthouse Score | > 90 | 📊 |
| Core Web Vitals | Green | 📊 |

---

**Happy Testing!** 🚀

For issues, check the troubleshooting section or create a GitHub issue.
