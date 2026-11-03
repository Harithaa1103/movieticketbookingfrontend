import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit, Trash2, X, Star, Calendar, Clock } from 'lucide-react';
import { movieService } from '../../services/movieService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AUDIO_LANGUAGES } from '../../utils/constants';
import { formatDuration, formatDate } from '../../utils/formatters';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const toast = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState('');
  const [banner, setBanner] = useState('');
  const [genre, setGenre] = useState('Action, Thriller');
  const [duration, setDuration] = useState(150);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableLanguages, setAvailableLanguages] = useState(['Tamil', 'Telugu']);
  const [releaseStatus, setReleaseStatus] = useState('Now Showing');
  const [rating, setRating] = useState(8.0);
  const [isAdvanceBooking, setIsAdvanceBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePosterFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast.error('Image file size must be less than 6MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPoster(event.target.result);
      toast.success('Custom poster image loaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Banner file size must be less than 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setBanner(event.target.result);
      toast.success('Custom banner image loaded!');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieService.getAll();
      if (res.success) {
        setMovies(res.movies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600');
    setBanner('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600');
    setGenre('Action, Thriller');
    setDuration(150);
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setAvailableLanguages(['Tamil', 'Telugu']);
    setReleaseStatus('Now Showing');
    setRating(8.0);
    setIsAdvanceBooking(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDescription(movie.description);
    setPoster(movie.poster);
    setBanner(movie.banner);
    setGenre(movie.genre?.join(', ') || 'Action');
    setDuration(movie.duration);
    setReleaseDate(new Date(movie.releaseDate).toISOString().split('T')[0]);
    setAvailableLanguages(movie.availableLanguages || []);
    setReleaseStatus(movie.releaseStatus);
    setRating(movie.rating);
    setIsAdvanceBooking(movie.isAdvanceBooking || false);
    setModalOpen(true);
  };

  const handleToggleLanguage = (lang) => {
    if (availableLanguages.includes(lang)) {
      if (availableLanguages.length > 1) {
        setAvailableLanguages(availableLanguages.filter((l) => l !== lang));
      } else {
        toast.warning('At least one audio language must be selected.');
      }
    } else {
      setAvailableLanguages([...availableLanguages, lang]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const movieData = {
      title,
      description,
      poster,
      banner,
      genre: genre.split(',').map((g) => g.trim()),
      duration: Number(duration),
      releaseDate,
      availableLanguages,
      releaseStatus,
      rating: Number(rating),
      isAdvanceBooking
    };

    try {
      setSubmitting(true);
      if (editingMovie) {
        const res = await adminService.updateMovie(editingMovie._id, movieData);
        if (res.success) {
          toast.success('Movie updated successfully!');
        }
      } else {
        const res = await adminService.createMovie(movieData);
        if (res.success) {
          toast.success('New movie created successfully!');
        }
      }
      setModalOpen(false);
      fetchMovies();
    } catch (error) {
      toast.error(error.message || 'Failed to save movie.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}" and all associated shows?`)) {
      try {
        const res = await adminService.deleteMovie(id);
        if (res.success) {
          toast.success('Movie deleted successfully.');
          fetchMovies();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete movie.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
              Movie Catalog Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage theatrical titles, poster artwork, synopsis, and supported audio tracks.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add New Movie</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading movies catalog..." />
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Poster</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Title & Genre</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Audio Languages</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <img
                        src={m.poster}
                        alt={m.title}
                        style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 800, color: '#ffffff' }}>{m.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.genre?.join(', ')}</p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {formatDuration(m.duration)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {m.availableLanguages?.map((l) => (
                          <span key={l} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${m.releaseStatus === 'Now Showing' ? 'badge-red' : 'badge-gold'}`}>
                        {m.releaseStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      ★ {m.rating?.toFixed(1) || '0.0'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Edit movie"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.title)}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Delete movie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
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
              style={{
                width: '100%',
                maxWidth: '650px',
                padding: '2rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {editingMovie ? 'Edit Movie Details' : 'Add New Theatrical Movie'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label className="input-label">Movie Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Synopsis / Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Poster Image (URL or Upload File)</label>
                    <input
                      type="text"
                      value={poster}
                      onChange={(e) => setPoster(e.target.value)}
                      placeholder="https://... or upload below"
                      className="input-field"
                      required
                    />
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        className="btn btn-sm btn-secondary"
                        style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        Choose File...
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {poster && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Poster Loaded ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Hero Banner (URL or Upload File)</label>
                    <input
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="https://... or upload below"
                      className="input-field"
                      required
                    />
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        className="btn btn-sm btn-secondary"
                        style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        Choose File...
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {banner && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Banner Loaded ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Poster & Banner Preview */}
                {(poster || banner) && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    {poster && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Poster Preview</span>
                        <img
                          src={poster}
                          alt="Poster preview"
                          style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300';
                          }}
                        />
                      </div>
                    )}
                    {banner && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Banner Preview</span>
                        <img
                          src={banner}
                          alt="Banner preview"
                          style={{ width: '100%', maxHeight: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="input-field"
                      min={60}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">Release Date</label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Release Status</label>
                    <select
                      value={releaseStatus}
                      onChange={(e) => setReleaseStatus(e.target.value)}
                      className="input-field"
                      style={{ background: '#161922' }}
                    >
                      <option value="Now Showing">Now Showing</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                {/* Audio Languages Selector */}
                <div>
                  <label className="input-label">Available Audio Tracks</label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {AUDIO_LANGUAGES.map((lang) => {
                      const isSelected = availableLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleToggleLanguage(lang)}
                          className={`badge ${isSelected ? 'badge-red' : 'badge-gray'}`}
                          style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ffffff' }}>
                    <input
                      type="checkbox"
                      checked={isAdvanceBooking}
                      onChange={(e) => setIsAdvanceBooking(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Allow Advance Booking</span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
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

export default AdminMoviesPage;

