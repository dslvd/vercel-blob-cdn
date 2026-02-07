'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Vercel Blob “CDN” Uploader</h1>

      <input
        type="file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setUploading(true);
          setUrl('');

          try {
            const blob = await upload(`cdn/${file.name}`, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            });


            setUrl(blob.url);
          } finally {
            setUploading(false);
          }
        }}
      />

      {uploading && <p>Uploading…</p>}

      {url && (
        <>
          <p>✅ Uploaded:</p>
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
          <p style={{ marginTop: 8, opacity: 0.7 }}>
            Use that link as your CDN URL.
          </p>
        </>
      )}
    </main>
  );
}
