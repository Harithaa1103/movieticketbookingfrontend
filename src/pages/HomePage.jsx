import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Calendar, Sparkles, ChevronRight, MapPin, Search } from 'lucide-react';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';
import HeroCarousel from '../components/movies/HeroCarousel';
import MovieGrid from '../components/movies/MovieGrid';
import TheatreCard from '../components/theatres/TheatreCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [recentRes, upcomingRes, theatresRes] = await Promise.all([
          movieService.getRecent(),
          movieService.getUpcoming(),
          theatreService.getAll({ limit: 4 })
        ]);

        if (recentRes.success) setRecentMovies(recentRes.movies);
        if (upcomingRes.success) setUpcomingMovies(upcomingRes.movies);
        if (theatresRes.success) setTheatres(theatresRes.theatres.slice(0, 4));

        // For hero slideshow: take top coming soon and top recent movies
        const combinedHero = [
          ...(upcomingRes.movies || []),
          ...(recentRes.movies || [])
        ];
        setHeroMovies(combinedHero);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Preparing cinema reels..." />;
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {/* Hero Slideshow Banner */}
        <HeroCarousel movies={heroMovies} />

        {/* Recently Released Section */}
        <section style={{ marginBottom: '4.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                <Film size={16} />
                <span>Now In Cinemas</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                Recently Released Movies
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Blockbusters released within the previous two months across Tamil, Hindi, Malayalam, and Telugu.
              </p>
            </div>

            <Link to="/movies" className="btn btn-outline btn-sm">
              <span>View All Movies</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <MovieGrid movies={recentMovies} emptyMessage="No recently released movies found." />
        </section>

        {/* Coming Soon Section */}
        <section style={{ marginBottom: '4.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                <Sparkles size={16} />
                <span>Upcoming Sensations</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                Coming Soon
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Anticipated titles arriving soon. Advance booking open for select theatrical premiers.
              </p>
            </div>

            <Link to="/coming-soon" className="btn btn-outline btn-sm">
              <span>View Coming Soon</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <MovieGrid movies={upcomingMovies} emptyMessage="No upcoming movies scheduled." />
        </section>

        {/* Multiplex Theatres Section */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                <MapPin size={16} />
                <span>Premier Venues</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                Featured Theatres
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Experience Dolby Atmos 7.1, 4K Laser Projection, and luxury recliner seating.
              </p>
            </div>

            <Link to="/theatres" className="btn btn-outline btn-sm">
              <span>Browse All Theatres</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {theatres.map((t) => (
              <TheatreCard key={t._id} theatre={t} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
