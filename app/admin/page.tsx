'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password (default: admin123, change ADMIN_PASSWORD env variable in production)
    if (password === 'admin123') {
      sessionStorage.setItem('admin_authenticated', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#f5f5f0',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          🔐 Admin Login
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '0.800rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f5f5f0',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            autoFocus
          />

          {error && (
            <p style={{
              color: '#ff6b6b',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #5865F2 0%, #8B5CF6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              fontFamily: "'Montserrat', sans-serif"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Login
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: '#666666',
          textAlign: 'center'
        }}>
          <br />
        </p>
      </div>
    </div>
  );
}
