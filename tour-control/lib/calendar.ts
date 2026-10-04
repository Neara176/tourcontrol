import { Booking } from '@/types';

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatLocalDateTime(value: string) {
  const [date, time = '00:00'] = value.split('T');
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`;
}

function formatLocalEnd(value: string, durationHours: number) {
  const start = new Date(value);
  start.setHours(start.getHours() + durationHours);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
}

export function createBookingCalendarFile(booking: Booking) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const description = [
    `${booking.guest} · ${booking.pax} pax`,
    booking.phone ? `Phone: ${booking.phone}` : '',
    booking.notes || '',
  ].filter(Boolean).join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PP Tour Tracker//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@ppt3`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatLocalDateTime(booking.datetime)}`,
    `DTEND:${formatLocalEnd(booking.datetime, 2)}`,
    `SUMMARY:${escapeIcsText(`${booking.tourName} - ${booking.guest} (${booking.pax} pax)`)}`,
    'LOCATION:Phnom Penh',
    `DESCRIPTION:${escapeIcsText(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Tour in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/calendar;charset=utf-8' });
}

function downloadCalendarFile(booking: Booking, file: Blob) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tour.ics';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function addBookingToCalendar(booking: Booking): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const calendarFile = createBookingCalendarFile(booking);

  if (typeof navigator.share === 'function' && typeof File !== 'undefined') {
    try {
      const file = new File([calendarFile], 'tour.ics', { type: 'text/calendar' });
      const canShareFile = typeof navigator.canShare !== 'function' ||
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({ files: [file], title: booking.tourName });
        return 'shared';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    }
  }

  downloadCalendarFile(booking, calendarFile);
  return 'downloaded';
}
