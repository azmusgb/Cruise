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

      // ---------- Copy function ----------
      const copyText = function(text) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied');
        }).catch(() => {
          showToast('Unable to copy');
        });
      };

      document.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const action = actionButton.dataset.action;
        if (action === 'copy') {
          copyText(actionButton.dataset.copy || "");
        }

        if (action === 'security-call') {
          window.alert('Use onboard phone to contact security.');
        }
      });

      function showToast(msg) {
        toastText.textContent = msg;
        toast.classList.add('show');
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
      }

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
  
