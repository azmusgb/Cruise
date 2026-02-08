(function renderSharedLayout() {
  'use strict';

  const NAV_ITEMS = [
    {
      id: 'index',
      href: 'index.html',
      icon: 'fa-home',
      text: 'Dashboard',
      ariaLabel: 'Dashboard page'
    },
    {
      id: 'operations',
      href: 'operations.html',
      icon: 'fa-tasks',
      text: 'Checklist',
      badge: '6',
      ariaLabel: 'Operations checklist page'
    },
    {
      id: 'itinerary',
      href: 'itinerary.html',
      icon: 'fa-route',
      text: 'Itinerary',
      ariaLabel: 'Itinerary page'
    },
    {
      id: 'rooms',
      href: 'rooms.html',
      icon: 'fa-bed',
      text: 'Staterooms',
      ariaLabel: 'Staterooms page'
    },
    {
      id: 'dining',
      href: 'dining.html',
      icon: 'fa-utensils',
      text: 'Dining',
      ariaLabel: 'Dining page'
    }
  ];

  // Mobile menu state
  let isMobileMenuOpen = false;

  const renderHeader = () => {
    const headerMount = document.getElementById('sharedHeader');
    if (!headerMount) {
      console.warn('Header mount element not found');
      return;
    }

    const currentPage = headerMount.dataset.page || 'index';
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const navLinks = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.id || currentPath === item.href;
      return `
        <a href="${item.href}" 
           class="nav-link${isActive ? ' active' : ''}" 
           ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
           ${isActive ? 'aria-current="page"' : ''}>
          <i class="fas ${item.icon}" aria-hidden="true"></i> 
          <span class="nav-text">${item.text}</span>
          ${item.badge ? `<span class="nav-badge" aria-label="${item.badge} pending items">${item.badge}</span>` : ''}
        </a>
      `;
    }).join('');

    headerMount.outerHTML = `
      <header class="app-header" role="banner">
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo" aria-label="Go to dashboard">
              <div class="logo-icon" aria-hidden="true"><i class="fas fa-ship"></i></div>
              <div>
                <div class="logo-text">The Royal Way Hub</div>
                <div class="logo-subtext">Adventure of the Seas</div>
              </div>
            </a>
            <nav class="nav-desktop" aria-label="Main navigation">
              ${navLinks}
            </nav>
            <button class="menu-toggle" aria-label="${isMobileMenuOpen ? 'Close menu' : 'Open menu'}" aria-expanded="${isMobileMenuOpen}">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <!-- Mobile Navigation -->
        <nav class="nav-mobile" aria-label="Mobile navigation" ${isMobileMenuOpen ? '' : 'hidden'}>
          <div class="nav-mobile-content">
            ${navLinks}
          </div>
        </nav>
      </header>
    `;

    // Initialize mobile menu functionality
    initMobileMenu();
  };

  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.nav-mobile');
    
    if (!menuToggle || !mobileNav) return;

    const updateMenuState = (open) => {
      isMobileMenuOpen = open;
      mobileNav.hidden = !open;
      menuToggle.setAttribute('aria-expanded', open);
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', () => {
      updateMenuState(!isMobileMenuOpen);
    });

    // Close menu when clicking on a link
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        updateMenuState(false);
      });
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        updateMenuState(false);
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isMobileMenuOpen && 
          !mobileNav.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        updateMenuState(false);
      }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && isMobileMenuOpen) {
          updateMenuState(false);
        }
      }, 250);
    });
  };

  const initHeroObserver = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const body = document.body;
    let header = null;
    let observer = null;
    let scrollHandler = null;

    const getHeaderHeight = () => {
      if (!header) {
        header = document.querySelector('.app-header');
      }
      return header ? header.getBoundingClientRect().height : 0;
    };

    const setHeroState = (isVisible) => {
      body.classList.toggle('hero-visible', isVisible);
      body.classList.toggle('hero-past', !isVisible);
    };

    if ('IntersectionObserver' in window) {
      // Use IntersectionObserver if available
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => setHeroState(entry.isIntersecting));
        },
        {
          rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`,
          threshold: 0.1
        }
      );
      observer.observe(hero);
    } else {
      // Fallback for older browsers
      scrollHandler = () => {
        const heroRect = hero.getBoundingClientRect();
        const headerHeight = getHeaderHeight();
        setHeroState(heroRect.bottom > headerHeight);
      };
      
      scrollHandler(); // Initial check
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Cleanup function (optional but good practice)
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
    };
  };

  const renderFooter = () => {
    const footerMount = document.getElementById('sharedFooter');
    if (!footerMount) {
      console.warn('Footer mount element not found');
      return;
    }

    const currentYear = new Date().getFullYear();
    
    footerMount.outerHTML = `
      <footer class="app-footer" role="contentinfo">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3 class="footer-title">The Royal Way Hub</h3>
              <p class="footer-text">Adventure of the Seas</p>
              <p class="footer-text">© ${currentYear} Royal Caribbean International</p>
            </div>
            <div class="footer-section">
              <h4 class="footer-subtitle">Quick Links</h4>
              <a href="index.html" class="footer-link">Dashboard</a>
              <a href="operations.html" class="footer-link">Checklist</a>
              <a href="itinerary.html" class="footer-link">Itinerary</a>
            </div>
            <div class="footer-section">
              <h4 class="footer-subtitle">Support</h4>
              <a href="tel:+1-800-398-9819" class="footer-link">Customer Support</a>
              <a href="faq.html" class="footer-link">FAQ</a>
              <a href="contact.html" class="footer-link">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  };

  const init = () => {
    try {
      renderHeader();
      renderFooter();
      const cleanupHeroObserver = initHeroObserver();
      
      // Optional: Add cleanup for SPA scenarios
      if (typeof window !== 'undefined') {
        window.__cleanupSharedLayout = () => {
          if (cleanupHeroObserver) cleanupHeroObserver();
        };
      }
    } catch (error) {
      console.error('Error initializing shared layout:', error);
    }
  };

  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();