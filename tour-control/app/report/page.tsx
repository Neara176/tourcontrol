'use client';
import React, { useState, useMemo } from 'react';
import { useStorage } from '@/hooks/useStorage';

export default function ReportsPage() {
  const { bookings, initialized } = useStorage();
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

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
        key = date.toISOString().split('T')[0];
      } else if (granularity === 'week') {
        const firstDay = new Date(date);
        firstDay.setDate(date.getDate() - (date.getDay() + 6) % 7);
        key = `Week of ${firstDay.toISOString().split('T')[0]}`;
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
    link.download = `tour-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!initialized) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2">Report</h2>
      <p className="text-muted mb-6">Closed tours only: tours where the expense has been entered.</p>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(['day', 'week', 'month'] as const).map(g => (
          <button
            key={g}
            onClick={() => setGranularity(g)}
            className={`px-4 py-2 border border-line rounded-full text-sm capitalize transition-colors ${
              granularity === g ? 'bg-ink text-white border-ink' : 'bg-card text-ink border-line hover:bg-gray-50'
            }`}
          >
            {g}ly
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
              <th className="p-3 border-b border-line">Period</th>
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
                <td colSpan={5} className="p-6 text-center text-muted">No closed tours yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mb-3">By Tour</h3>
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
    </div>
  );
}
