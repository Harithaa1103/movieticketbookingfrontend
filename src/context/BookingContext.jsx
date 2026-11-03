import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem('cinemax_city') || 'Chennai'
  );
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(2); // Default to 2 tickets
  const [seatGroups, setSeatGroups] = useState([{ groupNumber: 1, size: 2 }]); // Flexible Seat Groups
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [activeHoldExpiresAt, setActiveHoldExpiresAt] = useState(null);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState(null);

  // Active Hold Countdown Timer
  useEffect(() => {
    if (!activeHoldExpiresAt) {
      setHoldTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeHoldExpiresAt) - new Date()) / 1000)
      );
      setHoldTimeRemaining(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        // Hold expired
        setActiveHoldExpiresAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHoldExpiresAt]);

  const updateCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('cinemax_city', city);
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedLanguage('');
    setSelectedTheatre(null);
    setSelectedShow(null);
    setTicketQuantity(2);
    setSeatGroups([{ groupNumber: 1, size: 2 }]);
    setSelectedSeats([]);
    setPricing(null);
    setActiveHoldExpiresAt(null);
    setHoldTimeRemaining(null);
  };

  const setHoldData = (expiresAt, priceData) => {
    setActiveHoldExpiresAt(expiresAt);
    setPricing(priceData);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedCity,
        setSelectedCity: updateCity,
        selectedMovie,
        setSelectedMovie,
        selectedLanguage,
        setSelectedLanguage,
        selectedTheatre,
        setSelectedTheatre,
        selectedDate,
        setSelectedDate,
        selectedShow,
        setSelectedShow,
        ticketQuantity,
        setTicketQuantity,
        seatGroups,
        setSeatGroups,
        selectedSeats,
        setSelectedSeats,
        pricing,
        setPricing,
        activeHoldExpiresAt,
        holdTimeRemaining,
        setHoldData,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

