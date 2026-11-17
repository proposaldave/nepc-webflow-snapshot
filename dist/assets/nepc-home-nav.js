(() => {
  const button = document.querySelector('.navbar14_menu-button');
  const menu = document.querySelector('.navbar14_menu');
  if (!button || !menu) return;
  const desktop = window.matchMedia('(min-width: 1200px)');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  menu.id = 'nepc-home-menu';
  button.setAttribute('aria-controls', menu.id);
  menu.setAttribute('aria-label', 'Main navigation');

  function setOpen(open) {
    menu.classList.toggle('nepc-home-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  setOpen(false);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  }, true);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      setOpen(false);
      button.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const links = [...menu.querySelectorAll('a[href]')];
    const first = links[0];
    const last = links[links.length - 1];
    if (document.activeElement === button) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      button.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      button.focus();
    }
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar14_component')) setOpen(false);
  });
  desktop.addEventListener('change', () => {
    const focusWasInMenu = menu.contains(document.activeElement);
    setOpen(false);
    if (!desktop.matches && focusWasInMenu) button.focus();
  });
})();
