(() => {
  const biographies = document.querySelectorAll('.lc-person-bio');

  // Keep a single biography open in browsers without native details grouping.
  biographies.forEach((biography) => {
    biography.addEventListener('toggle', () => {
      if (!biography.open) return;
      biographies.forEach((other) => {
        if (other !== biography) other.open = false;
      });
    });
  });
})();
