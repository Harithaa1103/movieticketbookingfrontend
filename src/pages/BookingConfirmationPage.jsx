import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, ArrowRight, Home, RefreshCw, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import DigitalTicket from '../components/booking/DigitalTicket';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const passedBooking = location.state?.booking;

  const [booking, setBooking] = useState(passedBooking || null);
  const [loading, setLoading] = useState(!passedBooking);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBooking = async () => {
      try {
        if (!passedBooking) setLoading(true);
        setErrorMessage('');
        const res = await bookingService.getById(id);
        if (isMounted && res.success && res.booking) {
          setBooking(res.booking);
        }
      } catch (error) {
        console.error('Failed to load booking confirmation:', error);
        if (isMounted && !passedBooking) {
          setErrorMessage(error.message || 'Unable to load booking details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooking();

    return () => {
      isMounted = false;
    };
  }, [id, passedBooking]);

  if (loading && !booking) {
    return <LoadingSpinner text="Retrieving your confirmed CINE MAX digital ticket..." />;
  }

  if (!booking) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}
        >
          <AlertCircle size={32} color="var(--accent-red)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem' }}>
          Booking Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          {errorMessage || `We could not locate any reservation matching reference "${id}". Please check your booking reference or verify in your account.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            <Ticket size={18} />
            <span>Check My Bookings</span>
          </Link>
          <Link to="/" className="btn btn-secondary">
            <Home size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Confirmation Header Banner */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <CheckCircle2 size={36} color="#4ade80" />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '0.5rem'
          }}
        >
          Booking Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Your seats are successfully reserved. Present this digital ticket at the cinema screen entrance.
        </p>
      </div>

      {/* Digital QR Ticket */}
      <DigitalTicket booking={booking} />

      {/* Action Links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '3rem',
          flexWrap: 'wrap'
        }}
      >
        <Link to="/my-bookings" className="btn btn-primary">
          <Ticket size={18} />
          <span>View All My Bookings</span>
        </Link>
        <Link to="/" className="btn btn-secondary">
          <Home size={18} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
