// main.js - Deferred JavaScript for enhanced functionality

class CruiseCompanion {
    constructor() {
        this.searchIndex = null;
        this.savedData = null;
        this.currentSection = 'overview';
        this.observers = [];
        
        this.init();
    }
    
    init() {
        this.setupComponents();
        this.setupEventListeners();
        this.buildSearchIndex();
        this.setupIntersectionObserver();
        this.checkConnectivity();
        this.loadSavedData();
    }
    
    setupComponents() {
        // Initialize all interactive components
        this.setupTabs();
        this.setupFilters();
        this.setupPrint();
        this.setupOffline();
        this.setupPersonalization();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch(searchInput.value.trim());
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
        
        // Print functionality
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printItinerary());
        }
        
        // Save offline functionality
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveForOffline());
        }
        
        // Navigation active state
        document.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.getAttribute('data-section');
                this.setActiveSection(section);
            });
        });
        
        // Window resize handling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });
        
        // Online/offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Beforeunload for cleanup
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    setupTabs() {
        // Implement tab functionality for content sections
        const tabContainers = document.querySelectorAll('[data-tabs]');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('[role="tab"]');
            const panels = container.querySelectorAll('[role="tabpanel"]');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Deactivate all tabs
                    tabs.forEach(t => {
                        t.setAttribute('aria-selected', 'false');
                        t.classList.remove('active');
                    });
                    
                    // Hide all panels
                    panels.forEach(p => {
                        p.hidden = true;
                    });
                    
                    // Activate clicked tab
                    tab.setAttribute('aria-selected', 'true');
                    tab.classList.add('active');
                    
                    // Show corresponding panel
                    const panelId = tab.getAttribute('aria-controls');
                    const panel = document.getElementById(panelId);
                    if (panel) {
                        panel.hidden = false;
                    }
                });
            });
        });
    }
    
    setupFilters() {
        // Filter functionality for activities, dining, etc.
        const filterButtons = document.querySelectorAll('[data-filter]');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filterValue = button.getAttribute('data-filter');
                this.applyFilter(filterValue, button);
            });
        });
    }
    
    buildSearchIndex() {
        // Create search index from page content
        this.searchIndex = [];
        
        const contentElements = document.querySelectorAll(
            '.card__content, .sidebar-card, .activity-card, .tip-card'
        );
        
        contentElements.forEach((element, index) => {
            const text = element.textContent.trim();
            const title = element.closest('.card')?.querySelector('.card__title')?.textContent || '';
            const section = element.closest('section')?.id || 'general';
            
            if (text && text.length > 50) { // Only index substantial content
                this.searchIndex.push({
                    id: index,
                    title: title,
                    text: text.substring(0, 500), // Limit text length
                    section: section,
                    element: element
                });
            }
        });
    }
    
    performSearch(query) {
        if (!query || !this.searchIndex) return;
        
        const results = this.searchIndex.filter(item => {
            const searchText = (item.title + ' ' + item.text).toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        this.displaySearchResults(results, query);
    }
    
    displaySearchResults(results, query) {
        const searchResults = document.getElementById('mainSearchResults');
        const searchContainer = document.getElementById('searchResults');
        
        if (!searchResults && !searchContainer) return;
        
        const resultsHTML = `
            <div class="search-results__header">
                <h3>${results.length} results for "${query}"</h3>
            </div>
            <ul class="search-results__list" role="list">
                ${results.map(result => `
                    <li class="search-results__item">
                        <a href="#${result.section}" class="search-results__link" data-search-result="${result.id}">
                            <h4 class="search-results__title">${result.title}</h4>
                            <p class="search-results__snippet">${this.highlightText(result.text, query)}...</p>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        if (searchResults) {
            searchResults.innerHTML = resultsHTML;
            searchResults.hidden = false;
            
            // Scroll to results
            searchResults.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (searchContainer) {
            searchContainer.innerHTML = resultsHTML;
            searchContainer.hidden = false;
        }
        
        // Add click handlers for search results
        document.querySelectorAll('[data-search-result]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearchResultClick(e);
            });
        });
    }
    
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    handleSearchInput(value) {
        if (value.length >= 2) {
            this.performSearch(value);
        } else {
            this.clearSearchResults();
        }
    }
    
    clearSearchResults() {
        const searchResults = document.getElementById('mainSearchResults');
        const searchContainer = document.getElementById('searchResults');
        
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.hidden = true;
        }
        
        if (searchContainer) {
            searchContainer.innerHTML = '';
            searchContainer.hidden = true;
        }
    }
    
    handleSearchResultClick(event) {
        event.preventDefault();
        const resultId = event.currentTarget.getAttribute('data-search-result');
        const result = this.searchIndex?.find(item => item.id == resultId);
        
        if (result) {
            // Close search overlay
            const searchOverlay = document.getElementById('searchOverlay');
            if (searchOverlay) searchOverlay.hidden = true;
            
            // Navigate to section
            this.setActiveSection(result.section);
            
            // Highlight the result element
            this.highlightElement(result.element);
        }
    }
    
    highlightElement(element) {
        // Add highlight class and scroll to element
        element.classList.add('highlight');
        
        // Scroll to element with offset for header
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Remove highlight after delay
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 3000);
    }
    
    setupIntersectionObserver() {
        // Observe sections for active navigation highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.header__nav-link');
        
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    
                    // Update navigation
                    navLinks.forEach(link => {
                        const linkSection = link.getAttribute('data-section');
                        if (linkSection === sectionId) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                    
                    this.currentSection = sectionId;
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
        
        // Store observer for cleanup
        this.observers.push(observer);
    }
    
    setActiveSection(section) {
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.header__nav-link').forEach(link => {
            const linkSection = link.getAttribute('data-section');
            if (linkSection === section) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Scroll to section
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const sectionPosition = sectionElement.getBoundingClientRect().top;
            const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    setupPrint() {
        // Enhanced print functionality
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('print');
            mediaQuery.addEventListener('change', (mq) => {
                if (mq.matches) {
                    this.beforePrint();
                } else {
                    this.afterPrint();
                }
            });
        }
    }
    
    beforePrint() {
        // Store current state
        this.prePrintState = {
            scrollPosition: window.pageYOffset,
            activeSection: this.currentSection
        };
        
        // Show loading state
        this.showLoading();
    }
    
    afterPrint() {
        // Restore state
        if (this.prePrintState) {
            window.scrollTo(0, this.prePrintState.scrollPosition);
            this.setActiveSection(this.prePrintState.activeSection);
            delete this.prePrintState;
        }
        
        // Hide loading
        this.hideLoading();
    }
    
    printItinerary() {
        // Custom print functionality
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cruise Itinerary - Adventure of the Seas</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #0A4A7A; }
                    .section { margin-bottom: 30px; }
                    .highlight { background-color: yellow; }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() { window.print(); };
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    generatePrintContent() {
        // Generate optimized content for printing
        const sections = document.querySelectorAll('section[id]');
        let content = '<h1>Cruise Itinerary - Adventure of the Seas</h1>';
        
        sections.forEach(section => {
            const title = section.querySelector('.card__title')?.textContent || section.id;
            const sectionContent = section.innerHTML;
            
            content += `
                <div class="section">
                    <h2>${title}</h2>
                    ${sectionContent}
                </div>
            `;
        });
        
        return content;
    }
    
    setupOffline() {
        // Check if service worker is supported
        if ('serviceWorker' in navigator) {
            // Service worker is registered in the HTML
            this.setupOfflineUI();
        }
    }
    
    setupOfflineUI() {
        // Add offline indicator
        const offlineIndicator = document.createElement('div');
        offlineIndicator.className = 'offline-indicator';
        offlineIndicator.hidden = true;
        offlineIndicator.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>You are currently offline. Some features may be limited.</span>
        `;
        
        document.body.appendChild(offlineIndicator);
        
        this.offlineIndicator = offlineIndicator;
    }
    
    checkConnectivity() {
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }
    
    handleOnline() {
        if (this.offlineIndicator) {
            this.offlineIndicator.hidden = true;
        }
        
        // Show online notification
        this.showToast('Back online! Syncing updates...');
        
        // Sync any pending data
        this.syncData();
    }
    
    handleOffline() {
        if (this.offlineIndicator) {
            this.offlineIndicator.hidden = false;
        }
        
        // Show offline notification
        this.showToast('You are offline. Using cached data.');
    }
    
    saveForOffline() {
        if ('showSaveFilePicker' in window) {
            // Use File System Access API
            this.saveWithFileSystem();
        } else {
            // Fallback to blob download
            this.saveAsBlob();
        }
    }
    
    async saveWithFileSystem() {
        try {
            const options = {
                suggestedName: 'cruise-itinerary.html',
                types: [{
                    description: 'HTML File',
                    accept: {'text/html': ['.html']}
                }]
            };
            
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            const content = this.generateOfflineContent();
            
            await writable.write(content);
            await writable.close();
            
            this.showToast('Cruise itinerary saved successfully!');
        } catch (err) {
            console.error('Save failed:', err);
            this.showToast('Save failed. Please try again.');
        }
    }
    
    saveAsBlob() {
        const content = this.generateOfflineContent();
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cruise-itinerary.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showToast('Cruise itinerary downloaded!');
    }
    
    generateOfflineContent() {
        // Generate complete offline version
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cruise Companion - Offline Version</title>
                <style>
                    ${this.getCriticalCSS()}
                </style>
            </head>
            <body>
                ${document.querySelector('.container').outerHTML}
                <script>
                    // Basic offline functionality
                    document.addEventListener('DOMContentLoaded', function() {
                        // Add offline warning
                        const warning = document.createElement('div');
                        warning.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ffc107;padding:10px;text-align:center;z-index:1000;';
                        warning.textContent = '⚠️ Offline Version - Some features may be limited';
                        document.body.insertBefore(warning, document.body.firstChild);
                        
                        // Disable search
                        const searchBtn = document.querySelector('.header__search-btn');
                        if (searchBtn) searchBtn.style.display = 'none';
                    });
                <\/script>
            </body>
            </html>
        `;
    }
    
    getCriticalCSS() {
        // Extract critical CSS from stylesheets
        const styles = Array.from(document.styleSheets)
            .filter(sheet => !sheet.href || sheet.href.includes(window.location.origin))
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join(' ');
                } catch (e) {
                    return '';
                }
            })
            .join(' ');
        
        return styles;
    }
    
    loadSavedData() {
        // Load any saved user preferences
        try {
            const saved = localStorage.getItem('cruiseCompanionData');
            if (saved) {
                this.savedData = JSON.parse(saved);
                this.applyUserPreferences();
            }
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    }
    
    saveUserPreferences() {
        // Save user preferences to localStorage
        try {
            localStorage.setItem('cruiseCompanionData', JSON.stringify(this.savedData || {}));
        } catch (e) {
            console.error('Failed to save preferences:', e);
        }
    }
    
    setupPersonalization() {
        // Setup personalization features
        this.setupTravelerSelection();
        this.setupFavoriteItems();
    }
    
    setupTravelerSelection() {
        // Allow users to select which traveler's view to see
        const travelerSelect = document.createElement('select');
        travelerSelect.className = 'traveler-select';
        travelerSelect.innerHTML = `
            <option value="all">All Travelers</option>
            <option value="bill">Bill</option>
            <option value="melissa">Melissa</option>
            <!-- Add all travelers -->
        `;
        
        travelerSelect.addEventListener('change', (e) => {
            this.filterByTraveler(e.target.value);
        });
        
        // Add to sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.insertBefore(travelerSelect, sidebar.firstChild);
        }
    }
    
    filterByTraveler(traveler) {
        // Filter content based on selected traveler
        const allItems = document.querySelectorAll('[data-travelers]');
        
        allItems.forEach(item => {
            const travelers = item.getAttribute('data-travelers');
            if (traveler === 'all' || travelers.includes(traveler)) {
                item.hidden = false;
            } else {
                item.hidden = true;
            }
        });
    }
    
    setupFavoriteItems() {
        // Allow users to favorite items
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-favorite]')) {
                const button = e.target.closest('[data-favorite]');
                const itemId = button.getAttribute('data-item-id');
                this.toggleFavorite(itemId, button);
            }
        });
    }
    
    toggleFavorite(itemId, button) {
        if (!this.savedData.favorites) {
            this.savedData.favorites = [];
        }
        
        const index = this.savedData.favorites.indexOf(itemId);
        if (index === -1) {
            this.savedData.favorites.push(itemId);
            button.classList.add('favorited');
            button.setAttribute('aria-label', 'Remove from favorites');
        } else {
            this.savedData.favorites.splice(index, 1);
            button.classList.remove('favorited');
            button.setAttribute('aria-label', 'Add to favorites');
        }
        
        this.saveUserPreferences();
    }
    
    applyUserPreferences() {
        // Apply saved preferences
        if (this.savedData?.favorites) {
            this.savedData.favorites.forEach(itemId => {
                const button = document.querySelector(`[data-item-id="${itemId}"]`);
                if (button) {
                    button.classList.add('favorited');
                    button.setAttribute('aria-label', 'Remove from favorites');
                }
            });
        }
    }
    
    syncData() {
        // Sync any offline changes when back online
        console.log('Syncing data...');
        // Implement sync logic here
    }
    
    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth <= 768;
        
        // Adjust card layouts
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (isMobile) {
                card.classList.add('mobile-view');
            } else {
                card.classList.remove('mobile-view');
            }
        });
        
        // Adjust navigation
        const nav = document.getElementById('mainNav');
        if (nav && !isMobile) {
            nav.hidden = false;
        }
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.hidden = false;
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.hidden = true;
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        toast.hidden = false;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.hidden = true;
        }, 3000);
    }
    
    cleanup() {
        // Clean up observers and event listeners
        this.observers.forEach(observer => observer.disconnect());
        
        // Save current state
        this.saveUserPreferences();
    }
    
    applyFilter(filterValue, button) {
        // Apply filter to content
        const items = document.querySelectorAll('[data-category]');
        const activeClass = 'active';
        
        // Update button states
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove(activeClass);
        });
        button.classList.add(activeClass);
        
        // Filter items
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
                item.hidden = false;
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            } else {
                item.hidden = true;
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.cruiseCompanion = new CruiseCompanion();
    
    // Add error boundary
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
        window.cruiseCompanion?.showToast('An error occurred. Please refresh the page.');
    });
    
    // Add unhandled rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});

// Service Worker for offline support
if ('serviceWorker' in navigator) {
    // Additional service worker registration logic
    const swRegistration = navigator.serviceWorker.register('/sw.js');
    
    swRegistration.then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New update available
                    window.cruiseCompanion?.showToast('New update available! Refresh to update.');
                }
            });
        });
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CruiseCompanion;
}