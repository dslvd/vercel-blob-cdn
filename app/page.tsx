'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>CDN Uploader</h1>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        Choose File
      </button>

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
