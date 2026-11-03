import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Calendar, Ticket, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const UserProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '720px' }}>
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#ffffff',
              boxShadow: '0 4px 20px var(--accent-red-glow)',
              flexShrink: 0
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                {user.name}
              </h1>
              {isAdmin && <span className="badge badge-gold">Administrator</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
        </div>

        {/* Profile Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Full Name
            </span>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
              {user.name}
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Registered Email
            </span>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
              {user.email}
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Account Role
            </span>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: isAdmin ? 'var(--accent-gold)' : '#ffffff', marginTop: '0.25rem', textTransform: 'capitalize' }}>
              {user.role} Member
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Member Since
            </span>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
              {formatDate(user.createdAt || new Date())}
            </p>
          </div>
        </div>

        {/* Quick Links & Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            <Ticket size={18} />
            <span>View My Bookings</span>
          </Link>

          {isAdmin && (
            <Link to="/admin/dashboard" className="btn btn-gold">
              <Shield size={18} />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <button onClick={handleLogout} className="btn btn-danger" style={{ marginLeft: 'auto' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
