import trip from "@/data/trip/iceland-2026.json";

export interface TripDay {
  date: string;
  day: number;
  location: string;
  title: string;
  blurb: string;
  guideIds: string[];
  tags: string[];
  eclipsePrep?: boolean;
  eclipseDay?: boolean;
}

export const TRIP_DAYS: TripDay[] = trip.days;
export const TRIP_START = trip.start;
export const TRIP_END = trip.end;

/** Today's itinerary day; before the trip, the first day (as "next up"). */
export function tripDayFor(dateISO: string): { day: TripDay; upcoming: boolean } | null {
  const exact = TRIP_DAYS.find((d) => d.date === dateISO);
  if (exact) return { day: exact, upcoming: false };
  if (dateISO < TRIP_START) return { day: TRIP_DAYS[0], upcoming: true };
  return null; // post-trip: no daily card
}
