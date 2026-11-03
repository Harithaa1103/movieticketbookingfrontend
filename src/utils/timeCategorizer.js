/**
 * CINE MAX Showtime Category & Time Utility (Frontend)
 *
 * Exact Category Boundaries:
 * - Morning:   6:00 AM – 11:59 AM (360 - 719 mins)
 * - Afternoon: 12:00 PM – 3:59 PM  (720 - 959 mins)
 * - Evening:   4:00 PM – 7:59 PM  (960 - 1199 mins)
 * - Night:     8:00 PM – 5:59 AM  (1200 - 1439 mins OR 0 - 359 mins)
 */

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const str = timeStr.trim();

  // Match 12-hour format: "09:30 AM", "9:30 AM", "1:15 pm", "12:00 PM"
  const match12 = str.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const modifier = match12[3].toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Match 24-hour format: "14:30", "09:15", "23:45"
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

export function getShowtimeCategory(timeStr) {
  const totalMinutes = parseTimeToMinutes(timeStr);

  // Morning: 6:00 AM (360) to 11:59 AM (719)
  if (totalMinutes >= 360 && totalMinutes <= 719) {
    return 'Morning';
  }

  // Afternoon: 12:00 PM (720) to 3:59 PM (959)
  if (totalMinutes >= 720 && totalMinutes <= 959) {
    return 'Afternoon';
  }

  // Evening: 4:00 PM (960) to 7:59 PM (1199)
  if (totalMinutes >= 960 && totalMinutes <= 1199) {
    return 'Evening';
  }

  // Night: 8:00 PM (1200) to 5:59 AM (359)
  return 'Night';
}

export function formatTimeTo12Hour(timeStr) {
  if (!timeStr) return '';
  const totalMinutes = parseTimeToMinutes(timeStr);
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  const paddedHours = displayHours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  return `${paddedHours}:${paddedMinutes} ${modifier}`;
}

