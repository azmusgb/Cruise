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

    const headerClassName = currentPage === 'index' ? 'header' : 'header header--subpage';

    headerMount.outerHTML = `
      <header class="${headerClassName}">
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

  const renderFooter = () => {
    const footerMount = document.getElementById('sharedFooter');
    if (!footerMount) return;
    footerMount.outerHTML = '';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderHeader();
      renderFooter();
    });
  } else {
    renderHeader();
    renderFooter();
  }
})();
