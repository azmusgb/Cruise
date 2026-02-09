(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./js/sw.js').catch(function (error) {
      console.warn('Service worker registration failed:', error);
    });
  });
})();
