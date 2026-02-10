'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UploadRecord {
  url: string;
  filename: string;
  timestamp: number;
  size: number;
  ip?: string;
}

export default function AdminDashboard() {
  const [files, setFiles] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (!isAuth) {
      router.push('/admin');
      return;
    }

    fetchFiles();
  }, [router]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (url: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      setDeleting(url);
      const response = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const clearAllFiles = async () => {
    if (!confirm('Delete ALL files? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure? All files will be permanently deleted!')) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' })
      });

      if (response.ok) {
        await fetchFiles();
        alert('All files deleted successfully');
      } else {
        alert('Failed to delete files');
      }
    } catch (error) {
      console.error('Failed to clear files:', error);
      alert('Failed to delete files');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_authenticated');
    router.push('/admin');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), #0a0a0a',
      color: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 300,
              marginBottom: '0.5rem'
            }}>
              🛠️ Admin Dashboard
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#666666'
            }}>
              {files.length} files • {formatFileSize(totalSize)} total
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchFiles}
              disabled={loading}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#111111',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 400,
                letterSpacing: '0.02em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>

            <button
              onClick={logout}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '999px',
                color: '#0a0a0a',
                fontSize: '0.875rem',
                fontWeight: 400,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
          fontWeight: 300,
            marginBottom: '0.75rem',
          color: '#f5f5f5'
          }}>
            ⚠️ Danger Zone
          </h3>
          <button
            onClick={clearAllFiles}
            disabled={loading || files.length === 0}
            style={{
              padding: '0.625rem 1.25rem',
            background: '#111111',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            color: '#f5f5f5',
              fontSize: '0.875rem',
            fontWeight: 400,
            letterSpacing: '0.02em',
              cursor: loading || files.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || files.length === 0 ? 0.5 : 1,
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            🗑️ Delete All Files
          </button>
        </div>

        {/* Files List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666666'
          }}>
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#666666'
          }}>
            No files uploaded yet
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#666666'
                  }}>Filename</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#666666'
                  }}>Size</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#666666'
                  }}>Uploaded</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#666666'
                  }}>IP Address</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#666666'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < files.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                    }}
                  >
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.9rem'
                    }}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#5865F2',
                          textDecoration: 'none'
                        }}
                      >
                        {file.filename}
                      </a>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#666666'
                    }}>
                      {formatFileSize(file.size)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#666666'
                    }}>
                      {formatTimestamp(file.timestamp)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#666666',
                      fontFamily: 'monospace'
                    }}>
                      {file.ip || 'Unknown'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => deleteFile(file.url, file.filename)}
                        disabled={deleting === file.url}
                        style={{
                          padding: '0.45rem 0.9rem',
                          background: '#111111',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '999px',
                          color: '#f5f5f5',
                          fontSize: '0.8rem',
                          fontWeight: 400,
                          letterSpacing: '0.02em',
                          cursor: deleting === file.url ? 'not-allowed' : 'pointer',
                          opacity: deleting === file.url ? 0.5 : 1,
                          fontFamily: "'Montserrat', sans-serif"
                        }}
                      >
                        {deleting === file.url ? '⏳' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
