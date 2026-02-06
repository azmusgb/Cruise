(function renderSharedLayout() {
  const PAGE_CONFIG = {
    index: { label: 'Dashboard', subtext: 'The Royal Way Hub' },
    itinerary: { label: 'Itinerary', subtext: 'Daily Adventure Planner' },
    operations: { label: 'Checklist', subtext: 'Royal Operations' },
    rooms: { label: 'Rooms', subtext: 'Stateroom Guide' },
    decks: { label: 'Deck Plans', subtext: 'Ship Navigation' },
    dining: { label: 'Dining', subtext: 'Culinary Compass' },
    tips: { label: 'Tips', subtext: 'Cruise Essentials' }
  };

  const NAV_ITEMS = [
    { key: 'index', href: 'index.html', icon: 'fa-home', text: 'Dashboard' },
    { key: 'operations', href: 'operations.html', icon: 'fa-tasks', text: 'Checklist' },
    { key: 'itinerary', href: 'itinerary.html', icon: 'fa-route', text: 'Itinerary' },
    { key: 'rooms', href: 'rooms.html', icon: 'fa-bed', text: 'Rooms' },
    { key: 'decks', href: 'decks.html', icon: 'fa-map', text: 'Deck Plans' },
    { key: 'dining', href: 'dining.html', icon: 'fa-utensils', text: 'Dining' },
    { key: 'tips', href: 'tips.html', icon: 'fa-lightbulb', text: 'Tips' }
  ];

  const headerMount = document.getElementById('sharedHeader');
  if (headerMount) {
    const page = headerMount.dataset.page || 'index';
    const config = PAGE_CONFIG[page] || PAGE_CONFIG.index;
    const showMenuToggle = headerMount.dataset.menuToggle === 'true';

    const nav = NAV_ITEMS.map((item) => {
      const activeClass = item.key === page ? ' active' : '';
      const badge = page === 'operations' && item.key === 'operations'
        ? '<span class="nav-badge" id="pendingCount">3</span>'
        : '';

      return `<a href="${item.href}" class="nav-item${activeClass}"><i class="fas ${item.icon}"></i> ${item.text}${badge}</a>`;
    }).join('');

    headerMount.outerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="index.html" class="logo">
              <div class="logo-icon"><i class="fas fa-ship"></i></div>
              <div>
                <div class="logo-text">Adventure of the Seas</div>
                <div class="logo-subtext">${config.subtext}</div>
              </div>
            </a>
            <nav class="main-nav">${nav}</nav>
            ${showMenuToggle ? '<button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><i class="fas fa-bars"></i></button>' : ''}
          </div>
        </div>
      </header>
    `;
  }

  const footerMount = document.getElementById('sharedFooter');
  if (footerMount) {
    const page = footerMount.dataset.page || 'index';

    const links = NAV_ITEMS.filter((item) => item.key !== page).map((item) => (
      `<li><a href="${item.href}">${item.text}</a></li>`
    )).join('');

    footerMount.outerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-main">
            <div class="footer-logo-section">
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Royal Caribbean International</h3>
              <p class="footer-tagline">World's Best Cruise Line • 14 Years Running</p>
            </div>
            <div>
              <h4 class="footer-column-heading">Cruise Guide</h4>
              <ul class="footer-list">${links}</ul>
            </div>
            <div>
              <h4 class="footer-column-heading">Need Help?</h4>
              <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> <a href="tel:1-866-562-7625" style="color: rgba(255, 255, 255, 0.8);">1-866-562-7625</a></p>
              <p><i class="fas fa-envelope"></i> <a href="mailto:guestservices@royalcaribbean.com" style="color: rgba(255, 255, 255, 0.8);">guestservices@royalcaribbean.com</a></p>
            </div>
          </div>
          <div class="footer-disclaimer">
            <p class="mt-2">© 2026 Royal Caribbean International. Ships' Registry: The Bahamas. All information subject to change.</p>
            <p class="mt-2">ADVENTURE OF THE SEAS® • VOYAGER CLASS • AMPLIFIED 2018</p>
          </div>
        </div>
      </footer>
    `;
  }
})();
