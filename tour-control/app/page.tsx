'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/hooks/useStorage';
import { Booking } from '@/types';
import BookingModal from '@/components/BookingModal';
import BookingDetailModal from '@/components/BookingDetailModal';
import StorageError from '@/components/StorageError';

type UpcomingFilter = 'today' | '7' | 'month' | 'all';
type CalendarView = 'week' | 'month';

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const shiftDate = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const mondayOf = (date: Date) => shiftDate(date, -((date.getDay() + 6) % 7));

const hasExpense = (booking: Booking) =>
  booking.expense !== null && booking.expense !== undefined && String(booking.expense) !== '';

const money = (amount: number) =>
  (amount < 0 ? '-$' : '$') +
  Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function HomePage() {
  const { bookings, setBookings, tours, season, initialized, error } = useStorage();
  const router = useRouter();
  const [filter, setFilter] = useState<UpcomingFilter>('7');
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [summaryMonth, setSummaryMonth] = useState(() => dateKey(new Date()).slice(0, 7));
  const [expenseDrafts, setExpenseDrafts] = useState<Record<string, string>>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});

  const today = dateKey(new Date());
  const liveBookings = useMemo(() => bookings.filter(booking => !booking.cancelled), [bookings]);

  const filteredBookings = useMemo(() => {
    const endOfNextWeek = dateKey(shiftDate(parseDateKey(today), 6));
    let list = liveBookings.filter(booking => booking.datetime.slice(0, 10) >= today);

    if (selectedDate) return list.filter(booking => booking.datetime.slice(0, 10) === selectedDate);
    if (filter === 'today') list = list.filter(booking => booking.datetime.slice(0, 10) === today);
    if (filter === '7') list = list.filter(booking => booking.datetime.slice(0, 10) <= endOfNextWeek);
    if (filter === 'month') list = list.filter(booking => booking.datetime.startsWith(today.slice(0, 7)));
    return list.sort((a, b) => a.datetime.localeCompare(b.datetime));
  }, [filter, liveBookings, selectedDate, today]);

  const waitingForExpense = useMemo(
    () => liveBookings
      .filter(booking => !hasExpense(booking) && booking.datetime.slice(0, 10) < today)
      .sort((a, b) => a.datetime.localeCompare(b.datetime)),
    [liveBookings, today],
  );

  const monthBookings = useMemo(
    () => liveBookings.filter(booking => booking.datetime.startsWith(summaryMonth)),
    [liveBookings, summaryMonth],
  );

  const monthlyTours = useMemo(() => {
    const grouped = new Map<string, { count: number; guests: number; color: string }>();
    monthBookings.forEach(booking => {
      const tour = tours.find(item => item.id === booking.tourId);
      const current = grouped.get(booking.tourName) ?? {
        count: 0,
        guests: 0,
        color: tour?.color ?? booking.color ?? '#667085',
      };
      current.count += 1;
      current.guests += booking.pax;
      grouped.set(booking.tourName, current);
    });
    return Array.from(grouped.entries());
  }, [monthBookings, tours]);

  const expectedRevenue = monthBookings
    .filter(booking => !hasExpense(booking))
    .reduce((total, booking) => total + booking.revenue, 0);
  const closedBookings = monthBookings.filter(hasExpense);
  const closedRevenue = closedBookings.reduce((total, booking) => total + booking.revenue, 0);
  const closedProfit = closedBookings.reduce(
    (total, booking) => total + booking.revenue - (booking.expense ?? 0),
    0,
  );

  const calendarStart = calendarView === 'week'
    ? mondayOf(calendarDate)
    : mondayOf(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1));
  const calendarDayCount = calendarView === 'week'
    ? 7
    : Math.ceil(
      (((new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7) +
        new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()) / 7,
    ) * 7;
  const calendarDays = Array.from({ length: calendarDayCount }, (_, index) => shiftDate(calendarStart, index));

  const calendarTitle = calendarView === 'week'
    ? `${calendarStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${shiftDate(calendarStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : calendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const changeCalendar = (amount: number) => {
    if (calendarView === 'week') {
      setCalendarDate(current => shiftDate(current, 7 * amount));
      return;
    }
    const nextMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + amount, 1);
    setCalendarDate(nextMonth);
    setSummaryMonth(dateKey(nextMonth).slice(0, 7));
    setSelectedDate('');
  };

  const changeSummaryMonth = (amount: number) => {
    const [year, month] = summaryMonth.split('-').map(Number);
    const nextMonth = new Date(year, month - 1 + amount, 1);
    setSummaryMonth(dateKey(nextMonth).slice(0, 7));
    setCalendarDate(nextMonth);
    setSelectedDate('');
  };

  const saveExpense = async (bookingId: number) => {
    const key = String(bookingId);
    const value = expenseDrafts[key] ?? '';
    const amount = Number(value);
    if (!value.trim() || !Number.isFinite(amount) || amount < 0) {
      setExpenseErrors(current => ({ ...current, [key]: 'Enter an expense amount of $0 or more.' }));
      return;
    }
    const saved = await setBookings(bookings.map(booking =>
      booking.id === bookingId ? { ...booking, expense: amount } : booking,
    ));
    if (!saved) return;
    setExpenseDrafts(current => {
      const next = { ...current };
      delete next[String(bookingId)];
      return next;
    });
    setExpenseErrors(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const saveBooking = async (data: Partial<Booking>) => {
    let saved: boolean;
    if (editingBooking) {
      saved = await setBookings(bookings.map(booking =>
        booking.id === editingBooking.id ? { ...booking, ...data } as Booking : booking,
      ));
    } else {
      saved = await setBookings([...bookings, data as Booking]);
    }
    if (!saved) return false;
    setIsBookingModalOpen(false);
    setEditingBooking(null);
    return true;
  };

  const updateBooking = async (updatedBooking: Booking) => {
    const saved = await setBookings(bookings.map(booking =>
      booking.id === updatedBooking.id ? updatedBooking : booking,
    ));
    if (saved) setSelectedBooking(null);
    return saved;
  };

  const deleteBooking = async (booking: Booking) => {
    if (!window.confirm('Delete this booking?')) return false;
    const saved = await setBookings(bookings.filter(item => item.id !== booking.id));
    if (!saved) return false;
    setSelectedBooking(null);
    return true;
  };

  if (!initialized) return <div className="p-4">Loading...</div>;

  return (
    <div className="home-page">
      <StorageError message={error} />
      <h2>Home</h2>

      <div className="home-actions">
        <button className="primary-button" onClick={() => {
          if (!tours.length) {
            router.push('/tours');
            return;
          }
          setEditingBooking(null);
          setIsBookingModalOpen(true);
        }}>
          + Add Booking
        </button>
        {waitingForExpense.length > 0 && (
          <a className="waiting-note" href="#waiting-expenses">
            ⚠️ {waitingForExpense.length} tour{waitingForExpense.length > 1 ? 's' : ''} waiting for expense (see below)
          </a>
        )}
      </div>

      <h3 className="section-title">Upcoming bookings</h3>
      <div className="filter-pills" role="group" aria-label="Filter upcoming bookings">
        {([
          { id: 'today', label: 'Today' },
          { id: '7', label: 'Next 7 days' },
          { id: 'month', label: 'This month' },
          { id: 'all', label: 'All upcoming' },
        ] as const).map(option => (
          <button
            key={option.id}
            className={`filter-pill ${!selectedDate && filter === option.id ? 'selected' : ''}`}
            onClick={() => {
              setFilter(option.id);
              setSelectedDate('');
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="travel-date-row">
        <label htmlFor="travel-date">Travel date</label>
        <input
          id="travel-date"
          type="date"
          value={selectedDate}
          onChange={event => {
            setSelectedDate(event.target.value);
            if (event.target.value) setCalendarDate(parseDateKey(event.target.value));
          }}
        />
        {selectedDate && (
          <span className="selected-date-note">
            Showing {parseDateKey(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ·{' '}
            <button onClick={() => {
              setSelectedDate('');
              setFilter('7');
            }}>clear date</button>
          </span>
        )}
      </div>

      <div className="upcoming-list">
        {filteredBookings.length ? filteredBookings.map(booking => {
          const tour = tours.find(item => item.id === booking.tourId);
          const color = tour?.color ?? booking.color ?? '#667085';
          return (
            <button
              key={booking.id}
              className="booking-row"
              style={{ '--booking-color': color } as React.CSSProperties}
              onClick={() => setSelectedBooking(booking)}
            >
              <span className="booking-info">
                <span className="booking-tags">
                  <span className="tour-tag">{booking.tourName}</span>
                  <span className="booking-urgency">{new Date(booking.datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </span>
                <strong>{new Date(booking.datetime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong>
                <span>{booking.guest} · {booking.pax} pax</span>
              </span>
              <span className="booking-price">
                <strong>{money(booking.revenue)}</strong>
                <small>{booking.paid ? 'paid' : 'expected'}</small>
              </span>
            </button>
          );
        }) : (
          <div className="empty-state">No upcoming bookings for this filter.</div>
        )}
      </div>

      <h3 className="section-title">Calendar</h3>
      <div className="calendar-toolbar">
        <button className="secondary-button" onClick={() => changeCalendar(-1)}>‹ Prev</button>
        <strong className="calendar-heading">{calendarTitle}</strong>
        <button className="secondary-button" onClick={() => changeCalendar(1)}>Next ›</button>
        <button className="secondary-button" onClick={() => {
          const now = new Date();
          setCalendarDate(now);
          setSummaryMonth(dateKey(now).slice(0, 7));
        }}>Today</button>
        <div className="calendar-view-toggle">
          {(['week', 'month'] as const).map(view => (
            <button
              key={view}
              className={`filter-pill ${calendarView === view ? 'selected' : ''}`}
              onClick={() => setCalendarView(view)}
            >
              {view === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className={`calendar-grid ${calendarView === 'week' ? 'week-view' : ''}`}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div className="calendar-weekday" key={day}>{day}</div>
        ))}
        {calendarDays.map(day => {
          const key = dateKey(day);
          const dayBookings = bookings
            .filter(booking => booking.datetime.slice(0, 10) === key)
            .sort((a, b) => a.datetime.localeCompare(b.datetime));
          return (
            <div
              key={key}
              role="group"
              aria-label={`Calendar day ${day.toLocaleDateString('en-GB')}`}
              className={[
                'calendar-day',
                calendarView === 'month' && day.getMonth() !== calendarDate.getMonth() ? 'outside-month' : '',
                key === today ? 'is-today' : '',
                key === selectedDate ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => {
                setSelectedDate(key);
                setFilter('7');
              }}
            >
              <button
                className="calendar-day-number"
                aria-label={`Show bookings for ${day.toLocaleDateString('en-GB')}`}
                onClick={() => {
                  setSelectedDate(key);
                  setFilter('7');
                }}
              >{day.getDate()}</button>
              <span className="calendar-bookings">
                {dayBookings.map(booking => {
                  const tour = tours.find(item => item.id === booking.tourId);
                  const status = booking.cancelled ? '' : hasExpense(booking) ? '✓ ' :
                    booking.datetime.slice(0, 10) < today ? '❗' : '';
                  return (
                    <button
                      type="button"
                      key={booking.id}
                      className={`calendar-chip ${booking.cancelled ? 'cancelled' : ''}`}
                      style={{ '--booking-color': tour?.color ?? booking.color ?? '#667085' } as React.CSSProperties}
                      title={`${booking.guest} · ${booking.tourName}`}
                      onClick={event => {
                        event.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                    >
                      {status}{booking.datetime.slice(11, 16)} {booking.tourName}
                    </button>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>

      <h3 className="section-title">Monthly summary</h3>
      <div className="summary-toolbar">
        <button className="secondary-button" aria-label="Previous month" onClick={() => changeSummaryMonth(-1)}>‹</button>
        <input
          type="month"
          value={summaryMonth}
          onChange={event => {
            if (!event.target.value) return;
            setSummaryMonth(event.target.value);
            setCalendarDate(parseDateKey(`${event.target.value}-01`));
            setSelectedDate('');
          }}
          aria-label="Summary month"
        />
        <button className="secondary-button" aria-label="Next month" onClick={() => changeSummaryMonth(1)}>›</button>
        <button className="secondary-button" onClick={() => setSummaryMonth(dateKey(new Date()).slice(0, 7))}>This month</button>
      </div>
      <h3 className="summary-title">
        Tours in {parseDateKey(`${summaryMonth}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="tour-categories">
        {monthlyTours.length ? monthlyTours.map(([name, values]) => (
          <div className="tour-category" key={name} style={{ '--booking-color': values.color } as React.CSSProperties}>
            <strong>{values.count}</strong>
            <span>{name}</span>
            <small>{values.guests} guests</small>
          </div>
        )) : <div className="empty-state">No tours this month yet.</div>}
      </div>
      <div className="summary-stats">
        <div className="summary-stat">
          <small>Expected revenue (expense not entered yet)</small>
          <strong>{money(expectedRevenue)}</strong>
        </div>
        <div className="summary-stat">
          <small>Revenue (closed tours)</small>
          <strong>{money(closedRevenue)}</strong>
        </div>
        <div className="summary-stat">
          <small>Profit (closed tours)</small>
          <strong className={closedProfit < 0 ? 'negative' : 'positive'}>{money(closedProfit)}</strong>
        </div>
      </div>

      {waitingForExpense.length > 0 && (
        <section className="expense-alert" id="waiting-expenses">
          <h3>⚠️ {waitingForExpense.length} finished tour{waitingForExpense.length > 1 ? 's' : ''} waiting for expense</h3>
          {waitingForExpense.map(booking => (
            <div className="expense-row" key={booking.id}>
              <div className="expense-booking">
                <strong>{booking.tourName}</strong> · {new Date(booking.datetime).toLocaleString('en-GB')}
                <br />{booking.guest} · {booking.pax} pax · expected {money(booking.revenue)}
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Expense $"
                aria-label={`Expense for ${booking.guest}`}
                value={expenseDrafts[String(booking.id)] ?? ''}
                onChange={event => {
                  const key = String(booking.id);
                  setExpenseDrafts(current => ({ ...current, [key]: event.target.value }));
                  setExpenseErrors(current => {
                    const next = { ...current };
                    delete next[key];
                    return next;
                  });
                }}
              />
              <button className="primary-button small-button" onClick={() => saveExpense(booking.id)}>Save expense</button>
              {expenseErrors[String(booking.id)] && (
                <small className="form-error" role="alert">{expenseErrors[String(booking.id)]}</small>
              )}
            </div>
          ))}
        </section>
      )}
      {isBookingModalOpen && (
        <BookingModal
          onClose={() => setIsBookingModalOpen(false)}
          onSave={saveBooking}
          editingBooking={editingBooking}
          tours={tours}
          season={season}
        />
      )}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onEdit={booking => {
            setSelectedBooking(null);
            setEditingBooking(booking);
            setIsBookingModalOpen(true);
          }}
          onUpdate={updateBooking}
          onDelete={deleteBooking}
        />
      )}
    </div>
  );
}
