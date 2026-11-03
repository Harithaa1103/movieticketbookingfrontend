import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Building2,
  Ticket,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
            System Administration Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live platform metrics, catalog controls, screening schedules, and booking logs.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Compiling administrative analytics..." />
        ) : (
          <div>
            {/* Stat Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}
            >
              <div className="cinema-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Movies
                  </span>
                  <Film size={20} color="var(--accent-red)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {stats?.totalMovies || 0}
                </span>
              </div>

              <div className="cinema-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Theatres
                  </span>
                  <Building2 size={20} color="var(--accent-gold)" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {stats?.totalTheatres || 0}
                </span>
              </div>

              <div className="cinema-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Users
                  </span>
                  <Users size={20} color="#3b82f6" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {stats?.totalUsers || 0}
                </span>
              </div>

              <div className="cinema-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Confirmed Bookings
                  </span>
                  <Ticket size={20} color="#10b981" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {stats?.totalBookings || 0}
                </span>
              </div>

              <div className="cinema-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Gross Revenue
                  </span>
                  <DollarSign size={20} color="#a855f7" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {formatCurrency(stats?.totalRevenue || 0)}
                </span>
              </div>
            </div>

            {/* Recent Bookings Audit Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    Recent Booking Transactions
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Real-time reservation audit feed.
                  </p>
                </div>

                <Link to="/admin/bookings" className="btn btn-outline btn-sm">
                  <span>View All Bookings</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Booking ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Movie</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Show Date & Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Seats</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings?.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-gold)' }}>
                          {b.bookingId}
                        </td>
                        <td style={{ padding: '1rem', color: '#ffffff' }}>
                          {b.userId?.name || 'Customer'}
                        </td>
                        <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 600 }}>
                          {b.movieId?.title || 'Movie'} ({b.selectedLanguage})
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {formatDate(b.showDate)} at {b.startTime}
                        </td>
                        <td style={{ padding: '1rem', color: '#ffffff' }}>
                          {b.selectedSeats?.map((s) => s.seatIdentifier || `${s.row}${s.number}`).join(', ')}
                        </td>
                        <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 700 }}>
                          {formatCurrency(b.grandTotal)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;

