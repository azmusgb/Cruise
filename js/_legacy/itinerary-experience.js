(function () {
  'use strict';

  const STORAGE_KEY = 'rccl-itinerary-offline-v1';
  const HAPTICS = {
    'activity-booked': [100, 50, 100],
    'port-arrival': [200],
    'crown-tier-unlock': [50, 100, 50, 200]
  };

  const card = document.querySelector('.rccl-experience-card');
  const statusAnnouncement = document.getElementById('ship-status-announcement');
  const progress = document.getElementById('port-progress');
  const speed = document.getElementById('ship-speed');
  const nextPort = document.getElementById('next-port');
  const deckSheet = document.querySelector('.rccl-deck-sheet');
  const offlineIndicator = document.getElementById('offline-indicator');
  const lastSync = document.getElementById('last-sync');

  if (!card) return;

  const state = {
    currentDay: Number(card.dataset.day) || 1,
    diningClicks: 0,
    sheetExpanded: false,
    touchStartX: 0
  };

  function initializeStatusVisuals() {
    document.querySelectorAll('[data-speed]').forEach((node) => {
      node.style.setProperty('--speed', node.dataset.speed);
    });

    document.querySelectorAll('[data-progress]').forEach((node) => {
      node.style.setProperty('--progress', node.dataset.progress);
    });

    document.querySelectorAll('[data-position]').forEach((node) => {
      node.style.setProperty('--position', node.dataset.position);
    });
  }

  function haptic(eventName) {
    if ('vibrate' in navigator && HAPTICS[eventName]) {
      navigator.vibrate(HAPTICS[eventName]);
    }
  }

  function announce(message) {
    if (statusAnnouncement) {
      statusAnnouncement.textContent = message;
    }
  }

  function saveOfflineSnapshot() {
    const payload = {
      day: state.currentDay,
      port: card.dataset.port,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (lastSync) {
      lastSync.textContent = new Date(payload.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  function setDay(direction) {
    state.currentDay = Math.max(1, Math.min(7, state.currentDay + direction));
    card.dataset.day = String(state.currentDay);
    const dayNumber = card.querySelector('.day-number');
    if (dayNumber) dayNumber.textContent = String(state.currentDay);
    announce(`Viewing day ${state.currentDay} itinerary.`);
  }

  function toggleSheet() {
    if (!deckSheet) return;
    state.sheetExpanded = !state.sheetExpanded;
    deckSheet.dataset.state = state.sheetExpanded ? 'full' : 'partial';
    deckSheet.style.bottom = state.sheetExpanded ? '1rem' : '4.5rem';
    announce(state.sheetExpanded ? 'Deck sheet expanded.' : 'Deck sheet collapsed.');
  }

  function updateShipStatus() {
    const mockProgress = 65 + Math.floor(Math.random() * 8);
    if (progress) {
      progress.style.setProperty('--progress', `${mockProgress}%`);
    }
    if (speed) {
      speed.textContent = `${(18 + Math.random() * 2).toFixed(1)} knots`;
    }
    const nextPortText = `Falmouth • ${Math.max(90, 124 - mockProgress)} NM`;
    if (nextPort) {
      nextPort.textContent = nextPortText;
    }
    announce(`Ship status updated. ${nextPort ? nextPort.textContent : nextPortText}.`);
  }

  document.querySelectorAll('[data-action="previous-day"]').forEach((button) => {
    button.addEventListener('click', function () {
      setDay(-1);
    });
  });

  document.querySelectorAll('[data-action="next-day"]').forEach((button) => {
    button.addEventListener('click', function () {
      setDay(1);
    });
  });

  document.querySelectorAll('[data-action="toggle-sheet"]').forEach((button) => {
    button.addEventListener('click', toggleSheet);
  });

  document.addEventListener('click', function (event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    if (target.dataset.action === 'add-to-calendar') {
      haptic('activity-booked');
      saveOfflineSnapshot();
      announce('Reminder added for Dunn\'s River Falls.');
    }

    if (target.dataset.action === 'book-now') {
      state.diningClicks += 1;
      if (state.diningClicks > 2) {
        target.textContent = 'Upgrade for $89/day';
        announce('Dining package recommendation unlocked.');
      }
    }

    if (target.dataset.action === 'find-elevator') {
      announce('Nearest elevator is 120 feet aft on Deck 5.');
      haptic('port-arrival');
    }
  });

  card.addEventListener('contextmenu', function (event) {
    if (event.target.closest('.activity')) {
      event.preventDefault();
      announce('Quick actions: View Ticket, Reminder, Share with cabin.');
    }
  });

  card.addEventListener('touchstart', function (event) {
    state.touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  card.addEventListener('touchend', function (event) {
    const delta = event.changedTouches[0].screenX - state.touchStartX;
    if (Math.abs(delta) < 45) return;
    setDay(delta > 0 ? -1 : 1);
  }, { passive: true });

  function renderOfflineState() {
    const isOffline = !navigator.onLine;
    if (offlineIndicator) {
      offlineIndicator.hidden = !isOffline;
    }
    if (!isOffline) {
      saveOfflineSnapshot();
    }
  }

  window.addEventListener('online', renderOfflineState);
  window.addEventListener('offline', renderOfflineState);

  renderOfflineState();
  saveOfflineSnapshot();
  initializeStatusVisuals();
  updateShipStatus();
  setInterval(updateShipStatus, 15000);
})();
