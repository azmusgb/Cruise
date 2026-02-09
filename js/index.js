// Index (Dashboard) Page Script
// - Handles save-contacts CTA
// - Drives hero + sidebar countdown
// - Provides lightweight task button feedback

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const EMBARKATION_ISO = '2026-02-14T15:00:00';
  const COUNTDOWN_INTERVAL_MS = 60_000; // 1 minute
  const SAVE_CONTACTS_RESET_MS = 2_000;
  const TASK_RESET_MS = 3_000;

  document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------------
    // Save Contacts Button
    // -----------------------------------------------------------------------
    const saveButton = document.getElementById('saveContacts');

    if (saveButton) {
      saveButton.setAttribute('type', 'button');

      saveButton.addEventListener('click', () => {
        const originalHtml = saveButton.innerHTML;
        const originalDisabled = saveButton.disabled;

        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveButton.classList.add('btn--success');
        saveButton.disabled = true;

        setTimeout(() => {
          saveButton.innerHTML = originalHtml;
          saveButton.classList.remove('btn--success');
          saveButton.disabled = originalDisabled;
        }, SAVE_CONTACTS_RESET_MS);
      });
    }

    // -----------------------------------------------------------------------
    // Countdown (Hero + Sidebar)
    // -----------------------------------------------------------------------
    const embarkationDate = new Date(EMBARKATION_ISO);

    const mainDaysEl = document.getElementById('countdown-days');
    const mainHoursEl = document.getElementById('countdown-hours');
    const sidebarDaysEl = document.getElementById('sidebar-countdown-days');
    const sidebarHoursEl = document.getElementById('sidebar-countdown-hours');

    let countdownIntervalId;

    function setAllCountdownToZero() {
      if (mainDaysEl) mainDaysEl.textContent = '00';
      if (mainHoursEl) mainHoursEl.textContent = '00';
      if (sidebarDaysEl) sidebarDaysEl.textContent = '00';
      if (sidebarHoursEl) sidebarHoursEl.textContent = '00';
    }

    function updateCountdown() {
      const now = new Date();
      const timeDiff = embarkationDate - now;

      if (timeDiff <= 0) {
        setAllCountdownToZero();
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
          countdownIntervalId = undefined;
        }
        return;
      }

      const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      const daysStr = days.toString().padStart(2, '0');
      const hoursStr = hours.toString().padStart(2, '0');

      if (mainDaysEl) mainDaysEl.textContent = daysStr;
      if (mainHoursEl) mainHoursEl.textContent = hoursStr;
      if (sidebarDaysEl) sidebarDaysEl.textContent = daysStr;
      if (sidebarHoursEl) sidebarHoursEl.textContent = hoursStr;
    }

    updateCountdown();
    countdownIntervalId = window.setInterval(updateCountdown, COUNTDOWN_INTERVAL_MS);

    // -----------------------------------------------------------------------
    // Task Button Interactions
    // -----------------------------------------------------------------------
    const taskButtons = document.querySelectorAll('.task-list__item .btn');

    taskButtons.forEach((button) => {
      button.setAttribute('type', 'button');

      button.addEventListener('click', function (e) {
        e.stopPropagation();

        const taskItem = this.closest('.task-list__item');
        if (!taskItem) return;

        const taskTitleEl = taskItem.querySelector('.task-list__title');
        const taskTitle = taskTitleEl ? taskTitleEl.textContent.trim() : '';
        void taskTitle; // currently unused, kept for possible future logging

        const originalHtml = this.innerHTML;
        const originalDisabled = this.disabled;

        this.innerHTML = '<i class="fas fa-check"></i> Done';
        this.classList.add('btn--success');
        this.disabled = true;

        // Remove local badge for this task if present
        const taskBadge = taskItem.querySelector('.badge');
        if (taskBadge) {
          taskBadge.style.display = 'none';
        }

        // Update the global "3 Urgent" badge safely
        const urgentBadge = document.querySelector('.badge--critical');
        if (urgentBadge) {
          const match = urgentBadge.textContent.match(/\d+/);
          const currentCount = match ? parseInt(match[0], 10) : 0;

          if (currentCount > 0) {
            const nextCount = currentCount - 1;
            if (nextCount > 0) {
              urgentBadge.textContent = `${nextCount} Urgent`;
            } else {
              urgentBadge.textContent = '0 Urgent';
              urgentBadge.style.display = 'none';
            }
          }
        }

        // Reset button after delay so user can see success state
        window.setTimeout(() => {
          this.innerHTML = originalHtml;
          this.classList.remove('btn--success');
          this.disabled = originalDisabled;
        }, TASK_RESET_MS);
      });
    });
  });
})();

