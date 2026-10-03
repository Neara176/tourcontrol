export interface Tour {
  id: string;
  name: string;
  price: number;
  priceHigh: number;
  color: string;
}

export interface Booking {
  id: number;
  tourId: string;
  tourName: string;
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
}

export type BookingStatus = 'all' | 'upcoming' | 'need' | 'done' | 'cancelled';
