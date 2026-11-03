import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Film } from 'lucide-react';
import { movieService } from '../services/movieService';
import MovieGrid from '../components/movies/MovieGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ComingSoonPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const res = await movieService.getUpcoming();
        if (res.success) {
          setMovies(res.movies);
        }
      } catch (error) {
        console.error('Failed to load upcoming movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <Sparkles size={16} />
          <span>Premiering Soon</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          Coming Soon to CINE MAX
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Anticipated upcoming titles across Tamil, Hindi, Malayalam, and Telugu. Advance ticket sales open for select special releases.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading upcoming cinematic trailers & posters..." />
      ) : (
        <MovieGrid movies={movies} emptyMessage="No upcoming movies scheduled at this time." />
      )}
    </div>
  );
};

export default ComingSoonPage;
