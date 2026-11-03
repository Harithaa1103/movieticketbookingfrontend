import api from './api';

export const movieService = {
  getAll: (params) => api.get('/movies', { params }),
  getRecent: () => api.get('/movies/recent'),
  getUpcoming: () => api.get('/movies/upcoming'),
  getById: (id) => api.get(`/movies/${id}`)
};

