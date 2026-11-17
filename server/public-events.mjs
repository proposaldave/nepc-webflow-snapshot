// Server-only CourtReserve reader. Never copy this module into dist/ or docs/.
const organizations = Object.freeze({
  rye: { id: '7432', prefix: 'RYE' },
  middleton: { id: '13164', prefix: 'MIDDLETON' }
});
const day = 86400000;

function dateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
}

export function publicEvent(event, club, publicCategoryIds) {
  const org = organizations[club];
  if (!org || event.IsPublicBookingAllowed !== true || event.IsCanceled === true || !publicCategoryIds.has(event.EventCategoryId)) return null;
  if (!/^\d+$/.test(String(event.EventId)) || !/^\d+$/.test(String(event.ReservationId))) return null;
  let url;
  try { url = new URL(event.PublicEventUrl); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'app.courtreserve.com' || url.port || url.username || url.password || url.hash || !new RegExp(`^/+online/publicbookings/${org.id}/?$`, 'i').test(url.pathname)) return null;
  if ([...url.searchParams.keys()].some(key => !['tab', 'eventId', 'reservationId'].includes(key))) return null;
  for (const [key, value] of [['eventId', event.EventId], ['reservationId', event.ReservationId]]) {
    if (url.searchParams.getAll(key).length !== 1 || url.searchParams.get(key) !== String(value)) return null;
  }
  for (const value of [event.StartDateTime, event.EndDateTime]) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) || dateOnly(value.slice(0, 10)) === null || !Number.isFinite(Date.parse(value))) return null;
  }
  if (Date.parse(event.EndDateTime) <= Date.parse(event.StartDateTime)) return null;
  return {
    id: `${event.EventId}-${event.ReservationId}`,
    title: String(event.EventName || '').slice(0, 400),
    categoryId: event.EventCategoryId,
    start: event.StartDateTime,
    end: event.EndDateTime,
    featured: event.IsFeatured === true,
    url: url.href
  };
}

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': status === 200 ? 'public, max-age=30, s-maxage=120' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
    'Cross-Origin-Resource-Policy': 'same-origin',
    ...extraHeaders
  } });
}

function validRange(start, end, now) {
  const first = dateOnly(start), last = dateOnly(end);
  if (first === null || last === null || last <= first || first < now - 45 * day || last > now + 190 * day) return false;
  const weekly = last - first === 7 * day && new Date(first).getUTCDay() === 1;
  const nextMonth = new Date(first);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
  const monthly = start.endsWith('-01') && last === nextMonth.getTime();
  return weekly || monthly;
}

export function createPublicEventService({ fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const cache = new Map(), pending = new Map(), recent = new Map();
  function remember(key, body) {
    cache.delete(key);
    cache.set(key, { time: now(), body });
    while (cache.size > 100) cache.delete(cache.keys().next().value);
  }
  async function organizationGet(club, env, resource, query = {}) {
    const prefix = organizations[club].prefix;
    const url = new URL(`https://api.courtreserve.com/api/v1/${resource}`);
    Object.entries(query).forEach(([name, value]) => url.searchParams.set(name, value));
    const response = await fetchImpl(url, {
      method: 'GET', redirect: 'error',
      headers: { Authorization: `Basic ${btoa(`${env[`${prefix}_USERNAME`]}:${env[`${prefix}_API_KEY`]}`)}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error('Upstream unavailable');
    const body = await response.json();
    if (body.IsSuccessStatusCode !== true || !Array.isArray(body.Data)) throw new Error('Unexpected upstream response');
    return body.Data;
  }
  return async function publicEvents(request, env, edgeCache) {
    if (request.method !== 'GET') return json(405, { error: 'Method not allowed' }, { Allow: 'GET' });
    const url = new URL(request.url), origin = request.headers.get('Origin');
    if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json(403, { error: 'Use the NEPC website to view events' });
    const parameters = ['club', 'start', 'end'];
    if ([...url.searchParams.keys()].some(key => !parameters.includes(key)) || parameters.some(key => url.searchParams.getAll(key).length !== 1)) return json(400, { error: 'Invalid club or date range' });
    const club = url.searchParams.get('club'), start = url.searchParams.get('start'), end = url.searchParams.get('end');
    if (!Object.hasOwn(organizations, club) || !validRange(start, end, now())) return json(400, { error: 'Invalid club or date range' });
    const prefix = organizations[club].prefix;
    if (env.NEPC_ENABLE_PUBLIC_EVENTS !== '1' || !env[`${prefix}_USERNAME`] || !env[`${prefix}_API_KEY`]) return json(503, { error: 'Events are not configured. Open CourtReserve to continue.' });
    const key = `${url.origin}:${club}:${start}:${end}`;
    const cacheUrl = new URL('/api/public-events', url.origin);
    for (const [name, value] of [['club', club], ['start', start], ['end', end]]) cacheUrl.searchParams.set(name, value);
    const cacheRequest = new Request(cacheUrl);
    const saved = cache.get(key);
    if (saved && now() - saved.time < 120000) return json(200, saved.body);
    if (edgeCache) {
      try { const hit = await edgeCache.match(cacheRequest); if (hit) return hit; }
      catch { /* A cache outage must not prevent a read-only event request. */ }
    }
    if (!pending.has(key)) {
      const hits = (recent.get(club) || []).filter(time => now() - time < 60000);
      if (hits.length >= 20) return json(429, { error: 'Please try again shortly' }, { 'Retry-After': '60' });
      recent.set(club, [...hits, now()]);
      const work = (async () => {
        let categories = cache.get(`categories:${club}`);
        if (!categories || now() - categories.time > 3600000) {
          const rows = await organizationGet(club, env, 'eventcalendar/categories');
          // Cache public category IDs only, never the full authenticated response.
          remember(`categories:${club}`, rows.filter(item => item.IsPublic === true).map(item => item.Id));
          categories = cache.get(`categories:${club}`);
        }
        const publicIds = new Set(categories.body);
        const rows = await organizationGet(club, env, 'eventcalendar/eventlist', { startDate: start, endDate: end, status: 'Active' });
        const events = rows.map(event => publicEvent(event, club, publicIds)).filter(Boolean)
          .filter(event => event.start.slice(0, 10) >= start && event.start.slice(0, 10) < end)
          .sort((a, b) => a.start.localeCompare(b.start));
        const body = { club, start, end, updatedAt: new Date(now()).toISOString(), events };
        remember(key, body);
        if (edgeCache) {
          try { await edgeCache.put(cacheRequest, json(200, body)); } catch { /* Continue without edge caching. */ }
        }
        return body;
      })();
      pending.set(key, work);
    }
    try { return json(200, await pending.get(key)); }
    catch { return json(502, { error: 'Events could not be loaded. Open CourtReserve to continue.' }); }
    finally { pending.delete(key); }
  };
}
