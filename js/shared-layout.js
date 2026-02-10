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
    port: 'Port Canaveral',
    tagline: 'Experience WOW',
    year: new Date().getFullYear(),
  };

  const NAV_ITEMS = [
    { id: 'index', href: 'index.html', icon: 'fa-home', text: 'Dashboard' },
    { id: 'itinerary', href: 'itinerary.html', icon: 'fa-route', text: 'Itinerary' },
    { id: 'dining', href: 'dining.html', icon: 'fa-utensils', text: 'Dining' },
    { id: 'decks', href: 'decks.html', icon: 'fa-map', text: 'Decks' },
    { id: 'checklist', href: 'operations.html', icon: 'fa-clipboard-check', text: 'Checklist' },
  ];

  const BOTTOM_NAV_ITEMS = [
    { id: 'index', icon: 'fa-home', text: 'Home', href: 'index.html' },
    { id: 'today', icon: 'fa-compass', text: 'Today', href: 'itinerary.html' },
    { id: 'quick', icon: 'fa-plus', text: 'Quick', action: 'quick-actions' },
    { id: 'ship', icon: 'fa-ship', text: 'Ship', href: 'decks.html' },
    { id: 'eat', icon: 'fa-utensils', text: 'Eat', href: 'dining.html' },
  ];

  const RCCL_COLORS = {
    primary: '#0052a5',
    primaryRgb: '0, 82, 165',
    accent: '#00a8e8',
    accentRgb: '0, 168, 232',
    dark: '#1a1a2e',
    darkRgb: '26, 26, 46',
    light: '#f8f9fa',
    lightRgb: '248, 249, 250',
  };

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
  };

  // ---------------------------
  // Theme Manager
  // ---------------------------
  const ThemeManager = {
    key: 'cruise-theme',
    current: 'light',

    init() {
      const saved = localStorage.getItem(this.key);
      if (saved) {
        this.apply(saved, true);
      }
    },

    apply(theme, silent = false) {
      this.current = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.key, theme);
      
      if (!silent) {
        const label = theme === 'dark' ? 'Dark theme' : 'Light theme';
        this.announce(`${label} activated`);
      }
    },

    toggle() {
      const next = this.current === 'dark' ? 'light' : 'dark';
      this.apply(next);
    },

    announce(message) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = message;
      document.body.appendChild(announcer);
      setTimeout(() => announcer.remove(), 1000);
    },
  };

  // ---------------------------
  // CSS Injection
  // ---------------------------
  function injectMinimalStyles() {
    const styleId = 'rccl-minimal-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      /* ============================================================================
       * Minimal Layout Styles
       * ========================================================================== */
      
      :root {
        --rccl-primary: #0052a5;
        --rccl-primary-rgb: 0, 82, 165;
        --rccl-accent: #00a8e8;
        --rccl-accent-rgb: 0, 168, 232;
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
      }
      
      [data-theme="dark"] {
        --rccl-surface: #1a1a2e;
        --rccl-surface-rgb: 26, 26, 46;
        --rccl-text: #f8f9fa;
        --rccl-text-rgb: 248, 249, 250;
        --rccl-border: #2d3047;
        --rccl-border-rgb: 45, 48, 71;
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
        background: var(--rccl-surface);
        border-bottom: 1px solid var(--rccl-border);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        max-width: 1280px;
        margin: 0 auto;
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
        transition: var(--rccl-transition);
      }
      
      .header-logo:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
      }
      
      .header-logo i {
        font-size: 1.5rem;
        color: var(--rccl-primary);
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .header-nav__link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: var(--rccl-text);
        font-weight: 500;
        font-size: 0.875rem;
        border-radius: var(--rccl-radius-md);
        transition: var(--rccl-transition);
        white-space: nowrap;
      }
      
      .header-nav__link:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        color: var(--rccl-primary);
      }
      
      .header-nav__link.active {
        background: var(--rccl-primary);
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
        display: flex;
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
      
      /* Mobile Navigation */
      .mobile-nav-toggle {
        display: none;
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
      
      /* Footer - Minimal */
      .app-footer--minimal {
        background: var(--rccl-surface);
        border-top: 1px solid var(--rccl-border);
        color: var(--rccl-text);
        margin-top: auto;
      }
      
      .footer-container {
        padding: 2rem 1rem;
        max-width: 1280px;
        margin: 0 auto;
      }
      
      .footer-primary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--rccl-border);
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
        background: var(--rccl-primary);
        color: white;
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
        color: var(--rccl-primary);
        margin: 0;
      }
      
      .footer-subheading {
        font-size: 0.75rem;
        color: var(--rccl-text);
        opacity: 0.7;
        margin: 0.25rem 0 0;
      }
      
      .footer-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .footer-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: var(--rccl-primary);
        color: white;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        border-radius: var(--rccl-radius-md);
        transition: var(--rccl-transition);
      }
      
      .footer-cta:hover {
        background: color-mix(in srgb, var(--rccl-primary) 90%, black);
        transform: translateY(-1px);
      }
      
      .footer-essentials {
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--rccl-border);
        margin-bottom: 1.5rem;
      }
      
      .footer-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }
      
      .footer-nav__link {
        color: var(--rccl-text);
        text-decoration: none;
        font-size: 0.875rem;
        transition: var(--rccl-transition);
      }
      
      .footer-nav__link:hover {
        color: var(--rccl-primary);
      }
      
      .footer-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .footer-legal {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--rccl-text);
        opacity: 0.7;
      }
      
      .footer-legal__link {
        color: inherit;
        text-decoration: none;
        transition: var(--rccl-transition);
      }
      
      .footer-legal__link:hover {
        color: var(--rccl-primary);
        opacity: 1;
      }
      
      .footer-separator {
        opacity: 0.5;
      }
      
      .footer-social {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .footer-social__link,
      .footer-theme-toggle {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-md);
        background: none;
        color: var(--rccl-text);
        text-decoration: none;
        transition: var(--rccl-transition);
        cursor: pointer;
      }
      
      .footer-social__link:hover,
      .footer-theme-toggle:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        border-color: var(--rccl-primary);
      }
      
      /* Bottom Navigation */
      .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
        background: var(--rccl-surface);
        border-top: 1px solid var(--rccl-border);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 0.5rem;
        padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
      }
      
      .bottom-nav__list {
        display: flex;
        justify-content: space-around;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .bottom-nav__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .bottom-nav__link,
      .bottom-nav__button {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        color: var(--rccl-text);
        padding: 0.5rem;
        border-radius: var(--rccl-radius-md);
        transition: var(--rccl-transition);
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.75rem;
      }
      
      .bottom-nav__link:hover,
      .bottom-nav__button:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
      }
      
      .bottom-nav__link.active {
        color: var(--rccl-primary);
      }
      
      .bottom-nav__icon {
        font-size: 1.25rem;
        margin-bottom: 0.25rem;
      }
      
      .bottom-nav__label {
        font-size: 0.625rem;
        font-weight: 500;
      }
      
      /* Quick Actions Sheet */
      .quick-actions-sheet {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--rccl-surface);
        border-top: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-xl) var(--rccl-radius-xl) 0 0;
        box-shadow: var(--rccl-shadow-lg);
        transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 101;
        padding: 1rem;
        padding-bottom: max(1rem, env(safe-area-inset-bottom));
      }
      
      .quick-actions-sheet.open {
        transform: translateY(0);
      }
      
      .sheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }
      
      .sheet-title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
      }
      
      .sheet-close {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--rccl-text);
        cursor: pointer;
        border-radius: var(--rccl-radius-md);
      }
      
      .sheet-close:hover {
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
      }
      
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }
      
      .quick-action {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: color-mix(in srgb, var(--rccl-primary) 5%, transparent);
        border: 1px solid var(--rccl-border);
        border-radius: var(--rccl-radius-md);
        color: var(--rccl-text);
        text-decoration: none;
        transition: var(--rccl-transition);
      }
      
      .quick-action:hover {
        background: color-mix(in srgb, var(--rccl-primary) 10%, transparent);
        border-color: var(--rccl-primary);
      }
      
      .quick-action__icon {
        font-size: 1.25rem;
        color: var(--rccl-primary);
      }
      
      .quick-action__text {
        font-size: 0.875rem;
        font-weight: 500;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .header-nav,
        .header-actions {
          display: none;
        }
        
        .mobile-nav-toggle {
          display: flex;
        }
        
        .footer-primary {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .footer-actions {
          width: 100%;
        }
        
        .footer-cta {
          flex: 1;
          justify-content: center;
        }
        
        .footer-meta {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      }
      
      @media (min-width: 769px) {
        .bottom-nav {
          display: none;
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
      
      const navLinks = NAV_ITEMS.map(item => `
        <a href="${sanitizeHref(item.href)}"
           class="header-nav__link ${currentPage === item.id ? 'active' : ''}"
           ${currentPage === item.id ? 'aria-current="page"' : ''}>
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          <span>${utils.escapeHtml(item.text)}</span>
        </a>
      `).join('');

      return `
        <header class="app-header--minimal" role="banner">
          <div class="header-container">
            <div class="header-brand">
              <a href="${sanitizeHref('index.html')}" class="header-logo">
                <i class="fas fa-ship" aria-hidden="true"></i>
                <div class="header-logo-text">
                  <span class="header-logo-title">${utils.escapeHtml(DEFAULT_META.brand)}</span>
                  <span class="header-logo-subtitle">${utils.escapeHtml(DEFAULT_META.ship)}</span>
                </div>
              </a>
            </div>
            
            <nav class="header-nav" aria-label="Primary navigation">
              ${navLinks}
            </nav>
            
            <div class="header-actions">
              <button class="header-action" id="themeToggle" aria-label="Toggle theme">
                <i class="fas fa-adjust" aria-hidden="true"></i>
              </button>
              <button class="header-action" id="notificationsToggle" aria-label="Notifications">
                <i class="fas fa-bell" aria-hidden="true"></i>
              </button>
            </div>
            
            <button class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
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
        <footer class="app-footer--minimal" role="contentinfo">
          <div class="footer-container">
            <div class="footer-primary">
              <div class="footer-brand">
                <div class="footer-logo" aria-hidden="true">
                  <i class="fas fa-crown"></i>
                </div>
                <div class="footer-tagline">
                  <h3 class="footer-heading">${utils.escapeHtml(DEFAULT_META.tagline)}</h3>
                  <p class="footer-subheading">
                    ${utils.escapeHtml(DEFAULT_META.ship)} • ${utils.escapeHtml(DEFAULT_META.sailing)}
                  </p>
                </div>
              </div>
              
              <div class="footer-actions">
                <a href="${sanitizeHref('operations.html')}" class="footer-cta">
                  <span>Complete Checklist</span>
                  <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            
            <div class="footer-essentials">
              <nav class="footer-nav" aria-label="Essential links">
                <a href="${sanitizeHref('index.html')}" class="footer-nav__link">Dashboard</a>
                <a href="${sanitizeHref('itinerary.html')}" class="footer-nav__link">Itinerary</a>
                <a href="${sanitizeHref('dining.html')}" class="footer-nav__link">Dining</a>
                <a href="${sanitizeHref('decks.html')}" class="footer-nav__link">Ship Map</a>
                <a href="${sanitizeHref('help.html')}" class="footer-nav__link">Help</a>
              </nav>
            </div>
            
            <div class="footer-meta">
              <div class="footer-legal">
                <span class="footer-copyright">© ${DEFAULT_META.year} ${utils.escapeHtml(DEFAULT_META.brand)}</span>
                <span class="footer-separator" aria-hidden="true">•</span>
                <a href="${sanitizeHref('privacy.html')}" class="footer-legal__link">Privacy</a>
                <span class="footer-separator" aria-hidden="true">•</span>
                <a href="${sanitizeHref('terms.html')}" class="footer-legal__link">Terms</a>
              </div>
              
              <div class="footer-social">
                <a href="https://www.royalcaribbean.com" 
                   class="footer-social__link" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   aria-label="Visit Royal Caribbean website">
                  <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                </a>
                <button class="footer-theme-toggle" aria-label="Toggle theme">
                  <i class="fas fa-adjust" aria-hidden="true"></i>
                </button>
              </div>
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
    return safeMount('#sharedBottomNav', () => {
      const currentPage = utils.getCurrentPage();
      
      const navItems = BOTTOM_NAV_ITEMS.map(item => {
        if (item.action) {
          return `
            <li class="bottom-nav__item">
              <button class="bottom-nav__button" data-action="${item.action}">
                <i class="fas ${item.icon} bottom-nav__icon" aria-hidden="true"></i>
                <span class="bottom-nav__label">${utils.escapeHtml(item.text)}</span>
              </button>
            </li>
          `;
        }
        
        return `
          <li class="bottom-nav__item">
            <a href="${sanitizeHref(item.href)}" 
               class="bottom-nav__link ${currentPage === item.id ? 'active' : ''}"
               ${currentPage === item.id ? 'aria-current="page"' : ''}>
              <i class="fas ${item.icon} bottom-nav__icon" aria-hidden="true"></i>
              <span class="bottom-nav__label">${utils.escapeHtml(item.text)}</span>
            </a>
          </li>
        `;
      }).join('');

      return `
        <nav class="bottom-nav" aria-label="Mobile navigation">
          <ul class="bottom-nav__list">
            ${navItems}
          </ul>
        </nav>
        
        <div class="quick-actions-sheet" id="quickActionsSheet">
          <div class="sheet-header">
            <h3 class="sheet-title">Quick Actions</h3>
            <button class="sheet-close" data-action="close-sheet" aria-label="Close">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="quick-actions-grid">
            <a href="${sanitizeHref('operations.html')}" class="quick-action">
              <i class="fas fa-clipboard-check quick-action__icon" aria-hidden="true"></i>
              <span class="quick-action__text">Checklist</span>
            </a>
            <a href="${sanitizeHref('dining.html')}" class="quick-action">
              <i class="fas fa-utensils quick-action__icon" aria-hidden="true"></i>
              <span class="quick-action__text">Dining</span>
            </a>
            <a href="${sanitizeHref('decks.html')}" class="quick-action">
              <i class="fas fa-map quick-action__icon" aria-hidden="true"></i>
              <span class="quick-action__text">Ship Map</span>
            </a>
            <a href="${sanitizeHref('help.html')}" class="quick-action">
              <i class="fas fa-question-circle quick-action__icon" aria-hidden="true"></i>
              <span class="quick-action__text">Help</span>
            </a>
          </div>
        </div>
      `;
    });
  }

  // ---------------------------
  // Event Handlers
  // ---------------------------
  function initEventHandlers() {
    // Theme toggle
    const themeToggle = utils.qs('#themeToggle');
    const footerThemeToggle = utils.qs('.footer-theme-toggle');
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => ThemeManager.toggle());
    }
    
    if (footerThemeToggle) {
      footerThemeToggle.addEventListener('click', () => ThemeManager.toggle());
    }
    
    // Quick actions sheet
    const quickButton = utils.qs('[data-action="quick-actions"]');
    const closeSheet = utils.qs('[data-action="close-sheet"]');
    const sheet = utils.qs('#quickActionsSheet');
    
    if (quickButton && sheet) {
      quickButton.addEventListener('click', () => {
        sheet.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
    
    if (closeSheet && sheet) {
      closeSheet.addEventListener('click', () => {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
    
    // Close sheet when clicking outside
    document.addEventListener('click', (e) => {
      if (sheet && sheet.classList.contains('open')) {
        if (!sheet.contains(e.target) && !quickButton.contains(e.target)) {
          sheet.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
    
    // Escape key closes sheet
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sheet && sheet.classList.contains('open')) {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    
    // Mobile menu toggle
    const mobileToggle = utils.qs('.mobile-nav-toggle');
    const headerNav = utils.qs('.header-nav');
    const headerActions = utils.qs('.header-actions');
    
    if (mobileToggle && headerNav && headerActions) {
      mobileToggle.addEventListener('click', () => {
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', String(!expanded));
        
        if (!expanded) {
          headerNav.style.display = 'flex';
          headerActions.style.display = 'flex';
          headerNav.classList.add('animate-fade-in');
          headerActions.classList.add('animate-fade-in');
        } else {
          headerNav.style.display = 'none';
          headerActions.style.display = 'none';
        }
      });
      
      // Close mobile menu on resize
      window.addEventListener('resize', utils.debounce(() => {
        if (window.innerWidth > 768) {
          headerNav.style.display = 'flex';
          headerActions.style.display = 'flex';
          mobileToggle.setAttribute('aria-expanded', 'false');
        } else {
          headerNav.style.display = 'none';
          headerActions.style.display = 'none';
        }
      }, 250));
    }
  }

  // ---------------------------
  // Scroll Behavior
  // ---------------------------
  function initScrollBehavior() {
    let lastScroll = 0;
    const header = utils.qs('.app-header--minimal');
    const bottomNav = utils.qs('.bottom-nav');
    
    if (!header) return;
    
    const handleScroll = utils.debounce(() => {
      const currentScroll = window.pageYOffset;
      
      // Hide/show header on scroll
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
        if (bottomNav) bottomNav.style.transform = 'translateY(100%)';
      } else {
        header.style.transform = 'translateY(0)';
        if (bottomNav) bottomNav.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    }, 50);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ---------------------------
  // Initialize
  // ---------------------------
  function init() {
    // Inject styles
    injectMinimalStyles();
    
    // Initialize theme
    ThemeManager.init();
    
    // Render components
    renderHeader();
    renderFooter();
    
    // Only render bottom nav on mobile
    if (utils.isMobile()) {
      renderBottomNav();
    }
    
    // Initialize event handlers
    initEventHandlers();
    initScrollBehavior();
    
    // Add padding for fixed bottom nav
    if (utils.isMobile()) {
      document.body.style.paddingBottom = 'calc(4rem + env(safe-area-inset-bottom))';
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();