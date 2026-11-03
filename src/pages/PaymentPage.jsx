import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

const PaymentPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedSeats,
    pricing,
    resetBooking
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('UPI_DEMO'); // or 'CARD_DEMO'
  const [upiId, setUpiId] = useState('demo.customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardHolder, setCardHolder] = useState('STUDENT DEMO USER');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [processing, setProcessing] = useState(false);

  const grandTotal = pricing?.grandTotal || 0;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'UPI_DEMO' && !upiId.includes('@')) {
      toast.error('Please enter a valid simulated UPI ID (e.g., user@okhdfcbank)');
      return;
    }

    if (paymentMethod === 'CARD_DEMO' && cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a 16-digit simulated test card number.');
      return;
    }

    try {
      setProcessing(true);
      const res = await bookingService.confirmBooking({
        showId,
        paymentMethod,
        paymentDetails: {
          simulatedMethod: paymentMethod,
          identifier: paymentMethod === 'UPI_DEMO' ? upiId : `**** **** **** ${cardNumber.slice(-4)}`
        }
      });

      if (res.success && res.booking) {
        toast.success('Simulated payment successful! Digital ticket issued.');
        const confirmedBooking = res.booking;
        const confirmedBookingId = confirmedBooking.bookingId || confirmedBooking._id;
        resetBooking();
        navigate(`/booking-confirmation/${confirmedBookingId}`, {
          state: { booking: confirmedBooking }
        });
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '820px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Summary</span>
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
          Simulated Demo Payment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Academic Coursework Demo Gateway — No real currency or payment credentials are used.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left: Payment Method Controls */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Method Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI_DEMO')}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: paymentMethod === 'UPI_DEMO' ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${paymentMethod === 'UPI_DEMO' ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <QrCode size={18} />
              <span>Simulated UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD_DEMO')}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: paymentMethod === 'CARD_DEMO' ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${paymentMethod === 'CARD_DEMO' ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <CreditCard size={18} />
              <span>Test Card</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePayment}>
            {paymentMethod === 'UPI_DEMO' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <label className="input-label">Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="input-field"
                    required
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    Demo UPI addresses: `user@okaxis`, `cinemax@paytm`, `demo@upi`
                  </p>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-gold)',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <Sparkles size={14} />
                    <span>Instant UPI Simulator</span>
                  </div>
                  Clicking "Pay" will simulate instantaneous approval from the virtual payment gateway and mint your verified digital ticket with QR code.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <label className="input-label">Test Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    placeholder="4532 0000 0000 0000"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Full Name"
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={3}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                marginBottom: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem'
              }}
            >
              <Lock size={14} color="#4ade80" />
              <span>Simulated Payment Gateway: No real bank cards or accounts are billed.</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 800 }}
            >
              {processing ? 'Processing Transaction...' : `PAY ${formatCurrency(grandTotal)} (DEMO)`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary Preview */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            height: 'fit-content'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
            Reservation Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Movie:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                {selectedMovie?.title || selectedShow?.movieId?.title}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Audio Track:</span>
              <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                {selectedShow?.language}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Theatre:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>
                {selectedTheatre?.name || selectedShow?.theatreId?.name}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Showtime:</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                {selectedShow?.startTime}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Seats:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                {selectedSeats?.map((s) => `${s.row}${s.number}`).join(', ')}
              </span>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}
          >
            <span style={{ color: '#ffffff', fontWeight: 800 }}>AMOUNT PAYABLE:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-red)' }}>
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
