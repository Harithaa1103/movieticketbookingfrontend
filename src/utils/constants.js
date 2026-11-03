export const AUDIO_LANGUAGES = ['Tamil', 'Hindi', 'Malayalam', 'Telugu'];

export const SHOW_CATEGORIES = [
  { id: 'Morning', label: 'Morning Show', timeRange: '6:00 AM – 11:59 AM' },
  { id: 'Afternoon', label: 'Afternoon Show', timeRange: '12:00 PM – 3:59 PM' },
  { id: 'Evening', label: 'Evening Show', timeRange: '4:00 PM – 7:59 PM' },
  { id: 'Night', label: 'Night Show', timeRange: '8:00 PM – 5:59 AM' }
];

export const SEAT_CATEGORIES = {
  Silver: {
    name: 'Silver',
    label: 'Standard',
    color: '#94a3b8',
    borderColor: '#3b4256',
    defaultPrice: 150
  },
  Gold: {
    name: 'Gold',
    label: 'Premium',
    color: '#f5c518',
    borderColor: '#eab308',
    defaultPrice: 220
  },
  Platinum: {
    name: 'Platinum',
    label: 'VIP Recliner',
    color: '#f1f5f9',
    borderColor: '#cbd5e1',
    defaultPrice: 350
  }
};

export const CITIES = ['All Cities', 'Chennai', 'Bengaluru', 'Coimbatore', 'Hyderabad', 'Mumbai'];

export const CONVENIENCE_FEE = 45;
export const TAX_PERCENT = 0.18; // 18% GST on convenience fee

