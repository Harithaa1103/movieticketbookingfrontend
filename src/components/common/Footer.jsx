import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart, Sparkles, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#07080a',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '5rem',
        paddingTop: '4rem',
        paddingBottom: '2.5rem'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Film size={18} color="#ffffff" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  letterSpacing: '0.08em',
                  color: '#ffffff'
                }}
              >
                CINE<span style={{ color: 'var(--accent-red)' }}>MAX</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              A modern, full-stack cinema ticketing system featuring real-time seat availability, consecutive adjacent-seat selection, and atomic reservation concurrency.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--border-gold)',
                color: 'var(--accent-gold)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Sparkles size={13} />
              Final Year Engineering Project
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
              QUICK NAVIGATION
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
              </li>
              <li>
                <Link to="/movies" style={{ color: 'var(--text-secondary)' }}>Now Showing Movies</Link>
              </li>
              <li>
                <Link to="/theatres" style={{ color: 'var(--text-secondary)' }}>Participating Theatres</Link>
              </li>
              <li>
                <Link to="/coming-soon" style={{ color: 'var(--text-secondary)' }}>Coming Soon & Advance Booking</Link>
              </li>
              <li>
                <Link to="/my-bookings" style={{ color: 'var(--text-secondary)' }}>My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Audio & Language Policy */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
              CINEMA AUDIO TRACKS
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '0.9rem' }}>
              We support multi-language cinematic screenings across:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              {['Tamil', 'Hindi', 'Malayalam', 'Telugu'].map((lang) => (
                <span key={lang} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                  {lang}
                </span>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                lineHeight: '1.4'
              }}
            >
              <Globe size={16} color="var(--accent-red)" style={{ flexShrink: 0 }} />
              <span>Platform UI is always displayed in English.</span>
            </div>
          </div>

          {/* Column 4: Platform Security & Transparency */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
              SECURE PLATFORM
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#4ade80" />
                <span>JWT Authentication & bcrypt Hashing</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#4ade80" />
                <span>Double-Booking Prevention Locks</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#4ade80" />
                <span>Simulated UPI / Test Card Payment Flow</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.825rem'
          }}
        >
          <p>© {new Date().getFullYear()} CINE MAX. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with MERN Stack <Heart size={14} color="var(--accent-red)" fill="var(--accent-red)" /> for Academic Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

