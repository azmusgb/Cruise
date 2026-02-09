
/* ============================================================================
 * Shared Layout (RCCL Polished) — premium, cruise-themed
 * - Enhanced RCCL color scheme & typography
 * - Ocean-inspired design elements
 * - Premium UI with depth & subtle animations
 * - Fully accessible with enhanced mobile experience
 * - Dynamic badges with cruise-themed styling
 * ============================================================================
 * Expected mounts in each page:
 *   <div id="sharedHeader" data-page="index"></div>
 *   <div id="sharedFooter"></div>
 *   <div id="sharedBottomNav" data-page="index"></div> (optional)
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
    { id: 'index',      href: 'index.html',      icon: 'fa-home',       text: 'Dashboard', ariaLabel: 'Go to dashboard page', description: 'Overview of your cruise experience', badge: 'WAVE', badgeTone: 'accent' },
    { id: 'operations', href: 'operations.html', icon: 'fa-clipboard-check', text: 'Checklist', ariaLabel: 'Operations checklist page', description: 'Pre-cruise tasks and prep', badgeKey: 'checklist' },
    { id: 'itinerary',  href: 'itinerary.html',  icon: 'fa-route',      text: 'Itinerary', ariaLabel: 'Itinerary page', description: 'Daily schedule and activities', badge: 'NEW', badgeTone: 'success' },
    { id: 'rooms',      href: 'rooms.html',      icon: 'fa-bed',        text: 'Staterooms', ariaLabel: 'Staterooms page', description: 'Room assignments and details' },
    { id: 'decks',      href: 'decks.html',      icon: 'fa-map',        text: 'Decks', ariaLabel: 'View deck plans', description: 'Interactive ship layout' },
    { id: 'dining',     href: 'dining.html',     icon: 'fa-utensils',   text: 'Dining', ariaLabel: 'Dining page', description: 'Restaurants and reservations', badgeKey: 'dining' },
    { id: 'tips',       href: 'tips.html',       icon: 'fa-suitcase',   text: 'Packing', ariaLabel: 'View tips and packing guide', description: 'Cruise advice and packing list' },
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

  // RCCL-inspired color palette
  const RCCL_COLORS = {
    primary: '#0052a5',    // Royal Blue
    secondary: '#ffb400',  // Gold/Amber
    accent: '#00a8e8',     // Ocean Blue
    success: '#28a745',    // Green
    warning: '#ffc107',    // Yellow
    danger: '#dc3545',     // Red
    dark: '#1a1a2e',       // Navy
    light: '#f8f9fa',      // Off-white
    gray: '#6c757d',
  };

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
  // Theme Manager (enhanced for RCCL)
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
      document.documentElement.setAttribute('data-theme-mode', normalized);

      // Inject theme colors
      this.injectThemeColors(resolved);

      if (!opts.silent) {
        const themeNames = { system: 'system', light: 'light', dark: 'dark' };
        utils.announce(`Theme set to ${themeNames[normalized]}`);
      }
      this.syncToggleUI();
    },

    injectThemeColors(theme) {
      const styleId = 'rccl-theme-colors';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      const colors = theme === 'dark' ? {
        bg: RCCL_COLORS.dark,
        surface: '#2d3047',
        text: '#f8f9fa',
        border: '#404258',
        primary: RCCL_COLORS.accent,
        secondary: RCCL_COLORS.secondary,
      } : {
        bg: RCCL_COLORS.light,
        surface: '#ffffff',
        text: RCCL_COLORS.dark,
        border: '#dee2e6',
        primary: RCCL_COLORS.primary,
        secondary: RCCL_COLORS.secondary,
      };

      styleEl.textContent = `
        :root {
          --rccl-bg: ${colors.bg};
          --rccl-surface: ${colors.surface};
          --rccl-text: ${colors.text};
          --rccl-border: ${colors.border};
          --rccl-primary: ${colors.primary};
          --rccl-secondary: ${colors.secondary};
          --rccl-accent: ${RCCL_COLORS.accent};
          --rccl-success: ${RCCL_COLORS.success};
          --rccl-warning: ${RCCL_COLORS.warning};
          --rccl-danger: ${RCCL_COLORS.danger};
        }
      `;
    },

    toggle() {
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
  // Badge Providers (enhanced styling)
  // ---------------------------
  const BadgeProvider = {
    getChecklistBadge() {
      const raw = localStorage.getItem('cruise-checklist');
      if (!raw) return null;
      const data = utils.safeJsonParse(raw, null);
      const items = Array.isArray(data?.items) ? data.items : [];
      const remaining = items.filter(i => !i?.done).length;
      if (!remaining) return { text: '✓', tone: 'success' };
      const priorityRemaining = items.filter(i => !i?.done && (i?.priority === 'high' || i?.priority === 'urgent')).length;
      return { 
        text: String(remaining), 
        tone: priorityRemaining ? 'warning' : 'info',
        pulse: priorityRemaining > 0
      };
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
      if (pending <= 0) return { text: '✓', tone: 'success' };
      return { text: String(pending), tone: 'warning', pulse: pending > 0 };
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
    switch (tone) {
      case 'success': return 'badge--success';
      case 'warning': return 'badge--warning';
      case 'info': return 'badge--info';
      case 'accent': return 'badge--accent';
      default: return 'badge--primary';
    }
  }

  function buildNavLink(item, isActive) {
    const badgeFromStorage = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;
    const badgeText = badgeFromStorage?.text ?? item.badge ?? '';
    const badgeTone = badgeFromStorage?.tone ?? item.badgeTone ?? 'primary';
    const pulseClass = (badgeFromStorage?.pulse) ? 'badge--pulse' : '';

    const badgeHTML = badgeText
      ? `<span class="nav-badge ${toneToClass(badgeTone)} ${pulseClass}" aria-label="${badgeText} ${item.text}">
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
        <span class="nav-link__wave" aria-hidden="true"></span>
      </a>
    `;
  }

  function buildMobileNavLink(item, isActive) {
    const badgeFromStorage = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;
    const badgeText = badgeFromStorage?.text ?? item.badge ?? '';
    const badgeTone = badgeFromStorage?.tone ?? item.badgeTone ?? 'primary';
    const pulseClass = (badgeFromStorage?.pulse) ? 'badge--pulse' : '';

    return `
      <a href="${item.href}"
         class="mobile-nav-link${isActive ? ' active' : ''}"
         ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
         ${isActive ? 'aria-current="page"' : ''}>
        <div class="mobile-nav-link__icon">
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          ${badgeText ? `<span class="mobile-badge ${toneToClass(badgeTone)} ${pulseClass}">${badgeText}</span>` : ''}
        </div>
        <span class="mobile-nav-link__text">${item.text}</span>
        <i class="fas fa-chevron-right mobile-nav-link__chevron" aria-hidden="true"></i>
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
  // Header (RCCL Enhanced)
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

      <header class="app-header app-header--rccl" role="banner" data-page="${currentPage}">
        <div class="header-waves" aria-hidden="true">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
        </div>
        
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo logo--rccl" aria-label="Go to dashboard">
              <div class="logo-icon" aria-hidden="true">
                <i class="fas fa-ship" aria-hidden="true"></i>
                <div class="logo-icon__wave"></div>
              </div>
              <div class="logo-text-container">
                <div class="logo-text">${escapeHtml(meta.brand)}</div>
                <div class="logo-subtext">
                  <i class="fas fa-anchor" aria-hidden="true"></i>
                  <span>${escapeHtml(meta.ship)}</span>
                  <span class="logo-separator">•</span>
                  <span>${escapeHtml(meta.sailing)}</span>
                </div>
              </div>
            </a>

            <nav class="nav-desktop" aria-label="Main navigation">
              <div class="nav-desktop__links">
                ${navLinks}
              </div>

              <div class="nav-desktop__actions">
                <button class="theme-toggle theme-toggle--rccl" id="themeToggle" type="button" aria-label="Toggle theme">
                  <span class="theme-toggle__icons" aria-hidden="true">
                    <i class="fas fa-sun"></i>
                    <i class="fas fa-moon"></i>
                    <i class="fas fa-desktop"></i>
                  </span>
                  <span class="toggle-track" aria-hidden="true"></span>
                </button>

                <div class="user-menu user-menu--rccl">
                  <button class="user-menu-toggle" type="button" aria-label="User menu" aria-expanded="false">
                    <div class="user-avatar">
                      <i class="fas fa-user" aria-hidden="true"></i>
                    </div>
                    <span class="user-name">Guest</span>
                    <i class="fas fa-chevron-down user-menu__chevron" aria-hidden="true"></i>
                  </button>
                  <div class="user-dropdown" role="menu" aria-label="User menu options">
                    <div class="user-dropdown__header">
                      <div class="user-dropdown__avatar">
                        <i class="fas fa-user-circle" aria-hidden="true"></i>
                      </div>
                      <div>
                        <strong>Guest</strong>
                        <span>Welcome aboard!</span>
                      </div>
                    </div>
                    <div class="dropdown-divider" role="separator"></div>
                    <a href="profile.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-user" aria-hidden="true"></i> My Profile
                    </a>
                    <a href="settings.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-cog" aria-hidden="true"></i> Settings
                    </a>
                    <a href="help.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-question-circle" aria-hidden="true"></i> Help Center
                    </a>
                    <div class="dropdown-divider" role="separator"></div>
                    <button class="dropdown-item dropdown-item--signout" role="menuitem" type="button">
                      <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            ${meta.showMenuToggle ? `
              <button class="mobile-menu-toggle mobile-menu-toggle--rccl" type="button"
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

            <nav class="nav-mobile nav-mobile--rccl" id="navMobile" aria-label="Mobile navigation" hidden>
              <div class="nav-mobile__header">
                <div class="mobile-nav-header">
                  <div class="mobile-nav-title">
                    <span class="mobile-nav-title__eyebrow">${escapeHtml(meta.port)}</span>
                    <strong class="mobile-nav-title__main">Welcome Aboard</strong>
                  </div>
                  <div class="mobile-nav-header__actions">
                    <button class="theme-toggle-mobile theme-toggle-mobile--rccl" id="themeToggleMobile" type="button" aria-label="Toggle theme">
                      <i class="fas fa-adjust" aria-hidden="true"></i>
                    </button>
                    <button class="mobile-nav-close" type="button" data-action="close-mobile" aria-label="Close menu">
                      <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
                <div class="mobile-nav-ship-info">
                  <i class="fas fa-ship" aria-hidden="true"></i>
                  <span>${escapeHtml(meta.ship)} • ${escapeHtml(meta.sailing)}</span>
                </div>
              </div>

              <div class="mobile-nav-links">
                ${mobileLinks}
              </div>

              <div class="nav-mobile__footer">
                <div class="mobile-nav-shortcuts" aria-label="Shortcuts">
                  <button type="button" class="chip chip--rccl" data-action="go" data-href="operations.html">
                    <i class="fas fa-clipboard-check" aria-hidden="true"></i> Checklist
                  </button>
                  <button type="button" class="chip chip--rccl" data-action="go" data-href="itinerary.html">
                    <i class="fas fa-route" aria-hidden="true"></i> Itinerary
                  </button>
                  <button type="button" class="chip chip--rccl" data-action="go" data-href="dining.html">
                    <i class="fas fa-utensils" aria-hidden="true"></i> Dining
                  </button>
                </div>
                <div class="mobile-nav-footer-legal">
                  <span>© ${DEFAULT_META.year} Royal Caribbean</span>
                  <span class="legal-separator">•</span>
                  <a href="privacy.html">Privacy</a>
                </div>
              </div>
            </nav>
          ` : ''}
        </div>

        ${meta.showProgress ? `
          <div class="header-progress header-progress--rccl" role="progressbar" aria-label="Scroll progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" aria-hidden="true">
              <div class="progress-wave"></div>
            </div>
          </div>
        ` : ''}
      </header>
    `;

    headerMount.outerHTML = headerHTML;
  }

  // ---------------------------
  // Bottom navigation (shared)
  // ---------------------------
  function renderBottomNav() {
    const mounts = utils.qsa('#sharedBottomNav');
    if (!mounts.length) return;

    mounts.forEach((mount) => {
      const currentPage = utils.getCurrentPage(mount);
      const links = NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        return `
          <a href="${item.href}"
             class="mobile-nav-item${isActive ? ' active' : ''}"
             ${isActive ? 'aria-current="page"' : ''}>
            <span class="mobile-nav-icon"><i class="fas ${item.icon}" aria-hidden="true"></i></span>
            <span class="mobile-nav-text">${item.text}</span>
          </a>
        `;
      }).join('');

      mount.innerHTML = `
        <nav class="mobile-nav" aria-label="Bottom navigation">
          ${links}
        </nav>
      `;
    });
  }

  // ---------------------------
  // Footer (RCCL Enhanced)
  // ---------------------------
  function renderFooter() {
    let footerMount = utils.qs('#sharedFooter');
    if (!footerMount) {
      footerMount = document.createElement('div');
      footerMount.id = 'sharedFooter';
      const main = utils.qs('main');
      if (main && main.parentNode) {
        main.insertAdjacentElement('afterend', footerMount);
      } else {
        document.body.appendChild(footerMount);
      }
    }

    const nextPort = (() => {
      const raw = localStorage.getItem('cruise-nextport');
      const parsed = raw ? utils.safeJsonParse(raw, null) : null;
      if (parsed?.name) return parsed;
      return { name: 'Perfect Day at CocoCay', time: '7:00 AM' };
    })();

    const sectionsHTML = FOOTER_SECTIONS.map(section => `
      <div class="footer-section">
        <h4 class="footer-subtitle">
          <i class="fas fa-compass" aria-hidden="true"></i>
          ${escapeHtml(section.title)}
        </h4>
        <div class="footer-links">
          ${section.links.map(link => `
            <a href="${link.href}" class="footer-link">
              <div class="footer-link__icon">
                <i class="fas ${link.icon}" aria-hidden="true"></i>
              </div>
              <span>${escapeHtml(link.text)}</span>
              <i class="fas fa-chevron-right footer-link__chevron" aria-hidden="true"></i>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    const quickActionsHTML = FOOTER_QUICK_ACTIONS.map(action => {
      const badgeFromStorage = action.badgeKey ? BadgeProvider.resolve(action.badgeKey) : null;
      const subtitle = badgeFromStorage?.text
        ? `${action.subtitle} • ${badgeFromStorage.text} ${action.badgeKey === 'checklist' ? 'remaining' : 'saved'}`
        : action.subtitle;

      const badgeHTML = badgeFromStorage?.text ? `
        <span class="footer-action-badge ${toneToClass(badgeFromStorage.tone)}">
          ${badgeFromStorage.text}
        </span>
      ` : '';

      return `
        <a class="footer-action-card footer-action-card--rccl" href="${action.href}">
          <div class="footer-action-card__content">
            <div class="footer-action-card__header">
              <div class="footer-action-icon" aria-hidden="true">
                <i class="fas ${action.icon}"></i>
              </div>
              ${badgeHTML}
            </div>
            <div class="footer-action-card__body">
              <h4>${escapeHtml(action.title)}</h4>
              <p>${escapeHtml(subtitle)}</p>
            </div>
            <div class="footer-action-card__footer">
              <span class="footer-action-cta">
                ${escapeHtml(action.cta)}
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </span>
            </div>
          </div>
          <div class="footer-action-card__wave" aria-hidden="true"></div>
        </a>
      `;
    }).join('');

    const year = DEFAULT_META.year;

    const footerHTML = `
      <footer class="app-footer app-footer--rccl" role="contentinfo">
        <div class="footer-waves" aria-hidden="true">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
        </div>
        
        <div class="container">
          <div class="footer-hero">
            <div class="footer-hero__intro">
              <div class="footer-hero__badge">
                <i class="fas fa-anchor" aria-hidden="true"></i>
                <span>Onboard Guide</span>
              </div>
              <h3>Plan Clean. Sail Calmer.</h3>
              <p>Your complete digital cruise companion — everything you need in one elegant, intuitive place.</p>
            </div>

            <div class="footer-hero__actions">
              <a class="btn btn--primary btn--rccl btn--icon" href="operations.html">
                <i class="fas fa-clipboard-check" aria-hidden="true"></i>
                Finish Checklist
              </a>
              <a class="btn btn--secondary btn--rccl btn--icon" href="itinerary.html">
                <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                View Itinerary
              </a>
            </div>

            <div class="footer-hero__cards">
              ${quickActionsHTML}
            </div>
          </div>

          <div class="footer-grid">
            ${sectionsHTML}

            <div class="footer-section footer-newsletter footer-newsletter--rccl">
              <div class="footer-newsletter__header">
                <h4 class="footer-subtitle">
                  <i class="fas fa-bell" aria-hidden="true"></i>
                  Stay Updated
                </h4>
                <div class="footer-newsletter__icon">
                  <i class="fas fa-paper-plane" aria-hidden="true"></i>
                </div>
              </div>
              <p class="footer-text">Get alerts for port updates, weather changes, and special offers.</p>

              <form class="newsletter-form newsletter-form--rccl" aria-label="Newsletter signup">
                <div class="input-group">
                  <input type="email" placeholder="Enter your email" aria-label="Email address" class="newsletter-input" autocomplete="email" inputmode="email">
                  <button type="submit" class="newsletter-button" aria-label="Subscribe">
                    <i class="fas fa-paper-plane" aria-hidden="true"></i>
                  </button>
                </div>
                <p class="newsletter-note">No spam. Just useful updates.</p>
              </form>

              <div class="footer-support" aria-label="Support">
                <div class="footer-support__item footer-support__item--rccl">
                  <div class="footer-support__icon">
                    <i class="fas fa-headset" aria-hidden="true"></i>
                  </div>
                  <div class="footer-support__content">
                    <strong>Guest Services</strong>
                    <span>24/7 onboard support</span>
                  </div>
                </div>

                <div class="footer-support__item footer-support__item--rccl">
                  <div class="footer-support__icon">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  </div>
                  <div class="footer-support__content">
                    <strong>Next Port</strong>
                    <span>${escapeHtml(nextPort.name)} • ${escapeHtml(nextPort.time || '')}</span>
                  </div>
                </div>
              </div>

              <div class="footer-social">
                <span>Follow the journey:</span>
                <div class="social-links">
                  <a href="#" class="social-link" aria-label="Facebook">
                    <i class="fab fa-facebook-f" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Instagram">
                    <i class="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Twitter">
                    <i class="fab fa-twitter" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="YouTube">
                    <i class="fab fa-youtube" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom footer-bottom--rccl">
            <div class="footer-bottom__content">
              <div class="footer-copyright">
                <i class="fas fa-ship" aria-hidden="true"></i>
                <span>© ${year} Royal Caribbean International. All rights reserved.</span>
              </div>
              <div class="footer-legal">
                <a href="privacy.html">Privacy Policy</a>
                <span class="legal-separator">•</span>
                <a href="terms.html">Terms of Service</a>
                <span class="legal-separator">•</span>
                <a href="accessibility.html">Accessibility</a>
                <span class="legal-separator">•</span>
                <a href="cookies.html">Cookies</a>
              </div>
            </div>

            <button class="back-to-top back-to-top--rccl" type="button" aria-label="Scroll to top">
              <i class="fas fa-chevron-up" aria-hidden="true"></i>
              <span class="back-to-top__text">Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
    `;

    footerMount.outerHTML = footerHTML;
  }

  /* ============================================================================
   * Enhanced RCCL Premium UI (optional upgrade)
   * ========================================================================== */
  function injectEnhancedStyles() {
    const styleId = 'rccl-premium-styles';
    if (document.getElementById(styleId)) return;
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      :root {
        --rccl-gradient-primary: linear-gradient(135deg, var(--rccl-primary) 0%, var(--rccl-accent) 100%);
        --rccl-gradient-gold: linear-gradient(135deg, #ffc91a 0%, #e6a200 100%);
        --rccl-gradient-surface: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
        --rccl-shadow-sm: 0 2px 8px rgba(0, 82, 165, 0.08);
        --rccl-shadow-md: 0 4px 20px rgba(0, 82, 165, 0.12);
        --rccl-shadow-lg: 0 8px 32px rgba(0, 82, 165, 0.16);
        --rccl-shadow-xl: 0 12px 48px rgba(0, 82, 165, 0.2);
        --rccl-radius-full: 9999px;
      }

      .app-header--rccl.enhanced {
        background: var(--rccl-gradient-surface);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(0, 82, 165, 0.1);
        box-shadow: var(--rccl-shadow-md);
        transition: all var(--transition-base);
      }

      .app-header--rccl.enhanced.scrolled {
        background: color-mix(in srgb, var(--rccl-surface) 98%, transparent);
        box-shadow: var(--rccl-shadow-lg);
      }

      .logo--rccl.enhanced {
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
        transition: all var(--transition-base);
      }

      .logo--rccl.enhanced::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--rccl-gradient-primary);
        opacity: 0;
        transition: opacity var(--transition-base);
        z-index: -1;
      }

      .logo--rccl.enhanced:hover::before { opacity: 0.12; }

      .logo-icon.enhanced { box-shadow: var(--rccl-shadow-sm); }

      .nav-link.enhanced {
        border: 2px solid transparent;
        border-radius: var(--radius-md);
        margin: 0 var(--spacing-xs);
        transition: all var(--transition-base);
      }

      .nav-link.enhanced:hover {
        background: rgba(0, 82, 165, 0.05);
        box-shadow: var(--rccl-shadow-sm);
        transform: translateY(-2px);
      }

      .nav-link.enhanced.active {
        background: var(--rccl-gradient-primary);
        color: #fff;
        box-shadow: var(--rccl-shadow-md);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .nav-link__wave.enhanced {
        bottom: -2px;
        height: 3px;
        border-radius: var(--radius-pill);
        width: 0;
        left: 50%;
        transform: translateX(-50%);
        transition: width var(--transition-base);
      }

      .nav-link.enhanced:hover .nav-link__wave.enhanced { width: 60%; }
      .nav-link.enhanced.active .nav-link__wave.enhanced { width: 80%; background: #fff; }

      .theme-toggle--rccl.enhanced {
        border-radius: var(--radius-pill);
        background: var(--rccl-gradient-primary);
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: var(--rccl-shadow-sm);
      }

      .theme-toggle__icons.enhanced { color: #fff; }
      .toggle-track.enhanced { background: #fff; box-shadow: var(--rccl-shadow-sm); }

      .user-menu-toggle.enhanced {
        background: rgba(0, 82, 165, 0.05);
        border: 2px solid transparent;
        border-radius: var(--radius-md);
        transition: all var(--transition-base);
      }

      .user-menu-toggle.enhanced:hover {
        background: rgba(0, 82, 165, 0.1);
        border-color: rgba(0, 82, 165, 0.2);
      }

      .user-dropdown.enhanced {
        border-radius: var(--radius-lg);
        background: var(--rccl-gradient-surface);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 82, 165, 0.1);
        box-shadow: var(--rccl-shadow-xl);
        overflow: hidden;
      }

      .nav-mobile--rccl.enhanced {
        background: var(--rccl-gradient-surface);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
        border-left: 1px solid rgba(0, 82, 165, 0.1);
        box-shadow: var(--rccl-shadow-xl);
      }

      .mobile-nav-link.enhanced {
        border-radius: var(--radius-md);
        border: 2px solid transparent;
        transition: all var(--transition-base);
      }

      .mobile-nav-link.enhanced:hover {
        background: rgba(0, 82, 165, 0.05);
        transform: translateX(4px);
      }

      .mobile-nav-link.enhanced.active {
        background: var(--rccl-gradient-primary);
        color: #fff;
        box-shadow: var(--rccl-shadow-md);
      }

      .app-footer--rccl.enhanced {
        background: linear-gradient(180deg, var(--rccl-primary) 0%, var(--rccl-dark) 100%);
        color: #fff;
        overflow: hidden;
      }

      .footer-action-card--rccl.enhanced {
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
        border: 1px solid rgba(255, 255, 255, 0.14);
        backdrop-filter: blur(10px);
        box-shadow: var(--rccl-shadow-md);
        transition: all var(--transition-base);
      }

      .footer-action-card--rccl.enhanced:hover {
        transform: translateY(-8px);
        box-shadow: var(--rccl-shadow-xl);
      }

      .back-to-top--rccl.enhanced {
        border-radius: var(--rccl-radius-full);
        background: var(--rccl-gradient-primary);
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: var(--rccl-shadow-lg);
        transform: translateY(20px);
        opacity: 0;
        transition: all var(--transition-base);
      }

      .back-to-top--rccl.enhanced.visible { opacity: 1; transform: translateY(0); }

      .nav-tooltip--rccl.enhanced {
        background: var(--rccl-gradient-primary);
        color: #fff;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: var(--rccl-shadow-lg);
      }

      .header-progress--rccl.enhanced .progress-bar {
        height: 4px;
        border-radius: var(--radius-pill);
      }
    `;
    document.head.appendChild(styleEl);
  }

  function injectRippleStyles() {
    const styleId = 'rccl-premium-ripples';
    if (document.getElementById(styleId)) return;
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      @keyframes ripple { to { width: 280px; height: 280px; opacity: 0; } }
      .btn--rccl.enhanced { position: relative; overflow: hidden; }
    `;
    document.head.appendChild(styleEl);
  }

  function renderEnhancedHeader() {
    const headerMount = utils.qs('#sharedHeader') || utils.qs('.app-header');
    if (!headerMount) return;

    const currentPage = utils.getCurrentPage(headerMount);
    const meta = getMetaFromMount(headerMount);

    const enhancedNavItems = NAV_ITEMS.map(item => {
      const isActive = currentPage === item.id;
      const badge = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;

      return `
        <a href="${item.href}"
           class="nav-link enhanced${isActive ? ' active' : ''}"
           ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
           ${isActive ? 'aria-current="page"' : ''}
           data-tooltip="${item.description || ''}"
           data-delay="140">
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          <span class="nav-text">${item.text}</span>
          ${badge ? `
            <span class="nav-badge enhanced ${toneToClass(badge.tone || 'primary')} ${badge.pulse ? 'badge--pulse' : ''}"
                  aria-label="${badge.text} ${item.text}">
              ${badge.text}
            </span>
          ` : ''}
          <span class="nav-link__wave enhanced" aria-hidden="true"></span>
        </a>
      `;
    }).join('');

    const enhancedMobileItems = NAV_ITEMS.map(item => {
      const isActive = currentPage === item.id;
      const badge = item.badgeKey ? BadgeProvider.resolve(item.badgeKey) : null;

      return `
        <a href="${item.href}"
           class="mobile-nav-link enhanced${isActive ? ' active' : ''}"
           ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
           ${isActive ? 'aria-current="page"' : ''}>
          <div class="mobile-nav-link__icon enhanced">
            <i class="fas ${item.icon}" aria-hidden="true"></i>
            ${badge ? `<span class="mobile-badge ${toneToClass(badge.tone || 'primary')} ${badge.pulse ? 'badge--pulse' : ''}">${badge.text}</span>` : ''}
          </div>
          <span class="mobile-nav-link__text">${item.text}</span>
          <i class="fas fa-chevron-right mobile-nav-link__chevron" aria-hidden="true"></i>
        </a>
      `;
    }).join('');

    const headerHTML = `
      <a class="skip-link sr-only-focusable" href="#main">Skip to content</a>

      <header class="app-header app-header--rccl enhanced" role="banner" data-page="${currentPage}">
        <div class="header-waves enhanced" aria-hidden="true">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
        </div>
        
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo logo--rccl enhanced" aria-label="Go to dashboard">
              <div class="logo-icon enhanced" aria-hidden="true">
                <i class="fas fa-ship" aria-hidden="true"></i>
                <div class="logo-icon__wave enhanced"></div>
              </div>
              <div class="logo-text-container">
                <div class="logo-text">${escapeHtml(meta.brand)}</div>
                <div class="logo-subtext">
                  <i class="fas fa-anchor" aria-hidden="true"></i>
                  <span>${escapeHtml(meta.ship)}</span>
                  <span class="logo-separator">•</span>
                  <span>${escapeHtml(meta.sailing)}</span>
                </div>
              </div>
            </a>

            <nav class="nav-desktop" aria-label="Main navigation">
              <div class="nav-desktop__links">
                ${enhancedNavItems}
              </div>

              <div class="nav-desktop__actions">
                <button class="theme-toggle theme-toggle--rccl enhanced" id="themeToggle" type="button" aria-label="Toggle theme">
                  <span class="theme-toggle__icons enhanced" aria-hidden="true">
                    <i class="fas fa-sun"></i>
                    <i class="fas fa-moon"></i>
                    <i class="fas fa-desktop"></i>
                  </span>
                  <span class="toggle-track enhanced" aria-hidden="true"></span>
                </button>

                <div class="user-menu user-menu--rccl enhanced">
                  <button class="user-menu-toggle enhanced" type="button" aria-label="User menu" aria-expanded="false">
                    <div class="user-avatar enhanced">
                      <i class="fas fa-user" aria-hidden="true"></i>
                    </div>
                    <span class="user-name">Guest</span>
                    <i class="fas fa-chevron-down user-menu__chevron" aria-hidden="true"></i>
                  </button>
                  <div class="user-dropdown enhanced" role="menu" aria-label="User menu options">
                    <div class="user-dropdown__header">
                      <div class="user-dropdown__avatar enhanced">
                        <i class="fas fa-user-circle" aria-hidden="true"></i>
                      </div>
                      <div>
                        <strong>Guest</strong>
                        <span>Welcome aboard!</span>
                      </div>
                    </div>
                    <div class="dropdown-divider" role="separator"></div>
                    <a href="profile.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-user" aria-hidden="true"></i> My Profile
                    </a>
                    <a href="settings.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-cog" aria-hidden="true"></i> Settings
                    </a>
                    <a href="help.html" class="dropdown-item" role="menuitem">
                      <i class="fas fa-question-circle" aria-hidden="true"></i> Help Center
                    </a>
                    <div class="dropdown-divider" role="separator"></div>
                    <button class="dropdown-item dropdown-item--signout" role="menuitem" type="button">
                      <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            ${meta.showMenuToggle ? `
              <button class="mobile-menu-toggle mobile-menu-toggle--rccl" type="button"
                      aria-label="Open navigation menu"
                      aria-expanded="false"
                      aria-controls="navMobile">
                <span class="hamburger-box" aria-hidden="true">
                  <span class="hamburger-line enhanced"></span>
                  <span class="hamburger-line enhanced"></span>
                  <span class="hamburger-line enhanced"></span>
                </span>
              </button>
            ` : ''}
          </div>

          ${meta.showMenuToggle ? `
            <div class="nav-mobile-overlay" data-action="close-mobile" hidden></div>

            <nav class="nav-mobile nav-mobile--rccl enhanced" id="navMobile" aria-label="Mobile navigation" hidden>
              <div class="nav-mobile__header">
                <div class="mobile-nav-header">
                  <div class="mobile-nav-title">
                    <span class="mobile-nav-title__eyebrow">${escapeHtml(meta.port)}</span>
                    <strong class="mobile-nav-title__main">Welcome Aboard</strong>
                  </div>
                  <div class="mobile-nav-header__actions">
                    <button class="theme-toggle-mobile theme-toggle-mobile--rccl" id="themeToggleMobile" type="button" aria-label="Toggle theme">
                      <i class="fas fa-adjust" aria-hidden="true"></i>
                    </button>
                    <button class="mobile-nav-close" type="button" data-action="close-mobile" aria-label="Close menu">
                      <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
                <div class="mobile-nav-ship-info">
                  <i class="fas fa-ship" aria-hidden="true"></i>
                  <span>${escapeHtml(meta.ship)} • ${escapeHtml(meta.sailing)}</span>
                </div>
              </div>

              <div class="mobile-nav-links">
                ${enhancedMobileItems}
              </div>

              <div class="nav-mobile__footer">
                <div class="mobile-nav-shortcuts" aria-label="Shortcuts">
                  <button type="button" class="chip chip--rccl enhanced" data-action="go" data-href="operations.html">
                    <i class="fas fa-clipboard-check" aria-hidden="true"></i> Checklist
                  </button>
                  <button type="button" class="chip chip--rccl enhanced" data-action="go" data-href="itinerary.html">
                    <i class="fas fa-route" aria-hidden="true"></i> Itinerary
                  </button>
                  <button type="button" class="chip chip--rccl enhanced" data-action="go" data-href="dining.html">
                    <i class="fas fa-utensils" aria-hidden="true"></i> Dining
                  </button>
                </div>
                <div class="mobile-nav-footer-legal">
                  <span>© ${DEFAULT_META.year} Royal Caribbean</span>
                  <span class="legal-separator">•</span>
                  <a href="privacy.html">Privacy</a>
                </div>
              </div>
            </nav>
          ` : ''}
        </div>

        ${meta.showProgress ? `
          <div class="header-progress header-progress--rccl enhanced" role="progressbar" aria-label="Scroll progress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" aria-hidden="true">
              <div class="progress-wave shimmer-effect"></div>
            </div>
          </div>
        ` : ''}
      </header>
    `;

    headerMount.outerHTML = headerHTML;
  }

  function renderEnhancedFooter() {
    let footerMount = utils.qs('#sharedFooter') || utils.qs('.app-footer');
    if (!footerMount) {
      footerMount = document.createElement('div');
      footerMount.id = 'sharedFooter';
      const main = utils.qs('main');
      if (main && main.parentNode) {
        main.insertAdjacentElement('afterend', footerMount);
      } else {
        document.body.appendChild(footerMount);
      }
    }

    const nextPort = (() => {
      const raw = localStorage.getItem('cruise-nextport');
      const parsed = raw ? utils.safeJsonParse(raw, null) : null;
      if (parsed?.name) return parsed;
      return { name: 'Perfect Day at CocoCay', time: '7:00 AM' };
    })();

    const sectionsHTML = FOOTER_SECTIONS.map(section => `
      <div class="footer-section">
        <h4 class="footer-subtitle">
          <i class="fas fa-compass" aria-hidden="true"></i>
          ${escapeHtml(section.title)}
        </h4>
        <div class="footer-links">
          ${section.links.map(link => `
            <a href="${link.href}" class="footer-link">
              <div class="footer-link__icon">
                <i class="fas ${link.icon}" aria-hidden="true"></i>
              </div>
              <span>${escapeHtml(link.text)}</span>
              <i class="fas fa-chevron-right footer-link__chevron" aria-hidden="true"></i>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    const quickActionsHTML = FOOTER_QUICK_ACTIONS.map(action => {
      const badgeFromStorage = action.badgeKey ? BadgeProvider.resolve(action.badgeKey) : null;
      const subtitle = badgeFromStorage?.text
        ? `${action.subtitle} • ${badgeFromStorage.text} ${action.badgeKey === 'checklist' ? 'remaining' : 'saved'}`
        : action.subtitle;

      const badgeHTML = badgeFromStorage?.text ? `
        <span class="footer-action-badge enhanced ${toneToClass(badgeFromStorage.tone)}">
          ${badgeFromStorage.text}
        </span>
      ` : '';

      return `
        <a class="footer-action-card footer-action-card--rccl enhanced" href="${action.href}">
          <div class="footer-action-card__content">
            <div class="footer-action-card__header">
              <div class="footer-action-icon enhanced" aria-hidden="true">
                <i class="fas ${action.icon}"></i>
              </div>
              ${badgeHTML}
            </div>
            <div class="footer-action-card__body">
              <h4>${escapeHtml(action.title)}</h4>
              <p>${escapeHtml(subtitle)}</p>
            </div>
            <div class="footer-action-card__footer">
              <span class="footer-action-cta">
                ${escapeHtml(action.cta)}
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </span>
            </div>
          </div>
          <div class="footer-action-card__wave enhanced" aria-hidden="true"></div>
        </a>
      `;
    }).join('');

    const year = DEFAULT_META.year;

    const footerHTML = `
      <footer class="app-footer app-footer--rccl enhanced" role="contentinfo">
        <div class="footer-waves enhanced" aria-hidden="true">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
        </div>
        
        <div class="container">
          <div class="footer-hero">
            <div class="footer-hero__intro">
              <div class="footer-hero__badge">
                <i class="fas fa-anchor" aria-hidden="true"></i>
                <span>Onboard Guide</span>
              </div>
              <h3>Plan Clean. Sail Calmer.</h3>
              <p>Your complete digital cruise companion — everything you need in one elegant, intuitive place.</p>
            </div>

            <div class="footer-hero__actions">
              <a class="btn btn--primary btn--rccl enhanced btn--icon" href="operations.html">
                <i class="fas fa-clipboard-check" aria-hidden="true"></i>
                Finish Checklist
              </a>
              <a class="btn btn--secondary btn--rccl enhanced btn--icon" href="itinerary.html">
                <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                View Itinerary
              </a>
            </div>

            <div class="footer-hero__cards">
              ${quickActionsHTML}
            </div>
          </div>

          <div class="footer-grid">
            ${sectionsHTML}

            <div class="footer-section footer-newsletter footer-newsletter--rccl">
              <div class="footer-newsletter__header">
                <h4 class="footer-subtitle">
                  <i class="fas fa-bell" aria-hidden="true"></i>
                  Stay Updated
                </h4>
                <div class="footer-newsletter__icon">
                  <i class="fas fa-paper-plane" aria-hidden="true"></i>
                </div>
              </div>
              <p class="footer-text">Get alerts for port updates, weather changes, and special offers.</p>

              <form class="newsletter-form newsletter-form--rccl" aria-label="Newsletter signup">
                <div class="input-group">
                  <input type="email" placeholder="Enter your email" aria-label="Email address" class="newsletter-input" autocomplete="email" inputmode="email">
                  <button type="submit" class="newsletter-button enhanced" aria-label="Subscribe">
                    <i class="fas fa-paper-plane" aria-hidden="true"></i>
                  </button>
                </div>
                <p class="newsletter-note">No spam. Just useful updates.</p>
              </form>

              <div class="footer-support" aria-label="Support">
                <div class="footer-support__item footer-support__item--rccl">
                  <div class="footer-support__icon">
                    <i class="fas fa-headset" aria-hidden="true"></i>
                  </div>
                  <div class="footer-support__content">
                    <strong>Guest Services</strong>
                    <span>24/7 onboard support</span>
                  </div>
                </div>

                <div class="footer-support__item footer-support__item--rccl">
                  <div class="footer-support__icon">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  </div>
                  <div class="footer-support__content">
                    <strong>Next Port</strong>
                    <span>${escapeHtml(nextPort.name)} • ${escapeHtml(nextPort.time || '')}</span>
                  </div>
                </div>
              </div>

              <div class="footer-social">
                <span>Follow the journey:</span>
                <div class="social-links">
                  <a href="#" class="social-link" aria-label="Facebook">
                    <i class="fab fa-facebook-f" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Instagram">
                    <i class="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Twitter">
                    <i class="fab fa-twitter" aria-hidden="true"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="YouTube">
                    <i class="fab fa-youtube" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom footer-bottom--rccl">
            <div class="footer-bottom__content">
              <div class="footer-copyright">
                <i class="fas fa-ship" aria-hidden="true"></i>
                <span>© ${year} Royal Caribbean International. All rights reserved.</span>
              </div>
              <div class="footer-legal">
                <a href="privacy.html">Privacy Policy</a>
                <span class="legal-separator">•</span>
                <a href="terms.html">Terms of Service</a>
                <span class="legal-separator">•</span>
                <a href="accessibility.html">Accessibility</a>
                <span class="legal-separator">•</span>
                <a href="cookies.html">Cookies</a>
              </div>
            </div>

            <button class="back-to-top back-to-top--rccl enhanced" type="button" aria-label="Scroll to top">
              <i class="fas fa-chevron-up" aria-hidden="true"></i>
              <span class="back-to-top__text">Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
    `;

    footerMount.outerHTML = footerHTML;
  }

  function initEnhancedInteractions() {
    utils.qsa('.nav-link.enhanced').forEach(link => {
      on(link, 'mouseenter', () => link.classList.add('hovering'));
      on(link, 'mouseleave', () => link.classList.remove('hovering'));
    });

    utils.qsa('.btn--rccl.enhanced').forEach((button) => {
      on(button, 'click', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.35)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ---------------------------
  // Interactions (enhanced)
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

      // Animate in
      nav.style.transform = 'translateX(0)';
      if (overlay) overlay.style.opacity = '1';

      // Focus management
      const firstLink = utils.qs('.nav-mobile a, .nav-mobile button', nav);
      if (firstLink) firstLink.focus({ preventScroll: true });

      releaseTrap = utils.trapFocus(nav, true);
    }

    function closeMobile() {
      if (!toggle || !nav) return;
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');

      // Animate out
      nav.style.transform = 'translateX(100%)';
      if (overlay) overlay.style.opacity = '0';

      setTimeout(() => {
        nav.hidden = true;
        overlay && (overlay.hidden = true);
      }, 300);

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
    const userDropdown = utils.qs('.user-dropdown');
    
    on(userToggle, 'click', (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute('aria-expanded') === 'true';
      userToggle.setAttribute('aria-expanded', String(!expanded));
      if (userDropdown) {
        userDropdown.classList.toggle('visible', !expanded);
      }
    });
    
    on(document, 'click', () => {
      if (userToggle) {
        userToggle.setAttribute('aria-expanded', 'false');
        if (userDropdown) userDropdown.classList.remove('visible');
      }
    });

    // Sign out button in dropdown
    const signOutBtn = utils.qs('.dropdown-item--signout');
    on(signOutBtn, 'click', () => {
      utils.announce('Signed out successfully');
      // Add your sign-out logic here
    });

    // Desktop tooltips with enhanced styling
    if (!utils.isMobile()) {
      let tipEl = null;
      let tipT = null;

      const showTip = (link) => {
        const text = link?.dataset?.tooltip;
        if (!text) return;
        tipEl = document.createElement('div');
        tipEl.className = 'nav-tooltip nav-tooltip--rccl';
        tipEl.textContent = text;
        document.body.appendChild(tipEl);

        const r = link.getBoundingClientRect();
        tipEl.style.left = `${r.left + r.width / 2}px`;
        tipEl.style.top = `${r.bottom + 10}px`;
        tipEl.style.transform = 'translateX(-50%)';
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.className = 'nav-tooltip__arrow';
        tipEl.appendChild(arrow);
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
    const waves = utils.qs('.header-waves');

    if (!header) return () => {};

    const update = () => {
      const y = window.scrollY || 0;

      // Header scroll effect
      if (y > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Progress bar
      if (progressBar) {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const p = utils.clamp(y / max, 0, 1);
        progressBar.style.transform = `scaleX(${p})`;
        
        // Animate progress wave
        const wave = utils.qs('.progress-wave', progressBar);
        if (wave) {
          wave.style.transform = `translateX(${p * 100}%)`;
        }
      }

      // Wave animation
      if (waves && !utils.prefersReducedMotion()) {
        const wave1 = utils.qs('.wave-1', waves);
        const wave2 = utils.qs('.wave-2', waves);
        if (wave1 && wave2) {
          wave1.style.transform = `translateX(${y * 0.2}px)`;
          wave2.style.transform = `translateX(${y * 0.1}px)`;
        }
      }

      // Hero parallax
      if (hero && !utils.prefersReducedMotion()) {
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

    return () => {};
  }

  function initFooterInteractions() {
    // Newsletter form
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
      
      // Visual feedback
      const submitBtn = utils.qs('.newsletter-button', form);
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
        submitBtn.classList.add('success');
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i>';
          submitBtn.classList.remove('success');
        }, 2000);
      }
      
      input.value = '';
      utils.announce('Subscribed! You\'ll receive updates via email.');
    });

    // Back to top button
    const btn = utils.qs('.back-to-top');
    const updateVis = utils.debounce(() => {
      if (!btn) return;
      const scrolled = (window.scrollY || 0) > 500;
      btn.classList.toggle('visible', scrolled);
      
      // Update aria-label
      if (scrolled) {
        btn.setAttribute('aria-label', 'Scroll to top of page');
      }
    }, 80);

    on(btn, 'click', () => {
      window.scrollTo({ 
        top: 0, 
        behavior: utils.prefersReducedMotion() ? 'auto' : 'smooth' 
      });
      utils.announce('Returned to top of page');
    });

    updateVis();
    on(window, 'scroll', updateVis, { passive: true });

    // Social link hover effects
    utils.qsa('.social-link').forEach(link => {
      on(link, 'mouseenter', () => {
        link.classList.add('hover');
      });
      on(link, 'mouseleave', () => {
        link.classList.remove('hover');
      });
    });
  }

  function initKeyboardShortcuts() {
    on(document, 'keydown', (e) => {
      // Alt+1..7 = nav shortcuts
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key, 10) - 1;
        if (NAV_ITEMS[idx]) {
          e.preventDefault();
          window.location.href = NAV_ITEMS[idx].href;
        }
      }
      
      // T = Toggle theme
      if (e.key === 't' && (e.altKey || e.metaKey)) {
        e.preventDefault();
        ThemeManager.toggle();
      }
      
      // M = Toggle mobile menu
      if (e.key === 'm' && (e.altKey || e.metaKey)) {
        const toggle = utils.qs('.mobile-menu-toggle');
        if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
          toggle.click();
        }
      }
    });
  }

  function initPageTransitions(enabled) {
    if (!enabled) return;
    if (utils.prefersReducedMotion()) return;

    document.documentElement.classList.add('page-transitions');

    on(document, 'click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      if (!href.includes('.html')) return;
      if (a.target === '_blank') return;
      if (a.hasAttribute('download')) return;

      e.preventDefault();
      
      // Add ocean wave transition effect
      document.body.classList.add('page-exiting', 'page-exiting--rccl');
      
      setTimeout(() => { 
        window.location.href = href; 
      }, 400);
    });
  }

  // ---------------------------
  // CSS Injection for RCCL styling
  // ---------------------------
  function injectRCClStyles() {
    const styleId = 'rccl-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      /* RCCL Wave Animations */
      .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, transparent, var(--rccl-accent, ${RCCL_COLORS.accent}), transparent);
        opacity: 0.6;
      }
      
      .wave-1 {
        animation: waveFlow 8s ease-in-out infinite;
      }
      
      .wave-2 {
        height: 2px;
        animation: waveFlow 12s ease-in-out infinite reverse;
        opacity: 0.4;
      }
      
      @keyframes waveFlow {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(20px); }
      }
      
      /* RCCL Badge Styles */
      .badge--primary {
        background: var(--rccl-primary, ${RCCL_COLORS.primary});
        color: white;
        border: 2px solid var(--rccl-primary, ${RCCL_COLORS.primary});
      }
      
      .badge--accent {
        background: var(--rccl-accent, ${RCCL_COLORS.accent});
        color: white;
        border: 2px solid var(--rccl-accent, ${RCCL_COLORS.accent});
      }
      
      .badge--success {
        background: var(--rccl-success, ${RCCL_COLORS.success});
        color: white;
        border: 2px solid var(--rccl-success, ${RCCL_COLORS.success});
      }
      
      .badge--warning {
        background: var(--rccl-warning, ${RCCL_COLORS.warning});
        color: var(--rccl-dark, ${RCCL_COLORS.dark});
        border: 2px solid var(--rccl-warning, ${RCCL_COLORS.warning});
      }
      
      .badge--pulse {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(var(--rccl-warning-rgb, 255, 193, 7), 0.7); }
        70% { box-shadow: 0 0 0 6px rgba(var(--rccl-warning-rgb, 255, 193, 7), 0); }
        100% { box-shadow: 0 0 0 0 rgba(var(--rccl-warning-rgb, 255, 193, 7), 0); }
      }
      
      /* RCCL Button Styles */
      .btn--rccl {
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      
      .btn--rccl:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }
      
      .btn--rccl:hover:before {
        left: 100%;
      }
      
      .btn--primary.btn--rccl {
        background: linear-gradient(135deg, var(--rccl-primary, ${RCCL_COLORS.primary}), var(--rccl-accent, ${RCCL_COLORS.accent}));
        border: none;
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb, 0, 82, 165), 0.2);
      }
      
      /* RCCL Card Styles */
      .footer-action-card--rccl {
        border-radius: 12px;
        background: var(--rccl-surface, white);
        border: 1px solid var(--rccl-border, #dee2e6);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .footer-action-card--rccl:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        border-color: var(--rccl-accent, ${RCCL_COLORS.accent});
      }
      
      .footer-action-card__wave {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--rccl-accent, ${RCCL_COLORS.accent}), var(--rccl-primary, ${RCCL_COLORS.primary}));
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }
      
      .footer-action-card--rccl:hover .footer-action-card__wave {
        transform: scaleX(1);
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .badge--pulse,
        .btn--rccl:before,
        .wave-1,
        .wave-2,
        .footer-action-card--rccl,
        .footer-action-card__wave {
          animation: none;
          transition: none;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // ---------------------------
  // Escape helper
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
  // Refresh badges
  // ---------------------------
  function refreshBadgesInDOM() {
    // desktop badges
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
      
      badgeEl.className = `nav-badge ${toneToClass(badge.tone || 'primary')} ${badge.pulse ? 'badge--pulse' : ''}`;
      badgeEl.textContent = badge.text;
      badgeEl.setAttribute('aria-label', `${badge.text} ${label}`);
    });

    // mobile badges
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
      
      badgeEl.className = `mobile-badge ${toneToClass(badge.tone || 'primary')} ${badge.pulse ? 'badge--pulse' : ''}`;
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

  function upgradeUI() {
    init({ enhanced: true });
  }

  function init({ enhanced = true } = {}) {
    cleanup();

    injectRCClStyles();
    if (enhanced) {
      injectEnhancedStyles();
      injectRippleStyles();
    }
    ThemeManager.init();
    if (enhanced) {
      renderEnhancedHeader();
      renderEnhancedFooter();
    } else {
      renderHeader();
      renderFooter();
    }
    renderBottomNav();

    initHeaderInteractions();
    initFooterInteractions();
    initHeroObserver();
    initKeyboardShortcuts();
    if (enhanced) initEnhancedInteractions();

    const headerMount = utils.qs('.app-header');
    const transitionsEnabled = document.body?.dataset?.transitions === 'true';
    initPageTransitions(transitionsEnabled);

    ThemeManager.syncToggleUI();
    refreshBadgesInDOM();

    // Auto-refresh on storage updates
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'cruise-checklist' || e.key === 'cruise-dining') refreshBadgesInDOM();
      if (e.key === ThemeManager.key) ThemeManager.apply(localStorage.getItem(ThemeManager.key) || 'system', { silent: true });
    };
    on(window, 'storage', onStorage);

    // Expose API
    window.SharedLayout = {
      utils,
      ThemeManager,
      NAV_ITEMS,
      FOOTER_SECTIONS,
      RCCL_COLORS,
      renderBottomNav: () => renderBottomNav(),
      refresh: () => init({ enhanced: true }),
      refreshBadges: () => refreshBadgesInDOM(),
      destroy: () => cleanup(),
      upgradeUI: () => upgradeUI(),
      renderEnhancedHeader,
      renderEnhancedFooter,
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
