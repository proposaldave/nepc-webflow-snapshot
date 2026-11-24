import assert from 'node:assert/strict';
import { publicEvent } from './public-event-preview.mjs';
import { matchesActivity, matchesProgram, visualCategory, easternLocal, dateRange, movePeriod } from '../dist/assets/nepc-event-model.js';
const event = { EventId:123, ReservationId:456, EventName:'Test public session', EventCategoryId:22572, IsPublicBookingAllowed:true, IsCanceled:false, StartDateTime:'2026-11-18T10:00:00', EndDateTime:'2026-11-18T12:00:00', PublicEventUrl:'https://app.courtreserve.com/online/publicbookings/7432?tab=explore&eventId=123&reservationId=456', SsoUrl:'must never be returned', RegisteredCount:12, Instructors:[{email:'never return'}] };
const sanitized=publicEvent(event,'rye',new Set([22572]));
assert.deepEqual(Object.keys(sanitized).sort(),['id','title','categoryId','start','end','featured','url'].sort());
for(const changes of [{IsPublicBookingAllowed:false},{IsCanceled:true},{PublicEventUrl:'https://example.com/'},{PublicEventUrl:'https://app.courtreserve.com/online/publicbookings/13164?eventId=123'},{PublicEventUrl:event.PublicEventUrl+'&apiKey=forbidden'},{EventCategoryId:1}]) assert.equal(publicEvent({...event,...changes},'rye',new Set([22572])),null);
assert(matchesActivity({title:'Social play',categoryId:22572},'rye','social'));
assert(!matchesActivity({title:'Social play',categoryId:22572},'middleton','social'));
assert(matchesActivity({title:'Friday Ladder',categoryId:22572},'rye','competitive'));
assert(!matchesActivity({title:'Friday Ladder',categoryId:22572},'rye','social'));
for (const [club, categoryId] of [['rye',22572],['middleton',53524]]) {
  for (const title of ["3.5 & 4.0 Men's Scramble",'Men’s Scramble','Mens Scramble']) {
    assert.equal(visualCategory({title,categoryId},club),'mens-scramble');
    assert(matchesActivity({title,categoryId},club,'competitive'));
    assert(!matchesActivity({title,categoryId},club,'social'));
  }
  assert.equal(visualCategory({title:"3.5 & 4.0 Women's Scramble",categoryId},club),'competitive');
  assert.equal(visualCategory({title:'Monday Night Ladder',categoryId},club),'competitive');
  assert.equal(visualCategory({title:'Open Up Play',categoryId},club),'social');
}
// Pink Open Play: category ID only (Rye 104177, Middleton 104153).
for (const [club, pinkId, other] of [['rye',104177,104153],['middleton',104153,104177]]) {
  assert(matchesActivity({title:'Open Up Play',categoryId:pinkId},club,'pink'));
  assert(!matchesActivity({title:'Open Up Play',categoryId:other},club,'pink'));
  assert(matchesActivity({title:'Open Up Play',categoryId:pinkId},club,'social'));
  assert(!matchesActivity({title:'Friday Ladder',categoryId:pinkId},club,'social'));
  assert(matchesActivity({title:'Friday Ladder',categoryId:pinkId},club,'competitive'));
  assert(matchesActivity({title:'Friday Ladder',categoryId:pinkId},club,'pink'));
  assert.equal(visualCategory({title:'Friday Ladder',categoryId:pinkId},club),'pink');
  assert.equal(visualCategory({title:'Open Up Play',categoryId:pinkId},club),'pink');
}
assert(!matchesActivity({title:'Monday Night Ladder: Pink Open Play',categoryId:53524},'middleton','pink'));
assert.equal(visualCategory({title:'Monday Night Ladder',categoryId:53524},'middleton'),'competitive');
assert.equal(visualCategory({title:"Men's Scramble Clinic",categoryId:20790},'rye'),'coaching');
assert(matchesActivity({title:'Beginner Skills Clinic',categoryId:20790},'rye','beginner'));
assert(matchesActivity({title:'Beginner Skills Clinic',categoryId:20790},'rye','coaching'));
assert(matchesActivity({title:'Coach & Play 101',categoryId:20790},'rye','beginner'));
assert(matchesProgram({title:'Coach & Play 101'},'coach-play'));
assert(!matchesProgram({title:'Coach & Play 201'},'coach-play'));
assert(matchesProgram({title:'Beginner Guided Play with Samara'},'samara'));
assert(!matchesProgram({title:'Competitive Play with Samara'},'samara'));
assert(matchesProgram({title:'Quick Start'},'quickstart'));
assert(!matchesProgram({title:'Beginner Skills Clinic'},'quickstart'));
assert.deepEqual(dateRange('2026-11-17','week'),{start:'2026-11-16',end:'2026-11-23'});
assert.deepEqual(dateRange('2026-12-31','month'),{start:'2026-12-01',end:'2027-01-01'});
assert.equal(movePeriod('2026-12-31','month',1),'2027-01-01');
assert.equal(easternLocal('2026-11-17T18:00:00Z'),'2026-11-17T13:00:00');
assert.equal(easternLocal('2026-07-17T18:00:00Z'),'2026-07-17T14:00:00');
console.log('PASS: public-only field allowlist, booking URL boundaries, category filters, weekly/monthly dates and Eastern daylight saving.');
