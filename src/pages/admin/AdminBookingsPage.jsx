import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, QrCode, CheckCircle, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DigitalTicket from '../../components/booking/DigitalTicket';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getAllBookings(params);
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings log.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
            Bookings & Reservations Audit
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Inspect full transaction logs, seat allocations, and simulated payment settlements across all cinema theatres.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by Booking Reference (e.g. CMX-774910)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              <span>Search</span>
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status:</span>
            <button
              onClick={() => setStatusFilter('')}
              className={`badge ${statusFilter === '' ? 'badge-gold' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`badge ${statusFilter === 'confirmed' ? 'badge-green' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
            >
              Confirmed
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Querying booking logs..." />
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Movie & Theatre</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Show Date & Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Seats Reserved</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Grand Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ticket</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {b.bookingId}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, color: '#ffffff' }}>{b.userId?.name || 'Customer'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.userId?.email}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, color: '#ffffff' }}>{b.movieId?.title || 'Movie'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {b.theatreId?.name} ({b.screenNumber})
                      </p>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <p>{formatDate(b.showDate)}</p>
                      <p style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{b.startTime}</p>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {b.selectedSeats?.map((s) => s.seatIdentifier || `${s.row}${s.number}`).join(', ')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                      {formatCurrency(b.grandTotal)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedTicketBooking(b)}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.4rem 0.75rem' }}
                      >
                        <QrCode size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for viewing ticket */}
        {selectedTicketBooking && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 6, 8, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto'
            }}
            onClick={() => setSelectedTicketBooking(null)}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedTicketBooking(null)}
                style={{ position: 'absolute', top: '-2.5rem', right: 0, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <X size={20} />
                <span>Close</span>
              </button>
              <DigitalTicket booking={selectedTicketBooking} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBookingsPage;

