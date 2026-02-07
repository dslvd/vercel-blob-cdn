import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      return {
        // optional but recommended
        addRandomSuffix: false,
        allowOverwrite: false,
        // set limits (adjust if you want)
        maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        // allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'], // uncomment if you want to restrict

        tokenPayload: JSON.stringify({ pathname }),
      };
    },
    onUploadCompleted: async ({ blob }) => {
      console.log('Upload completed:', blob.url);
    },
  });

  return NextResponse.json(jsonResponse);
}
