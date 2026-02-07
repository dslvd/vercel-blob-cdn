import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        tokenPayload: JSON.stringify({
          pathname: `cdn/${pathname}`,
        }),
      };
    },
    onUploadCompleted: async ({ blob }) => {
      console.log('Upload completed:', blob.url);
    },
  });

  return NextResponse.json(jsonResponse);
}
