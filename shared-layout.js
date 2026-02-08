/* ============================================================================
 * Shared Layout (RCCL-inspired) — drop-in, production-grade
 * - Data-driven nav/footer
 * - Accessible mobile drawer + focus trap
 * - Theme sync (saved + system), reduced-motion aware
 * - Scroll progress + hero observer (safe)
 * - Dynamic badges (checklist / dining) via localStorage (optional)
 * - Safe link handling + page transitions (opt-out friendly)
 * ============================================================================
 * Expected mounts in each page:
 *   <div id="sharedHeader" data-page="index"></div>
 *   <div id="sharedFooter"></div>
 *
 * Optional dataset knobs on #sharedHeader:
 *   data-menu-toggle="false"   -> hide mobile menu toggle
 *   data-brand="The Royal Way Hub"
 *   data-ship="Adventure of the Seas"
 *   data-sailing="Feb 14–20, 2026"
 *   data-port="Port Canaveral"
 *   data-hero-progress="true"  -> enable progressbar
 *   data-transitions="true"    -> enable page transitions
 *
 * LocalStorage (optional):
 *   cruise-theme: "light" | "dark" | "system"
 *   cruise-checklist: JSON { items:[{done:boolean, priority?:'high'|'med'|'low'}] }
 *   cruise-dining: JSON { reservations:[...], pending?:number }
 *   cruise-nextport: JSON { name:'Perfect Day at CocoCay', time:'7:00 AM' }
 * ========================================================================== */
