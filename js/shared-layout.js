/* ============================================================================
 * Minimalist Shared Layout (RCCL) - Less is More
 * Clean, polished design focusing on essential functionality
 * ========================================================================== */
(function renderMinimalLayout() {
  'use strict';

  // ---------------------------
  // Safe Operations
  // ---------------------------
  function safeMount(selector, renderFn) {
    try {
      const mount = document.querySelector(selector);
      if (!mount) return null;
      const result = renderFn(mount);
      if (typeof result === 'string') {
        mount.innerHTML = result;
      } else if (result instanceof Node) {
        mount.replaceChildren(result);
      }
      return result;
    } catch (error) {
      console.error(`Failed to render ${selector}:`, error);
      return null;
    }
  }

  function sanitizeHref(href) {
    const trimmed = String(href || '').trim();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return '#';
    }
    return trimmed;
  }

  // ---------------------------
  // Configuration
  // ---------------------------
  const DEFAULT_META = {
    brand: 'Royal Caribbean',
    ship: 'Adventure of the Seas',
    sailing: 'Feb 14–20, 2026',
    sailingLabel: '6-Night Western Caribbean & Perfect Day',
    port: 'Port Canaveral',
    checkIn: '12:00 PM',
    allAboard: '2:00 PM',
    tagline: 'Experience WOW',
    year: new Date().getFullYear(),
  };

  const NAV_ITEMS = [
    { id: 'index', href: 'index.html', icon: 'fa-home', text: 'Dashboard' },
    { id: 'itinerary', href: 'itinerary.html', icon: 'fa-route', text: 'Itinerary' },
    { id: 'rooms', href: 'rooms.html', icon: 'fa-bed', text: 'Rooms' },
    { id: 'dining', href: 'dining.html', icon: 'fa-utensils', text: 'Dining' },
    { id: 'photos', href: 'photos.html', icon: 'fa-images', text: 'Photos' },
    { id: 'contacts', href: 'contacts.html', icon: 'fa-phone-volume', text: 'Contacts' },
    { id: 'decks', href: 'decks.html', icon: 'fa-map', text: 'Decks' },
    { id: 'operations', href: 'operations.html', icon: 'fa-clipboard-check', text: 'Checklist' },
    { id: 'tips', href: 'tips.html', icon: 'fa-suitcase-rolling', text: 'Tips' },
  ];

  const BOTTOM_NAV_ITEMS = [
    { id: 'index', icon: 'fa-home', text: 'Home', href: 'index.html' },
    { id: 'itinerary', icon: 'fa-compass', text: 'Today', href: 'itinerary.html' },
    { id: 'quick', icon: 'fa-plus', text: 'Quick', action: 'quick-actions' },
    { id: 'decks', icon: 'fa-ship', text: 'Ship', href: 'decks.html' },
    { id: 'photos', icon: 'fa-images', text: 'Photos', href: 'photos.html' },
    { id: 'dining', icon: 'fa-utensils', text: 'Eat', href: 'dining.html' },
  ];

  const RCCL_COLORS = {
    primary: '#0052a5',
    primaryRgb: '0, 82, 165',
    accent: '#00a8e8',
    accentRgb: '0, 168, 232',
    light: '#f8f9fa',
    lightRgb: '248, 249, 250',
  };

  let deferredInstallPromptEvent = null;

  // ---------------------------
  // Utilities
  // ---------------------------
  const utils = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    isMobile: () => window.matchMedia('(max-width: 768px)').matches,
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    escapeHtml: (s) => {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    getCurrentPage: () => {
      const file = window.location.pathname.split('/').pop() || 'index.html';
      return file.replace('.html', '');
    },
    debounce: (fn, wait = 100) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },
    getCruiseStatus: () => {
      const embarkation = new Date('2026-02-14T14:00:00-05:00').getTime();
      const now = Date.now();
      const diff = embarkation - now;
      if (diff <= 0) {
        return { label: 'Sailing in progress', detail: 'Use itinerary for today\'s plan' };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      return { label: `${days}d ${hours}h to sail away`, detail: 'Complete checklist before embarkation' };
    },
  };

  // ---------------------------
  // Theme Manager
  // ---------------------------
  const ThemeManager = {
    applyLight() {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme-mode', 'light');
      localStorage.setItem('cruise-theme', 'light');
    },

    init() {
      this.applyLight();
    },
  };

  // ---------------------------
  // CSS Injection
  // ---------------------------
  function injectMinimalStyles() {
    const styleId = 'rccl-minimal-styles';
    const stylesheetId = 'rccl-minimal-stylesheet';
    if (document.getElementById(styleId) || document.getElementById(stylesheetId)) return;

    const cssHref = 'css/shared-layout.css?v=5';
    const linkEl = document.createElement('link');
    linkEl.id = stylesheetId;
    linkEl.rel = 'stylesheet';
    linkEl.href = cssHref;
    document.head.appendChild(linkEl);
    return;

    const styles = `
      /* ============================================================================
       * Minimal Layout Styles
       * ========================================================================== */
      
      :root {
        --rccl-primary: #0052a5;
        --rccl-primary-rgb: 0, 82, 165;
        --rccl-navy: #003b75;
        --rccl-navy-rgb: 0, 59, 117;
        --rccl-accent: #19c2ff;
        --rccl-accent-rgb: 25, 194, 255;
        --rccl-gold: #ffc93a;
        --rccl-gold-rgb: 255, 201, 58;
        --rccl-dark: #1a1a2e;
        --rccl-dark-rgb: 26, 26, 46;
        --rccl-light: #f8f9fa;
        --rccl-light-rgb: 248, 249, 250;
        --rccl-surface: #ffffff;
        --rccl-surface-rgb: 255, 255, 255;
        --rccl-text: #1a1a2e;
        --rccl-text-rgb: 26, 26, 46;
        --rccl-border: #e2e8f0;
        --rccl-border-rgb: 226, 232, 240;
        
        --rccl-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        --rccl-radius-sm: 4px;
        --rccl-radius-md: 8px;
        --rccl-radius-lg: 12px;
        --rccl-radius-xl: 16px;
        --rccl-radius-full: 9999px;
        
        --rccl-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --rccl-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
        --rccl-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
        
        --rccl-spacing-xs: 0.25rem;
        --rccl-spacing-sm: 0.5rem;
        --rccl-spacing-md: 1rem;
        --rccl-spacing-lg: 1.5rem;
        --rccl-spacing-xl: 2rem;

        /* Bridge legacy page tokens so all pages share one palette */
        --royal-blue: #0079d4;
        --royal-navy: #0b4f90;
        --royal-sky: #19c2ff;
        --royal-foam: #eef9ff;
        --royal-light: #f3fbff;
        --royal-gold: #ffc93a;
        --royal-ink: #11385f;
        --royal-white: #ffffff;
        --royal-border: rgba(0, 121, 212, 0.16);
        --royal-border-light: rgba(0, 121, 212, 0.08);
        --royal-shadow-lg: 0 14px 30px rgba(11, 79, 144, 0.12);
        --royal-shadow-xl: 0 20px 40px rgba(11, 79, 144, 0.14);
        --royal-transition: all 0.24s ease;

        /* Shared helper tokens used by legacy page modules */
        --ocean-gradient: linear-gradient(135deg, #0b4f90 0%, #0079d4 54%, #19c2ff 100%);
        --sky-gradient: linear-gradient(135deg, #eef9ff 0%, #ffffff 100%);
        --gold-gradient: linear-gradient(135deg, #ffe389 0%, #ffc93a 52%, #ffb020 100%);
        --shadow-light: 0 4px 12px rgba(11, 79, 144, 0.08);
        --shadow-medium: 0 8px 24px rgba(11, 79, 144, 0.12);
        --shadow-floating: 0 12px 36px rgba(11, 79, 144, 0.16);
        --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --transition-bounce: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --radius-xl: 24px;
        --radius-full: 9999px;
      }
/* Base */
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
      
      /* Header - Minimal */
      .app-header--minimal {
        position: sticky;
        top: 0;
        z-index: 100;
        background: linear-gradient(180deg, #ffffff 0%, #eff8ff 100%);
        border-bottom: 1px solid var(--rccl-border);
        box-shadow: 0 10px 26px rgba(var(--rccl-navy-rgb), 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;
      }

      .app-header--minimal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #0b4f90 0%, var(--rccl-primary) 35%, #00b6ff 70%, var(--rccl-gold) 100%);
      }

      .header-alert {
        width: 100%;
        background: linear-gradient(90deg, rgba(11, 79, 144, 0.1) 0%, rgba(25, 194, 255, 0.12) 60%, rgba(255, 201, 58, 0.18) 100%);
        border: 1px solid rgba(var(--rccl-primary-rgb), 0.14);
        border-radius: 14px;
        padding: 0.45rem 0.7rem;
        margin: 0.35rem 0 0.6rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .header-alert__main {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.76rem;
        font-weight: 700;
        color: #0d4f88;
      }

      .header-alert__meta {
        font-size: 0.73rem;
        color: #2d557f;
        opacity: 0.9;
        white-space: nowrap;
      }
      
      .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.85rem 1rem 1rem;
        max-width: 1280px;
        margin: 0 auto;
      }

      .header-context {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.25rem 0 0.15rem;
        margin-bottom: 0.15rem;
      }

      .header-context__meta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        color: #35557f;
        white-space: nowrap;
      }

      .header-context__meta i {
        color: var(--rccl-primary);
      }

      .header-context__divider {
        opacity: 0.45;
      }

      .header-timeline {
        width: 100%;
        border: 1px solid rgba(var(--rccl-primary-rgb), 0.14);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(236, 247, 255, 0.96) 100%);
        padding: 0.55rem 0.7rem;
        margin: 0.1rem 0 0.65rem;
      }

      .header-timeline__title {
        margin: 0 0 0.45rem;
        font-size: 0.73rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: #0b4f90;
      }

      .header-timeline__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.4rem;
      }

      .header-timeline__item {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        min-width: 0;
        padding: 0.42rem 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(var(--rccl-primary-rgb), 0.12);
        background: #ffffff;
      }

      .header-timeline__time {
        font-size: 0.69rem;
        font-weight: 800;
        color: #0b4f90;
        line-height: 1.2;
      }

      .header-timeline__event {
        font-size: 0.7rem;
        color: #1f4f78;
        line-height: 1.25;
      }
      
      .header-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .header-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--rccl-text);
        padding: 0.5rem;
        border-radius: var(--rccl-radius-md);
        border: 1px solid rgba(var(--rccl-primary-rgb), 0.12);
        background: linear-gradient(180deg, #ffffff 0%, #eef8ff 100%);
        transition: var(--rccl-transition);
      }
      
      .header-logo:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
      }
      
      .header-logo i {
        font-size: 1.5rem;
        color: #ffffff;
        background: linear-gradient(135deg, #0b4f90 0%, #0079d4 54%, var(--rccl-accent) 100%);
        border-radius: 0.75rem;
        width: 2.15rem;
        height: 2.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px rgba(var(--rccl-primary-rgb), 0.28);
      }
      
      .header-logo-text {
        display: flex;
        flex-direction: column;
      }
      
      .header-logo-title {
        font-weight: 700;
        font-size: 1.125rem;
        line-height: 1.2;
        color: var(--rccl-primary);
      }
      
      .header-logo-subtitle {
        font-size: 0.75rem;
        color: var(--rccl-text);
        opacity: 0.7;
        margin-top: 0.125rem;
      }
      
      .header-nav {
        display: none;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .header-nav__link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: var(--rccl-text);
        font-weight: 500;
        font-size: 0.84rem;
        border-radius: var(--rccl-radius-md);
        transition: var(--rccl-transition);
        white-space: nowrap;
        position: relative;
      }
      
      .header-nav__link:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        color: var(--rccl-primary);
      }

      .header-nav__link::after {
        content: '';
        position: absolute;
        left: 1rem;
        right: 1rem;
        bottom: 0.42rem;
        height: 2px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--rccl-primary) 0%, var(--rccl-accent) 100%);
        transform: scaleX(0);
        transform-origin: center;
        transition: transform 0.2s ease;
      }

      .header-nav__link:hover::after,
      .header-nav__link.active::after {
        transform: scaleX(1);
      }
      
      .header-nav__link.active {
        background: linear-gradient(135deg, #0b4f90 0%, #0079d4 54%, var(--rccl-accent) 100%);
        color: white;
        box-shadow: var(--rccl-shadow-sm);
      }
      
      .header-nav__link.active i {
        color: white;
      }
      
      .header-nav__link i {
        font-size: 1rem;
      }
      
      .header-actions {
        display: none;
        align-items: center;
        gap: 0.5rem;
      }
      
      .header-action {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-md);
        color: var(--rccl-text);
        cursor: pointer;
        transition: var(--rccl-transition);
      }
      
      .header-action:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        border-color: var(--rccl-primary);
      }

      .header-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.6rem 0.95rem;
        border-radius: var(--rccl-radius-full);
        border: 1px solid rgba(var(--rccl-primary-rgb), 0.2);
        background: #fff;
        color: var(--rccl-primary);
        font-size: 0.78rem;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
      }

      .header-cta--install {
        background: linear-gradient(135deg, #ffe389 0%, #ffc93a 52%, #ffb020 100%);
        border-color: rgba(255, 201, 58, 0.6);
        color: #0b3664;
      }

      .header-cta--install[hidden] {
        display: none !important;
      }
      
      /* Mobile Navigation */
      .mobile-nav-toggle {
        display: flex;
        width: 2.5rem;
        height: 2.5rem;
        align-items: center;
        justify-content: center;
        background: none;
        border: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-md);
        color: var(--rccl-text);
        cursor: pointer;
      }

      .mobile-quick-nav {
        width: 100%;
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-top: 0.5rem;
      }

      .mobile-quick-nav__link {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 44px;
        padding: 0.65rem 0.95rem;
        border: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-full);
        text-decoration: none;
        color: var(--rccl-text);
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .mobile-quick-nav__link.active {
        color: #fff;
        background: linear-gradient(135deg, #0b4f90 0%, #0079d4 54%, var(--rccl-accent) 100%);
        border-color: transparent;
      }

      /* Global page color normalization (theme lock) */
      body.app-theme-rcc {
        background: linear-gradient(180deg, #f4fbff 0%, #eaf6ff 100%) !important;
        color: var(--royal-ink) !important;
      }

      body.app-theme-rcc,
      body.app-theme-rcc.page-shell {
        padding-top: 0 !important;
      }

      body.app-theme-rcc {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body.app-theme-rcc *,
      body.app-theme-rcc *::before,
      body.app-theme-rcc *::after {
        box-sizing: border-box;
      }

      body.app-theme-rcc h1,
      body.app-theme-rcc h2,
      body.app-theme-rcc h3,
      body.app-theme-rcc h4 {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        color: var(--royal-navy);
      }

      body.app-theme-rcc .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      body.app-theme-rcc .main-navigation,
      body.app-theme-rcc .category-card,
      body.app-theme-rcc .deck-grid,
      body.app-theme-rcc .deck-card,
      body.app-theme-rcc .reservation-panel,
      body.app-theme-rcc .day-navigation,
      body.app-theme-rcc .port-item,
      body.app-theme-rcc .room-card,
      body.app-theme-rcc .quick-action-item,
      body.app-theme-rcc .stat-card,
      body.app-theme-rcc .card,
      body.app-theme-rcc .info-card,
      body.app-theme-rcc .checklist-card {
        background: #ffffff !important;
        border: 1px solid var(--royal-border) !important;
        box-shadow: var(--royal-shadow-lg) !important;
      }

      body.app-theme-rcc .main-navigation__search,
      body.app-theme-rcc .pill-btn,
      body.app-theme-rcc .deck-pill,
      body.app-theme-rcc .count-chip,
      body.app-theme-rcc .feature-tag,
      body.app-theme-rcc .tag,
      body.app-theme-rcc .room-type-filter,
      body.app-theme-rcc .quick-filter-btn {
        background: var(--royal-foam) !important;
        border-color: var(--royal-border) !important;
        color: var(--royal-ink) !important;
      }

      body.app-theme-rcc .deck-grid__title,
      body.app-theme-rcc .section-title,
      body.app-theme-rcc h2,
      body.app-theme-rcc h3 {
        color: var(--royal-navy) !important;
      }

      body.app-theme-rcc .deck-grid__subtitle,
      body.app-theme-rcc .section-subtitle,
      body.app-theme-rcc p {
        color: #1f4f78;
      }

      /* Card readability normalization across page-level style variants */
      body.app-theme-rcc .deck-card,
      body.app-theme-rcc .room-card,
      body.app-theme-rcc .category-card,
      body.app-theme-rcc .stat-card,
      body.app-theme-rcc .summary-card,
      body.app-theme-rcc .info-card,
      body.app-theme-rcc .checklist-card,
      body.app-theme-rcc .port-item,
      body.app-theme-rcc .reservation-panel,
      body.app-theme-rcc .action-item,
      body.app-theme-rcc .quick-action-item {
        color: #123f66 !important;
      }

      body.app-theme-rcc .deck-card,
      body.app-theme-rcc .room-card,
      body.app-theme-rcc .category-card,
      body.app-theme-rcc .stat-card,
      body.app-theme-rcc .summary-card,
      body.app-theme-rcc .info-card,
      body.app-theme-rcc .checklist-card,
      body.app-theme-rcc .action-item,
      body.app-theme-rcc .quick-action-item {
        position: relative;
        overflow: hidden;
        border-radius: 18px !important;
        transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease !important;
      }

      body.app-theme-rcc .deck-card::before,
      body.app-theme-rcc .room-card::before,
      body.app-theme-rcc .category-card::before,
      body.app-theme-rcc .stat-card::before,
      body.app-theme-rcc .summary-card::before,
      body.app-theme-rcc .info-card::before,
      body.app-theme-rcc .checklist-card::before,
      body.app-theme-rcc .action-item::before,
      body.app-theme-rcc .quick-action-item::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(145deg, rgba(25, 194, 255, 0.08) 0%, rgba(255, 255, 255, 0) 38%);
      }

      body.app-theme-rcc .deck-card:hover,
      body.app-theme-rcc .room-card:hover,
      body.app-theme-rcc .category-card:hover,
      body.app-theme-rcc .stat-card:hover,
      body.app-theme-rcc .summary-card:hover,
      body.app-theme-rcc .info-card:hover,
      body.app-theme-rcc .checklist-card:hover,
      body.app-theme-rcc .action-item:hover,
      body.app-theme-rcc .quick-action-item:hover,
      body.app-theme-rcc .deck-card:focus-within,
      body.app-theme-rcc .room-card:focus-within,
      body.app-theme-rcc .category-card:focus-within,
      body.app-theme-rcc .stat-card:focus-within,
      body.app-theme-rcc .summary-card:focus-within,
      body.app-theme-rcc .info-card:focus-within,
      body.app-theme-rcc .checklist-card:focus-within,
      body.app-theme-rcc .action-item:focus-within,
      body.app-theme-rcc .quick-action-item:focus-within {
        transform: translateY(-4px);
        box-shadow: var(--royal-shadow-xl) !important;
        border-color: rgba(0, 121, 212, 0.28) !important;
      }

      body.app-theme-rcc .deck-card h3,
      body.app-theme-rcc .room-card h3,
      body.app-theme-rcc .category-card h3,
      body.app-theme-rcc .stat-card h3,
      body.app-theme-rcc .summary-card h3,
      body.app-theme-rcc .info-card h3,
      body.app-theme-rcc .checklist-card h3,
      body.app-theme-rcc .action-item h4,
      body.app-theme-rcc .deck-info__heading h3 {
        color: #0b4f90 !important;
      }

      body.app-theme-rcc .deck-card p,
      body.app-theme-rcc .room-card p,
      body.app-theme-rcc .category-card p,
      body.app-theme-rcc .stat-card p,
      body.app-theme-rcc .summary-card p,
      body.app-theme-rcc .info-card p,
      body.app-theme-rcc .checklist-card p,
      body.app-theme-rcc .action-item p,
      body.app-theme-rcc .deck-subtitle,
      body.app-theme-rcc .room-meta-details {
        color: #174d7b !important;
      }

      body.app-theme-rcc .feature-tag,
      body.app-theme-rcc .count-chip,
      body.app-theme-rcc .chip,
      body.app-theme-rcc .tag,
      body.app-theme-rcc .room-location {
        color: #11416d !important;
      }

      body.app-theme-rcc .btn--primary {
        background: linear-gradient(135deg, #ffe389 0%, #ffc93a 52%, #ffb020 100%) !important;
        color: #0b3664 !important;
        border-color: rgba(255, 176, 32, 0.5) !important;
      }

      body.app-theme-rcc .btn--secondary {
        background: #ffffff !important;
        color: #0b4f90 !important;
        border-color: rgba(11, 79, 144, 0.32) !important;
      }

      body.app-theme-rcc .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: var(--radius-lg);
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: var(--transition-smooth);
        text-decoration: none;
        white-space: nowrap;
      }

      /* Hero Standardization */
      body.app-theme-rcc .deck-hero,
      body.app-theme-rcc .hero.hero--rooms,
      body.app-theme-rcc .hero.hero--itinerary {
        position: relative;
        overflow: hidden;
        background: linear-gradient(125deg, #0069bf 0%, #0099ea 54%, #29d2ff 100%) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.22) !important;
        box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.2) !important;
      }

      body.app-theme-rcc .deck-hero::before,
      body.app-theme-rcc .hero.hero--rooms::before,
      body.app-theme-rcc .hero.hero--itinerary::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 16%, rgba(255, 255, 255, 0.3), transparent 32%),
          radial-gradient(circle at 88% 84%, rgba(255, 255, 255, 0.2), transparent 38%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.02) 60%, rgba(0, 0, 0, 0.12) 100%);
        pointer-events: none;
      }

      body.app-theme-rcc .deck-hero::after,
      body.app-theme-rcc .hero.hero--rooms::after,
      body.app-theme-rcc .hero.hero--itinerary::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 8px;
        background: linear-gradient(90deg, rgba(255, 201, 58, 0.18) 0%, rgba(255, 201, 58, 0.7) 50%, rgba(255, 201, 58, 0.18) 100%);
      }

      body.app-theme-rcc .deck-hero .container,
      body.app-theme-rcc .hero .container {
        position: relative;
        z-index: 1;
      }

      body.app-theme-rcc .deck-hero__eyebrow,
      body.app-theme-rcc .deck-hero__title,
      body.app-theme-rcc .deck-hero__subtitle,
      body.app-theme-rcc .hero__badge,
      body.app-theme-rcc .hero__title,
      body.app-theme-rcc .hero__description,
      body.app-theme-rcc .hero__status {
        color: #ffffff !important;
      }

      body.app-theme-rcc .deck-hero__eyebrow,
      body.app-theme-rcc .hero__eyebrow,
      body.app-theme-rcc .hero__badge {
        background: rgba(255, 255, 255, 0.16) !important;
        border: 1px solid rgba(255, 255, 255, 0.34) !important;
        backdrop-filter: blur(4px);
      }

      body.app-theme-rcc .deck-hero__subtitle,
      body.app-theme-rcc .hero__description {
        color: rgba(247, 252, 255, 0.94) !important;
      }

      body.app-theme-rcc .deck-hero__actions .btn--primary,
      body.app-theme-rcc .hero__actions .btn--primary {
        background: linear-gradient(135deg, #ffe389 0%, #ffc93a 52%, #ffb020 100%) !important;
        border: none !important;
        color: #06264b !important;
        box-shadow: 0 10px 20px rgba(var(--rccl-gold-rgb), 0.34) !important;
      }

      body.app-theme-rcc .deck-hero__actions .btn--secondary,
      body.app-theme-rcc .hero__actions .btn--secondary {
        background: rgba(255, 255, 255, 0.12) !important;
        border: 1px solid rgba(255, 255, 255, 0.42) !important;
        color: #ffffff !important;
      }

      body .deck-hero__actions .btn:hover,
      body .hero__actions .btn:hover {
        transform: translateY(-1px);
      }

      /* Rooms/Itinerary component-level color lock */
      body.app-theme-rcc .room-card__header,
      body.app-theme-rcc .view-deck-btn,
      body.app-theme-rcc .room-number,
      body.app-theme-rcc .timeline__icon,
      body.app-theme-rcc .itinerary-day__number {
        background: linear-gradient(135deg, #0b4f90 0%, #0079d4 54%, #19c2ff 100%) !important;
        color: #ffffff !important;
      }

      body.app-theme-rcc .room-card__preview {
        background: linear-gradient(135deg, #eff8ff 0%, #ddf2ff 100%) !important;
      }

      body.app-theme-rcc .nav-bar {
        background: #ffffff !important;
        border-bottom: 1px solid var(--royal-border) !important;
        box-shadow: var(--royal-shadow-lg) !important;
      }

      body.app-theme-rcc .search-box input,
      body.app-theme-rcc .search-box select,
      body.app-theme-rcc .search-input {
        background: var(--royal-foam) !important;
        border: 1px solid var(--royal-border) !important;
        color: var(--royal-ink) !important;
      }

      body.app-theme-rcc .room-card--ocean-view {
        border-left-color: #19c2ff !important;
      }

      body.app-theme-rcc .room-card--balcony {
        border-left-color: #ffc93a !important;
      }

      body.app-theme-rcc .room-card--interior {
        border-left-color: #7e9dbd !important;
      }

      body.app-theme-rcc .deck-cards {
        align-items: stretch;
      }

      body.app-theme-rcc .deck-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }

      body.app-theme-rcc .deck-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 30px rgba(11, 79, 144, 0.18) !important;
        border-color: rgba(25, 194, 255, 0.7) !important;
      }

      body.app-theme-rcc .deck-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      body.app-theme-rcc .deck-card__cta {
        margin-top: auto;
      }

      body.app-theme-rcc .pill-btn,
      body.app-theme-rcc .deck-card__cta,
      body.app-theme-rcc .group-link {
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      body.app-theme-rcc .pill-btn:hover,
      body.app-theme-rcc .deck-card__cta:hover,
      body.app-theme-rcc .group-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(11, 79, 144, 0.18);
      }

      .header-nav__link:focus-visible,
      .header-action:focus-visible,
      .mobile-nav-toggle:focus-visible,
      .mobile-quick-nav__link:focus-visible,
      .footer-cta:focus-visible,
      .footer-nav__link:focus-visible,
      .footer-legal__link:focus-visible,
      .footer-social__link:focus-visible,
      .quick-action:focus-visible,
      .sheet-close:focus-visible {
        outline: 3px solid rgba(var(--rccl-accent-rgb), 0.35);
        outline-offset: 2px;
      }
      
      /* Footer - Minimal */
      .app-footer--minimal {
        background: linear-gradient(180deg, #0d61a8 0%, #0a4e8f 100%);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        color: #f4fbff;
        margin-top: auto;
        position: relative;
        overflow: hidden;
      }

      .app-footer--minimal::before {
        content: '';
        position: absolute;
        top: -25%;
        right: -8%;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 70%);
        pointer-events: none;
      }
      
      .footer-container {
        padding: 2rem 1rem 2.25rem;
        max-width: 1280px;
        margin: 0 auto;
      }
      
      .footer-primary {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        margin-bottom: 1.5rem;
      }
      
      .footer-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .footer-logo {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--rccl-gold) 0%, #ff8f00 100%);
        color: #072b53;
        border-radius: var(--rccl-radius-md);
        font-size: 1.25rem;
      }
      
      .footer-tagline {
        display: flex;
        flex-direction: column;
      }
      
      .footer-heading {
        font-size: 1.125rem;
        font-weight: 700;
        color: #ffffff !important;
        margin: 0;
      }
      
      .footer-subheading {
        font-size: 0.8rem;
        color: rgba(234, 243, 255, 0.92) !important;
        margin: 0.25rem 0 0;
      }
      
      .footer-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .footer-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: linear-gradient(135deg, #ffe389 0%, #ffc93a 52%, #ffb020 100%);
        color: #0b3664;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        border-radius: var(--rccl-radius-md);
        border: 1px solid rgba(255, 255, 255, 0.22);
        transition: var(--rccl-transition);
      }

      .footer-cta--secondary {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.32);
      }

      .footer-cta--secondary:hover {
        background: rgba(255, 255, 255, 0.22);
        border-color: rgba(255, 255, 255, 0.58);
      }
      
      .footer-cta:hover {
        background: linear-gradient(135deg, #ffe9a8 0%, #ffd15b 52%, #ffb83a 100%);
        transform: translateY(-1px);
      }
      
      .footer-essentials {
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        margin-bottom: 1.5rem;
      }

      .footer-columns {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.85rem;
        margin-bottom: 1.15rem;
      }

      .footer-panel {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
      }

      .footer-panel__title {
        margin: 0 0 0.35rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: #ffffff !important;
      }

      .footer-panel__meta {
        margin: 0;
        font-size: 0.75rem;
        color: rgba(239, 247, 255, 0.96) !important;
      }
      
      .footer-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }
      
      .footer-nav__link {
        color: #eef7ff !important;
        text-decoration: none;
        font-size: 0.875rem;
        transition: var(--rccl-transition);
      }
      
      .footer-nav__link:hover {
        color: #ffffff;
      }
      
      .footer-meta {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }
      
      .footer-legal {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: rgba(239, 247, 255, 0.96) !important;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .footer-legal__link {
        color: inherit;
        text-decoration: none;
        transition: var(--rccl-transition);
      }
      
      .footer-legal__link:hover {
        color: #ffffff;
        opacity: 1;
      }

      .footer-legal__text {
        color: inherit !important;
      }
      
      .footer-separator {
        opacity: 0.5;
      }
      
      .footer-social {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .footer-social__link {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: var(--rccl-radius-md);
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        text-decoration: none;
        transition: var(--rccl-transition);
        cursor: pointer;
      }
      
      .footer-social__link:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.52);
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .header-container {
          padding: 0.62rem 0.82rem 0.72rem;
          gap: 0.42rem;
        }

        body.app-theme-rcc .container {
          padding-left: 14px !important;
          padding-right: 14px !important;
        }

        body.app-theme-rcc main > section,
        body.app-theme-rcc main > div {
          margin-top: 14px;
        }

        body.app-theme-rcc .deck-grid,
        body.app-theme-rcc .main-navigation,
        body.app-theme-rcc .category-card,
        body.app-theme-rcc .quick-actions,
        body.app-theme-rcc .stats-section,
        body.app-theme-rcc .rooms-section {
          border-radius: 16px !important;
        }

        body.app-theme-rcc .deck-grid__header,
        body.app-theme-rcc .section-header {
          gap: 10px;
          margin-bottom: 14px;
        }

        body.app-theme-rcc .deck-grid__title,
        body.app-theme-rcc .section-title {
          font-size: clamp(1.38rem, 6.2vw, 1.76rem) !important;
          line-height: 1.16 !important;
        }

        body.app-theme-rcc .deck-grid__subtitle,
        body.app-theme-rcc .section-subtitle {
          font-size: 0.96rem !important;
          line-height: 1.45 !important;
        }

        body.app-theme-rcc .main-navigation__search,
        body.app-theme-rcc .search-box {
          min-height: 52px;
        }

        body.app-theme-rcc .main-navigation__search input,
        body.app-theme-rcc .search-box input,
        body.app-theme-rcc input[type="search"],
        body.app-theme-rcc input[type="text"],
        body.app-theme-rcc select {
          min-height: 52px !important;
          font-size: 16px !important;
          line-height: 1.2 !important;
        }

        body.app-theme-rcc .pill-btn,
        body.app-theme-rcc .filter-btn,
        body.app-theme-rcc .room-type-filter,
        body.app-theme-rcc .btn,
        body.app-theme-rcc .deck-card__cta,
        body.app-theme-rcc .view-deck-btn,
        body.app-theme-rcc .action-item {
          min-height: 44px !important;
          font-size: 0.96rem !important;
        }

        body.app-theme-rcc .count-chip,
        body.app-theme-rcc .feature-tag,
        body.app-theme-rcc .chip {
          min-height: 38px !important;
          padding-top: 7px !important;
          padding-bottom: 7px !important;
          font-size: 0.93rem !important;
        }

        body.app-theme-rcc .deck-cards,
        body.app-theme-rcc .rooms-grid,
        body.app-theme-rcc .actions-grid {
          gap: 14px !important;
        }

        body.app-theme-rcc .deck-card,
        body.app-theme-rcc .room-card,
        body.app-theme-rcc .action-item {
          border-radius: 16px !important;
        }

        body.app-theme-rcc .room-card__header,
        body.app-theme-rcc .deck-info,
        body.app-theme-rcc .room-card__content,
        body.app-theme-rcc .quick-actions,
        body.app-theme-rcc .nav-bar {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        body.app-theme-rcc .room-number,
        body.app-theme-rcc .deck-number {
          width: 40px !important;
          height: 40px !important;
          font-size: 1rem !important;
        }

        body.app-theme-rcc .main-navigation__filters {
          overflow-x: auto;
          padding-bottom: 6px;
        }

        body.app-theme-rcc .pill-btn {
          white-space: nowrap;
        }

        body.app-theme-rcc .main-navigation__hint {
          display: none;
        }

        .header-context {
          display: none;
        }

        .header-alert {
          margin: 0.2rem 0 0.28rem;
          padding: 0.45rem 0.62rem;
          border-radius: 12px;
          align-items: center;
        }

        .header-alert__meta {
          display: none;
        }

        .header-context__meta {
          white-space: normal;
          font-size: 0.68rem;
        }

        .header-brand {
          flex: 1;
        }

        .header-logo {
          padding: 0.42rem 0.5rem;
          gap: 0.52rem;
        }

        .header-logo i {
          width: 1.95rem;
          height: 1.95rem;
          font-size: 1.3rem;
        }

        .header-logo-title {
          font-size: 0.98rem;
          line-height: 1.12;
        }

        .header-logo-subtitle {
          font-size: 0.68rem;
        }

        .header-timeline {
          display: none;
        }

        .header-timeline__list {
          display: flex;
          overflow-x: auto;
          padding-bottom: 0.15rem;
          gap: 0.35rem;
          scroll-snap-type: x proximity;
        }

        .header-timeline__item {
          min-width: 124px;
          scroll-snap-align: start;
        }

        .header-nav {
          width: 100%;
          flex-direction: column;
          align-items: stretch;
          gap: 0.35rem;
          padding-top: 0.35rem;
        }

        .header-nav__link {
          width: 100%;
          justify-content: flex-start;
          min-height: 44px;
        }

        .header-actions {
          width: 100%;
          justify-content: flex-end;
          padding-top: 0.25rem;
        }

        .header-cta {
          width: 100%;
          justify-content: center;
          min-height: 44px;
        }

        .header-nav[aria-hidden="true"],
        .header-actions[aria-hidden="true"] {
          display: none !important;
        }

        .footer-actions {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
        }
        
        .footer-cta {
          flex: initial;
          justify-content: center;
          min-height: 44px;
          padding: 0.64rem 0.72rem;
          font-size: 0.8rem;
          border-radius: 12px;
        }

        .footer-container {
          padding: 1.3rem 0.95rem 1.45rem;
        }

        .footer-primary {
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          gap: 0.72rem;
        }

        .footer-essentials {
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .footer-columns {
          margin-bottom: 0.85rem;
        }

        .footer-panel {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.28);
          padding: 0.74rem 0.82rem;
        }

        .footer-nav {
          gap: 0.5rem;
        }

        .footer-nav__link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0.4rem 0.64rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.08);
          font-size: 0.79rem;
        }

        .footer-meta {
          gap: 0.7rem;
        }

        .footer-social {
          display: none;
        }

        .footer-legal {
          font-size: 0.82rem;
        }
      }

      @media (max-width: 480px) {
        body.app-theme-rcc .container {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        body.app-theme-rcc .deck-grid__title,
        body.app-theme-rcc .section-title {
          font-size: clamp(1.24rem, 7.2vw, 1.48rem) !important;
        }

        body.app-theme-rcc .pill-btn,
        body.app-theme-rcc .filter-btn,
        body.app-theme-rcc .btn,
        body.app-theme-rcc .deck-card__cta,
        body.app-theme-rcc .view-deck-btn {
          min-height: 42px !important;
          font-size: 0.92rem !important;
        }

        body.app-theme-rcc .count-chip,
        body.app-theme-rcc .feature-tag,
        body.app-theme-rcc .chip {
          min-height: 36px !important;
          font-size: 0.88rem !important;
        }
      }
      
      @media (min-width: 769px) {
        .app-header--minimal {
          box-shadow: 0 14px 34px rgba(var(--rccl-navy-rgb), 0.14);
        }

        .header-container {
          padding: 0.95rem 1.25rem 1.2rem;
          gap: 0.7rem;
        }

        .header-alert {
          margin: 0.2rem 0 0.4rem;
          padding: 0.55rem 0.85rem;
          border-radius: 16px;
          background: linear-gradient(90deg, rgba(11, 79, 144, 0.12) 0%, rgba(25, 194, 255, 0.14) 62%, rgba(255, 201, 58, 0.2) 100%);
        }

        .header-alert__main {
          font-size: 0.85rem;
          letter-spacing: 0.01em;
        }

        .header-alert__meta {
          font-size: 0.79rem;
        }

        .header-context {
          margin-bottom: 0.2rem;
          padding: 0.2rem 0 0;
        }

        .header-context__meta {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(var(--rccl-primary-rgb), 0.16);
          border-radius: 999px;
          padding: 0.35rem 0.7rem;
          font-size: 0.74rem;
          color: #1f4f78;
        }

        .header-timeline {
          padding: 0.68rem 0.78rem 0.74rem;
          border-radius: 16px;
          margin: 0.06rem 0 0.55rem;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(230, 245, 255, 0.96) 100%);
          box-shadow: 0 8px 22px rgba(11, 79, 144, 0.08);
        }

        .header-timeline__title {
          font-size: 0.76rem;
          margin-bottom: 0.52rem;
          letter-spacing: 0.05em;
        }

        .header-timeline__item {
          padding: 0.52rem 0.62rem;
          border-radius: 12px;
          border-color: rgba(var(--rccl-primary-rgb), 0.16);
        }

        .header-timeline__time {
          font-size: 0.74rem;
        }

        .header-timeline__event {
          font-size: 0.75rem;
        }

        .header-brand {
          min-width: 290px;
        }

        .header-logo {
          padding: 0.58rem 0.7rem;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(11, 79, 144, 0.1);
        }

        .header-logo-title {
          font-size: 1.22rem;
          line-height: 1.08;
        }

        .header-logo-subtitle {
          font-size: 0.79rem;
        }

        .header-nav,
        .header-actions {
          display: flex;
        }

        .header-nav {
          flex: 1;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.35rem;
          border: 1px solid rgba(var(--rccl-primary-rgb), 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 8px 20px rgba(11, 79, 144, 0.08);
        }

        .header-nav__link {
          min-height: 40px;
          padding: 0.62rem 0.86rem;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .header-actions {
          justify-content: flex-end;
          min-width: 170px;
        }

        .header-cta {
          min-height: 40px;
          padding: 0.58rem 0.86rem;
          border-color: rgba(var(--rccl-primary-rgb), 0.24);
          box-shadow: 0 6px 14px rgba(11, 79, 144, 0.08);
        }

        .header-action {
          width: 2.35rem;
          height: 2.35rem;
        }

        .mobile-nav-toggle {
          display: none;
        }

        .mobile-quick-nav {
          display: none;
        }

        .footer-primary {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.2rem;
        }

        .footer-meta {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          flex-wrap: wrap;
        }

        .footer-actions {
          width: auto;
          justify-content: flex-end;
        }

        .footer-columns {
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 1rem;
        }

        .footer-container {
          padding: 2.45rem 1.35rem 2.4rem;
        }

        .footer-brand {
          gap: 0.95rem;
        }

        .footer-logo {
          width: 2.9rem;
          height: 2.9rem;
          font-size: 1.35rem;
          box-shadow: 0 10px 22px rgba(7, 43, 83, 0.34);
        }

        .footer-heading {
          font-size: 1.32rem;
          line-height: 1.15;
        }

        .footer-subheading {
          font-size: 0.86rem;
        }

        .footer-actions .footer-cta {
          min-height: 42px;
          padding: 0.72rem 1.1rem;
          font-size: 0.84rem;
          border-radius: 13px;
        }

        .footer-panel {
          min-height: 104px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(255, 255, 255, 0.13);
        }

        .footer-panel__title {
          font-size: 0.83rem;
        }

        .footer-panel__meta {
          font-size: 0.79rem;
          line-height: 1.45;
        }

        .footer-nav {
          justify-content: flex-start;
          gap: 0.62rem;
        }

        .footer-nav__link {
          padding: 0.34rem 0.72rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.08);
          font-size: 0.81rem;
        }

        .footer-social__link {
          width: 2.15rem;
          height: 2.15rem;
        }

        .footer-meta {
          padding-top: 0.2rem;
        }
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes riseIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      body.app-theme-rcc main > section,
      body.app-theme-rcc main > div {
        animation: riseIn 0.45s ease both;
      }

      body.app-theme-rcc main > section:nth-of-type(2),
      body.app-theme-rcc main > div:nth-of-type(2) {
        animation-delay: 0.05s;
      }

      body.app-theme-rcc main > section:nth-of-type(3),
      body.app-theme-rcc main > div:nth-of-type(3) {
        animation-delay: 0.1s;
      }

      @media (prefers-reduced-motion: reduce) {
        body.app-theme-rcc main > section,
        body.app-theme-rcc main > div {
          animation: none;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // ---------------------------
  // Header Component
  // ---------------------------
  function renderHeader() {
    return safeMount('#sharedHeader', () => {
      const currentPage = utils.getCurrentPage();
      const cruiseStatus = utils.getCruiseStatus();
      
      const navLinks = NAV_ITEMS.map(item => `
        <a href="${sanitizeHref(item.href)}"
           class="header-nav__link ${currentPage === item.id ? 'active' : ''}"
           ${currentPage === item.id ? 'aria-current="page"' : ''}>
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          <span>${utils.escapeHtml(item.text)}</span>
        </a>
      `).join('');

      const timelineItems = [
        { time: 'Day 1 · 2:00 PM', event: 'All aboard' },
        { time: 'Day 3 · 11:00 AM', event: 'Grand Cayman tender opens' },
        { time: 'Day 4 · 8:30 AM', event: 'Falmouth gangway' },
        { time: 'Day 6 · 7:30 AM', event: 'CocoCay gangway' },
      ].map(item => `
        <li class="header-timeline__item">
          <span class="header-timeline__time">${utils.escapeHtml(item.time)}</span>
          <span class="header-timeline__event">${utils.escapeHtml(item.event)}</span>
        </li>
      `).join('');

      return `
        <header class="app-header--minimal app-header--rccl-site" role="banner">
          <div class="header-utility">
            <div class="header-utility__inner">
              <div class="header-utility__left">
                <span class="header-utility__crumb">Photo Library | ${utils.escapeHtml(DEFAULT_META.ship)}</span>
              </div>
              <a href="https://www.royalcaribbean.com/cruise-deals" target="_blank" rel="noopener noreferrer" class="header-utility__promo">
                <i class="fas fa-crown" aria-hidden="true"></i>
                Cruises - Amazing Cruise Deals
              </a>
            </div>
          </div>

          <div class="header-container">
            <div class="header-brand">
              <a href="${sanitizeHref('index.html')}" class="header-logo">
                <i class="fas fa-crown" aria-hidden="true"></i>
                <div class="header-logo-text">
                  <span class="header-logo-title">${utils.escapeHtml(DEFAULT_META.brand)}</span>
                  <span class="header-logo-subtitle">${utils.escapeHtml(DEFAULT_META.ship)} · ${utils.escapeHtml(cruiseStatus.label)}</span>
                </div>
              </a>
            </div>

            <nav class="header-nav" id="headerPrimaryNav" aria-label="Primary navigation">
              ${navLinks}
            </nav>

            <div class="header-actions" id="headerHeaderActions">
              <a href="${sanitizeHref('contacts.html')}" class="header-cta header-cta--help">
                <span>Need help?</span>
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
              </a>
              <a href="${sanitizeHref('index.html')}" class="header-action" aria-label="Search">
                <i class="fas fa-search" aria-hidden="true"></i>
              </a>
              <a href="${sanitizeHref('photos.html')}" class="header-action" aria-label="Favorites">
                <i class="fas fa-heart" aria-hidden="true"></i>
              </a>
              <a href="${sanitizeHref('operations.html')}" class="header-cta header-cta--signin">
                <span>Sign In</span>
              </a>
              <button type="button" class="header-cta header-cta--install" id="pwaInstallButton" hidden aria-hidden="true">
                <i class="fas fa-download" aria-hidden="true"></i>
                <span>Install App</span>
              </button>
              <button class="header-action" id="notificationsToggle" aria-label="Notifications">
                <i class="fas fa-bell" aria-hidden="true"></i>
              </button>
            </div>

            <button class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="headerPrimaryNav">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </button>

            <nav class="mobile-quick-nav" aria-label="Mobile quick navigation">
              ${NAV_ITEMS.map(item => `
                <a href="${sanitizeHref(item.href)}"
                   class="mobile-quick-nav__link ${currentPage === item.id ? 'active' : ''}"
                   ${currentPage === item.id ? 'aria-current="page"' : ''}>
                  <i class="fas ${item.icon}" aria-hidden="true"></i>
                  <span>${utils.escapeHtml(item.text)}</span>
                </a>
              `).join('')}
            </nav>
          </div>
        </header>
      `;
    });
  }

  // ---------------------------
  // Footer Component
  // ---------------------------
  function renderFooter() {
    return safeMount('#sharedFooter', () => {
      return `
        <footer class="app-footer--minimal app-footer--rccl-site" role="contentinfo">
          <div class="footer-container">
            <div class="footer-social-row" aria-label="Social links">
              <a href="https://facebook.com/royalcaribbean" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
              <a href="https://instagram.com/royalcaribbean" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
              <a href="https://tiktok.com/@royalcaribbean" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok" aria-hidden="true"></i></a>
              <a href="https://youtube.com/@RoyalCaribbeanInternational" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
              <a href="https://x.com/royalcaribbean" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fab fa-x-twitter" aria-hidden="true"></i></a>
              <a href="https://pinterest.com/royalcaribbean" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><i class="fab fa-pinterest-p" aria-hidden="true"></i></a>
            </div>

            <div class="footer-country">
              <button type="button" class="footer-country__btn" aria-label="Country: United States">
                <span>🇺🇸</span>
                <span>United States</span>
              </button>
            </div>

            <p class="footer-copyright">© ${DEFAULT_META.year} Royal Caribbean Cruises</p>

            <nav class="footer-legal-links" aria-label="Legal links">
              <a href="https://www.royalcaribbean.com/resources/guest-terms" class="footer-legal__link" target="_blank" rel="noopener noreferrer">Cruise contract</a>
              <a href="https://www.royalcaribbean.com/company/about-us" class="footer-legal__link" target="_blank" rel="noopener noreferrer">About us</a>
              <a href="https://www.royalcaribbean.com/resources/privacy-policy" class="footer-legal__link" target="_blank" rel="noopener noreferrer">Privacy policy</a>
              <a href="https://www.royalcaribbean.com/resources/terms-and-conditions" class="footer-legal__link" target="_blank" rel="noopener noreferrer">Terms of use</a>
              <a href="https://www.royalcaribbeangroup.com/careers/" class="footer-legal__link" target="_blank" rel="noopener noreferrer">Careers</a>
              <a href="https://www.royalcaribbean.com/resources/travel-updates" class="footer-legal__link" target="_blank" rel="noopener noreferrer">Travel updates</a>
            </nav>

            <div class="footer-brands" aria-label="Royal Caribbean brands">
              <span class="footer-brand-mark">Royal Caribbean Group</span>
              <span class="footer-brand-mark">Royal Caribbean</span>
              <span class="footer-brand-mark">Celebrity Cruises</span>
              <span class="footer-brand-mark">Silversea</span>
            </div>
          </div>
        </footer>
      `;
    });
  }

  // ---------------------------
  // Bottom Navigation
  // ---------------------------
  function renderBottomNav() {
    return safeMount('#sharedBottomNav', (mount) => {
      mount.innerHTML = '';
      return '';
    });
  }

  // ---------------------------
  // Mount Normalization
  // ---------------------------
  function ensureSharedMounts() {
    if (!document.body) return;

    let headerMount = document.getElementById('sharedHeader');
    if (!headerMount) {
      headerMount = document.createElement('div');
      headerMount.id = 'sharedHeader';
      const primaryMain = document.querySelector('main');
      if (primaryMain && primaryMain.parentNode) {
        primaryMain.parentNode.insertBefore(headerMount, primaryMain);
      } else {
        document.body.insertBefore(headerMount, document.body.firstChild);
      }
    }

    let footerMount = document.getElementById('sharedFooter');
    if (!footerMount) {
      footerMount = document.createElement('div');
      footerMount.id = 'sharedFooter';
      const bodyScripts = Array.from(document.body.querySelectorAll('script'));
      const insertionTarget = bodyScripts.length ? bodyScripts[0] : null;
      if (insertionTarget && insertionTarget.parentNode) {
        insertionTarget.parentNode.insertBefore(footerMount, insertionTarget);
      } else {
        document.body.appendChild(footerMount);
      }
    }

    if (!document.getElementById('sharedBottomNav')) {
      const bottomNavMount = document.createElement('div');
      bottomNavMount.id = 'sharedBottomNav';
      document.body.appendChild(bottomNavMount);
    }
  }

  // ---------------------------
  // Event Handlers
  // ---------------------------
  function initEventHandlers() {
    function showToast(message) {
      let live = utils.qs('#sharedStatusLive');
      if (!live) {
        live = document.createElement('div');
        live.id = 'sharedStatusLive';
        live.className = 'sr-only';
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        document.body.appendChild(live);
      }
      live.textContent = message;
    }

    const notificationsToggle = utils.qs('#notificationsToggle');
    if (notificationsToggle) {
      notificationsToggle.addEventListener('click', () => {
        showToast('Notifications center coming soon.');
      });
    }

    const installBtn = utils.qs('#pwaInstallButton');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const setInstallButtonVisible = (visible) => {
      if (!installBtn) return;
      installBtn.hidden = !visible;
      installBtn.setAttribute('aria-hidden', String(!visible));
    };

    if (installBtn && isStandalone) {
      setInstallButtonVisible(false);
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPromptEvent = event;
      if (!isStandalone) {
        setInstallButtonVisible(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPromptEvent = null;
      setInstallButtonVisible(false);
      localStorage.setItem('pwa_installed_at', new Date().toISOString());
      showToast('App installed successfully.');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredInstallPromptEvent) {
          showToast('Install option is not available yet on this device.');
          return;
        }

        deferredInstallPromptEvent.prompt();
        const choice = await deferredInstallPromptEvent.userChoice.catch(() => null);
        if (choice && choice.outcome === 'accepted') {
          showToast('Install started.');
          setInstallButtonVisible(false);
        } else {
          showToast('Install dismissed. You can try again anytime.');
          setInstallButtonVisible(true);
        }
      });
    }
    
    // Mobile menu toggle
    const mobileToggle = utils.qs('.mobile-nav-toggle');
    const headerNav = utils.qs('.header-nav');
    const headerActions = utils.qs('.header-actions');
    
    if (mobileToggle && headerNav && headerActions) {
      function setMobileMenuOpen(isOpen) {
        mobileToggle.setAttribute('aria-expanded', String(isOpen));

        if (window.innerWidth <= 768) {
          headerNav.style.display = isOpen ? 'grid' : 'none';
          headerActions.style.display = 'none';
          headerNav.setAttribute('aria-hidden', String(!isOpen));
          headerActions.setAttribute('aria-hidden', 'true');
        } else {
          headerNav.style.display = 'flex';
          headerActions.style.display = 'flex';
          headerNav.setAttribute('aria-hidden', 'false');
          headerActions.setAttribute('aria-hidden', 'false');
        }
      }

      setMobileMenuOpen(false);

      mobileToggle.addEventListener('click', () => {
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        setMobileMenuOpen(!expanded);
        if (!expanded) {
          headerNav.classList.add('animate-fade-in');
          headerActions.classList.add('animate-fade-in');
        }
      });

      document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        if (!expanded) return;
        if (!e.target.closest('.header-container')) {
          setMobileMenuOpen(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
          setMobileMenuOpen(false);
        }
      });
      
      // Close mobile menu on resize
      window.addEventListener('resize', utils.debounce(() => {
        setMobileMenuOpen(false);
      }, 250));
    }
  }

  // ---------------------------
  // Scroll Behavior
  // ---------------------------
  function initScrollBehavior() {}

  function initImageOptimization() {
    utils.qsa('img').forEach((img, index) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', index < 2 ? 'eager' : 'lazy');
      }
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  function initReusableUiComponents() {
    const filterToggles = utils.qsa('[data-filter-toggle]');
    const filterPanels = utils.qsa('[data-filter-panel]');

    function closeAllPanels() {
      filterPanels.forEach((panel) => panel.classList.remove('is-open'));
      filterToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
    }

    filterToggles.forEach((toggle) => {
      const panelId = toggle.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = panel.classList.contains('is-open');
        closeAllPanels();
        if (!isOpen) {
          panel.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-filter-root]')) {
        closeAllPanels();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllPanels();
      }
    });

    utils.qsa('[data-filter-group]').forEach((group) => {
      const options = utils.qsa('[data-filter-option]', group);
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((item) => {
            const isActive = item === option;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-checked', isActive ? 'true' : 'false');
          });

          const groupName = group.dataset.filterGroup || '';
          const value = option.dataset.filterValue || '';
          document.dispatchEvent(new CustomEvent('rccl:filter-change', {
            detail: { group: groupName, value }
          }));
        });
      });
    });

    const modalRegistry = new Map();
    utils.qsa('[data-modal]').forEach((modal) => {
      if (modal.id) modalRegistry.set(modal.id, modal);
    });

    let lastTrigger = null;

    function getFocusableElements(container) {
      return utils.qsa('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])', container);
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('rccl-modal--open', 'room-modal--open');
      modal.setAttribute('aria-hidden', 'true');
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    function openModal(modal, trigger = null) {
      if (!modal) return;
      lastTrigger = trigger || document.activeElement;
      modal.classList.add('rccl-modal--open', 'room-modal--open');
      modal.setAttribute('aria-hidden', 'false');
      const focusable = getFocusableElements(modal);
      focusable[0]?.focus();
    }

    window.RCCLModal = {
      open: (id, trigger) => openModal(modalRegistry.get(id), trigger || null),
      close: (id) => closeModal(modalRegistry.get(id)),
    };

    utils.qsa('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const targetId = trigger.dataset.modalOpen;
        if (!targetId) return;
        openModal(modalRegistry.get(targetId), trigger);
      });
    });

    utils.qsa('[data-modal-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('[data-modal]');
        closeModal(modal);
      });
    });

    document.addEventListener('click', (event) => {
      const modal = event.target.closest('[data-modal]');
      if (!modal) return;
      if (event.target === modal) closeModal(modal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openModalEl = utils.qs('[data-modal].rccl-modal--open, [data-modal].room-modal--open');
      if (openModalEl) {
        closeModal(openModalEl);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const openModalEl = utils.qs('[data-modal].rccl-modal--open, [data-modal].room-modal--open');
      if (!openModalEl) return;
      const focusable = getFocusableElements(openModalEl);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  // ---------------------------
  // Service Worker
  // ---------------------------
  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      let refreshing = false;

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'CACHE_UPDATED') {
          localStorage.setItem('offline_last_sync_at', data.at || new Date().toISOString());
          localStorage.setItem('offline_sw_version', data.version || 'unknown');
        }
      });

      navigator.serviceWorker
        .register('js/sw.js', { scope: './' })
        .then((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const nextWorker = registration.installing;
            if (!nextWorker) return;
            nextWorker.addEventListener('statechange', () => {
              if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
                nextWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });

          window.setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.warn('Service worker registration failed:', error);
        });
    });
  }

  // ---------------------------
  // Initialize
  // ---------------------------
  function init() {
    ensureSharedMounts();
    document.body.classList.add('app-theme-rcc');

    // Inject styles
    injectMinimalStyles();
    
    // Initialize theme
    ThemeManager.init();
    
    // Render components
    renderHeader();
    renderFooter();
    
    // Keep this mount empty to avoid floating mobile bars.
    renderBottomNav();
    
    // Initialize event handlers
    initEventHandlers();
    initScrollBehavior();
    initImageOptimization();
    initReusableUiComponents();
    initServiceWorker();
    
    // No floating bottom navigation: keep default page flow and spacing.
    document.body.style.paddingBottom = '';
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
