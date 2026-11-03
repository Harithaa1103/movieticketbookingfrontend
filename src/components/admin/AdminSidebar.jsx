import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  Calendar,
  Ticket,
  Users,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/movies', label: 'Manage Movies', icon: Film },
    { path: '/admin/theatres', label: 'Manage Theatres', icon: Building2 },
    { path: '/admin/shows', label: 'Manage Shows', icon: Calendar },
    { path: '/admin/bookings', label: 'All Bookings', icon: Ticket },
    { path: '/admin/users', label: 'Manage Users', icon: Users }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0c0e14',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 4.5rem)',
        padding: '1.5rem 1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        <ShieldAlert size={20} color="var(--accent-gold)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ADMIN CONTROL
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: active ? 700 : 500,
                color: active ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                border: active ? '1px solid rgba(229, 9, 20, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} color={active ? 'var(--accent-red)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Main Website</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;

