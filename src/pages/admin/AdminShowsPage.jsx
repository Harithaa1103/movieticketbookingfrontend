import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { showService } from '../../services/showService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SHOW_CATEGORIES, AUDIO_LANGUAGES } from '../../utils/constants';
import { getShowtimeCategory } from '../../utils/timeCategorizer';
import { formatDate } from '../../utils/formatters';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const toast = useToast();

  // Form State
  const [movieId, setMovieId] = useState('');
  const [theatreId, setTheatreId] = useState('');
  const [screenNumber, setScreenNumber] = useState('Screen 1');
  const [language, setLanguage] = useState('Tamil');
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('12:15 PM');
  const [silverPrice, setSilverPrice] = useState(150);
  const [goldPrice, setGoldPrice] = useState(220);
  const [platinumPrice, setPlatinumPrice] = useState(350);
  const [submitting, setSubmitting] = useState(false);

  // Automatically computed category based on current startTime
  const computedCategory = getShowtimeCategory(startTime);
  const categoryMeta = SHOW_CATEGORIES.find((c) => c.id === computedCategory) || SHOW_CATEGORIES[0];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showService.getShows(),
        movieService.getAll(),
        theatreService.getAll()
      ]);

      if (showsRes.success) setShows(showsRes.shows);
      if (moviesRes.success) {
        setMovies(moviesRes.movies);
        if (moviesRes.movies.length > 0) setMovieId(moviesRes.movies[0]._id);
      }
      if (theatresRes.success) {
        setTheatres(theatresRes.theatres);
        if (theatresRes.theatres.length > 0) setTheatreId(theatresRes.theatres[0]._id);
      }
    } catch (error) {
      console.error('Error fetching shows data:', error);
      toast.error('Failed to load show schedules.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingShow(null);
    if (movies.length > 0) setMovieId(movies[0]._id);
    if (theatres.length > 0) setTheatreId(theatres[0]._id);
    setScreenNumber('Screen 1');
    setLanguage('Tamil');
    setShowDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:30 AM');
    setEndTime('12:15 PM');
    setSilverPrice(150);
    setGoldPrice(220);
    setPlatinumPrice(350);
    setModalOpen(true);
  };

  const handleOpenEdit = (show) => {
    setEditingShow(show);
    setMovieId(show.movieId?._id || show.movieId);
    setTheatreId(show.theatreId?._id || show.theatreId);
    setScreenNumber(show.screenNumber || 'Screen 1');
    setLanguage(show.language || 'Tamil');
    setShowDate(new Date(show.showDate).toISOString().split('T')[0]);
    setStartTime(show.startTime || '09:30 AM');
    setEndTime(show.endTime || '12:15 PM');
    setSilverPrice(show.seatPricing?.Silver || 150);
    setGoldPrice(show.seatPricing?.Gold || 220);
    setPlatinumPrice(show.seatPricing?.Platinum || 350);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const showData = {
      movieId,
      theatreId,
      screenNumber,
      language,
      showDate,
      timeSlotCategory: computedCategory,
      startTime,
      endTime,
      seatPricing: {
        Silver: Number(silverPrice),
        Gold: Number(goldPrice),
        Platinum: Number(platinumPrice)
      }
    };

    try {
      setSubmitting(true);
      if (editingShow) {
        const res = await adminService.updateShow(editingShow._id, showData);
        if (res.success) {
          toast.success('Showtime updated successfully!');
          setModalOpen(false);
          const updated = await showService.getShows();
          if (updated.success) setShows(updated.shows);
        }
      } else {
        const res = await adminService.createShow(showData);
        if (res.success) {
          toast.success('New showtime scheduled successfully!');
          setModalOpen(false);
          const updated = await showService.getShows();
          if (updated.success) setShows(updated.shows);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save show. Check for screen/time clashes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title, time) => {
    if (window.confirm(`Are you sure you want to cancel the ${time} show for "${title}"?`)) {
      try {
        const res = await adminService.deleteShow(id);
        if (res.success) {
          toast.success('Show cancelled and removed.');
          setShows(shows.filter((s) => s._id !== id));
        }
      } catch (error) {
        toast.error(error.message || 'Failed to cancel show.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
              Showtime Scheduling & Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Create, edit, and delete showtimes. Assign movies, theatres, screens, languages, and dates with automatic time categorization.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Schedule New Showtime</span>
          </button>
        </div>

        {/* Categories Reference Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {SHOW_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                {cat.label}
              </span>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.15rem' }}>
                {cat.timeRange}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading scheduled screening sessions from MongoDB..." />
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Movie & Language</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Theatre & Screen</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date & Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Starting Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Seat Availability</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Pricing Tiers</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => {
                  const movieTitle = s.movieId?.title || 'Movie';
                  const theatreName = s.theatreId?.name || 'Multiplex';
                  const category = getShowtimeCategory(s.startTime);

                  return (
                    <tr key={s._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ fontWeight: 800, color: '#ffffff' }}>{movieTitle}</p>
                        <span className="badge badge-red" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                          {s.language} Audio
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ color: '#ffffff', fontWeight: 600 }}>{theatreName}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.screenNumber}</p>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ color: '#ffffff' }}>{formatDate(s.showDate)}</p>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                          {category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                        {s.startTime}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          to {s.endTime}
                        </p>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor:
                                s.availableSeats === 0
                                  ? '#ef4444'
                                  : s.availableSeats <= 30
                                  ? '#f59e0b'
                                  : '#22c55e'
                            }}
                          />
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>
                            {s.availableSeats ?? 160} / {s.totalSeats ?? 160}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>seats open</span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>Silver: ₹{s.seatPricing?.Silver}</div>
                        <div>Gold: ₹{s.seatPricing?.Gold}</div>
                        <div>Platinum: ₹{s.seatPricing?.Platinum}</div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.4rem 0.6rem' }}
                            title="Edit showtime"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id, movieTitle, s.startTime)}
                            className="btn btn-sm btn-danger"
                            style={{ padding: '0.4rem 0.6rem' }}
                            title="Delete showtime"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 6, 8, 0.88)',
              backdropFilter: 'blur(8px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto'
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="glass-panel"
              style={{ width: '100%', maxWidth: '640px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {editingShow ? 'Edit Screening Schedule' : 'Schedule New Cinema Screening'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Movie Selector */}
                <div>
                  <label className="input-label">Select Movie</label>
                  <select
                    value={movieId}
                    onChange={(e) => setMovieId(e.target.value)}
                    className="input-field"
                    style={{ background: '#161922' }}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.availableLanguages?.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theatre & Screen */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Select Theatre</label>
                    <select
                      value={theatreId}
                      onChange={(e) => setTheatreId(e.target.value)}
                      className="input-field"
                      style={{ background: '#161922' }}
                      required
                    >
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Screen Number</label>
                    <select
                      value={screenNumber}
                      onChange={(e) => setScreenNumber(e.target.value)}
                      className="input-field"
                      style={{ background: '#161922' }}
                      required
                    >
                      <option value="Screen 1">Screen 1</option>
                      <option value="Screen 2">Screen 2</option>
                      <option value="Screen 3">Screen 3</option>
                    </select>
                  </div>
                </div>

                {/* Audio Language & Show Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Audio Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="input-field"
                      style={{ background: '#161922' }}
                      required
                    >
                      {AUDIO_LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Show Date</label>
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) => setShowDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Start Time & End Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 09:30 AM or 04:15 PM"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 12:15 PM or 07:00 PM"
                      required
                    />
                  </div>
                </div>

                {/* Live Automatic Category Assignment Indicator */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid var(--border-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                      Automatic Category Assigned:
                    </span>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                    {categoryMeta.label} ({categoryMeta.timeRange})
                  </span>
                </div>

                {/* Tier Pricing */}
                <div>
                  <label className="input-label">Configurable Seat Tier Prices (₹)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Silver Tier</span>
                      <input
                        type="number"
                        value={silverPrice}
                        onChange={(e) => setSilverPrice(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#f5c518', fontWeight: 700 }}>Gold Tier</span>
                      <input
                        type="number"
                        value={goldPrice}
                        onChange={(e) => setGoldPrice(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 700 }}>Platinum Tier</span>
                      <input
                        type="number"
                        value={platinumPrice}
                        onChange={(e) => setPlatinumPrice(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingShow ? 'Update Showtime' : 'Schedule Showtime'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminShowsPage;
