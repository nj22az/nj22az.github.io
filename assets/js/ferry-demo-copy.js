'use strict';
document.querySelectorAll('[data-ferry-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const panel = button.closest('.ferry-install');
    const code = panel.querySelector('code');
    const status = panel.querySelector('.ferry-copy-status');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Install command copied. Paste it into Konsole.';
      button.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select the highlighted command and copy it using your browser.';
    }
  });
});
