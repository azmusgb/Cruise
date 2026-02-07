(function renderSharedLayout() {
  const CONFIG = {
    pages: {
      index: { 
        label: 'Dashboard', 
        subtext: 'The Royal Way Hub',
        icon: 'fa-compass',
        gradient: 'linear-gradient(135deg, #00539f 0%, #0088cc 100%)'
      },
      itinerary: { 
        label: 'Itinerary', 
        subtext: 'Daily Adventure Planner',
        icon: 'fa-route',
        gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
      },
      operations: { 
        label: 'Checklist', 
        subtext: 'Royal Operations',
        icon: 'fa-clipboard-check',
        gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff9e5c 100%)'
      },
      rooms: { 
        label: 'Rooms', 
        subtext: 'Stateroom Guide',
        icon: 'fa-door-open',
        gradient: 'linear-gradient(135deg, #6a1b9a 0%, #9c4dcc 100%)'
      },
      decks: { 
        label: 'Deck Plans', 
        subtext: 'Ship Navigation',
        icon: 'fa-map-marked-alt',
        gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)'
      },
      dining: { 
        label: 'Dining', 
       subtext: 'Culinary Compass',
        icon: 'fa-utensils',
        gradient: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)'
      },
      tips: { 
        label: 'Tips', 
        subtext: 'Cruise Essentials',
        icon: 'fa-lightbulb',
        gradient: 'linear-gradient(135deg, #f9a825 0%, #ffd54f 100%)'
      }
    },
    
    navItems: [
      { id: 'index', href: 'index.html', icon: 'fa-home', text: 'Dashboard', badge: null },
      { id: 'operations', href: 'operations.html', icon: 'fa-clipboard-list', text: 'Checklist', badge: 'pendingCount' },
      { id: 'itinerary', href: 'itinerary.html', icon: 'fa-route', text: 'Itinerary', badge: null },
      { id: 'rooms', href: 'rooms.html', icon: 'fa-bed', text: 'Rooms', badge: null },
      { id: 'decks', href: 'decks.html', icon: 'fa-map', text: 'Deck Plans', badge: null },
      { id: 'dining', href: 'dining.html', icon: 'fa-utensils', text: 'Dining', badge: null },
      { id: 'tips', href: 'tips.html', icon: 'fa-lightbulb', text: 'Tips', badge: null }
    ],
    
    contact: {
      phone: '1-866-562-7625',
      email: 'guestservices@royalcaribbean.com',
      hours: '24/7 Guest Support'
    },
    
    shipInfo: {
      name: 'Adventure of the Seas',
      class: 'Voyager Class',
      amplified: '2018',
      registry: 'The Bahamas',
      guestCapacity: '3,114'
    }
  };

  // Inject custom styles
  const injectStyles = () => {
    const styleId = 'shared-layout-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      :root {
        --primary-blue: #00539f;
        --secondary-blue: #0088cc;
        --accent-gold: #ffb325;
        --dark-navy: #0a1a35;
        --light-gray: #f8f9fa;
        --success: #2e7d32;
        --warning: #ff6b35;
        --danger: #c62828;
        --shadow-sm: 0 2px 8px rgba(0, 83, 159, 0.1);
        --shadow-md: 0 4px 20px rgba(0, 83, 159, 0.15);
        --shadow-lg: 0 8px 30px rgba(0, 83, 159, 0.2);
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --border-radius: 12px;
        --border-radius-lg: 20px;
      }

      /* Enhanced Header */
      .header {
        background: white;
        box-shadow: var(--shadow-sm);
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 3px solid var(--accent-gold);
        transition: var(--transition);
      }

      .header.scrolled {
        box-shadow: var(--shadow-md);
        padding: 0.5rem 0;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        position: relative;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-decoration: none;
        transition: var(--transition);
        padding: 0.5rem;
        border-radius: var(--border-radius);
      }

      .logo:hover {
        transform: translateY(-2px);
        background: rgba(0, 131, 255, 0.05);
      }

      .logo-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        box-shadow: var(--shadow-md);
        transition: var(--transition);
      }

      .logo:hover .logo-icon {
        transform: rotate(10deg) scale(1.1);
      }

      .logo-text-content {
        display: flex;
        flex-direction: column;
      }

      .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--dark-navy), var(--primary-blue));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.5px;
      }

      .logo-subtext {
        font-size: 0.9rem;
        color: var(--secondary-blue);
        font-weight: 500;
      }

      /* Enhanced Navigation */
      .main-nav {
        display: flex;
        gap: 0.5rem;
      }

      .nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 0.25rem;
        background: var(--light-gray);
        padding: 0.5rem;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-sm);
      }

      .nav-item {
        position: relative;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        text-decoration: none;
        color: var(--dark-navy);
        border-radius: var(--border-radius);
        transition: var(--transition);
        font-weight: 500;
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }

      .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 179, 37, 0.1), transparent);
        transition: left 0.7s ease;
      }

      .nav-link:hover::before {
        left: 100%;
      }

      .nav-link:hover {
        background: white;
        color: var(--primary-blue);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .nav-link i {
        font-size: 1.1rem;
        color: var(--secondary-blue);
        transition: var(--transition);
      }

      .nav-link:hover i {
        color: var(--accent-gold);
        transform: scale(1.2);
      }

      .nav-item.active .nav-link {
        background: var(--primary-blue);
        color: white;
        box-shadow: var(--shadow-md);
      }

      .nav-item.active .nav-link i {
        color: white;
      }

      .nav-item.active::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: var(--accent-gold);
        border-radius: 2px;
      }

      .nav-badge {
        background: var(--warning);
        color: white;
        font-size: 0.7rem;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-weight: 600;
        animation: pulse 2s infinite;
        margin-left: 0.5rem;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      /* Menu Toggle */
      .menu-toggle {
        display: none;
        background: var(--primary-blue);
        color: white;
        border: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        cursor: pointer;
        transition: var(--transition);
        box-shadow: var(--shadow-md);
      }

      .menu-toggle:hover {
        background: var(--secondary-blue);
        transform: rotate(90deg);
      }

      /* Enhanced Footer */
      .footer {
        background: linear-gradient(135deg, var(--dark-navy) 0%, var(--primary-blue) 100%);
        color: white;
        padding: 3rem 0 2rem;
        margin-top: 4rem;
        position: relative;
        overflow: hidden;
      }

      .footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--accent-gold), #ffd54f, var(--accent-gold));
      }

      .footer-main {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 3rem;
        margin-bottom: 2rem;
        position: relative;
        z-index: 1;
      }

      .footer-logo-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .footer-logo {
        font-size: 2rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: white;
        text-decoration: none;
      }

      .footer-logo i {
        color: var(--accent-gold);
      }

      .footer-tagline {
        font-size: 1.1rem;
        opacity: 0.9;
        line-height: 1.6;
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: var(--border-radius);
        border-left: 4px solid var(--accent-gold);
      }

      .footer-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .footer-column-heading {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--accent-gold);
        position: relative;
        padding-bottom: 0.5rem;
      }

      .footer-column-heading::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 2px;
        background: var(--accent-gold);
      }

      .footer-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .footer-list a {
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: var(--transition);
        padding: 0.5rem;
        border-radius: 6px;
      }

      .footer-list a:hover {
        color: white;
        background: rgba(255, 179, 37, 0.1);
        transform: translateX(5px);
      }

      .footer-list a::before {
        content: '→';
        color: var(--accent-gold);
        opacity: 0;
        transition: var(--transition);
      }

      .footer-list a:hover::before {
        opacity: 1;
      }

      .contact-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--border-radius);
        transition: var(--transition);
      }

      .contact-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .contact-item i {
        color: var(--accent-gold);
        font-size: 1.1rem;
        width: 24px;
      }

      .contact-link {
        color: white;
        text-decoration: none;
        transition: var(--transition);
      }

      .contact-link:hover {
        color: var(--accent-gold);
      }

      .footer-disclaimer {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 2rem;
        text-align: center;
        opacity: 0.8;
        font-size: 0.9rem;
        line-height: 1.6;
      }

      .ship-features {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .ship-feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
      }

      .ship-feature i {
        color: var(--accent-gold);
      }

      /* Mobile Responsiveness */
      @media (max-width: 992px) {
        .footer-main {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        .nav-list {
          display: none;
        }
        
        .nav-list.mobile-open {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          margin-top: 1rem;
        }
        
        .menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          flex-wrap: wrap;
        }
        
        .logo-text {
          font-size: 1.2rem;
        }
        
        .ship-features {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      }

      /* Floating Action Button for Mobile */
      .fab {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--primary-blue);
        color: white;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        z-index: 999;
        border: none;
        cursor: pointer;
        transition: var(--transition);
      }

      .fab:hover {
        background: var(--secondary-blue);
        transform: scale(1.1) rotate(90deg);
      }

      @media (max-width: 992px) {
        .fab {
          display: flex;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = styles;
    document.head.appendChild(style);
  };

  // Helper functions
  const getCurrentPage = (element) => {
    return element?.dataset?.page || 'index';
  };

  const renderNavItem = (item, currentPage) => {
    const isActive = item.id === currentPage;
    const badgeContent = item.badge === 'pendingCount' 
      ? '<span class="nav-badge" id="pendingCount">3</span>'
      : '';

    return `
      <li class="nav-item${isActive ? ' active' : ''}">
        <a href="${item.href}" class="nav-link" ${isActive ? 'aria-current="page"' : ''}>
          <i class="fas ${item.icon}"></i>
          <span class="nav-text">${item.text}</span>
          ${badgeContent}
        </a>
      </li>
    `;
  };

  // Header scroll effect
  const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  };

  // Mobile menu functionality
  const initMobileMenu = () => {
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navList.classList.toggle('mobile-open');
        
        // Animate hamburger icon
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navList.contains(e.target)) {
          menuToggle.setAttribute('aria-expanded', 'false');
          navList.classList.remove('mobile-open');
          const icon = menuToggle.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        }
      });

      // Close menu on link click
      navList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          menuToggle.setAttribute('aria-expanded', 'false');
          navList.classList.remove('mobile-open');
          const icon = menuToggle.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        }
      });
    }
  };

  // Floating action button functionality
  const initFloatingButton = () => {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fas fa-ship"></i>';
    fab.setAttribute('aria-label', 'Quick actions');
    fab.setAttribute('title', 'Quick menu');
    
    fab.addEventListener('click', () => {
      // Scroll to top or open quick menu
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Add bounce effect
      fab.style.transform = 'scale(1.2)';
      setTimeout(() => {
        fab.style.transform = '';
      }, 300);
    });
    
    document.body.appendChild(fab);
  };

  const renderHeader = () => {
    const headerMount = document.getElementById('sharedHeader');
    if (!headerMount) return;

    const currentPage = getCurrentPage(headerMount);
    const pageConfig = CONFIG.pages[currentPage] || CONFIG.pages.index;
    const showMenuToggle = headerMount.dataset.menuToggle === 'true';

    const navItems = CONFIG.navItems
      .map(item => renderNavItem(item, currentPage))
      .join('');

    headerMount.outerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo">
              <div class="logo-icon">
                <i class="fas ${pageConfig.icon}"></i>
              </div>
              <div class="logo-text-content">
                <div class="logo-text">${CONFIG.shipInfo.name}</div>
                <div class="logo-subtext">${pageConfig.subtext}</div>
              </div>
            </a>
            
            <nav class="main-nav" aria-label="Main Navigation">
              <ul class="nav-list">${navItems}</ul>
            </nav>
            
            ${showMenuToggle ? `
              <button class="menu-toggle" id="menuToggle" 
                      aria-label="Toggle navigation menu" 
                      aria-expanded="false" 
                      aria-controls="mobileMenu">
                <i class="fas fa-bars"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </header>
    `;
  };

  const renderFooter = () => {
    const footerMount = document.getElementById('sharedFooter');
    if (!footerMount) return;

    const currentPage = getCurrentPage(footerMount);
    
    const footerLinks = CONFIG.navItems
      .filter(item => item.id !== currentPage)
      .map(item => `
        <li>
          <a href="${item.href}">
            <i class="fas ${item.icon}"></i>
            ${item.text}
          </a>
        </li>
      `).join('');

    footerMount.outerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-main">
            <div class="footer-logo-section">
              <a href="index.html" class="footer-logo">
                <i class="fas fa-ship"></i>
                ${CONFIG.shipInfo.name}
              </a>
              <p class="footer-tagline">
                ${CONFIG.shipInfo.class} • Amplified ${CONFIG.shipInfo.amplified}<br>
                Guest Capacity: ${CONFIG.shipInfo.guestCapacity}
              </p>
            </div>
            
            <div class="footer-section">
              <h4 class="footer-column-heading">Cruise Guide</h4>
              <ul class="footer-list">
                ${footerLinks}
              </ul>
            </div>
            
            <div class="footer-section">
              <h4 class="footer-column-heading">Need Help?</h4>
              <div class="contact-info">
                <div class="contact-item">
                  <i class="fas fa-phone"></i>
                  <a href="tel:${CONFIG.contact.phone}" class="contact-link">
                    ${CONFIG.contact.phone}
                  </a>
                </div>
                <div class="contact-item">
                  <i class="fas fa-envelope"></i>
                  <a href="mailto:${CONFIG.contact.email}" class="contact-link">
                    ${CONFIG.contact.email}
                  </a>
                </div>
                <div class="contact-item">
                  <i class="fas fa-clock"></i>
                  <span>${CONFIG.contact.hours}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer-disclaimer">
            <p>© 2026 Royal Caribbean International. Ships' Registry: ${CONFIG.shipInfo.registry}. All information subject to change.</p>
            <div class="ship-features">
              <span class="ship-feature">
                <i class="fas fa-shield-alt"></i>
                <span>Royal Caribbean International</span>
              </span>
              <span class="ship-feature">
                <i class="fas fa-award"></i>
                <span>World's Best Cruise Line</span>
              </span>
              <span class="ship-feature">
                <i class="fas fa-star"></i>
                <span>14 Years Running</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    `;
  };

  // Initialize everything
  const init = () => {
    // Inject styles first
    injectStyles();
    
    // Render components
    renderHeader();
    renderFooter();
    
    // Initialize interactions
    setTimeout(() => {
      initHeaderScroll();
      initMobileMenu();
      initFloatingButton();
      
      // Add subtle entrance animations
      document.querySelectorAll('.header, .footer').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100);
      });
    }, 100);
  };

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();