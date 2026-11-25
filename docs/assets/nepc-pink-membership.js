(() => {
  const panel = document.getElementById('pink-details');
  const explore = document.querySelector('[data-pink-explore]');
  const close = document.querySelector('[data-pink-close]');
  if (!panel || !explore || !close) return;

  function showDetails(open) {
    panel.hidden = !open;
    explore.setAttribute('aria-expanded', String(open));
    explore.querySelector('[data-pink-button-label]').textContent = open ? 'Close Pink details' : 'Explore Pink';
    explore.querySelector('[data-pink-button-arrow]').textContent = open ? '↑' : '↓';
    const target = open ? panel : explore;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: open ? 'start' : 'center' });
    (open ? panel.querySelector('h2') : explore).focus({ preventScroll: true });
  }

  explore.addEventListener('click', () => showDetails(panel.hidden));
  close.addEventListener('click', () => showDetails(false));
  if (location.hash === '#pink-details') showDetails(true);
})();
