import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { blobToken } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  // Verify admin access
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename parameter' },
        { status: 400 }
      );
    }

    // Validate filename
    if (filename.length > 255) {
      return NextResponse.json(
        { error: 'Filename too long' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob with public access
    const blob = await put(filename, request.body as ReadableStream<Uint8Array>, {
      access: 'public', // Make publicly accessible
      addRandomSuffix: true, // Add random suffix to prevent collisions
      token: blobToken(),
    });

    return NextResponse.json(
      {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        contentDisposition: blob.contentDisposition,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
