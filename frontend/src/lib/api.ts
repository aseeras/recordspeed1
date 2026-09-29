import type { EventItem, NewEvent } from './events.ts';

/**
 * Base URL of the events backend. `localhost` works in the iOS Simulator; on a physical
 * device set EXPO_PUBLIC_API_URL to your computer's LAN address, e.g. http://192.168.1.20:3000.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(`Can't reach the events server at ${API_URL}. Is the backend running?`);
  }
  if (response.status === 404) throw new ApiError('Event not found', 404);
  if (!response.ok) throw new ApiError(`Server error (${response.status})`, response.status);
  return (await response.json()) as T;
}

export async function fetchEvents(): Promise<EventItem[]> {
  return (await request<{ events: EventItem[] }>('/events')).events;
}

export async function fetchFeaturedEvents(): Promise<EventItem[]> {
  return (await request<{ events: EventItem[] }>('/events/featured')).events;
}

export async function fetchEvent(id: number | string): Promise<EventItem> {
  return (await request<{ event: EventItem }>(`/events/${encodeURIComponent(String(id))}`)).event;
}

export async function createEvent(event: NewEvent): Promise<EventItem> {
  return (
    await request<{ event: EventItem }>('/events', {
      method: 'POST',
      body: JSON.stringify({ event }),
    })
  ).event;
}
