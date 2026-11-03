import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, X, QrCode, Film } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import DigitalTicket from '../components/booking/DigitalTicket';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getMyBookings();
        if (res.success) {
          setBookings(res.bookings);
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving your cinema tickets..." />;
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          My Movie Bookings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          View, print, and scan all your digital cinema reservation passes.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <Ticket size={48} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            No Bookings Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            You haven't reserved any cinema tickets yet. Explore movies now to book your first show!
          </p>
          <Link to="/movies" className="btn btn-primary">
            Explore Movies
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const movie = booking.movieId;
            const theatre = booking.theatreId;
            const seatsList = booking.selectedSeats
              ?.map((s) => s.seatIdentifier || `${s.row}${s.number}`)
              .join(', ');

            return (
              <div
                key={booking._id}
                className="cinema-card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  padding: '1.5rem',
                  gap: '1.5rem',
                  background: 'var(--bg-card)'
                }}
              >
                {/* Movie Poster */}
                <img
                  src={movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}
                  alt={movie?.title}
                  style={{
                    width: '90px',
                    height: '130px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0
                  }}
                />

                {/* Details */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-red">{booking.selectedLanguage} Audio</span>
                    <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                      {booking.bookingId}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {movie?.title || 'Movie'}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} color="var(--accent-red)" />
                      <span>{theatre?.name || 'Multiplex'} ({booking.screenNumber})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} color="var(--accent-red)" />
                      <span>{formatDate(booking.showDate)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} color="var(--accent-red)" />
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{booking.startTime}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Seats: </span>
                      <strong style={{ color: '#ffffff' }}>{seatsList}</strong>
                      {Array.isArray(booking.seatGroups) && booking.seatGroups.length > 1 && (
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          {booking.seatGroups.map((g) => (
                            <span
                              key={g.groupNumber}
                              style={{
                                fontSize: '0.72rem',
                                color: g.groupNumber === 1 ? 'var(--accent-red)' : 'var(--accent-gold)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1px 6px',
                                borderRadius: '3px'
                              }}
                            >
                              G{g.groupNumber}: {g.seats?.join(', ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Total Paid: </span>
                      <strong style={{ color: 'var(--accent-gold)' }}>{formatCurrency(booking.grandTotal)}</strong>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setSelectedBookingForTicket(booking)}
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <QrCode size={16} />
                    <span>View Digital Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal Preview */}
      {selectedBookingForTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 6, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={() => setSelectedBookingForTicket(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '700px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBookingForTicket(null)}
              style={{
                position: 'absolute',
                top: '-2.5rem',
                right: '0',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <X size={20} />
              <span>Close</span>
            </button>

            <DigitalTicket booking={selectedBookingForTicket} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
