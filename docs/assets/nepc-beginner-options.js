// Program information and existing CourtReserve registration destinations.
// The new daily event feed remains on the separate design branch.
const root = document.querySelector('.fv-beginner-page');
if (root) {
  const params = new URLSearchParams(location.search);
  const clubs = {
    rye: { name: 'Rye', portal: 'https://app.courtreserve.com/Online/Portal/Index/7432' },
    middleton: { name: 'Middleton', portal: 'https://app.courtreserve.com/Online/Portal/Index/13164' }
  };
  const programs = {
    all: 'Browse Quick Start classes below. For Coach & Play 101 or beginner guided play, open your club calendar or contact us for help.',
    quickstart: 'Learn the rules, basic shots and doubles play. Demo paddles are available. Browse Quick Start classes below.',
    'coach-play': 'After Quick Start, play doubles with three other beginners and guidance from an NEPC teaching professional. Check the club calendar for listed classes and registration.',
    samara: 'Find beginner guided-play sessions with Samara in the club calendar. Contact the club for help with your next step.'
  };
  let club = params.get('club') === 'middleton' ? 'middleton' : 'rye';
  let program = Object.hasOwn(programs, params.get('program')) ? params.get('program') : 'all';
  const locations = [...root.querySelectorAll('[data-play-location]')];
  const choices = [...root.querySelectorAll('[data-beginner-program]')];
  const panes = [...root.querySelectorAll('[data-calendar-pane]')];
  function present() {
    const current = clubs[club], showClasses = program === 'all' || program === 'quickstart';
    locations.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.playLocation === club)));
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.beginnerProgram === program)));
    panes.forEach(pane => { pane.hidden = pane.dataset.calendarPane !== club; });
    root.querySelector('[data-location-status]').textContent = `Explore beginner programs at NEPC ${current.name}.`;
    root.querySelector('[data-program-description]').textContent = programs[program];
    root.querySelector('[data-beginner-title]').textContent = showClasses ? `Quick Start classes at NEPC ${current.name}.` : program === 'coach-play' ? 'Find Coach & Play 101.' : 'Find beginner guided play.';
    const calendarLink = root.querySelector('[data-beginner-calendar-link]');
    calendarLink.href = current.portal;
    calendarLink.textContent = `Open NEPC ${current.name} calendar ↗`;
    root.querySelector('[data-beginner-registration]').hidden = !showClasses;
    const url = new URL(location.href);
    url.searchParams.set('club', club);
    if (program === 'all') url.searchParams.delete('program'); else url.searchParams.set('program', program);
    url.searchParams.delete('activity'); url.searchParams.delete('view');
    history.replaceState(null, '', url);
  }
  root.querySelector('.mp-location-controls').hidden = false;
  locations.forEach(button => button.addEventListener('click', () => { club = button.dataset.playLocation; present(); }));
  choices.forEach(button => button.addEventListener('click', () => { program = button.dataset.beginnerProgram; present(); }));
  const frames = panes.map(pane => pane.querySelector('iframe'));
  window.addEventListener('message', event => {
    if (!['https://widgets.courtreserve.com', 'https://app.courtreserve.com'].includes(event.origin)) return;
    const frame = frames.find(item => item.contentWindow === event.source), height = Number(event.data?.height);
    if (frame && event.data?.action === 'setHeight' && Number.isFinite(height) && height >= 200 && height <= 20000) frame.style.height = `${Math.ceil(height)}px`;
  });
  present();
}
