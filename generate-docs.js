const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
});

const outputPath = path.join(__dirname, 'ERKI_SETUP_GUIDE.pdf');
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

// Colors
const brandColor = '#1c1917';
const accentColor = '#a16207';
const lightBg = '#f7f6f2';

// Title
doc.fontSize(28).font('Helvetica-Bold').fillColor(brandColor);
doc.text('🎬 ERKI MEME CRM', { align: 'center' });

doc.fontSize(14).font('Helvetica').fillColor('#666').moveDown(0.5);
doc.text('Complete Setup Guide with Smart Image Storage & Translation', { align: 'center' });
doc.moveDown(1.5);

// Authentication Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('🔐 Authentication', { underline: true });
doc.moveDown(0.3);

doc.fontSize(11).font('Helvetica').fillColor('#333');
doc.text('Password: ', { continued: true }).font('Helvetica-Bold').text('01533', { continued: true }).font('Helvetica').text(' (from .env)');
doc.moveDown(0.5);

const features = [
  '12-hour session expiry',
  'HTTP-only secure cookies',
  'HMAC-signed tokens with SHA-256',
  'Automatic logout after 12 hours',
];

features.forEach(f => {
  doc.text('✓ ' + f);
});

doc.moveDown(1);

// Image Storage Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('📸 Image Storage Strategy', { underline: true });
doc.moveDown(0.3);

doc.fontSize(11).font('Helvetica').fillColor('#333');
doc.text('Smart Conditional Storage:');
doc.moveDown(0.5);

// Storage Table
const storageData = [
  ['Source', 'Storage', 'Saved In', 'Benefits'],
  ['📤 File Upload', 'Vercel Blob', 'MongoDB URL', 'CDN Fast, Managed'],
  ['🔗 Image URL', 'External', 'MongoDB URL', 'Zero cost, Direct'],
];

let y = doc.y;
const colWidths = [100, 90, 90, 110];
const startX = 50;

storageData.forEach((row, rowIndex) => {
  let x = startX;
  row.forEach((cell, colIndex) => {
    if (rowIndex === 0) {
      doc.font('Helvetica-Bold').fillColor(brandColor);
    } else {
      doc.font('Helvetica').fillColor('#333');
    }
    doc.fontSize(9);
    doc.text(cell, x, y, { width: colWidths[colIndex], align: 'left' });
    x += colWidths[colIndex];
  });
  y += 30;
  doc.moveTo(startX, y).lineTo(startX + 390, y).stroke('#ccc');
  y += 10;
});

doc.moveDown(2);

// How It Works
doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor);
doc.text('How It Works:');
doc.moveDown(0.3);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const steps = [
  'Upload File: User selects image → Uploaded to Vercel Blob → URL stored in MongoDB',
  'Paste URL: User pastes URL → Validated → URL stored in MongoDB',
  'Preview: Real-time image preview with validation loading spinner',
  'On Delete: Vercel URL deleted from Blob. External URL removed from MongoDB',
];

steps.forEach((step, i) => {
  doc.text(`${i + 1}. ${step}`);
  doc.moveDown(0.3);
});

doc.moveDown(1);

// Translation Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('🌐 Translation Features', { underline: true });
doc.moveDown(0.3);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const translations = [
  'Auto-Translate: Click "Translate to English" to convert Bangla text',
  'Title Translation: Supports up to 120 characters',
  'Description Translation: Translates full descriptions (up to 1000 chars)',
  'No Setup Required: Uses free MyMemory API - no API keys needed',
];

translations.forEach(t => {
  doc.text('✓ ' + t);
  doc.moveDown(0.2);
});

doc.moveDown(1);

// UI/UX Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('🎨 UI/UX Enhancements', { underline: true });
doc.moveDown(0.3);

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.text('Mobile-Responsive Tabs');
doc.moveDown(0.2);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const mobileFeatures = [
  'Tabs shrink labels on mobile (📤 Upload / 🔗 URL)',
  'Horizontal scroll on small screens',
  'Smooth tab switching with transitions',
  'Full-width on desktop',
];

mobileFeatures.forEach(f => {
  doc.text('✓ ' + f);
  doc.moveDown(0.15);
});

doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.text('Image Preview & Validation');
doc.moveDown(0.2);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const previewFeatures = [
  'Live image preview with aspect ratio 4:5',
  'Loading spinner while validating URL',
  'Green checkmark when URL is valid',
  'Error message with warning icon if image fails',
  'Automatic image availability checking',
  'Handles image disappearance gracefully',
];

previewFeatures.forEach(f => {
  doc.text('✓ ' + f);
  doc.moveDown(0.15);
});

doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.text('Animations & Loaders');
doc.moveDown(0.2);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const animations = [
  '✨ Fade-in animation for images',
  '⬆️ Slide-up animation for error messages',
  '⏳ Loading spinner on URL validation',
  '🔄 Pulse animation on image preview loading',
  '💫 Loading state on submit button with spinner',
];

animations.forEach(a => {
  doc.text(a);
  doc.moveDown(0.15);
});

doc.addPage();

// Error Handling Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('📋 Error Handling', { underline: true });
doc.moveDown(0.3);

doc.fontSize(10).font('Helvetica').fillColor('#333');
const errors = [
  'Invalid URL format detection',
  'Image accessibility validation',
  'Image loading failure handling',
  'Network timeout protection (5s timeout)',
  'User-friendly error messages',
  'Form submission prevented if errors exist',
  'Try-catch blocks on all API calls',
];

errors.forEach(e => {
  doc.text('✓ ' + e);
  doc.moveDown(0.15);
});

doc.moveDown(1.5);

// Quick Start Section
doc.fontSize(18).font('Helvetica-Bold').fillColor(brandColor);
doc.text('🚀 Quick Start Guide', { underline: true });
doc.moveDown(0.3);

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.text('1. Login to Dashboard');
doc.moveDown(0.2);

doc.fontSize(9).font('Helvetica').fillColor('#333');
doc.text('Visit: http://localhost:3000/dashboard/login');
doc.text('Password: 01533');
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.text('2. Create a New Meme');
doc.moveDown(0.2);

doc.fontSize(9).font('Helvetica').fillColor('#333');
const createSteps = [
  'Choose Image Method (Upload or URL)',
  'Enter Title (max 120 characters)',
  'Click 🌐 to translate (optional)',
  'Add Description (1-3 sentences, max 1000)',
  'Select Category (Cricket, Politics, etc.)',
  'Add Tags (comma-separated, max 10)',
  'Choose Status (Draft or Published)',
  'Check Featured to show as hero',
  'Click "Upload meme" button',
];

createSteps.forEach((step, i) => {
  doc.text(`${i + 1}. ${step}`);
  doc.moveDown(0.12);
});

doc.moveDown(0.5);

// API Endpoints Section
doc.fontSize(12).font('Helvetica-Bold').fillColor(brandColor);
doc.text('3. API Endpoints');
doc.moveDown(0.2);

doc.fontSize(9).font('Helvetica').fillColor('#333');
const endpoints = [
  ['/api/auth/login', 'POST', 'Login with password'],
  ['/api/admin/memes', 'POST', 'Create new meme'],
  ['/api/admin/memes/[id]', 'PATCH', 'Update meme'],
  ['/api/translate', 'POST', 'Bangla to English'],
  ['/api/validate-image', 'POST', 'Validate image URL'],
];

let epY = doc.y;
endpoints.forEach((ep, i) => {
  doc.text(ep[0], 50, epY, { width: 140, align: 'left' });
  doc.text(ep[1], 190, epY, { width: 50, align: 'left' });
  doc.text(ep[2], 240, epY, { width: 150, align: 'left' });
  epY += 15;
});

doc.moveDown(2.5);

// Summary Section
doc.fontSize(16).font('Helvetica-Bold').fillColor(brandColor);
doc.text('✓ Features Summary', { underline: true });
doc.moveDown(0.3);

doc.fontSize(9).font('Helvetica').fillColor('#333');
const summary = [
  'Password authentication with secure sessions',
  'Dual image input methods (upload & URL)',
  'Smart storage (Vercel for uploads, MongoDB URLs)',
  'Bangla-to-English translation',
  'Real-time image preview with validation',
  'Mobile-responsive tabs',
  'Loading spinners & animations',
  'Comprehensive error handling',
  'Image disappearance detection',
  'Professional UI with smooth transitions',
];

summary.forEach(s => {
  doc.text('✓ ' + s);
  doc.moveDown(0.12);
});

doc.moveDown(1.5);

// Footer
doc.fontSize(10).font('Helvetica').fillColor('#999').text('Generated on ' + new Date().toLocaleDateString(), {
  align: 'center',
});

doc.fontSize(11).font('Helvetica-Bold').fillColor(brandColor);
doc.moveDown(0.5);
doc.text('✓ Your Erki Meme CRM is production-ready!', { align: 'center' });

// Finalize PDF
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF generated successfully!');
  console.log(`📄 File saved to: ${outputPath}`);
  console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
});

stream.on('error', (err) => {
  console.error('Error creating PDF:', err);
  process.exit(1);
});
