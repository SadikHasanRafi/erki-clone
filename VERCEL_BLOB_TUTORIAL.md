# 🪣 Vercel Blob Storage - Complete Tutorial

## Table of Contents
1. [What is Vercel Blob?](#what-is-vercel-blob)
2. [Setup & Configuration](#setup--configuration)
3. [Getting Your Token](#getting-your-token)
4. [Implementation](#implementation)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## What is Vercel Blob?

**Vercel Blob** is a simple, scalable cloud storage solution that integrates seamlessly with Vercel deployments. Think of it as a CDN-backed file storage system.

### Key Features
- 🚀 **Fast CDN delivery** - Files served globally from edge servers
- 📦 **Automatic scaling** - No capacity limits or configuration needed
- 🔒 **Secure** - Files protected with access tokens
- 💰 **Pay-as-you-go** - Only pay for what you use
- 🌍 **Global distribution** - Files cached worldwide
- 🔗 **Direct URLs** - Get shareable public URLs for files
- 🗑️ **Easy deletion** - Remove files when no longer needed

---

## Setup & Configuration

### Step 1: Install the Package

The package is already installed in your project:

```bash
npm list @vercel/blob
```

If not installed, add it:

```bash
npm install @vercel/blob
```

### Step 2: Get a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub/GitLab/Bitbucket
3. Create or select a project

### Step 3: Add Environment Variable

You need to set the `VERCEL_BLOB_READ_WRITE_TOKEN` in your `.env` file.

---

## Getting Your Token

### Option A: Via Vercel Dashboard (Recommended)

#### For Local Development:

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Open Project Settings:**
   - Click "Settings" tab
   - Go to "Storage" → "Blob"

3. **Create a New Bucket:**
   - Click "Create New Bucket"
   - Give it a name (e.g., `erki-meme-storage`)
   - Select region (closest to your users)
   - Click "Create"

4. **Get the Token:**
   - After bucket is created, click on it
   - Go to "API Tokens" tab
   - Click "Create Token"
   - Copy the **Read/Write Token**

5. **Add to `.env` File:**
   ```
   VERCEL_BLOB_READ_WRITE_TOKEN=your_token_here_very_long_string
   ```

6. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

#### For Production (When Deployed):

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add `VERCEL_BLOB_READ_WRITE_TOKEN` with your token
4. Make sure it's available in Production environment
5. Redeploy your project

---

## Implementation

### Current Implementation in Your Project

Your project uses Vercel Blob in `src/lib/uploads.ts`:

```typescript
import { put, del } from "@vercel/blob";

export async function saveImage(file: File): Promise<string> {
  const name = `${randomUUID()}.${ALLOWED_IMAGE_TYPES[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Upload to Vercel Blob
  const blob = await put(name, buffer, {
    access: "public",           // Make file publicly accessible
    contentType: file.type,      // Set correct MIME type
  });
  
  return blob.url;              // Return the CDN URL
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl);        // Delete from Vercel Blob
  } catch {
    // Ignore if already deleted
  }
}
```

---

## Usage Examples

### Example 1: Upload an Image File

**Frontend (React Component):**

```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", "My Meme");
  formData.append("category", "Random");
  
  const response = await fetch("/api/admin/memes", {
    method: "POST",
    body: formData,
  });
  
  const data = await response.json();
  console.log("Image saved to:", data.meme.imageUrl);
  // Output: https://xxxxxxx.public.blob.vercel-storage.com/image-abc123.jpg
};
```

**Backend (API Route):**

```typescript
// src/app/api/admin/memes/route.ts
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image") as File;
  
  // Save to Vercel Blob
  const imageUrl = await saveImage(image);
  
  // Store URL in MongoDB
  const meme = await createMeme({
    title: form.get("title"),
    category: form.get("category"),
    // ... other fields
  }, imageUrl);
  
  return NextResponse.json({ meme }, { status: 201 });
}
```

### Example 2: Upload with Custom Folder Structure

```typescript
export async function saveImage(file: File, folder: string = "memes"): Promise<string> {
  const timestamp = Date.now();
  const name = `${folder}/${timestamp}-${randomUUID()}.jpg`;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(name, buffer, {
    access: "public",
    contentType: file.type,
  });
  
  return blob.url;
}

// Usage:
const imageUrl = await saveImage(file, "memes/2024");
// Result: https://xxx.public.blob.vercel-storage.com/memes/2024/timestamp-uuid.jpg
```

### Example 3: Upload with Metadata

```typescript
export async function saveImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const blob = await put(
    `${randomUUID()}.${getExtension(file.type)}`,
    buffer,
    {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      // Metadata for tracking
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        size: file.size,
      },
    }
  );
  
  return blob.url;
}
```

### Example 4: Delete an Image

```typescript
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract pathname from full URL
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    
    // Delete from Vercel Blob
    await del(imageUrl);
    
    console.log(`Deleted: ${pathname}`);
  } catch (error) {
    console.error("Failed to delete image:", error);
    // Don't throw - file might already be deleted
  }
}

