/*
 * Legacy deck script shim.
 * Canonical implementation lives at js/modules/decks.js.
 */
(() => {
  'use strict';

  const canonicalSrc = 'js/modules/decks.js';

  if (document.querySelector(`script[src="${canonicalSrc}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = canonicalSrc;
  script.defer = true;
  script.dataset.legacyShim = 'true';
  document.head.appendChild(script);
})();
