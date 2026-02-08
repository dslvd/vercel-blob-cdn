import { NextRequest, NextResponse } from 'next/server';

interface UploadRecord {
  url: string;
  filename: string;
  timestamp: number;
  size: number;
}

// This would ideally be stored in a database, but for simplicity we'll use persistent storage
// For production, use a database like Vercel KV, PostgreSQL, or similar
export async function GET() {
  try {
    // In a real implementation, fetch from database
    // For now, using Vercel KV or similar would be ideal
    
    const history = await getHistoryFromStorage();
    
    return NextResponse.json({ 
      history,
      count: history.length 
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ 
      history: [],
      error: 'Failed to fetch history' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, filename, size } = body;

    if (!url || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const record: UploadRecord = {
      url,
      filename,
      size: size || 0,
      timestamp: Date.now()
    };

    await addToHistory(record);

    return NextResponse.json({ 
      success: true,
      record 
    });
  } catch (error) {
    console.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to add to history' },
      { status: 500 }
    );
  }
}

// Storage helper functions
// Replace these with actual database calls in production

async function getHistoryFromStorage(): Promise<UploadRecord[]> {
  // For production, use Vercel KV:
  // const kv = createClient({ ... });
  // const history = await kv.get('upload_history') || [];
  // return history;
  
  // Or use Vercel Postgres:
  // const { rows } = await sql`SELECT * FROM uploads ORDER BY timestamp DESC LIMIT 100`;
  // return rows;
  
  // Temporary in-memory storage (resets on deployment)
  if (typeof global.uploadHistory === 'undefined') {
    global.uploadHistory = [];
  }
  
  // Return last 100 uploads, sorted by newest first
  return (global.uploadHistory as UploadRecord[])
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);
}

async function addToHistory(record: UploadRecord): Promise<void> {
  // For production, use Vercel KV:
  // const kv = createClient({ ... });
  // const history = await kv.get('upload_history') || [];
  // history.unshift(record);
  // await kv.set('upload_history', history.slice(0, 100));
  
  // Or use Vercel Postgres:
  // await sql`INSERT INTO uploads (url, filename, size, timestamp) VALUES (${record.url}, ${record.filename}, ${record.size}, ${record.timestamp})`;
  
  // Temporary in-memory storage
  if (typeof global.uploadHistory === 'undefined') {
    global.uploadHistory = [];
  }
  
  (global.uploadHistory as UploadRecord[]).unshift(record);
  
  // Keep only last 100
  if ((global.uploadHistory as UploadRecord[]).length > 100) {
    global.uploadHistory = (global.uploadHistory as UploadRecord[]).slice(0, 100);
  }
}

// Type declaration for global storage
declare global {
  var uploadHistory: UploadRecord[] | undefined;
}