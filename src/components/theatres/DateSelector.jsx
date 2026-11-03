import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDateShort, formatDateYYYYMMDD } from '../../utils/formatters';

const DateSelector = ({ selectedDate, onDateChange, daysCount = 7 }) => {
  // Generate next N days starting today
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <Calendar size={18} color="var(--accent-red)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Date
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}
      >
        {dates.map((d, index) => {
          const dateStr = formatDateYYYYMMDD(d);
          const isSelected = selectedDate === dateStr;
          const { dayName, dayNumber, monthName } = formatDateShort(d);

          return (
            <button
              key={dateStr}
              onClick={() => onDateChange(dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.25rem',
                minWidth: '85px',
                borderRadius: 'var(--radius-md)',
                background: isSelected
                  ? 'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-burgundy) 100%)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 4px 16px var(--accent-red-glow)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {index === 0 ? 'Today' : dayName}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                {dayNumber}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;

