import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Film, MapPin, Calendar, AlertCircle, Layers, Users } from 'lucide-react';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SeatLayout from '../components/booking/SeatLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    ticketQuantity,
    seatGroups,
    selectedSeats,
    setSelectedSeats,
    setHoldData
  } = useBooking();

  const [seatData, setSeatData] = useState(null);
  const [show, setShow] = useState(selectedShow);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch real-time seat availability for this show
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const [seatsRes, showRes] = await Promise.all([
          showService.getSeats(showId),
          show ? Promise.resolve({ success: true, show }) : showService.getById(showId)
        ]);

        if (seatsRes.success) {
          setSeatData(seatsRes);
        }

        if (showRes.success) {
          setShow(showRes.show);
        }
      } catch (error) {
        console.error('Error fetching seat layout:', error);
        toast.error('Failed to load cinema seat map. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showId]);

  const handleSeatsSelected = (seats) => {
    setSelectedSeats(seats);
  };

  const handleProceed = async () => {
    if (!user) {
      toast.warning('Please sign in or register to complete your seat reservation.');
      navigate('/login', { state: { from: `/seat-selection/${showId}` } });
      return;
    }

    if (selectedSeats.length !== ticketQuantity) {
      toast.error(`Please select exactly ${ticketQuantity} seats.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingService.holdSeats({
        showId,
        seats: selectedSeats,
        groups: seatGroups
      });

      if (res.success) {
        // Save hold expiry and authoritative pricing in BookingContext
        setHoldData(res.expiresAt, res.pricing);
        toast.success(`Seats locked for ${res.holdDurationSeconds / 60} minutes!`);
        navigate(`/booking-summary/${showId}`);
      }
    } catch (error) {
      console.error('Failed to hold seats:', error);
      toast.error(error.message || 'Sorry! These seats were just booked. Please pick another seat group.');
      // Refresh seat layout to show updated occupancy
      const refreshed = await showService.getSeats(showId);
      if (refreshed.success) {
        setSeatData(refreshed);
      }
      setSelectedSeats([]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Arranging theatre seat layout..." />;
  }

  const movieTitle = show?.movieId?.title || selectedMovie?.title || 'Selected Movie';
  const theatreName = show?.theatreId?.name || selectedTheatre?.name || 'CineMax Multiplex';
  const screenName = seatData?.screenName || `Screen ${show?.screenNumber || '1'}`;
  const showDate = show?.showDate;
  const startTime = show?.startTime;

  const isMultiGroup = Array.isArray(seatGroups) && seatGroups.length > 1;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Top Navigation & Movie Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="btn btn-sm btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Change Showtime</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
            {movieTitle}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {theatreName} • {screenName} • <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{startTime}</span> ({formatDate(showDate)})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="badge badge-red">{show?.language || 'Tamil'} Audio</span>
          <span className="badge badge-gold">{ticketQuantity} {ticketQuantity === 1 ? 'Ticket' : 'Tickets'}</span>
          {isMultiGroup && (
            <span
              className="badge"
              style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Layers size={12} />
              {seatGroups.map((g) => `G${g.groupNumber}: ${g.size}`).join(' + ')}
            </span>
          )}
        </div>
      </div>

      {/* Main Seat Layout with Automatic Adjacent-Seat Selection */}
      <SeatLayout
        layoutConfig={seatData?.layoutConfig}
        seatPricing={seatData?.seatPricing || show?.seatPricing}
        seatStatusMap={seatData?.seatStatusMap}
        ticketQuantity={ticketQuantity}
        seatGroups={seatGroups}
        selectedSeats={selectedSeats}
        onSeatsSelected={handleSeatsSelected}
        onProceed={handleProceed}
        currentUserId={user?._id}
      />
    </div>
  );
};

export default SeatSelectionPage;
