import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Convert the proxied URL to the actual blob storage URL
    // url format: http://localhost:3000/d/filename.ext or https://relaycdn.vercel.app/d/filename.ext
    // We need: https://rcltxppgseuupozb.public.blob.vercel-storage.com/d/filename.ext
    const urlObj = new URL(url);
    const blobUrl = `https://rcltxppgseuupozb.public.blob.vercel-storage.com${urlObj.pathname}`;

    // Delete from Vercel Blob storage
    await del(blobUrl);

    // Remove from history
    if (typeof global.uploadHistory !== 'undefined') {
      global.uploadHistory = (global.uploadHistory as any[]).filter(
        (record: any) => record.url !== url
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear_all') {
      // Clear all history
      if (typeof global.uploadHistory !== 'undefined') {
        const urlsToDelete = [...(global.uploadHistory as any[])];
        
        // Delete all files from blob storage
        for (const record of urlsToDelete) {
          try {
            // Convert proxied URL to blob storage URL
            const urlObj = new URL(record.url);
            const blobUrl = `https://rcltxppgseuupozb.public.blob.vercel-storage.com${urlObj.pathname}`;
            await del(blobUrl);
          } catch (err) {
            console.error('Failed to delete:', record.url, err);
          }
        }
        
        global.uploadHistory = [];
      }

      return NextResponse.json({ 
        success: true,
        message: 'All files deleted successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in admin operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform operation' },
      { status: 500 }
    );
  }
}
