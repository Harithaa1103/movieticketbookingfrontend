import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock, Ticket } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const HeroCarousel = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Slide through first 5 movies
  const slideMovies = movies.slice(0, 5);

  useEffect(() => {
    if (slideMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slideMovies.length]);

  if (!slideMovies.length) return null;

  const currentMovie = slideMovies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideMovies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideMovies.length);
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '520px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0b0e',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '3.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Background Banner with Cinema Vignette & Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${currentMovie.banner || currentMovie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          transition: 'all 0.8s ease-in-out',
          transform: 'scale(1.02)'
        }}
      />

      {/* Atmospheric Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, #0a0b0e 10%, rgba(10, 11, 14, 0.85) 50%, rgba(10, 11, 14, 0.3) 100%), linear-gradient(to top, #0a0b0e 0%, transparent 60%)'
        }}
      />

      {/* Hero Content */}
      <div
        className="container"
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '700px',
          paddingTop: '2rem',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
          <span className="badge badge-red">
            {currentMovie.releaseStatus || 'Now Showing'}
          </span>
          {currentMovie.isAdvanceBooking && (
            <span className="badge badge-gold">Advance Booking Open</span>
          )}
          {currentMovie.rating > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--accent-gold)'
              }}
            >
              <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
              {currentMovie.rating.toFixed(1)}/10
            </span>
          )}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#ffffff',
            marginBottom: '1rem',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
          }}
        >
          {currentMovie.title}
        </h1>

        {/* Metadata pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} color="var(--accent-red)" />
            <span>{formatDuration(currentMovie.duration)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} color="var(--accent-red)" />
            <span>
              {new Date(currentMovie.releaseDate).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {currentMovie.genre?.slice(0, 3).map((g) => (
              <span key={g} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Available Audio Languages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Audio:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {currentMovie.availableLanguages?.map((lang) => (
              <span
                key={lang}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
          }}
        >
          {currentMovie.description}
        </p>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            to={`/movie/${currentMovie._id}`}
            className="btn btn-primary btn-lg"
          >
            <Ticket size={18} />
            Book Tickets
          </Link>
          <Link
            to={`/movie/${currentMovie._id}`}
            className="btn btn-secondary btn-lg"
          >
            Explore Movie
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2.8rem',
          height: '2.8rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(10, 11, 14, 0.75)',
          border: '1px solid var(--border-subtle)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 5,
          transition: 'all 0.2s ease'
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2.8rem',
          height: '2.8rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(10, 11, 14, 0.75)',
          border: '1px solid var(--border-subtle)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 5,
          transition: 'all 0.2s ease'
        }}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          right: '2.5rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 5
        }}
      >
        {slideMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: currentIndex === idx ? '2rem' : '0.6rem',
              height: '0.4rem',
              borderRadius: '999px',
              backgroundColor: currentIndex === idx ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

