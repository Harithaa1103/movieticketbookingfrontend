import React, { useState, useMemo } from 'react';
import { AlertCircle, Check, Info, Layers, Sparkles, RefreshCw } from 'lucide-react';
import {
  selectAdjacentSeats,
  autoAllocateFlexibleGroups,
  findAlternativeContiguousGroup
} from '../../utils/adjacentSeats';
import { formatCurrency } from '../../utils/formatters';

const GROUP_STYLES = {
  1: {
    name: 'Group 1',
    bg: 'var(--accent-red)',
    border: '#ff4b55',
    color: '#ffffff',
    glow: 'rgba(229, 9, 20, 0.8)',
    tagBg: '#ffffff',
    tagColor: 'var(--accent-red)'
  },
  2: {
    name: 'Group 2',
    bg: '#f5c518',
    border: '#fde047',
    color: '#0a0b0e',
    glow: 'rgba(245, 197, 24, 0.8)',
    tagBg: '#0a0b0e',
    tagColor: '#f5c518'
  },
  3: {
    name: 'Group 3',
    bg: '#0284c7',
    border: '#38bdf8',
    color: '#ffffff',
    glow: 'rgba(2, 132, 199, 0.8)',
    tagBg: '#ffffff',
    tagColor: '#0284c7'
  },
  4: {
    name: 'Group 4',
    bg: '#10b981',
    border: '#34d399',
    color: '#ffffff',
    glow: 'rgba(16, 185, 129, 0.8)',
    tagBg: '#ffffff',
    tagColor: '#10b981'
  }
};

