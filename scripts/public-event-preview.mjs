// Local wrapper around the same server-only reader used by Cloudflare Pages.
import { createPublicEventService } from '../server/public-events.mjs';
export { publicEvent } from '../server/public-events.mjs';

const publicEvents = createPublicEventService();

export async function eventPreview(req, res, url) {
  const request = new Request(url, { method: req.method });
  const response = await publicEvents(request, {
    ...process.env,
    NEPC_ENABLE_PUBLIC_EVENTS: process.env.NEPC_ENABLE_EVENT_PREVIEW
  });
  const headers = Object.fromEntries(response.headers);
  headers['cache-control'] = 'no-store';
  res.writeHead(response.status, headers);
  res.end(await response.text());
}