// Usage:
await deleteImage("https://xxx.public.blob.vercel-storage.com/image.jpg");
```

### Example 5: Upload and Get Progress

```typescript
export async function uploadWithProgress(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Note: Vercel Blob doesn't have built-in progress tracking
  // For progress, you would need to use XHR or fetch with progress events
  
  onProgress?.(50); // Simulate progress
  
  const blob = await put(
    `${randomUUID()}.${ALLOWED_IMAGE_TYPES[file.type]}`,
    buffer,
    { access: "public", contentType: file.type }
  );
  
  onProgress?.(100);
  return blob.url;
}
```

---

## Best Practices

### 1. ✅ Always Use Random Filenames

```typescript
// ✅ GOOD: Random UUID prevents collisions
const filename = `${randomUUID()}.jpg`;
await put(filename, buffer, { access: "public" });

// ❌ BAD: Predictable names cause overwrites
const filename = `image.jpg`;
await put(filename, buffer, { access: "public" });
```

### 2. ✅ Set Correct Content Type

```typescript
// ✅ GOOD: Helps with CDN caching and browser handling
await put(name, buffer, {
  contentType: file.type, // "image/jpeg"
});

// ❌ BAD: Missing content type
await put(name, buffer);
```

### 3. ✅ Handle Upload Errors

```typescript
// ✅ GOOD: Proper error handling
try {
  const blob = await put(name, buffer, { access: "public" });
  return blob.url;
} catch (error) {
  if (error instanceof Error) {
    console.error("Upload failed:", error.message);
    throw new Error("Failed to save image");
  }
}

// ❌ BAD: No error handling
const blob = await put(name, buffer);
return blob.url;
```

### 4. ✅ Validate File Size Before Upload

```typescript
// ✅ GOOD: Check before uploading
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

if (file.size > MAX_SIZE) {
  throw new Error("File too large");
}

const blob = await put(name, buffer, { access: "public" });

// ❌ BAD: Upload first, validate later
const blob = await put(name, buffer);
```

### 5. ✅ Organize Files with Prefixes

```typescript
// ✅ GOOD: Organize by category
const filename = `memes/${category}/${Date.now()}-${uuid}.jpg`;
await put(filename, buffer, { access: "public" });

// Organization:
// memes/
//   ├── cricket/
//   │   ├── 1697...jpg
//   │   └── 1698...jpg
//   ├── politics/
//   │   └── 1697...jpg
//   └── ...

// ❌ BAD: All files in root
const filename = `${uuid}.jpg`;
```

### 6. ✅ Store URLs in Database, Not Files

```typescript
// ✅ GOOD: Store URL in MongoDB
const imageUrl = await saveImage(file);
await db.collection("memes").insertOne({
  title: "My Meme",
  imageUrl: imageUrl, // Store the URL
  // ...
});

// ❌ BAD: Storing entire file in DB
const fileBuffer = await file.arrayBuffer();
await db.collection("memes").insertOne({
  title: "My Meme",
  imageData: fileBuffer, // Don't do this!
});
```

### 7. ✅ Clean Up When Deleting

```typescript
// ✅ GOOD: Delete from Vercel when removing from DB
export async function deleteMeme(id: string) {
  const meme = await getMemeById(id);
  
  // Delete from Vercel Blob
  if (meme.imageUrl) {
    await deleteImage(meme.imageUrl);
  }
  
  // Delete from MongoDB
  await db.collection("memes").deleteOne({ _id: id });
}

// ❌ BAD: Only delete from DB, orphan files in storage
export async function deleteMeme(id: string) {
  await db.collection("memes").deleteOne({ _id: id });
  // Image still in Vercel, wasting storage!
}
```

### 8. ✅ Use Public Access for User-Facing Files

```typescript
// ✅ GOOD: Make images public so they load in browser
await put(name, buffer, {
  access: "public", // Anyone can access via URL
});

