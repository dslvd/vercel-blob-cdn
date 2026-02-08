import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = `cdn/${path.join('/')}`;
    
    // Construct the Vercel Blob storage URL
    const blobUrl = `https://rcltxppgseuupozb.public.blob.vercel-storage.com/${pathname}`;
    
    // Redirect to the actual blob URL
    return NextResponse.redirect(blobUrl, { status: 307 });
  } catch (error) {
    console.error('Error proxying file:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = `cdn/${path.join('/')}`;
    const blobUrl = `https://rcltxppgseuupozb.public.blob.vercel-storage.com/${pathname}`;
    
    // Check if file exists
    const response = await fetch(blobUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': response.headers.get('Content-Length') || '0',
        }
      });
    }
    
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    return new NextResponse(null, { status: 404 });
  }
}
