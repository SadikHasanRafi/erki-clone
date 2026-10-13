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
    const blob = await get(pathname);

    if (!blob) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Stream the file
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.contentType || 'application/octet-stream',
        'Content-Length': blob.size,
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
