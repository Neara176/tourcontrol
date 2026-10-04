'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@/types';
import { addBookingToCalendar } from '@/lib/calendar';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onUpdate: (booking: Booking) => void | Promise<boolean>;
  onDelete: (booking: Booking) => void | Promise<boolean>;
}

function hasExpense(booking: Booking) {
  return booking.expense !== null && booking.expense !== undefined && String(booking.expense) !== '';
}

function money(amount: number) {
  return (amount < 0 ? '-$' : '$') + Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function bookingStatus(booking: Booking) {
  if (booking.cancelled) return 'Cancelled';
  if (hasExpense(booking)) return 'Done';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (booking.datetime.slice(0, 10) < today) return 'Expense needed';
  return 'Upcoming';
}

export default function BookingDetailModal({
  booking,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
}: BookingDetailModalProps) {
  const [expense, setExpense] = useState(hasExpense(booking) ? String(booking.expense) : '');
  const [error, setError] = useState('');
  const [calendarError, setCalendarError] = useState('');
  const [calendarStatus, setCalendarStatus] = useState('');

  const saveExpense = async () => {
    const amount = Number(expense);
    if (!expense.trim() || !Number.isFinite(amount) || amount < 0) {
      setError('Enter an expense amount of $0 or more.');
      return;
    }
    const saved = await onUpdate({ ...booking, expense: amount });
    if (saved === false) setError('The expense was not saved. Check the Supabase error above and try again.');
  };

  const addToCalendar = async () => {
    setCalendarError('');
    setCalendarStatus('');
    try {
      const result = await addBookingToCalendar(booking);
      if (result === 'downloaded') {
        setCalendarStatus('Calendar file downloaded. Open tour.ics to add it to your calendar.');
      }
    } catch (error) {
      console.error('Unable to share booking calendar event:', error);
      setCalendarError('Could not create the calendar file. Check browser download permissions and try again.');
    }
  };

  const travelDate = new Date(booking.datetime);
  const profit = booking.revenue - (booking.expense ?? 0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="booking-detail-modal" role="dialog" aria-modal="true" aria-labelledby="booking-detail-title">
        <h2 id="booking-detail-title">
          {booking.tourName}
          <span className={`status-badge status-${bookingStatus(booking).toLowerCase().replace(' ', '-')}`}>
            {bookingStatus(booking)}
          </span>
        </h2>
        <p><strong>{travelDate.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></p>
        <p>Guest: {booking.guest}{booking.phone ? ` · ${booking.phone}` : ''} · {booking.pax} pax</p>
        <p>
          Revenue {money(booking.revenue)} ({booking.paid ? 'paid' : 'expected'})
          {hasExpense(booking) && (
            <> · Expense {money(booking.expense ?? 0)} · <strong className={profit < 0 ? 'negative' : 'positive'}>Profit {money(profit)}</strong></>
          )}
        </p>
        {booking.notes && <p>Notes: {booking.notes}</p>}

        <div className="detail-expense-row">
          <input
            type="number"
            min="0"
            step="0.01"
            value={expense}
            placeholder="Expense $"
            aria-label="Booking expense"
            onChange={event => {
              setExpense(event.target.value);
              setError('');
            }}
          />
          <button className="primary-button small-button" onClick={saveExpense}>
            {hasExpense(booking) ? 'Update expense' : 'Save expense'}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
        {calendarError && <p className="form-error">{calendarError}</p>}
        {calendarStatus && <p className="calendar-status" role="status">{calendarStatus}</p>}

        <div className="detail-actions">
          <button className="secondary-button" onClick={() => onEdit(booking)}>Edit</button>
          <button className="secondary-button" onClick={addToCalendar}>Add to iPhone</button>
          <button className="secondary-button" onClick={() => onUpdate({ ...booking, cancelled: !booking.cancelled })}>
            {booking.cancelled ? 'Restore' : 'Cancel booking'}
          </button>
          <button className="secondary-button danger-button" onClick={() => onDelete(booking)}>Delete</button>
          <button className="secondary-button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}
