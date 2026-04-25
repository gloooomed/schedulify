import { useState, useEffect } from 'react';
import { useTimetableData } from './useTimetableData';
import type { TimetableEntry } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: TimetableEntry;
}

function entryToEvents(entry: TimetableEntry, weeksAhead = 4): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  for (let w = 0; w < weeksAhead; w++) {
    const base = new Date(startOfWeek);
    base.setDate(base.getDate() + w * 7 + entry.day_of_week);

    const [sh, sm] = entry.start_time.split(':').map(Number);
    const [eh, em] = entry.end_time.split(':').map(Number);

    const start = new Date(base);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(base);
    end.setHours(eh, em, 0, 0);

    events.push({
      id: `${entry.id}-w${w}`,
      title: entry.courses?.name ?? 'Class',
      start,
      end,
      resource: entry,
    });
  }
  return events;
}

export function useCalendarData() {
  const { entries, loading, error } = useTimetableData();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const all = entries.flatMap((e) => entryToEvents(e));
    setEvents(all);
  }, [entries]);

  return { events, loading, error };
}