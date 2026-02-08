import { NextRequest, NextResponse } from 'next/server';

interface UploadRecord {
  url: string;
  filename: string;
  timestamp: number;
  size: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Invalid request: urls array required' },
        { status: 400 }
      );
    }

    await removeDeletedFiles(urls);

    return NextResponse.json({ 
      success: true,
      removed: urls.length 
    });
  } catch (error) {
    console.error('Error cleaning up history:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup history' },
      { status: 500 }
    );
  }
}

async function removeDeletedFiles(urls: string[]): Promise<void> {
  // For production, use Vercel KV:
  // const kv = createClient({ ... });
  // const history = await kv.get('upload_history') || [];
  // const filtered = history.filter(record => !urls.includes(record.url));
  // await kv.set('upload_history', filtered);
  
  // Or use Vercel Postgres:
  // await sql`DELETE FROM uploads WHERE url = ANY(${urls})`;
  
  // Temporary in-memory storage
  if (typeof global.uploadHistory === 'undefined') {
    return;
  }
  
  global.uploadHistory = (global.uploadHistory as UploadRecord[]).filter(
    record => !urls.includes(record.url)
  );
}

declare global {
  var uploadHistory: UploadRecord[] | undefined;
}