(function renderSharedLayoutRCCL() {
  'use strict';

  // ---------------------------
  // Configuration
  // ---------------------------
  const DEFAULT_META = {
    brand: 'The Royal Way Hub',
    ship: 'Adventure of the Seas',
    sailing: 'Feb 14–20, 2026',
    port: 'Port Canaveral',
    year: new Date().getFullYear(),
  };

  const NAV_ITEMS = [
    { id: 'index',      href: 'index.html',      icon: 'fa-home',       text: 'Dashboard', ariaLabel: 'Go to dashboard page', description: 'Overview of your cruise experience' },
    { id: 'operations', href: 'operations.html', icon: 'fa-tasks',      text: 'Checklist', ariaLabel: 'Operations checklist page', description: 'Pre-cruise tasks and prep', badgeKey: 'checklist' },
    { id: 'itinerary',  href: 'itinerary.html',  icon: 'fa-route',      text: 'Itinerary', ariaLabel: 'Itinerary page', description: 'Daily schedule and activities', badge: 'NEW', badgeTone: 'success' },
    { id: 'rooms',      href: 'rooms.html',      icon: 'fa-bed',        text: 'Staterooms', ariaLabel: 'Staterooms page', description: 'Room assignments and details' },
    { id: 'decks',      href: 'decks.html',      icon: 'fa-map',        text: 'Decks', ariaLabel: 'View deck plans', description: 'Interactive ship layout' },
    { id: 'dining',     href: 'dining.html',     icon: 'fa-utensils',   text: 'Dining', ariaLabel: 'Dining page', description: 'Restaurants and reservations', badgeKey: 'dining' },
    { id: 'tips',       href: 'tips.html',       icon: 'fa-lightbulb',  text: 'Tips', ariaLabel: 'View tips and packing guide', description: 'Cruise advice and packing list' },
  ];

  const FOOTER_SECTIONS = [
    {
      title: 'Plan & Prepare',
      links: [
        { text: 'Dashboard', href: 'index.html', icon: 'fa-home' },
        { text: 'Checklist', href: 'operations.html', icon: 'fa-clipboard-check' },
        { text: 'Itinerary', href: 'itinerary.html', icon: 'fa-route' },
        { text: 'Staterooms', href: 'rooms.html', icon: 'fa-bed' },
      ],
    },
    {
      title: 'Onboard Essentials',
      links: [
        { text: 'Deck Plans', href: 'decks.html', icon: 'fa-map' },
        { text: 'Dining', href: 'dining.html', icon: 'fa-utensils' },
        { text: 'Packing Tips', href: 'tips.html', icon: 'fa-suitcase' },
        { text: 'Shore Excursions', href: 'excursions.html', icon: 'fa-umbrella-beach' },
      ],
    },
    {
      title: 'Stay Connected',
      links: [
        { text: 'Ship Contacts', href: 'contacts.html', icon: 'fa-address-book' },
        { text: 'VOOM Wi-Fi', href: 'wifi.html', icon: 'fa-wifi' },
        { text: 'Support Center', href: 'faq.html', icon: 'fa-question-circle' },
        { text: 'Safety Updates', href: 'safety.html', icon: 'fa-shield-alt' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', href: 'privacy.html' },
        { text: 'Terms of Service', href: 'terms.html' },
        { text: 'Accessibility', href: 'accessibility.html' },
        { text: 'Cookie Policy', href: 'cookies.html' },
      ],
    },
  ];

  const FOOTER_QUICK_ACTIONS = [
    { title: 'Finish Your Checklist', subtitle: 'Keep the essentials tight', icon: 'fa-clipboard-list', href: 'operations.html', cta: 'View tasks', badgeKey: 'checklist' },
    { title: 'Today’s Itinerary', subtitle: 'Plan activities & showtimes', icon: 'fa-calendar-check', href: 'itinerary.html', cta: 'Build schedule' },
    { title: 'Dining Reservations', subtitle: 'Lock in your dining times', icon: 'fa-utensils', href: 'dining.html', cta: 'Reserve now', badgeKey: 'dining' },
  ];

  // ---------------------------
  // Utilities
  // ---------------------------
  const utils = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    clamp: (n, min, max) => Math.min(Math.max(n, min), max),
    isMobile: () => window.matchMedia && window.matchMedia('(max-width: 768px)').matches,
    prefersReducedMotion: () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    debounce(fn, wait = 100) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    },
    createElement(html) {
      const tpl = document.createElement('template');
      tpl.innerHTML = String(html).trim();
      return tpl.content.firstElementChild;
    },
    safeJsonParse(value, fallback) {
      try { return JSON.parse(value); } catch { return fallback; }
    },
    getCurrentPage(mountEl) {
      const fromDataset = mountEl?.dataset?.page;
      if (fromDataset) return fromDataset;
      const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
      return file.replace('.html', '') || 'index';
    },
    announce(message, priority = 'polite') {
      const el = document.createElement('div');
      el.className = 'sr-only';
      el.setAttribute('aria-live', priority);
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    },
    lockBodyScroll(locked) {
      document.body.style.overflow = locked ? 'hidden' : '';
    },
    // Basic focus trap for drawers/modals
    trapFocus(container, active) {
      if (!container) return () => {};
      const focusableSel = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      function handleKeydown(e) {
        if (e.key !== 'Tab') return;
        const focusables = utils.qsa(focusableSel, container).filter(x => x.offsetParent !== null);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;

        if (e.shiftKey) {
          if (activeEl === first || !container.contains(activeEl)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (activeEl === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      if (active) container.addEventListener('keydown', handleKeydown);
      return () => container.removeEventListener('keydown', handleKeydown);
    },
  };

  // ---------------------------
  // Theme Manager (light/dark/system)
  // ---------------------------
  const ThemeManager = {
    key: 'cruise-theme',
    current: 'system',
    media: null,

    init() {
      this.media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
      const saved = localStorage.getItem(this.key) || 'system';
      this.apply(saved, { silent: true });

      if (this.media && this.media.addEventListener) {
        this.media.addEventListener('change', () => {
          if (this.current === 'system') this.apply('system', { silent: true });
        });
      }
    },

    resolve(theme) {
      if (theme === 'system') {
        const isDark = this.media ? this.media.matches : false;
        return isDark ? 'dark' : 'light';
      }
      return theme === 'dark' ? 'dark' : 'light';
    },

    apply(theme, opts = {}) {
      const normalized = (theme === 'dark' || theme === 'light') ? theme : 'system';
      this.current = normalized;
      localStorage.setItem(this.key, normalized);

      const resolved = this.resolve(normalized);
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.setAttribute('data-theme-mode', normalized); // helps your CSS if you want

      if (!opts.silent) utils.announce(`Theme set to ${resolved}`);
      this.syncToggleUI();
    },

    toggle() {
      // cycle: system -> dark -> light -> system
      const next = this.current === 'system' ? 'dark' : (this.current === 'dark' ? 'light' : 'system');
      this.apply(next);
    },

    syncToggleUI() {
      const resolved = this.resolve(this.current);
      const btn = utils.qs('#themeToggle');
      const mobile = utils.qs('#themeToggleMobile');

      const label = resolved === 'dark' ? 'Dark Mode' : 'Light Mode';
      if (btn) btn.setAttribute('aria-label', `Theme: ${label}. Activate to change.`);
      if (mobile) {
        mobile.querySelector('.theme-toggle-mobile__label')?.replaceChildren(document.createTextNode(label));
        mobile.setAttribute('aria-label', `Theme: ${label}. Activate to change.`);
        mobile.setAttribute('data-resolved', resolved);
        mobile.setAttribute('data-mode', this.current);
      }
    },
  };

  // ---------------------------
  // Badge Providers (optional)
  // ---------------------------
  const BadgeProvider = {
    // returns: { text: string, tone?: 'info'|'warning'|'success'|'primary' }
    getChecklistBadge() {
      const raw = localStorage.getItem('cruise-checklist');
      if (!raw) return null;
      const data = utils.safeJsonParse(raw, null);
      const items = Array.isArray(data?.items) ? data.items : [];
      const remaining = items.filter(i => !i?.done).length;
      if (!remaining) return { text: '0', tone: 'success' };
      // emphasize if priority items remain
      const priorityRemaining = items.filter(i => !i?.done && (i?.priority === 'high' || i?.priority === 'urgent')).length;
      return { text: String(remaining), tone: priorityRemaining ? 'warning' : 'info' };
    },

    getDiningBadge() {
      const raw = localStorage.getItem('cruise-dining');
      if (!raw) return null;
      const data = utils.safeJsonParse(raw, null);
      const pending = Number.isFinite(data?.pending) ? data.pending : null;
      if (pending === null) {
        const reservations = Array.isArray(data?.reservations) ? data.reservations : [];
        if (!reservations.length) return null;
        return { text: String(reservations.length), tone: 'info' };
      }
      if (pending <= 0) return { text: 'SET', tone: 'success' };
      return { text: String(pending), tone: 'warning' };
    },

    resolve(key) {
      if (key === 'checklist') return this.getChecklistBadge();
      if (key === 'dining') return this.getDiningBadge();
      return null;
    },
  };

  // ---------------------------
  // Rendering Helpers
  // ---------------------------
  function toneToClass(tone) {
    // Map to your existing badge classes (adjust to match your CSS)
    switch (tone) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'info': return 'badge-info';
      default: return 'badge-primary';
    }
  }

  function buildNavLink(item, isActive) {
    const badgeFromStorage = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;
    const badgeText = badgeFromStorage?.text ?? item.badge ?? '';
    const badgeTone = badgeFromStorage?.tone ?? item.badgeTone ?? 'primary';

    const badgeHTML = badgeText
      ? `<span class="nav-badge ${toneToClass(badgeTone)}" aria-label="${badgeText} ${item.text}">
           ${badgeText}
         </span>`
      : '';

    return `
      <a href="${item.href}"
         class="nav-link${isActive ? ' active' : ''}"
         ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
         ${isActive ? 'aria-current="page"' : ''}
         data-tooltip="${item.description || ''}"
         data-delay="140">
        <i class="fas ${item.icon}" aria-hidden="true"></i>
        <span class="nav-text">${item.text}</span>
        ${badgeHTML}
      </a>
    `;
  }

  function buildMobileNavLink(item, isActive) {
    const badgeFromStorage = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;
    const badgeText = badgeFromStorage?.text ?? item.badge ?? '';
    const badgeTone = badgeFromStorage?.tone ?? item.badgeTone ?? 'primary';

    return `
      <a href="${item.href}"
         class="mobile-nav-link${isActive ? ' active' : ''}"
         ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
         ${isActive ? 'aria-current="page"' : ''}>
        <i class="fas ${item.icon}" aria-hidden="true"></i>
        <span class="mobile-nav-link__text">${item.text}</span>
        ${badgeText ? `<span class="mobile-badge ${toneToClass(badgeTone)}">${badgeText}</span>` : ''}
      </a>
    `;
  }

  function getMetaFromMount(headerMount) {
    const ds = headerMount?.dataset || {};
    return {
      brand: ds.brand || DEFAULT_META.brand,
      ship: ds.ship || DEFAULT_META.ship,
      sailing: ds.sailing || DEFAULT_META.sailing,
      port: ds.port || DEFAULT_META.port,
      year: DEFAULT_META.year,
      showMenuToggle: ds.menuToggle !== 'false',
      showProgress: ds.heroProgress !== 'false',
      transitions: ds.transitions === 'true',
    };
  }

  // ---------------------------
  // Header
  // ---------------------------
  function renderHeader() {
    const headerMount = utils.qs('#sharedHeader');
    if (!headerMount) return;

    const currentPage = utils.getCurrentPage(headerMount);
    const meta = getMetaFromMount(headerMount);

    const navLinks = NAV_ITEMS.map(item => buildNavLink(item, currentPage === item.id)).join('');
    const mobileLinks = NAV_ITEMS.map(item => buildMobileNavLink(item, currentPage === item.id)).join('');

    const headerHTML = `
      <a class="skip-link sr-only-focusable" href="#main">Skip to content</a>

      <header class="app-header app-header--nav" role="banner" data-page="${currentPage}">
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo" aria-label="Go to dashboard">
              <div class="logo-icon" aria-hidden="true">
                <i class="fas fa-crown" aria-hidden="true"></i>
              </div>
              <div class="logo-text-container">
                <div class="logo-text">${escapeHtml(meta.brand)}</div>
                <div class="logo-subtext">${escapeHtml(meta.ship)} • ${escapeHtml(meta.sailing)}</div>
              </div>
            </a>

            <nav class="nav-desktop" aria-label="Main navigation">
              ${navLinks}

              <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle theme">
                <span class="theme-toggle__icons" aria-hidden="true">
                  <i class="fas fa-sun"></i>
                  <i class="fas fa-moon"></i>
                  <i class="fas fa-desktop"></i>
                </span>
                <span class="toggle-track" aria-hidden="true"></span>
              </button>

              <div class="user-menu">
                <button class="user-menu-toggle" type="button" aria-label="User menu" aria-expanded="false">
                  <i class="fas fa-user-circle" aria-hidden="true"></i>
                  <span class="user-name">Guest</span>
                  <i class="fas fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="user-dropdown" role="menu" aria-label="User menu options">
                  <a href="profile.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-user" aria-hidden="true"></i> My Profile
                  </a>
                  <a href="settings.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-cog" aria-hidden="true"></i> Settings
                  </a>
                  <div class="dropdown-divider" role="separator"></div>
                  <a href="help.html" class="dropdown-item" role="menuitem">
                    <i class="fas fa-question-circle" aria-hidden="true"></i> Help Center
                  </a>
                </div>
              </div>
            </nav>

            ${meta.showMenuToggle ? `
              <button class="mobile-menu-toggle" type="button"
                      aria-label="Open navigation menu"
                      aria-expanded="false"
                      aria-controls="navMobile">
                <span class="hamburger-box" aria-hidden="true">
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                </span>
              </button>
            ` : ''}
          </div>

          ${meta.showMenuToggle ? `
            <div class="nav-mobile-overlay" data-action="close-mobile" hidden></div>

            <nav class="nav-mobile" id="navMobile" aria-label="Mobile navigation" hidden>
              <div class="mobile-nav-header">
                <div class="mobile-nav-title">
                  <span class="mobile-nav-title__eyebrow">${escapeHtml(meta.port)}</span>
                  <strong class="mobile-nav-title__main">Plan your day</strong>
                </div>
                <button class="mobile-nav-close" type="button" data-action="close-mobile" aria-label="Close menu">
                  <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>

              <div class="mobile-nav-links">
                ${mobileLinks}
              </div>

              <div class="mobile-nav-footer">
                <button class="theme-toggle-mobile" id="themeToggleMobile" type="button" aria-label="Toggle theme">
                  <i class="fas fa-adjust" aria-hidden="true"></i>
                  <span class="theme-toggle-mobile__label">Theme</span>
                  <span class="toggle-switch" aria-hidden="true">
                    <span class="toggle-slider"></span>
                  </span>
                </button>

                <div class="mobile-nav-shortcuts" aria-label="Shortcuts">
                  <button type="button" class="chip" data-action="go" data-href="operations.html">
                    <i class="fas fa-clipboard-check" aria-hidden="true"></i> Checklist
                  </button>
                  <button type="button" class="chip" data-action="go" data-href="itinerary.html">
                    <i class="fas fa-route" aria-hidden="true"></i> Itinerary
                  </button>
                  <button type="button" class="chip" data-action="go" data-href="dining.html">
                    <i class="fas fa-utensils" aria-hidden="true"></i> Dining
                  </button>
                </div>
              </div>
            </nav>
          ` : ''}
        </div>

        ${meta.showProgress ? `
          <div class="header-progress" role="progressbar" aria-label="Scroll progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" aria-hidden="true"></div>
          </div>
        ` : ''}
      </header>
    `;

    headerMount.outerHTML = headerHTML;
  }

  // ---------------------------
  // Footer
  // ---------------------------
  function renderFooter() {
    const footerMount = utils.qs('#sharedFooter');
    if (!footerMount) return;

    // Next port: defaults to CocoCay (per your updated itinerary)
    const nextPort = (() => {
      const raw = localStorage.getItem('cruise-nextport');
      const parsed = raw ? utils.safeJsonParse(raw, null) : null;
      if (parsed?.name) return parsed;
      return { name: 'Perfect Day at CocoCay', time: '7:00 AM' };
    })();

    const sectionsHTML = FOOTER_SECTIONS.map(section => `
      <div class="footer-section">
        <h4 class="footer-subtitle">${escapeHtml(section.title)}</h4>
        ${section.links.map(link => `
          <a href="${link.href}" class="footer-link">
            ${link.icon ? `<i class="fas ${link.icon}" aria-hidden="true"></i>` : ''}
            <span>${escapeHtml(link.text)}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

    const quickActionsHTML = FOOTER_QUICK_ACTIONS.map(action => {
      const badgeFromStorage = action.badgeKey ? BadgeProvider.resolve(action.badgeKey) : null;
      const subtitle = badgeFromStorage?.text
        ? `${action.subtitle} • ${badgeFromStorage.text} ${action.badgeKey === 'checklist' ? 'remaining' : 'saved'}`
        : action.subtitle;

      return `
        <a class="footer-action-card" href="${action.href}">
          <div class="footer-action-icon" aria-hidden="true">
            <i class="fas ${action.icon}"></i>
          </div>
          <div class="footer-action-content">
            <h4>${escapeHtml(action.title)}</h4>
            <p>${escapeHtml(subtitle)}</p>
            <span class="footer-action-cta">${escapeHtml(action.cta)} <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
          </div>
        </a>
      `;
    }).join('');

    const year = DEFAULT_META.year;

    const footerHTML = `
      <footer class="app-footer" role="contentinfo">
        <div class="container">
          <div class="footer-hero">
            <div class="footer-hero__intro">
              <span class="footer-eyebrow">${escapeHtml(DEFAULT_META.ship)} • ${escapeHtml(DEFAULT_META.sailing)}</span>
              <h3>Plan clean. Sail calmer.</h3>
              <p>Keep your checklist, dining, and itinerary in one place — fast, readable, and phone-friendly.</p>
            </div>

            <div class="footer-hero__actions">
              <a class="btn btn--primary btn--icon" href="operations.html">
                <i class="fas fa-clipboard-check" aria-hidden="true"></i>
                Finish checklist
              </a>
              <a class="btn btn--secondary btn--icon" href="itinerary.html">
                <i class="fas fa-route" aria-hidden="true"></i>
                View itinerary
              </a>
            </div>

            <div class="footer-hero__cards">
              ${quickActionsHTML}
            </div>
          </div>

          <div class="footer-grid">
            ${sectionsHTML}

            <div class="footer-section footer-newsletter">
              <h4 class="footer-subtitle">Stay Updated</h4>
              <p class="footer-text">Quick alerts you actually care about: ports, weather, and schedule changes.</p>

              <form class="newsletter-form" aria-label="Newsletter signup">
                <div class="input-group">
                  <input type="email" placeholder="Email address" aria-label="Email address" class="newsletter-input" autocomplete="email" inputmode="email">
                  <button type="submit" class="newsletter-button" aria-label="Subscribe">
                    <i class="fas fa-paper-plane" aria-hidden="true"></i>
                  </button>
                </div>
                <p class="newsletter-note">No spam. No drama. Just useful updates.</p>
              </form>

              <div class="footer-support" aria-label="Support">
                <div class="footer-support__item">
                  <i class="fas fa-headset" aria-hidden="true"></i>
                  <div>
                    <strong>Guest Services</strong>
                    <span>Onboard support & help center</span>
                  </div>
                </div>

                <div class="footer-support__item">
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <div>
                    <strong>Next Port</strong>
                    <span>${escapeHtml(nextPort.name)} • ${escapeHtml(nextPort.time || '')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="footer-copyright">
              <i class="fas fa-ship" aria-hidden="true"></i>
              <span>© ${year} Royal Caribbean International. All rights reserved.</span>
            </div>

            <div class="footer-connect">
              <div class="footer-app" aria-label="App links">
                <span class="footer-group-title">Get the app</span>
                <a href="https://apps.apple.com" class="app-link" aria-label="Download on App Store" target="_blank" rel="noopener noreferrer">
                  <span class="app-link__icon">
                    <i class="fab fa-app-store" aria-hidden="true"></i>
                  </span>
                  <span>App Store</span>
                </a>
                <a href="https://play.google.com" class="app-link" aria-label="Get it on Google Play" target="_blank" rel="noopener noreferrer">
                  <span class="app-link__icon">
                    <i class="fab fa-google-play" aria-hidden="true"></i>
                  </span>
                  <span>Google Play</span>
                </a>
              </div>
            </div>
          </div>

          <button class="back-to-top" type="button" aria-label="Scroll to top">
            <i class="fas fa-chevron-up" aria-hidden="true"></i>
          </button>
        </div>
      </footer>
    `;

    footerMount.outerHTML = footerHTML;
  }

  // ---------------------------
  // Interactions (delegated)
  // ---------------------------
  let cleanupFns = [];

  function on(el, evt, handler, opts) {
    if (!el) return;
    el.addEventListener(evt, handler, opts);
    cleanupFns.push(() => el.removeEventListener(evt, handler, opts));
  }

  function initHeaderInteractions() {
    const toggle = utils.qs('.mobile-menu-toggle');
    const nav = utils.qs('.nav-mobile');
    const overlay = utils.qs('.nav-mobile-overlay');

    let releaseTrap = () => {};

    function openMobile() {
      if (!toggle || !nav) return;
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');

      nav.hidden = false;
      overlay && (overlay.hidden = false);
      utils.lockBodyScroll(true);

      // focus first link
      const firstLink = utils.qs('.nav-mobile a, .nav-mobile button', nav);
      if (firstLink) firstLink.focus({ preventScroll: true });

      releaseTrap = utils.trapFocus(nav, true);
    }

    function closeMobile() {
      if (!toggle || !nav) return;
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');

      nav.hidden = true;
      overlay && (overlay.hidden = true);
      utils.lockBodyScroll(false);

      releaseTrap();
      releaseTrap = () => {};

      toggle.focus({ preventScroll: true });
    }

    // Mobile toggle click
    on(toggle, 'click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMobile() : openMobile();
    });

    // Close buttons / overlay
    on(document, 'click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-action');
      if (action === 'close-mobile') {
        e.preventDefault();
        closeMobile();
        return;
      }
      if (action === 'go') {
        const href = actionEl.getAttribute('data-href');
        if (href) window.location.href = href;
      }
    });

    // Click outside drawer closes (only when open)
    on(document, 'click', (e) => {
      if (!nav || nav.hidden) return;
      if (nav.contains(e.target)) return;
      if (toggle && toggle.contains(e.target)) return;
      if (overlay && overlay.contains(e.target)) {
        closeMobile();
      }
    });

    // Escape closes drawer + dropdowns
    on(document, 'keydown', (e) => {
      if (e.key !== 'Escape') return;

      // close dropdowns
      utils.qsa('[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded', 'false'));

      if (nav && !nav.hidden) {
        e.preventDefault();
        closeMobile();
      }
    });

    // Theme toggles
    on(utils.qs('#themeToggle'), 'click', () => ThemeManager.toggle());
    on(utils.qs('#themeToggleMobile'), 'click', () => ThemeManager.toggle());

    // User dropdown
    const userToggle = utils.qs('.user-menu-toggle');
    on(userToggle, 'click', (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute('aria-expanded') === 'true';
      userToggle.setAttribute('aria-expanded', String(!expanded));
    });
    on(document, 'click', () => {
      if (userToggle) userToggle.setAttribute('aria-expanded', 'false');
    });

    // Desktop tooltips (if you already have CSS for .nav-tooltip)
    if (!utils.isMobile()) {
      let tipEl = null;
      let tipT = null;

      const showTip = (link) => {
        const text = link?.dataset?.tooltip;
        if (!text) return;
        tipEl = document.createElement('div');
        tipEl.className = 'nav-tooltip';
        tipEl.textContent = text;
        document.body.appendChild(tipEl);

        const r = link.getBoundingClientRect();
        tipEl.style.left = `${r.left + r.width / 2}px`;
        tipEl.style.top = `${r.bottom + 10}px`;
        tipEl.style.transform = 'translateX(-50%)';
      };

      const hideTip = () => {
        clearTimeout(tipT);
        if (tipEl) tipEl.remove();
        tipEl = null;
      };

      utils.qsa('.nav-link[data-tooltip]').forEach((link) => {
        on(link, 'mouseenter', () => {
          const delay = parseInt(link.dataset.delay || '200', 10);
          tipT = setTimeout(() => showTip(link), delay);
        });
        on(link, 'mouseleave', hideTip);
        on(link, 'focus', () => showTip(link));
        on(link, 'blur', hideTip);
      });
    }
  }

  function initHeroObserver() {
    const hero = utils.qs('.app-hero, .hero');
    const header = utils.qs('.app-header');
    const progressBar = utils.qs('.header-progress .progress-bar');

    if (!header) return () => {};
    if (!hero && !progressBar) return () => {};

    const update = () => {
      const y = window.scrollY || 0;

      if (y > 100) header.classList.add('scrolled');
      else header.classList.remove('scrolled');

      if (progressBar) {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const p = utils.clamp(y / max, 0, 1);
        progressBar.style.transform = `scaleX(${p})`;
      }

      if (hero && !utils.prefersReducedMotion()) {
        // gentle parallax if hero has background image
        const bg = getComputedStyle(hero).backgroundImage;
        if (bg && bg !== 'none') {
          hero.style.backgroundPositionY = `${-(y * 0.25)}px`;
        }
      }
    };

    const handler = utils.debounce(update, 10);
    update();
    on(window, 'scroll', handler, { passive: true });
    on(window, 'resize', utils.debounce(update, 100), { passive: true });

    return () => {}; // removal handled by cleanupFns via on()
  }

  function initFooterInteractions() {
    // Newsletter: purely local UX
    const form = utils.qs('.newsletter-form');
    on(form, 'submit', (e) => {
      e.preventDefault();
      const input = utils.qs('input[type="email"]', form);
      if (!input) return;
      const val = String(input.value || '').trim();
      if (!val) {
        utils.announce('Please enter an email address.', 'assertive');
        input.focus();
        return;
      }
      input.value = '';
      utils.announce('Subscribed. You’re on the list.');
    });

    // Back to top
    const btn = utils.qs('.back-to-top');
    const updateVis = utils.debounce(() => {
      if (!btn) return;
      btn.classList.toggle('visible', (window.scrollY || 0) > 500);
    }, 80);

    on(btn, 'click', () => {
      window.scrollTo({ top: 0, behavior: utils.prefersReducedMotion() ? 'auto' : 'smooth' });
      utils.announce('Back to top.');
    });

    updateVis();
    on(window, 'scroll', updateVis, { passive: true });
  }

  function initKeyboardShortcuts() {
    on(document, 'keydown', (e) => {
      // Alt+1..7 = nav shortcuts (desktop power move)
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key, 10) - 1;
        if (NAV_ITEMS[idx]) {
          e.preventDefault();
          window.location.href = NAV_ITEMS[idx].href;
        }
      }
    });
  }

  function initPageTransitions(enabled) {
    if (!enabled) return;

    // Respect reduced motion
    if (utils.prefersReducedMotion()) return;

    document.documentElement.classList.add('page-transitions');

    on(document, 'click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      // only same-origin .html navigations without hash jumps
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      if (!href.includes('.html')) return;
      if (a.target === '_blank') return;
      if (a.hasAttribute('download')) return;

      e.preventDefault();
      document.body.classList.add('page-exiting');
      setTimeout(() => { window.location.href = href; }, 220);
    });
  }

  // ---------------------------
  // Escape helper (basic)
  // ---------------------------
  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // ---------------------------
  // Refresh badges without full rerender
  // ---------------------------
  function refreshBadgesInDOM() {
    // desktop
    utils.qsa('.nav-link').forEach((link) => {
      const textEl = utils.qs('.nav-text', link);
      if (!textEl) return;

      const label = textEl.textContent.trim();
      const item = NAV_ITEMS.find(x => x.text === label);
      if (!item || !item.badgeKey) return;

      const badge = BadgeProvider.resolve(item.badgeKey);
      let badgeEl = utils.qs('.nav-badge', link);

      if (!badge) {
        if (badgeEl) badgeEl.remove();
        return;
      }

      if (!badgeEl) {
        badgeEl = document.createElement('span');
        badgeEl.className = 'nav-badge';
        link.appendChild(badgeEl);
      }
      badgeEl.className = `nav-badge ${toneToClass(badge.tone || 'primary')}`;
      badgeEl.textContent = badge.text;
      badgeEl.setAttribute('aria-label', `${badge.text} ${label}`);
    });

    // mobile
    utils.qsa('.mobile-nav-link').forEach((link) => {
      const label = utils.qs('.mobile-nav-link__text', link)?.textContent?.trim();
      if (!label) return;

      const item = NAV_ITEMS.find(x => x.text === label);
      if (!item || !item.badgeKey) return;

      const badge = BadgeProvider.resolve(item.badgeKey);
      let badgeEl = utils.qs('.mobile-badge', link);

      if (!badge) {
        if (badgeEl) badgeEl.remove();
        return;
      }

      if (!badgeEl) {
        badgeEl = document.createElement('span');
        badgeEl.className = 'mobile-badge';
        link.appendChild(badgeEl);
      }
      badgeEl.className = `mobile-badge ${toneToClass(badge.tone || 'primary')}`;
      badgeEl.textContent = badge.text;
    });
  }

  // ---------------------------
  // Init / Cleanup
  // ---------------------------
  function cleanup() {
    cleanupFns.forEach(fn => {
      try { fn(); } catch { /* no-op */ }
    });
    cleanupFns = [];
  }

  function init() {
    cleanup();

    ThemeManager.init();
    renderHeader();
    renderFooter();

    initHeaderInteractions();
    initFooterInteractions();
    initHeroObserver();
    initKeyboardShortcuts();

    // page transitions flag comes from mount dataset
    const headerMount = utils.qs('.app-header');
    const transitionsEnabled = utils.qs('.app-header')?.closest('body') && (utils.qs('#sharedHeader')?.dataset?.transitions === 'true');
    // ^ #sharedHeader no longer exists after render; use persisted config approach:
    // If you want transitions, set <body data-transitions="true"> and we’ll read it below.
    const bodyTransitions = document.body?.dataset?.transitions === 'true';
    initPageTransitions(transitionsEnabled || bodyTransitions);

    ThemeManager.syncToggleUI();
    refreshBadgesInDOM();

    // Auto-refresh badges when storage updates (multi-tab) or app writes
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'cruise-checklist' || e.key === 'cruise-dining') refreshBadgesInDOM();
      if (e.key === ThemeManager.key) ThemeManager.apply(localStorage.getItem(ThemeManager.key) || 'system', { silent: true });
    };
    on(window, 'storage', onStorage);

    // expose a small API
    window.SharedLayout = {
      utils,
      ThemeManager,
      NAV_ITEMS,
      FOOTER_SECTIONS,
      refresh: () => init(),
      refreshBadges: () => refreshBadgesInDOM(),
      destroy: () => cleanup(),
    };
  }

  // ---------------------------
  // Boot
  // ---------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
