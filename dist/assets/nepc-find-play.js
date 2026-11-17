import { labels, matchesActivity, beginnerPrograms, matchesProgram, easternLocal, addDays, dateRange, movePeriod, clock } from './nepc-event-model.js?v=20261117-4';
const root = document.querySelector('.nepc-find-play');
if (root) {
  const $ = selector => root.querySelector(selector);
  const buttons = [...root.querySelectorAll('[data-play-location]')];
  const panes = [...root.querySelectorAll('[data-calendar-pane]')];
  const filters = [...root.querySelectorAll('[data-event-filter]')];
  const today = () => easternLocal().slice(0,10);
  const params = new URLSearchParams(location.search);
  const hashClub = ['#rye','#middleton'].includes(location.hash) ? location.hash.slice(1) : null;
  const state = { club:hashClub || (params.get('club') === 'middleton' ? 'middleton':'rye'), activity:root.dataset.defaultActivity || (labels[params.get('activity')] ? params.get('activity'):'all'), view:['day','week','month'].includes(params.get('view')) ? params.get('view'):'day', date:today(), dayPage:0, dayTotal:0 };
  state.program=beginnerPrograms[params.get('program')]?params.get('program'):'all';
  const periodView = () => state.view==='day'?'week':state.view;
  const portals = { rye:'https://app.courtreserve.com/Online/Portal/Index/7432', middleton:'https://app.courtreserve.com/Online/Portal/Index/13164' };
  const cache = new Map();
  let controller, generation = 0;
  const make = (tag, className, content) => { const node = document.createElement(tag); if(className) node.className=className; if(content!==undefined) node.textContent=content; return node; };
  const dateText = (value, options) => new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
  function remember() {
    const url = new URL(location.href); url.searchParams.set('club',state.club); url.searchParams.set('activity',state.activity); url.searchParams.set('view',state.view);
    if(state.activity==='beginner'&&state.program!=='all')url.searchParams.set('program',state.program);else url.searchParams.delete('program');
    if (['#rye','#middleton'].includes(url.hash)) url.hash=state.club;
    history.replaceState(null,'',url);
  }
  function presentation() {
    const name = state.club === 'rye' ? 'Rye':'Middleton';
    const range = dateRange(state.date,periodView()), current = dateRange(today(),periodView());
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.playLocation===state.club)));
    panes.forEach(pane=>{pane.hidden=pane.dataset.calendarPane!==state.club;});
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.eventFilter===state.activity)));
    $('[data-beginner-programs]').hidden=state.activity!=='beginner';
    root.querySelectorAll('[data-program-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.programFilter===state.program)));
    const programDescription=$('[data-program-description]');
    if(programDescription)programDescription.textContent={all:'Choose a program or browse the next beginner sessions at your club.',quickstart:'Learn the rules, basic shots and doubles play. Demo paddles are available.', 'coach-play':'After Quick Start, play doubles with three other beginners and guidance from an NEPC teaching professional.',samara:'Find listed beginner guided-play sessions with Samara. If none are listed, contact the club for help with your next step.'}[state.program];
    root.querySelectorAll('[data-date-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dateView===state.view)));
    $('[data-location-status]').textContent=`Showing events at NEPC ${name}.`;
    $('[data-agenda-title]').textContent=`${state.view==='day'?'Up next':range.start===current.start ? (state.view==='week'?'This week':'This month') : (state.view==='week'?'A week of play':'A month of play')} at NEPC ${name}.`;
    $('[data-period-label]').textContent=state.view==='month' ? dateText(range.start,{month:'long',year:'numeric'}) : `${dateText(range.start,{month:'short',day:'numeric'})} – ${dateText(addDays(range.end,-1),{month:'short',day:'numeric',year:'numeric'})}`;
    $('[data-period="previous"]').disabled=range.start<=current.start && state.dayPage===0;
    $('[data-period="next"]').disabled=range.end>=addDays(today(),165);
    $('[data-period="previous"]').setAttribute('aria-label',state.view==='day'?'Previous day':`Previous ${state.view}`);
    $('[data-period="next"]').setAttribute('aria-label',state.view==='day'?'Next day':`Next ${state.view}`);
    $('[data-period="current"]').textContent=state.view==='day'?'Up next':state.view==='week'?'This week':'This month';
    root.querySelectorAll('[data-portal-link]').forEach(link=>{link.href=portals[state.club];link.setAttribute('aria-label',`Open NEPC ${name} in CourtReserve`);});
    $('[data-private-club]').textContent=`NEPC ${name}`;
    $('[data-private-flow]').hidden=state.activity!=='private'; $('[data-event-results]').hidden=state.activity==='private';
    remember();
    return range;
  }
  function eventCard(event) {
    const item=make('li','mp-event-card'); const time=make('div','mp-event-time'); time.append(make('span','',clock(event.start)),make('span','',`to ${clock(event.end)}`));
    const content=make('div','mp-event-content'); content.append(make('h4','',event.title));
    const categories=['social','competitive','coaching','beginner'].filter(group=>matchesActivity(event,state.club,group));
    if(categories.includes(state.activity))categories.sort((a,b)=>Number(b===state.activity)-Number(a===state.activity));
    content.append(make('span','mp-event-category',categories.length?categories.map(group=>labels[group]).join(' · '):'Club event'));
    const link=make('a','mp-event-register','View details & spots ↗');
    // Only the adapter's public CourtReserve booking URLs are used.
    const url=new URL(event.url); if(url.protocol!=='https:' || url.hostname!=='app.courtreserve.com') return null;
    link.href=url.href; link.target='_blank'; link.rel='noopener'; link.setAttribute('aria-label',`View details and registration for ${event.title}`);
    item.append(time,content,link); return item;
  }
  function render(data) {
    const now=easternLocal();
    const events=data.events.filter(event=>easternLocal(event.start)>=now && matchesActivity(event,state.club,state.activity) && (state.activity!=='beginner'||matchesProgram(event,state.program)));
    const days=$('[data-event-days]'); days.replaceChildren();
    const groups=new Map(); events.forEach(event=>{const day=easternLocal(event.start).slice(0,10); if(!groups.has(day))groups.set(day,[]);groups.get(day).push(event);});
    state.dayTotal=groups.size;
    const allDays=[...groups];
    if(state.dayPage<0)state.dayPage=Math.max(0,allDays.length-1);
    state.dayPage=Math.min(state.dayPage,Math.max(0,allDays.length-1));
    const visible=state.view==='day'?allDays.slice(state.dayPage,state.dayPage+1):allDays;
    visible.forEach(([day,rows])=>{const section=make('section','mp-event-day');const heading=make('div','mp-event-day-title');heading.append(make('h3','mp-event-day-heading',dateText(day,{weekday:'long',month:'short',day:'numeric'})),make('span','mp-day-count',`${rows.length} ${rows.length===1?'session':'sessions'}`));section.append(heading);const list=make('ul','mp-event-list');rows.forEach(event=>{const card=eventCard(event);if(card)list.append(card);});section.append(list);days.append(section);});
    if(state.view==='day'&&visible.length){const first=visible[0][0],last=visible[visible.length-1][0];$('[data-period-label]').textContent=first===last?dateText(first,{weekday:'short',month:'short',day:'numeric'}):`${dateText(first,{month:'short',day:'numeric'})} – ${dateText(last,{month:'short',day:'numeric',year:'numeric'})}`;}
    const range=dateRange(state.date,periodView()),current=dateRange(today(),periodView());
    $('[data-period="previous"]').disabled=range.start<=current.start&&state.dayPage===0;
    const activeLabel=state.activity==='beginner'?beginnerPrograms[state.program]:labels[state.activity];
    $('[data-agenda-status]').textContent=events.length ? `${state.view==='day'?'Next day with sessions':'Upcoming sessions'} · ${activeLabel}` : `No upcoming ${activeLabel.toLowerCase()} sessions are listed in this period. Try the next week, another program or contact the club.`;
    if(state.view==='day'&&state.dayPage+1<state.dayTotal)$('[data-period="next"]').disabled=false;
    $('[data-feed-error]').hidden=true;
    $('[data-event-updated]').textContent=`Updated ${new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(new Date(data.updatedAt))} ET. Times shown in Eastern Time. Confirm availability and registration details in CourtReserve.`;
    const specials=$('[data-special-events]'); specials.replaceChildren();
    const featured=(state.view==='day'?visible.flatMap(([,rows])=>rows):events).filter(event=>event.featured);
    if(featured.length){const list=make('ul','mp-event-list');featured.forEach(event=>{const card=eventCard(event);if(card)list.append(card);});specials.append(list);}
    else specials.append(make('p','','See what else is happening around NEPC.'));
  }
  async function refresh() {
    const range=presentation(); const id=++generation; controller?.abort();
    if(state.activity==='private')return;
    const key=`${state.club}:${range.start}:${range.end}`;
    const saved=cache.get(key);
    if(saved && Date.now()-saved.at<120000){render(saved.data);return;}
    $('[data-event-days]').replaceChildren(); $('[data-event-updated]').textContent=''; $('[data-special-events]').replaceChildren(); $('[data-feed-error]').hidden=true; $('[data-agenda-status]').textContent='Loading upcoming events…';
    controller=new AbortController();
    try {
      const url=new URL('/api/public-events',location.origin);url.searchParams.set('club',state.club);url.searchParams.set('start',range.start);url.searchParams.set('end',range.end);
      const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Events unavailable');
      const data=await response.json();if(!Array.isArray(data.events)||data.club!==state.club)throw new Error('Invalid event feed');if(id!==generation)return;
      cache.set(key,{at:Date.now(),data});render(data);
    } catch(error) { if(error.name==='AbortError'||id!==generation)return;$('[data-agenda-status]').textContent='';$('[data-feed-error]').hidden=false; }
  }
  $('.mp-location-controls').hidden=false;
  buttons.forEach(button=>button.addEventListener('click',()=>{state.club=button.dataset.playLocation;state.dayPage=0;refresh();}));
  filters.forEach(button=>button.addEventListener('click',()=>{state.activity=button.dataset.eventFilter;state.dayPage=0;refresh();}));
  root.querySelectorAll('[data-program-filter]').forEach(button=>button.addEventListener('click',()=>{state.program=button.dataset.programFilter;state.dayPage=0;refresh();}));
  root.querySelectorAll('[data-date-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.dateView;state.date=today();state.dayPage=0;refresh();}));
  root.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{
    const direction=button.dataset.period==='next'?1:-1;
    if(button.dataset.period==='current'){state.date=today();state.dayPage=0;}
    else if(state.view==='day'&&direction===1&&state.dayPage+1<state.dayTotal)state.dayPage+=1;
    else if(state.view==='day'&&direction===-1&&state.dayPage>=1)state.dayPage-=1;
    else {state.date=movePeriod(state.date,periodView(),direction);state.dayPage=state.view==='day'&&direction===-1?-1:0;}
    refresh();
  }));
  $('[data-event-retry]').addEventListener('click',()=>{cache.clear();refresh();});
  window.addEventListener('hashchange',()=>{if(['#rye','#middleton'].includes(location.hash)){state.club=location.hash.slice(1);refresh();}});
  const frames=panes.map(pane=>pane.querySelector('iframe'));
  window.addEventListener('message',event=>{if(!['https://widgets.courtreserve.com','https://app.courtreserve.com'].includes(event.origin))return;const frame=frames.find(frame=>frame.contentWindow===event.source);const height=Number(event.data?.height);if(frame&&event.data?.action==='setHeight'&&Number.isFinite(height)&&height>=200&&height<=20000)frame.style.height=`${Math.ceil(height)}px`;});
  refresh();
}
