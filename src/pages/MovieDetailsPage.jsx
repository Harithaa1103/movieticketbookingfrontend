import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Film,
  Star,
  Clock,
  Calendar,
  Globe,
  MapPin,
  Ticket,
  ChevronRight,
  Info
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useBooking } from '../context/BookingContext';
import DateSelector from '../components/theatres/DateSelector';
import ShowtimeCategoryGrid from '../components/theatres/ShowtimeCategoryGrid';
import MovieTheatreShowtimes from '../components/theatres/MovieTheatreShowtimes';
import TicketQuantityModal from '../components/booking/TicketQuantityModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDuration, formatDate, formatDateYYYYMMDD } from '../utils/formatters';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedCity,
    setSelectedCity,
    setSelectedMovie,
    setSelectedLanguage,
    setSelectedTheatre,
    setSelectedDate,
    setSelectedShow,
    ticketQuantity,
    setTicketQuantity
  } = useBooking();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('');
  const [currentDate, setCurrentDate] = useState(formatDateYYYYMMDD(new Date()));
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeShowForModal, setActiveShowForModal] = useState(null);

  // 1. Fetch Movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieService.getById(id);
        if (res.success && res.movie) {
          setMovie(res.movie);
          // Set default selected audio language to the first available language
          const defaultLang = res.movie.availableLanguages?.[0] || 'Tamil';
          setSelectedLang(defaultLang);
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // 2. Fetch Shows for selected movie, language, date, and city
  useEffect(() => {
    if (!movie || !selectedLang) return;

    const fetchShows = async () => {
      try {
        setLoadingShows(true);
        const params = {
          movieId: movie._id,
          language: selectedLang,
          date: currentDate
        };
        if (selectedCity && selectedCity !== 'All Cities') {
          params.city = selectedCity;
        }

        const res = await showService.getShows(params);
        if (res.success) {
          setShows(res.shows);
        }
      } catch (error) {
        console.error('Failed to fetch shows:', error);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchShows();
  }, [movie, selectedLang, currentDate, selectedCity]);

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
  };

  const handleDateSelect = (dateStr) => {
    setCurrentDate(dateStr);
  };

  const handleShowSelect = (show) => {
    setActiveShowForModal(show);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (!activeShowForModal || !movie) return;

    // Save state to Global Booking Context
    setSelectedMovie(movie);
    setSelectedLanguage(selectedLang);
    setSelectedTheatre(activeShowForModal.theatreId);
    setSelectedDate(currentDate);
    setSelectedShow(activeShowForModal);

    setModalOpen(false);
    navigate(`/seat-selection/${activeShowForModal._id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading movie information..." />;
  }

  if (!movie) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Movie Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          The requested movie could not be located in our catalog.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Backdrop Banner */}
      <div
        style={{
          position: 'relative',
          minHeight: '480px',
          width: '100%',
          backgroundImage: `url(${movie.banner || movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '3rem'
        }}
      >
        {/* Gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, #0a0b0e 10%, rgba(10, 11, 14, 0.85) 60%, rgba(10, 11, 14, 0.5) 100%), linear-gradient(to right, #0a0b0e 20%, transparent 80%)'
          }}
        />

        {/* Backdrop Content Container */}
        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'flex-end' }}>
          {/* Left Poster Thumbnail */}
          <div
            style={{
              width: '220px',
              flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg), 0 0 25px rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#161922'
            }}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
              }}
            />
          </div>

          {/* Right Movie Details */}
          <div style={{ flex: '1 1 450px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-red">{movie.releaseStatus}</span>
              {movie.isAdvanceBooking && <span className="badge badge-gold">Advance Booking</span>}
              {movie.rating > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--accent-gold)',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                  <span>{movie.rating.toFixed(1)}/10</span>
                </div>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '0.75rem',
                lineHeight: 1.15
              }}
            >
              {movie.title}
            </h1>

            {/* Quick Meta Strip */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.25rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="var(--accent-red)" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} color="var(--accent-red)" />
                <span>Released: {formatDate(movie.releaseDate)}</span>
              </div>
              <div>{movie.genre?.join(' • ')}</div>
            </div>

            {/* Audio Language Selection Banner (Crucial Requirement) */}
            <div
              style={{
                background: 'rgba(22, 25, 34, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
                width: 'fit-content'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700 }}>
                <Globe size={16} />
                <span>SELECT AUDIO TRACK:</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {movie.availableLanguages?.map((lang) => {
                  const isSelected = selectedLang === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected
                          ? 'var(--accent-red)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                        boxShadow: isSelected ? '0 2px 10px var(--accent-red-glow)' : 'none'
                      }}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Synopsis & Cast */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              About the Movie
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {movie.description}
            </p>
            {movie.director && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                <strong>Director:</strong> {movie.director}
              </p>
            )}
          </div>

          {movie.cast?.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Star Cast
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {movie.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>{actor.name}</p>
                    {actor.role && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>as {actor.role}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Showtime Booking Section */}
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
              Select Theatre & Showtimes
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing sessions for <strong style={{ color: 'var(--accent-red)' }}>{movie.title}</strong> in <strong style={{ color: 'var(--accent-gold)' }}>{selectedLang}</strong> audio.
            </p>
          </div>

          {/* Date Selector */}
          <DateSelector selectedDate={currentDate} onDateChange={handleDateSelect} />

          {/* Multiple Theatres & Showtimes Comparison Matrix */}
          {loadingShows ? (
            <LoadingSpinner text="Checking multiple theatre availability & showtimes..." />
          ) : (
            <MovieTheatreShowtimes
              shows={shows}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              onSelectShow={handleShowSelect}
              selectedDate={currentDate}
              movieTitle={movie.title}
            />
          )}
        </section>
      </div>

      {/* Ticket Quantity Popup Modal */}
      <TicketQuantityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        movie={movie}
        theatre={activeShowForModal?.theatreId}
        show={activeShowForModal}
        quantity={ticketQuantity}
        onQuantityChange={setTicketQuantity}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default MovieDetailsPage;
