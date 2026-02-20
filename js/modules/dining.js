    (function() {
      'use strict';

      // ---------- DOM elements ----------
      const menuBtn = document.getElementById('menuBtn');
      const drawerBackdrop = document.getElementById('drawerBackdrop');
      const closeDrawerBtn = document.getElementById('closeDrawerBtn');
      const backToTop = document.getElementById('backToTop');
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toastText');
      const moreBtnMobile = document.getElementById('moreBtnMobile');

      // ---------- Drawer ----------
      let lastFocus = null;
      function openDrawer() {
        lastFocus = document.activeElement;
        drawerBackdrop.classList.add('open');
        drawerBackdrop.setAttribute('aria-hidden', 'false');
        closeDrawerBtn.focus();
        document.body.style.overflow = 'hidden';
      }
      function closeDrawer() {
        drawerBackdrop.classList.remove('open');
        drawerBackdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      }
      menuBtn.addEventListener('click', openDrawer);
      closeDrawerBtn.addEventListener('click', closeDrawer);
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) closeDrawer();
      });

      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawerBackdrop.classList.contains('open')) closeDrawer();
      });

      // ---------- Back to top ----------
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 400);
      });
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

      // ---------- Mobile "More" button ----------
      moreBtnMobile.addEventListener('click', openDrawer);

      // ---------- Dining-specific JS (search, filter, context) ----------
      const searchInput = document.getElementById('diningSearchInput');
      const searchStatus = document.getElementById('diningSearchStatus');
      const emptyState = document.getElementById('diningSearchEmpty');
      const cards = Array.from(document.querySelectorAll('.deck-card[data-venue-type]'));
      const filterButtons = Array.from(document.querySelectorAll('.dining-nav__filters button[data-filter]'));
      const contextTitle = document.getElementById('diningContextTitle');
      const contextBody = document.getElementById('diningContextBody');
      const contextAction = document.getElementById('diningContextAction');
      const contextActionText = document.getElementById('diningContextActionText');
      const spotlightTitle = document.getElementById('diningSpotlightTitle');
      const spotlightBody = document.getElementById('diningSpotlightBody');
      const spotlightAction = document.getElementById('diningSpotlightAction');
      const spotlightActionText = document.getElementById('diningSpotlightActionText');
      const total = cards.length;
      let activeFilter = 'all';
      let searchTimer;
      const SEARCH_DELAY_MS = 120;

      // Context helper (simplified version of original)
      function getCruiseContext() {
        // In a real app you might read from global state; for demo we return static.
        return {
          title: 'Boarding Day Dining Rhythm',
          body: 'Use Windjammer earlier in the day, then lock a dinner slot before evening venue peaks.',
          target: '#venue-windjammer',
          actionLabel: 'Open Windjammer'
        };
      }

      function applyDiningContext() {
        const ctx = getCruiseContext();
        contextTitle.textContent = ctx.title;
        contextBody.textContent = ctx.body;
        contextAction.setAttribute('href', ctx.target);
        contextActionText.textContent = ctx.actionLabel;

        spotlightTitle.textContent = ctx.title;
        spotlightBody.textContent = ctx.body;
        spotlightAction.setAttribute('href', ctx.target);
        spotlightActionText.textContent = ctx.actionLabel;

        cards.forEach(c => c.classList.remove('deck-card--context-pick'));
        const target = document.querySelector(ctx.target);
        if (target) target.classList.add('deck-card--context-pick');
      }

      function updateDiningView() {
        const term = searchInput.value.toLowerCase().trim();
        let visible = 0;

        searchStatus.classList.add('is-loading');
        searchStatus.textContent = 'Filtering dining options...';
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          cards.forEach(card => {
            const venueType = card.dataset.venueType || '';
            const searchableText = (card.dataset.search || '') + ' ' + card.textContent;
            const matchesFilter = activeFilter === 'all' || venueType === activeFilter;
            const matchesSearch = !term || searchableText.toLowerCase().includes(term);
            const shouldShow = matchesFilter && matchesSearch;

            card.hidden = !shouldShow;
            card.style.display = shouldShow ? 'flex' : 'none';
            if (shouldShow) visible += 1;
          });

          searchStatus.textContent = `Showing ${visible} of ${total} venues`;
          searchStatus.classList.remove('is-loading');
          if (emptyState) emptyState.hidden = visible !== 0;
        }, SEARCH_DELAY_MS);
      }

      // Filter buttons
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => {
            b.classList.remove('is-active');
            b.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-checked', 'true');
          activeFilter = btn.dataset.filter || 'all';
          updateDiningView();
        });
      });

      // Search input
      searchInput.addEventListener('input', updateDiningView);

      // Keyboard shortcut: / to focus search
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      });

      // Initial updates
      updateDiningView();
      applyDiningContext();

      // ---------- Ocean background (rich version from index) ----------
      const ocean = document.getElementById('ocean');
      const octx = ocean.getContext('2d');
      function resizeOcean() {
        ocean.width = window.innerWidth;
        ocean.height = window.innerHeight;
      }
      resizeOcean();
      window.addEventListener('resize', resizeOcean);

      let t = 0;
      function drawOcean() {
        octx.clearRect(0, 0, ocean.width, ocean.height);
        octx.fillStyle = '#071a2c';
        octx.fillRect(0, 0, ocean.width, ocean.height);

        // depth gradient
        const grad = octx.createLinearGradient(0, 0, 0, ocean.height);
        grad.addColorStop(0, 'rgba(10,46,74,.08)');
        grad.addColorStop(1, 'rgba(0,0,0,.22)');
        octx.fillStyle = grad;
        octx.fillRect(0, 0, ocean.width, ocean.height);

        // waves
        const waves = [
          { amp: 22, len: 0.010, y: 0.46, alpha: 0.11 },
          { amp: 30, len: 0.008, y: 0.54, alpha: 0.09 },
          { amp: 38, len: 0.006, y: 0.62, alpha: 0.07 },
        ];
        for (let i = 0; i < waves.length; i++) {
          const w = waves[i];
          octx.beginPath();
          const baseY = ocean.height * w.y;
          octx.moveTo(0, baseY);
          for (let x = 0; x <= ocean.width; x += 8) {
            const y = baseY + Math.sin(x * w.len + t * (0.8 + i * 0.15)) * w.amp;
            octx.lineTo(x, y);
          }
          octx.lineTo(ocean.width, ocean.height);
          octx.lineTo(0, ocean.height);
          octx.closePath();
          octx.fillStyle = `rgba(0,180,230,${w.alpha})`;
          octx.fill();

          // gold shimmer
          octx.beginPath();
          octx.moveTo(0, baseY - 16);
          for (let x = 0; x <= ocean.width; x += 10) {
            const y = (baseY - 16) + Math.sin(x * (w.len * 1.2) + t * (1.2 + i * 0.2)) * (w.amp * 0.22);
            octx.lineTo(x, y);
          }
          octx.strokeStyle = `rgba(255,215,64,${w.alpha * 0.38})`;
          octx.lineWidth = 1.2;
          octx.stroke();
        }
        t += 0.012;
        requestAnimationFrame(drawOcean);
      }
      drawOcean();
    })();
  
