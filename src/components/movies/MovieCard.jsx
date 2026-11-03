import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Ticket } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const MovieCard = ({ movie }) => {
  const isComingSoon = movie.releaseStatus === 'Coming Soon';

  return (
    <div
      className="cinema-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Poster Image Container */}
      <div
        style={{
          position: 'relative',
          paddingTop: '145%', // 1:1.45 cinema poster aspect ratio
          overflow: 'hidden',
          backgroundColor: '#12141a'
        }}
      >
        <img
          src={movie.poster}
          alt={movie.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          {isComingSoon ? (
            <span className="badge badge-gold">Coming Soon</span>
          ) : (
            <span className="badge badge-red">Now Showing</span>
          )}

          {movie.rating > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                background: 'rgba(10, 11, 14, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(245, 197, 24, 0.3)',
                color: 'var(--accent-gold)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
              {movie.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Bottom Poster Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #161922 0%, rgba(22, 25, 34, 0) 40%)'
          }}
        />
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '0.5rem',
            lineHeight: 1.3
          }}
        >
          {movie.title}
        </h3>

        {/* Genre & Duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            marginBottom: '0.75rem'
          }}
        >
          <span>{movie.genre?.slice(0, 2).join(' • ')}</span>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} />
            <span>{formatDuration(movie.duration)}</span>
          </div>
        </div>

        {/* Release Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginBottom: '0.85rem'
          }}
        >
          <Calendar size={13} />
          <span>
            Released:{' '}
            {new Date(movie.releaseDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Audio Languages */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {movie.availableLanguages?.map((lang) => (
              <span
                key={lang}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#e2e8f0'
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Book Tickets CTA */}
        <div style={{ marginTop: 'auto' }}>
          {isComingSoon && !movie.isAdvanceBooking ? (
            <Link
              to={`/movie/${movie._id}`}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              View Details
            </Link>
          ) : (
            <Link
              to={`/movie/${movie._id}`}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Ticket size={16} />
              {movie.isAdvanceBooking ? 'Advance Booking' : 'Book Tickets'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

