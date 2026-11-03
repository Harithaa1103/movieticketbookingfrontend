import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Sparkles, Film, Calendar } from 'lucide-react';
import { theatreService } from '../services/theatreService';
import { showService } from '../services/showService';
import { useBooking } from '../context/BookingContext';
import DateSelector from '../components/theatres/DateSelector';
import ShowtimeCategoryGrid from '../components/theatres/ShowtimeCategoryGrid';
import TicketQuantityModal from '../components/booking/TicketQuantityModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateYYYYMMDD } from '../utils/formatters';

const TheatreDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    setSelectedMovie,
    setSelectedLanguage,
    setSelectedTheatre,
    setSelectedDate,
    setSelectedShow,
    ticketQuantity,
    setTicketQuantity
  } = useBooking();

  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(formatDateYYYYMMDD(new Date()));
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeShowForModal, setActiveShowForModal] = useState(null);

  useEffect(() => {
    const fetchTheatre = async () => {
      try {
        setLoading(true);
        const res = await theatreService.getById(id);
        if (res.success) {
          setTheatre(res.theatre);
        }
      } catch (error) {
        console.error('Failed to load theatre:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatre();
  }, [id]);

  useEffect(() => {
    if (!theatre) return;

    const fetchShows = async () => {
      try {
        setLoadingShows(true);
        const res = await showService.getShows({
          theatreId: theatre._id,
          date: currentDate
        });
        if (res.success) {
          setShows(res.shows);
        }
      } catch (error) {
        console.error('Failed to fetch theatre shows:', error);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchShows();
  }, [theatre, currentDate]);

  const handleShowSelect = (show) => {
    setActiveShowForModal(show);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (!activeShowForModal || !theatre) return;

    setSelectedMovie(activeShowForModal.movieId);
    setSelectedLanguage(activeShowForModal.language);
    setSelectedTheatre(theatre);
    setSelectedDate(currentDate);
    setSelectedShow(activeShowForModal);

    setModalOpen(false);
    navigate(`/seat-selection/${activeShowForModal._id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading theatre information..." />;
  }

  if (!theatre) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Theatre Not Found</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Theatre Profile Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '3rem',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Building2 size={16} />
              <span>Multiplex Cinema</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              {theatre.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 600 }}>
              <MapPin size={16} />
              <span>{theatre.location}, {theatre.city}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              {theatre.screens?.length || 2} Screens
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {theatre.address}
        </p>

        {/* Amenities */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Available Cinema Amenities
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {theatre.facilities?.map((f) => (
              <span
                key={f}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Showtimes Schedule */}
      <section>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
            Shows Running at this Theatre
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select your preferred movie screening date and time.
          </p>
        </div>

        <DateSelector selectedDate={currentDate} onDateChange={setCurrentDate} />

        {loadingShows ? (
          <LoadingSpinner text="Checking showtimes for this multiplex..." />
        ) : (
          <ShowtimeCategoryGrid
            shows={shows}
            onSelectShow={handleShowSelect}
            selectedDate={currentDate}
          />
        )}
      </section>

      {/* Ticket Quantity Modal */}
      <TicketQuantityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        movie={activeShowForModal?.movieId}
        theatre={theatre}
        show={activeShowForModal}
        quantity={ticketQuantity}
        onQuantityChange={setTicketQuantity}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default TheatreDetailsPage;
