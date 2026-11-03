import React from 'react';
import { Film } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading CINE MAX...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '350px',
        width: '100%',
        padding: '2rem'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid rgba(229, 9, 20, 0.15)',
            borderTopColor: 'var(--accent-red)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite'
          }}
        />
        <Film size={24} color="var(--accent-red)" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em' }}>
        {text}
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

