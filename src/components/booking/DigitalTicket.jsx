import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Film, Calendar, Clock, MapPin, CheckCircle, Ticket, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DigitalTicket = ({ booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const seatsList = booking.selectedSeats?.map((s) => s.seatIdentifier || `${s.row}${s.number}`).join(', ');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Boarding Pass Ticket Card */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          overflow: 'hidden',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px var(--accent-gold-glow)',
          background: 'linear-gradient(135deg, #131620 0%, #1a1e2b 100%)',
          position: 'relative'
        }}
        id="printable-ticket"
      >
        {/* Top Header Strip */}
        <div
          style={{
            background: 'linear-gradient(90deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)',
            padding: '1rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Film size={20} color="#ffffff" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.08em' }}>
              CINE<span style={{ color: 'var(--accent-gold)' }}>MAX</span> E-TICKET
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <CheckCircle size={16} color="#4ade80" />
            <span style={{ textTransform: 'uppercase' }}>{booking.bookingStatus || 'Confirmed'}</span>
          </div>
        </div>

        {/* Ticket Main Body */}
        <div style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Movie Poster & Basic Details */}
          <div style={{ display: 'flex', gap: '1.25rem', flex: '1 1 360px' }}>
            {/* Movie Poster Thumbnail */}
            <div
              style={{
                width: '100px',
                height: '145px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--border-gold)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                backgroundColor: '#0d0f14'
              }}
            >
              <img
                src={booking.movieId?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                alt={booking.movieId?.title || 'Movie Poster'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300';
                }}
              />
            </div>

            {/* Left Column: Movie & Showtime Details */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="badge badge-red" style={{ marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                  {booking.selectedLanguage || 'Original'} Audio Track
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.2
                  }}
                >
                  {booking.movieId?.title || 'Movie Title'}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="var(--accent-red)" />
                  <span>
                    <strong>{booking.theatreId?.name || 'Multiplex'}</strong>
                    {booking.theatreId?.city ? `, ${booking.theatreId.city}` : ''} ({booking.screenNumber || 'Screen 1'})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={15} color="var(--accent-red)" />
                    <span>{formatDate(booking.showDate)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} color="var(--accent-red)" />
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{booking.startTime}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.85rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SEATS ({booking.ticketQuantity}):</span>
                    <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.9rem' }}>{seatsList}</span>
                  </div>

                  {/* Group Arrangement Breakdown if present */}
                  {Array.isArray(booking.seatGroups) && booking.seatGroups.length > 1 && (
                    <div style={{ margin: '0.35rem 0', padding: '0.35rem 0.5rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', borderLeft: '2px solid var(--accent-gold)' }}>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        Group Allocation:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {booking.seatGroups.map((g) => (
                          <div key={g.groupNumber} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Group {g.groupNumber} ({g.size} {g.size === 1 ? 'seat' : 'seats'}):</span>
                            <span style={{ color: '#ffffff', fontWeight: 700 }}>{g.seats?.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Ticket Base Amount:</span>
                    <span>{formatCurrency(booking.ticketAmount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Convenience Fee & Taxes:</span>
                    <span>{formatCurrency((booking.convenienceFee || 0) + (booking.taxes || 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>GRAND TOTAL:</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1rem' }}>
                      {formatCurrency(booking.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Booking Ref */}
          <div
            style={{
              flex: '0 0 180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: '1px dashed var(--border-subtle)',
              paddingLeft: '1.5rem'
            }}
            className="ticket-qr-section"
          >
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                marginBottom: '0.75rem'
              }}
            >
              <QRCodeSVG
                value={booking.qrCodeData || `CINEMAX:${booking.bookingId}`}
                size={120}
                level="M"
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Booking Reference
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                letterSpacing: '0.05em'
              }}
            >
              {booking.bookingId}
            </span>
          </div>
        </div>

        {/* Tear-off Bottom Notice */}
        <div
          style={{
            borderTop: '1px dashed var(--border-subtle)',
            background: 'rgba(10, 11, 14, 0.6)',
            padding: '0.85rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>Show this QR code at cinema gate for entry scanner</span>
          <span>Payment: Simulated Demo Gateway</span>
        </div>
      </div>

      {/* Print / Save Ticket CTA */}
      <button
        onClick={handlePrint}
        className="btn btn-secondary"
        style={{ marginTop: '1.5rem' }}
      >
        <Printer size={16} />
        <span>Print / Save Digital Ticket</span>
      </button>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        @media (max-width: 600px) {
          .ticket-qr-section {
            border-left: none !important;
            border-top: 1px dashed var(--border-subtle);
            padding-left: 0 !important;
            padding-top: 1.5rem;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DigitalTicket;

