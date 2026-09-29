/// <reference types="node" />

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseEventDate,
  shareMessage,
  sortEventsByDate,
  toEventDateString,
  twitterShareUrl,
  validateNewEvent,
} from './events.ts';

test('parseEventDate parses the backend format, including unpadded days', () => {
  const date = parseEventDate('07/1/2015 13:00');
  assert.ok(date);
  assert.equal(date.getFullYear(), 2015);
  assert.equal(date.getMonth(), 6);
  assert.equal(date.getDate(), 1);
  assert.equal(date.getHours(), 13);
});

test('parseEventDate rejects malformed and overflowing dates', () => {
  assert.equal(parseEventDate('not a date'), null);
  assert.equal(parseEventDate('2015-07-01 13:00'), null);
  assert.equal(parseEventDate('02/31/2015 10:00'), null);
});

test('toEventDateString round-trips through parseEventDate', () => {
  const date = new Date(2026, 0, 5, 9, 7);
  assert.equal(toEventDateString(date), '01/05/2026 09:07');
  assert.equal(parseEventDate(toEventDateString(date))?.getTime(), date.getTime());
});

test('sortEventsByDate orders by each event earliest date, undated last', () => {
  const events = [
    { id: 1, dates: ['08/01/2015 10:00'] },
    { id: 2, dates: [] },
    { id: 3, dates: ['09/01/2015 10:00', '07/15/2015 10:00'] },
  ];
  assert.deepEqual(
    sortEventsByDate(events).map((e) => e.id),
    [3, 1, 2],
  );
});

test('shareMessage follows the user story wording and uses the earliest date', () => {
  const message = shareMessage({
    title: 'Divercine',
    dates: ['07/28/2015 13:00', '07/1/2015 13:00'],
  });
  assert.match(message, /^I'm going to Divercine @ Jul 1, 2015, 1:00\sPM\.$/);
});

test('twitterShareUrl encodes the message for the tweet intent', () => {
  const url = twitterShareUrl({ title: 'Rock & Roll', dates: ['07/01/2015 13:00'] });
  assert.ok(url.startsWith('https://twitter.com/intent/tweet?text='));
  assert.match(url, /Rock%20%26%20Roll/);
});

test('validateNewEvent reports each missing field', () => {
  const errors = validateNewEvent({
    title: ' ',
    description: '',
    location: '',
    dates: [],
    eventImage: 'ftp://nope',
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    'dates',
    'description',
    'eventImage',
    'location',
    'title',
  ]);
  assert.deepEqual(
    validateNewEvent({
      title: 'A',
      description: 'B',
      location: 'C',
      dates: ['07/01/2015 13:00'],
      eventImage: 'https://example.com/a.jpg',
    }),
    {},
  );
});
