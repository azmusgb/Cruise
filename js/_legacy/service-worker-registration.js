(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('./js/sw.js', { scope: './' })
      .then(function (registration) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch(function (error) {
        console.warn('Service worker registration failed:', error);
      });
  });
})();
