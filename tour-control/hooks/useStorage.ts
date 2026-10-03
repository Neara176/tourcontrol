import { useState, useEffect } from 'react';
import { Tour, Booking } from '../types';

const K1 = "ppt3_tours";
const K2 = "ppt3_bookings";
const K3 = "ppt3_season";

const DEF_TOURS: Tour[] = [
  { id: "t1", name: "Food Tour", price: 30, priceHigh: 35, color: "#1f8a4c" },
  { id: "t2", name: "Kun Khmer", price: 25, priceHigh: 30, color: "#c8372d" },
  { id: "t3", name: "City Tour", price: 35, priceHigh: 40, color: "#2563c9" },
  { id: "t4", name: "Tuk-tuk Sunset", price: 20, priceHigh: 25, color: "#d9780f" },
];

export function useStorage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [season, setSeason] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  // localStorage is available only after hydration in the browser.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedTours = JSON.parse(localStorage.getItem(K1) || JSON.stringify(DEF_TOURS));
    const storedBookings = JSON.parse(localStorage.getItem(K2) || "[]");
    const storedSeason = JSON.parse(localStorage.getItem(K3) || JSON.stringify([11, 12, 1, 2, 3]));
    
    setTours(storedTours);
    setBookings(storedBookings);
    setSeason(storedSeason);
    setInitialized(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const saveTours = (newData: Tour[]) => {
    localStorage.setItem(K1, JSON.stringify(newData));
    setTours(newData);
  };

  const saveBookings = (newData: Booking[]) => {
    localStorage.setItem(K2, JSON.stringify(newData));
    setBookings(newData);
  };

  const saveSeason = (newData: number[]) => {
    localStorage.setItem(K3, JSON.stringify(newData));
    setSeason(newData);
  };

  return {
    tours, setTours: saveTours,
    bookings, setBookings: saveBookings,
    season, setSeason: saveSeason,
    initialized
  };
}
