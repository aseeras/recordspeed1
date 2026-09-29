import { demoStore } from './demoData.ts';
import type { EventItem, NewEvent } from './events.ts';

/**
 * Base URL of the events backend. `localhost` works in the iOS Simulator; on a physical
 * device set EXPO_PUBLIC_API_URL to your computer's LAN address, e.g. http://192.168.1.20:3000.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = 5000;

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/** Thrown when the server can't be reached at all (not running, wrong address, timeout). */
class UnreachableError extends Error {}

/** Whether the last request fell back to the built-in demo events because the server was unreachable. */
let usingDemo = false;
export const isUsingDemoData = () => usingDemo;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new UnreachableError(`Can't reach the events server at ${API_URL}`);
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 404) throw new ApiError('Event not found', 404);
  if (!response.ok) throw new ApiError(`Server error (${response.status})`, response.status);
  return (await response.json()) as T;
}

/** Calls the server; if it can't be reached, answers from the built-in demo events instead. */
async function withFallback<T>(online: () => Promise<T>, offline: () => T): Promise<T> {
  try {
    const result = await online();
    usingDemo = false;
    return result;
  } catch (e) {
    if (!(e instanceof UnreachableError)) throw e;
    usingDemo = true;
    return offline();
  }
}

export function fetchEvents(): Promise<EventItem[]> {
  return withFallback(
    async () => (await request<{ events: EventItem[] }>('/events')).events,
    () => demoStore.all(),
  );
}

export function fetchFeaturedEvents(): Promise<EventItem[]> {
  return withFallback(
    async () => (await request<{ events: EventItem[] }>('/events/featured')).events,
    () => demoStore.featured(),
  );
}

export function fetchEvent(id: number | string): Promise<EventItem> {
  return withFallback(
    async () => (await request<{ event: EventItem }>(`/events/${encodeURIComponent(String(id))}`)).event,
    () => {
      const event = demoStore.find(id);
      if (!event) throw new ApiError('Event not found', 404);
      return event;
    },
  );
}

export function createEvent(event: NewEvent): Promise<EventItem> {
  return withFallback(
    async () =>
      (
        await request<{ event: EventItem }>('/events', {
          method: 'POST',
          body: JSON.stringify({ event }),
        })
      ).event,
    () => demoStore.create(event),
  );
}
