'use client';
import React, { useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Tour } from '@/types';

export default function ToursPage() {
  const { tours, setTours, season, setSeason, initialized } = useStorage();
  const [editTour, setEditTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1f8a4c',
    price: '',
    priceHigh: ''
  });
  const [error, setError] = useState('');

  if (!initialized) return <div className="p-4">Loading...</div>;

  const openEdit = (tour: Tour) => {
    setEditTour(tour);
    setFormData({
      name: tour.name,
      color: tour.color,
      price: tour.price.toString(),
      priceHigh: tour.priceHigh.toString(),
    });
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const price = parseFloat(formData.price) || 0;
    const priceHigh = parseFloat(formData.priceHigh) || 0;

    if (!name || price < 0 || priceHigh < 0) {
      setError('Enter a tour name. Prices must be 0 or more.');
      return;
    }

    if (editTour) {
      setTours(tours.map(t => t.id === editTour.id ? { ...t, name, price, priceHigh, color: formData.color } : t));
    } else {
      setTours([...tours, { id: 't' + Date.now(), name, price, priceHigh, color: formData.color }]);
    }

    setEditTour(null);
    setFormData({ name: '', color: '#1f8a4c', price: '', priceHigh: '' });
    setError('');
  };

  const toggleSeasonMonth = (month: number) => {
    setSeason(season.includes(month) ? season.filter(m => m !== month) : [...season, month]);
  };

  const deleteTour = (id: string) => {
    if (confirm('Delete this tour? Past bookings will keep their current data.')) {
      setTours(tours.filter(t => t.id !== id));
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2">Tours</h2>
      <p className="text-muted mb-6">Set a low season and a high season price per guest. The right one pre-fills each new booking by travel date.</p>

      <div className="bg-card border border-line rounded-xl p-4 mb-4">
        <b className="block mb-2">High season months</b>
        <div className="flex flex-wrap gap-1.5">
          {months.map((m, i) => (
            <button
              key={m}
              onClick={() => toggleSeasonMonth(i + 1)}
              className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                season.includes(i + 1) ? 'bg-ink text-white border-ink' : 'bg-card text-ink border-line hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-card border border-line rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Tour name
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-line rounded-lg p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Color
          <input 
            type="color" 
            value={formData.color} 
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="border border-line rounded-lg p-1 h-10 w-full"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Low season price per guest ($)
          <input 
            type="number" 
            step="0.01"
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border border-line rounded-lg p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          High season price per guest ($)
          <input 
            type="number" 
            step="0.01"
            value={formData.priceHigh} 
            onChange={(e) => setFormData({ ...formData, priceHigh: e.target.value })}
            className="border border-line rounded-lg p-2"
          />
        </label>
        {error && <div className="col-span-1 md:col-span-2 text-bad text-sm">{error}</div>}
        <div className="col-span-1 md:col-span-2 flex gap-2">
          <button type="submit" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {editTour ? 'Save Tour' : 'Add Tour'}
          </button>
          {editTour && (
            <button 
              type="button" 
              onClick={() => { setEditTour(null); setFormData({ name: '', color: '#1f8a4c', price: '', priceHigh: '' }); }}
              className="px-4 py-2 border border-line rounded-lg hover:bg-gray-50"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-card border border-line rounded-xl overflow-hidden text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 border-b border-line">Tour</th>
              <th className="p-3 border-b border-line text-right">Low season</th>
              <th className="p-3 border-b border-line text-right">High season</th>
              <th className="p-3 border-b border-line text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.length > 0 ? tours.map(t => (
              <tr key={t.id} className="border-b border-line hover:bg-gray-50">
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: t.color }}>
                    {t.name}
                  </span>
                </td>
                <td className="p-3 text-right">${t.price.toLocaleString()}</td>
                <td className="p-3 text-right">${t.priceHigh.toLocaleString()}</td>
                <td className="p-3 text-right space-x-2">
                  <button 
                    onClick={() => openEdit(t)} 
                    className="px-2 py-1 border border-line rounded hover:bg-gray-100 text-xs"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTour(t.id)} 
                    className="px-2 py-1 border border-line rounded text-bad hover:bg-red-50 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted">No tours defined yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
