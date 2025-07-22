// This file exports the weekly timetable schedule.
// The keys (0-6) correspond to the days of the week (Sunday-Saturday).
// Entries with type: 'break' will be rendered differently.

export const weeklySchedule = {
  1: [ // Monday
    { time: '9:00 AM – 10:00 AM', name: 'Minor', professor: '' },
    { time: '10:00 AM – 11:00 AM', name: 'Discrete Mathematics', professor: 'Prof. C. Kumbhare' },
    { time: '11:00 AM – 12:00 PM', name: 'Design and Analysis of Algorithms', professor: 'Prof. P. Dandekar' },
    { time: '12:00 PM – 1:00 PM', name: 'Lunch Break', professor: '', type: 'break' },
    { time: '1:00 PM – 2:00 PM', name: 'Theory of Computation', professor: 'Dr. S. Rawat' },
    { time: '2:00 PM – 3:00 PM', name: 'Computer Networks', professor: 'Dr. Y. Thakare' },
  ],
  2: [ // Tuesday
    { time: '9:00 AM – 10:00 AM', name: 'Minor', professor: '' },
    { time: '10:00 AM – 11:00 AM', name: 'Computer Networks', professor: 'Dr. Y. Thakare' },
    { time: '11:00 AM – 12:00 PM', name: 'Discrete Mathematics', professor: 'Prof. C. Kumbhare' },
    { time: '12:00 PM – 1:00 PM', name: 'Lunch Break', professor: '', type: 'break' },
    { time: '1:00 PM – 2:00 PM', name: 'Design and Analysis of Algorithms', professor: 'Prof. P. Dandekar' },
  ],
  3: [ // Wednesday
    { time: '9:00 AM – 10:00 AM', name: 'Minor', professor: '' },
    { time: '10:00 AM – 11:00 AM', name: 'Break', professor: '', type: 'break' },
    { time: '11:00 AM – 12:00 PM', name: 'Theory of Computation', professor: 'Dr. S. Rawat' },
    { time: '12:00 PM – 1:00 PM', name: 'Discrete Mathematics', professor: 'Prof. C. Kumbhare' },
    { time: '1:00 PM – 2:00 PM', name: 'Lunch Break', professor: '', type: 'break' },
    { time: '2:00 PM – 3:00 PM', name: 'Design and Analysis of Algorithms', professor: 'Prof. P. Dandekar' },
    { time: '3:00 PM – 5:00 PM', name: 'CN Lab (B1/B3)', professor: 'Prof. S. Deshmukh / Prof. S. Ghodeswar' },
    { time: '3:00 PM – 5:00 PM', name: 'DAA Lab (B2/B4)', professor: 'Prof. D. Khatwar / Prof. K. Ande' },
  ],
  4: [ // Thursday
    { time: '9:00 AM – 10:00 AM', name: 'MDM', professor: '' },
    { time: '12:00 PM – 1:00 PM', name: 'Lunch Break', professor: '', type: 'break' },
    { time: '1:00 PM – 2:00 PM', name: 'Theory of Computation', professor: 'Dr. S. Rawat' },
    { time: '2:00 PM – 4:00 PM', name: 'CN Lab (B2/B4)', professor: 'Dr. Y. Thakare / Prof. P. Agarkar' },
    { time: '2:00 PM – 4:00 PM', name: 'DAA Lab (B1/B3)', professor: 'Prof. A. Khare / Prof. K. Ande' },
  ],
  5: [ // Friday
    { time: '9:00 AM – 10:00 AM', name: 'MDM', professor: '' },
    { time: '10:00 AM – 12:00 PM', name: 'Software Lab', professor: 'Batch Dependant' },
    { time: '12:00 PM – 1:00 PM', name: 'Lunch Break', professor: '', type: 'break' },
    { time: '1:00 PM – 2:00 PM', name: 'Computer Networks', professor: 'Dr. Y. Thakare' },
  ],
  6: [ // Saturday
    { time: '9:00 AM – 10:00 AM', name: 'MDM', professor: '' },
  ],
  0: [], // Sunday
};