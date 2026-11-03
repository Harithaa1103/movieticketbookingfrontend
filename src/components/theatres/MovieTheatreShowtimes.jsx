import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Sparkles,
  Clock,
  AlertCircle,
  Building2,
  SlidersHorizontal,
  Search,
  CheckCircle,
  Armchair,
  Filter,
  Volume2
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { parseTimeToMinutes } from '../../utils/timeCategorizer';
import { CITIES } from '../../utils/constants';

const FACILITY_OPTIONS = ['All Facilities', 'Dolby Atmos', 'IMAX', 'Laser', 'Recliner', 'Valet Parking'];

const MovieTheatreShowtimes = ({
  shows = [],
  selectedCity = 'Chennai',
  onCityChange,
  onSelectShow,
  selectedDate,
  movieTitle = 'Movie'
}) => {
  const [selectedFacility, setSelectedFacility] = useState('All Facilities');
  const [theatreSearch, setTheatreSearch] = useState('');

  // Group shows by Theatre ID
  const groupedTheatres = useMemo(() => {
    const map = {};

    shows.forEach((show) => {
      const theatre = show.theatreId;
      if (!theatre) return;

      const tId = theatre._id;
      if (!map[tId]) {
        map[tId] = {
          theatre,
          shows: [],
          pricing: show.seatPricing || { Silver: 150, Gold: 220, Platinum: 350 },
          minPrice: Infinity,
          maxPrice: -Infinity
        };
      }

      map[tId].shows.push(show);

      if (show.seatPricing) {
        const prices = Object.values(show.seatPricing);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min < map[tId].minPrice) map[tId].minPrice = min;
        if (max > map[tId].maxPrice) map[tId].maxPrice = max;
      }
    });

    return Object.values(map);
  }, [shows]);

  // Filter theatres by search query and facility
  const filteredTheatres = useMemo(() => {
    return groupedTheatres.filter((item) => {
      const { theatre } = item;

      // Filter by facility
      if (selectedFacility !== 'All Facilities') {
        const hasFac = theatre.facilities?.some((f) =>
          f.toLowerCase().includes(selectedFacility.toLowerCase())
        );
        if (!hasFac) return false;
      }

      // Filter by search query (theatre name, location, address)
      if (theatreSearch.trim()) {
        const q = theatreSearch.toLowerCase();
        const matchName = theatre.name?.toLowerCase().includes(q);
        const matchLoc = theatre.location?.toLowerCase().includes(q);
        const matchAddr = theatre.address?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchAddr) return false;
      }

      return true;
    });
  }, [groupedTheatres, selectedFacility, theatreSearch]);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* City & Filter Controls Bar */}
      <div
        style={{
          background: 'rgba(16, 20, 28, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* City Selector Tabs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <MapPin size={16} color="var(--accent-red)" />
              Select City ({selectedCity}):
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Showing {filteredTheatres.length} multiplex {filteredTheatres.length === 1 ? 'theatre' : 'theatres'} screening this film
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onCityChange && onCityChange(city)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 12px var(--accent-red-glow)' : 'none'
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facility & Search Sub-Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {/* Facility Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={12} /> Facility:
            </span>
            {FACILITY_OPTIONS.map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setSelectedFacility(fac)}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${selectedFacility === fac ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  background: selectedFacility === fac ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  color: selectedFacility === fac ? 'var(--accent-gold)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {fac}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 240px' }}>
            <input
              type="text"
              placeholder="Search theatre or area..."
              value={theatreSearch}
              onChange={(e) => setTheatreSearch(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '2.4rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-full)'
              }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Multiple Theatres Comparison Cards */}
      {filteredTheatres.length === 0 ? (
        <div
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border-subtle)'
          }}
        >
          <AlertCircle size={40} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Theatres Found in {selectedCity}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            There are currently no scheduled screenings for {movieTitle} matching your chosen city or facility filters.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onCityChange && onCityChange('Chennai')}
              className="btn btn-sm btn-primary"
            >
              Switch to Chennai Multiplexes
            </button>
            <button
              onClick={() => {
                setSelectedFacility('All Facilities');
                setTheatreSearch('');
                onCityChange && onCityChange('All Cities');
              }}
              className="btn btn-sm btn-secondary"
            >
              Show All Cities
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filteredTheatres.map((item) => {
            const { theatre, shows: tShows, minPrice, maxPrice, pricing } = item;

            // Sort showtimes chronologically
            const sortedShows = [...tShows].sort(
              (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
            );

            return (
              <div
                key={theatre._id}
                className="cinema-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem 2rem',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Theatre Header Info & Comparison Row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <Building2 size={20} color="var(--accent-red)" />
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                        {theatre.name}
                      </h3>
                      <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                        {theatre.screens?.length || 2} Screens
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                      <MapPin size={14} color="var(--accent-red)" />
                      <span><strong>{theatre.location}</strong>, {theatre.city} — {theatre.address}</span>
                    </div>

                    {/* Facilities Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {theatre.facilities?.map((f) => (
                        <span
                          key={f}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: f.includes('IMAX') ? 'var(--accent-gold)' : f.includes('Atmos') ? '#38bdf8' : 'var(--text-secondary)',
                            background: f.includes('IMAX') ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${f.includes('IMAX') ? 'rgba(212, 175, 55, 0.3)' : 'var(--border-subtle)'}`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Comparison Box */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      minWidth: '220px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Price Range:
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>
                        {formatCurrency(minPrice !== Infinity ? minPrice : 150)} – {formatCurrency(maxPrice !== -Infinity ? maxPrice : 350)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span>Silver: <strong>₹{pricing.Silver || 150}</strong></span>
                      <span>Gold: <strong>₹{pricing.Gold || 220}</strong></span>
                      <span>Plat: <strong>₹{pricing.Platinum || 350}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Showtimes Strip for this Theatre */}
                <div style={{ paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <Clock size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Available Showtimes ({sortedShows.length} Sessions):
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {sortedShows.map((show) => {
                      const isSoldOut = show.availabilityStatus === 'Sold Out';
                      const isFillingFast = show.availabilityStatus === 'Filling Fast';

                      return (
                        <button
                          key={show._id}
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => onSelectShow && onSelectShow(show)}
                          style={{
                            background: isSoldOut ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${
                              isSoldOut
                                ? 'rgba(255, 255, 255, 0.08)'
                                : isFillingFast
                                ? 'rgba(245, 197, 24, 0.5)'
                                : 'var(--border-subtle)'
                            }`,
                            borderRadius: 'var(--radius-md)',
                            padding: '0.65rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: isSoldOut ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isSoldOut ? 0.45 : 1,
                            minWidth: '130px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSoldOut) {
                              e.currentTarget.style.borderColor = 'var(--accent-red)';
                              e.currentTarget.style.background = 'rgba(229, 9, 20, 0.12)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSoldOut) {
                              e.currentTarget.style.borderColor = isFillingFast
                                ? 'rgba(245, 197, 24, 0.5)'
                                : 'var(--border-subtle)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.02em' }}>
                            {show.startTime}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            <span>{show.screenNumber}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{show.language}</span>
                          </div>

                          <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', fontWeight: 800 }}>
                            {isSoldOut ? (
                              <span style={{ color: '#ef4444' }}>Sold Out</span>
                            ) : isFillingFast ? (
                              <span style={{ color: '#f5c518' }}>Filling Fast</span>
                            ) : (
                              <span style={{ color: '#4ade80' }}>Available</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MovieTheatreShowtimes;

