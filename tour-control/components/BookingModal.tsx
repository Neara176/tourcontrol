'use client';
import React, { useState } from 'react';
import { Tour, Booking } from '@/types';

interface BookingModalProps {
  onClose: () => void;
  onSave: (data: Partial<Booking>) => void | boolean | Promise<void | boolean>;
  editingBooking: Booking | null;
  tours: Tour[];
  season: number[];
}

function createInitialFormData(editingBooking: Booking | null, tours: Tour[], season: number[]): Partial<Booking> {
  if (editingBooking) return editingBooking;

  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const localDateTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`;
  const tour = tours[0];
  const isHighSeason = season.includes(d.getMonth() + 1);
  const price = tour ? (isHighSeason && tour.priceHigh ? tour.priceHigh : tour.price) : 0;

  return {
    id: Date.now(),
    datetime: localDateTime,
    tourId: tour?.id,
    tourName: tour?.name,
    color: tour?.color,
    pax: 1,
    revenue: price,
    paid: false,
    expense: null,
    cancelled: false,
  };
}

export default function BookingModal({ onClose, onSave, editingBooking, tours, season }: BookingModalProps) {
  const [formData, setFormData] = useState<Partial<Booking>>(() => createInitialFormData(editingBooking, tours, season));
  const [error, setError] = useState('');

  const updatePrice = (tourId: string, datetime: string, pax: number) => {
    const tour = tours.find(item => item.id === tourId);
    if (!tour) return {};
    const month = datetime ? parseInt(datetime.slice(5, 7), 10) : 0;
    const isHigh = season.includes(month);
    const price = isHigh && tour.priceHigh ? tour.priceHigh : tour.price;
    return {
      tourId,
      tourName: tour.name,
      color: tour.color,
      revenue: Number((price * pax).toFixed(2)),
    };
  };

  const handleTourChange = (tourId: string) => {
    setFormData(prev => ({
      ...prev,
      ...updatePrice(tourId, prev.datetime || '', prev.pax || 1),
    }));
  };

  const handlePaxChange = (value: string) => {
    const pax = parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      pax: Number.isNaN(pax) ? undefined : pax,
      ...(prev.tourId && Number.isFinite(pax)
        ? updatePrice(prev.tourId, prev.datetime || '', pax)
        : {}),
    }));
  };

  const handleDateChange = (datetime: string) => {
    setFormData(prev => ({
      ...prev,
      datetime,
      ...(!editingBooking && prev.tourId
        ? updatePrice(prev.tourId, datetime, prev.pax || 1)
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { guest, datetime, pax, revenue } = formData;
    if (!datetime) return setError('Pick a travel date and time.');
    if (!guest) return setError('Enter the guest\'s name.');
    if (!pax || pax < 1) return setError('Pax must be at least 1.');
    if (revenue === undefined || isNaN(revenue) || revenue < 0) return setError('Enter expected revenue ($0 or more).');
    if (formData.expense !== null && formData.expense !== undefined && formData.expense < 0) {
      return setError('Expense cannot be negative.');
    }
    if (!formData.tourId || !formData.tourName || !formData.color) {
      return setError('Choose a tour for this booking.');
    }

    const saved = await onSave(formData);
    if (saved === false) setError('The booking was not saved. Check the Supabase error above and try again.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-xl rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-extrabold mb-4">{editingBooking ? 'Edit Booking' : 'Add Booking'}</h3>

        {tours.length === 0 ? (
          <div className="no-tours-message">
            <p>Add a tour before creating a booking.</p>
            <div className="detail-actions">
              <button type="button" onClick={onClose} className="secondary-button">Close</button>
            </div>
          </div>
        ) : (
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Tour
            <select 
              value={formData.tourId || ''} 
              onChange={(e) => handleTourChange(e.target.value)}
              className="border border-line rounded-lg p-2"
            >
              {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Travel date and time
            <input 
              type="datetime-local" 
              value={formData.datetime || ''} 
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-line rounded-lg p-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Guest name
            <input 
              type="text" 
              value={formData.guest || ''} 
              onChange={(e) => setFormData({...formData, guest: e.target.value})}
              placeholder="e.g. Sarah Miller"
              className="border border-line rounded-lg p-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Phone / WhatsApp (optional)
            <input 
              type="text" 
              value={formData.phone || ''} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="border border-line rounded-lg p-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Pax
            <input 
              type="number" 
              min="1" 
              value={formData.pax ?? ''}
              onChange={(e) => handlePaxChange(e.target.value)}
              className="border border-line rounded-lg p-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Expected revenue ($)
            <input 
              type="number" 
              step="0.01"
              value={formData.revenue || ''} 
              onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value)})}
              className="border border-line rounded-lg p-2"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.paid || false} 
              onChange={(e) => setFormData({...formData, paid: e.target.checked})}
              className="w-4 h-4"
            />
            Payment received
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Expense ($)
            <input 
              type="number" 
              step="0.01"
              value={formData.expense == null ? '' : formData.expense}
              onChange={(e) => setFormData({...formData, expense: e.target.value === '' ? null : parseFloat(e.target.value)})}
              className="border border-line rounded-lg p-2"
            />
          </label>

          <div className="col-span-1 md:col-span-2 bg-bg p-3 rounded-lg text-sm">
            Profit: <b className={formData.revenue && formData.expense !== undefined && formData.expense !== null ? (formData.revenue - (formData.expense || 0) < 0 ? 'text-bad' : 'text-ok') : ''}>
              {formData.expense === null || formData.expense === undefined ? 'waiting for expense' : `$${( (formData.revenue || 0) - (formData.expense || 0) ).toFixed(2)}`}
            </b>
          </div>

          <label className="col-span-1 md:col-span-2 flex flex-col gap-1 text-sm font-semibold">
            Notes (optional)
            <textarea 
              rows={2}
              value={formData.notes || ''} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="border border-line rounded-lg p-2"
            />
          </label>

          {error && <div className="col-span-1 md:col-span-2 text-bad text-sm">{error}</div>}

          <div className="col-span-1 md:col-span-2 flex gap-2 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-line rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Save Booking</button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
