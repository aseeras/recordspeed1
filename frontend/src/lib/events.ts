export type EventItem = {
  id: number;
  title: string;
  description: string;
  eventImage: string;
  location: string;
  /** Dates as the backend stores them: "MM/DD/YYYY HH:mm" (month and day may be unpadded). */
  dates: string[];
};

export type NewEvent = Omit<EventItem, 'id'>;

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/;

/** Parses a backend date string into a local Date, or null when it is malformed. */
export function parseEventDate(value: string): Date | null {
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, month, day, year, hours, minutes] = match.map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  // Reject overflowing values such as 02/31, which Date would roll into March.
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date in the backend's "MM/DD/YYYY HH:mm" format. */
export function toEventDateString(date: Date): string {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The event's dates, parsed and sorted chronologically; malformed entries are dropped. */
export function sortedDates(event: Pick<EventItem, 'dates'>): Date[] {
  return event.dates
    .map(parseEventDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
}

/** The earliest date of an event, which is what the list is ordered by. */
export function firstDate(event: Pick<EventItem, 'dates'>): Date | null {
  return sortedDates(event)[0] ?? null;
}

/** Events ordered by their earliest date; events without a valid date go last. */
export function sortEventsByDate<T extends Pick<EventItem, 'dates'>>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const da = firstDate(a);
    const db = firstDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });
}

/** Human-friendly date, e.g. "Jul 27, 2015, 1:00 PM". */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** The tweet text from the user story: "I'm going to EVENT_NAME @ EVENT_DATE." */
export function shareMessage(event: Pick<EventItem, 'title' | 'dates'>): string {
  const date = firstDate(event);
  const when = date ? formatDisplayDate(date) : event.dates[0] ?? '';
  return `I'm going to ${event.title} @ ${when}.`;
}

export function twitterShareUrl(event: Pick<EventItem, 'title' | 'dates'>): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage(event))}`;
}

export type EventFormErrors = Partial<Record<keyof NewEvent, string>>;

export function validateNewEvent(event: NewEvent): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!event.title.trim()) errors.title = 'Title is required';
  if (!event.description.trim()) errors.description = 'Description is required';
  if (!event.location.trim()) errors.location = 'Place is required';
  if (event.dates.length === 0) errors.dates = 'Add at least one date';
  if (!/^https?:\/\/\S+$/i.test(event.eventImage.trim())) {
    errors.eventImage = 'Enter a picture URL starting with http:// or https://';
  }
  return errors;
}
