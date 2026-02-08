(function renderSharedLayout() {
  const NAV_ITEMS = [
    {
      id: 'index',
      href: 'index.html',
      icon: 'fa-home',
      text: 'Dashboard'
    },
    {
      id: 'operations',
      href: 'operations.html',
      icon: 'fa-tasks',
      text: 'Checklist',
      badge: '6'
    },
    {
      id: 'itinerary',
      href: 'itinerary.html',
      icon: 'fa-route',
      text: 'Itinerary'
    },
    {
      id: 'rooms',
      href: 'rooms.html',
      icon: 'fa-bed',
      text: 'Staterooms'
    },
    {
      id: 'dining',
      href: 'dining.html',
      icon: 'fa-utensils',
      text: 'Dining'
    }
  ];

  const renderHeader = () => {
    const headerMount = document.getElementById('sharedHeader');
    if (!headerMount) return;

    const currentPage = headerMount.dataset.page || 'index';

    const navLinks = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.id;
      return `
        <a href="${item.href}" class="nav-link${isActive ? ' active' : ''}">
          <i class="fas ${item.icon}"></i> ${item.text}
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      `;
    }).join('');

    headerMount.outerHTML = `
      <header class="app-header">
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo">
              <div class="logo-icon"><i class="fas fa-ship"></i></div>
              <div>
                <div class="logo-text">The Royal Way Hub</div>
                <div class="logo-subtext">Adventure of the Seas</div>
              </div>
            </a>
            <nav class="nav-desktop">
              ${navLinks}
            </nav>
            <button class="menu-toggle" aria-label="Open menu"><i class="fas fa-bars"></i></button>
          </div>
        </div>
      </header>
    `;
  };

  const initHeroObserver = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const body = document.body;
    const getHeaderHeight = () => {
      const header = document.querySelector('.app-header');
      return header ? header.getBoundingClientRect().height : 0;
    };

    const setHeroState = (isVisible) => {
      body.classList.toggle('hero-visible', isVisible);
      body.classList.toggle('hero-past', !isVisible);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => setHeroState(entry.isIntersecting),
        {
          rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`,
          threshold: 0.1
        }
      );
      observer.observe(hero);
    } else {
      const handleScroll = () => {
        const heroBottom = hero.getBoundingClientRect().bottom;
        setHeroState(heroBottom > getHeaderHeight());
      };
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  };

  const renderFooter = () => {
    const footerMount = document.getElementById('sharedFooter');
    if (!footerMount) return;
    footerMount.outerHTML = '';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderHeader();
      renderFooter();
      initHeroObserver();
    });
  } else {
    renderHeader();
    renderFooter();
    initHeroObserver();
  }
})();
