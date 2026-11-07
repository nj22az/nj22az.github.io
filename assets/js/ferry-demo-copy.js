'use strict';
document.querySelectorAll('[data-ferry-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    // Each command block copies its own code; its status line follows it.
    const block = button.closest('.ferry-command');
    const code = block.querySelector('code');
    const next = block.nextElementSibling;
    const status = next && next.classList.contains('ferry-copy-status') ? next : document.createElement('p');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Command copied. Paste it into Konsole.';
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
