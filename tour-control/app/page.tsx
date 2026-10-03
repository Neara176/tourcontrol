'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/hooks/useStorage';

export default function HomePage() {
  const { bookings, tours, initialized } = useStorage();
  const router = useRouter();
  const [filter, setFilter] = useState<'today' | '7' | 'month' | 'all'>('7');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    const list = bookings.filter(b => !b.cancelled);
    if (selectedDate) {
      return list.filter(b => b.datetime.startsWith(selectedDate));
    }
    
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

    if (filter === 'today') return list.filter(b => b.datetime.startsWith(todayStr));
    if (filter === '7') return list.filter(b => b.datetime.startsWith(todayStr) && b.datetime <= sevenDaysStr);
    if (filter === 'month') return list.filter(b => b.datetime.startsWith(todayStr.slice(0, 7)));
    return list.filter(b => b.datetime >= todayStr);
  }, [bookings, filter, selectedDate, todayStr]);

  if (!initialized) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2">Home</h2>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => router.push('/bookings')}
          className="bg-gold text-ink font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Add Booking
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-3">Upcoming bookings</h3>
      
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {([
          { id: 'today', label: 'Today' },
          { id: '7', label: 'Next 7 days' },
          { id: 'month', label: 'This month' },
          { id: 'all', label: 'All upcoming' },
        ] as const).map(btn => (
          <button
            key={btn.id}
            onClick={() => { setFilter(btn.id); setSelectedDate(''); }}
            className={`px-4 py-2 border border-line rounded-full text-sm transition-colors ${
              filter === btn.id ? 'bg-ink text-white border-ink' : 'bg-card text-ink hover:bg-gray-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm font-normal">
          Travel date 
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-line rounded-lg px-2 py-1 text-sm w-auto"
          />
        </label>
        {selectedDate && (
          <button 
            onClick={() => setSelectedDate('')}
            className="text-warn font-semibold text-sm underline"
          >
            clear date
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredBookings.length > 0 ? (
          filteredBookings.sort((a, b) => a.datetime.localeCompare(b.datetime)).map(b => {
            const tour = tours.find(t => t.id === b.tourId);
            const color = tour?.color || '#667085';
            return (
              <div 
                key={b.id}
                className="bg-card border border-line border-l-8 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderLeftColor: color }}
              >
                <div className="flex-1 min-w-[170px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-white text-[12px]" style={{ backgroundColor: color }}>
                      {b.tourName}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-ink">
                      {new Date(b.datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="font-bold text-sm">
                    {new Date(b.datetime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm">{b.guest} · {b.pax} pax</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${b.revenue.toLocaleString()}</div>
                  <div className="text-[12px] text-muted">{b.paid ? 'paid' : 'expected'}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center bg-card border border-dashed border-line rounded-xl text-muted">
            No upcoming bookings for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
