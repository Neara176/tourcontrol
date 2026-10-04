'use client';

import { useCallback, useEffect, useState } from 'react';
import { Booking, Tour } from '@/types';
import { useAuth } from '@/components/AuthProvider';

const K1 = 'ppt3_tours';
const K2 = 'ppt3_bookings';
const K3 = 'ppt3_season';
const K4 = 'ppt3_supabase_migration_owner';

const DEF_TOURS: Tour[] = [
  { id: 't1', name: 'Food Tour', price: 30, priceHigh: 35, color: '#1f8a4c' },
  { id: 't2', name: 'Kun Khmer', price: 25, priceHigh: 30, color: '#c8372d' },
  { id: 't3', name: 'City Tour', price: 35, priceHigh: 40, color: '#2563c9' },
  { id: 't4', name: 'Tuk-tuk Sunset', price: 20, priceHigh: 25, color: '#d9780f' },
];
const DEF_SEASON = [11, 12, 1, 2, 3];

type TourRow = {
  id: string;
  name: string;
  price: number;
  price_high: number;
  color: string;
};

type BookingRow = {
  id: number;
  tour_id: string;
  tour_name: string;
  color: string;
  datetime: string;
  guest: string;
  phone: string;
  pax: number;
  revenue: number;
  paid: boolean;
  expense: number | null;
  notes: string;
  cancelled: boolean;
};

type SettingsRow = {
  season: number[];
  migration_complete: boolean;
};

const parseLocal = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : JSON.parse(stored) as T;
};

const toTour = (row: TourRow): Tour => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  priceHigh: Number(row.price_high),
  color: row.color,
});

const toTourRow = (tour: Tour, userId: string) => ({
  owner_id: userId,
  id: tour.id,
  name: tour.name,
  price: tour.price,
  price_high: tour.priceHigh,
  color: tour.color,
});

const toBooking = (row: BookingRow): Booking => ({
  id: Number(row.id),
  tourId: row.tour_id,
  tourName: row.tour_name,
  color: row.color,
  datetime: row.datetime,
  guest: row.guest,
  phone: row.phone ?? '',
  pax: Number(row.pax),
  revenue: Number(row.revenue),
  paid: row.paid,
  expense: row.expense === null ? null : Number(row.expense),
  notes: row.notes ?? '',
  cancelled: row.cancelled,
});

