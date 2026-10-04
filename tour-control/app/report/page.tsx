'use client';
import React, { useState, useMemo, useRef } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Booking, Tour } from '@/types';
import StorageError from '@/components/StorageError';

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const { bookings, setBookings, tours, setTours, season, setSeason, initialized, error: storageError } = useStorage();
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [backupError, setBackupError] = useState('');
  const restoreInput = useRef<HTMLInputElement>(null);

  const closedTours = useMemo(() => {
    return bookings.filter(b => !b.cancelled && b.expense !== null && b.expense !== undefined && String(b.expense) !== "");
  }, [bookings]);

  const stats = useMemo(() => {
    const revenue = closedTours.reduce((sum, b) => sum + b.revenue, 0);
    const expense = closedTours.reduce((sum, b) => sum + (b.expense || 0), 0);
    return {
      revenue,
      expense,
      profit: revenue - expense
    };
  }, [closedTours]);

  const groupedData = useMemo(() => {
    const groups: Record<string, { n: number; r: number; e: number; p: number }> = {};
    
    closedTours.forEach(b => {
      const date = new Date(b.datetime);
      let key = '';
      if (granularity === 'day') {
        key = b.datetime.slice(0, 10);
      } else if (granularity === 'week') {
        const firstDay = new Date(date);
        firstDay.setDate(date.getDate() - (date.getDay() + 6) % 7);
        key = `Week of ${localDateKey(firstDay)}`;
      } else {
        key = b.datetime.slice(0, 7);
      }

      if (!groups[key]) groups[key] = { n: 0, r: 0, e: 0, p: 0 };
      groups[key].n++;
      groups[key].r += b.revenue;
      groups[key].e += (b.expense || 0);
      groups[key].p += (b.revenue - (b.expense || 0));
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [closedTours, granularity]);

  const tourBreakdown = useMemo(() => {
    const tours: Record<string, { n: number; g: number; r: number; p: number }> = {};
    closedTours.forEach(b => {
      if (!tours[b.tourName]) tours[b.tourName] = { n: 0, g: 0, r: 0, p: 0 };
      tours[b.tourName].n++;
      tours[b.tourName].g += b.pax;
      tours[b.tourName].r += b.revenue;
      tours[b.tourName].p += (b.revenue - (b.expense || 0));
    });
    return Object.entries(tours).sort((a, b) => b[1].p - a[1].p);
  }, [closedTours]);

  const downloadCSV = () => {
    const headers = ["Date/Period", "Tours", "Revenue", "Expense", "Profit"];
    const rows = groupedData.map(([key, val]) => [key, val.n, val.r, val.e, val.p]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tour-report-${localDateKey(new Date())}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const downloadBackup = () => {
    const backup = JSON.stringify({ tours, bookings, season }, null, 2);
    const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `tour-tracker-backup-${localDateKey(new Date())}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const restoreBackup = async (file: File | undefined) => {
    setBackupError('');
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('tours' in parsed) ||
        !('bookings' in parsed) ||
        !Array.isArray(parsed.tours) ||
        !Array.isArray(parsed.bookings)
      ) {
        throw new Error('This file is not a valid tour tracker backup.');
      }
      if (!window.confirm('Replace all current data with this backup?')) return;

      const results = [
        await setTours(parsed.tours as Tour[]),
        await setBookings(parsed.bookings as Booking[]),
      ];
      if ('season' in parsed && Array.isArray(parsed.season)) {
        results.push(await setSeason(parsed.season as number[]));
      }
      if (results.some(result => !result)) {
        setBackupError('Backup restore did not finish. Check the Supabase error above and retry.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to read this backup file.';
      setBackupError(message);
    } finally {
      if (restoreInput.current) restoreInput.current.value = '';
    }
  };

  if (!initialized) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <StorageError message={storageError} />
      <h2 className="text-3xl font-extrabold mb-2">Report</h2>
      <p className="text-muted mb-6">Closed tours only: tours where the expense has been entered.</p>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {([
          { id: 'day', label: 'Daily' },
          { id: 'week', label: 'Weekly' },
          { id: 'month', label: 'Monthly' },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setGranularity(id)}
            className={`px-4 py-2 border border-line rounded-full text-sm capitalize transition-colors ${
              granularity === id ? 'bg-ink text-white border-ink' : 'bg-card text-ink border-line hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-line rounded-xl p-4">
          <small className="text-muted block">Total Revenue</small>
          <b className="text-2xl block mt-1">${stats.revenue.toLocaleString()}</b>
        </div>
        <div className="bg-card border border-line rounded-xl p-4">
          <small className="text-muted block">Total Expense</small>
          <b className="text-2xl block mt-1">${stats.expense.toLocaleString()}</b>
        </div>
        <div className="bg-card border border-line rounded-xl p-4">
          <small className="text-muted block">Total Profit</small>
          <b className={`text-2xl block mt-1 ${stats.profit < 0 ? 'text-bad' : 'text-ok'}`}>
            ${stats.profit.toLocaleString()}
          </b>
        </div>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse bg-card border border-line rounded-xl overflow-hidden text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 border-b border-line">Travel date</th>
              <th className="p-3 border-b border-line text-right">Tours</th>
              <th className="p-3 border-b border-line text-right">Revenue</th>
              <th className="p-3 border-b border-line text-right">Expense</th>
              <th className="p-3 border-b border-line text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.length > 0 ? groupedData.map(([key, val]) => (
              <tr key={key} className="border-b border-line hover:bg-gray-50">
                <td className="p-3">{key}</td>
                <td className="p-3 text-right">{val.n}</td>
                <td className="p-3 text-right">${val.r.toLocaleString()}</td>
                <td className="p-3 text-right">${val.e.toLocaleString()}</td>
                <td className={`p-3 text-right font-semibold ${val.p < 0 ? 'text-bad' : 'text-ok'}`}>
                  ${val.p.toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">No closed tours yet. Enter an expense on a booking to see it here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mb-3">By tour</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse bg-card border border-line rounded-xl overflow-hidden text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 border-b border-line">Tour</th>
              <th className="p-3 border-b border-line text-right">Tours</th>
              <th className="p-3 border-b border-line text-right">Guests</th>
              <th className="p-3 border-b border-line text-right">Revenue</th>
              <th className="p-3 border-b border-line text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {tourBreakdown.length > 0 ? tourBreakdown.map(([name, val]) => (
              <tr key={name} className="border-b border-line hover:bg-gray-50">
                <td className="p-3">{name}</td>
                <td className="p-3 text-right">{val.n}</td>
                <td className="p-3 text-right">{val.g}</td>
                <td className="p-3 text-right">${val.r.toLocaleString()}</td>
                <td className={`p-3 text-right font-semibold ${val.p < 0 ? 'text-bad' : 'text-ok'}`}>
                  ${val.p.toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">No data yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button 
        onClick={downloadCSV}
        className="px-4 py-2 border border-line rounded-lg bg-card hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        Download report (CSV)
      </button>

      <h3 className="text-lg font-semibold mb-3">Backup</h3>
      <div className="flex flex-wrap gap-2">
        <button onClick={downloadBackup} className="px-4 py-2 border border-line rounded-lg bg-card hover:bg-gray-50 transition-colors text-sm font-medium">
          Save backup file
        </button>
        <button onClick={() => restoreInput.current?.click()} className="px-4 py-2 border border-line rounded-lg bg-card hover:bg-gray-50 transition-colors text-sm font-medium">
          Restore from backup
        </button>
        <input
          ref={restoreInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={event => void restoreBackup(event.target.files?.[0])}
        />
      </div>
      {backupError && <p className="text-bad mt-2" role="alert">{backupError}</p>}
    </div>
  );
}