// ❌ BAD: Private files won't load in <img> tags
await put(name, buffer, {
  access: "private", // Only accessible with token
});
```

---

## Storage Limits & Pricing

### Storage Tiers

| Plan | Storage | Transfer | Price |
|------|---------|----------|-------|
| **Free** | 1 GB | 100 GB/mo | Free |
| **Pro** | Unlimited | $0.50/GB overage | $20/mo |
| **Enterprise** | Unlimited | Custom | Custom |

### For Your Meme Project

**Estimate (1000 memes):**
- Average image: 500 KB
- Total storage: 500 MB (Free tier ✅)
- Monthly transfer: ~50 GB (Free tier ✅)

---

## Environment Variables Checklist

### Development (.env.local)

```bash
# Get this from Vercel Dashboard
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxx
```

### Production (Vercel Dashboard)

1. Go to Project Settings
2. Environment Variables
3. Add `VERCEL_BLOB_READ_WRITE_TOKEN`
4. Set it for **Production** environment
5. Redeploy

### Verify It's Working

```bash
# Test the connection
npm run dev

# Upload a test image through dashboard
# Check if image appears in Vercel Blob

# Check the stored URL
# Should be: https://xxx.public.blob.vercel-storage.com/...
```

---

## Troubleshooting

### Issue 1: "VERCEL_BLOB_READ_WRITE_TOKEN is not set"

**Problem:** Token not found in environment

**Solution:**
```bash
# Check if token is in .env
cat .env | grep VERCEL_BLOB

# Restart dev server
npm run dev

# Verify token is present
echo $VERCEL_BLOB_READ_WRITE_TOKEN
```

### Issue 2: "Access denied" on Production

**Problem:** Token works locally but not on Vercel

**Solution:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Make sure `VERCEL_BLOB_READ_WRITE_TOKEN` is set
5. Select **Production** environment
6. Redeploy: `vercel --prod`

### Issue 3: "File too large"

**Problem:** Upload fails with size error

**Solution:**
```typescript
// Check file size before upload
if (file.size > 5 * 1024 * 1024) {
  throw new Error("File must be under 5 MB");
}
```

### Issue 4: "URL returns 404"

**Problem:** Image URL works in code but returns 404

**Solution:**
1. Check `access: "public"` is set ✅
2. Wait a few seconds for CDN cache
3. Try incognito mode (clear browser cache)
4. Check file actually uploaded in Vercel Dashboard

### Issue 5: Images Slow on Load

**Problem:** Images take long to load

**Solution:**
1. ✅ Verify `contentType` is set correctly
2. ✅ Use appropriate image format (JPEG for photos)
3. ✅ Compress images before upload
4. ✅ Use CDN URLs (already done by Vercel Blob)

---

## Advanced: Direct Upload from Browser

For larger scale apps, allow browsers to upload directly:

```typescript
// Get a signed URL from your backend
export async function POST(request: Request) {
  const { filename } = await request.json();
  
  // Generate a signed URL for direct uploads
  const response = await fetch(
    "https://blob.vercel-storage.com/api/upload",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VERCEL_BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    }
  );
  
  const { url } = await response.json();
  return NextResponse.json({ url });
}
```

Then use that URL to upload directly from browser.

---

## Summary

### Quick Reference

| Action | Code |
|--------|------|
| **Upload** | `await put(name, buffer, { access: "public" })` |
| **Delete** | `await del(url)` |
| **Get Token** | Vercel Dashboard → Storage → Blob → API Tokens |
| **Set Token** | `VERCEL_BLOB_READ_WRITE_TOKEN=xxx` in `.env` |
| **Verify** | Upload test image, check Vercel Dashboard |

### Files to Reference

- **Implementation:** `src/lib/uploads.ts`
- **API Route:** `src/app/api/admin/memes/route.ts`
- **Form Component:** `src/components/dashboard/MemeForm.tsx`

### Next Steps

1. ✅ Get your Vercel Blob token
2. ✅ Add to `.env` file
3. ✅ Restart dev server
4. ✅ Upload a test meme
5. ✅ Check image appears in post
6. ✅ Deploy to production
7. ✅ Add token to Vercel production env vars

---

## Resources

- 📖 [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- 🔗 [Vercel Blob API](https://blob.vercel-storage.com)
- 💬 [Vercel Community](https://vercel.com/help/contact)
- 📚 [Next.js & Vercel Integration](https://nextjs.org/docs/getting-started/deployment)

---

**Your Erki Meme CRM is ready to use Vercel Blob storage!** 🚀
