import { type NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { requireAdmin } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ⚠️ Authenticate: only admins can view
    const denied = await requireAdmin();
    if (denied) return denied;

    const pathname = request.nextUrl.searchParams.get('pathname');
    if (!pathname) {
      return NextResponse.json(
        { error: 'Missing pathname parameter' },
        { status: 400 }
      );
    }

    // Get file from Vercel Blob
    const blob = await get(pathname, {
      access: 'public',
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    });

    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Stream the file
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.blob?.contentType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('View error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}
