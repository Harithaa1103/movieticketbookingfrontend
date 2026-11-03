import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Search, Filter, Globe } from 'lucide-react';
import { movieService } from '../services/movieService';
import MovieGrid from '../components/movies/MovieGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AUDIO_LANGUAGES } from '../utils/constants';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const genres = ['Action', 'Thriller', 'Drama', 'Comedy', 'Sci-Fi', 'Crime', 'Adventure'];

  useEffect(() => {
    fetchFilteredMovies();
  }, [searchParams, selectedLanguage, selectedStatus, selectedGenre]);

  const fetchFilteredMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedGenre) params.genre = selectedGenre;

      const res = await movieService.getAll(params);
      if (res.success) {
        setMovies(res.movies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('');
    setSelectedStatus('');
    setSelectedGenre('');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          Explore Movies
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Browse current theatrical releases and upcoming blockbusters. Filter by audio track without changing website interface language.
        </p>
      </div>

      {/* Filter Bar */}
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
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by title, director, or actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.6rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {(searchQuery || selectedLanguage || selectedStatus || selectedGenre) && (
            <button type="button" onClick={handleClearFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          )}
        </form>

        {/* Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          {/* Audio Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Audio Track:
            </span>
            <button
              onClick={() => setSelectedLanguage('')}
              className={`badge ${selectedLanguage === '' ? 'badge-red' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              All Languages
            </button>
            {AUDIO_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang === selectedLanguage ? '' : lang)}
                className={`badge ${selectedLanguage === lang ? 'badge-red' : 'badge-gray'}`}
                style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Release Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Status:
            </span>
            <button
              onClick={() => setSelectedStatus('')}
              className={`badge ${selectedStatus === '' ? 'badge-gold' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'Now Showing' ? '' : 'Now Showing')}
              className={`badge ${selectedStatus === 'Now Showing' ? 'badge-gold' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              Now Showing
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'Coming Soon' ? '' : 'Coming Soon')}
              className={`badge ${selectedStatus === 'Coming Soon' ? 'badge-gold' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner text="Searching movie archives..." />
      ) : (
        <MovieGrid movies={movies} emptyMessage="No movies match your criteria. Try adjusting your filters." />
      )}
    </div>
  );
};

export default MoviesPage;
