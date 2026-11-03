import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  MapPin,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Ticket,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { CITIES } from '../../utils/constants';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { selectedCity, setSelectedCity } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    if (location.pathname === '/theatres') {
      if (city === 'All Cities') {
        navigate('/theatres');
      } else {
        navigate(`/theatres?city=${encodeURIComponent(city)}`);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(10, 11, 14, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '4.5rem', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--accent-red-glow)'
            }}
          >
            <Film size={20} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.4rem',
                letterSpacing: '0.08em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-red) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              CINE<span style={{ color: 'var(--accent-red)' }}>MAX</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}>
              Cinema Experience
            </span>
          </div>
        </Link>

        {/* City Selector */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="city-selector-wrap">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            <MapPin size={14} color="var(--accent-red)" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {CITIES.map((city) => (
                <option key={city} value={city} style={{ background: '#161922', color: '#ffffff' }}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginLeft: 'auto'
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: isActive('/') ? 'var(--accent-red)' : 'var(--text-secondary)',
              position: 'relative'
            }}
          >
            Home
          </Link>
          <Link
            to="/movies"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: isActive('/movies') ? 'var(--accent-red)' : 'var(--text-secondary)'
            }}
          >
            Movies
          </Link>
          <Link
            to="/theatres"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: isActive('/theatres') ? 'var(--accent-red)' : 'var(--text-secondary)'
            }}
          >
            Theatres
          </Link>
          <Link
            to="/coming-soon"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: isActive('/coming-soon') ? 'var(--accent-red)' : 'var(--text-secondary)'
            }}
          >
            Coming Soon
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/my-bookings') ? 'var(--accent-red)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Ticket size={16} />
              My Bookings
            </Link>
          )}
        </nav>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            width: '210px'
          }}
          className="desktop-search"
        >
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.8rem 0.45rem 2.2rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: '#ffffff'
            }}
          />
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.8rem', pointerEvents: 'none' }}
          />
        </form>

        {/* User Auth Controls */}
        <div style={{ position: 'relative' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <div
                  style={{
                    width: '1.8rem',
                    height: '1.8rem',
                    borderRadius: '50%',
                    background: 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.6rem)',
                    right: 0,
                    width: '200px',
                    background: '#161922',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem 0',
                    zIndex: 1001
                  }}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <User size={15} />
                    Profile Details
                  </Link>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Ticket size={15} />
                    My Bookings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-gold)',
                        fontWeight: 700,
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      <Shield size={15} color="var(--accent-gold)" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: '#ff4b55',
                      width: '100%',
                      textAlign: 'left',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '0.25rem'
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            color: '#ffffff',
            padding: '0.5rem'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#0e1017',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </form>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/') ? 'var(--accent-red)' : '#ffffff', fontWeight: 600 }}>Home</Link>
          <Link to="/movies" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/movies') ? 'var(--accent-red)' : '#ffffff', fontWeight: 600 }}>Movies</Link>
          <Link to="/theatres" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/theatres') ? 'var(--accent-red)' : '#ffffff', fontWeight: 600 }}>Theatres</Link>
          <Link to="/coming-soon" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/coming-soon') ? 'var(--accent-red)' : '#ffffff', fontWeight: 600 }}>Coming Soon</Link>
          {user && (
            <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>My Bookings</Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Admin Dashboard</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav, .desktop-search, .city-selector-wrap {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
            margin-left: auto;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

