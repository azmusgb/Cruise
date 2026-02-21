(() => {
  'use strict';

  // DEPRECATED:
  // Homepage behavior is intentionally kept inline in index.html (least-risk path)
  // to avoid drift between duplicate implementations.
  //
  // If you need to modularize homepage logic in the future, move the inline script
  // into a dedicated entrypoint and remove this file.
  console.warn('[deprecated] js/modules/index.js is a no-op. Homepage logic lives in index.html inline script.');
})();
