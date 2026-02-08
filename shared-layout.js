(function renderSharedLayout() {
  'use strict';

  // Enhanced navigation configuration
  const NAV_ITEMS = [
    {
      id: 'index',
      href: 'index.html',
      icon: 'fa-home',
      text: 'Dashboard',
      ariaLabel: 'Go to dashboard page',
      description: 'Overview of your cruise experience'
    },
    {
      id: 'operations',
      href: 'operations.html',
      icon: 'fa-tasks',
      text: 'Checklist',
      badge: '6',
      ariaLabel: 'Operations checklist page',
      description: 'Pre-cruise tasks and preparation',
      badgeColor: 'badge-warning'
    },
    {
      id: 'itinerary',
      href: 'itinerary.html',
      icon: 'fa-route',
      text: 'Itinerary',
      ariaLabel: 'Itinerary page',
      description: 'Daily schedule and activities',
      badge: 'NEW',
      badgeColor: 'badge-success'
    },
    {
      id: 'rooms',
      href: 'rooms.html',
      icon: 'fa-bed',
      text: 'Staterooms',
      ariaLabel: 'Staterooms page',
      description: 'Room assignments and details'
    },
    {
      id: 'decks',
      href: 'decks.html',
      icon: 'fa-map',
      text: 'Decks',
      ariaLabel: 'View deck plans',
      description: 'Interactive ship layout'
    },
    {
      id: 'dining',
      href: 'dining.html',
      icon: 'fa-utensils',
      text: 'Dining',
      ariaLabel: 'Dining page',
      description: 'Restaurants and reservations',
      badge: '3',
      badgeColor: 'badge-info'
    },
    {
      id: 'tips',
      href: 'tips.html',
      icon: 'fa-lightbulb',
      text: 'Tips',
      ariaLabel: 'View tips and packing guide',
      description: 'Cruise advice and packing list'
    }
  ];

  // Enhanced footer links configuration
  const FOOTER_SECTIONS = [
    {
      title: 'Adventure of the Seas',
      links: [
        { text: 'Dashboard', href: 'index.html', icon: 'fa-home' },
        { text: 'Ship Overview', href: 'ship.html', icon: 'fa-ship' },
        { text: 'Cruise Documents', href: 'docs.html', icon: 'fa-file-alt' }
      ]
    },
    {
      title: 'Onboard Experience',
      links: [
        { text: 'Activities', href: 'activities.html', icon: 'fa-calendar-alt' },
        { text: 'Entertainment', href: 'entertainment.html', icon: 'fa-music' },
        { text: 'Spa & Fitness', href: 'spa.html', icon: 'fa-spa' },
        { text: 'Shopping', href: 'shopping.html', icon: 'fa-shopping-bag' }
      ]
    },
    {
      title: 'Support',
      links: [
        { text: '24/7 Support', href: 'tel:+1-800-398-9819', icon: 'fa-headset' },
        { text: 'FAQ & Help', href: 'faq.html', icon: 'fa-question-circle' },
        { text: 'Safety Info', href: 'safety.html', icon: 'fa-shield-alt' },
        { text: 'Contact Us', href: 'contact.html', icon: 'fa-envelope' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', href: 'privacy.html' },
        { text: 'Terms of Service', href: 'terms.html' },
        { text: 'Accessibility', href: 'accessibility.html' },
        { text: 'Cookie Policy', href: 'cookies.html' }
      ]
    }
  ];

  // Utility functions
  const utils = {
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    isMobile: () => window.innerWidth <= 768,

    getCurrentPage: (mountElement) => {
      return mountElement?.dataset?.page || 
             window.location.pathname.split('/').pop()?.replace('.html', '') || 
             'index';
    },

    createElement: (html) => {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    },

    announceToScreenReader: (message, priority = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
  };

  // Theme management
  const ThemeManager = {
    currentTheme: 'light',

    init() {
      this.loadTheme();
      this.setupThemeToggle();
    },

    loadTheme() {
      const savedTheme = localStorage.getItem('cruise-theme') || 'light';
      this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.currentTheme = theme;
      localStorage.setItem('cruise-theme', theme);
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(newTheme);
      utils.announceToScreenReader(`Switched to ${newTheme} theme`);
    },

    setupThemeToggle() {
      // Will be implemented in renderHeader
    }
  };

  // Enhanced header rendering with animations
  const renderHeader = () => {
    const headerMount = document.getElementById('sharedHeader');
    if (!headerMount) {
      console.warn('Header mount element not found');
      return;
    }

    const currentPage = utils.getCurrentPage(headerMount);
    const showMenuToggle = headerMount.dataset.menuToggle !== 'false';
    const currentYear = new Date().getFullYear();

    const navLinks = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.id;
      return `
        <a href="${item.href}" 
           class="nav-link${isActive ? ' active' : ''}" 
           ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
           ${isActive ? 'aria-current="page"' : ''}
           data-tooltip="${item.description}"
           data-delay="100">
          <i class="fas ${item.icon}" aria-hidden="true"></i> 
          <span class="nav-text">${item.text}</span>
          ${item.badge ? `
            <span class="nav-badge ${item.badgeColor || 'badge-primary'}" 
                  aria-label="${item.badge} ${item.text === 'Checklist' ? 'pending items' : 'new items'}">
              ${item.badge}
            </span>
          ` : ''}
        </a>
      `;
    }).join('');

    const headerHTML = `
      <header class="app-header app-header--nav" role="banner">
        <div class="container">
          <div class="header-content">
            <!-- Logo Section -->
            <a href="index.html" class="logo" aria-label="Go to dashboard">
              <div class="logo-icon" aria-hidden="true">
                <i class="fas fa-ship"></i>
              </div>
              <div class="logo-text-container">
                <div class="logo-text">The Royal Way Hub</div>
                <div class="logo-subtext">Adventure of the Seas • ${currentYear}</div>
              </div>
            </a>

            <!-- Desktop Navigation -->
            <nav class="nav-desktop" aria-label="Main navigation">
              ${navLinks}
              
              <!-- Theme Toggle -->
              <button class="theme-toggle" aria-label="Toggle theme" id="themeToggle">
                <i class="fas fa-sun" aria-hidden="true"></i>
                <i class="fas fa-moon" aria-hidden="true"></i>
                <span class="toggle-track"></span>
              </button>
              
              <!-- User Menu -->
              <div class="user-menu">
                <button class="user-menu-toggle" aria-label="User menu" aria-expanded="false">
                  <i class="fas fa-user-circle"></i>
                  <span class="user-name">Guest</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown">
                  <a href="profile.html" class="dropdown-item">
                    <i class="fas fa-user"></i> My Profile
                  </a>
                  <a href="settings.html" class="dropdown-item">
                    <i class="fas fa-cog"></i> Settings
                  </a>
                  <div class="dropdown-divider"></div>
                  <a href="help.html" class="dropdown-item">
                    <i class="fas fa-question-circle"></i> Help Center
                  </a>
                  <a href="logout.html" class="dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                  </a>
                </div>
              </div>
            </nav>

            <!-- Mobile Menu Toggle -->
            ${showMenuToggle ? `
              <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
                <span class="hamburger-box">
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                  <span class="hamburger-line"></span>
                </span>
              </button>
            ` : ''}
          </div>

          <!-- Mobile Navigation (Hidden by default) -->
          ${showMenuToggle ? `
            <nav class="nav-mobile" aria-label="Mobile navigation" hidden>
              <div class="mobile-nav-header">
                <span class="mobile-nav-title">Navigation</span>
                <button class="mobile-nav-close" aria-label="Close menu">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="mobile-nav-links">
                ${NAV_ITEMS.map(item => `
                  <a href="${item.href}" 
                     class="mobile-nav-link${currentPage === item.id ? ' active' : ''}"
                     ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}>
                    <i class="fas ${item.icon}"></i>
                    <span>${item.text}</span>
                    ${item.badge ? `<span class="mobile-badge ${item.badgeColor}">${item.badge}</span>` : ''}
                  </a>
                `).join('')}
              </div>
              <div class="mobile-nav-footer">
                <button class="theme-toggle-mobile" aria-label="Toggle theme">
                  <i class="fas fa-sun"></i>
                  <span>Light Mode</span>
                  <div class="toggle-switch">
                    <span class="toggle-slider"></span>
                  </div>
                </button>
              </div>
            </nav>
          ` : ''}
        </div>
        
        <!-- Progress Indicator -->
        <div class="header-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar"></div>
        </div>
      </header>
    `;

    headerMount.outerHTML = headerHTML;
    initHeaderInteractions();
  };

  // Initialize header interactions
  const initHeaderInteractions = () => {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.nav-mobile');
    const mobileClose = document.querySelector('.mobile-nav-close');
    
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNav.hidden = isExpanded;
        
        // Animate hamburger to X
        mobileToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
      });
      
      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileNav.hidden = true;
          mobileToggle.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileNav.hidden && 
            !mobileNav.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileNav.hidden = true;
          mobileToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => ThemeManager.toggleTheme());
    }
    
    // User menu
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
        userMenuToggle.setAttribute('aria-expanded', !isExpanded);
        
        // Close other open dropdowns
        document.querySelectorAll('.user-menu-toggle[aria-expanded="true"]')
          .forEach(btn => {
            if (btn !== userMenuToggle) {
              btn.setAttribute('aria-expanded', 'false');
            }
          });
      });
      
      // Close user menu when clicking outside
      document.addEventListener('click', () => {
        userMenuToggle.setAttribute('aria-expanded', 'false');
      });
    }
    
    // Tooltips for desktop nav
    if (!utils.isMobile()) {
      document.querySelectorAll('.nav-link[data-tooltip]').forEach(link => {
        let tooltip = null;
        let timeout = null;
        
        link.addEventListener('mouseenter', (e) => {
          timeout = setTimeout(() => {
            tooltip = document.createElement('div');
            tooltip.className = 'nav-tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
          }, parseInt(link.dataset.delay) || 300);
        });
        
        link.addEventListener('mouseleave', () => {
          clearTimeout(timeout);
          if (tooltip) {
            tooltip.remove();
            tooltip = null;
          }
        });
      });
    }
  };

  // Enhanced hero observer with parallax effects
  const initHeroObserver = () => {
    const hero = document.querySelector('.app-hero, .hero');
    if (!hero) return;

    const body = document.body;
    const header = document.querySelector('.app-header');
    const progressBar = document.querySelector('.header-progress .progress-bar');
    
    let observer = null;
    let scrollHandler = null;
    let lastScroll = 0;

    const updateHeaderState = (scrollProgress) => {
      if (!header) return;
      
      // Add/remove classes based on scroll
      body.classList.toggle('hero-visible', scrollProgress < 0.8);
      body.classList.toggle('hero-past', scrollProgress >= 0.8);
      
      // Update progress bar
      if (progressBar) {
        progressBar.style.transform = `scaleX(${scrollProgress})`;
      }
      
      // Add/remove scrolled class for header styling
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Parallax effect for hero if it has background image
      if (hero.style.backgroundImage) {
        const parallaxSpeed = 0.5;
        const yPos = -(window.scrollY * parallaxSpeed);
        hero.style.backgroundPositionY = `${yPos}px`;
      }
    };

    const calculateScrollProgress = () => {
      const heroHeight = hero.offsetHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (heroHeight - windowHeight)) * 100;
      return Math.min(Math.max(scrollPercent / 100, 0), 1);
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const progress = calculateScrollProgress();
            updateHeaderState(progress);
          });
        },
        {
          threshold: Array.from({ length: 101 }, (_, i) => i * 0.01)
        }
      );
      observer.observe(hero);
    } else {
      // Fallback for older browsers
      scrollHandler = utils.debounce(() => {
        const progress = calculateScrollProgress();
        updateHeaderState(progress);
        lastScroll = window.scrollY;
      }, 10);
      
      scrollHandler(); // Initial check
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Handle resize events
    const resizeHandler = utils.debounce(() => {
      if (scrollHandler) scrollHandler();
    }, 100);
    
    window.addEventListener('resize', resizeHandler, { passive: true });

    // Cleanup function
    return () => {
      if (observer) observer.disconnect();
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
      window.removeEventListener('resize', resizeHandler);
    };
  };

  // Enhanced footer rendering with more information
  const renderFooter = () => {
    const footerMount = document.getElementById('sharedFooter');
    if (!footerMount) {
      console.warn('Footer mount element not found');
      return;
    }

    const currentYear = new Date().getFullYear();
    
    const footerSections = FOOTER_SECTIONS.map(section => `
      <div class="footer-section">
        <h4 class="footer-subtitle">${section.title}</h4>
        ${section.links.map(link => `
          <a href="${link.href}" class="footer-link">
            ${link.icon ? `<i class="fas ${link.icon}" aria-hidden="true"></i>` : ''}
            <span>${link.text}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

    const footerHTML = `
      <footer class="app-footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            ${footerSections}
            
            <!-- Newsletter Signup -->
            <div class="footer-section footer-newsletter">
              <h4 class="footer-subtitle">Stay Updated</h4>
              <p class="footer-text">Get the latest cruise deals and news</p>
              <form class="newsletter-form" aria-label="Newsletter signup">
                <div class="input-group">
                  <input type="email" 
                         placeholder="Your email" 
                         aria-label="Email address"
                         class="newsletter-input">
                  <button type="submit" class="newsletter-button" aria-label="Subscribe">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
                <p class="newsletter-note">By subscribing you agree to our Privacy Policy</p>
              </form>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div class="footer-bottom">
            <div class="footer-copyright">
              <i class="fas fa-ship" aria-hidden="true"></i>
              <span>© ${currentYear} Royal Caribbean International. All rights reserved.</span>
            </div>
            
            <div class="footer-social">
              <span class="social-label">Follow us:</span>
              <a href="https://facebook.com" class="social-link" aria-label="Facebook">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" class="social-link" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" class="social-link" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" class="social-link" aria-label="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
            
            <div class="footer-app">
              <a href="https://apps.apple.com" class="app-link" aria-label="Download on App Store">
                <i class="fab fa-app-store"></i>
                <span>App Store</span>
              </a>
              <a href="https://play.google.com" class="app-link" aria-label="Get it on Google Play">
                <i class="fab fa-google-play"></i>
                <span>Google Play</span>
              </a>
            </div>
          </div>
          
          <!-- Back to Top -->
          <button class="back-to-top" aria-label="Scroll to top">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
      </footer>
    `;

    footerMount.outerHTML = footerHTML;
    initFooterInteractions();
  };

  // Initialize footer interactions
  const initFooterInteractions = () => {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input[type="email"]');
        if (input.value) {
          utils.announceToScreenReader('Thank you for subscribing to our newsletter!');
          input.value = '';
          // In a real app, you would send this to a server
        }
      });
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        utils.announceToScreenReader('Scrolled to top of page');
      });
      
      // Show/hide based on scroll
      window.addEventListener('scroll', utils.debounce(() => {
        if (window.scrollY > 500) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }, 100));
    }
  };

  // Initialize the entire layout system
  const init = () => {
    try {
      // Initialize theme manager
      ThemeManager.init();
      
      // Render components
      renderHeader();
      renderFooter();
      
      // Initialize hero observer (with cleanup reference)
      const cleanupHeroObserver = initHeroObserver();
      
      // Add global keyboard shortcuts
      initKeyboardShortcuts();
      
      // Initialize page transitions
      initPageTransitions();
      
      // Setup performance monitoring
      setupPerformanceMonitoring();
      
      // Store cleanup function
      if (typeof window !== 'undefined') {
        window.__cleanupSharedLayout = () => {
          if (cleanupHeroObserver) cleanupHeroObserver();
          // Add other cleanup functions here
        };
      }
      
      // Log initialization
      console.log('Shared layout initialized successfully');
    } catch (error) {
      console.error('Error initializing shared layout:', error);
      // Fallback: ensure at least basic navigation is available
      const headerMount = document.getElementById('sharedHeader');
      if (headerMount) {
        headerMount.innerHTML = '<div style="padding: 1rem; background: #f0f0f0;">Navigation Loading Error</div>';
      }
    }
  };

  // Additional features
  const initKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // Alt + 1-7 for navigation items
      if (e.altKey && e.key >= '1' && e.key <= '7') {
        const index = parseInt(e.key) - 1;
        if (NAV_ITEMS[index]) {
          window.location.href = NAV_ITEMS[index].href;
          e.preventDefault();
        }
      }
      
      // Escape to close any open dropdowns
      if (e.key === 'Escape') {
        document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
          el.setAttribute('aria-expanded', 'false');
        });
        const mobileNav = document.querySelector('.nav-mobile');
        if (mobileNav && !mobileNav.hidden) {
          mobileNav.hidden = true;
          document.body.style.overflow = '';
        }
      }
    });
  };

  const initPageTransitions = () => {
    // Add smooth page transition class
    document.documentElement.classList.add('page-transitions');
    
    // Intercept link clicks for smooth transitions
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.includes('.html') && !link.href.includes('#')) {
        e.preventDefault();
        document.body.classList.add('page-exiting');
        
        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      }
    });
  };

  const setupPerformanceMonitoring = () => {
    // Only in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Layout shift: ${entry.value.toFixed(3)}`, entry);
        }
      });
      
      perfObserver.observe({ type: 'layout-shift', buffered: true });
    }
  };

  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export utilities for other scripts to use
  window.SharedLayout = {
    utils,
    ThemeManager,
    NAV_ITEMS,
    FOOTER_SECTIONS,
    refresh: () => {
      if (window.__cleanupSharedLayout) {
        window.__cleanupSharedLayout();
      }
      init();
    }
  };
})();
