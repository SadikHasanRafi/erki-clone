'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';

interface BrowserImageUploadProps {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function BrowserImageUpload({ onSuccess, onError }: BrowserImageUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!inputFileRef.current?.files) {
        throw new Error('No file selected');
      }

      const file = inputFileRef.current.files[0];

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File must be under 5 MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload directly to Vercel Blob via browser
      const response = await fetch(
        `/api/upload/image?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const newBlob = (await response.json()) as PutBlobResult;
      setBlob(newBlob);
      onSuccess?.(newBlob.url);

      // Reset form
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            📤 Direct Browser Upload
          </label>
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            disabled={loading}
            className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-dark disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-zinc-500">JPG, PNG, WEBP, GIF (max 5 MB)</p>
        </div>

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-32 rounded-lg object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>📤 Upload to Blob</>
          )}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Upload Error</p>
              <p className="text-xs text-accent/80 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {blob && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-lg">✓</span>
            <div>
              <p className="font-semibold">Upload Successful!</p>
              <p className="text-xs mt-2 break-all font-mono bg-white px-2 py-1 rounded">
                {blob.url}
              </p>
              <a
                href={blob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-green-700 hover:text-green-800 mt-2 inline-block"
              >
                View File →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
