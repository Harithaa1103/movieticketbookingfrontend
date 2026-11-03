import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Search, MapPin } from 'lucide-react';
import { theatreService } from '../services/theatreService';
import TheatreCard from '../components/theatres/TheatreCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CITIES } from '../utils/constants';

const TheatresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCity = searchParams.get('city') || '';

  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(urlCity || 'All Cities');

  useEffect(() => {
    fetchTheatres();
  }, [searchParams, selectedCity]);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCity && selectedCity !== 'All Cities') {
        params.city = selectedCity;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await theatreService.getAll(params);
      if (res.success) {
        setTheatres(res.theatres);
      }
    } catch (error) {
      console.error('Failed to fetch theatres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTheatres();
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (city === 'All Cities') {
      setSearchParams({});
    } else {
      setSearchParams({ city });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          Explore CineMax Theatres
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Discover premier multiplexes, immersive Dolby Atmos sound systems, and laser 4K projection across India.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by theatre name, area, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.6rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button type="submit" className="btn btn-primary">
            Search Theatres
          </button>
        </form>

        {/* City Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <MapPin size={14} />
            <span>Select City:</span>
          </div>
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`badge ${selectedCity === city ? 'badge-red' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Theatres Grid */}
      {loading ? (
        <LoadingSpinner text="Locating cinema theatres..." />
      ) : theatres.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No theatres found for this location.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}
        >
          {theatres.map((t) => (
            <TheatreCard key={t._id} theatre={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
