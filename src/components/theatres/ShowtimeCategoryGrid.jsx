import React from 'react';
import { Sun, Sunset, Moon, Sunrise, Clock, AlertCircle, Armchair } from 'lucide-react';
import { SHOW_CATEGORIES } from '../../utils/constants';
import { getShowtimeCategory, parseTimeToMinutes } from '../../utils/timeCategorizer';

const categoryIcons = {
  Morning: Sunrise,
  Afternoon: Sun,
  Evening: Sunset,
  Night: Moon
};

const ShowtimeCategoryGrid = ({
  shows = [],
  selectedShowId,
  onSelectShow,
  selectedDate
}) => {
  // Helper to determine if a showtime is in the past for today's date
  const isPastShow = (show) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) return false;

    const showMinutes = parseTimeToMinutes(show.startTime);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Handle early morning night shows (e.g. 12:30 AM or 01:00 AM on today's program)
    if (showMinutes < 360 && currentMinutes >= 1200) {
      return false;
    }

    return currentMinutes > showMinutes;
  };

  // Group shows dynamically by the 4 required categories based on their actual starting time
  const groupedShows = {
    Morning: [],
    Afternoon: [],
    Evening: [],
    Night: []
  };

  shows.forEach((show) => {
    const category = getShowtimeCategory(show.startTime);
    if (groupedShows[category]) {
      groupedShows[category].push(show);
    }
  });

  // Sort showtimes chronologically within each category
  Object.keys(groupedShows).forEach((cat) => {
    groupedShows[cat].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  });

  // Check if at least one category has available shows
  const totalVisibleShows = Object.values(groupedShows).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  if (totalVisibleShows === 0) {
    return (
      <div
        style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
          margin: '2rem 0'
        }}
      >
        <AlertCircle size={36} color="var(--accent-red)" style={{ marginBottom: '0.75rem' }} />
        <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          No Shows Scheduled for this Selection
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
          No screening sessions found for the chosen movie, audio track, and date. Please select another date or explore other running movies.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', margin: '2rem 0' }}>
      {SHOW_CATEGORIES.map((category) => {
        const categoryShows = groupedShows[category.id] || [];

        // Hide categories with no available shows as per specification
        if (categoryShows.length === 0) return null;

        const IconComponent = categoryIcons[category.id] || Clock;

        return (
          <div
            key={category.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Category Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.9rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '8px',
                    background: 'rgba(229, 9, 20, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent size={18} color="var(--accent-red)" />
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800 }}>
                    {category.label}
                  </h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {category.timeRange}
                  </span>
                </div>
              </div>

              <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                {categoryShows.length} {categoryShows.length === 1 ? 'Showtime' : 'Showtimes'}
              </span>
            </div>

            {/* Showtime Buttons Matrix (Supporting multiple diverse showtimes) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {categoryShows.map((show) => {
                const isSelected = selectedShowId === show._id;
                const isPast = isPastShow(show);
                const isSoldOut = show.availableSeats === 0;
                const isDisabled = isPast || isSoldOut;

                return (
                  <button
                    key={show._id}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && onSelectShow(show)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.85rem 1.25rem',
                      minWidth: '155px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)'
                        : isPast
                        ? 'rgba(255, 255, 255, 0.02)'
                        : isSoldOut
                        ? 'rgba(220, 38, 38, 0.05)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${
                        isSelected
                          ? 'var(--accent-red)'
                          : isSoldOut
                          ? 'rgba(220, 38, 38, 0.3)'
                          : isPast
                          ? 'transparent'
                          : 'var(--border-subtle)'
                      }`,
                      color: isSelected ? '#ffffff' : isPast ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isPast ? 0.45 : isSoldOut ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 16px var(--accent-red-glow)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {/* Showtime */}
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                      {show.startTime}
                    </span>

                    {/* Screen & Audio Language */}
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: isSelected ? '#ffffff' : 'var(--accent-gold)',
                        marginTop: '0.2rem'
                      }}
                    >
                      {show.screenNumber} • {show.language}
                    </span>

                    {/* Pricing Indicator */}
                    <span
                      style={{
                        fontSize: '0.675rem',
                        color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)',
                        marginTop: '0.15rem'
                      }}
                    >
                      From ₹{show.seatPricing?.Silver || 150}
                    </span>

                    {/* Real-time Seat Availability Indicator */}
                    {show.availableSeats !== undefined && !isPast && (
                      <div
                        style={{
                          marginTop: '0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: isSelected
                            ? 'rgba(0, 0, 0, 0.25)'
                            : isSoldOut
                            ? 'rgba(239, 68, 68, 0.15)'
                            : show.availableSeats <= 30
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(34, 197, 94, 0.12)'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isSelected
                              ? '#ffffff'
                              : isSoldOut
                              ? '#ef4444'
                              : show.availableSeats <= 30
                              ? '#f59e0b'
                              : '#22c55e'
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isSelected
                              ? '#ffffff'
                              : isSoldOut
                              ? '#ef4444'
                              : show.availableSeats <= 30
                              ? '#f59e0b'
                              : '#4ade80'
                          }}
                        >
                          {isSoldOut
                            ? 'Sold Out'
                            : show.availableSeats <= 30
                            ? `${show.availableSeats} Left (Fast)`
                            : `${show.availableSeats} Available`}
                        </span>
                      </div>
                    )}

                    {/* Past / Ended Badge */}
                    {isPast && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#475569',
                          color: '#ffffff',
                          fontSize: '0.6rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        Ended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShowtimeCategoryGrid;
