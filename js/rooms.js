// Rooms (Staterooms) Page Script
// - Handles copy-to-clipboard for room numbers
// - Drives toast + screen reader announcements

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('toast');
    const liveAnnouncement = document.getElementById('liveAnnouncement');

    function announce(message) {
      if (!liveAnnouncement) return;
      // Clear first to ensure screen readers re-announce the same text
      liveAnnouncement.textContent = '';
      // Small timeout to force DOM change recognition
      window.setTimeout(() => {
        liveAnnouncement.textContent = message;
      }, 10);
    }

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');

      window.setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    // Copy room number functionality with feature detection
    const copyButtons = document.querySelectorAll('[data-copy-room]');

    copyButtons.forEach((btn) => {
      // Ensure correct type to avoid accidental form submits if structure changes later
      if (!btn.getAttribute('type')) {
        btn.setAttribute('type', 'button');
      }

      btn.addEventListener('click', async () => {
        const room = btn.getAttribute('data-copy-room');
        if (!room) return;

        const successMessage = `Room ${room} copied to clipboard`;
        const errorMessage =
          'Copy is not available in this browser. Please select the room number and copy it manually.';

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          try {
            await navigator.clipboard.writeText(room);
            showToast(successMessage);
            announce(successMessage);
            return;
          } catch (err) {
            // Fall through to error path
          }
        }

        // Fallback / error path
        showToast(errorMessage);
        announce(errorMessage);
      });
    });
  });
})();

