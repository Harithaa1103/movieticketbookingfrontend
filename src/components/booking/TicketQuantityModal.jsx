import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Ticket,
  Film,
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useBooking } from '../../context/BookingContext';

const PRESETS_BY_QUANTITY = {
  3: [[2, 1]],
  4: [[3, 1], [2, 2]],
  5: [[3, 2], [4, 1], [2, 2, 1]],
  6: [[3, 3], [4, 2], [2, 2, 2]],
  7: [[3, 2, 2], [4, 3], [5, 2]],
  8: [[4, 4], [3, 3, 2], [5, 3]],
  9: [[3, 3, 3], [4, 3, 2], [5, 4]],
  10: [[5, 5], [4, 3, 3], [4, 4, 2]]
};

const TicketQuantityModal = ({
  isOpen,
  onClose,
  movie,
  theatre,
  show,
  quantity,
  onQuantityChange,
  onConfirm
}) => {
  const { seatGroups, setSeatGroups } = useBooking();

  const [isFlexibleMode, setIsFlexibleMode] = useState(
    Array.isArray(seatGroups) && seatGroups.length > 1
  );
  const [localGroups, setLocalGroups] = useState(
    Array.isArray(seatGroups) && seatGroups.length > 0
      ? seatGroups
      : [{ groupNumber: 1, size: quantity }]
  );

  // Sync local groups when quantity or modal open status changes
  useEffect(() => {
    if (!isOpen) return;

    if (!isFlexibleMode || quantity <= 1) {
      setLocalGroups([{ groupNumber: 1, size: quantity }]);
    } else {
      // Re-verify that sum equals quantity
      const currentSum = localGroups.reduce((acc, g) => acc + g.size, 0);
      if (currentSum !== quantity) {
        // Apply default preset for this quantity if available, else 3 + 1 or similar
        const presets = PRESETS_BY_QUANTITY[quantity];
        if (presets && presets.length > 0) {
          applyPreset(presets[0]);
        } else {
          setLocalGroups([
            { groupNumber: 1, size: Math.max(1, quantity - 1) },
            { groupNumber: 2, size: 1 }
          ]);
        }
      }
    }
  }, [quantity, isOpen]);

  if (!isOpen || !movie || !show) return null;

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      onQuantityChange(newQty);
      if (!isFlexibleMode) {
        setLocalGroups([{ groupNumber: 1, size: newQty }]);
      }
    }
  };

  const handleIncrease = () => {
    if (quantity < 10) {
      const newQty = quantity + 1;
      onQuantityChange(newQty);
      if (!isFlexibleMode) {
        setLocalGroups([{ groupNumber: 1, size: newQty }]);
      }
    }
  };

  const toggleMode = (flexible) => {
    setIsFlexibleMode(flexible);
    if (!flexible) {
      setLocalGroups([{ groupNumber: 1, size: quantity }]);
    } else {
      const presets = PRESETS_BY_QUANTITY[quantity];
      if (presets && presets.length > 0) {
        applyPreset(presets[0]);
      } else {
        setLocalGroups([
          { groupNumber: 1, size: Math.max(1, quantity - 1) },
          { groupNumber: 2, size: 1 }
        ]);
      }
    }
  };

  const applyPreset = (sizes) => {
    const formatted = sizes.map((s, idx) => ({
      groupNumber: idx + 1,
      size: s
    }));
    setLocalGroups(formatted);
  };

  const handleGroupSizeChange = (index, delta) => {
    const updated = [...localGroups];
    const newSize = updated[index].size + delta;
    if (newSize < 1) return;
    updated[index].size = newSize;
    setLocalGroups(updated);
  };

  const handleAddGroup = () => {
    if (localGroups.length >= quantity) return;
    setLocalGroups([
      ...localGroups,
      { groupNumber: localGroups.length + 1, size: 1 }
    ]);
  };

  const handleRemoveGroup = (index) => {
    if (localGroups.length <= 1) return;
    const filtered = localGroups.filter((_, i) => i !== index);
    const renumbered = filtered.map((g, idx) => ({
      ...g,
      groupNumber: idx + 1
    }));
    setLocalGroups(renumbered);
  };

  const currentSum = localGroups.reduce((acc, g) => acc + g.size, 0);
  const isSumValid = currentSum === quantity;

  const handleModalConfirm = () => {
    if (!isSumValid) return;

    if (isFlexibleMode) {
      setSeatGroups(localGroups);
    } else {
      setSeatGroups([{ groupNumber: 1, size: quantity }]);
    }

    if (onConfirm) {
      onConfirm();
    }
  };

  const availablePresets = PRESETS_BY_QUANTITY[quantity] || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 6, 8, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          boxShadow: 'var(--shadow-lg), 0 0 35px var(--accent-red-glow)',
          border: '1px solid rgba(229, 9, 20, 0.45)',
          animation: 'fadeIn 0.25s ease-out',
          borderRadius: 'var(--radius-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            transition: 'all 0.2s ease'
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header with Movie Thumbnail */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <img
            src={movie.poster}
            alt={movie.title}
            style={{
              width: '75px',
              height: '110px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
              flexShrink: 0
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="badge badge-red" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>
              {show.language} Audio
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '0.35rem' }}>
              {movie.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <MapPin size={13} color="var(--accent-red)" />
              <span>{theatre?.name || 'CineMax Multiplex'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
              <span>{formatDate(show.showDate)}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{show.startTime}</span>
            </div>
          </div>
        </div>

        {/* Ticket Quantity Stepper Box */}
        <div
          style={{
            background: 'rgba(10, 11, 14, 0.7)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: 'var(--accent-gold)' }}>
            <Ticket size={20} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Total Number of Tickets
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.75rem 0' }}>
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: quantity <= 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(229, 9, 20, 0.15)',
                border: `1px solid ${quantity <= 1 ? 'var(--border-subtle)' : 'var(--accent-red)'}`,
                color: quantity <= 1 ? 'var(--text-muted)' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label="Decrease tickets"
            >
              <Minus size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#ffffff',
                  textShadow: '0 0 16px var(--accent-red-glow)'
                }}
              >
                {quantity}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {quantity === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>

            <button
              onClick={handleIncrease}
              disabled={quantity >= 10}
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: quantity >= 10 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(229, 9, 20, 0.15)',
                border: `1px solid ${quantity >= 10 ? 'var(--border-subtle)' : 'var(--accent-red)'}`,
                color: quantity >= 10 ? 'var(--text-muted)' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label="Increase tickets"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Seat Arrangement Mode Selector (Only if quantity > 1) */}
        {quantity > 1 && (
          <div
            style={{
              background: 'rgba(16, 20, 28, 0.75)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} color="var(--accent-gold)" />
                Seat Arrangement Option
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {isFlexibleMode ? 'Flexible Multi-Group' : 'Standard Adjacent'}
              </span>
            </div>

            {/* Segmented Mode Control */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}
            >
              <button
                type="button"
                onClick={() => toggleMode(false)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: !isFlexibleMode ? 'var(--accent-red)' : 'transparent',
                  color: !isFlexibleMode ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Users size={14} />
                <span>Sit Together (1 Group)</span>
              </button>

              <button
                type="button"
                onClick={() => toggleMode(true)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isFlexibleMode ? 'linear-gradient(135deg, var(--accent-gold) 0%, #b89225 100%)' : 'transparent',
                  color: isFlexibleMode ? '#0a0b0e' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Layers size={14} />
                <span>Flexible Groups</span>
              </button>
            </div>

            {/* Flexible Group Builder */}
            {isFlexibleMode ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  Divide your <strong>{quantity} tickets</strong> into separate groups. Each group sits consecutively in their row:
                </p>

                {/* Preset Suggestions */}
                {availablePresets.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Quick Presets:
                    </span>
                    {availablePresets.map((preset, pIdx) => {
                      const label = preset.join(' + ');
                      const isMatch =
                        localGroups.length === preset.length &&
                        localGroups.every((g, i) => g.size === preset[i]);

                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${isMatch ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                            background: isMatch ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                            color: isMatch ? 'var(--accent-gold)' : '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Individual Group Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                  {localGroups.map((group, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: idx === 0 ? 'var(--accent-red)' : idx === 1 ? 'var(--accent-gold)' : '#38bdf8',
                            color: idx === 1 ? '#0a0b0e' : '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                            Group {idx + 1}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {group.size === 1 ? '1 Individual Seat' : `${group.size} Consecutive Seats Together`}
                          </div>
                        </div>
                      </div>

                      {/* Stepper + Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleGroupSizeChange(idx, -1)}
                            disabled={group.size <= 1}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: group.size <= 1 ? 'var(--text-muted)' : '#ffffff',
                              cursor: group.size <= 1 ? 'not-allowed' : 'pointer',
                              padding: '2px 4px'
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', minWidth: '18px', textAlign: 'center' }}>
                            {group.size}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGroupSizeChange(idx, 1)}
                            disabled={currentSum >= quantity}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: currentSum >= quantity ? 'var(--text-muted)' : '#ffffff',
                              cursor: currentSum >= quantity ? 'not-allowed' : 'pointer',
                              padding: '2px 4px'
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {localGroups.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGroup(idx)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: 'none',
                              color: '#ef4444',
                              borderRadius: '4px',
                              padding: '0.3rem',
                              cursor: 'pointer'
                            }}
                            title="Remove this group"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Group & Validation Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {localGroups.length < quantity && (
                    <button
                      type="button"
                      onClick={handleAddGroup}
                      style={{
                        background: 'transparent',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.75rem',
                        color: 'var(--accent-gold)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Another Group</span>
                    </button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', marginLeft: 'auto' }}>
                    {isSumValid ? (
                      <span style={{ color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={14} /> Total {currentSum}/{quantity} Tickets Match
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertCircle size={14} /> Allocated {currentSum} of {quantity} (Adjust to match)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                All {quantity} seats will be automatically allocated consecutively next to each other in the same row.
              </p>
            )}
          </div>
        )}

        {/* Required Confirmation Button: BOOK YOUR TICKETS NOW */}
        <button
          onClick={handleModalConfirm}
          disabled={!isSumValid}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            fontWeight: 800,
            fontSize: '1.05rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '1rem 1.5rem',
            opacity: isSumValid ? 1 : 0.6,
            cursor: isSumValid ? 'pointer' : 'not-allowed'
          }}
        >
          BOOK YOUR TICKETS NOW
        </button>
      </div>
    </div>
  );
};

export default TicketQuantityModal;
