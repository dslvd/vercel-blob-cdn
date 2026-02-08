'use client';

import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';

interface UploadRecord {
  url: string;
  filename: string;
  timestamp: number;
  size: number;
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publicHistory, setPublicHistory] = useState<UploadRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load public history on mount
  useEffect(() => {
    fetchPublicHistory();
  }, []);

  const fetchPublicHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setPublicHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const blob = await upload(`cdn/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      const newUrl = `${window.location.origin}/${blob.pathname}`;
      setUploadedFiles(prev => [newUrl, ...prev]);

      // Add to public history via API
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          filename: file.name,
          size: file.size
        })
      });

      // Refresh history
      await fetchPublicHistory();
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #0a0a0a;
          color: #f5f5f0;
          font-family: 'Montserrat', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(88, 101, 242, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(88, 101, 242, 0.06) 0%, transparent 50%);
          animation: bgRotate 20s linear infinite;
          z-index: -1;
        }

        @keyframes bgRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(88, 101, 242, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 101, 242, 0.8);
        }
      `}} />

      <main style={{ 
        padding: '4rem 6vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #5865F2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '2rem',
          animation: 'fadeSlideIn 1s ease-out',
          textAlign: 'center'
        }}>
          CDN Uploader
        </h1>

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
            fontFamily: "'Montserrat', sans-serif",
            padding: '0.75rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: uploading ? '#666666' : '#f5f5f0',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid',
            borderColor: uploading ? '#666666' : '#f5f5f0',
            borderRadius: '50px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeSlideIn 1s ease-out 0.2s backwards',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#5865F2';
              e.currentTarget.style.color = '#0a0a0a';
              e.currentTarget.style.background = '#5865F2';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#f5f5f0';
              e.currentTarget.style.color = '#f5f5f0';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>

        {uploading && (
          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#666666',
            fontStyle: 'italic',
            animation: 'fadeSlideIn 0.5s ease-out'
          }}>
            Uploading…
          </p>
        )}

        {uploadedFiles.length > 0 && (
          <div style={{
            marginTop: '2rem',
            animation: 'fadeSlideIn 0.8s ease-out',
            width: '100%',
            maxWidth: '800px'
          }}>
            <p style={{
              fontSize: '1rem',
              marginBottom: '1rem',
              color: '#5865F2',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              ✅ Your Uploads ({uploadedFiles.length})
            </p>
            
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              {uploadedFiles.map((url, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: index < uploadedFiles.length - 1 ? '0.75rem' : '0',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onClick={() => copyToClipboard(url)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)';
                    e.currentTarget.style.borderColor = '#5865F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        color: '#f5f5f0',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        flex: 1
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {url}
                    </a>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#5865F2',
                      whiteSpace: 'nowrap',
                      opacity: 0.8
                    }}>
                      Click to copy
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <p style={{
              marginTop: '0.75rem',
              opacity: 0.7,
              fontSize: '0.8rem',
              color: '#666666',
              textAlign: 'center'
            }}>
              Click any URL to copy to clipboard
            </p>
          </div>
        )}

        {/* Public Upload History */}
        <div style={{
          marginTop: '3rem',
          width: '100%',
          maxWidth: '800px',
          animation: 'fadeSlideIn 1s ease-out 0.4s backwards'
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#f5f5f0'
          }}>
            📁 Public Upload History
          </h2>

          {loadingHistory ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666666',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              Loading history...
            </div>
          ) : publicHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#666666'
            }}>
              No uploads yet.
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              {publicHistory.map((record, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: index < publicHistory.length - 1 ? '0.75rem' : '0',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onClick={() => copyToClipboard(record.url)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)';
                    e.currentTarget.style.borderColor = '#5865F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#f5f5f0',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-all'
                      }}>
                        {record.filename}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#666666',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>{formatFileSize(record.size)}</span>
                        <span>•</span>
                        <span>{formatTimestamp(record.timestamp)}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#5865F2',
                      whiteSpace: 'nowrap',
                      opacity: 0.8
                    }}>
                      📋 Copy
                    </span>
                  </div>
                  <a 
                    href={record.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      color: '#5865F2',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      opacity: 0.7
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.url}
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <p style={{
            marginTop: '0.75rem',
            opacity: 0.7,
            fontSize: '0.8rem',
            color: '#666666',
            textAlign: 'center'
          }}>
            Showing {publicHistory.length} recent uploads • Click to copy URL
          </p>
        </div>
      </main>
    </>
  );
}