const toBookingRow = (booking: Booking, userId: string) => ({
  owner_id: userId,
  id: booking.id,
  tour_id: booking.tourId,
  tour_name: booking.tourName,
  color: booking.color,
  datetime: booking.datetime,
  guest: booking.guest,
  phone: booking.phone ?? '',
  pax: booking.pax,
  revenue: booking.revenue,
  paid: booking.paid,
  expense: booking.expense,
  notes: booking.notes ?? '',
  cancelled: booking.cancelled,
});

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function useStorage() {
  const { client, user } = useAuth();
  const userId = user?.id ?? null;
  const [tours, setToursState] = useState<Tour[]>([]);
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [season, setSeasonState] = useState<number[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const initialized = Boolean(userId && loadedUserId === userId);

  useEffect(() => {
    if (!client || !userId) return;

    let active = true;

    const load = async () => {
      try {
        const [tourResult, bookingResult, settingsResult] = await Promise.all([
          client.from('tours').select('*').eq('owner_id', userId),
          client.from('bookings').select('*').eq('owner_id', userId),
          client.from('app_settings').select('*').eq('owner_id', userId).maybeSingle(),
        ]);
        throwIfError(tourResult.error);
        throwIfError(bookingResult.error);
        throwIfError(settingsResult.error);

        let tourRows = (tourResult.data ?? []) as TourRow[];
        let bookingRows = (bookingResult.data ?? []) as BookingRow[];
        let settings = settingsResult.data as SettingsRow | null;
        let localTours: Tour[] = [];
        let localBookings: Booking[] = [];
        let localSeason = DEF_SEASON;

        const migrationOwner = localStorage.getItem(K4);
        const canImportLegacy = migrationOwner === null || migrationOwner === userId;

        if (!settings) {
          localTours = canImportLegacy ? parseLocal(K1, DEF_TOURS) : DEF_TOURS;
          localBookings = canImportLegacy ? parseLocal(K2, [] as Booking[]) : [];
          localSeason = canImportLegacy ? parseLocal(K3, DEF_SEASON) : DEF_SEASON;
          const insertSettings = await client.from('app_settings').upsert({
            owner_id: userId,
            season: localSeason,
            migration_complete: false,
          }, {
            onConflict: 'owner_id',
            ignoreDuplicates: true,
          });
          throwIfError(insertSettings.error);
          const settingsReload = await client
            .from('app_settings')
            .select('*')
            .eq('owner_id', userId)
            .single();
          throwIfError(settingsReload.error);
          settings = settingsReload.data as SettingsRow;
        } else if (!settings.migration_complete) {
          localTours = canImportLegacy ? parseLocal(K1, DEF_TOURS) : DEF_TOURS;
          localBookings = canImportLegacy ? parseLocal(K2, [] as Booking[]) : [];
        }

        if (!settings.migration_complete) {
          if (tourRows.length === 0) {
            const toursToImport = localTours.length > 0 ? localTours : DEF_TOURS;
            const insertTours = await client.from('tours').upsert(
              toursToImport.map(tour => toTourRow(tour, userId)),
              { onConflict: 'owner_id,id' },
            );
            throwIfError(insertTours.error);
            tourRows = toursToImport.map(tour => ({
              id: tour.id,
              name: tour.name,
              price: tour.price,
              price_high: tour.priceHigh,
              color: tour.color,
            }));
          }

          if (bookingRows.length === 0 && localBookings.length > 0) {
            const insertBookings = await client.from('bookings').upsert(
              localBookings.map(booking => toBookingRow(booking, userId)),
              { onConflict: 'owner_id,id' },
            );
            throwIfError(insertBookings.error);
            bookingRows = localBookings.map(booking => ({
              id: booking.id,
              tour_id: booking.tourId,
              tour_name: booking.tourName,
              color: booking.color,
              datetime: booking.datetime,
              guest: booking.guest,
              phone: booking.phone ?? '',
              pax: booking.pax,
              revenue: booking.revenue,
              paid: booking.paid,
              expense: booking.expense,
              notes: booking.notes ?? '',
              cancelled: booking.cancelled,
            }));
          }

          const finishMigration = await client
            .from('app_settings')
            .update({ migration_complete: true })
            .eq('owner_id', userId);
          throwIfError(finishMigration.error);
          localStorage.setItem(K4, userId);
        }

        const loadedTours = tourRows.map(toTour);
        const loadedBookings = bookingRows.map(toBooking);
        const loadedSeason = settings.season ?? DEF_SEASON;

        if (!active) return;
        setError('');
        localStorage.setItem(K1, JSON.stringify(loadedTours));
        localStorage.setItem(K2, JSON.stringify(loadedBookings));
        localStorage.setItem(K3, JSON.stringify(loadedSeason));
        setToursState(loadedTours);
        setBookingsState(loadedBookings);
        setSeasonState(loadedSeason);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load your Supabase data.');
        }
      } finally {
        if (active) setLoadedUserId(userId);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [client, userId]);

  const saveTours = useCallback(async (next: Tour[]): Promise<boolean> => {
    if (!client || !userId) return false;
    setError('');
    try {
      const result = await client.rpc('replace_tours', {
        p_rows: next.map(tour => ({
          id: tour.id,
          name: tour.name,
          price: tour.price,
          price_high: tour.priceHigh,
          color: tour.color,
        })),
      });
      throwIfError(result.error);
      setToursState(next);
      localStorage.setItem(K1, JSON.stringify(next));
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save tours to Supabase.');
      return false;
    }
  }, [client, userId]);

  const saveBookings = useCallback(async (next: Booking[]): Promise<boolean> => {
    if (!client || !userId) return false;
    setError('');
    try {
      const result = await client.rpc('replace_bookings', {
        p_rows: next.map(booking => ({
          id: booking.id,
          tour_id: booking.tourId,
          tour_name: booking.tourName,
          color: booking.color,
          datetime: booking.datetime,
          guest: booking.guest,
          phone: booking.phone,
          pax: booking.pax,
          revenue: booking.revenue,
          paid: booking.paid,
          expense: booking.expense,
          notes: booking.notes,
          cancelled: booking.cancelled,
        })),
      });
      throwIfError(result.error);
      setBookingsState(next);
      localStorage.setItem(K2, JSON.stringify(next));
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save bookings to Supabase.');
      return false;
    }
  }, [client, userId]);

  const saveSeason = useCallback(async (next: number[]): Promise<boolean> => {
    if (!client || !userId) return false;
    setError('');
    try {
      const result = await client.from('app_settings').upsert({
        owner_id: userId,
        season: next,
      }, { onConflict: 'owner_id' });
      throwIfError(result.error);
      setSeasonState(next);
      localStorage.setItem(K3, JSON.stringify(next));
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save season settings to Supabase.');
      return false;
    }
  }, [client, userId]);

  return {
    tours,
    setTours: saveTours,
    bookings,
    setBookings: saveBookings,
    season,
    setSeason: saveSeason,
    initialized,
    error,
  };
}
