import api from './api';

export const theatreService = {
  getAll: (params) => api.get('/theatres', { params }),
  getCities: () => api.get('/theatres/cities'),
  getLocations: () => api.get('/theatres/locations'),
  getById: (id) => api.get(`/theatres/${id}`)
};

