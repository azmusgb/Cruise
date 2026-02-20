(() => {
  'use strict';

  if (window.__CRUISE_APP__) return;
  window.__CRUISE_APP__ = true;

  const VERSION = '4.0.0';

  function safeQuery(sel, root = document) {
    return root ? root.querySelector(sel) : null;
  }

  window.__CRUISE_VERSION__ = VERSION;
  window.__CRUISE_SAFE_QUERY__ = safeQuery;

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.error('[SW]', err));
  }

  document.addEventListener('DOMContentLoaded', registerSW);
})();
