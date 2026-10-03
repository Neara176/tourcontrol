'use client';
import React, { useState, useMemo } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Booking, BookingStatus } from '@/types';
import BookingModal from '@/components/BookingModal';

export default function BookingsPage() {
  const { bookings, setBookings, tours, season, initialized } = useStorage();
  const [filter, setFilter] = useState<BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const matchesFilter = filter === 'all' || getStatus(b) === filter;
        const matchesSearch = !search || b.guest.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [bookings, filter, search]);

  function getStatus(b: Booking) {
    if (b.cancelled) return 'cancelled';
    if (b.expense !== null && b.expense !== undefined && String(b.expense) !== "") return 'done';
    const today = new Date().toISOString().split('T')[0];
    return b.datetime.startsWith(today) || b.datetime < today ? 'need' : 'upcoming';
  }

  const handleSaveBooking = (data: Partial<Booking>) => {
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? { ...b, ...data } as Booking : b));
    } else {
      setBookings([...bookings, { ...data } as Booking]);
    }
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const openEdit = (b: Booking) => {
    setEditingBooking(b);
    setIsModalOpen(true);
  };

  if (!initialized) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6">Bookings</h2>
      
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
        <button 
          onClick={() => { setEditingBooking(null); setIsModalOpen(true); }} 
          className="bg-gold text-ink font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Add Booking
        </button>
        <input 
          type="text" 
          placeholder="Search guest" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 text-sm w-full md:max-w-[200px]"
        />
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'need', label: 'Expense needed' },
          { id: 'done', label: 'Done' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as BookingStatus)}
            className={`px-4 py-2 border border-line rounded-full text-sm transition-colors ${
              filter === btn.id ? 'bg-ink text-white border-ink' : 'bg-card text-ink hover:bg-gray-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(b => (
            <div 
              key={b.id}
              onClick={() => openEdit(b)}
              className={`bg-card border border-line border-l-8 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${b.cancelled ? 'opacity-50' : ''}`}
              style={{ borderLeftColor: b.color }}
            >
              <div className="flex-1 min-w-[170px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-white text-[12px]" style={{ backgroundColor: b.color }}>
                    {b.tourName}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    b.cancelled ? 'bg-gray-200 text-gray-600' : 
                    getStatus(b) === 'done' ? 'bg-green-100 text-green-700' : 
                    getStatus(b) === 'need' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-ink'
                  }`}>
                    {getStatus(b)}
                  </span>
                </div>
                <div className="font-bold text-sm">
                  {new Date(b.datetime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm">{b.guest} · {b.pax} pax</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${b.revenue.toLocaleString()}</div>
                <div className={`text-[12px] ${b.expense !== null ? (b.revenue - b.expense < 0 ? 'text-bad' : 'text-ok') : 'text-muted'}`}>
                  {b.expense !== null ? `profit $${(b.revenue - b.expense).toLocaleString()}` : 'no expense yet'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center bg-card border border-dashed border-line rounded-xl text-muted">
            No bookings here.
          </div>
        )}
      </div>

      {isModalOpen && (
        <BookingModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveBooking} 
          editingBooking={editingBooking} 
          tours={tours} 
          season={season} 
        />
      )}
    </div>
  );
}
