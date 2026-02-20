(() => {
  'use strict';

  if (window.__CRUISE_INIT__) return;
  window.__CRUISE_INIT__ = true;

  const APP = { version: '3.0.0' };
  window.__CRUISE_APP__ = APP;

  function safeQuery(selector, root = document) {
    if (!root || typeof root.querySelector !== 'function') return null;
    return root.querySelector(selector);
  }

  function initAnchorScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      document.body.classList.add('motion-enabled');
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const targetSelector = anchor.getAttribute('href');
        if (!targetSelector || targetSelector === '#') return;

        const target = safeQuery(targetSelector);
        if (!target) return;

        event.preventDefault();
        const offset = 80;
        const topPosition = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: topPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((e) => console.error('[SW]', e));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAnchorScroll();
    registerSW();
  });
})();
