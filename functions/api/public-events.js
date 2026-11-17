import { createPublicEventService } from '../../server/public-events.mjs';

const publicEvents = createPublicEventService();

export function onRequest(context) {
  return publicEvents(context.request, context.env, caches.default);
}
