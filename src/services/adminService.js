import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),

  // Movies
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),

  // Theatres
  createTheatre: (data) => api.post('/admin/theatres', data),
  updateTheatre: (id, data) => api.put(`/admin/theatres/${id}`, data),
  deleteTheatre: (id) => api.delete(`/admin/theatres/${id}`),

  // Shows
  createShow: (data) => api.post('/admin/shows', data),
  updateShow: (id, data) => api.put(`/admin/shows/${id}`, data),
  deleteShow: (id) => api.delete(`/admin/shows/${id}`),

  // Bookings & Users
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};

