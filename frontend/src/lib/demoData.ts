import type { EventItem, NewEvent } from './events.ts';

/**
 * Built-in events used when the backend can't be reached, so the app still works on its own
 * (e.g. opened in the simulator without `npm start` in backend/). Events created while offline
 * live in memory until the app is closed.
 */
const SEED_EVENTS: EventItem[] = [
  {
    id: 1,
    title: '24 Festival de Cine para Niños y Jóvenes – Divercine',
    eventImage: 'https://picsum.photos/id/1011/800/450',
    description:
      'Del lunes 27 de julio al sábado 1º de agosto se desarrolla en el Auditorio del SODRE Nelly Goitiño (18 de Julio y Rio Branco) el 24 Festival de Cine para Niños y Jóvenes - Divercine. La programación incluye películas de largo, medio y cortometraje de varias partes del mundo.',
    dates: ['07/27/2015 13:00', '07/28/2015 13:00', '07/29/2015 13:00', '07/30/2015 13:00', '07/31/2015 13:00'],
    location: 'Auditorio del SODRE',
  },
  {
    id: 2,
    title: 'Jazz a la Calle',
    eventImage: 'https://picsum.photos/id/1025/800/450',
    description: 'Open-air jazz festival with local and international bands across the city.',
    dates: ['01/05/2016 20:00', '01/06/2016 20:00'],
    location: 'Mercedes, Soriano',
  },
  {
    id: 3,
    title: 'Noche de los Museos',
    eventImage: 'https://picsum.photos/id/1040/800/450',
    description: 'Museums across Montevideo open their doors for free, with guided tours and live music.',
    dates: ['10/10/2015 19:00'],
    location: 'Montevideo',
  },
  {
    id: 4,
    title: 'Montevideo Rock',
    eventImage: 'https://picsum.photos/id/1062/800/450',
    description: 'Two days of rock bands on three stages at the Rural del Prado.',
    dates: ['03/19/2016 16:00', '03/20/2016 16:00'],
    location: 'Rural del Prado',
  },
];

let events: EventItem[] = SEED_EVENTS.map((e) => ({ ...e, dates: [...e.dates] }));

export const demoStore = {
  all(): EventItem[] {
    return [...events];
  },
  /** Same rule as the backend: even ids are featured. */
  featured(): EventItem[] {
    return events.filter((e) => e.id % 2 === 0);
  },
  find(id: number | string): EventItem | undefined {
    return events.find((e) => String(e.id) === String(id));
  },
  create(event: NewEvent): EventItem {
    const created = { ...event, id: Math.max(0, ...events.map((e) => e.id)) + 1 };
    events = [...events, created];
    return created;
  },
  reset() {
    events = SEED_EVENTS.map((e) => ({ ...e, dates: [...e.dates] }));
  },
};
