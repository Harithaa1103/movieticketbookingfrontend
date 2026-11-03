import api from './api';

export const bookingService = {
  holdSeats: (data) => api.post('/bookings/hold-seats', data),
  releaseHold: (data) => api.post('/bookings/release-hold', data),
  calculatePrice: (data) => api.post('/bookings/calculate-price', data),
  confirmBooking: (data) => api.post('/bookings/confirm', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`)
};

