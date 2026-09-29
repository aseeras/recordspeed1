/// <reference types="node" />

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

// Point the client at a port where nothing is listening before it is imported.
process.env.EXPO_PUBLIC_API_URL = 'http://127.0.0.1:9';

const api = await import('./api.ts');
const { demoStore } = await import('./demoData.ts');

test('falls back to the built-in demo events when the server is unreachable', async () => {
  demoStore.reset();
  const events = await api.fetchEvents();
  assert.ok(events.length > 0);
  assert.equal(api.isUsingDemoData(), true);

  const featured = await api.fetchFeaturedEvents();
  assert.ok(featured.every((e) => e.id % 2 === 0));

  const detail = await api.fetchEvent(events[0].id);
  assert.equal(detail.title, events[0].title);
  await assert.rejects(api.fetchEvent(9999), /Event not found/);
});

test('events created while offline show up in the list', async () => {
  demoStore.reset();
  const created = await api.createEvent({
    title: 'Offline event',
    description: 'd',
    location: 'l',
    eventImage: 'https://example.com/a.jpg',
    dates: ['01/01/2030 10:00'],
  });
  const events = await api.fetchEvents();
  assert.ok(events.some((e) => e.id === created.id && e.title === 'Offline event'));
});

test('server errors are reported instead of silently using demo data', async () => {
  const server: Server = createServer((_req, res) => {
    res.statusCode = 500;
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  process.env.EXPO_PUBLIC_API_URL = `http://127.0.0.1:${port}`;
  try {
    const fresh = await import(`./api.ts?server=${port}`);
    await assert.rejects(fresh.fetchEvents(), /Server error \(500\)/);
    assert.equal(fresh.isUsingDemoData(), false);
  } finally {
    server.close();
  }
});