const SeatLayout = ({
  layoutConfig = {
    totalRows: 10,
    seatsPerRow: 16,
    aisleColIndices: [4, 12],
    rowCategoryMapping: {
      A: 'Silver', B: 'Silver', C: 'Silver',
      D: 'Gold', E: 'Gold', F: 'Gold', G: 'Gold',
      H: 'Platinum', I: 'Platinum', J: 'Platinum'
    }
  },
  seatPricing = { Silver: 150, Gold: 220, Platinum: 350 },
  seatStatusMap = {},
  ticketQuantity = 2,
  seatGroups = null,
  selectedSeats = [],
  onSeatsSelected,
  onProceed,
  currentUserId
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestedBlock, setSuggestedBlock] = useState(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const rows = ['J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const seatsPerRow = layoutConfig.seatsPerRow || 16;
  const aisleCols = layoutConfig.aisleColIndices || [4, 12];
  const rowCategories = layoutConfig.rowCategoryMapping || {};

  const normalizedGroups = useMemo(() => {
    if (Array.isArray(seatGroups) && seatGroups.length > 0) {
      return seatGroups.map((g, idx) => ({
        groupNumber: g.groupNumber || idx + 1,
        size: g.size || 1
      }));
    }
    return [{ groupNumber: 1, size: ticketQuantity }];
  }, [seatGroups, ticketQuantity]);

  const isMultiGroup = normalizedGroups.length > 1;
  const activeGroup = normalizedGroups[activeGroupIndex] || normalizedGroups[0];

  const getSeatCategory = (row) => {
    return (
      rowCategories[row] ||
      (['H', 'I', 'J'].includes(row)
        ? 'Platinum'
        : ['D', 'E', 'F', 'G'].includes(row)
        ? 'Gold'
        : 'Silver')
    );
  };

  const getSeatIdentifier = (row, col) => `${row}-${col}`;

  // Build full map of all rows
  const allRowsMap = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      const category = getSeatCategory(row);
      const rowList = [];
      for (let c = 1; c <= seatsPerRow; c++) {
        rowList.push({
          seatIdentifier: getSeatIdentifier(row, c),
          row,
          number: c,
          category,
          price: seatPricing[category] || 150
        });
      }
      map[row] = rowList;
    });
    return map;
  }, [rows, seatsPerRow, seatPricing, rowCategories]);

  const getSeatStatus = (row, col) => {
    const id = getSeatIdentifier(row, col);
    const item = seatStatusMap[id];
    if (!item) return 'available';
    if (item.status === 'booked') return 'booked';
    if (item.status === 'held_by_me') return 'held_by_me';
    if (item.status === 'held_by_other') return 'held_by_other';
    return 'available';
  };

  // Find if seat is selected and which group it belongs to
  const getSelectedSeatInfo = (row, col) => {
    const seat = selectedSeats.find((s) => s.row === row && s.number === col);
    if (!seat) return null;
    return {
      seat,
      group: seat.group || 1
    };
  };

  // Group seats by groupNumber
  const seatsByGroup = useMemo(() => {
    const map = {};
    normalizedGroups.forEach((g) => {
      map[g.groupNumber] = [];
    });
    selectedSeats.forEach((s) => {
      const gNum = s.group || 1;
      if (!map[gNum]) map[gNum] = [];
      map[gNum].push(s);
    });
    return map;
  }, [selectedSeats, normalizedGroups]);

  // Click on a seat -> Handles allocation
  const handleSeatClick = (row, number) => {
    setErrorMessage('');
    setSuggestedBlock(null);

    const category = getSeatCategory(row);
    const clickedSeat = {
      seatIdentifier: getSeatIdentifier(row, number),
      row,
      number,
      category,
      price: seatPricing[category] || 150
    };

    const rowSeats = allRowsMap[row] || [];

    // CASE 1: Standard Single Group Mode
    if (!isMultiGroup) {
      const result = selectAdjacentSeats({
        startSeat: clickedSeat,
        quantity: ticketQuantity,
        allRowSeats: rowSeats,
        aisleColIndices: aisleCols,
        seatStatusMap,
        currentUserId,
        groupNumber: 1,
        excludedSeatIdentifiers: []
      });

      if (result.success) {
        onSeatsSelected(result.seats);
      } else {
        setErrorMessage(result.message || 'Sorry! These seats are not available together.');
        if (result.suggestion) {
          setSuggestedBlock(result.suggestion);
        }
      }
      return;
    }

    // CASE 2: Multi-Group Mode
    // If no seats selected yet or active group is Group 1, try intelligent multi-group auto-allocation first
    if (selectedSeats.length === 0 && activeGroupIndex === 0) {
      const autoRes = autoAllocateFlexibleGroups({
        groups: normalizedGroups,
        startSeat: clickedSeat,
        allRowsMap,
        rowOrder: rows,
        aisleColIndices: aisleCols,
        seatStatusMap,
        currentUserId
      });

      if (autoRes.success) {
        onSeatsSelected(autoRes.seats);
        return;
      }
      // If full auto-allocate could not fit all groups at once, fall back to allocating active group
    }

    // Allocate specifically for the active group
    // Exclude seats already allocated to other groups
    const otherGroupSeatIds = selectedSeats
      .filter((s) => (s.group || 1) !== activeGroup.groupNumber)
      .map((s) => s.seatIdentifier);

    const result = selectAdjacentSeats({
      startSeat: clickedSeat,
      quantity: activeGroup.size,
      allRowSeats: rowSeats,
      aisleColIndices: aisleCols,
      seatStatusMap,
      currentUserId,
      groupNumber: activeGroup.groupNumber,
      excludedSeatIdentifiers: otherGroupSeatIds
    });

    if (result.success) {
      // Merge: retain seats from other groups + new seats for activeGroup
      const remainingSeats = selectedSeats.filter(
        (s) => (s.group || 1) !== activeGroup.groupNumber
      );
      const newSelected = [...remainingSeats, ...result.seats];
      onSeatsSelected(newSelected);

      // Auto-advance to next group if incomplete
      if (activeGroupIndex < normalizedGroups.length - 1) {
        setActiveGroupIndex(activeGroupIndex + 1);
      }
    } else {
      setErrorMessage(
        `Group ${activeGroup.groupNumber} (${activeGroup.size} seats): ${result.message}`
      );
      if (result.suggestion) {
        setSuggestedBlock(result.suggestion);
      }
    }
  };

  const applySuggestion = () => {
    if (suggestedBlock && suggestedBlock.length > 0) {
      if (!isMultiGroup) {
        onSeatsSelected(suggestedBlock);
      } else {
        const otherGroupSeatIds = selectedSeats.filter(
          (s) => (s.group || 1) !== activeGroup.groupNumber
        );
        onSeatsSelected([...otherGroupSeatIds, ...suggestedBlock]);
      }
      setSuggestedBlock(null);
      setErrorMessage('');
    }
  };

  const handleSmartAutoArrange = () => {
    setErrorMessage('');
    setSuggestedBlock(null);

    // Find first available seat starting from Row F or E
    for (const r of rows) {
      const rowSeats = allRowsMap[r] || [];
      const firstFree = rowSeats.find(
        (s) => getSeatStatus(s.row, s.number) === 'available'
      );
      if (firstFree) {
        const autoRes = autoAllocateFlexibleGroups({
          groups: normalizedGroups,
          startSeat: firstFree,
          allRowsMap,
          rowOrder: rows,
          aisleColIndices: aisleCols,
          seatStatusMap,
          currentUserId
        });

        if (autoRes.success) {
          onSeatsSelected(autoRes.seats);
          return;
        }
      }
    }

    setErrorMessage('Could not automatically fit all requested groups. Please pick seats row by row.');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Multi-Group Navigation Tabs (When flexible groups configured) */}
      {isMultiGroup && (
        <div
          style={{
            width: '100%',
            maxWidth: '850px',
            marginBottom: '1.75rem',
            background: 'rgba(16, 20, 28, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Flexible Group Seat Arrangement
              </h3>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                {normalizedGroups.length} Separate Groups
              </span>
            </div>

            <button
              onClick={handleSmartAutoArrange}
              className="btn btn-sm btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
            >
              <Sparkles size={14} />
              <span>Smart Auto-Allocate All</span>
            </button>
          </div>

          {/* Group Tabs Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${normalizedGroups.length}, 1fr)`, gap: '0.75rem' }}>
            {normalizedGroups.map((group, idx) => {
              const isActive = activeGroupIndex === idx;
              const style = GROUP_STYLES[group.groupNumber] || GROUP_STYLES[1];
              const allocated = seatsByGroup[group.groupNumber] || [];
              const isFilled = allocated.length === group.size;

              return (
                <button
                  key={group.groupNumber}
                  type="button"
                  onClick={() => {
                    setActiveGroupIndex(idx);
                    setErrorMessage('');
                  }}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.4)',
                    border: `2px solid ${isActive ? style.border : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 0 14px ${style.glow}` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: style.bg,
                          boxShadow: `0 0 8px ${style.glow}`
                        }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                        Group {group.groupNumber}
                      </span>
                    </div>

                    {isFilled ? (
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Check size={12} /> Ready
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {allocated.length}/{group.size} seats
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {allocated.length > 0 ? (
                      <strong style={{ color: style.border }}>
                        {allocated.map((s) => `${s.row}${s.number}`).join(', ')}
                      </strong>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        Click row to select {group.size} {group.size === 1 ? 'seat' : 'seats'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={14} color="var(--accent-gold)" />
            <span>
              Now positioning <strong style={{ color: '#ffffff' }}>Group {activeGroup.groupNumber}</strong> ({activeGroup.size} {activeGroup.size === 1 ? 'individual seat' : 'consecutive seats'}). Click any row or seat on the map below.
            </span>
          </div>
        </div>
      )}

      {/* Cinema Screen Curve at the Top */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve" />
        <div className="cinema-screen-glow" />
        <span className="cinema-screen-text">ALL EYES THIS WAY • CINEMA SCREEN</span>
      </div>

      {/* Category Pricing Badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.6rem 1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#94a3b8' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Silver:</span>
          <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(seatPricing.Silver || 150)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f5c518' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Gold:</span>
          <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(seatPricing.Gold || 220)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Platinum:</span>
          <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(seatPricing.Platinum || 350)}</span>
        </div>
      </div>

      {/* Error & Suggestion Alert Banner */}
      {errorMessage && (
        <div
          style={{
            maxWidth: '650px',
            width: '100%',
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #240d12 0%, #17070b 100%)',
            border: '1px solid rgba(229, 9, 20, 0.6)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <AlertCircle size={20} color="#ff4b55" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
              {errorMessage}
            </p>
          </div>

          {suggestedBlock && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '1.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                Suggestion: Seats {suggestedBlock.map((s) => `${s.row}${s.number}`).join(', ')} are available together!
              </span>
              <button onClick={applySuggestion} className="btn btn-sm btn-gold">
                Select These Seats
              </button>
            </div>
          )}
        </div>
      )}

      {/* Seat Map Grid */}
      <div className="seat-map-wrapper">
        {rows.map((row) => {
          const category = getSeatCategory(row);
          const categoryClass =
            category === 'Platinum' ? 'seat-platinum' : category === 'Gold' ? 'seat-gold' : 'seat-silver';

          return (
            <div key={row} className="seat-row">
              {/* Row Label (Left) */}
              <div className="seat-row-label">{row}</div>

              {/* Seats in Row */}
              {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((colNum) => {
                const selectedInfo = getSelectedSeatInfo(row, colNum);
                const isSelected = Boolean(selectedInfo);
                const status = getSeatStatus(row, colNum);
                const isAisle = aisleCols.includes(colNum);

                const isOccupied = status === 'booked';
                const isHeldOther = status === 'held_by_other';

                // Determine dynamic group styling if selected
                const groupStyle = isSelected
                  ? GROUP_STYLES[selectedInfo.group] || GROUP_STYLES[1]
                  : null;

                const customSeatStyle = isSelected
                  ? {
                      background: groupStyle.bg,
                      color: groupStyle.color,
                      borderColor: groupStyle.border,
                      boxShadow: `0 0 14px ${groupStyle.glow}`,
                      transform: 'scale(1.1)',
                      zIndex: 2,
                      position: 'relative'
                    }
                  : undefined;

                return (
                  <button
                    key={colNum}
                    onClick={() => !isOccupied && !isHeldOther && handleSeatClick(row, colNum)}
                    disabled={isOccupied || isHeldOther}
                    title={`${row}${colNum} (${category} - ₹${seatPricing[category] || 150})${
                      isSelected ? ` - Group ${selectedInfo.group}` : ''
                    }`}
                    className={`seat-item ${categoryClass} ${isSelected ? 'seat-selected' : ''} ${
                      isOccupied ? 'seat-occupied' : ''
                    } ${isHeldOther ? 'seat-held-other' : ''} ${isAisle ? 'seat-aisle' : ''}`}
                    style={customSeatStyle}
                    aria-label={`Seat ${row}${colNum}`}
                  >
                    {colNum}
                    {/* Small Group Pill overlay if multi-group */}
                    {isMultiGroup && isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          fontSize: '8px',
                          fontWeight: 900,
                          lineHeight: 1,
                          padding: '1px 3px',
                          borderRadius: '3px',
                          background: groupStyle.tagBg,
                          color: groupStyle.tagColor,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                        }}
                      >
                        G{selectedInfo.group}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Row Label (Right) */}
              <div className="seat-row-label">{row}</div>
            </div>
          );
        })}
      </div>

      {/* Seat Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.75rem',
          margin: '2rem 0',
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="seat-item seat-silver" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
          <span>Available (Silver)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="seat-item seat-gold" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
          <span>Available (Gold)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="seat-item seat-platinum" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
          <span>Available (Platinum)</span>
        </div>

        {/* Group Badges in Legend */}
        {isMultiGroup ? (
          normalizedGroups.map((g) => {
            const style = GROUP_STYLES[g.groupNumber] || GROUP_STYLES[1];
            return (
              <div key={g.groupNumber} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div
                  style={{
                    width: '1.4rem',
                    height: '1.4rem',
                    borderRadius: '4px',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    boxShadow: `0 0 8px ${style.glow}`
                  }}
                />
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Group {g.groupNumber} ({g.size} Seats)</span>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div className="seat-item seat-selected" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
            <span>Selected</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="seat-item seat-occupied" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
          <span>Occupied</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="seat-item seat-held-other" style={{ width: '1.4rem', height: '1.4rem', cursor: 'default' }} />
          <span>Temporarily Held</span>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: '1.5rem',
          width: '100%',
          maxWidth: '850px',
          background: 'rgba(22, 25, 34, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 2rem',
          boxShadow: 'var(--shadow-lg), 0 0 24px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          zIndex: 100
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Selected Seats ({selectedSeats.length}/{ticketQuantity})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            {selectedSeats.length > 0 ? (
              isMultiGroup ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {normalizedGroups.map((g) => {
                    const gSeats = seatsByGroup[g.groupNumber] || [];
                    const gStyle = GROUP_STYLES[g.groupNumber] || GROUP_STYLES[1];
                    return (
                      <span
                        key={g.groupNumber}
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${gStyle.border}`
                        }}
                      >
                        Group {g.groupNumber}:{' '}
                        {gSeats.length > 0 ? (
                          <strong style={{ color: gStyle.border }}>
                            {gSeats.map((s) => `${s.row}${s.number}`).join(', ')}
                          </strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}
                </span>
              )
            ) : (
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {isMultiGroup
                  ? `Click a seat to auto-allocate ${normalizedGroups.map((g) => g.size).join(' + ')} seats`
                  : `Click a starting seat to auto-select ${ticketQuantity} consecutive seats`}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={selectedSeats.length !== ticketQuantity}
          className="btn btn-primary btn-lg"
          style={{ minWidth: '220px' }}
        >
          <span>Proceed to Checkout</span>
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
