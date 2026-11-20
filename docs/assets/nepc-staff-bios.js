(() => {
  const buttons = document.querySelectorAll('[data-bio-open]');
  const dialogs = document.querySelectorAll('.lc-staff-bio');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.bioOpen);
      if (!dialog || dialog.open) return;
      dialog.showModal();
      document.documentElement.classList.add('nepc-bio-open');
    });
  });

  dialogs.forEach((dialog) => {
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('nepc-bio-open');
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close();
      }
    });
  });
})();
