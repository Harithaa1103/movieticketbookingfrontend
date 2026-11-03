import React from 'react';
import { Clock, ShieldCheck, Ticket, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BookingSummary = ({
  movie,
  theatre,
  show,
  selectedSeats = [],
  pricing,
  timeRemaining,
  onProceedToPayment,
  isProcessing = false
}) => {
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerLow = timeRemaining !== null && timeRemaining <= 120; // less than 2 mins

  return (
    <div
      className="glass-panel"
      style={{
        padding: '2rem',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* 8-Minute Hold Timer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: isTimerLow
            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)'
            : 'rgba(245, 197, 24, 0.1)',
          border: `1px solid ${isTimerLow ? 'rgba(220, 38, 38, 0.4)' : 'var(--border-gold)'}`,
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={18} color={isTimerLow ? '#ef4444' : 'var(--accent-gold)'} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
            Seats Locked For:
          </span>
        </div>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: isTimerLow ? '#ef4444' : 'var(--accent-gold)'
          }}
        >
          {formatTimer(timeRemaining)}
        </span>
      </div>

      {/* Movie & Show Info */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <img
          src={movie?.poster}
          alt={movie?.title}
          style={{
            width: '70px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}
        />
        <div>
          <span className="badge badge-red" style={{ fontSize: '0.7rem', marginBottom: '0.3rem' }}>
            {show?.language} Audio
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '0.25rem' }}>
            {movie?.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {theatre?.name} • {show?.screenNumber}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            {formatDate(show?.showDate)} at <strong style={{ color: 'var(--accent-gold)' }}>{show?.startTime}</strong>
          </p>
        </div>
      </div>

      {/* Booking Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Selected Seats:</span>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
            {selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}
          </span>
        </div>

        {/* Group Breakdown Display if multi-group */}
        {(() => {
          const groupMap = {};
          selectedSeats.forEach((s) => {
            const gNum = s.group || 1;
            if (!groupMap[gNum]) groupMap[gNum] = [];
            groupMap[gNum].push(s);
          });
          const groupKeys = Object.keys(groupMap);
          if (groupKeys.length <= 1) return null;

          return (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Group Arrangement Breakdown:
              </span>
              {groupKeys.map((gNum) => {
                const list = groupMap[gNum];
                return (
                  <div key={gNum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Group {gNum} ({list.length} {list.length === 1 ? 'ticket' : 'tickets'}):
                    </span>
                    <strong style={{ color: gNum === '1' ? 'var(--accent-red)' : '#f5c518' }}>
                      {list.map((s) => `${s.row}${s.number}`).join(', ')}
                    </strong>
                  </div>
                );
              })}
            </div>
          );
        })()}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Tickets:</span>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>
      </div>

      {/* Price Breakdown (No individual seat prices shown per project specification!) */}
      <div
        style={{
          background: 'rgba(10, 11, 14, 0.5)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Combined Ticket Amount:</span>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {formatCurrency(pricing?.ticketAmount || 0)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Convenience Fee:</span>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {formatCurrency(pricing?.convenienceFee || 45)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Taxes (18% GST on fees):</span>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {formatCurrency(pricing?.taxes || 8.1)}
          </span>
        </div>

        {/* GRAND TOTAL */}
        <div
          style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '1rem',
            marginTop: '0.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}
        >
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
              GRAND TOTAL:
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inclusive of all statutory taxes</p>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--accent-red)',
              textShadow: '0 0 16px var(--accent-red-glow)'
            }}
          >
            {formatCurrency(pricing?.grandTotal || 0)}
          </span>
        </div>
      </div>

      {/* Security badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginBottom: '1.5rem'
        }}
      >
        <ShieldCheck size={14} color="#4ade80" />
        <span>Price calculated & validated directly by CineMax Secure Backend</span>
      </div>

      {/* Proceed Button */}
      <button
        onClick={onProceedToPayment}
        disabled={isProcessing || timeRemaining === 0}
        className="btn btn-primary btn-lg"
        style={{
          width: '100%',
          fontWeight: 800,
          letterSpacing: '0.05em'
        }}
      >
        {isProcessing ? 'Processing...' : `PROCEED TO PAY ${formatCurrency(pricing?.grandTotal || 0)}`}
      </button>
    </div>
  );
};

export default BookingSummary;

