/* ============================================================================
 * Minimalist Shared Layout (RCCL) - Less is More
 * Clean, polished design focusing on essential functionality
 * ========================================================================== */
(function renderMinimalLayout() {
  "use strict";

  // ---------------------------
  // Safe Operations
  // ---------------------------
  function safeMount(selector, renderFn) {
    try {
      const mount = document.querySelector(selector);
      if (!mount) return null;
      const result = renderFn(mount);
      if (typeof result === "string") {
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
    const trimmed = String(href || "").trim();
    if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) {
      return "#";
    }
    return trimmed;
  }

  // ---------------------------
  // Configuration
  // ---------------------------
  const LAYOUT_CONFIG = window.CruiseSharedLayoutConfig;
  if (!LAYOUT_CONFIG) {
    console.error(
      "Missing CruiseSharedLayoutConfig. Ensure js/shared-layout.config.js is loaded before js/shared-layout.js.",
    );
    return;
  }

  const { DEFAULT_META, NAV_ITEMS, MORE_DRAWER_GROUPS, BOTTOM_NAV_ITEMS } =
    LAYOUT_CONFIG;
  // qa-nav token anchor: const NAV_ITEMS = [
  // qa-nav token anchor: const BOTTOM_NAV_ITEMS = [

  const MORE_PAGE_IDS = new Set(
    MORE_DRAWER_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
  );

  // ---------------------------
  // Utilities
  // ---------------------------
  const utils = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    isMobile: () => window.matchMedia("(max-width: 768px)").matches,
    prefersReducedMotion: () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    escapeHtml: (s) => {
      if (s == null) return "";
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    getCurrentPage: () => {
      const mountPage = document.getElementById("sharedHeader")?.dataset?.page;
      if (mountPage) return String(mountPage).trim();
      const file = window.location.pathname.split("/").pop() || "index.html";
      return file.replace(".html", "");
    },
    debounce: (fn, wait = 100) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },
    getCruiseStatus: () => {
      const now = Date.now();
      const embarkation = new Date("2026-02-14T14:00:00-05:00").getTime();
      const cruiseEnd = new Date("2026-02-20T23:59:59-05:00").getTime();
      if (now > cruiseEnd) {
        return {
          label: "Sailing complete",
          detail: "Browse memories and recap your highlights",
        };
      }
      const diff = embarkation - now;
      if (diff <= 0) {
        return {
          label: "Sailing in progress",
          detail: "Use itinerary for today's plan",
        };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      return {
        label: `${days}d ${hours}h to sail away`,
        detail: "Complete checklist before embarkation",
      };
    },
    getCruiseModeContext: () =>
      window.CruiseLayoutMode?.getCruiseModeContext?.() || {
        nowIso: new Date().toISOString(),
        mode: "before",
        modeLabel: "Before Sail",
        modeClass: "mode-before",
        day: 1,
        isPortDay: false,
        isBeforeCruise: true,
        isAfterCruise: false,
        isOnboardNow: false,
      },
  };

  // ---------------------------
  // Theme Manager
  // ---------------------------
  const ThemeManager = {
    applyLight() {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-theme-mode", "light");
      localStorage.setItem("cruise-theme", "light");
    },

    init() {
      this.applyLight();
    },
  };

  // ---------------------------
  // CSS Injection
  // ---------------------------
  function injectMinimalStyles() {
    const styleId = "rccl-minimal-styles";
    const stylesheetId = "rccl-minimal-stylesheet";
    if (
      document.getElementById(styleId) ||
      document.getElementById(stylesheetId)
    )
      return;

    const cssHref = "css/shared-layout.entry.css?v=2";
    const linkEl = document.createElement("link");
    linkEl.id = stylesheetId;
    linkEl.rel = "stylesheet";
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

      .header-nav__link.active::after {
        background: linear-gradient(90deg, rgba(255, 223, 137, 0.24) 0%, rgba(255, 223, 137, 0.95) 50%, rgba(255, 223, 137, 0.24) 100%);
        height: 3px;
      }
      
      .header-nav__link.active {
        background: linear-gradient(180deg, rgba(255, 223, 137, 0.2) 0%, rgba(255, 223, 137, 0.06) 100%);
        border: 1px solid rgba(255, 223, 137, 0.42);
        color: white;
        box-shadow: 0 0 0 1px rgba(255, 223, 137, 0.22), 0 8px 16px rgba(3, 20, 40, 0.32);
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
          padding: 0.45rem;
          border: 1px solid rgba(var(--rccl-primary-rgb), 0.16);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 8px 18px rgba(11, 79, 144, 0.1);
        }

        .header-nav__link {
          width: 100%;
          justify-content: flex-start;
          min-height: 44px;
        }

        .header-actions {
          width: auto;
          justify-content: flex-end;
          align-self: flex-end;
          padding-top: 0.25rem;
        }

        .header-cta {
          width: auto;
          min-width: 112px;
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

    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  function injectNavV2Styles() {
    const styleId = "rccl-nav-v2-overrides";
    if (document.getElementById(styleId)) return;

    const styles = `
      .app-header--rccl-site .header-utility__promo {
        font-weight: 700;
        color: #1f5e87;
        font-size: 0.78rem;
      }

      .app-header--rccl-site .header-utility {
        display: none;
      }

      .app-header--rccl-site .header-utility__crumb {
        color: #124d75;
      }

      .app-header--rccl-site .header-utility__mode {
        color: #0f4e76;
        background: rgba(255, 255, 255, 0.76);
        border-color: rgba(8, 89, 136, 0.22);
      }

      .app-header--rccl-site .header-nav {
        gap: 2px;
      }

      .app-header--rccl-site .header-nav__link {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        min-width: 96px;
        padding: 6px 10px 7px;
      }

      .app-header--rccl-site .header-nav__link i {
        font-size: 0.86rem;
      }

      .app-header--rccl-site .header-nav__label {
        font-size: 0.88rem;
        line-height: 1.2;
        font-weight: 700;
      }

      .app-header--rccl-site .header-nav__hint {
        font-size: 0.68rem;
        line-height: 1.2;
        color: rgba(208, 229, 249, 0.82);
      }

      .app-header--rccl-site .header-nav__link.active .header-nav__hint {
        color: #7b5c2b;
      }

      .app-header--rccl-site .header-nav__link.active {
        color: #0f4f76;
        background: linear-gradient(180deg, rgba(255, 213, 125, 0.3) 0%, rgba(255, 213, 125, 0.16) 100%);
        border-color: rgba(255, 190, 92, 0.42);
        box-shadow: 0 8px 16px rgba(0, 121, 180, 0.12);
      }

      .app-header--rccl-site .header-nav__link.active i {
        color: #0f4f76;
      }

      .app-header--rccl-site .header-cta--help {
        min-height: 36px;
      }

      .more-drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 12, 26, 0.56);
        z-index: 1050;
        opacity: 0;
        transition: opacity 220ms ease;
      }

      .more-drawer-backdrop.is-open {
        opacity: 1;
      }

      .more-drawer {
        position: fixed;
        top: 0;
        right: 0;
        width: min(360px, 92vw);
        height: 100dvh;
        background: linear-gradient(180deg, rgba(7, 33, 68, 0.98) 0%, rgba(6, 24, 49, 0.98) 100%);
        color: #f4f8ff;
        border-left: 1px solid rgba(255, 255, 255, 0.16);
        box-shadow: -16px 0 44px rgba(2, 12, 26, 0.44);
        z-index: 1051;
        padding: 14px 14px 18px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        opacity: 0;
        transform: translateX(32px);
        transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease;
        pointer-events: none;
      }

      .more-drawer.is-open {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      .more-drawer__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .more-drawer__header h2 {
        margin: 0;
        font-size: 1.1rem;
        color: #fff;
      }

      .more-drawer__close {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .more-drawer__group {
        margin-top: 16px;
      }

      .more-drawer__group-title {
        margin: 0 0 8px;
        padding: 0 4px;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #ffe7a6;
      }

      .more-drawer__group-links {
        display: grid;
        gap: 6px;
      }

      .more-drawer__link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        padding: 9px 12px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f4f8ff;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.04);
      }

      .more-drawer__link:hover,
      .more-drawer__link.active {
        border-color: rgba(255, 223, 137, 0.44);
        background: rgba(255, 223, 137, 0.14);
      }

      .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 990;
        display: none;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 8px;
        padding: 9px 12px calc(10px + env(safe-area-inset-bottom));
        background: rgba(241, 250, 255, 0.92);
        border-top: 1px solid rgba(8, 89, 136, 0.18);
        backdrop-filter: blur(10px);
      }

      .bottom-nav__item {
        min-height: 48px;
        border-radius: 12px;
        border: 1px solid rgba(8, 89, 136, 0.14);
        background: rgba(255, 255, 255, 0.64);
        color: #1f567c;
        text-decoration: none;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        font-size: 0.67rem;
        font-weight: 700;
        transition: transform 170ms ease, background-color 170ms ease, border-color 170ms ease;
      }

      .bottom-nav__item:active {
        transform: scale(0.97);
      }

      .bottom-nav__item i {
        font-size: 0.8rem;
      }

      .bottom-nav__item.active,
      .bottom-nav__item[aria-current="page"],
      .bottom-nav__item--more[aria-expanded="true"] {
        color: #143f66;
        border-color: rgba(255, 193, 70, 0.62);
        background: linear-gradient(180deg, #ffe59f 0%, #ffd15a 100%);
        box-shadow: 0 10px 18px rgba(172, 119, 23, 0.22);
      }

      .app-header--rccl-site .header-brand-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 8px;
        margin-top: 2px;
      }

      .app-header--rccl-site .header-brand-meta .header-utility__mode {
        margin: 0;
        min-height: 20px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.67rem;
        letter-spacing: 0.03em;
        text-transform: none;
        font-weight: 800;
        border: 1px solid rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.16);
        color: #e9f5ff;
      }

      .app-header--rccl-site .header-brand-meta .header-utility__promo {
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(222, 239, 253, 0.9);
        font-size: 0.73rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .app-header--rccl-site .header-container {
        padding-top: 0.64rem;
        padding-bottom: 0.7rem;
      }

      .app-footer--rccl-site .footer-container {
        max-width: 980px;
        padding: 1.55rem 1rem 1.75rem;
        gap: 0.85rem;
      }

      .app-footer--rccl-site .footer-kicker {
        color: rgba(206, 231, 255, 0.94) !important;
        font-size: 0.72rem;
        letter-spacing: 0.1em;
      }

      .app-footer--rccl-site .footer-title {
        color: #ffffff !important;
        margin-top: 0.12rem;
        font-size: clamp(1.22rem, 3.6vw, 1.7rem);
        line-height: 1.18;
      }

      .app-footer--rccl-site .footer-description {
        color: rgba(226, 242, 255, 0.96) !important;
        max-width: 52ch;
        margin: 0.32rem auto 0;
        font-size: 0.92rem;
        line-height: 1.48;
      }

      .app-footer--rccl-site .footer-social-row {
        gap: 0.56rem;
      }

      .app-footer--rccl-site .footer-social__link {
        width: 2.12rem;
        height: 2.12rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.34);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 6px 12px rgba(3, 20, 42, 0.22);
      }

      .app-footer--rccl-site .footer-country__btn {
        border-color: rgba(255, 255, 255, 0.4);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.09) 100%);
        color: #f4fbff;
      }

      .app-footer--rccl-site .footer-copyright {
        color: rgba(224, 241, 255, 0.82) !important;
        font-size: 0.87rem;
      }

      .app-footer--rccl-site .footer-legal-links {
        gap: 0.5rem 0.72rem;
      }

      .app-footer--rccl-site .footer-legal__link {
        color: #eef8ff !important;
        font-size: 0.92rem;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 0;
        padding: 0.1rem 0.05rem;
        background: transparent;
      }

      .app-footer--rccl-site .footer-legal__link:hover {
        color: #fff !important;
        border-bottom-color: rgba(255, 231, 160, 0.86);
      }

      .app-footer--rccl-site .footer-brands {
        border-top-color: rgba(255, 255, 255, 0.24);
        gap: 0.46rem;
      }

      .app-footer--rccl-site .footer-brand-mark {
        background: rgba(255, 255, 255, 0.09);
        border-color: rgba(255, 255, 255, 0.26);
        color: rgba(236, 248, 255, 0.95);
        font-size: 0.76rem;
        letter-spacing: 0.04em;
        padding: 0.34rem 0.64rem;
      }

      @media (max-width: 1080px) {
        .app-header--rccl-site .header-brand-meta .header-utility__promo {
          display: none;
        }
      }

      @media (max-width: 767px) {
        body.app-theme-rcc {
          padding-bottom: calc(92px + env(safe-area-inset-bottom));
        }

        .bottom-nav {
          display: grid;
        }

        .app-header--rccl-site .header-nav__hint {
          display: none;
        }

        .app-header--rccl-site .header-actions .header-cta--help {
          display: none;
        }

        .app-header--rccl-site .header-brand-meta {
          margin-top: 1px;
        }

        .app-footer--rccl-site .footer-container {
          padding: 1.2rem 0.9rem 1.35rem;
          gap: 0.74rem;
        }

        .app-footer--rccl-site .footer-description {
          max-width: 32ch;
          font-size: 0.88rem;
        }

        .app-footer--rccl-site .footer-social-row {
          gap: 0.46rem;
        }

        .app-footer--rccl-site .footer-social__link {
          width: 2rem;
          height: 2rem;
          border-radius: 11px;
        }

        .app-footer--rccl-site .footer-country__btn {
          width: 100%;
          justify-content: center;
          min-height: 44px;
        }

        .app-footer--rccl-site .footer-legal-links {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          text-align: left;
        }

        .app-footer--rccl-site .footer-brand-mark {
          font-size: 0.72rem;
          padding: 0.3rem 0.52rem;
        }
      }

      html.more-drawer-open,
      body.more-drawer-open {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }

      @media print {
        .skip-link,
        .app-header--rccl-site .header-utility,
        .app-header--rccl-site .header-nav,
        .app-header--rccl-site .header-actions,
        .app-header--rccl-site .mobile-nav-toggle,
        .more-drawer,
        .more-drawer-backdrop,
        .bottom-nav {
          display: none !important;
        }

        .app-header--rccl-site {
          position: static !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 0 0.25in !important;
          padding: 0 !important;
        }

        .app-header--rccl-site .header-container {
          display: block !important;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .app-header--rccl-site .header-brand {
          margin: 0 !important;
        }

        .app-header--rccl-site .header-logo {
          color: #0b2b47 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // ---------------------------
  // Header Component
  // ---------------------------
  function renderHeader() {
    // qa-nav token anchor: safeMount('#sharedHeader'
    return safeMount("#sharedHeader", () => {
      const currentPage = utils.getCurrentPage();
      const cruiseStatus = utils.getCruiseStatus();
      const isMorePage = MORE_PAGE_IDS.has(currentPage);
      const navLinks = NAV_ITEMS.map(
        (item) => `
        <a href="${sanitizeHref(item.href)}"
           class="header-nav__link ${currentPage === item.id ? "active" : ""}"
           data-nav="${utils.escapeHtml(item.navKey)}"
           ${currentPage === item.id ? 'aria-current="page"' : ""}>
          <i class="fas ${item.icon}" aria-hidden="true"></i>
          <span class="header-nav__label">${utils.escapeHtml(item.text)}</span>
          <span class="header-nav__hint">${utils.escapeHtml(item.hint)}</span>
        </a>
      `,
      ).join("");
      const drawerGroups = MORE_DRAWER_GROUPS.map((group) => {
        const groupItems = group.items
          .map(
            (item) => `
          <a href="${sanitizeHref(item.href)}"
             class="more-drawer__link ${currentPage === item.id ? "active" : ""}"
             ${currentPage === item.id ? 'aria-current="page"' : ""}>
            <i class="fas ${item.icon}" aria-hidden="true"></i>
            <span>${utils.escapeHtml(item.text)}</span>
          </a>
        `,
          )
          .join("");

        return `
          <section class="more-drawer__group" aria-label="${utils.escapeHtml(group.title)}">
            <h3 class="more-drawer__group-title">${utils.escapeHtml(group.title)}</h3>
            <div class="more-drawer__group-links">${groupItems}</div>
          </section>
        `;
      }).join("");

      return `
        <header class="app-header--minimal app-header--rccl-site" role="banner">
          <div class="header-container">
            <div class="header-brand">
              <a href="${sanitizeHref("index.html")}" class="header-logo">
                <i class="fas fa-crown" aria-hidden="true"></i>
                <div class="header-logo-text">
                  <span class="header-logo-title">${utils.escapeHtml(DEFAULT_META.brand)}</span>
                  <span class="header-logo-subtitle">${utils.escapeHtml(DEFAULT_META.ship)} · Cruise Companion</span>
                  <div class="header-brand-meta">
                    <span class="header-utility__mode" id="navModeBadge">Before Sail</span>
                    <span class="header-utility__promo" id="navContextLine">${utils.escapeHtml(cruiseStatus.label)}</span>
                  </div>
                </div>
              </a>
            </div>

            <nav class="header-nav" id="headerPrimaryNav" aria-label="Primary navigation">
              ${navLinks}
            </nav>

            <div class="header-actions" id="headerHeaderActions">
              <button type="button" class="header-cta header-cta--help ${isMorePage ? "is-active" : ""}" id="headerMoreButton" aria-haspopup="dialog" aria-expanded="false" aria-controls="moreDrawer">
                <span>More</span>
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
              </button>
              <button type="button" class="header-cta header-cta--install" id="pwaInstallButton" hidden aria-hidden="true">
                <i class="fas fa-download" aria-hidden="true"></i>
                <span>Install App</span>
              </button>
            </div>

            <button class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="headerPrimaryNav">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
          </div>

          <div class="more-drawer-backdrop" id="moreDrawerBackdrop" hidden></div>
          <aside class="more-drawer" id="moreDrawer" role="dialog" aria-modal="true" aria-label="More menu" hidden>
            <div class="more-drawer__header">
              <h2>More</h2>
              <button type="button" class="more-drawer__close" id="moreDrawerClose" aria-label="Close menu">
                <i class="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
            ${drawerGroups}
          </aside>
        </header>
      `;
    });
  }

  // ---------------------------
  // Footer Component
  // ---------------------------
  function renderFooter() {
    // qa-nav token anchor: safeMount('#sharedFooter'
    return safeMount("#sharedFooter", () => {
      return `
        <footer class="app-footer--minimal app-footer--rccl-site" role="contentinfo">
          <div class="footer-container">
            <section class="footer-intro" aria-label="Footer intro">
              <p class="footer-kicker">Family Cruise 2026</p>
              <h2 class="footer-title">Adventure of the Seas memories hub</h2>
              <p class="footer-description">
                Shared recap links, albums, and keepsakes from the Feb 14-20, 2026 sailing.
              </p>
            </section>

            <div class="footer-social-row" aria-label="Social links">
              <a href="photos.html" class="footer-social__link" aria-label="Open shared album"><i class="fas fa-images" aria-hidden="true"></i></a>
              <a href="photos.html?section=featured" class="footer-social__link" aria-label="Open group photo"><i class="fas fa-camera" aria-hidden="true"></i></a>
              <a href="itinerary.html#today" class="footer-social__link" aria-label="Open trip recap"><i class="fas fa-calendar-week" aria-hidden="true"></i></a>
              <a href="contacts.html" class="footer-social__link" aria-label="Open group chat contacts"><i class="fas fa-comments" aria-hidden="true"></i></a>
              <a href="offline.html" class="footer-social__link" aria-label="Open trip backup"><i class="fas fa-file-pdf" aria-hidden="true"></i></a>
            </div>

            <div class="footer-country">
              <a href="photos.html" class="footer-country__btn" aria-label="Open shared album">
                <span><i class="fas fa-users" aria-hidden="true"></i></span>
                <span>Shared album + recap</span>
              </a>
            </div>

            <p class="footer-copyright">© ${DEFAULT_META.year} Family Cruise Crew</p>

            <nav class="footer-legal-links" aria-label="Legal links">
              <a href="photos.html" class="footer-legal__link">Group photos</a>
              <a href="photos.html?section=featured" class="footer-legal__link">Shared album</a>
              <a href="itinerary.html" class="footer-legal__link">Trip recap</a>
              <a href="contacts.html" class="footer-legal__link">Group chat contacts</a>
              <a href="offline.html" class="footer-legal__link">Backup copy</a>
            </nav>

            <div class="footer-brands" aria-label="Royal Caribbean brands">
              <span class="footer-brand-mark">Adventure of the Seas</span>
              <span class="footer-brand-mark">Western Caribbean</span>
              <span class="footer-brand-mark">Feb 14-20, 2026</span>
              <span class="footer-brand-mark">Cruise memories</span>
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
    // qa-nav token anchor: safeMount('#sharedBottomNav'
    return safeMount("#sharedBottomNav", (mount) => {
      const currentPage = utils.getCurrentPage();
      const isMorePage = MORE_PAGE_IDS.has(currentPage);
      const links = BOTTOM_NAV_ITEMS.map((item) => {
        if (item.action) {
          return `
            <button type="button" id="moreBtnMobile" class="bottom-nav__item bottom-nav__item--more ${isMorePage ? "active" : ""}" data-nav="${utils.escapeHtml(item.navKey)}" data-bottom-action="${utils.escapeHtml(item.action)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="moreDrawer" ${isMorePage ? 'aria-current="page"' : ""}>
              <i class="fas ${item.icon}" aria-hidden="true"></i>
              <span>${utils.escapeHtml(item.text)}</span>
            </button>
          `;
        }
        return `
          <a href="${sanitizeHref(item.href)}" class="bottom-nav__item ${currentPage === item.id ? "active" : ""}" data-nav="${utils.escapeHtml(item.navKey)}" ${currentPage === item.id ? 'aria-current="page"' : ""}>
            <i class="fas ${item.icon}" aria-hidden="true"></i>
            <span>${utils.escapeHtml(item.text)}</span>
          </a>
        `;
      }).join("");

      return `
        <nav class="bottom-nav" aria-label="Bottom navigation">
          ${links}
        </nav>
      `;
    });
  }

  // ---------------------------
  // Mount Normalization
  // ---------------------------
  function ensureSharedMounts() {
    if (!document.body) return;

    let headerMount = document.getElementById("sharedHeader");
    if (!headerMount) {
      headerMount = document.createElement("div");
      headerMount.id = "sharedHeader";
      const primaryMain = document.querySelector("main");
      if (primaryMain && primaryMain.parentNode) {
        primaryMain.parentNode.insertBefore(headerMount, primaryMain);
      } else {
        document.body.insertBefore(headerMount, document.body.firstChild);
      }
    }

    let footerMount = document.getElementById("sharedFooter");
    if (!footerMount) {
      footerMount = document.createElement("div");
      footerMount.id = "sharedFooter";
      const bodyScripts = Array.from(document.body.querySelectorAll("script"));
      const insertionTarget = bodyScripts.length ? bodyScripts[0] : null;
      if (insertionTarget && insertionTarget.parentNode) {
        insertionTarget.parentNode.insertBefore(footerMount, insertionTarget);
      } else {
        document.body.appendChild(footerMount);
      }
    }

    if (!document.getElementById("sharedBottomNav")) {
      const bottomNavMount = document.createElement("div");
      bottomNavMount.id = "sharedBottomNav";
      document.body.appendChild(bottomNavMount);
    }
  }

  function promoteMoreDrawerToBody() {
    const backdrop = document.getElementById("moreDrawerBackdrop");
    const drawer = document.getElementById("moreDrawer");
    if (backdrop && backdrop.parentNode !== document.body) {
      document.body.appendChild(backdrop);
    }
    if (drawer && drawer.parentNode !== document.body) {
      document.body.appendChild(drawer);
    }
  }

  // ---------------------------
  // Event Handlers
  // ---------------------------
  function initEventHandlers() {
    function showToast(message) {
      let live = utils.qs("#sharedStatusLive");
      if (!live) {
        live = document.createElement("div");
        live.id = "sharedStatusLive";
        live.className = "sr-only";
        live.setAttribute("role", "status");
        live.setAttribute("aria-live", "polite");
        document.body.appendChild(live);
      }
      live.textContent = message;
    }

    window.CruiseLayoutPWA?.initInstallPrompt?.({
      installButton: utils.qs("#pwaInstallButton"),
      showToast,
    });

    const currentPage = utils.getCurrentPage();
    const contextLine = utils.qs("#navContextLine");
    const modeBadge = utils.qs("#navModeBadge");
    const modeContext = utils.getCruiseModeContext();
    if (contextLine) {
      const now = new Date();
      const embarkation = new Date("2026-02-14T14:00:00-05:00");
      const disembarkation = new Date("2026-02-20T09:00:00-05:00");
      if (now < embarkation) {
        contextLine.textContent = cruiseStatusText(now, embarkation);
      } else if (now >= embarkation && now <= disembarkation) {
        contextLine.textContent = "Onboard now · Use Today for live flow";
      } else {
        contextLine.textContent = "Relive the voyage";
      }

      if (modeBadge) {
        modeBadge.textContent = modeContext.modeLabel;
        modeBadge.className = `header-utility__mode ${modeContext.modeClass}`;
      }
    }
    window.RCCLModeContext = modeContext;
    document.documentElement.dataset.cruiseMode = modeContext.mode;
    document.documentElement.dataset.cruiseDay = String(modeContext.day || 1);
    document.documentElement.dataset.dayPart = getDayPart(new Date());
    if (modeContext.mode === "port" && Number(modeContext.day) === 6) {
      document.documentElement.dataset.portTheme = "cococay";
    } else {
      document.documentElement.dataset.portTheme =
        modeContext.mode === "port" ? "port" : "none";
    }
    document.dispatchEvent(
      new CustomEvent("rccl:mode-change", { detail: modeContext }),
    );

    const moreDrawer = utils.qs("#moreDrawer");
    const moreDrawerBackdrop = utils.qs("#moreDrawerBackdrop");
    const moreOpenButtons = [
      utils.qs("#headerMoreButton"),
      ...utils.qsa('[data-bottom-action="open-more-drawer"]'),
    ].filter(Boolean);
    const moreDrawerClose = utils.qs("#moreDrawerClose");
    let moreLastFocus = null;
    let drawerScrollY = 0;
    let drawerScrollLocked = false;
    let touchMoveBlocked = false;

    function getDrawerFocusable() {
      if (!moreDrawer) return [];
      return utils.qsa(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        moreDrawer,
      );
    }

    function blockTouchMoveOutsideDrawer(event) {
      if (!touchMoveBlocked || !moreDrawer || moreDrawer.hidden) return;
      const target = event.target;
      if (target && moreDrawer.contains(target)) return;
      event.preventDefault();
    }

    function lockBackgroundScroll() {
      if (drawerScrollLocked) return;
      drawerScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add("more-drawer-open");
      document.body.classList.add("more-drawer-open");
      if (!touchMoveBlocked) {
        document.addEventListener("touchmove", blockTouchMoveOutsideDrawer, {
          passive: false,
        });
        touchMoveBlocked = true;
      }
      drawerScrollLocked = true;
    }

    function unlockBackgroundScroll() {
      if (!drawerScrollLocked) return;
      document.documentElement.classList.remove("more-drawer-open");
      document.body.classList.remove("more-drawer-open");
      if (touchMoveBlocked) {
        document.removeEventListener("touchmove", blockTouchMoveOutsideDrawer);
        touchMoveBlocked = false;
      }
      drawerScrollLocked = false;
      window.scrollTo(0, drawerScrollY);
    }

    function setMoreOpen(open) {
      if (!moreDrawer || !moreDrawerBackdrop) return;
      moreDrawer.hidden = !open;
      moreDrawerBackdrop.hidden = !open;
      moreDrawer.classList.toggle("is-open", open);
      moreDrawerBackdrop.classList.toggle("is-open", open);
      moreOpenButtons.forEach((btn) =>
        btn.setAttribute("aria-expanded", String(open)),
      );
      if (open) {
        lockBackgroundScroll();
        const [first] = getDrawerFocusable();
        first?.focus();
      } else if (moreLastFocus && typeof moreLastFocus.focus === "function") {
        unlockBackgroundScroll();
        moreLastFocus.focus();
      } else {
        unlockBackgroundScroll();
      }
    }

    function openMoreDrawer(trigger) {
      moreLastFocus = trigger || document.activeElement;
      setMoreOpen(true);
    }

    function closeMoreDrawer() {
      setMoreOpen(false);
    }

    let lastDrawerOpenAt = 0;
    const DRAWER_OPEN_DEBOUNCE_MS = 250;
    moreOpenButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const now = Date.now();
        if (now - lastDrawerOpenAt < DRAWER_OPEN_DEBOUNCE_MS) return;
        lastDrawerOpenAt = now;
        openMoreDrawer(btn);
      });
    });
    moreDrawerClose?.addEventListener("click", closeMoreDrawer);
    moreDrawerBackdrop?.addEventListener("click", closeMoreDrawer);

    if (moreDrawer) {
      moreDrawer.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMoreDrawer();
          return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          const focusable = getDrawerFocusable();
          if (!focusable.length) return;
          const direction = event.key === "ArrowDown" ? 1 : -1;
          const activeIndex = focusable.indexOf(document.activeElement);
          const nextIndex =
            activeIndex < 0
              ? 0
              : (activeIndex + direction + focusable.length) % focusable.length;
          event.preventDefault();
          focusable[nextIndex].focus();
          return;
        }

        if (event.key === "Home" || event.key === "End") {
          const focusable = getDrawerFocusable();
          if (!focusable.length) return;
          event.preventDefault();
          (event.key === "Home"
            ? focusable[0]
            : focusable[focusable.length - 1]
          ).focus();
          return;
        }

        if (event.key !== "Tab") return;
        const focusable = getDrawerFocusable();
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

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (moreDrawer && !moreDrawer.hidden) {
        closeMoreDrawer();
      }
    });

    // Mobile menu toggle
    const mobileToggle = utils.qs(".mobile-nav-toggle");
    const headerNav = utils.qs(".header-nav");
    const headerActions = utils.qs(".header-actions");

    if (mobileToggle && headerNav && headerActions) {
      function setMobileMenuOpen(isOpen) {
        mobileToggle.setAttribute("aria-expanded", String(isOpen));
        mobileToggle.setAttribute(
          "aria-label",
          isOpen ? "Close menu" : "Open menu",
        );

        if (window.innerWidth <= 767) {
          headerNav.classList.toggle("is-mobile-open", isOpen);
          headerNav.setAttribute("aria-hidden", String(!isOpen));
          headerActions.setAttribute("aria-hidden", "true");
        } else {
          headerNav.classList.remove("is-mobile-open");
          headerNav.setAttribute("aria-hidden", "false");
          headerActions.setAttribute("aria-hidden", "false");
        }
      }

      setMobileMenuOpen(false);

      mobileToggle.addEventListener("click", () => {
        const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
        setMobileMenuOpen(!expanded);
        if (!expanded) {
          headerNav.classList.add("animate-fade-in");
          headerActions.classList.add("animate-fade-in");
        }
      });

      document.addEventListener("click", (e) => {
        if (window.innerWidth > 767) return;
        const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
        if (!expanded) return;
        if (!e.target.closest(".header-container")) {
          setMobileMenuOpen(false);
        }
      });

      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Escape" &&
          mobileToggle.getAttribute("aria-expanded") === "true"
        ) {
          setMobileMenuOpen(false);
        }
      });

      headerNav.addEventListener("click", (event) => {
        const link = event.target.closest(".header-nav__link");
        if (!link) return;
        if (window.innerWidth <= 767) {
          setMobileMenuOpen(false);
        }
      });

      // Close mobile menu on resize
      window.addEventListener(
        "resize",
        utils.debounce(() => {
          setMobileMenuOpen(false);
        }, 250),
      );
    }

    if (currentPage === "itinerary" && window.location.hash === "#today") {
      const todayTarget =
        document.getElementById("today") ||
        document.getElementById("today-card") ||
        document.querySelector('[data-today="true"]');
      if (todayTarget) {
        window.requestAnimationFrame(() => {
          todayTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  function cruiseStatusText(now, embarkation) {
    return (
      window.CruiseLayoutMode?.cruiseStatusText?.(now, embarkation) ||
      "Boarding soon · lock final details"
    );
  }

  function getDayPart(now) {
    return window.CruiseLayoutMode?.getDayPart?.(now) || "afternoon";
  }

  // ---------------------------
  // Scroll Behavior
  // ---------------------------
  function initScrollBehavior() {}

  function initImageOptimization() {
    utils.qsa("img").forEach((img, index) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", index < 2 ? "eager" : "lazy");
      }
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
    });
  }

  function initReusableUiComponents() {
    const filterToggles = utils.qsa("[data-filter-toggle]");
    const filterPanels = utils.qsa("[data-filter-panel]");

    function closeAllPanels() {
      filterPanels.forEach((panel) => panel.classList.remove("is-open"));
      filterToggles.forEach((toggle) =>
        toggle.setAttribute("aria-expanded", "false"),
      );
    }

    filterToggles.forEach((toggle) => {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = panel.classList.contains("is-open");
        closeAllPanels();
        if (!isOpen) {
          panel.classList.add("is-open");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-filter-root]")) {
        closeAllPanels();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllPanels();
      }
    });

    utils.qsa("[data-filter-group]").forEach((group) => {
      const options = utils.qsa("[data-filter-option]", group);
      options.forEach((option) => {
        option.addEventListener("click", () => {
          options.forEach((item) => {
            const isActive = item === option;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-checked", isActive ? "true" : "false");
          });

          const groupName = group.dataset.filterGroup || "";
          const value = option.dataset.filterValue || "";
          document.dispatchEvent(
            new CustomEvent("rccl:filter-change", {
              detail: { group: groupName, value },
            }),
          );
        });
      });
    });

    const modalRegistry = new Map();
    utils.qsa("[data-modal]").forEach((modal) => {
      if (modal.id) modalRegistry.set(modal.id, modal);
    });

    let lastTrigger = null;

    function getFocusableElements(container) {
      return utils.qsa(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        container,
      );
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove("rccl-modal--open", "room-modal--open");
      modal.setAttribute("aria-hidden", "true");
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    function openModal(modal, trigger = null) {
      if (!modal) return;
      lastTrigger = trigger || document.activeElement;
      modal.classList.add("rccl-modal--open", "room-modal--open");
      modal.setAttribute("aria-hidden", "false");
      const focusable = getFocusableElements(modal);
      focusable[0]?.focus();
    }

    window.RCCLModal = {
      open: (id, trigger) => openModal(modalRegistry.get(id), trigger || null),
      close: (id) => closeModal(modalRegistry.get(id)),
    };

    utils.qsa("[data-modal-open]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = trigger.dataset.modalOpen;
        if (!targetId) return;
        openModal(modalRegistry.get(targetId), trigger);
      });
    });

    utils.qsa("[data-modal-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        const modal = closeBtn.closest("[data-modal]");
        closeModal(modal);
      });
    });

    document.addEventListener("click", (event) => {
      const modal = event.target.closest("[data-modal]");
      if (!modal) return;
      if (event.target === modal) closeModal(modal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const openModalEl = utils.qs(
        "[data-modal].rccl-modal--open, [data-modal].room-modal--open",
      );
      if (openModalEl) {
        closeModal(openModalEl);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const openModalEl = utils.qs(
        "[data-modal].rccl-modal--open, [data-modal].room-modal--open",
      );
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

  function initMotionSystem() {
    const revealItems = utils.qsa("[data-reveal]");
    if (!revealItems.length) return;

    if (utils.prefersReducedMotion()) {
      revealItems.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    revealItems.forEach((el) => observer.observe(el));
  }

  // ---------------------------
  // Service Worker
  // ---------------------------
  function initServiceWorker() {
    window.CruiseLayoutPWA?.initServiceWorker?.();
  }

  // ---------------------------
  // Initialize
  // ---------------------------
  function init() {
    ensureSharedMounts();
    document.body.classList.add("app-theme-rcc");

    // Inject styles
    injectMinimalStyles();
    injectNavV2Styles();

    // Initialize theme
    ThemeManager.init();

    // Render components
    renderHeader();
    renderFooter();

    // Keep this mount empty to avoid floating mobile bars.
    renderBottomNav();

    // Keep drawer/backdrop outside header so mobile Safari can render
    // fixed overlays correctly even when header has visual effects.
    promoteMoreDrawerToBody();

    // Initialize event handlers
    initEventHandlers();
    initScrollBehavior();
    initImageOptimization();
    initReusableUiComponents();
    initMotionSystem();
    initServiceWorker();

    // Bottom navigation spacing is handled responsively via injected styles.
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
