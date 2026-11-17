/* Motion plays once when requested. Native buttons support keyboard and touch. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = document.querySelectorAll('[data-home-shot]');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      card.classList.remove('is-playing');
      // Restart the short animation when the visitor chooses to replay it.
      void card.offsetWidth;
      card.classList.add('is-playing');
    });
    card.addEventListener('animationend', () => card.classList.remove('is-playing'));
  });
  reducedMotion.addEventListener('change', () => {
    cards.forEach((card) => card.classList.remove('is-playing'));
  });
})();
