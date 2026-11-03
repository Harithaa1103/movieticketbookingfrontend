import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, X, MapPin } from 'lucide-react';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const toast = useToast();

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('Chennai');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [facilities, setFacilities] = useState('Dolby Atmos 7.1, 4K Laser Projection, Gourmet Snack Bar, Valet Parking');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await theatreService.getAll();
      if (res.success) {
        setTheatres(res.theatres);
      }
    } catch (error) {
      console.error('Error fetching theatres:', error);
      toast.error('Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setName('');
    setCity('Chennai');
    setLocation('');
    setAddress('');
    setFacilities('Dolby Atmos 7.1, 4K Laser Projection, Gourmet Snack Bar, Valet Parking');
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTheatre(t);
    setName(t.name);
    setCity(t.city);
    setLocation(t.location);
    setAddress(t.address);
    setFacilities(t.facilities?.join(', ') || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const theatreData = {
      name,
      city,
      location,
      address,
      facilities: facilities.split(',').map((f) => f.trim()),
      screens: editingTheatre?.screens?.length
        ? editingTheatre.screens
        : [
            {
              screenNumber: 'Screen 1',
              screenName: 'Audi 1 - Dolby Atmos',
              totalSeats: 160,
              layoutConfig: { totalRows: 10, seatsPerRow: 16, aisleColIndices: [4, 12] }
            },
            {
              screenNumber: 'Screen 2',
              screenName: 'Audi 2 - 4K Laser',
              totalSeats: 160,
              layoutConfig: { totalRows: 10, seatsPerRow: 16, aisleColIndices: [4, 12] }
            }
          ]
    };

    try {
      setSubmitting(true);
      if (editingTheatre) {
        const res = await adminService.updateTheatre(editingTheatre._id, theatreData);
        if (res.success) {
          toast.success('Theatre updated successfully!');
        }
      } else {
        const res = await adminService.createTheatre(theatreData);
        if (res.success) {
          toast.success('New theatre added successfully!');
        }
      }
      setModalOpen(false);
      fetchTheatres();
    } catch (error) {
      toast.error(error.message || 'Failed to save theatre.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, theatreName) => {
    if (window.confirm(`Are you sure you want to delete "${theatreName}" and all associated shows?`)) {
      try {
        const res = await adminService.deleteTheatre(id);
        if (res.success) {
          toast.success('Theatre deleted.');
          fetchTheatres();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete theatre.');
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
              Theatre Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Add, configure, and manage cinema properties, locations, and screen layouts.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add New Theatre</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading theatre properties..." />
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Theatre Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>City & Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Screens</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amenities</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                      {t.name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{t.location}</span>, {t.city}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {t.screens?.length || 2} Screens
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {t.facilities?.slice(0, 3).map((f) => (
                          <span key={f} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Edit theatre"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Delete theatre"
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

        {/* Modal */}
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
              padding: '1.5rem'
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="glass-panel"
              style={{ width: '100%', maxWidth: '580px', padding: '2rem', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {editingTheatre ? 'Edit Theatre' : 'Add New Multiplex'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Theatre Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. CineMax Grand Multiplex"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="input-label">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      style={{ background: '#161922' }}
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Area / Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Velachery"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Full Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    placeholder="Mall / Street address"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Facilities / Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingTheatre ? 'Update Theatre' : 'Add Theatre'}
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

export default AdminTheatresPage;

