'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Bookings', path: '/bookings', icon: '🧾' },
  { name: 'Tours', path: '/tours', icon: '🛺' },
  { name: 'Report', path: '/report', icon: '📈' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-shell hidden md:flex">
      <h1 className="nav-brand">
        Phnom Penh Tour Tracker
        <span className="nav-brand-sub">Bookings &amp; Profit</span>
      </h1>

      <div className="nav-list">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            aria-current={pathname === item.path ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
