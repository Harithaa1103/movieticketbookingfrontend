import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="container"
      style={{
        paddingTop: '6rem',
        paddingBottom: '8rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(229, 9, 20, 0.15)',
          border: '1px solid rgba(229, 9, 20, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <Film size={40} color="var(--accent-red)" />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '5rem',
          fontWeight: 900,
          color: 'var(--accent-red)',
          lineHeight: 1
        }}
      >
        404
      </h1>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.75rem 0' }}>
        Scene Not Found
      </h2>

      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '2rem' }}>
        The reel you're looking for seems to have been cut from the final film. Let's get you back to the main feature.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
        <Link to="/movies" className="btn btn-secondary">
          <span>Browse Movies</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

