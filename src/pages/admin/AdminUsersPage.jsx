import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Check, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change ${user.name}'s role from "${user.role}" to "${newRole}"?`)) {
      try {
        const res = await adminService.updateUserRole(user._id, newRole);
        if (res.success) {
          toast.success(`User role updated to ${newRole}.`);
          setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
        }
      } catch (error) {
        toast.error(error.message || 'Failed to update user role.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '2.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
            User Account Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage registered customer accounts and configure administrative role permissions.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving registered customer roster..." />
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Role Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-gold'}`}
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;

