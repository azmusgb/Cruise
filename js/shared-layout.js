/* ============================================================================
 * Shared Layout (RCCL Premium) — Complete Enhanced Version
 * ============================================================================
 * Updated to support:
 * - data-menu-toggle="false" attribute
 * - enhanced class integration
 * - Countdown elements support
 * - CSS compatibility with existing styles
 * - Proper mobile navigation handling
 * ========================================================================== */
(function renderSharedLayoutRCCL() {
  'use strict';

  // ---------------------------
  // Error Boundary & Safe Operations
  // ---------------------------
  function safeMount(selector, renderFn, fallbackHTML = '<div class="layout-error">Layout component failed to load</div>') {
    try {
      const mount = selector ? document.querySelector(selector) : null;
      if (!mount) return null;
      return renderFn(mount);
    } catch (error) {
      console.error(`Failed to render ${selector}:`, error);
      const mount = selector ? document.querySelector(selector) : null;
      if (mount) {
        mount.innerHTML = fallbackHTML;
      }
      return null;
    }
  }

  function sanitizeHref(href) {
    const trimmed = String(href || '').trim();
    // Prevent javascript: and data: URLs
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return '#';
    }
    return trimmed;
  }

  // ---------------------------
  // Configuration
  // ---------------------------
  const DEFAULT_META = {
    brand: 'Royal Caribbean International',
    ship: 'Adventure of the Seas',
    shipClass: 'Voyager Class • 138,193 GT • 3,114 Guests',
    sailing: 'Feb 14–20, 2026',
    port: 'Port Canaveral',
    daysAtSea: '6 Nights',
    registry: 'The Bahamas',
    tagline: 'Experience WOW',
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
    { title: 'Today\'s Itinerary', subtitle: 'Plan activities & showtimes', icon: 'fa-calendar-check', href: 'itinerary.html', cta: 'Build schedule' },
    { title: 'Dining Reservations', subtitle: 'Lock in your dining times', icon: 'fa-utensils', href: 'dining.html', cta: 'Reserve now', badgeKey: 'dining' },
  ];

  // RCCL-inspired color palette
  const RCCL_COLORS = {
    primary: '#0052a5',
    primaryRgb: '0, 82, 165',
    secondary: '#ffb400',
    secondaryRgb: '255, 180, 0',
    accent: '#00a8e8',
    accentRgb: '0, 168, 232',
    success: '#28a745',
    successRgb: '40, 167, 69',
    warning: '#ffc107',
    warningRgb: '255, 193, 7',
    danger: '#dc3545',
    dangerRgb: '220, 53, 69',
    dark: '#1a1a2e',
    darkRgb: '26, 26, 46',
    light: '#f8f9fa',
    lightRgb: '248, 249, 250',
    gray: '#6c757d',
    grayRgb: '108, 117, 125',
  };

  // ---------------------------
  // Capabilities Detection
  // ---------------------------
  const capabilities = {
    hasIntersectionObserver: 'IntersectionObserver' in window,
    hasResizeObserver: 'ResizeObserver' in window,
    hasHover: window.matchMedia && window.matchMedia('(hover: hover)').matches,
    hasReducedMotion: () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hasContrast: window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches,
  };

  // ---------------------------
  // Utilities
  // ---------------------------
  const utils = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    clamp: (n, min, max) => Math.min(Math.max(n, min), max),
    isMobile: () => window.matchMedia && window.matchMedia('(max-width: 768px)').matches,
    prefersReducedMotion: () => capabilities.hasReducedMotion ? capabilities.hasReducedMotion().matches : false,
    prefersContrast: () => capabilities.hasContrast ? capabilities.hasContrast().matches : false,
    debounce(fn, wait = 100) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    },
    throttle(fn, limit = 100) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          fn.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    createElement(html) {
      const tpl = document.createElement('template');
      tpl.innerHTML = String(html).trim();
      return tpl.content.firstElementChild;
    },
    safeJsonParse(value, fallback) {
      try { 
        return JSON.parse(value); 
      } catch { 
        return fallback; 
      }
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
      document.body.style.paddingRight = locked ? `${this.getScrollbarWidth()}px` : '';
    },
    getScrollbarWidth() {
      return window.innerWidth - document.documentElement.clientWidth;
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

      if (active) {
        container.addEventListener('keydown', handleKeydown);
      }
      return () => container.removeEventListener('keydown', handleKeydown);
    },
    getScrollPosition() {
      return window.pageYOffset || document.documentElement.scrollTop;
    },
    isInViewport(el, offset = 0) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
        rect.bottom >= offset
      );
    },
    // Countdown utility for dashboard
    updateCountdown() {
      const targetDate = new Date('February 14, 2026 15:00:00').getTime();
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        // Countdown finished
        utils.qsa('.countdown__value, .countdown-display__value').forEach(el => {
          el.textContent = '00';
        });
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      // Update main hero countdown
      const daysEl = document.getElementById('countdown-days');
      const hoursEl = document.getElementById('countdown-hours');
      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      
      // Update sidebar countdown
      const sidebarDays = document.getElementById('sidebar-countdown-days');
      const sidebarHours = document.getElementById('sidebar-countdown-hours');
      if (sidebarDays) sidebarDays.textContent = days.toString().padStart(2, '0');
      if (sidebarHours) sidebarHours.textContent = hours.toString().padStart(2, '0');
    },
  };

  // ---------------------------
  // Centralized State Management
  // ---------------------------
  const CruiseState = {
    listeners: new Set(),
    cache: new Map(),
    
    get(key, fallback) {
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      const value = utils.safeJsonParse(localStorage.getItem(key), fallback);
      this.cache.set(key, value);
      return value;
    },
    
    set(key, value) {
      const oldValue = this.get(key);
      if (JSON.stringify(oldValue) === JSON.stringify(value)) {
        return; // No change
      }
      localStorage.setItem(key, JSON.stringify(value));
      this.cache.set(key, value);
      this.notify(key, value);
    },
    
    notify(key, value) {
      this.listeners.forEach(fn => {
        try {
          fn(key, value);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    },
    
    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    },
    
    unsubscribe(fn) {
      this.listeners.delete(fn);
    },
    
    clearCache() {
      this.cache.clear();
    }
  };

  // ---------------------------
  // Theme Manager (Enhanced)
  // ---------------------------
  const ThemeManager = {
    key: 'cruise-theme',
    current: 'system',
    media: null,

    init() {
      this.media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
      const saved = CruiseState.get(this.key, 'system');
      this.apply(saved, { silent: true });

      if (this.media && this.media.addEventListener) {
        this.media.addEventListener('change', () => {
          if (this.current === 'system') {
            this.apply('system', { silent: true });
          }
        });
      }
      
      // Subscribe to storage changes
      CruiseState.subscribe((key, value) => {
        if (key === this.key) {
          this.apply(value, { silent: true });
        }
      });
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
      CruiseState.set(this.key, normalized);

      const resolved = this.resolve(normalized);
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.setAttribute('data-theme-mode', normalized);

      // Update meta theme-color for mobile browsers
      const themeColor = resolved === 'dark' ? RCCL_COLORS.dark : RCCL_COLORS.primary;
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
      }

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
        bgRgb: RCCL_COLORS.darkRgb,
        surface: '#2d3047',
        surfaceRgb: '45, 48, 71',
        text: '#f8f9fa',
        textRgb: RCCL_COLORS.lightRgb,
        border: '#404258',
        borderRgb: '64, 66, 88',
        primary: RCCL_COLORS.accent,
        primaryRgb: RCCL_COLORS.accentRgb,
        secondary: RCCL_COLORS.secondary,
        secondaryRgb: RCCL_COLORS.secondaryRgb,
      } : {
        bg: RCCL_COLORS.light,
        bgRgb: RCCL_COLORS.lightRgb,
        surface: '#ffffff',
        surfaceRgb: '255, 255, 255',
        text: RCCL_COLORS.dark,
        textRgb: RCCL_COLORS.darkRgb,
        border: '#dee2e6',
        borderRgb: '222, 226, 230',
        primary: RCCL_COLORS.primary,
        primaryRgb: RCCL_COLORS.primaryRgb,
        secondary: RCCL_COLORS.secondary,
        secondaryRgb: RCCL_COLORS.secondaryRgb,
      };

      styleEl.textContent = `
        :root {
          --rccl-bg: ${colors.bg};
          --rccl-bg-rgb: ${colors.bgRgb};
          --rccl-surface: ${colors.surface};
          --rccl-surface-rgb: ${colors.surfaceRgb};
          --rccl-text: ${colors.text};
          --rccl-text-rgb: ${colors.textRgb};
          --rccl-border: ${colors.border};
          --rccl-border-rgb: ${colors.borderRgb};
          --rccl-primary: ${colors.primary};
          --rccl-primary-rgb: ${colors.primaryRgb};
          --rccl-secondary: ${colors.secondary};
          --rccl-secondary-rgb: ${colors.secondaryRgb};
          --rccl-accent: ${RCCL_COLORS.accent};
          --rccl-accent-rgb: ${RCCL_COLORS.accentRgb};
          --rccl-success: ${RCCL_COLORS.success};
          --rccl-success-rgb: ${RCCL_COLORS.successRgb};
          --rccl-warning: ${RCCL_COLORS.warning};
          --rccl-warning-rgb: ${RCCL_COLORS.warningRgb};
          --rccl-danger: ${RCCL_COLORS.danger};
          --rccl-danger-rgb: ${RCCL_COLORS.dangerRgb};
          
          /* Semantic tokens */
          --rccl-spacing-unit: 8px;
          --rccl-spacing-xs: calc(var(--rccl-spacing-unit) * 0.5);
          --rccl-spacing-sm: calc(var(--rccl-spacing-unit) * 1);
          --rccl-spacing-md: calc(var(--rccl-spacing-unit) * 2);
          --rccl-spacing-lg: calc(var(--rccl-spacing-unit) * 3);
          --rccl-spacing-xl: calc(var(--rccl-spacing-unit) * 4);
          
          --rccl-border-radius-sm: 4px;
          --rccl-border-radius-md: 8px;
          --rccl-border-radius-lg: 12px;
          --rccl-border-radius-xl: 16px;
          --rccl-border-radius-full: 9999px;
          
          --rccl-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
          --rccl-transition-duration: 0.3s;
          --rccl-transition-duration-slow: 0.5s;
          
          --rccl-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --rccl-font-size-xs: 0.75rem;
          --rccl-font-size-sm: 0.875rem;
          --rccl-font-size-base: 1rem;
          --rccl-font-size-lg: 1.125rem;
          --rccl-font-size-xl: 1.25rem;
          --rccl-font-size-2xl: 1.5rem;
          
          --rccl-shadow-sm: 0 2px 8px rgba(var(--rccl-primary-rgb), 0.08);
          --rccl-shadow-md: 0 4px 20px rgba(var(--rccl-primary-rgb), 0.12);
          --rccl-shadow-lg: 0 8px 32px rgba(var(--rccl-primary-rgb), 0.16);
          --rccl-shadow-xl: 0 12px 48px rgba(var(--rccl-primary-rgb), 0.2);
          
          --rccl-gradient-primary: linear-gradient(135deg, var(--rccl-primary) 0%, var(--rccl-accent) 100%);
          --rccl-gradient-secondary: linear-gradient(135deg, var(--rccl-secondary) 0%, #e6a200 100%);
          --rccl-gradient-surface: linear-gradient(180deg, rgba(var(--rccl-surface-rgb), 0.95) 0%, rgba(var(--rccl-surface-rgb), 0.85) 100%);
        }
        
        ${utils.prefersContrast() ? `
          :root {
            --rccl-primary: ${theme === 'dark' ? '#4dabf7' : '#1864ab'};
            --rccl-accent: ${theme === 'dark' ? '#74c0fc' : '#1c7ed6'};
            --rccl-border: ${theme === 'dark' ? '#5c5f77' : '#adb5bd'};
          }
        ` : ''}
        
        /* Enhanced button styles for your HTML */
        .btn.enhanced {
          position: relative;
          overflow: hidden;
        }
        
        .btn.enhanced::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1, 1) translate(-50%);
          transform-origin: 50% 50%;
        }
        
        .btn.enhanced:focus:not(:active)::after {
          animation: ripple 1s ease-out;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
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
        mobile.setAttribute('aria-label', `Theme: ${label}. Activate to change.`);
        mobile.setAttribute('data-resolved', resolved);
        mobile.setAttribute('data-mode', this.current);
      }
    },
  };

  // ---------------------------
  // Badge Providers (Enhanced)
  // ---------------------------
  const BadgeProvider = {
    cache: new Map(),
    
    getChecklistBadge() {
      const cacheKey = 'checklist-badge';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      const data = CruiseState.get('cruise-checklist', null);
      const items = Array.isArray(data?.items) ? data.items : [];
      const remaining = items.filter(i => !i?.done).length;
      
      let badge = null;
      if (!remaining) {
        badge = { text: '✓', tone: 'success', ariaLabel: 'All checklist items complete' };
      } else {
        const priorityRemaining = items.filter(i => !i?.done && (i?.priority === 'high' || i?.priority === 'urgent')).length;
        badge = { 
          text: String(remaining), 
          tone: priorityRemaining ? 'warning' : 'info',
          pulse: priorityRemaining > 0,
          ariaLabel: `${remaining} checklist items remaining${priorityRemaining ? `, ${priorityRemaining} are high priority` : ''}`
        };
      }
      
      this.cache.set(cacheKey, badge);
      return badge;
    },

    getDiningBadge() {
      const cacheKey = 'dining-badge';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      const data = CruiseState.get('cruise-dining', null);
      const pending = Number.isFinite(data?.pending) ? data.pending : null;
      
      let badge = null;
      if (pending === null) {
        const reservations = Array.isArray(data?.reservations) ? data.reservations : [];
        if (!reservations.length) return null;
        badge = { text: String(reservations.length), tone: 'info', ariaLabel: `${reservations.length} dining reservations` };
      } else if (pending <= 0) {
        badge = { text: '✓', tone: 'success', ariaLabel: 'All dining confirmed' };
      } else {
        badge = { text: String(pending), tone: 'warning', pulse: pending > 0, ariaLabel: `${pending} dining reservations pending` };
      }
      
      this.cache.set(cacheKey, badge);
      return badge;
    },

    resolve(key) {
      if (key === 'checklist') return this.getChecklistBadge();
      if (key === 'dining') return this.getDiningBadge();
      return null;
    },
    
    clearCache() {
      this.cache.clear();
    },
    
    refresh() {
      this.clearCache();
    }
  };

  function resolveNextPort() {
    const raw = localStorage.getItem('cruise-nextport');
    const parsed = raw ? utils.safeJsonParse(raw, null) : null;
    if (parsed && typeof parsed === 'object' && parsed.name) return parsed;
    return { name: 'Perfect Day at CocoCay', time: '7:00 AM' };
  }

  // ---------------------------
  // Rendering Helpers
  // ---------------------------
  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

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
    const badgeAriaLabel = badgeFromStorage?.ariaLabel ?? `${badgeText} ${item.text}`;

    const badgeHTML = badgeText
      ? `<span class="nav-badge ${toneToClass(badgeTone)} ${pulseClass}" 
                aria-label="${escapeHtml(badgeAriaLabel)}">
           ${escapeHtml(badgeText)}
         </span>`
      : '';

    return `
      <a href="${sanitizeHref(item.href)}"
         class="nav-link${isActive ? ' active' : ''}"
         ${item.ariaLabel ? `aria-label="${escapeHtml(item.ariaLabel)}"` : ''}
         ${isActive ? 'aria-current="page"' : ''}
         data-tooltip="${escapeHtml(item.description || '')}"
         data-delay="140">
        <i class="fas ${item.icon}" aria-hidden="true"></i>
        <span class="nav-text">${escapeHtml(item.text)}</span>
        ${isActive ? '<i class="fas fa-compass nav-active-compass" aria-hidden="true"></i>' : ''}
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
    const badgeAriaLabel = badgeFromStorage?.ariaLabel ?? `${badgeText} ${item.text}`;

    return `
      <a href="${sanitizeHref(item.href)}"
         class="mobile-nav-link${isActive ? ' active' : ''}"
         ${item.ariaLabel ? `aria-label="${escapeHtml(item.ariaLabel)}"` : ''}
         ${isActive ? 'aria-current="page"' : ''}>
        <div class="mobile-nav-link__icon">
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          ${badgeText ? `
            <span class="mobile-badge ${toneToClass(badgeTone)} ${pulseClass}"
                  aria-label="${escapeHtml(badgeAriaLabel)}">
              ${escapeHtml(badgeText)}
            </span>
          ` : ''}
        </div>
        <span class="mobile-nav-link__text">${escapeHtml(item.text)}</span>
        <i class="fas fa-chevron-right mobile-nav-link__chevron" aria-hidden="true"></i>
      </a>
    `;
  }

  function getMetaFromMount(headerMount) {
    const ds = headerMount?.dataset || {};
    return {
      brand: ds.brand || DEFAULT_META.brand,
      ship: ds.ship || DEFAULT_META.ship,
      shipClass: ds.shipClass || DEFAULT_META.shipClass,
      sailing: ds.sailing || DEFAULT_META.sailing,
      port: ds.port || DEFAULT_META.port,
      daysAtSea: ds.daysAtSea || DEFAULT_META.daysAtSea,
      registry: ds.registry || DEFAULT_META.registry,
      tagline: ds.tagline || DEFAULT_META.tagline,
      year: DEFAULT_META.year,
      showMenuToggle: ds.menuToggle !== 'false',
      showProgress: ds.heroProgress === 'true',
      transitions: ds.transitions === 'true',
    };
  }

  // ---------------------------
  // CSS Injection for RCCL Premium Styling
  // ---------------------------
  function injectRCCLStyles() {
    const styleId = 'rccl-premium-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      /* ============================================================================
       * RCCL Premium Styles - Optimized for existing HTML structure
       * ========================================================================== */
       
      /* Animation Keyframes */
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes waveFlow {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(20px); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      
      @keyframes ripple {
        to {
          width: 280px;
          height: 280px;
          opacity: 0;
        }
      }
      
      @keyframes pulse {
        0% { 
          box-shadow: 0 0 0 0 rgba(var(--rccl-warning-rgb), 0.7); 
        }
        70% { 
          box-shadow: 0 0 0 6px rgba(var(--rccl-warning-rgb), 0); 
        }
        100% { 
          box-shadow: 0 0 0 0 rgba(var(--rccl-warning-rgb), 0); 
        }
      }
      
      @keyframes wave-gradient {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Base Layout */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .sr-only-focusable:focus {
        position: static;
        width: auto;
        height: auto;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
      
      /* Header Styles - Fixed at top */
      .app-header--rccl {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: linear-gradient(180deg, 
          color-mix(in srgb, var(--rccl-surface) 95%, transparent) 0%,
          color-mix(in srgb, var(--rccl-surface) 98%, transparent) 100%
        );
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid 
          color-mix(in srgb, var(--rccl-primary) 15%, transparent);
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.08),
          0 1px 0 rgba(255, 255, 255, 0.15) inset;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .app-header--rccl.scrolled {
        background: color-mix(in srgb, var(--rccl-surface) 98%, transparent);
        box-shadow: var(--rccl-shadow-lg);
      }
      
      /* Add padding to body to account for fixed header */
      body:not(.page-shell) {
        padding-top: 80px;
      }
      
      .page-shell {
        padding-top: 80px !important;
      }
      
      @media (max-width: 768px) {
        body:not(.page-shell) {
          padding-top: 70px;
        }
        .page-shell {
          padding-top: 70px !important;
        }
      }
      
      .header-waves {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        overflow: hidden;
        pointer-events: none;
      }
      
      .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, 
          transparent, 
          var(--rccl-accent), 
          transparent
        );
        opacity: 0.6;
      }
      
      .wave-1 {
        animation: var(--rccl-animation-wave-flow);
      }
      
      .wave-2 {
        height: 2px;
        animation: waveFlow 12s ease-in-out infinite reverse;
        opacity: 0.4;
      }
      
      .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 var(--rccl-spacing-md);
      }
      
      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--rccl-spacing-sm) 0;
        position: relative;
        min-height: 80px;
      }
      
      @media (max-width: 768px) {
        .header-content {
          min-height: 70px;
        }
      }
      
      /* Logo */
      .logo--rccl {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        text-decoration: none;
        color: var(--rccl-text);
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        border-radius: var(--rccl-border-radius-lg);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        position: relative;
      }
      
      .logo--rccl:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
      }
      
      .logo--rccl::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 20%;
        right: 20%;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent, 
          var(--rccl-accent) 30%, 
          var(--rccl-accent) 70%, 
          transparent
        );
        opacity: 0;
        transition: opacity var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .logo--rccl:hover::after {
        opacity: 0.7;
      }
      
      .logo-icon {
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: var(--rccl-border-radius-md);
        box-shadow: var(--rccl-shadow-sm);
      }
      
      .logo-icon i {
        font-size: 1.25rem;
        z-index: 1;
      }
      
      .logo-icon__wave {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: var(--rccl-border-radius-full);
      }
      
      .logo-text-container {
        display: flex;
        flex-direction: column;
      }
      
      .logo-text {
        font-size: var(--rccl-font-size-lg);
        font-weight: 700;
        line-height: 1.2;
        color: var(--rccl-primary);
      }
      
      .logo-subtext {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-xs);
        font-size: var(--rccl-font-size-xs);
        color: var(--rccl-gray);
        margin-top: 2px;
      }
      
      .logo-subtext i {
        font-size: 0.75rem;
      }
      
      .logo-separator {
        opacity: 0.5;
      }

      .brand-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--rccl-spacing-xs);
        margin-top: 4px;
      }

      .brand-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.68rem;
        font-weight: 700;
        color: color-mix(in srgb, var(--rccl-primary) 80%, black);
        background: color-mix(in srgb, var(--rccl-secondary) 16%, white);
        border: 1px solid color-mix(in srgb, var(--rccl-secondary) 40%, white);
        border-radius: 999px;
        padding: 0.18rem 0.48rem;
      }

      .ship-class-line {
        margin-top: 2px;
        font-size: 0.7rem;
        color: color-mix(in srgb, var(--rccl-gray) 85%, var(--rccl-primary));
      }
      
      /* Desktop Navigation */
      .nav-desktop {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-lg);
      }
      
      .nav-desktop__links {
        display: flex;
        gap: var(--rccl-spacing-xs);
        position: relative;
      }
      
      .nav-desktop__links::before {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg,
          transparent 0%,
          color-mix(in srgb, var(--rccl-accent) 20%, transparent) 20%,
          color-mix(in srgb, var(--rccl-accent) 40%, transparent) 50%,
          color-mix(in srgb, var(--rccl-accent) 20%, transparent) 80%,
          transparent 100%
        );
        border-radius: 2px;
      }
      
      .nav-link {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        border-radius: var(--rccl-border-radius-md);
        text-decoration: none;
        color: var(--rccl-text);
        font-weight: 500;
        font-size: var(--rccl-font-size-sm);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        z-index: 1;
      }
      
      .nav-link::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--rccl-gradient-primary);
        opacity: 0;
        z-index: -1;
        transition: opacity var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .nav-link:hover::before {
        opacity: 0.08;
      }
      
      .nav-link:hover {
        transform: translateY(-2px);
      }
      
      .nav-link.active {
        color: white;
      }
      
      .nav-link.active::before {
        opacity: 1;
        box-shadow: 
          0 4px 12px rgba(var(--rccl-primary-rgb), 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }
      
      .nav-link i {
        font-size: 1rem;
      }

      .nav-active-compass {
        font-size: 0.78rem;
        opacity: 0;
        transform: translateY(2px) scale(0.9);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }

      .nav-link.active .nav-active-compass {
        opacity: 0.92;
        transform: translateY(0) scale(1);
      }
      
      .nav-link__wave {
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: var(--rccl-gradient-primary);
        border-radius: var(--rccl-border-radius-full);
        transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .nav-link:hover .nav-link__wave {
        width: 60%;
      }
      
      .nav-link.active .nav-link__wave {
        width: 80%;
        background: rgba(255, 255, 255, 0.9);
        height: 4px;
        bottom: -4px;
      }
      
      /* Badges */
      .nav-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        font-size: var(--rccl-font-size-xs);
        font-weight: 700;
        border-radius: var(--rccl-border-radius-full);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 2;
      }
      
      .badge--primary {
        background: var(--rccl-primary);
        border: 2px solid var(--rccl-primary);
      }
      
      .badge--accent {
        background: var(--rccl-accent);
        border: 2px solid var(--rccl-accent);
      }
      
      .badge--success {
        background: var(--rccl-success);
        border: 2px solid var(--rccl-success);
      }
      
      .badge--warning {
        background: var(--rccl-warning);
        border: 2px solid var(--rccl-warning);
        color: var(--rccl-dark);
      }
      
      .badge--info {
        background: #17a2b8;
        border: 2px solid #17a2b8;
      }
      
      .badge--critical {
        background: var(--rccl-danger);
        border: 2px solid var(--rccl-danger);
        color: white;
      }
      
      /* Desktop Actions */
      .nav-desktop__actions {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
      }
      
      /* Theme Toggle */
      .theme-toggle--rccl {
        position: relative;
        width: 52px;
        height: 28px;
        border-radius: var(--rccl-border-radius-full);
        background: linear-gradient(135deg, 
          color-mix(in srgb, var(--rccl-primary) 70%, transparent),
          color-mix(in srgb, var(--rccl-accent) 70%, transparent)
        );
        border: 2px solid color-mix(in srgb, var(--rccl-primary) 30%, transparent);
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        overflow: hidden;
      }
      
      .theme-toggle--rccl::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg,
          transparent 30%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 70%
        );
        animation: var(--rccl-animation-shimmer);
      }
      
      .theme-toggle--rccl:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.2);
      }
      
      .toggle-track {
        position: absolute;
        width: 22px;
        height: 22px;
        background: white;
        border-radius: 50%;
        left: 3px;
        top: 3px;
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(0, 0, 0, 0.1);
        z-index: 1;
      }
      
      .theme-toggle__icons {
        display: flex;
        position: absolute;
        inset: 0;
        z-index: 0;
      }
      
      .theme-toggle__icons i {
        position: absolute;
        font-size: 12px;
        color: white;
        opacity: 0.9;
        transition: opacity 0.3s ease;
      }
      
      .theme-toggle__icons .fa-sun { 
        left: 8px; 
        top: 50%; 
        transform: translateY(-50%); 
      }
      
      .theme-toggle__icons .fa-moon { 
        right: 8px; 
        top: 50%; 
        transform: translateY(-50%); 
      }
      
      .theme-toggle__icons .fa-desktop { 
        left: 50%; 
        top: 50%; 
        transform: translate(-50%, -50%); 
      }
      
      [data-theme="light"] .toggle-track { transform: translateX(0); }
      [data-theme="dark"] .toggle-track { transform: translateX(24px); }
      [data-theme-mode="system"] .toggle-track { transform: translateX(12px); }
      
      /* User Menu */
      .user-menu--rccl {
        position: relative;
      }
      
      .user-menu-toggle {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-xs) var(--rccl-spacing-sm);
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        border: 2px solid transparent;
        border-radius: var(--rccl-border-radius-md);
        color: var(--rccl-text);
        font-size: var(--rccl-font-size-sm);
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .user-menu-toggle:hover {
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border-color: color-mix(in srgb, var(--rccl-primary) 20%, transparent);
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: 50%;
      }
      
      .user-name {
        font-weight: 500;
      }
      
      .user-menu__chevron {
        font-size: 0.75rem;
        transition: transform var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .user-menu-toggle[aria-expanded="true"] .user-menu__chevron {
        transform: rotate(180deg);
      }
      
      .user-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 240px;
        background: linear-gradient(180deg,
          color-mix(in srgb, var(--rccl-surface) 98%, transparent),
          color-mix(in srgb, var(--rccl-surface) 95%, transparent)
        );
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid color-mix(in srgb, var(--rccl-border) 50%, transparent);
        border-radius: var(--rccl-border-radius-lg);
        box-shadow: var(--rccl-shadow-xl);
        padding: var(--rccl-spacing-sm);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        z-index: 1001;
      }
      
      .user-dropdown.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .user-dropdown__header {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-sm);
        border-bottom: 1px solid color-mix(in srgb, var(--rccl-border) 50%, transparent);
        margin-bottom: var(--rccl-spacing-sm);
      }
      
      .user-dropdown__avatar {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: 50%;
        font-size: 1.5rem;
      }
      
      .user-dropdown__header div {
        flex: 1;
      }
      
      .user-dropdown__header strong {
        display: block;
        font-weight: 600;
      }
      
      .user-dropdown__header span {
        font-size: var(--rccl-font-size-xs);
        color: var(--rccl-gray);
      }
      
      .dropdown-divider {
        height: 1px;
        background: color-mix(in srgb, var(--rccl-border) 50%, transparent);
        margin: var(--rccl-spacing-sm) 0;
      }
      
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        width: 100%;
        padding: var(--rccl-spacing-sm);
        border: none;
        background: none;
        color: var(--rccl-text);
        text-decoration: none;
        font-size: var(--rccl-font-size-sm);
        text-align: left;
        border-radius: var(--rccl-border-radius-sm);
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .dropdown-item:hover {
        background: color-mix(in srgb, var(--rccl-primary) 8%, transparent);
      }
      
      .dropdown-item i {
        width: 16px;
        text-align: center;
      }
      
      .dropdown-item--signout {
        color: var(--rccl-danger);
      }
      
      .dropdown-item--signout:hover {
        background: color-mix(in srgb, var(--rccl-danger) 10%, transparent);
      }
      
      /* Mobile Menu Toggle - Only show when enabled */
      .mobile-menu-toggle {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        width: 32px;
        height: 24px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
      }
      
      .mobile-menu-toggle.enabled {
        display: flex;
      }
      
      .mobile-menu-toggle .hamburger-line {
        width: 100%;
        height: 3px;
        background: var(--rccl-text);
        border-radius: var(--rccl-border-radius-full);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
        transform: translateY(10px) rotate(45deg);
      }
      
      .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
        opacity: 0;
      }
      
      .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
        transform: translateY(-10px) rotate(-45deg);
      }
      
      /* Mobile Navigation */
      .nav-mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 999;
        opacity: 0;
        transition: opacity var(--rccl-transition-duration-slow) var(--rccl-transition-timing);
        display: none;
      }
      
      .nav-mobile {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 320px;
        max-width: 90vw;
        background: linear-gradient(180deg,
          color-mix(in srgb, var(--rccl-surface) 98%, transparent),
          color-mix(in srgb, var(--rccl-surface) 95%, transparent)
        );
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-left: 1px solid color-mix(in srgb, var(--rccl-border) 50%, transparent);
        box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      
      .nav-mobile__header {
        padding: var(--rccl-spacing-lg);
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--rccl-primary) 10%, transparent),
          color-mix(in srgb, var(--rccl-accent) 5%, transparent)
        );
        border-bottom: 1px solid color-mix(in srgb, var(--rccl-border) 50%, transparent);
      }
      
      .mobile-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--rccl-spacing-sm);
      }
      
      .mobile-nav-title {
        flex: 1;
      }
      
      .mobile-nav-title__eyebrow {
        display: block;
        font-size: var(--rccl-font-size-xs);
        color: var(--rccl-accent);
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .mobile-nav-title__main {
        font-size: var(--rccl-font-size-xl);
        color: var(--rccl-text);
        display: block;
        line-height: 1.3;
      }
      
      .mobile-nav-header__actions {
        display: flex;
        gap: var(--rccl-spacing-sm);
      }
      
      .theme-toggle-mobile {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border: 2px solid transparent;
        border-radius: var(--rccl-border-radius-md);
        color: var(--rccl-text);
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .theme-toggle-mobile:hover {
        background: color-mix(in srgb, var(--rccl-primary) 15%, transparent);
        transform: scale(1.05);
      }
      
      .mobile-nav-close {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border: 2px solid transparent;
        border-radius: var(--rccl-border-radius-md);
        color: var(--rccl-text);
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .mobile-nav-close:hover {
        background: color-mix(in srgb, var(--rccl-danger) 10%, transparent);
        color: var(--rccl-danger);
      }
      
      .mobile-nav-ship-info {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        font-size: var(--rccl-font-size-sm);
        color: var(--rccl-gray);
      }
      
      .mobile-nav-ship-info i {
        font-size: 0.875rem;
      }
      
      .mobile-nav-links {
        flex: 1;
        padding: var(--rccl-spacing-md);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--rccl-spacing-xs);
      }
      
      .mobile-nav-link {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-md);
        padding: var(--rccl-spacing-md);
        border-radius: var(--rccl-border-radius-md);
        text-decoration: none;
        color: var(--rccl-text);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .mobile-nav-link:hover {
        background: color-mix(in srgb, var(--rccl-primary) 8%, transparent);
        transform: translateX(4px);
      }
      
      .mobile-nav-link.active {
        background: var(--rccl-gradient-primary);
        color: white;
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.2);
      }
      
      .mobile-nav-link__icon {
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border-radius: var(--rccl-border-radius-md);
      }
      
      .mobile-nav-link.active .mobile-nav-link__icon {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .mobile-nav-link__icon i {
        font-size: 1.25rem;
      }
      
      .mobile-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        font-size: var(--rccl-font-size-xs);
        font-weight: 700;
        border-radius: var(--rccl-border-radius-full);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .mobile-nav-link__text {
        flex: 1;
        font-weight: 500;
      }
      
      .mobile-nav-link__chevron {
        font-size: 0.75rem;
        opacity: 0.5;
      }
      
      .nav-mobile__footer {
        padding: var(--rccl-spacing-lg);
        border-top: 1px solid color-mix(in srgb, var(--rccl-border) 50%, transparent);
      }
      
      .mobile-nav-shortcuts {
        display: flex;
        gap: var(--rccl-spacing-sm);
        margin-bottom: var(--rccl-spacing-lg);
      }
      
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--rccl-spacing-xs);
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border: none;
        border-radius: var(--rccl-border-radius-full);
        color: var(--rccl-text);
        font-size: var(--rccl-font-size-sm);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .chip:hover {
        background: color-mix(in srgb, var(--rccl-primary) 15%, transparent);
        transform: translateY(-2px);
      }
      
      .mobile-nav-footer-legal {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--rccl-spacing-sm);
        font-size: var(--rccl-font-size-xs);
        color: var(--rccl-gray);
      }
      
      .mobile-nav-footer-legal a {
        color: var(--rccl-gray);
        text-decoration: none;
      }
      
      /* Header Progress */
      .header-progress--rccl {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        overflow: hidden;
      }
      
      .progress-bar {
        width: 100%;
        height: 100%;
        transform-origin: left;
        transform: scaleX(0);
        transition: transform 0.1s linear;
        background: linear-gradient(90deg,
          var(--rccl-accent),
          var(--rccl-primary),
          var(--rccl-accent)
        );
        background-size: 200% 100%;
        animation: wave-gradient 2s linear infinite;
      }
      
      /* Footer Styles */
      .app-footer--rccl {
        position: relative;
        background: linear-gradient(180deg, 
          var(--rccl-primary) 0%, 
          var(--rccl-dark) 100%
        );
        color: white;
        overflow: hidden;
        margin-top: auto;
      }
      
      .footer-waves {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        overflow: hidden;
        pointer-events: none;
      }
      
      .footer-hero {
        position: relative;
        padding: var(--rccl-spacing-xl) var(--rccl-spacing-lg);
        border-radius: var(--rccl-border-radius-xl);
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--rccl-primary) 5%, transparent),
          color-mix(in srgb, var(--rccl-accent) 10%, transparent)
        );
        border: 1px solid color-mix(in srgb, var(--rccl-primary) 15%, transparent);
        margin: var(--rccl-spacing-xl) 0;
        overflow: hidden;
      }
      
      .footer-hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(var(--rccl-accent-rgb), 0.05) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .footer-hero__intro {
        position: relative;
        z-index: 1;
      }
      
      .footer-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: var(--rccl-border-radius-full);
        font-weight: 600;
        margin-bottom: var(--rccl-spacing-lg);
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.3);
      }
      
      .footer-hero h3 {
        font-size: var(--rccl-font-size-2xl);
        margin-bottom: var(--rccl-spacing-sm);
        font-weight: 700;
      }
      
      .footer-hero p {
        font-size: var(--rccl-font-size-lg);
        opacity: 0.9;
        max-width: 600px;
        line-height: 1.6;
      }
      
      .footer-hero__actions {
        display: flex;
        gap: var(--rccl-spacing-md);
        margin-top: var(--rccl-spacing-lg);
        flex-wrap: wrap;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-md) var(--rccl-spacing-lg);
        border: none;
        border-radius: var(--rccl-border-radius-md);
        font-weight: 600;
        font-size: var(--rccl-font-size-base);
        cursor: pointer;
        text-decoration: none;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        position: relative;
        overflow: hidden;
      }
      
      .btn--primary {
        background: var(--rccl-gradient-primary);
        color: white;
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.3);
      }
      
      .btn--secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--rccl-primary-rgb), 0.4);
      }
      
      .btn--icon i {
        font-size: 1rem;
      }
      
      .footer-hero__cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--rccl-spacing-lg);
        margin-top: var(--rccl-spacing-xl);
      }
      
      .footer-action-card--rccl {
        position: relative;
        padding: var(--rccl-spacing-lg);
        background: linear-gradient(145deg,
          rgba(255, 255, 255, 0.12),
          rgba(255, 255, 255, 0.05)
        );
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: var(--rccl-border-radius-lg);
        backdrop-filter: blur(10px);
        box-shadow: var(--rccl-shadow-md);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        overflow: hidden;
        text-decoration: none;
        color: white;
      }
      
      .footer-action-card--rccl:hover {
        transform: translateY(-8px);
        box-shadow: var(--rccl-shadow-xl);
        border-color: var(--rccl-accent);
      }
      
      .footer-action-card--rccl::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        transition: left 0.7s ease;
      }
      
      .footer-action-card--rccl:hover::before {
        left: 100%;
      }
      
      .footer-action-card__content {
        position: relative;
        z-index: 1;
      }
      
      .footer-action-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--rccl-spacing-md);
      }
      
      .footer-action-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: var(--rccl-border-radius-lg);
        font-size: 1.25rem;
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.2);
      }
      
      .footer-action-badge {
        padding: 4px 8px;
        font-size: var(--rccl-font-size-xs);
        font-weight: 700;
        border-radius: var(--rccl-border-radius-full);
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
      }
      
      .footer-action-card__body h4 {
        font-size: var(--rccl-font-size-lg);
        margin-bottom: var(--rccl-spacing-xs);
        font-weight: 600;
      }
      
      .footer-action-card__body p {
        font-size: var(--rccl-font-size-sm);
        opacity: 0.8;
        line-height: 1.5;
      }
      
      .footer-action-card__footer {
        margin-top: var(--rccl-spacing-md);
      }
      
      .footer-action-cta {
        display: inline-flex;
        align-items: center;
        gap: var(--rccl-spacing-xs);
        font-size: var(--rccl-font-size-sm);
        font-weight: 600;
        color: var(--rccl-accent);
      }
      
      .footer-action-card__wave {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg,
          var(--rccl-accent),
          var(--rccl-primary),
          var(--rccl-accent)
        );
        background-size: 200% 100%;
        animation: wave-gradient 3s linear infinite;
      }
      
      /* Footer Grid */
      .footer-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--rccl-spacing-xl);
        padding: var(--rccl-spacing-xl) 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      @media (max-width: 1024px) {
        .footer-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 640px) {
        .footer-grid {
          grid-template-columns: 1fr;
        }
      }
      
      .footer-section {
        padding: var(--rccl-spacing-sm);
      }
      
      .footer-subtitle {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        margin-bottom: var(--rccl-spacing-lg);
        font-size: var(--rccl-font-size-base);
        color: white;
        font-weight: 600;
      }
      
      .footer-subtitle i {
        font-size: 1rem;
        opacity: 0.8;
      }
      
      .footer-links {
        display: flex;
        flex-direction: column;
        gap: var(--rccl-spacing-sm);
      }
      
      .footer-link {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        padding: var(--rccl-spacing-sm);
        border-radius: var(--rccl-border-radius-md);
        text-decoration: none;
        color: rgba(255, 255, 255, 0.9);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .footer-link:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
        color: white;
      }
      
      .footer-link__icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--rccl-border-radius-sm);
        color: white;
      }
      
      .footer-link__chevron {
        margin-left: auto;
        font-size: 0.75rem;
        opacity: 0.5;
      }
      
      /* Newsletter */
      .footer-newsletter {
        grid-column: span 1;
      }
      
      .footer-newsletter__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--rccl-spacing-md);
      }
      
      .footer-newsletter__icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: 50%;
      }
      
      .footer-text {
        font-size: var(--rccl-font-size-sm);
        opacity: 0.8;
        line-height: 1.6;
        margin-bottom: var(--rccl-spacing-lg);
      }
      
      .newsletter-form {
        margin-bottom: var(--rccl-spacing-xl);
      }
      
      .input-group {
        display: flex;
        gap: var(--rccl-spacing-xs);
        margin-bottom: var(--rccl-spacing-sm);
      }
      
      .newsletter-input {
        flex: 1;
        padding: var(--rccl-spacing-md);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--rccl-border-radius-md);
        color: white;
        font-size: var(--rccl-font-size-base);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .newsletter-input:focus {
        outline: none;
        border-color: var(--rccl-accent);
        box-shadow: 0 0 0 3px rgba(var(--rccl-accent-rgb), 0.2);
      }
      
      .newsletter-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .newsletter-button {
        padding: var(--rccl-spacing-md) var(--rccl-spacing-lg);
        background: var(--rccl-gradient-primary);
        border: none;
        border-radius: var(--rccl-border-radius-md);
        color: white;
        cursor: pointer;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .newsletter-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(var(--rccl-primary-rgb), 0.3);
      }
      
      .newsletter-note {
        font-size: var(--rccl-font-size-xs);
        opacity: 0.6;
      }
      
      /* Footer Support */
      .footer-support {
        display: flex;
        flex-direction: column;
        gap: var(--rccl-spacing-md);
        margin-bottom: var(--rccl-spacing-xl);
      }
      
      .footer-support__item {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-md);
        padding: var(--rccl-spacing-md);
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--rccl-border-radius-md);
      }
      
      .footer-support__icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: 50%;
      }
      
      .footer-support__content {
        flex: 1;
      }
      
      .footer-support__content strong {
        display: block;
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .footer-support__content span {
        font-size: var(--rccl-font-size-sm);
        opacity: 0.8;
      }
      
      /* Footer Social */
      .footer-social {
        margin-top: var(--rccl-spacing-xl);
      }
      
      .footer-social span {
        display: block;
        margin-bottom: var(--rccl-spacing-md);
        font-weight: 600;
      }
      
      .social-links {
        display: flex;
        gap: var(--rccl-spacing-sm);
      }

      .footer-brand-lines {
        display: grid;
        gap: 0.35rem;
        margin-top: var(--rccl-spacing-sm);
        font-size: var(--rccl-font-size-sm);
        color: color-mix(in srgb, var(--rccl-light) 82%, transparent);
      }

      .footer-brand-lines strong {
        color: white;
      }

      .footer-social-links {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        margin-top: var(--rccl-spacing-md);
      }

      .footer-social-links a {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: white;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.06);
      }

      .footer-social-links a:hover {
        background: rgba(var(--rccl-accent-rgb), 0.32);
      }
      
      .social-link {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: white;
        text-decoration: none;
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .social-link:hover {
        background: var(--rccl-gradient-primary);
        transform: translateY(-4px);
      }
      
      /* Footer Bottom */
      .footer-bottom--rccl {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--rccl-spacing-xl) 0;
        position: relative;
        flex-wrap: wrap;
        gap: var(--rccl-spacing-lg);
      }
      
      .footer-bottom__content {
        display: flex;
        flex-direction: column;
        gap: var(--rccl-spacing-sm);
      }
      
      .footer-copyright {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        color: rgba(255, 255, 255, 0.7);
        font-size: var(--rccl-font-size-sm);
      }
      
      .footer-legal {
        display: flex;
        align-items: center;
        gap: var(--rccl-spacing-sm);
        flex-wrap: wrap;
        font-size: var(--rccl-font-size-sm);
      }
      
      .footer-legal a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: color var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .footer-legal a:hover {
        color: white;
      }
      
      .legal-separator {
        color: rgba(255, 255, 255, 0.3);
      }
      
      /* Back to Top */
      .back-to-top--rccl {
        position: fixed;
        bottom: var(--rccl-spacing-xl);
        right: var(--rccl-spacing-xl);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--rccl-gradient-primary);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 
          0 4px 20px rgba(var(--rccl-primary-rgb), 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        z-index: 1000;
      }
      
      .back-to-top--rccl.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .back-to-top--rccl:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 
          0 8px 32px rgba(var(--rccl-primary-rgb), 0.4),
          0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      }
      
      .back-to-top__text {
        position: absolute;
        right: 100%;
        margin-right: var(--rccl-spacing-md);
        background: var(--rccl-surface);
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        border-radius: var(--rccl-border-radius-md);
        color: var(--rccl-text);
        font-size: var(--rccl-font-size-sm);
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
        box-shadow: var(--rccl-shadow-md);
        pointer-events: none;
      }
      
      .back-to-top--rccl:hover .back-to-top__text {
        opacity: 1;
        transform: translateX(0);
      }
      
      /* Bottom Navigation */
      .mobile-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        background: var(--rccl-surface);
        border-top: 1px solid var(--rccl-border);
        z-index: 100;
        padding: var(--rccl-spacing-xs) var(--rccl-spacing-sm);
      }
      
      .mobile-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: var(--rccl-spacing-sm);
        text-decoration: none;
        color: var(--rccl-gray);
        font-size: var(--rccl-font-size-xs);
        border-radius: var(--rccl-border-radius-md);
        transition: all var(--rccl-transition-duration) var(--rccl-transition-timing);
      }
      
      .mobile-nav-item:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        color: var(--rccl-primary);
      }
      
      .mobile-nav-item.active {
        color: var(--rccl-primary);
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
      }
      
      .mobile-nav-icon {
        font-size: 1.25rem;
      }
      
      /* Tooltips */
      .nav-tooltip {
        position: absolute;
        padding: var(--rccl-spacing-sm) var(--rccl-spacing-md);
        background: var(--rccl-gradient-primary);
        color: white;
        border-radius: var(--rccl-border-radius-md);
        font-size: var(--rccl-font-size-sm);
        white-space: nowrap;
        z-index: 1002;
        pointer-events: none;
        box-shadow: var(--rccl-shadow-lg);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .nav-tooltip__arrow {
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid var(--rccl-primary);
      }
      
      /* Responsive Design */
      @media (max-width: 1024px) {
        .nav-desktop__links {
          display: none;
        }
        
        .mobile-menu-toggle.enabled {
          display: flex;
        }
        
        .nav-desktop__actions {
          gap: var(--rccl-spacing-sm);
        }
      }
      
      @media (max-width: 768px) {
        .footer-hero__actions {
          flex-direction: column;
        }
        
        .btn {
          width: 100%;
          justify-content: center;
        }
        
        .footer-bottom--rccl {
          flex-direction: column;
          text-align: center;
          gap: var(--rccl-spacing-md);
        }
        
        .footer-copyright,
        .footer-legal {
          justify-content: center;
        }
        
        .back-to-top--rccl {
          bottom: var(--rccl-spacing-lg);
          right: var(--rccl-spacing-lg);
        }
      }
      
      @media (max-width: 480px) {
        .logo-text {
          font-size: var(--rccl-font-size-base);
        }
        
        .logo-subtext {
          font-size: 0.625rem;
        }
        
        .footer-hero {
          padding: var(--rccl-spacing-lg);
        }
        
        .footer-hero h3 {
          font-size: var(--rccl-font-size-xl);
        }
        
        .footer-hero p {
          font-size: var(--rccl-font-size-base);
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .wave-1,
        .wave-2,
        .progress-bar,
        .footer-action-card__wave,
        .btn.enhanced::after,
        .theme-toggle--rccl::before,
        .footer-action-card--rccl::before {
          animation: none !important;
          transition: none !important;
        }
        
        .nav-link:hover,
        .btn:hover,
        .footer-action-card--rccl:hover,
        .social-link:hover,
        .back-to-top--rccl:hover {
          transform: none !important;
        }
      }
      
      /* Print Styles */
      @media print {
        .app-header--rccl,
        .mobile-nav,
        .back-to-top--rccl,
        .footer-hero__actions,
        .newsletter-form,
        .footer-social,
        .footer-action-card--rccl {
          display: none !important;
        }
        
        .app-footer--rccl {
          background: none;
          color: black;
          border-top: 2px solid #000;
        }
        
        .footer-link,
        .footer-subtitle,
        .footer-text,
        .footer-copyright,
        .footer-legal a {
          color: black !important;
        }
        
        .footer-grid {
          border: none;
        }
        
        body:not(.page-shell),
        .page-shell {
          padding-top: 0 !important;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // ---------------------------
  // Event Handler Utilities
  // ---------------------------
  let cleanupFns = [];

  function on(el, evt, handler, opts) {
    if (!el) return;
    el.addEventListener(evt, handler, opts);
    cleanupFns.push(() => el.removeEventListener(evt, handler, opts));
  }

  // ---------------------------
  // Header Component
  // ---------------------------
  function renderHeader() {
    return safeMount('#sharedHeader', (mount) => {
      const currentPage = utils.getCurrentPage(mount);
      const meta = getMetaFromMount(mount);

      const navLinks = NAV_ITEMS.map(item => 
        buildNavLink(item, currentPage === item.id)
      ).join('');
      
      const mobileLinks = NAV_ITEMS.map(item => 
        buildMobileNavLink(item, currentPage === item.id)
      ).join('');

      const showMenuToggle = meta.showMenuToggle;
      const toggleClass = showMenuToggle ? 'enabled' : '';

      const headerHTML = `
        <a class="skip-link sr-only-focusable" href="#main">Skip to content</a>

        <header class="app-header app-header--rccl" role="banner" data-page="${currentPage}">
          <div class="header-waves" aria-hidden="true">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
          </div>
          
          <div class="container">
            <div class="header-content">
              <a href="${sanitizeHref('index.html')}" class="logo logo--rccl" aria-label="Go to dashboard">
                <div class="logo-icon" aria-hidden="true">
                  <i class="fas fa-crown" aria-hidden="true"></i>
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
                  <div class="brand-meta" aria-label="Cruise summary">
                    <span class="brand-chip"><i class="fas fa-compass" aria-hidden="true"></i> Embark: ${escapeHtml(meta.port)}</span>
                    <span class="brand-chip"><i class="fas fa-water" aria-hidden="true"></i> ${escapeHtml(meta.daysAtSea)}</span>
                  </div>
                  <div class="ship-class-line">${escapeHtml(meta.shipClass)}</div>
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
                      <a href="${sanitizeHref('profile.html')}" class="dropdown-item" role="menuitem">
                        <i class="fas fa-user" aria-hidden="true"></i> My Profile
                      </a>
                      <a href="${sanitizeHref('settings.html')}" class="dropdown-item" role="menuitem">
                        <i class="fas fa-cog" aria-hidden="true"></i> Settings
                      </a>
                      <a href="${sanitizeHref('help.html')}" class="dropdown-item" role="menuitem">
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

              <button class="mobile-menu-toggle ${toggleClass}" type="button"
                      aria-label="${showMenuToggle ? 'Open navigation menu' : 'Menu disabled'}"
                      aria-expanded="false"
                      aria-controls="navMobile"
                      ${!showMenuToggle ? 'disabled' : ''}>
                <span class="hamburger-box" aria-hidden="true">
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                </span>
              </button>
            </div>

            ${showMenuToggle ? `
              <div class="nav-mobile-overlay" data-action="close-mobile" style="display: none;"></div>

              <nav class="nav-mobile" id="navMobile" aria-label="Mobile navigation" style="display: none; transform: translateX(100%);">
                <div class="nav-mobile__header">
                  <div class="mobile-nav-header">
                    <div class="mobile-nav-title">
                      <span class="mobile-nav-title__eyebrow">${escapeHtml(meta.port)}</span>
                      <strong class="mobile-nav-title__main">Welcome Aboard</strong>
                    </div>
                    <div class="mobile-nav-header__actions">
                      <button class="theme-toggle-mobile" id="themeToggleMobile" type="button" aria-label="Toggle theme">
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
                    <button type="button" class="chip" data-action="go" data-href="${sanitizeHref('operations.html')}">
                      <i class="fas fa-clipboard-check" aria-hidden="true"></i> Checklist
                    </button>
                    <button type="button" class="chip" data-action="go" data-href="${sanitizeHref('itinerary.html')}">
                      <i class="fas fa-route" aria-hidden="true"></i> Itinerary
                    </button>
                    <button type="button" class="chip" data-action="go" data-href="${sanitizeHref('dining.html')}">
                      <i class="fas fa-utensils" aria-hidden="true"></i> Dining
                    </button>
                  </div>
                  <div class="mobile-nav-footer-legal">
                    <span>© ${DEFAULT_META.year} Royal Caribbean</span>
                    <span class="legal-separator">•</span>
                    <a href="${sanitizeHref('privacy.html')}">Privacy</a>
                  </div>
                </div>
              </nav>
            ` : ''}
          </div>

          ${meta.showProgress ? `
            <div class="header-progress header-progress--rccl" role="progressbar" 
                 aria-label="Scroll progress" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
              <div class="progress-bar" aria-hidden="true">
                <div class="progress-wave"></div>
              </div>
            </div>
          ` : ''}
        </header>
      `;

      mount.outerHTML = headerHTML;
      return utils.qs('.app-header');
    });
  }

  // ---------------------------
  // Footer Component
  // ---------------------------
  function renderFooter() {
    return safeMount('#sharedFooter', (mount) => {
      const stored = CruiseState.get('cruise-nextport', null);
      const nextPort = (stored && typeof stored === 'object' && stored.name) ? stored : resolveNextPort();

      const sectionsHTML = FOOTER_SECTIONS.map(section => `
        <div class="footer-section">
          <h4 class="footer-subtitle">
            <i class="fas fa-compass" aria-hidden="true"></i>
            ${escapeHtml(section.title)}
          </h4>
          <div class="footer-links">
            ${section.links.map(link => `
              <a href="${sanitizeHref(link.href)}" class="footer-link">
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
            ${escapeHtml(badgeFromStorage.text)}
          </span>
        ` : '';

        return `
          <a class="footer-action-card footer-action-card--rccl" href="${sanitizeHref(action.href)}">
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
                <div class="footer-brand-lines">
                  <div><strong>Royal Caribbean International</strong> • ${escapeHtml(meta.tagline)}</div>
                  <div>Ships Registry: ${escapeHtml(meta.registry)}</div>
                </div>
                <div class="footer-social-links" aria-label="Royal Caribbean social media">
                  <a href="https://www.facebook.com/royalcaribbean" target="_blank" rel="noopener noreferrer" aria-label="Royal Caribbean on Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                  <a href="https://www.instagram.com/royalcaribbean" target="_blank" rel="noopener noreferrer" aria-label="Royal Caribbean on Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                  <a href="https://x.com/RoyalCaribbean" target="_blank" rel="noopener noreferrer" aria-label="Royal Caribbean on X"><i class="fab fa-x-twitter" aria-hidden="true"></i></a>
                  <a href="https://www.youtube.com/royalcaribbean" target="_blank" rel="noopener noreferrer" aria-label="Royal Caribbean on YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
                </div>
              </div>

              <div class="footer-hero__actions">
                <a class="btn btn--primary btn--icon" href="${sanitizeHref('operations.html')}">
                  <i class="fas fa-clipboard-check" aria-hidden="true"></i>
                  Finish Checklist
                </a>
                <a class="btn btn--secondary btn--icon" href="${sanitizeHref('itinerary.html')}">
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
               

            <div class="footer-bottom footer-bottom--rccl">
              <div class="footer-bottom__content">
                <div class="footer-copyright">
                  <i class="fas fa-ship" aria-hidden="true"></i>
                  <span>© ${DEFAULT_META.year} Royal Caribbean International. All rights reserved.</span>
                </div>
                <div class="footer-legal">
                  <a href="${sanitizeHref('privacy.html')}">Privacy Policy</a>
                  <span class="legal-separator">•</span>
                  <a href="${sanitizeHref('terms.html')}">Terms of Service</a>
                  <span class="legal-separator">•</span>
                  <a href="${sanitizeHref('accessibility.html')}">Accessibility</a>
                  <span class="legal-separator">•</span>
                  <a href="${sanitizeHref('cookies.html')}">Cookies</a>
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

      mount.outerHTML = footerHTML;
      return utils.qs('.app-footer');
    });
  }

  // ---------------------------
  // Bottom Navigation Component
  // ---------------------------
  function renderBottomNav() {
    const mounts = utils.qsa('#sharedBottomNav');
    mounts.forEach((mount) => {
      try {
        const currentPage = utils.getCurrentPage(mount);
        const links = NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return `
            <a href="${sanitizeHref(item.href)}"
               class="mobile-nav-item${isActive ? ' active' : ''}"
               ${isActive ? 'aria-current="page"' : ''}>
              <span class="mobile-nav-icon"><i class="fas ${item.icon}" aria-hidden="true"></i></span>
              <span class="mobile-nav-text">${escapeHtml(item.text)}</span>
            </a>
          `;
        }).join('');

        mount.innerHTML = `
          <nav class="mobile-nav" aria-label="Bottom navigation">
            ${links}
          </nav>
        `;
      } catch (err) {
        console.error('Failed to render bottom nav:', err);
        mount.innerHTML = '<nav class="mobile-nav" aria-label="Bottom navigation"></nav>';
      }
    });
  }

  // ---------------------------
  // Event Interactions
  // ---------------------------
  function initHeaderInteractions() {
    const toggle = utils.qs('.mobile-menu-toggle');
    const nav = utils.qs('.nav-mobile');
    const overlay = utils.qs('.nav-mobile-overlay');

    let releaseTrap = () => {};

    function openMobile() {
      if (!toggle || !nav || !toggle.classList.contains('enabled')) return;
      
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');

      nav.style.display = 'flex';
      overlay.style.display = 'block';
      
      // Trigger reflow
      nav.offsetHeight;
      overlay.offsetHeight;
      
      nav.style.transform = 'translateX(0)';
      overlay.style.opacity = '1';
      
      utils.lockBodyScroll(true);

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
      overlay.style.opacity = '0';

      setTimeout(() => {
        nav.style.display = 'none';
        overlay.style.display = 'none';
      }, 300);

      utils.lockBodyScroll(false);
      releaseTrap();
      releaseTrap = () => {};

      toggle.focus({ preventScroll: true });
    }

    // Mobile toggle click
    if (toggle && toggle.classList.contains('enabled')) {
      on(toggle, 'click', (e) => {
        e.stopPropagation();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        expanded ? closeMobile() : openMobile();
      });
    }

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
        if (href) {
          window.location.href = href;
        }
      }
    });

    // Click outside drawer closes (only when open)
    on(document, 'click', (e) => {
      if (!nav || nav.style.display === 'none') return;
      if (nav.contains(e.target)) return;
      if (toggle && toggle.contains(e.target)) return;
      if (overlay && overlay.contains(e.target)) {
        closeMobile();
      }
    });

    // Escape closes drawer + dropdowns
    on(document, 'keydown', (e) => {
      if (e.key !== 'Escape') return;

      // Close dropdowns
      utils.qsa('[aria-expanded="true"]').forEach(el => {
        if (el !== toggle) {
          el.setAttribute('aria-expanded', 'false');
        }
      });

      // Close user dropdown
      const userDropdown = utils.qs('.user-dropdown');
      if (userDropdown) userDropdown.classList.remove('visible');

      if (nav && nav.style.display !== 'none') {
        e.preventDefault();
        closeMobile();
      }
    });

    // Theme toggles
    const themeToggle = utils.qs('#themeToggle');
    const themeToggleMobile = utils.qs('#themeToggleMobile');
    
    if (themeToggle) {
      on(themeToggle, 'click', (e) => {
        e.stopPropagation();
        ThemeManager.toggle();
      });
    }
    
    if (themeToggleMobile) {
      on(themeToggleMobile, 'click', (e) => {
        e.stopPropagation();
        ThemeManager.toggle();
      });
    }

    // User dropdown
    const userToggle = utils.qs('.user-menu-toggle');
    const userDropdown = utils.qs('.user-dropdown');
    
    if (userToggle) {
      on(userToggle, 'click', (e) => {
        e.stopPropagation();
        const expanded = userToggle.getAttribute('aria-expanded') === 'true';
        userToggle.setAttribute('aria-expanded', String(!expanded));
        if (userDropdown) {
          userDropdown.classList.toggle('visible', !expanded);
        }
      });
    }
    
    // Close dropdown when clicking outside
    on(document, 'click', (e) => {
      if (userToggle && !userToggle.contains(e.target) && userDropdown && !userDropdown.contains(e.target)) {
        userToggle.setAttribute('aria-expanded', 'false');
        userDropdown.classList.remove('visible');
      }
    });

    // Sign out button in dropdown
    const signOutBtn = utils.qs('.dropdown-item--signout');
    if (signOutBtn) {
      on(signOutBtn, 'click', () => {
        utils.announce('Signed out successfully');
        // Add your sign-out logic here
      });
    }

    // Desktop tooltips
    if (!utils.isMobile() && capabilities.hasHover) {
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
        const tipWidth = tipEl.offsetWidth;
        const tipHeight = tipEl.offsetHeight;
        
        tipEl.style.left = `${r.left + r.width / 2 - tipWidth / 2}px`;
        tipEl.style.top = `${r.bottom + 10}px`;
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.className = 'nav-tooltip__arrow';
        tipEl.appendChild(arrow);
      };

      const hideTip = () => {
        clearTimeout(tipT);
        if (tipEl) {
          tipEl.remove();
          tipEl = null;
        }
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
    const header = utils.qs('.app-header');
    const progressBar = utils.qs('.header-progress .progress-bar');
    const waves = utils.qs('.header-waves');
    const hero = utils.qs('.app-hero, .hero, main > section:first-child');

    if (!header) return;

    const update = () => {
      const y = utils.getScrollPosition();

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
        progressBar.setAttribute('aria-valuenow', Math.round(p * 100));
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
  }

  function initFooterInteractions() {
    // Newsletter form
    const form = utils.qs('.newsletter-form');
    if (form) {
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
    }

    // Back to top button
    const btn = utils.qs('.back-to-top');
    if (btn) {
      const updateVis = utils.debounce(() => {
        if (!btn) return;
        const scrolled = utils.getScrollPosition() > 500;
        btn.classList.toggle('visible', scrolled);
        
        if (scrolled) {
          btn.setAttribute('aria-label', 'Scroll to top of page');
        } else {
          btn.setAttribute('aria-label', 'Back to top');
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
    }

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

  function initEnhancedButtonEffects() {
    // Add ripple effect to enhanced buttons
    utils.qsa('.btn.enhanced').forEach((button) => {
      on(button, 'click', (e) => {
        if (utils.prefersReducedMotion()) return;
        
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
          if (ripple.parentNode === button) {
            button.removeChild(ripple);
          }
        }, 600);
      });
    });
  }

  // ---------------------------
  // Countdown Timer
  // ---------------------------
  function initCountdownTimer() {
    // Initialize countdown immediately
    utils.updateCountdown();
    
    // Update countdown every minute
    const countdownInterval = setInterval(utils.updateCountdown, 60000);
    
    // Add to cleanup
    cleanupFns.push(() => clearInterval(countdownInterval));
  }

  // ---------------------------
  // Badge Refresh System
  // ---------------------------
  function refreshBadgesInDOM() {
    // Desktop badges
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
      badgeEl.setAttribute('aria-label', badge.ariaLabel || `${badge.text} ${label}`);
    });

    // Mobile badges
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
        const iconContainer = utils.qs('.mobile-nav-link__icon', link);
        if (iconContainer) iconContainer.appendChild(badgeEl);
      }
      
      badgeEl.className = `mobile-badge ${toneToClass(badge.tone || 'primary')} ${badge.pulse ? 'badge--pulse' : ''}`;
      badgeEl.textContent = badge.text;
      badgeEl.setAttribute('aria-label', badge.ariaLabel || `${badge.text} ${label}`);
    });

    // Footer badges
    utils.qsa('.footer-action-card--rccl').forEach((card) => {
      const href = card.getAttribute('href');
      const action = FOOTER_QUICK_ACTIONS.find(a => a.href === href);
      if (!action || !action.badgeKey) return;

      const badge = BadgeProvider.resolve(action.badgeKey);
      let badgeEl = utils.qs('.footer-action-badge', card);

      if (!badge) {
        if (badgeEl) badgeEl.remove();
        return;
      }

      if (!badgeEl) {
        const header = utils.qs('.footer-action-card__header', card);
        if (!header) return;
        
        badgeEl = document.createElement('span');
        badgeEl.className = 'footer-action-badge';
        header.appendChild(badgeEl);
      }
      
      badgeEl.className = `footer-action-badge ${toneToClass(badge.tone || 'primary')}`;
      badgeEl.textContent = badge.text;
      
      // Update subtitle
      const subtitleEl = utils.qs('.footer-action-card__body p', card);
      if (subtitleEl && action.subtitle) {
        const newSubtitle = badge?.text
          ? `${action.subtitle} • ${badge.text} ${action.badgeKey === 'checklist' ? 'remaining' : 'saved'}`
          : action.subtitle;
        subtitleEl.textContent = newSubtitle;
      }
    });
  }

  // ---------------------------
  // Init & Cleanup
  // ---------------------------
  function cleanup() {
    cleanupFns.forEach(fn => {
      try { 
        fn(); 
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupFns = [];
    
    BadgeProvider.clearCache();
    CruiseState.clearCache();
  }

  function init() {
    // Clean up any previous instances
    cleanup();
    // Force light mode for consistency across pages
    try {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme-mode', 'light');
      localStorage.setItem('theme-preference', 'light');
      localStorage.setItem('rccl-theme', 'light');
      CruiseState.set('cruise-theme', 'light');
    } catch (e) {
      /* ignore storage issues */
    }
    
    // Initialize systems (theme manager will pick up forced light)
    ThemeManager.init();
    
    // Inject styles
    injectRCCLStyles();
    
    // Render components
    renderHeader();
    renderFooter();
    renderBottomNav();
    
    // Initialize interactions
    initHeaderInteractions();
    initFooterInteractions();
    initHeroObserver();
    initEnhancedButtonEffects();
    initCountdownTimer();
    
    // Add page-shell class to body for proper padding
    document.body.classList.add('page-shell');
    
    // Update countdown immediately
    utils.updateCountdown();
    
    ThemeManager.syncToggleUI();
    refreshBadgesInDOM();
    
    // Subscribe to storage updates
    const unsubscribeState = CruiseState.subscribe((key) => {
      if (key === 'cruise-checklist' || key === 'cruise-dining') {
        BadgeProvider.refresh();
        refreshBadgesInDOM();
      }
    });
    
    cleanupFns.push(() => CruiseState.unsubscribe(unsubscribeState));
    
    // Expose API
    window.SharedLayoutRCCL = {
      utils,
      ThemeManager,
      CruiseState,
      BadgeProvider,
      NAV_ITEMS,
      
      // Public methods
      refresh: () => {
        cleanup();
        init();
      },
      refreshBadges: () => {
        BadgeProvider.refresh();
        refreshBadgesInDOM();
      },
      updateTheme: (theme) => ThemeManager.apply(theme),
      updateCountdown: () => utils.updateCountdown(),
      openMobileMenu: () => {
        const toggle = utils.qs('.mobile-menu-toggle');
        if (toggle && toggle.classList.contains('enabled') && toggle.getAttribute('aria-expanded') === 'false') {
          toggle.click();
        }
      },
      closeMobileMenu: () => {
        const toggle = utils.qs('.mobile-menu-toggle');
        if (toggle && toggle.classList.contains('enabled') && toggle.getAttribute('aria-expanded') === 'true') {
          toggle.click();
        }
      },
      destroy: cleanup,
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
