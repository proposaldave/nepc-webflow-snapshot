import assert from 'node:assert/strict';
import { createPublicEventService, publicEvent } from '../server/public-events.mjs';

const currentTime = Date.parse('2026-11-17T15:00:00Z');
const env = {
  NEPC_ENABLE_PUBLIC_EVENTS: '1',
  RYE_USERNAME: 'rye-test-user', RYE_API_KEY: 'rye-test-key',
  MIDDLETON_USERNAME: 'middleton-test-user', MIDDLETON_API_KEY: 'middleton-test-key'
};
const event = (org = '7432') => ({
  EventId: 123, ReservationId: 456, EventName: 'Public test session',
  EventCategoryId: 10, IsPublicBookingAllowed: true, IsCanceled: false,
  StartDateTime: '2026-11-18T10:00:00', EndDateTime: '2026-11-18T12:00:00',
  PublicEventUrl: `https://app.courtreserve.com/online/publicbookings/${org}?eventId=123&reservationId=456`,
  Participants: [{ Email: 'not-for-the-browser' }], SsoUrl: 'not-for-the-browser', RegisteredCount: 12
});
const request = (query = 'club=rye&start=2026-11-16&end=2026-11-23', options = {}) =>
  new Request(`https://nepc.example/api/public-events?${query}`, options);
// CourtReserve's real public links currently contain a doubled leading slash.
assert(publicEvent({ ...event(), PublicEventUrl: event().PublicEventUrl.replace('/online/', '//online/') }, 'rye', new Set([10])));
const calls = [];
const fetchImpl = async (url, options) => {
  assert.equal(url.origin, 'https://api.courtreserve.com');
  assert.equal(options.method, 'GET');
  assert.equal(options.redirect, 'error');
  calls.push({ url, options });
  if (url.pathname.endsWith('/categories')) return Response.json({ IsSuccessStatusCode: true, Data: [{ Id: 10, IsPublic: true }, { Id: 20, IsPublic: false }] });
  assert.equal(url.pathname, '/api/v1/eventcalendar/eventlist');
  assert.equal(url.searchParams.get('status'), 'Active');
  const org = options.headers.Authorization === `Basic ${btoa('middleton-test-user:middleton-test-key')}` ? '13164' : '7432';
  return Response.json({ IsSuccessStatusCode: true, Data: [
    event(org), { ...event(org), IsPublicBookingAllowed: false },
    { ...event(org), EventCategoryId: 20 }, { ...event(org), IsCanceled: true },
    { ...event(org), StartDateTime: '2026-11-24T10:00:00', EndDateTime: '2026-11-24T12:00:00' }
  ] });
};
const service = createPublicEventService({ fetchImpl, now: () => currentTime });
const edgeEntries = new Map();
const edgeCache = {
  async match(req) { return edgeEntries.get(req.url)?.clone(); },
  async put(req, response) { edgeEntries.set(req.url, response.clone()); }
};
let response = await service(request(), env, edgeCache);
assert.equal(response.status, 200);
assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
let body = await response.json();
assert.equal(body.events.length, 1);
assert.deepEqual(Object.keys(body.events[0]).sort(), ['id', 'title', 'categoryId', 'start', 'end', 'featured', 'url'].sort());
assert(!JSON.stringify(body).includes('not-for-the-browser'));
for (const value of Object.values(env)) if (value !== '1') assert(!JSON.stringify(body).includes(value));
assert.equal(calls.length, 2);
await service(request(), env, edgeCache);
assert.equal(calls.length, 2, 'memory cache must avoid repeated authenticated requests');
const secondService = createPublicEventService({ fetchImpl, now: () => currentTime });
await secondService(request(), env, edgeCache);
assert.equal(calls.length, 2, 'edge cache must work across service instances');
response = await service(request('club=middleton&start=2026-11-16&end=2026-11-23'), env);
body = await response.json();
assert.equal(body.club, 'middleton');
assert(body.events[0].url.includes('/13164?'));
assert.equal(calls.length, 4);
assert.equal(calls[3].options.headers.Authorization, `Basic ${btoa('middleton-test-user:middleton-test-key')}`);

for (const query of [
  'club=other&start=2026-11-16&end=2026-11-23',
  'club=__proto__&start=2026-11-16&end=2026-11-23',
  'club=rye&start=2026-11-17&end=2026-11-24',
  'club=rye&start=2026-11-16&end=2027-01-01',
  'club=rye&start=2026-02-30&end=2026-03-09',
  'club=rye&start=2026-11-16&end=2026-11-23&resource=members',
  'club=rye&club=middleton&start=2026-11-16&end=2026-11-23',
  'club=rye&start=2026-11-16'
]) assert.equal((await service(request(query), env)).status, 400);
assert.equal(calls.length, 4, 'invalid queries must not reach CourtReserve');
for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']) {
  response = await service(request(undefined, { method }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET');
}
for (const headers of [{ Origin: 'https://other.example' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
  assert.equal((await service(request(undefined, { headers }), env)).status, 403);
}
for (const settings of [{}, { ...env, NEPC_ENABLE_PUBLIC_EVENTS: '0' }, { ...env, RYE_API_KEY: '' }]) {
  response = await service(request(), settings, edgeCache);
  assert.equal(response.status, 503, 'configuration must be checked even when cached');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
}
for (const changes of [
  { PublicEventUrl: event().PublicEventUrl + '&apiKey=invalid' },
  { PublicEventUrl: event().PublicEventUrl.replace('eventId=123', 'eventId=789') },
  { PublicEventUrl: event().PublicEventUrl + '&eventId=123' },
  { PublicEventUrl: event().PublicEventUrl + '#fragment' },
  { StartDateTime: '2026-02-30T10:00:00' },
  { EndDateTime: '2026-11-18T09:00:00' }
]) assert.equal(publicEvent({ ...event(), ...changes }, 'rye', new Set([10])), null);
const failingService = createPublicEventService({ fetchImpl: async () => { throw new Error('internal detail that must not escape'); }, now: () => currentTime });
response = await failingService(request(), env);
assert.equal(response.status, 502);
assert(!(await response.text()).includes('internal detail'));
assert.equal(response.headers.get('Cache-Control'), 'no-store');

// Coalesce concurrent identical requests, then refresh after two minutes.
let time = currentTime, concurrentCalls = 0;
const concurrent = createPublicEventService({ now: () => time, fetchImpl: async (url, options) => {
  concurrentCalls++;
  await new Promise(resolve => setTimeout(resolve, 1));
  return fetchImpl(url, options);
} });
const results = await Promise.all(Array.from({ length: 8 }, () => concurrent(request(), env)));
assert(results.every(item => item.status === 200));
assert.equal(concurrentCalls, 2);
time += 121000;
await concurrent(request(), env);
assert.equal(concurrentCalls, 3, 'refresh events while retaining public category cache');

// The server accepts the same weekly and monthly periods as the interface.
assert.equal((await service(request('club=rye&start=2026-11-01&end=2026-12-01'), env)).status, 200);
const rateLimited = createPublicEventService({ fetchImpl: async () => { throw new Error('unavailable'); }, now: () => currentTime });
for (let index = 0; index < 20; index++) assert.equal((await rateLimited(request(), env)).status, 502);
response = await rateLimited(request(), env);
assert.equal(response.status, 429);
assert.equal(response.headers.get('Retry-After'), '60');
console.log('PASS: public event endpoint, both clubs, GET-only, public field boundaries, protected configuration, cache, deduplication, rate limit and safe failures.');
