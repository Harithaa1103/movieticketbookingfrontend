import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import BookingSummary from '../components/booking/BookingSummary';

const BookingSummaryPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    pricing,
    holdTimeRemaining
  } = useBooking();

  // If user navigates directly without selecting seats, redirect back
  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0 || !pricing) {
      toast.warning('No active seat selection found. Please select your seats.');
      navigate(`/seat-selection/${showId}`, { replace: true });
    }
  }, [selectedSeats, pricing, showId, navigate, toast]);

  // If hold timer expires
  useEffect(() => {
    if (holdTimeRemaining === 0) {
      toast.error('Your 8-minute seat reservation has expired. Please choose your seats again.');
      navigate(`/seat-selection/${showId}`, { replace: true });
    }
  }, [holdTimeRemaining, showId, navigate, toast]);

  const handleProceedToPayment = () => {
    navigate(`/payment/${showId}`);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <button
        onClick={() => navigate(`/seat-selection/${showId}`)}
        className="btn btn-sm btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Seat Map</span>
      </button>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
          Booking Review & Price Summary
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Please review your screening details before completing the checkout.
        </p>
      </div>

      <BookingSummary
        movie={selectedMovie || selectedShow?.movieId}
        theatre={selectedTheatre || selectedShow?.theatreId}
        show={selectedShow}
        selectedSeats={selectedSeats}
        pricing={pricing}
        timeRemaining={holdTimeRemaining}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  );
};

export default BookingSummaryPage;
