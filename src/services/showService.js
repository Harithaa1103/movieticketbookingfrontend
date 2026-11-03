import api from './api';

export const showService = {
  getShows: (params) => api.get('/shows', { params }),
  getById: (id) => api.get(`/shows/${id}`),
  getSeats: (showId) => api.get(`/shows/${showId}/seats`)
};

