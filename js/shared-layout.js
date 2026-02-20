(() => {
  'use strict';

  function injectHeader() {
    const container = document.getElementById('sharedHeader');
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = 'true';

    container.innerHTML = `
      <header class="app-header--minimal">
        <div class="container header-container">
          <a href="index.html" class="header-logo">
            <span>Adventure of the Seas</span>
          </a>
        </div>
      </header>
    `;
  }

  document.addEventListener('DOMContentLoaded', injectHeader);
})();
