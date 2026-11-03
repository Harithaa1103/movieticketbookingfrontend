import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Film, Sparkles, ChevronRight } from 'lucide-react';

const TheatreCard = ({ theatre, onSelect, actionLabel = 'View Showtimes' }) => {
  return (
    <div
      className="cinema-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {theatre.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
              <MapPin size={14} />
              <span>{theatre.location}, {theatre.city}</span>
            </div>
          </div>
          <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
            {theatre.screens?.length || 2} Screens
          </span>
        </div>

        {/* Address */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
          {theatre.address}
        </p>

        {/* Facilities / Amenities */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {theatre.facilities?.map((f) => (
            <span
              key={f}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px'
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div>
        {onSelect ? (
          <button
            onClick={() => onSelect(theatre)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <span>{actionLabel}</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <Link
            to={`/theatre/${theatre._id}`}
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            <span>View Theatre Details</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default TheatreCard;

