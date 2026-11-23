// Public CourtReserve category IDs verified separately for each NEPC club.
const groups = {
  rye: { social: [22572, 22571], competitive: [22570, 20794], coaching: [20790, 97722, 97723], beginner: [76035] },
  middleton: { social: [53524, 53523, 53516], competitive: [53522, 53518], coaching: [53515, 97571, 97580], beginner: [76037] }
};
export const labels = { all: 'All play', social: 'Open & Social Play', competitive: 'Leagues & Competitive Play', coaching: 'Clinics & Lessons', beginner: 'Beginner Programs', private: 'Private Court Booking' };
export function matchesActivity(event, club, activity) {
  if (activity === 'all') return true;
  const namedCompetition = !groups[club]?.coaching.includes(event.categoryId) && /\b(ladder|league|tournament|scramble)\b/i.test(event.title);
  if (activity === 'competitive' && namedCompetition) return true;
  if (activity === 'social' && namedCompetition) return false;
  if (activity === 'beginner' && /beginner|quick\s*start|coach\s*(?:&|and|\+)?\s*play\s*101|ball\s*striking\s*101/i.test(event.title)) return true;
  return groups[club]?.[activity]?.includes(event.categoryId) || false;
}
export const beginnerPrograms = { all:'All Beginner Programs', quickstart:'Quick Start', 'coach-play':'Coach & Play 101', samara:'Beginner Guided Play with Samara' };
export function matchesProgram(event, program) {
  if (program==='quickstart') return /quick\s*start/i.test(event.title);
  if (program==='coach-play') return /coach\s*(?:&|and|\+)?\s*play\s*101/i.test(event.title);
  if (program==='samara') return /samara/i.test(event.title)&&/beginner|guided/i.test(event.title);
  return true;
}
export function categoryLabel(event, club) {
  return ['beginner','coaching','competitive','social'].find(group => matchesActivity(event, club, group)) || 'other';
}
export function visualCategory(event, club) {
  // Only explicitly named coaching events receive the private-lesson treatment.
  if (matchesActivity(event, club, 'coaching')) return /\bprivate[\s-]+lessons?\b/i.test(event.title) ? 'lesson' : 'coaching';
  if (matchesActivity(event, club, 'competitive') && /\bmen(?:['’]?s)?\b.*\bscramble\b/i.test(event.title)) return 'mens-scramble';
  return categoryLabel(event, club);
}
export function easternLocal(value = new Date()) {
  if (typeof value === 'string' && !/(Z|[+-]\d\d:\d\d)$/.test(value)) return value.slice(0,19);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).formatToParts(new Date(value)).map(p => [p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}
export function addDays(value, days) {
  const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+days); return date.toISOString().slice(0,10);
}
export function dateRange(value, view) {
  const date = new Date(`${value}T12:00:00Z`);
  if (view === 'month') {
    const start = `${value.slice(0,7)}-01`; date.setUTCMonth(date.getUTCMonth()+1,1); return { start, end:date.toISOString().slice(0,10) };
  }
  const start = addDays(value,-((date.getUTCDay()+6)%7)); return { start, end:addDays(start,7) };
}
export function movePeriod(value, view, direction) {
  if (view === 'week') return addDays(value,7*direction);
  const date = new Date(`${value.slice(0,7)}-01T12:00:00Z`); date.setUTCMonth(date.getUTCMonth()+direction); return date.toISOString().slice(0,10);
}
export function clock(value) {
  const local = easternLocal(value); const [h,m] = local.slice(11,16).split(':').map(Number);
  return `${h%12 || 12}${m ? ':'+String(m).padStart(2,'0') : ''} ${h<12?'AM':'PM'}`;
}
