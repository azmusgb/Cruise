    (() => {
      'use strict';

      // ----- CONFIG -----
      const SAILING = {
        ship: 'Adventure of the Seas',
        line: 'Royal Caribbean',
        title: 'Rahe Family & Friends · Cruise Hub',
        sailStartLocal: '2026-02-14T16:00:00',
        sailEndLocal:   '2026-02-20T07:00:00',
        sailDatesText: 'Feb 14–20, 2026',
        departure: 'Port Canaveral (Orlando, FL)',
        departTimeText: '4:00 PM',
        reservationNumber: '4519230',
        primaryStateroom: '6650'
      };

      const DEFAULT_ROOMS = [
        { room: '6650', deck: '6', category: 'Interior', code: 'N/A', guests: ['Bill','Melissa','Owen','Declan'] },
        { room: '8528', deck: '8', category: 'Balcony',  code: '4B',  guests: ['Aimee','Reese'] },
        { room: '8370', deck: '8', category: 'Interior', code: 'N/A', guests: ['Lea','Calab'] },
        { room: '8612', deck: '8', category: 'Interior', code: '2D',  guests: ['Bella','TJ'] },
        { room: '3622', deck: '3', category: 'Interior', code: 'N/A', guests: ['Phoebe','Ryan'] }
      ];

      const ITINERARY = [
        { day: 'Day 1', label: 'Port Canaveral', sub: 'Departure', icon: 'fa-ship' },
        { day: 'Day 2', label: 'Sea Day', sub: 'Explore ship', icon: 'fa-water' },
        { day: 'Day 3', label: 'Grand Cayman', sub: 'Tender port', icon: 'fa-umbrella-beach' },
        { day: 'Day 4', label: 'Falmouth', sub: 'Jamaica', icon: 'fa-mountain' },
        { day: 'Day 5', label: 'Sea Day', sub: 'Reset & roam', icon: 'fa-water' },
        { day: 'Day 6', label: 'Perfect Day at CocoCay', sub: 'Private island', icon: 'fa-sun' },
        { day: 'Day 7', label: 'Port Canaveral', sub: 'Arrival', icon: 'fa-anchor' },
      ];

      const ROOMS_NOTES_KEY = 'rccl.rooms.notes.v1';
      const ROOMS_DATA_KEY = 'rccl.rooms.data.v1';

      // ----- DOM -----
      const $ = (id) => document.getElementById(id);

      const countdownEl = $('countdown');
      const daysNum = $('daysNum');
      const portsNum = $('portsNum');
      const roomsNum = $('roomsNum');
      const roomsList = $('roomsList');
      const itList = $('itList');
      const snapMeta = $('snapMeta');
      const countKicker = $('countKicker');
      const netDot = $('netDot');
      const netText = $('netText');
      const cacheText = $('cacheText');
      const lastUpdatedText = $('lastUpdatedText');
      const copySailInfoBtn = $('copySailInfoBtn');
      const copyResBtn = $('copyResBtn');
      const departTime = $('departTime');
      const primaryRoom = $('primaryRoom');
      const menuBtn = $('menuBtn');
      const drawerBackdrop = $('drawerBackdrop');
      const closeDrawerBtn = $('closeDrawerBtn');
      const drawerStatus = $('drawerStatus');
      const copySnapshotBtn2 = $('copySnapshotBtn2');
      const resetLocalBtn = $('resetLocalBtn');
      const toast = $('toast');
      const toastText = $('toastText');
      const backToTop = $('backToTop');
      const shipSil = document.querySelector('.ship-sil');

      // ----- Utilities -----
      function safeParse(json, fallback) {
        try { return json ? JSON.parse(json) : fallback; } catch { return fallback; }
      }

      function formatLocal(dt) {
        try {
          return new Intl.DateTimeFormat(undefined, {
            weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
          }).format(dt);
        } catch {
          return dt.toString();
        }
      }

      async function copyText(text) {
        const value = String(text || '').trim();
        if (!value) return false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
          } else {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          showToast('Copied');
          return true;
        } catch {
          showToast('Copy blocked', 'fa-triangle-exclamation');
          return false;
        }
      }

      function showToast(msg, icon = 'fa-circle-check') {
        toastText.textContent = msg;
        const ic = toast.querySelector('i');
        if (ic) ic.className = `fas ${icon}`;
        toast.classList.add('show');
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(() => toast.classList.remove('show'), 1400);
      }

      function getRoomsData() {
        const stored = safeParse(localStorage.getItem(ROOMS_DATA_KEY), null);
        if (Array.isArray(stored) && stored.length) return stored;
        return DEFAULT_ROOMS;
      }

      function setOnlineUI(isOnline) {
        netDot.classList.toggle('offline', !isOnline);
        netText.textContent = isOnline ? 'Online' : 'Offline';
        drawerStatus.textContent = `Status: ${isOnline ? 'Online' : 'Offline'}`;
      }

      function storageHealth() {
        try {
          const k = '__rccl_test__';
          localStorage.setItem(k, '1');
          localStorage.removeItem(k);
          return true;
        } catch {
          return false;
        }
      }

      // ----- Countdown -----
      const sailStart = new Date(SAILING.sailStartLocal);
      const sailEnd = new Date(SAILING.sailEndLocal);

      function updateCountdown() {
        const now = new Date();
        const diff = sailStart - now;

        const portsCount = ITINERARY.filter(x => x.icon !== 'fa-water').length;
        portsNum.textContent = String(portsCount);
        countKicker.textContent = `${SAILING.sailDatesText} · Departs ${SAILING.departure}`;

        if (diff <= 0) {
          daysNum.textContent = '0';
          countdownEl.innerHTML = `
            <div class="time-box"><strong>🚢</strong><span>WE SAIL</span></div>
            <div class="time-box"><strong>${formatLocal(sailStart)}</strong><span>DEPARTED</span></div>
          `;
          snapMeta.textContent = `Sailing in progress · Ends ${formatLocal(sailEnd)}`;
          return;
        }

        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff / (1000*60*60)) % 24);
        const mins = Math.floor((diff / (1000*60)) % 60);

        daysNum.textContent = String(days);
        countdownEl.innerHTML = `
          <div class="time-box"><strong>${days}</strong><span>DAYS</span></div>
          <div class="time-box"><strong>${hours}</strong><span>HOURS</span></div>
          <div class="time-box"><strong>${mins}</strong><span>MINUTES</span></div>
        `;
        snapMeta.textContent = `Departure: ${formatLocal(sailStart)} · ${SAILING.departTimeText}`;
      }

      // ----- Rooms + Itinerary render -----
      function renderRooms() {
        const rooms = getRoomsData();
        roomsNum.textContent = String(rooms.length);
        const sorted = [...rooms].sort((a,b) => (String(a.room) === SAILING.primaryStateroom ? -1 : 0) - (String(b.room) === SAILING.primaryStateroom ? -1 : 0)
          || (Number(b.deck||0) - Number(a.deck||0))
          || (Number(a.room||0) - Number(b.room||0)));

        roomsList.innerHTML = '';
        const top = sorted.slice(0, 4);
        for (const r of top) {
          const guests = Array.isArray(r.guests) ? r.guests : [];
          const gShort = guests.length ? guests.slice(0,3).join(', ') + (guests.length > 3 ? '…' : '') : '—';
          const code = (r.code && r.code !== 'N/A') ? ` · ${r.code}` : '';
          const loc = r.category ? `${r.category}${code}` : 'Stateroom';
          roomsList.insertAdjacentHTML('beforeend', `
            <div class="row">
              <div class="left">
                <i class="fas fa-door-open" aria-hidden="true"></i>
                <div class="txt">
                  <strong>Room ${escapeHtml(String(r.room||'—'))} · Deck ${escapeHtml(String(r.deck||'—'))}</strong>
                  <span>${escapeHtml(loc)} · ${escapeHtml(gShort)}</span>
                </div>
              </div>
              <div class="right">${escapeHtml(String(r.room||''))}</div>
            </div>
          `);
        }
      }

      function renderItinerary() {
        itList.innerHTML = '';
        const preview = ITINERARY.slice(0, 5);
        for (const item of preview) {
          itList.insertAdjacentHTML('beforeend', `
            <div class="row">
              <div class="left">
                <i class="fas ${escapeHtml(item.icon)}" aria-hidden="true"></i>
                <div class="txt">
                  <strong>${escapeHtml(item.day)} · ${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(item.sub)}</span>
                </div>
              </div>
              <div class="right">${escapeHtml(item.day.replace('Day ', 'D'))}</div>
            </div>
          `);
        }
      }

      function escapeHtml(s){
        return String(s).replace(/[&<>"']/g, c => ({
          '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        }[c]));
      }

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

      // ----- Copy actions -----
      function buildSailInfoText() {
        return [
          `${SAILING.ship} · ${SAILING.sailDatesText}`,
          `Departure: ${SAILING.departure} · ${SAILING.departTimeText}`,
          `Reservation: ${SAILING.reservationNumber}`,
          `Primary room: ${SAILING.primaryStateroom}`
        ].join('\n');
      }

      function buildSnapshotText() {
        const rooms = getRoomsData();
        const now = new Date();
        return [
          `${SAILING.title}`,
          `${SAILING.ship} · ${SAILING.sailDatesText}`,
          `Departure: ${SAILING.departure} · ${SAILING.departTimeText}`,
          `Rooms: ${rooms.length}`,
          `Status: ${navigator.onLine ? 'Online' : 'Offline'}`,
          `Generated: ${formatLocal(now)}`
        ].join('\n');
      }

      copySailInfoBtn.addEventListener('click', () => copyText(buildSailInfoText()));
      copySnapshotBtn2.addEventListener('click', () => copyText(buildSnapshotText()));
      copyResBtn.addEventListener('click', () => copyText(`Reservation ${SAILING.reservationNumber}`));

      resetLocalBtn.addEventListener('click', async () => {
        const keys = [ROOMS_NOTES_KEY, ROOMS_DATA_KEY];
        for (const k of keys) {
          try { localStorage.removeItem(k); } catch {}
        }
        renderRooms();
        showToast('Local data reset');
      });

      // ----- Online/offline -----
      function updateStatusLine() {
        setOnlineUI(navigator.onLine);
        const ok = storageHealth();
        cacheText.textContent = ok ? 'Storage OK' : 'Storage blocked';
        const now = new Date();
        lastUpdatedText.textContent = `Updated ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }

      window.addEventListener('online', updateStatusLine);
      window.addEventListener('offline', updateStatusLine);

      // ----- Cards reveal -----
      const revealObserver = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible');
        }
      }, { threshold: 0.18 });
      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

      // ----- Back to top -----
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 400);
      });
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

      // ----- Parallax ship -----
      window.addEventListener('scroll', () => {
        const y = window.scrollY || 0;
        if (shipSil) shipSil.style.transform = `translateX(-50%) translateY(${y * 0.06}px)`;
      }, { passive:true });

      // ----- Ocean animation -----
      function startOcean() {
        const canvas = document.getElementById('ocean');
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resize() {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          canvas.width = Math.floor(window.innerWidth * dpr);
          canvas.height = Math.floor(window.innerHeight * dpr);
          canvas.style.width = window.innerWidth + 'px';
          canvas.style.height = window.innerHeight + 'px';
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);

        const waves = [
          { amp: 22, len: 0.010, speed: 0.010, y: 0.46, alpha: 0.11 },
          { amp: 30, len: 0.008, speed: 0.013, y: 0.54, alpha: 0.09 },
          { amp: 38, len: 0.006, speed: 0.016, y: 0.62, alpha: 0.07 },
        ];
        let t = 0;

        function draw() {
          const w = window.innerWidth;
          const h = window.innerHeight;

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
          requestAnimationFrame(draw);
        }

        if (!prefersReduced) requestAnimationFrame(draw);
        else draw();
      }

      // ----- Init -----
      function init() {
        departTime.textContent = SAILING.departTimeText;
        primaryRoom.textContent = SAILING.primaryStateroom;

        updateStatusLine();

        renderRooms();
        renderItinerary();

        updateCountdown();
        setInterval(updateCountdown, 60_000);

        startOcean();

        setInterval(() => {
          try {
            const now = new Date();
            lastUpdatedText.textContent = `Updated ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
          } catch {}
        }, 30_000);
      }

      init();
    })();
  
