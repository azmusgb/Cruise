(() => {
  'use strict';

  function init() {
    const page = document.querySelector('.page-photos, [data-page="photos"]');
    if (!page) return;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
