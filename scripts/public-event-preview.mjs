// Read-only adapter for the local design preview. Never shipped in dist/docs.
// Credentials come from the preview process environment, never from browser code.
const organizations = {
  rye: { id: '7432', prefix: 'RYE' },
  middleton: { id: '13164', prefix: 'MIDDLETON' }
};
const cache = new Map();
const pending = new Map();
const recent = new Map();
export function publicEvent(event, club, publicCategoryIds) {
  const org = organizations[club];
  if (!org || event.IsPublicBookingAllowed !== true || event.IsCanceled === true || !publicCategoryIds.has(event.EventCategoryId)) return null;
  let url;
  try { url = new URL(event.PublicEventUrl); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'app.courtreserve.com' || url.username || url.password || !new RegExp(`^/+online/publicbookings/${org.id}/?$`, 'i').test(url.pathname)) return null;
  if ([...url.searchParams.keys()].some(key => !['tab', 'eventId', 'reservationId'].includes(key))) return null;
  if (!/^\d+$/.test(String(event.EventId)) || !/^\d+$/.test(String(event.ReservationId))) return null;
  if (!/^\d{4}-\d{2}-\d{2}T/.test(event.StartDateTime || '') || !/^\d{4}-\d{2}-\d{2}T/.test(event.EndDateTime || '')) return null;
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
async function organizationGet(club, resource, query = {}) {
  const org = organizations[club];
  const username = process.env[`${org.prefix}_USERNAME`];
  const key = process.env[`${org.prefix}_API_KEY`];
  if (!username || !key) throw new Error('Preview event feed is not configured');
  const url = new URL(`https://api.courtreserve.com/api/v1/${resource}`);
  Object.entries(query).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'error',
    headers: { Authorization: `Basic ${Buffer.from(`${username}:${key}`).toString('base64')}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('CourtReserve event feed is unavailable');
  const body = await response.json();
  if (!body.IsSuccessStatusCode || !Array.isArray(body.Data)) throw new Error('CourtReserve event feed is unavailable');
  return body.Data;
}
export async function eventPreview(req, res, url) {
  const send = (status, body) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });
  if (process.env.NEPC_ENABLE_EVENT_PREVIEW !== '1') return send(503, { error: 'Event preview is not configured' });
  const club = url.searchParams.get('club'), start = url.searchParams.get('start'), end = url.searchParams.get('end');
  const first = Date.parse(`${start}T00:00:00Z`), last = Date.parse(`${end}T00:00:00Z`);
  if (!organizations[club] || !/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || '') || !Number.isFinite(first) || !Number.isFinite(last) || last <= first || last-first > 32*86400000 || first < Date.now()-45*86400000 || last > Date.now()+190*86400000) return send(400, { error: 'Invalid club or date range' });
  const cacheKey = `${club}:${start}:${end}`;
  const saved = cache.get(cacheKey);
  if (saved && Date.now()-saved.time < 120000) return send(200, saved.body);
  if (pending.has(cacheKey)) {
    try { return send(200, await pending.get(cacheKey)); } catch { return send(502, { error: 'Events could not be loaded' }); }
  }
  const hits = (recent.get(club) || []).filter(time => Date.now()-time < 60000);
  if (hits.length >= 20) return send(429, { error: 'Please try again shortly' });
  recent.set(club, [...hits, Date.now()]);
  const request = (async () => {
    let categories = cache.get(`categories:${club}`);
    if (!categories || Date.now()-categories.time > 3600000) {
      categories = { time: Date.now(), body: await organizationGet(club, 'eventcalendar/categories') };
      cache.set(`categories:${club}`, categories);
    }
    const publicIds = new Set(categories.body.filter(item => item.IsPublic === true).map(item => item.Id));
    // Basic event metadata only: no participant lists, counts, prices, or SSO links.
    const rows = await organizationGet(club, 'eventcalendar/eventlist', { startDate: start, endDate: end, status: 'Active' });
    const events = rows.map(event => publicEvent(event, club, publicIds)).filter(Boolean).filter(event => event.start.slice(0,10) >= start && event.start.slice(0,10) < end).sort((a,b) => a.start.localeCompare(b.start));
    const body = { club, start, end, updatedAt: new Date().toISOString(), events };
    cache.set(cacheKey, { time: Date.now(), body });
    if (cache.size > 100) cache.delete(cache.keys().next().value);
    return body;
  })();
  pending.set(cacheKey, request);
  try { return send(200, await request); }
  catch { return send(502, { error: 'Events could not be loaded. Open CourtReserve to continue.' }); }
  finally { pending.delete(cacheKey); }
}
