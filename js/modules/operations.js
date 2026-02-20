    (() => {
      'use strict';

      // ----- DOM elements -----
      const menuBtn = document.getElementById('menuBtn');
      const drawerBackdrop = document.getElementById('drawerBackdrop');
      const closeDrawerBtn = document.getElementById('closeDrawerBtn');
      const backToTop = document.getElementById('backToTop');
      const moreBtnMobile = document.getElementById('moreBtnMobile');
      const resetLocalBtn = document.getElementById('resetLocalBtn');
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toastText');

      // ----- Drawer -----
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
      drawerBackdrop.addEventListener('click', (e) => { if (e.target === drawerBackdrop) closeDrawer(); });

      document.addEventListener('keydown', (e) => {
        if (!drawerBackdrop.classList.contains('open')) return;
        if (e.key === 'Escape') closeDrawer();
        if (e.key === 'Tab') {
          const focusables = drawerBackdrop.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
          const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
          if (!list.length) return;
          const first = list[0], last = list[list.length - 1];
          const active = document.activeElement;
          if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
        }
      });

      // ----- Back to top -----
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 400);
      });
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

      // ----- Mobile "More" button -----
      moreBtnMobile.addEventListener('click', openDrawer);

      // ----- Ship parallax -----
      const shipSil = document.querySelector('.ship-sil');
      window.addEventListener('scroll', () => {
        const y = window.scrollY || 0;
        if (shipSil) shipSil.style.transform = `translateX(-50%) translateY(${y * 0.06}px)`;
      }, { passive: true });

      // ----- Checklist functionality (from original) -----
      const input = document.getElementById('operationsSearchInput');
      const status = document.getElementById('operationsSearchStatus');
      const empty = document.getElementById('operationsSearchEmpty');
      const cards = Array.from(document.querySelectorAll('#tasks .deck-card'));
      const total = cards.length;
      const remainingCountEl = document.getElementById('operationsRemainingCount');
      const totalCountEl = document.getElementById('operationsTotalCount');
      const STORAGE_KEY = 'operations-completed-v1';
      const SEARCH_DELAY_MS = 120;
      let searchTimer;

      function showToast(msg, icon = 'fa-circle-check') {
        toastText.textContent = msg;
        const ic = toast.querySelector('i');
        if (ic) ic.className = `fas ${icon}`;
        toast.classList.add('show');
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
      }

      function readCompletionSet() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return new Set(Array.isArray(parsed) ? parsed : []);
        } catch {
          return new Set();
        }
      }

      function writeCompletionSet(set) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
      }

      function applyCompletionState(card, checkbox, done) {
        card.classList.toggle('is-complete', done);
        checkbox.checked = done;
      }

      function updateTaskCounts() {
        const done = cards.filter((card) => card.classList.contains('is-complete')).length;
        const remaining = Math.max(total - done, 0);
        if (remainingCountEl) remainingCountEl.textContent = String(remaining);
        if (totalCountEl) totalCountEl.textContent = String(total);
      }

      function updateSearch() {
        const q = input.value.toLowerCase().trim();
        let shown = 0;
        status.textContent = 'Filtering checklist...';
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          cards.forEach((card) => {
            const match = !q || card.textContent.toLowerCase().includes(q);
            card.hidden = !match;
            card.style.display = match ? 'block' : 'none';
            if (match) shown += 1;
          });
          status.textContent = `Showing ${shown} of ${total} tasks`;
          empty.hidden = shown !== 0;
        }, SEARCH_DELAY_MS);
      }

      const completed = readCompletionSet();
      cards.forEach((card) => {
        const taskId = card.getAttribute('data-task-id');
        const checkbox = card.querySelector('.task-checkbox');
        if (!taskId || !checkbox) return;

        applyCompletionState(card, checkbox, completed.has(taskId));

        checkbox.addEventListener('change', function () {
          const done = this.checked;
          applyCompletionState(card, checkbox, done);
          if (done) {
            completed.add(taskId);
          } else {
            completed.delete(taskId);
          }
          writeCompletionSet(completed);
          updateTaskCounts();
          status.textContent = done ? 'Task marked complete.' : 'Task marked incomplete.';
        });
      });

      input.addEventListener('input', updateSearch);

      const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobileViewport) {
        document.addEventListener('keydown', function (e) {
          if (e.key === '/' && e.target !== input) {
            e.preventDefault();
            input.focus();
          }
        });
      }

      updateTaskCounts();
      updateSearch();

      // Reset button
      resetLocalBtn.addEventListener('click', () => {
        const newSet = new Set();
        writeCompletionSet(newSet);
        cards.forEach(card => {
          const cb = card.querySelector('.task-checkbox');
          if (cb) {
            cb.checked = false;
            card.classList.remove('is-complete');
          }
        });
        updateTaskCounts();
        showToast('All tasks reset');
      });

      // ----- Ocean animation (same as index) -----
      const ocean = document.getElementById('ocean');
      const ctx = ocean.getContext('2d', { alpha: true });
      if (ctx) {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resizeOcean() {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          ocean.width = Math.floor(window.innerWidth * dpr);
          ocean.height = Math.floor(window.innerHeight * dpr);
          ocean.style.width = window.innerWidth + 'px';
          ocean.style.height = window.innerHeight + 'px';
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resizeOcean();
        window.addEventListener('resize', resizeOcean);

        const waves = [
          { amp: 22, len: 0.010, y: 0.46, alpha: 0.11 },
          { amp: 30, len: 0.008, y: 0.54, alpha: 0.09 },
          { amp: 38, len: 0.006, y: 0.62, alpha: 0.07 },
        ];
        let t = 0;

        function drawOcean() {
          const w = window.innerWidth, h = window.innerHeight;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = '#071a2c';
          ctx.fillRect(0, 0, w, h);

          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, 'rgba(10,46,74,.08)');
          g.addColorStop(1, 'rgba(0,0,0,.22)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);

          for (let i = 0; i < waves.length; i++) {
            const wa = waves[i];
            ctx.beginPath();
            const baseY = h * wa.y;
            ctx.moveTo(0, baseY);
            for (let x = 0; x <= w; x += 8) {
              const y = baseY + Math.sin(x * wa.len + t * (0.8 + i * 0.15)) * wa.amp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fillStyle = `rgba(0,180,230,${wa.alpha})`;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, baseY - 16);
            for (let x = 0; x <= w; x += 10) {
              const y = (baseY - 16) + Math.sin(x * (wa.len * 1.2) + t * (1.2 + i * 0.2)) * (wa.amp * 0.22);
              ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(255,215,64,${wa.alpha * 0.38})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          t += prefersReduced ? 0.004 : 0.012;
          requestAnimationFrame(drawOcean);
        }

        if (!prefersReduced) requestAnimationFrame(drawOcean);
        else drawOcean();
      }
    })();
  
