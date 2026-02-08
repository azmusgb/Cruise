  // ============================================================================
         // CRUISE COMPANION APPLICATION - PRODUCTION READY
         // Version: 2.0.0
         // Date: 2026-01-15
         // ============================================================================
         
         'use strict';
         
         // ============================================================================
         // CONFIGURATION & CONSTANTS
         // ============================================================================
         
         const CONFIG = {
          // Application
          APP_NAME: 'Cruise Companion',
          APP_VERSION: '2.0.0',
          
          // Cruise Details
          CRUISE_DATE: '2026-02-14T14:00:00-05:00',
          CRUISE_DURATION: 6,
          SHIP_NAME: 'Adventure of the Seas',
          SAILING_NUMBER: '12345678',
          MUSTER_STATION: 'F6',
          EMBARKATION_TIME: '2:00 PM',
          
          // Ports
          PORTS: [
              { id: 'georgetown', name: 'George Town, Grand Cayman', day: 3, arrival: '11:00 AM', departure: '5:15 PM', latitude: 19.2866, longitude: -81.3744 },
              { id: 'falmouth', name: 'Falmouth, Jamaica', day: 4, arrival: '8:30 AM', departure: '4:30 PM', latitude: 18.4937, longitude: -77.6559 },
              { id: 'cococay', name: 'Perfect Day at CocoCay', day: 6, arrival: '7:30 AM', departure: '4:30 PM', latitude: 25.8186, longitude: -77.9520 }
          ],
          
          // Styling
          BREAKPOINTS: {
              MOBILE: 768,
              TABLET: 1024,
              DESKTOP: 1280
          },
          
          // Performance
          DEBOUNCE_DELAY: 300,
          TOAST_DURATION: 3000,
          LOADING_DELAY: 1000,
          
         // Offline Caching
         OFFLINE_CACHE_NAME: 'cruise_companion_offline_v1',
         SHARED_DECK_PLANS_MANIFEST: 'deck-plans/index.json',
         
         // Storage Keys
         STORAGE_KEYS: {
              PREFERENCES: 'cruise_preferences_v2',
              SEARCH_HISTORY: 'cruise_search_history_v2',
              COMPACT_MODE: 'cruise_compact_mode',
              CRITICAL_FILTER: 'cruise_critical_filter',
              HINT_DISMISSED: 'cruise_hint_dismissed',
              DECK_PLANS: 'cruise_deck_plans_v1',
              OFFLINE_READY: 'cruise_offline_ready_v1'
         },
          
          // API Endpoints (Placeholders for future expansion)
          API_ENDPOINTS: {
              WEATHER: 'https://api.example.com/weather',
              UPDATES: 'https://api.example.com/cruise-updates',
              SYNC: 'https://api.example.com/sync'
          }
         };
         
         // ============================================================================
         // ERROR HANDLER
         // ============================================================================
         
         class ErrorHandler {
          constructor() {
              this.errors = [];
              this.maxErrors = 50;
          }
          
          log(error, context = 'Unknown') {
              const errorObj = {
                  timestamp: new Date().toISOString(),
                  context: context,
                  message: error.message || String(error),
                  stack: error.stack,
                  userAgent: navigator.userAgent,
                  url: window.location.href
              };
              
              console.error(`[${context}]`, error);
              this.errors.push(errorObj);
              
              // Keep only recent errors
              if (this.errors.length > this.maxErrors) {
                  this.errors.shift();
              }
              
              // Send to analytics if available
              this.sendToAnalytics(errorObj);
              
              return errorObj;
          }
          
          sendToAnalytics(error) {
              // Google Analytics
              if (typeof gtag === 'function') {
                  gtag('event', 'exception', {
                      description: `${error.context}: ${error.message}`,
                      fatal: false
                  });
              }
              
              // Sentry.io (example)
              if (typeof Sentry !== 'undefined') {
                  Sentry.captureException(new Error(`${error.context}: ${error.message}`));
              }
          }
          
          getErrors() {
              return [...this.errors];
          }
          
          clearErrors() {
              this.errors = [];
          }
          
          showUserFriendlyError(message, duration = 5000) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-toast';
              errorDiv.innerHTML = `
                  <div class="error-content">
                      <i class="fas fa-exclamation-circle"></i>
                      <span>${message}</span>
                      <button class="error-close"><i class="fas fa-times"></i></button>
                  </div>
              `;
              
              document.body.appendChild(errorDiv);
              
              setTimeout(() => {
                  errorDiv.classList.add('show');
              }, 10);
              
              const closeBtn = errorDiv.querySelector('.error-close');
              closeBtn.addEventListener('click', () => {
                  errorDiv.classList.remove('show');
                  setTimeout(() => {
                      if (errorDiv.parentNode) {
                          errorDiv.parentNode.removeChild(errorDiv);
                      }
                  }, 300);
              });
              
              if (duration > 0) {
                  setTimeout(() => {
                      if (errorDiv.parentNode) {
                          errorDiv.classList.remove('show');
                          setTimeout(() => {
                              if (errorDiv.parentNode) {
                                  errorDiv.parentNode.removeChild(errorDiv);
                              }
                          }, 300);
                      }
                  }, duration);
              }
              
              return errorDiv;
          }
         }
         
         // ============================================================================
         // STORAGE MANAGER
         // ============================================================================
         
         class StorageManager {
          constructor() {
              this.errorHandler = new ErrorHandler();
              this.isAvailable = this.checkAvailability();
          }
          
          checkAvailability() {
              try {
                  const testKey = '__storage_test__';
                  localStorage.setItem(testKey, testKey);
                  localStorage.removeItem(testKey);
                  return true;
              } catch (e) {
                  this.errorHandler.log(e, 'StorageManager.checkAvailability');
                  return false;
              }
          }
          
          set(key, value) {
              if (!this.isAvailable) {
                  console.warn('LocalStorage is not available');
                  return false;
              }
              
              try {
                  const serialized = JSON.stringify(value);
                  localStorage.setItem(key, serialized);
                  return true;
              } catch (e) {
                  this.errorHandler.log(e, `StorageManager.set(${key})`);
                  return false;
              }
          }
          
          get(key, defaultValue = null) {
              if (!this.isAvailable) {
                  return defaultValue;
              }
              
              try {
                  const item = localStorage.getItem(key);
                  return item ? JSON.parse(item) : defaultValue;
              } catch (e) {
                  this.errorHandler.log(e, `StorageManager.get(${key})`);
                  return defaultValue;
              }
          }
          
          remove(key) {
              if (!this.isAvailable) return false;
              
              try {
                  localStorage.removeItem(key);
                  return true;
              } catch (e) {
                  this.errorHandler.log(e, `StorageManager.remove(${key})`);
                  return false;
              }
          }
          
          clear() {
              if (!this.isAvailable) return false;
              
              try {
                  localStorage.clear();
                  return true;
              } catch (e) {
                  this.errorHandler.log(e, 'StorageManager.clear');
                  return false;
              }
          }
          
          // Application-specific methods
          savePreferences(preferences) {
              return this.set(CONFIG.STORAGE_KEYS.PREFERENCES, preferences);
          }
          
          loadPreferences() {
              return this.get(CONFIG.STORAGE_KEYS.PREFERENCES, {
                  compactMode: false,
                  criticalFilter: false,
                  theme: 'light',
                  fontSize: 'medium',
                  notifications: true
              });
          }
          
          saveSearchHistory(history) {
              return this.set(CONFIG.STORAGE_KEYS.SEARCH_HISTORY, history);
          }
          
          loadSearchHistory() {
              return this.get(CONFIG.STORAGE_KEYS.SEARCH_HISTORY, []);
          }

          saveDeckPlans(plans) {
              return this.set(CONFIG.STORAGE_KEYS.DECK_PLANS, plans);
          }
          
          loadDeckPlans() {
              return this.get(CONFIG.STORAGE_KEYS.DECK_PLANS, []);
          }
          
          clearDeckPlans() {
              return this.remove(CONFIG.STORAGE_KEYS.DECK_PLANS);
          }
         }
         
         // ============================================================================
         // DEBOUNCE & THROTTLE UTILITIES
         // ============================================================================
         
         class PerformanceUtils {
          static debounce(func, wait, immediate = false) {
              let timeout;
              return function executedFunction(...args) {
                  const context = this;
                  const later = () => {
                      timeout = null;
                      if (!immediate) func.apply(context, args);
                  };
                  const callNow = immediate && !timeout;
                  clearTimeout(timeout);
                  timeout = setTimeout(later, wait);
                  if (callNow) func.apply(context, args);
              };
          }
          
          static throttle(func, limit) {
              let inThrottle;
              return function executedFunction(...args) {
                  const context = this;
                  if (!inThrottle) {
                      func.apply(context, args);
                      inThrottle = true;
                      setTimeout(() => inThrottle = false, limit);
                  }
              };
          }
          
          static async sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
          }
         }
         
         // ============================================================================
         // DOM UTILITIES
         // ============================================================================
         
         class DOMUtils {
          static createElement(tag, classes = [], attributes = {}, content = '') {
              const element = document.createElement(tag);
              
              if (classes.length > 0) {
                  element.classList.add(...classes);
              }
              
              Object.entries(attributes).forEach(([key, value]) => {
                  element.setAttribute(key, value);
              });
              
              if (typeof content === 'string') {
                  element.innerHTML = content;
              } else if (content instanceof Node) {
                  element.appendChild(content);
              } else if (Array.isArray(content)) {
                  content.forEach(child => {
                      if (child instanceof Node) {
                          element.appendChild(child);
                      }
                  });
              }
              
              return element;
          }
          
          static removeAllChildren(element) {
              while (element.firstChild) {
                  element.removeChild(element.firstChild);
              }
          }
          
          static isElementInViewport(el, offset = 0) {
              const rect = el.getBoundingClientRect();
              return (
                  rect.top >= 0 &&
                  rect.left >= 0 &&
                  rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
                  rect.right <= (window.innerWidth || document.documentElement.clientWidth)
              );
          }
          
          static scrollToElement(element, offset = 0, behavior = 'smooth') {
              const elementRect = element.getBoundingClientRect();
              const absoluteTop = window.pageYOffset + elementRect.top;
              window.scrollTo({
                  top: absoluteTop - offset,
                  behavior: behavior
              });
          }
          
          static addClassToAll(elements, className) {
              elements.forEach(el => el.classList.add(className));
          }
          
          static removeClassFromAll(elements, className) {
              elements.forEach(el => el.classList.remove(className));
          }
          
          static toggleClassOnAll(elements, className, force) {
              elements.forEach(el => el.classList.toggle(className, force));
          }
         }
         
         // ============================================================================
         // SEARCH MANAGER
         // ============================================================================
         
         class SearchManager {
          constructor() {
              this.index = [];
              this.history = [];
              this.maxHistory = 10;
              this.storage = new StorageManager();
              this.errorHandler = new ErrorHandler();
              this.currentQuery = '';
              this.isIndexing = false;
              
              this.loadHistory();
          }
          
          loadHistory() {
              this.history = this.storage.loadSearchHistory();
          }
          
          saveHistory() {
              this.storage.saveSearchHistory(this.history);
          }
          
          addToHistory(query) {
              if (!query || query.trim() === '') return;
              
              const trimmedQuery = query.trim();
              const existingIndex = this.history.findIndex(item => 
                  item.toLowerCase() === trimmedQuery.toLowerCase()
              );
              
              if (existingIndex > -1) {
                  this.history.splice(existingIndex, 1);
              }
              
              this.history.unshift(trimmedQuery);
              
              if (this.history.length > this.maxHistory) {
                  this.history = this.history.slice(0, this.maxHistory);
              }
              
              this.saveHistory();
          }
          
          clearHistory() {
              this.history = [];
              this.saveHistory();
              return true;
          }
          
          async buildIndex() {
              if (this.isIndexing) {
                  console.warn('Search index is already being built');
                  return;
              }
              
              this.isIndexing = true;
              
              try {
                  this.index = [];
                  
                  // Index sections
                  const sections = document.querySelectorAll('section[id]');
                  
                  for (const section of sections) {
                      await this.indexSection(section);
                  }
                  
                  // Index specific items
                  await this.indexSpecificItems();
                  
                  console.log(`Search index built with ${this.index.length} items`);
                  return this.index;
              } catch (error) {
                  this.errorHandler.log(error, 'SearchManager.buildIndex');
                  throw error;
              } finally {
                  this.isIndexing = false;
              }
          }
          
          async indexSection(section) {
              const id = section.id;
              const title = section.querySelector('h2, .card__title')?.textContent?.trim() || id;
              const content = section.textContent || '';
              
              // Extract keywords from data attributes or content
              const keywords = this.extractKeywords(section, content);
              
              // Determine priority
              const priority = this.determinePriority(id, section);
              
              this.index.push({
                  id: id,
                  type: 'section',
                  title: title,
                  content: content.substring(0, 1000),
                  keywords: keywords,
                  priority: priority,
                  critical: section.classList.contains('section--critical') || 
                           id.includes('operations') || 
                           id.includes('critical'),
                  element: section,
                  timestamp: Date.now()
              });
          }
          
          async indexSpecificItems() {
              const specificItems = [
                  {
                      id: 'countdown-timer',
                      type: 'feature',
                      title: 'Countdown Timer',
                      content: 'Days until cruise departure. Shows days, hours, and minutes remaining until embarkation.',
                      keywords: ['countdown', 'timer', 'departure', 'days', 'hours', 'minutes', 'embarkation'],
                      priority: 2,
                      critical: false,
                      category: 'Hero'
                  },
                  {
                      id: 'cococay-perfect-day',
                      type: 'port',
                      title: 'Perfect Day at CocoCay',
                      content: 'Thrill Waterpark, Oasis Lagoon, Daredevils Peak. Docked access, no tender needed.',
                      keywords: ['cococay', 'perfect day', 'waterpark', 'beach', 'thrill', 'oasis lagoon', 'daredevils peak'],
                      priority: 3,
                      critical: true,
                      category: 'Itinerary'
                  },
                  {
                      id: 'george-town-port',
                      type: 'port',
                      title: 'George Town, Grand Cayman',
                      content: 'Tender port for Seven Mile Beach and Stingray City. Plan for extra tender time.',
                      keywords: ['george town', 'grand cayman', 'stingray city', 'seven mile beach', 'tender', 'port'],
                      priority: 3,
                      critical: true,
                      category: 'Itinerary'
                  },
                  {
                      id: 'dunns-river-falls',
                      type: 'excursion',
                      title: 'Dunns River Falls',
                      content: 'Jamaica waterfall climb. Water shoes required. Combo with Blue Hole recommended.',
                      keywords: ['dunns', 'river', 'falls', 'jamaica', 'waterfall', 'climb', 'blue hole', 'excursion'],
                      priority: 3,
                      critical: true,
                      category: 'Itinerary'
                  },
                  {
                      id: 'dragons-breath-zipline',
                      type: 'excursion',
                      title: 'Dragons Breath Zipline',
                      content: 'Perfect Day at CocoCay zipline. Longest over water zipline. Morning slots recommended.',
                      keywords: ['dragon', 'breath', 'zipline', 'labadee', 'haiti', 'excursion', 'adventure'],
                      priority: 3,
                      critical: true,
                      category: 'Itinerary'
                  },
                  {
                      id: 'flowrider',
                      type: 'activity',
                      title: 'FlowRider Surf Simulator',
                      content: 'Surf simulator on Adventure of the Seas. Early morning has shortest lines.',
                      keywords: ['flowrider', 'surf', 'simulator', 'activity', 'pool deck', 'adventure'],
                      priority: 2,
                      critical: false,
                      category: 'Onboard Activities'
                  },
                  {
                      id: 'emuster-station-f6',
                      type: 'safety',
                      title: 'eMuster Station F6',
                      content: 'Safety briefing location on Deck 4. Must complete before 4:00 PM on embarkation day.',
                      keywords: ['emuster', 'safety', 'drill', 'station', 'f6', 'deck 4', 'mandatory', 'critical'],
                      priority: 4,
                      critical: true,
                      category: 'Safety'
                  },
                  {
                      id: 'royal-caribbean-app',
                      type: 'tool',
                      title: 'Royal Caribbean App',
                      content: 'Essential app for schedules, chat, and bookings. Download before boarding.',
                      keywords: ['royal', 'app', 'mobile', 'download', 'chat', 'schedule', 'booking', 'essential'],
                      priority: 3,
                      critical: true,
                      category: 'Tools'
                  },
                  {
                      id: 'wifi-connectivity',
                      type: 'service',
                      title: 'Wi-Fi & Connectivity',
                      content: 'VOOM Surf + Stream, Royal-WIFI, internet packages. Best signal on Deck 4 library.',
                      keywords: ['wifi', 'internet', 'connectivity', 'vroom', 'online', 'signal', 'package'],
                      priority: 2,
                      critical: false,
                      category: 'Services'
                  }
              ];
              
              this.index.push(...specificItems);
          }
          
          extractKeywords(element, content) {
              const keywords = new Set();
              
              // Extract from data-keywords attribute
              const dataKeywords = element.dataset.keywords;
              if (dataKeywords) {
                  dataKeywords.split(',').forEach(kw => {
                      keywords.add(kw.trim().toLowerCase());
                  });
              }
              
              // Extract common cruise terms from content
              const commonTerms = [
                  'boarding', 'embarkation', 'disembarkation', 'muster', 'safety',
                  'dining', 'restaurant', 'reservation', 'excursion', 'port',
                  'sea day', 'formal night', 'captain', 'deck', 'cabin', 'room',
                  'stateroom', 'balcony', 'suite', 'promenade', 'pool', 'spa',
                  'gym', 'fitness', 'show', 'entertainment', 'kids', 'teen',
                  'adult', 'family', 'couple', 'group', 'booking', 'check-in'
              ];
              
              const contentLower = content.toLowerCase();
              commonTerms.forEach(term => {
                  if (contentLower.includes(term)) {
                      keywords.add(term);
                  }
              });
              
              return Array.from(keywords);
          }
          
          determinePriority(id, element) {
              // Higher number = higher priority
              if (id.includes('critical') || id.includes('emergency') || id.includes('safety')) {
                  return 5;
              }
              if (id.includes('operations') || id.includes('checklist')) {
                  return 4;
              }
              if (id.includes('itinerary') || id.includes('schedule')) {
                  return 3;
              }
              if (element.classList.contains('section--critical')) {
                  return 4;
              }
              return 2; // Default priority
          }
          
          async search(query, options = {}) {
              if (!query || query.trim() === '') {
                  return {
                      query: '',
                      results: [],
                      count: 0,
                      suggestions: this.getSuggestions('')
                  };
              }
              
              const normalizedQuery = query.toLowerCase().trim();
              this.currentQuery = normalizedQuery;
              
              // Add to history if not a repeat
              if (this.history[0] !== query) {
                  this.addToHistory(query);
              }
              
              // Filter and score results
              const results = this.index
                  .map(item => ({
                      ...item,
                      score: this.calculateScore(item, normalizedQuery)
                  }))
                  .filter(item => item.score > 0)
                  .sort((a, b) => {
                      // Sort by score (descending), then priority (descending)
                      if (b.score !== a.score) {
                          return b.score - a.score;
                      }
                      if (b.priority !== a.priority) {
                          return b.priority - a.priority;
                      }
                      if (a.critical && !b.critical) return -1;
                      if (!a.critical && b.critical) return 1;
                      return 0;
                  })
                  .slice(0, options.maxResults || 20);
              
              return {
                  query: query,
                  results: results,
                  count: results.length,
                  suggestions: this.getSuggestions(normalizedQuery),
                  timestamp: Date.now()
              };
          }
          
          calculateScore(item, query) {
              let score = 0;
              
              // Title match (highest weight)
              if (item.title.toLowerCase().includes(query)) {
                  score += 10;
                  
                  // Exact title match
                  if (item.title.toLowerCase() === query) {
                      score += 5;
                  }
              }
              
              // Content match
              if (item.content.toLowerCase().includes(query)) {
                  score += 5;
              }
              
              // Keyword matches
              if (item.keywords && item.keywords.some(kw => kw.includes(query))) {
                  score += 3;
              }
              
              // Priority boost
              score += item.priority;
              
              // Critical boost
              if (item.critical) {
                  score += 2;
              }
              
              // Recency boost (if applicable)
              if (item.timestamp) {
                  const age = Date.now() - item.timestamp;
                  const daysOld = age / (1000 * 60 * 60 * 24);
                  if (daysOld < 7) {
                      score += 1;
                  }
              }
              
              return score;
          }
          
          getSuggestions(query) {
              if (!query || query.length < 2) {
                  return this.getPopularSearches();
              }
              
              const suggestions = new Set();
              
              // Find matching items in index
              this.index.forEach(item => {
                  if (item.title.toLowerCase().includes(query)) {
                      suggestions.add(item.title);
                  }
                  
                  if (item.keywords) {
                      item.keywords.forEach(kw => {
                          if (kw.includes(query)) {
                              suggestions.add(kw);
                          }
                      });
                  }
              });
              
              // Add from history
              this.history.forEach(historyItem => {
                  if (historyItem.toLowerCase().includes(query)) {
                      suggestions.add(historyItem);
                  }
              });
              
              // Add common suggestions
              const common = [
                  'What time do I board?',
                  'Where is my room?',
                  'eMuster Station F6',
                  'Dining reservations',
                  'Shore excursions',
                  'Wi-Fi package',
                  'Formal night schedule',
                  'Kids activities',
                  'Drink package',
                  'Port shopping'
              ];
              
              common.forEach(item => {
                  if (item.toLowerCase().includes(query)) {
                      suggestions.add(item);
                  }
              });
              
              return Array.from(suggestions).slice(0, 8);
          }
          
          getPopularSearches() {
              return [
                  'eMuster Station F6',
                  'George Town, Grand Cayman',
                  'Perfect Day at CocoCay',
                  'Dunns River Falls',
                  'Formal night',
                  'Wi-Fi package',
                  'Dining reservations',
                  'What to pack'
              ];
          }
          
         highlightText(text, query) {
         if (!query || !text) return text;
         
         // Escape HTML in both text and query first
         const escapedText = this.escapeHtml(text);
         const escapedQuery = this.escapeRegExp(this.escapeHtml(query));
         
         const regex = new RegExp(`(${escapedQuery})`, 'gi');
         return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
         }
         
         escapeHtml(text) {
         const div = document.createElement('div');
         div.textContent = text;
         return div.innerHTML;
         }
          
          escapeRegExp(string) {
              return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          }
          
          getIndexStats() {
              return {
                  totalItems: this.index.length,
                  sections: this.index.filter(item => item.type === 'section').length,
                  features: this.index.filter(item => item.type === 'feature').length,
                  excursions: this.index.filter(item => item.type === 'excursion').length,
                  criticalItems: this.index.filter(item => item.critical).length,
                  lastIndexed: this.index.length > 0 ? 
                      new Date(Math.max(...this.index.map(i => i.timestamp || 0))) : null
              };
          }
         }
         
         // ============================================================================
         // NAVIGATION MANAGER
         // ============================================================================
         
         class NavigationManager {
          constructor() {
              this.currentSection = document.querySelector('section[id]')?.id || null;
              this.currentDay = 'all';
              this.currentTravelerView = 'all';
              this.previousSection = null;
              this.sectionHistory = [];
              this.maxHistory = 10;
              this.observers = new Set();
              this.errorHandler = new ErrorHandler();
              this.isNavigating = false;
              
              this.availableSections = this.detectAvailableSections();
              this.availableDays = this.detectAvailableDays();
              this.availableTravelerViews = ['all', 'family', 'adults', 'kids'];
          }
          
          detectAvailableSections() {
              const sections = document.querySelectorAll('section[id]');
              return Array.from(sections).map(section => section.id);
          }
          
          detectAvailableDays() {
              const dayButtons = document.querySelectorAll('.nav-day-btn[data-day], .day-btn[data-day]');
              return Array.from(dayButtons).map(btn => btn.dataset.day);
          }
          
          async navigateToSection(sectionId, options = {}) {
              if (this.isNavigating) {
                  console.warn('Navigation already in progress');
                  return false;
              }
              
              if (!this.availableSections.includes(sectionId)) {
                  this.errorHandler.log(new Error(`Invalid section: ${sectionId}`), 'NavigationManager.navigateToSection');
                  return false;
              }
              
              this.isNavigating = true;
              
              try {
                  // Store previous section
                  if (this.currentSection && options.addToHistory !== false) {
                      this.previousSection = this.currentSection;
                      this.sectionHistory.push({
                          section: this.currentSection,
                          timestamp: Date.now(),
                          scrollY: window.scrollY
                      });
                      
                      // Trim history if needed
                      if (this.sectionHistory.length > this.maxHistory) {
                          this.sectionHistory.shift();
                      }
                  }
                  
                  // Update current section
                  this.currentSection = sectionId;
                  
                  // Update UI
                  this.updateSectionVisibility(sectionId);
                  this.updateNavigationHighlights(sectionId);
                  this.updateURLHash(sectionId);
                  
                  // Scroll to section
                  if (options.scroll !== false) {
                      await this.scrollToSection(sectionId, options.scrollOptions);
                  }
                  
                  // Notify observers
                  this.notifyObservers({
                      type: 'sectionChange',
                      section: sectionId,
                      previous: this.previousSection,
                      timestamp: Date.now()
                  });
                  
                  return true;
              } catch (error) {
                  this.errorHandler.log(error, 'NavigationManager.navigateToSection');
                  return false;
              } finally {
                  this.isNavigating = false;
              }
          }
          
          updateSectionVisibility(sectionId) {
              document.querySelectorAll('section[id]').forEach(section => {
                  const isActive = section.id === sectionId;
                  
                  if (isActive) {
                      section.removeAttribute('hidden');
                      section.setAttribute('aria-hidden', 'false');
                      section.classList.add('active');
                  } else {
                      section.setAttribute('hidden', 'true');
                      section.setAttribute('aria-hidden', 'true');
                      section.classList.remove('active');
                  }
              });
              
              const currentSection = document.getElementById(sectionId);
              if (currentSection) {
                  this.expandSectionCard(currentSection);
                  
                  // If it's itinerary, apply day filter
                  if (sectionId === 'itinerary') {
                      this.applyDayFilter(this.currentDay);
                  }
              }
          }
          
          expandSectionCard(section) {
              const toggle = section.querySelector('.card__toggle');
              const content = section.querySelector('.card__content');
              
              if (!toggle || !content) return;
              
              toggle.setAttribute('aria-expanded', 'true');
              content.classList.remove('collapsed');
              content.classList.add('expanded');
              content.setAttribute('aria-hidden', 'false');
              content.style.maxHeight = 'none';
          }
          
          updateNavigationHighlights(sectionId) {
              // Update all navigation elements
              const navSelectors = [
                  '.nav-primary-link',
                  '.nav-mobile-link',
                  '.nav-bottom-item',
                  '.nav-link',
                  '.sidebar-link',
                  '.drawer-nav-item',
                  '.bottom-nav .nav-item[data-section]',
                  '.quick-start__link'
              ];
              
              navSelectors.forEach(selector => {
                  document.querySelectorAll(selector).forEach(element => {
                      const isActive = element.dataset.section === sectionId;
                      element.classList.toggle('active', isActive);
                      element.setAttribute('aria-current', isActive ? 'page' : 'false');
                      
                      if (element.tagName === 'BUTTON') {
                          element.setAttribute('aria-pressed', isActive.toString());
                      }
                  });
              });
          }
          
          updateURLHash(sectionId) {
              const newHash = `#${sectionId}`;
              if (window.location.hash !== newHash) {
                  history.replaceState(null, '', newHash);
              }
          }
          
          async scrollToSection(sectionId, options = {}) {
         const section = document.getElementById(sectionId);
         if (!section) return false;
         
         const defaultOptions = {
         behavior: 'smooth',
         offset: this.calculateScrollOffset()
         };
         
         const { behavior, offset } = { ...defaultOptions, ...options };
         
         try {
         // Compute absolute scroll target with offset
         const rect = section.getBoundingClientRect();
         const targetTop = window.pageYOffset + rect.top - offset;
         
         // Perform scroll
         window.scrollTo({
         top: targetTop,
         behavior
         });
         
         // Wait for scroll to settle
         await new Promise(resolve => {
         let lastY = null;
         let stableFrames = 0;
         
         const checkScroll = () => {
         const currentY = window.pageYOffset;
         
         if (lastY !== null && Math.abs(currentY - lastY) < 1) {
          stableFrames++;
          if (stableFrames >= 3) {
            resolve();
            return;
          }
         } else {
          stableFrames = 0;
         }
         
         lastY = currentY;
         requestAnimationFrame(checkScroll);
         };
         
         requestAnimationFrame(checkScroll);
         });
         
         return true;
         } catch (error) {
         this.errorHandler.log(error, 'NavigationManager.scrollToSection');
         return false;
         }
         }
          
          calculateScrollOffset() {
         const elements = [
         document.querySelector('.nav-container'),
         document.getElementById('topBarHint')
         ];
         
         let offset = 0;
         
         for (const el of elements) {
         if (!el) continue;
         
         const style = window.getComputedStyle(el);
         const isVisible =
         style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         el.getBoundingClientRect().height > 0 &&
         !el.hasAttribute('aria-hidden');
         
         if (isVisible) {
         offset += el.getBoundingClientRect().height;
         }
         }
         
         // Add breathing room only when there is chrome to clear
         return offset > 0 ? offset + 16 : 0;
         }
          
          setCurrentDay(day) {
              if (!this.availableDays.includes(day)) {
                  console.warn(`Invalid day: ${day}`);
                  return false;
              }
              
              this.currentDay = day;
              
              // Update day buttons
              document.querySelectorAll('.nav-day-btn, .day-btn').forEach(btn => {
                  const isActive = btn.dataset.day === day;
                  btn.classList.toggle('active', isActive);
                  btn.setAttribute('aria-pressed', isActive.toString());
              });
              
              // Apply filter if on itinerary
              if (this.currentSection === 'itinerary') {
                  this.applyDayFilter(day);
              }
              
              // Notify observers
              this.notifyObservers({
                  type: 'dayChange',
                  day: day,
                  timestamp: Date.now()
              });
              
              return true;
          }
          
          applyDayFilter(day) {
              const timelineItems = document.querySelectorAll('.timeline-item');
              
              timelineItems.forEach(item => {
                  const itemDay = item.dataset.day;
                  const shouldShow = day === 'all' || itemDay === day;
                  
                  item.style.display = shouldShow ? 'block' : 'none';
                  
                  if (shouldShow) {
                      item.removeAttribute('aria-hidden');
                  } else {
                      item.setAttribute('aria-hidden', 'true');
                  }
              });
          }
          
          setTravelerView(view) {
              if (!this.availableTravelerViews.includes(view)) {
                  console.warn(`Invalid traveler view: ${view}`);
                  return false;
              }
              
              this.currentTravelerView = view;
              
              // Update traveler selector
              const travelerSelect = document.getElementById('travelerSelect');
              if (travelerSelect) {
                  travelerSelect.value = view;
              }
              
              // Apply view filter
              this.applyTravelerViewFilter(view);
              
              // Notify observers
              this.notifyObservers({
                  type: 'travelerViewChange',
                  view: view,
                  timestamp: Date.now()
              });
              
              return true;
          }
          
          applyTravelerViewFilter(view) {
              // This is a simplified filter - in production you would
              // have data attributes on elements to filter by
              const elementsToFilter = document.querySelectorAll('[data-traveler-view]');
              
              elementsToFilter.forEach(element => {
                  const elementViews = element.dataset.travelerView.split(' ');
                  const shouldShow = view === 'all' || elementViews.includes(view);
                  
                  element.classList.toggle('hidden', !shouldShow);
                  element.setAttribute('aria-hidden', (!shouldShow).toString());
              });
          }
          
          goBack() {
              if (this.sectionHistory.length === 0) {
                  return false;
              }
              
              const previous = this.sectionHistory.pop();
              if (previous && previous.section) {
                  return this.navigateToSection(previous.section, {
                      scrollOptions: {
                          behavior: 'auto',
                          block: 'start'
                      }
                  });
              }
              
              return false;
          }
          
          addObserver(observer) {
              this.observers.add(observer);
          }
          
          removeObserver(observer) {
              this.observers.delete(observer);
          }
          
          notifyObservers(data) {
              this.observers.forEach(observer => {
                  try {
                      if (typeof observer === 'function') {
                          observer(data);
                      } else if (observer && typeof observer.update === 'function') {
                          observer.update(data);
                      }
                  } catch (error) {
                      this.errorHandler.log(error, 'NavigationManager.notifyObservers');
                  }
              });
          }
          
          getNavigationState() {
              return {
                  currentSection: this.currentSection,
                  currentDay: this.currentDay,
                  currentTravelerView: this.currentTravelerView,
                  previousSection: this.previousSection,
                  historyLength: this.sectionHistory.length,
                  availableSections: [...this.availableSections],
                  availableDays: [...this.availableDays]
              };
          }
         }
         
         // ============================================================================
         // UI COMPONENTS MANAGER
         // ============================================================================
         
         class UIComponentsManager {
          constructor() {
              this.errorHandler = new ErrorHandler();
              this.components = new Map();
              this.initialized = false;
          }
          
          async initialize() {
              if (this.initialized) return true;
              
              try {
                  await this.initializeAccordions();
                  await this.initializeModals();
                  await this.initializeToasts();
                  await this.initializeTabs();
                  await this.initializeTooltips();
                  
                  this.initialized = true;
                  return true;
              } catch (error) {
                  this.errorHandler.log(error, 'UIComponentsManager.initialize');
                  return false;
              }
          }
          
          async initializeAccordions() {
              const accordions = document.querySelectorAll('[data-accordion]');
              
              accordions.forEach(accordion => {
                  const toggle = accordion.querySelector('[data-accordion-toggle]');
                  const content = accordion.querySelector('[data-accordion-content]');
                  
                  if (!toggle || !content) return;
                  
                  const isExpanded = accordion.dataset.expanded === 'true';
                  
                  // Set initial state
                  toggle.setAttribute('aria-expanded', isExpanded.toString());
                  content.setAttribute('aria-hidden', (!isExpanded).toString());
                  
                  if (isExpanded) {
                      content.classList.add('expanded');
                      content.classList.remove('collapsed');
                      content.style.maxHeight = content.scrollHeight + 'px';
                  } else {
                      content.classList.add('collapsed');
                      content.classList.remove('expanded');
                      content.style.maxHeight = '0';
                  }
                  
                  // Add click handler
                  toggle.addEventListener('click', () => {
                      this.toggleAccordion(accordion);
                  });
                  
                  // Add keyboard support
                  toggle.addEventListener('keydown', (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          this.toggleAccordion(accordion);
                      }
                  });
                  
                  this.components.set(`accordion-${accordion.id || Date.now()}`, {
                      type: 'accordion',
                      element: accordion,
                      toggle: toggle,
                      content: content
                  });
              });
          }
          
          toggleAccordion(accordion) {
              const component = this.components.get(`accordion-${accordion.id}`);
              if (!component) return;
              
              const isExpanded = component.toggle.getAttribute('aria-expanded') === 'true';
              const newState = !isExpanded;
              
              // Update toggle
              component.toggle.setAttribute('aria-expanded', newState.toString());
              
              // Update content
              component.content.setAttribute('aria-hidden', (!newState).toString());
              
              if (newState) {
                  // Expand
                  component.content.classList.remove('collapsed');
                  component.content.classList.add('expanded');
                  component.content.style.maxHeight = component.content.scrollHeight + 'px';
                  
                  // After transition, set to auto
                  setTimeout(() => {
                      if (component.content.classList.contains('expanded')) {
                          component.content.style.maxHeight = 'none';
                      }
                  }, 300);
              } else {
                  // Collapse
                  component.content.classList.remove('expanded');
                  component.content.classList.add('collapsed');
                  component.content.style.maxHeight = component.content.scrollHeight + 'px';
                  
                  // Trigger reflow
                  component.content.offsetHeight;
                  
                  // Animate collapse
                  component.content.style.maxHeight = '0';
              }
          }
          
         async initializeModals() {
         const modals = document.querySelectorAll('[data-modal]');
         
         modals.forEach(modal => {
         if (!modal.id) return;
         
         const openButtons = document.querySelectorAll(
         `[data-modal-open="${modal.id}"]`
         );
         const closeButtons = modal.querySelectorAll('[data-modal-close]');
         const overlay = modal.querySelector('[data-modal-overlay]');
         
         // Initial state
         modal.setAttribute('aria-hidden', 'true');
         modal.removeAttribute('aria-modal');
         
         // Prevent double-binding
         if (modal.dataset.initialized) return;
         modal.dataset.initialized = 'true';
         
         // Open handlers
         openButtons.forEach(button => {
         button.addEventListener('click', () => {
         this.openModal(modal.id, button);
         });
         });
         
         // Close handlers
         closeButtons.forEach(button => {
         button.addEventListener('click', () => {
         this.closeModal(modal.id);
         });
         });
         
         // Overlay click (only if actual overlay)
         if (overlay) {
         overlay.addEventListener('click', e => {
         if (e.target === overlay) {
          this.closeModal(modal.id);
         }
         });
         }
         
         // Global Escape handling (reliable)
         document.addEventListener('keydown', e => {
         if (
         e.key === 'Escape' &&
         modal.getAttribute('aria-hidden') === 'false'
         ) {
         this.closeModal(modal.id);
         }
         });
         
         this.components.set(`modal-${modal.id}`, {
         type: 'modal',
         element: modal,
         openButtons,
         closeButtons,
         overlay
         });
         });
         }
         openModal(modalId, opener = null) {
         const modal = document.getElementById(modalId);
         if (!modal) return false;
         
         // Store opener for correct focus restore
         modal.__opener = opener || document.activeElement;
         
         // ARIA state
         modal.setAttribute('aria-hidden', 'false');
         modal.setAttribute('aria-modal', 'true');
         modal.classList.add('active');
         
         // Lock scroll (iOS-safe)
         this._scrollY = window.scrollY;
         document.body.style.position = 'fixed';
         document.body.style.top = `-${this._scrollY}px`;
         document.body.style.width = '100%';
         
         // Trap focus once
         this.trapFocus(modal);
         
         // Move focus inside modal
         const focusTarget =
         modal.querySelector('[autofocus]') ||
         modal.querySelector(
         'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
         );
         
         focusTarget?.focus();
         
         this.announceToScreenReader('Modal opened');
         return true;
         }
         
         closeModal(modalId) {
         const modal = document.getElementById(modalId);
         if (!modal) return false;
         
         // ARIA state
         modal.setAttribute('aria-hidden', 'true');
         modal.removeAttribute('aria-modal');
         modal.classList.remove('active');
         
         // Restore scroll
         document.body.style.position = '';
         document.body.style.top = '';
         document.body.style.width = '';
         window.scrollTo(0, this._scrollY || 0);
         
         // Restore focus
         modal.__opener?.focus?.();
         delete modal.__opener;
         
         this.announceToScreenReader('Modal closed');
         return true;
         }
         
         trapFocus(element) {
         if (element.__focusTrapAttached) return;
         element.__focusTrapAttached = true;
         
         const focusableSelector =
         'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
         
         element.addEventListener('keydown', e => {
         if (e.key !== 'Tab') return;
         
         const focusables = Array.from(
         element.querySelectorAll(focusableSelector)
         ).filter(el => !el.disabled && el.offsetParent !== null);
         
         if (focusables.length === 0) return;
         
         const first = focusables[0];
         const last = focusables[focusables.length - 1];
         
         if (e.shiftKey && document.activeElement === first) {
         e.preventDefault();
         last.focus();
         } else if (!e.shiftKey && document.activeElement === last) {
         e.preventDefault();
         first.focus();
         }
         });
         }
          
         async initializeToasts() {
         let toastContainer = document.getElementById('toast-container');
         if (!toastContainer) {
         toastContainer = DOMUtils.createElement('div', ['toast-container'], {
         id: 'toast-container',
         'aria-live': 'polite',
         'aria-atomic': 'true'
         });
         document.body.appendChild(toastContainer);
         }
         
         this.components.set('toast-container', {
         type: 'toast-container',
         element: toastContainer
         });
         }
          
         showToast(message, options = {}) {
         const container = this.components.get('toast-container')?.element;
         if (!container) return null;
         
         const toastId = `toast-${crypto.randomUUID?.() || Date.now() + Math.random()}`;
         
         const {
         type = 'info',
         duration = CONFIG.TOAST_DURATION,
         icon = this.getToastIcon(type),
         action = null,
         position = 'bottom-center'
         } = options;
         
         const toast = DOMUtils.createElement(
         'div',
         ['toast', `toast-${type}`, `toast-${position}`],
         {
         id: toastId,
         role: 'status',
         'aria-atomic': 'true'
         },
         `
         <div class="toast-content">
         <div class="toast-icon">${icon}</div>
         <div class="toast-message">${message}</div>
         ${action ? `<button class="toast-action">${action.label}</button>` : ''}
         <button class="toast-close" aria-label="Close notification">
          <i class="fas fa-times"></i>
         </button>
         </div>
         `
         );
         
         container.appendChild(toast);
         
         requestAnimationFrame(() => {
         toast.classList.add('show');
         });
         
         const hide = () => this.hideToast(toastId);
         
         toast.querySelector('.toast-close')?.addEventListener('click', hide);
         
         if (action) {
         toast.querySelector('.toast-action')?.addEventListener('click', () => {
         action.callback?.();
         hide();
         });
         }
         
         const timeoutId =
         duration > 0 ? setTimeout(hide, duration) : null;
         
         this.components.set(toastId, {
         type: 'toast',
         element: toast,
         timeoutId
         });
         
         return toastId;
         }
          
          hideToast(toastId) {
              const component = this.components.get(toastId);
              if (!component) return false;
              
              // Clear timeout if exists
              if (component.timeoutId) {
                  clearTimeout(component.timeoutId);
              }
              
              // Animate out
              component.element.classList.remove('show');
              
              // Remove from DOM after animation
              setTimeout(() => {
                  if (component.element.parentNode) {
                      component.element.parentNode.removeChild(component.element);
                  }
                  this.components.delete(toastId);
              }, 300);
              
              return true;
          }
          
          getToastIcon(type) {
              const icons = {
                  info: '<i class="fas fa-info-circle"></i>',
                  success: '<i class="fas fa-check-circle"></i>',
                  warning: '<i class="fas fa-exclamation-triangle"></i>',
                  error: '<i class="fas fa-exclamation-circle"></i>'
              };
              return icons[type] || icons.info;
          }
          
          async initializeTabs() {
              const tabContainers = document.querySelectorAll('[data-tabs]');
              
              tabContainers.forEach(container => {
                  const tabList = container.querySelector('[role="tablist"]');
                  const tabs = container.querySelectorAll('[role="tab"]');
                  const tabPanels = container.querySelectorAll('[role="tabpanel"]');
                  
                  if (!tabList || tabs.length === 0 || tabPanels.length === 0) return;
                  
                  // Set initial state
                  tabs.forEach((tab, index) => {
                      const isSelected = index === 0;
                      tab.setAttribute('aria-selected', isSelected.toString());
                      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
                      
                      if (isSelected) {
                          tab.classList.add('active');
                      }
                      
                      // Add click handler
                      tab.addEventListener('click', () => {
                          this.activateTab(tab, container);
                      });
                      
                      // Add keyboard navigation
                      tab.addEventListener('keydown', (e) => {
                          this.handleTabKeydown(e, tab, tabs, container);
                      });
                  });
                  
                  // Set initial tabpanel state
                  tabPanels.forEach((panel, index) => {
                      const isSelected = index === 0;
                      panel.setAttribute('aria-hidden', (!isSelected).toString());
                      
                      if (isSelected) {
                          panel.classList.add('active');
                      } else {
                          panel.classList.add('hidden');
                      }
                  });
                  
                  this.components.set(`tabs-${container.id || Date.now()}`, {
                      type: 'tabs',
                      element: container,
                      tabList: tabList,
                      tabs: tabs,
                      tabPanels: tabPanels
                  });
              });
          }
          
          activateTab(selectedTab, container) {
              const component = this.components.get(`tabs-${container.id}`);
              if (!component) return;
              
              // Update all tabs
              component.tabs.forEach(tab => {
                  const isSelected = tab === selectedTab;
                  tab.setAttribute('aria-selected', isSelected.toString());
                  tab.setAttribute('tabindex', isSelected ? '0' : '-1');
                  tab.classList.toggle('active', isSelected);
                  
                  if (isSelected) {
                      tab.focus();
                  }
              });
              
              // Update all tabpanels
              component.tabPanels.forEach(panel => {
                  const controls = selectedTab.getAttribute('aria-controls');
                  const isSelected = panel.id === controls;
                  
                  panel.setAttribute('aria-hidden', (!isSelected).toString());
                  panel.classList.toggle('active', isSelected);
                  panel.classList.toggle('hidden', !isSelected);
              });
          }
          
          handleTabKeydown(event, currentTab, tabs, container) {
              let nextTab = null;
              
              switch (event.key) {
                  case 'ArrowLeft':
                  case 'ArrowUp':
                      event.preventDefault();
                      nextTab = currentTab.previousElementSibling || tabs[tabs.length - 1];
                      break;
                      
                  case 'ArrowRight':
                  case 'ArrowDown':
                      event.preventDefault();
                      nextTab = currentTab.nextElementSibling || tabs[0];
                      break;
                      
                  case 'Home':
                      event.preventDefault();
                      nextTab = tabs[0];
                      break;
                      
                  case 'End':
                      event.preventDefault();
                      nextTab = tabs[tabs.length - 1];
                      break;
              }
              
              if (nextTab) {
                  this.activateTab(nextTab, container);
              }
          }
          
          async initializeTooltips() {
              const tooltipElements = document.querySelectorAll('[data-tooltip]');
              
              tooltipElements.forEach(element => {
                  const tooltipText = element.dataset.tooltip;
                  
                  // Create tooltip element
                  const tooltip = DOMUtils.createElement('div', ['tooltip'], {
                      role: 'tooltip',
                      id: `tooltip-${element.id || Date.now()}`
                  }, tooltipText);
                  
                  // Position tooltip
                  const updatePosition = () => {
                      const rect = element.getBoundingClientRect();
                      const tooltipRect = tooltip.getBoundingClientRect();
                      
                      // Default position: bottom center
                      let top = rect.bottom + 8;
                      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                      
                      // Adjust if out of viewport
                      if (top + tooltipRect.height > window.innerHeight) {
                          top = rect.top - tooltipRect.height - 8;
                      }
                      
                      if (left < 0) {
                          left = 8;
                      } else if (left + tooltipRect.width > window.innerWidth) {
                          left = window.innerWidth - tooltipRect.width - 8;
                      }
                      
                      tooltip.style.top = `${top}px`;
                      tooltip.style.left = `${left}px`;
                  };
                  
                  // Show tooltip
                  const showTooltip = () => {
                      if (!tooltip.parentNode) {
                          document.body.appendChild(tooltip);
                      }
                      
                      tooltip.classList.remove('hidden');
                      updatePosition();
                      
                      // Update position on resize
                      window.addEventListener('resize', updatePosition);
                  };
                  
                  // Hide tooltip
                  const hideTooltip = () => {
                      tooltip.classList.add('hidden');
                      window.removeEventListener('resize', updatePosition);
                      
                      // Remove from DOM after animation
                      setTimeout(() => {
                          if (tooltip.parentNode) {
                              tooltip.parentNode.removeChild(tooltip);
                          }
                      }, 300);
                  };
                  
                  // Add event listeners
                  element.addEventListener('mouseenter', showTooltip);
                  element.addEventListener('focus', showTooltip);
                  element.addEventListener('mouseleave', hideTooltip);
                  element.addEventListener('blur', hideTooltip);
                  
                  // Store reference
                  this.components.set(`tooltip-${element.id}`, {
                      type: 'tooltip',
                      element: tooltip,
                      target: element
                  });
              });
          }
          
          announceToScreenReader(message, priority = 'polite') {
              const announcement = DOMUtils.createElement('div', ['sr-announcement'], {
                  'aria-live': priority,
                  'aria-atomic': 'true'
              }, message);
              
              // Add to DOM
              document.body.appendChild(announcement);
              
              // Remove after announcement
              setTimeout(() => {
                  if (announcement.parentNode) {
                      announcement.parentNode.removeChild(announcement);
                  }
              }, 1000);
          }
          
          getComponent(id) {
              return this.components.get(id);
          }
          
          getAllComponents() {
              return Array.from(this.components.values());
          }
          
          destroyComponent(id) {
              const component = this.components.get(id);
              if (!component) return false;
              
              // Clean up based on component type
              switch (component.type) {
                  case 'modal':
                      this.closeModal(component.element.id);
                      break;
                  case 'toast':
                      this.hideToast(id);
                      break;
                  case 'tooltip':
                      if (component.element.parentNode) {
                          component.element.parentNode.removeChild(component.element);
                      }
                      break;
              }
              
              this.components.delete(id);
              return true;
          }
          
          destroyAllComponents() {
              const componentIds = Array.from(this.components.keys());
              componentIds.forEach(id => this.destroyComponent(id));
              this.components.clear();
          }
         }
         
         // ============================================================================
         // COUNTDOWN MANAGER
         // ============================================================================
         
         class CountdownManager {
          constructor(targetDate) {
              this.targetDate = new Date(targetDate);
              this.intervalId = null;
              this.isRunning = false;
              this.errorHandler = new ErrorHandler();
              this.observers = new Set();
              this.lastUpdate = null;
              
              // DOM elements
              this.daysElement = document.getElementById('days');
              this.hoursElement = document.getElementById('hours');
              this.minutesElement = document.getElementById('minutes');
              this.secondsElement = document.getElementById('seconds');
              
              // Check if date is valid
              if (isNaN(this.targetDate.getTime())) {
                  throw new Error('Invalid target date');
              }
          }
          
          start() {
              if (this.isRunning) {
                  console.warn('Countdown is already running');
                  return false;
              }
              
              this.isRunning = true;
              
              // Initial update
              this.update();
              
              // Start interval
              this.intervalId = setInterval(() => {
                  this.update();
              }, 1000);
              
              this.notifyObservers({
                  type: 'countdownStarted',
                  timestamp: Date.now()
              });
              
              return true;
          }
          
          stop() {
              if (!this.isRunning) return false;
              
              this.isRunning = false;
              
              if (this.intervalId) {
                  clearInterval(this.intervalId);
                  this.intervalId = null;
              }
              
              this.notifyObservers({
                  type: 'countdownStopped',
                  timestamp: Date.now()
              });
              
              return true;
          }
          
          update() {
              const now = new Date();
              const timeRemaining = this.targetDate - now;
              
              if (timeRemaining <= 0) {
                  this.handleCountdownComplete();
                  return;
              }
              
              // Calculate time units
              const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
              
              // Update DOM with animation
              this.updateElementWithAnimation(this.daysElement, days, 'days');
              this.updateElementWithAnimation(this.hoursElement, hours, 'hours');
              this.updateElementWithAnimation(this.minutesElement, minutes, 'minutes');
              
              if (this.secondsElement) {
                  this.updateElementWithAnimation(this.secondsElement, seconds, 'seconds');
              }
              
              // Store last update
              this.lastUpdate = {
                  timestamp: now,
                  days: days,
                  hours: hours,
                  minutes: minutes,
                  seconds: seconds,
                  totalSeconds: Math.floor(timeRemaining / 1000)
              };
              
              // Notify observers
              this.notifyObservers({
                  type: 'countdownUpdated',
                  data: this.lastUpdate,
                  timestamp: Date.now()
              });
          }
          
          updateElementWithAnimation(element, newValue, unit) {
              if (!element) return;
              
              const oldValue = parseInt(element.textContent) || 0;
              
              if (oldValue !== newValue) {
                  // Add animation class
                  element.classList.add('countdown-changing');
                  
                  // Update value
                  element.textContent = newValue.toString().padStart(2, '0');
                  element.setAttribute('aria-label', `${newValue} ${unit} remaining`);
                  
                  // Remove animation class after animation completes
                  setTimeout(() => {
                      element.classList.remove('countdown-changing');
                  }, 300);
              } else {
                  // Just update aria-label
                  element.setAttribute('aria-label', `${newValue} ${unit} remaining`);
              }
          }
          
          handleCountdownComplete() {
              this.stop();
              
              // Update display to show completion
              if (this.daysElement) this.daysElement.textContent = '00';
              if (this.hoursElement) this.hoursElement.textContent = '00';
              if (this.minutesElement) this.minutesElement.textContent = '00';
              if (this.secondsElement) this.secondsElement.textContent = '00';
              
              // Update hero title
              const heroTitle = document.getElementById('heroTitle');
              if (heroTitle) {
                  heroTitle.textContent = 'Bon Voyage! 🚢';
                  heroTitle.classList.add('countdown-complete');
              }
              
              // Show celebration message
              this.notifyObservers({
                  type: 'countdownComplete',
                  timestamp: Date.now(),
                  message: 'Countdown complete! The cruise has begun!'
              });
              
              // Play celebration sound (optional)
              this.playCelebrationSound();
          }
          
          playCelebrationSound() {
              // This is a placeholder - in production you would use actual audio
              console.log('🎉 Countdown complete! Playing celebration sound...');
              
              // Example with Web Audio API
              if (typeof Audio !== 'undefined') {
                  try {
                      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
                      audio.volume = 0.3;
                      audio.play().catch(e => console.log('Audio play failed:', e));
                  } catch (error) {
                      this.errorHandler.log(error, 'CountdownManager.playCelebrationSound');
                  }
              }
          }
          
          getTimeRemaining() {
              const now = new Date();
              const timeRemaining = this.targetDate - now;
              
              if (timeRemaining <= 0) {
                  return {
                      days: 0,
                      hours: 0,
                      minutes: 0,
                      seconds: 0,
                      totalSeconds: 0,
                      isComplete: true
                  };
              }
              
              return {
                  days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                  minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
                  seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000),
                  totalSeconds: Math.floor(timeRemaining / 1000),
                  isComplete: false
              };
          }
          
          formatTimeRemaining(format = 'long') {
              const time = this.getTimeRemaining();
              
              if (time.isComplete) {
                  return 'The cruise has begun!';
              }
              
              switch (format) {
                  case 'short':
                      return `${time.days}d ${time.hours}h ${time.minutes}m`;
                  case 'compact':
                      return `${time.days}:${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
                  case 'verbose':
                      const parts = [];
                      if (time.days > 0) parts.push(`${time.days} day${time.days !== 1 ? 's' : ''}`);
                      if (time.hours > 0) parts.push(`${time.hours} hour${time.hours !== 1 ? 's' : ''}`);
                      if (time.minutes > 0) parts.push(`${time.minutes} minute${time.minutes !== 1 ? 's' : ''}`);
                      return parts.join(', ');
                  case 'long':
                  default:
                      return `${time.days} days, ${time.hours} hours, ${time.minutes} minutes`;
              }
          }
          
          addObserver(observer) {
              this.observers.add(observer);
          }
          
          removeObserver(observer) {
              this.observers.delete(observer);
          }
          
          notifyObservers(data) {
              this.observers.forEach(observer => {
                  try {
                      if (typeof observer === 'function') {
                          observer(data);
                      } else if (observer && typeof observer.update === 'function') {
                          observer.update(data);
                      }
                  } catch (error) {
                      this.errorHandler.log(error, 'CountdownManager.notifyObservers');
                  }
              });
          }
          
          destroy() {
              this.stop();
              this.observers.clear();
              
              // Clean up DOM references
              this.daysElement = null;
              this.hoursElement = null;
              this.minutesElement = null;
              this.secondsElement = null;
          }
         }
         
         // ============================================================================
         // WEATHER MANAGER
         // ============================================================================
         
         class WeatherManager {
          constructor() {
              this.currentWeather = null;
              this.forecast = [];
              this.intervalId = null;
              this.isFetching = false;
              this.errorHandler = new ErrorHandler();
              this.observers = new Set();
              this.useMockData = false; // Uses Open-Meteo when available; falls back to mock data
              
              // DOM elements
              this.tempElement = document.getElementById('weatherTemp');
              this.conditionElement = document.getElementById('weatherCondition');
              this.iconElement = document.querySelector('.weather-icon');
              this.summaryElement = document.getElementById('weatherSummary');
              this.forecastListElement = document.getElementById('weatherForecastList');
              
              // Mock weather data for Caribbean in February
              this.mockWeatherConditions = [
                  { temp: '84°F', condition: 'Sunny', icon: '☀️', description: 'Perfect beach weather', humidity: '65%', wind: '12 mph' },
                  { temp: '82°F', condition: 'Partly Cloudy', icon: '🌤️', description: 'Ideal for outdoor activities', humidity: '68%', wind: '10 mph' },
                  { temp: '81°F', condition: 'Mostly Sunny', icon: '⛅', description: 'Warm with light breeze', humidity: '70%', wind: '8 mph' },
                  { temp: '80°F', condition: 'Light Showers', icon: '🌦️', description: 'Brief rain, mostly sunny', humidity: '75%', wind: '15 mph' },
                  { temp: '83°F', condition: 'Clear Skies', icon: '✨', description: 'Beautiful stargazing tonight', humidity: '62%', wind: '6 mph' },
                  { temp: '79°F', condition: 'Breezy', icon: '💨', description: 'Cooler with strong winds', humidity: '60%', wind: '20 mph' },
                  { temp: '85°F', condition: 'Hot & Humid', icon: '🔥', description: 'High humidity, stay hydrated', humidity: '80%', wind: '5 mph' }
              ];
          }
          
          async initialize() {
              try {
                  // Load initial weather
                  await this.fetchWeather();
                  
                  // Start periodic updates (every 15 minutes for real API, every 30 seconds for demo)
                  this.intervalId = setInterval(() => {
                      this.fetchWeather();
                  }, this.useMockData ? 30000 : 900000); // 30 seconds for demo, 15 minutes for production
                  
                  return true;
              } catch (error) {
                  this.errorHandler.log(error, 'WeatherManager.initialize');
                  return false;
              }
          }
          
          async fetchWeather() {
              if (this.isFetching) {
                  console.warn('Weather fetch already in progress');
                  return null;
              }
              
              this.isFetching = true;
              
              try {
                  let weatherData;
                  
                  if (this.useMockData) {
                      // Use mock data
                      weatherData = await this.fetchMockWeather();
                  } else {
                      // Fetch from real API
                      weatherData = await this.fetchApiWeather();
                  }
                  
                  if (weatherData) {
                      this.currentWeather = weatherData;
                      this.updateDisplay();
                      
                      this.notifyObservers({
                          type: 'weatherUpdated',
                          data: weatherData,
                          timestamp: Date.now()
                      });
                  }
                  
                  return weatherData;
              } catch (error) {
                  this.errorHandler.log(error, 'WeatherManager.fetchWeather');
                  
                  // Fallback to mock data
                  const fallbackData = await this.fetchMockWeather();
                  this.currentWeather = fallbackData;
                  this.updateDisplay();
                  
                  return fallbackData;
              } finally {
                  this.isFetching = false;
              }
          }
          
          async fetchMockWeather() {
              // Simulate API delay
              await PerformanceUtils.sleep(500);
              
              // Get random or sequential weather
              const weather = this.getRandomWeather();
              
              // Simulate forecast aligned to ports
              this.forecast = [];
              const cruiseStart = new Date(CONFIG.CRUISE_DATE);
              (CONFIG.PORTS || []).forEach(port => {
                  const forecastDay = new Date(cruiseStart);
                  forecastDay.setDate(cruiseStart.getDate() + (port.day - 1));
                  const mockCondition = this.mockWeatherConditions[Math.floor(Math.random() * this.mockWeatherConditions.length)];
                  const high = Math.floor(Math.random() * 10) + 78;
                  const low = Math.floor(Math.random() * 8) + 68;
                  
                  this.forecast.push({
                      date: forecastDay.toISOString().split('T')[0],
                      dayLabel: `Day ${port.day}`,
                      location: port.name,
                      high: `${high}°F`,
                      low: `${low}°F`,
                      condition: mockCondition.condition,
                      icon: mockCondition.icon,
                      precipitation: `${Math.floor(Math.random() * 40) + 10}%`
                  });
              });
              
              return {
                  ...weather,
                  forecast: this.forecast,
                  lastUpdated: new Date().toISOString(),
                  location: this.forecast[0]?.location || 'Caribbean Sea',
                  sunrise: '6:45 AM',
                  sunset: '6:15 PM',
                  uvIndex: '8 (Very High)',
                  visibility: '10 miles'
              };
          }
          
          async fetchApiWeather() {
              const ports = CONFIG.PORTS || [];
              if (!ports.length) {
                  throw new Error('No ports configured for weather lookup.');
              }
              
              const cruiseStart = new Date(CONFIG.CRUISE_DATE);
              const forecastRequests = ports.map(port => {
                  const portDate = new Date(cruiseStart);
                  portDate.setDate(cruiseStart.getDate() + (port.day - 1));
                  
                  const url = new URL('https://api.open-meteo.com/v1/forecast');
                  url.searchParams.set('latitude', port.latitude);
                  url.searchParams.set('longitude', port.longitude);
                  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
                  url.searchParams.set('forecast_days', '16');
                  url.searchParams.set('timezone', 'auto');
                  
                  return this.fetchPortForecast(url.toString(), port, portDate);
              });
              
              const results = await Promise.all(forecastRequests);
              const validResults = results.filter(Boolean);
              
              if (!validResults.length) {
                  throw new Error('No port forecasts returned.');
              }
              
              const currentWeather = validResults[0];
              return {
                  ...currentWeather,
                  forecast: validResults,
                  lastUpdated: new Date().toISOString(),
                  location: currentWeather.location
              };
          }
          
          async fetchPortForecast(url, port, portDate) {
              const response = await fetch(url, { method: 'GET' });
              
              if (!response.ok) {
                  throw new Error(`Weather API error: ${response.status}`);
              }
              
              const data = await response.json();
              const targetDate = portDate.toISOString().split('T')[0];
              const dayIndex = data?.daily?.time?.indexOf(targetDate);
              
              if (dayIndex === -1 || dayIndex == null) {
                  return null;
              }
              
              const weatherCode = data.daily.weathercode[dayIndex];
              const mapping = this.getWeatherFromCode(weatherCode);
              
              return {
                  date: targetDate,
                  dayLabel: `Day ${port.day}`,
                  location: port.name,
                  temp: `${Math.round(this.cToF(data.daily.temperature_2m_max[dayIndex]))}°F`,
                  low: `${Math.round(this.cToF(data.daily.temperature_2m_min[dayIndex]))}°F`,
                  high: `${Math.round(this.cToF(data.daily.temperature_2m_max[dayIndex]))}°F`,
                  condition: mapping.label,
                  icon: mapping.icon,
                  precipitation: `${data.daily.precipitation_probability_max[dayIndex]}%`,
                  description: mapping.description
              };
          }
          
          getRandomWeather() {
              const randomIndex = Math.floor(Math.random() * this.mockWeatherConditions.length);
              return { ...this.mockWeatherConditions[randomIndex] };
          }
          
          getWeatherIcon(iconCode) {
              // Map OpenWeatherMap icons to emoji
              const iconMap = {
                  '01d': '☀️', '01n': '🌙',
                  '02d': '🌤️', '02n': '🌤️',
                  '03d': '☁️', '03n': '☁️',
                  '04d': '☁️', '04n': '☁️',
                  '09d': '🌧️', '09n': '🌧️',
                  '10d': '🌦️', '10n': '🌦️',
                  '11d': '⛈️', '11n': '⛈️',
                  '13d': '❄️', '13n': '❄️',
                  '50d': '🌫️', '50n': '🌫️'
              };
              
              return iconMap[iconCode] || '🌡️';
          }
          
          getWeatherFromCode(code) {
              const mappings = {
                  0: { label: 'Clear', icon: '☀️', description: 'Clear skies' },
                  1: { label: 'Mainly Clear', icon: '🌤️', description: 'Mostly sunny' },
                  2: { label: 'Partly Cloudy', icon: '⛅', description: 'Partly cloudy' },
                  3: { label: 'Overcast', icon: '☁️', description: 'Cloudy skies' },
                  45: { label: 'Fog', icon: '🌫️', description: 'Foggy conditions' },
                  48: { label: 'Rime Fog', icon: '🌫️', description: 'Low visibility fog' },
                  51: { label: 'Light Drizzle', icon: '🌦️', description: 'Light drizzle' },
                  53: { label: 'Drizzle', icon: '🌦️', description: 'Scattered drizzle' },
                  55: { label: 'Heavy Drizzle', icon: '🌧️', description: 'Steady drizzle' },
                  61: { label: 'Light Rain', icon: '🌧️', description: 'Light rain showers' },
                  63: { label: 'Rain', icon: '🌧️', description: 'Rainy conditions' },
                  65: { label: 'Heavy Rain', icon: '🌧️', description: 'Heavy rain' },
                  71: { label: 'Light Snow', icon: '❄️', description: 'Light snow' },
                  73: { label: 'Snow', icon: '❄️', description: 'Snow showers' },
                  75: { label: 'Heavy Snow', icon: '❄️', description: 'Heavy snow' },
                  80: { label: 'Showers', icon: '🌦️', description: 'Scattered showers' },
                  81: { label: 'Heavy Showers', icon: '🌧️', description: 'Heavy showers' },
                  82: { label: 'Thunder Showers', icon: '⛈️', description: 'Thunderstorms possible' },
                  95: { label: 'Thunderstorm', icon: '⛈️', description: 'Thunderstorms' }
              };
              
              return mappings[code] || { label: 'Mixed', icon: '🌡️', description: 'Variable conditions' };
          }
          
          cToF(celsius) {
              return (celsius * 9) / 5 + 32;
          }
          
          updateDisplay() {
         if (!this.currentWeather) return;
         
         // Animate changes
         this.animateWeatherChange();
         
         // Update DOM after animation
         setTimeout(() => {
         if (this.tempElement) {
            this.tempElement.textContent = this.currentWeather.temp;
            this.tempElement.setAttribute('aria-label', `Temperature: ${this.currentWeather.temp}`);
         }
         
         if (this.conditionElement) {
            this.conditionElement.textContent = this.currentWeather.condition;
            this.conditionElement.setAttribute('aria-label', `Conditions: ${this.currentWeather.condition}`);
         }
         
         if (this.iconElement) {
            this.iconElement.textContent = this.currentWeather.icon;
            this.iconElement.setAttribute('aria-label', this.currentWeather.description);
         }
         
         if (this.summaryElement) {
            this.summaryElement.textContent = `Latest forecast for ${this.currentWeather.location}.`;
         }
         
         if (this.forecastListElement) {
            this.forecastListElement.innerHTML = '';
            const forecastItems = this.currentWeather.forecast || [];
            if (forecastItems.length) {
                forecastItems.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.className = 'weather-forecast-item';
                    listItem.innerHTML = `
                        <span class="weather-forecast-icon" aria-hidden="true">${item.icon}</span>
                        <div>
                            <strong>${item.dayLabel}: ${item.location}</strong>
                            <div class="weather-forecast-meta">${item.condition} • ${item.precipitation} precip</div>
                        </div>
                        <div class="weather-forecast-temp">${item.high}/${item.low}</div>
                    `;
                    this.forecastListElement.appendChild(listItem);
                });
            } else {
                const fallback = document.createElement('li');
                fallback.className = 'weather-forecast-item';
                fallback.textContent = 'Forecast will appear closer to sailing.';
                this.forecastListElement.appendChild(fallback);
            }
         }
         }, 300);
         }
         
         animateWeatherChange() {
         if (this.tempElement) {
         this.tempElement.style.opacity = '0.3';
         this.tempElement.style.transform = 'scale(0.9)';
         }
         
         if (this.conditionElement) {
         this.conditionElement.style.opacity = '0.3';
         }
         
         if (this.iconElement) {
         this.iconElement.style.opacity = '0.3';
         this.iconElement.style.transform = 'rotate(-10deg)';
         }
         
         setTimeout(() => {
         if (this.tempElement) {
            this.tempElement.style.opacity = '1';
            this.tempElement.style.transform = 'scale(1)';
         }
         
         if (this.conditionElement) {
            this.conditionElement.style.opacity = '1';
         }
         
         if (this.iconElement) {
            this.iconElement.style.opacity = '1';
            this.iconElement.style.transform = 'rotate(0deg)';
         }
         }, 300);
         }
         
         addObserver(observer) {
         this.observers.add(observer);
         }
         
         removeObserver(observer) {
         this.observers.delete(observer);
         }
         
         notifyObservers(data) {
         this.observers.forEach(observer => {
         try {
            if (typeof observer === 'function') {
                observer(data);
            } else if (observer && typeof observer.update === 'function') {
                observer.update(data);
            }
         } catch (error) {
            this.errorHandler.log(error, 'WeatherManager.notifyObservers');
         }
         });
         }
         
         destroy() {
         if (this.intervalId) {
         clearInterval(this.intervalId);
         this.intervalId = null;
         }
         
         this.observers.clear();
         
         // Clean up DOM references
         this.tempElement = null;
         this.conditionElement = null;
         this.iconElement = null;
         this.summaryElement = null;
         this.forecastListElement = null;
         }
         }
         
         // ============================================================================
         // APPLICATION MAIN
         // ============================================================================
         
         class CruiseCompanionApp {
         constructor() {
         this.errorHandler = new ErrorHandler();
         this.storage = new StorageManager();
         this.navigation = new NavigationManager();
         this.search = new SearchManager();
         this.ui = new UIComponentsManager();
         this.countdown = new CountdownManager(CONFIG.CRUISE_DATE);
         this.weather = new WeatherManager();
         
         this.isInitialized = false;
         this.isLoading = false;
         this.offlineSaveInProgress = false;
         
         // Bind methods
         this.initialize = this.initialize.bind(this);
         this.handleError = this.handleError.bind(this);
         this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
         }
         
         async initialize() {
         if (this.isInitialized) {
         console.warn('App is already initialized');
         return true;
         }
         
         if (this.isLoading) {
         console.warn('App is already loading');
         return false;
         }
         
         this.isLoading = true;
         
         try {
         // Show loading overlay
         this.showLoadingOverlay();
         
         // 1. Initialize error handling
         window.addEventListener('error', this.handleError);
         window.addEventListener('unhandledrejection', this.handleError);
         
         // 2. Initialize storage
         await this.initializeStorage();
         
         // 3. Initialize navigation
         await this.initializeNavigation();
         
         // 4. Initialize UI components
         await this.ui.initialize();
         
         // 5. Initialize search
         await this.search.buildIndex();
         
         // 6. Initialize countdown
         await this.initializeCountdown();
         
         // 7. Initialize weather
         await this.weather.initialize();
         
         // 8. Initialize event listeners
         await this.initializeEventListeners();
         
         // 9. Initialize deck plans
         await this.initializeDeckPlans();
         
         // 10. Initialize service worker (if available)
         await this.initializeServiceWorker();
         
         // 11. Finalize initialization
         await this.finalizeInitialization();
         
         this.isInitialized = true;
         
         // Hide loading overlay
         setTimeout(() => {
            this.hideLoadingOverlay();
         }, CONFIG.LOADING_DELAY);
         
         // Show welcome message
         setTimeout(() => {
            this.ui.showToast('Welcome to your Cruise Companion! 🚢', {
                type: 'success',
                duration: 3000
            });
         }, CONFIG.LOADING_DELAY + 500);
         
         console.log(`${CONFIG.APP_NAME} v${CONFIG.APP_VERSION} initialized successfully`);
         return true;
         
         } catch (error) {
         this.errorHandler.log(error, 'CruiseCompanionApp.initialize');
         
         // Show error screen
         this.showErrorScreen('Failed to initialize the app. Please refresh the page.');
         
         return false;
         } finally {
         this.isLoading = false;
         }
         }
         
         showLoadingOverlay() {
         const loadingOverlay = document.getElementById('loadingOverlay');
         if (loadingOverlay) {
         loadingOverlay.classList.remove('hidden');
         loadingOverlay.setAttribute('aria-busy', 'true');
         loadingOverlay.setAttribute('aria-label', 'Loading cruise companion');
         }
         }
         
         hideLoadingOverlay() {
         const loadingOverlay = document.getElementById('loadingOverlay');
         if (loadingOverlay) {
         loadingOverlay.classList.add('hidden');
         loadingOverlay.setAttribute('aria-busy', 'false');
         }
         }
         
         async initializeStorage() {
         // Load saved preferences
         const preferences = this.storage.loadPreferences();
         
         // Apply preferences
         if (preferences.compactMode) {
         this.toggleCompactMode(true);
         }
         
         if (preferences.criticalFilter) {
         this.toggleCriticalFilter(true);
         }
         
         // Check if hint was dismissed
         const hintDismissed = this.storage.get(CONFIG.STORAGE_KEYS.HINT_DISMISSED, false);
         if (hintDismissed) {
         this.hideTopBarHint();
         }
         }
         
         async initializeNavigation() {
         // Handle initial hash
         const hash = window.location.hash.replace('#', '');
        const initialSection =
        this.navigation.availableSections.includes(hash)
          ? hash
          : this.navigation.availableSections[0] || null;
         
         await this.navigation.navigateToSection(initialSection, {
         scroll: false
         });
         
         // Handle hash changes
         window.addEventListener('hashchange', () => {
         const newHash = window.location.hash.replace('#', '');
         if (this.navigation.availableSections.includes(newHash)) {
            this.navigation.navigateToSection(newHash);
         }
         });
         
         // Add navigation observers
         this.navigation.addObserver((data) => {
         if (data.type === 'sectionChange') {
            // Update day selector visibility
            this.updateDaySelectorVisibility(data.section);
            
            // Update navigation context
            this.updateNavContext(data.section);
            
            // Update critical count badge
            this.updateCriticalCountBadge();
            
            // Announce to screen reader
            this.ui.announceToScreenReader(`Navigated to ${data.section} section`);
         }
         });
         }
         
         async initializeCountdown() {
         // Start countdown
         this.countdown.start();
         
         // Add observer for countdown updates
         this.countdown.addObserver((data) => {
         if (data.type === 'countdownComplete') {
            this.ui.showToast('Bon Voyage! Your cruise has begun! 🚢', {
                type: 'success',
                duration: 5000
            });
            
            // Update hero title
            const heroTitle = document.getElementById('heroTitle');
            if (heroTitle) {
                heroTitle.textContent = 'Bon Voyage! 🚢';
            }
         }
         });
         }
         
         async initializeEventListeners() {
         // Navigation buttons
        document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', (e) => {
           e.preventDefault();
           const section = button.dataset.section;
           this.navigation.navigateToSection(section);

           if (button.closest('#navMobileMenu')) {
               this.closeSectionDrawer();
           }
        });
        });
         
         // Day selector buttons
         document.querySelectorAll('.nav-day-btn, .day-btn').forEach(button => {
         button.addEventListener('click', () => {
            const day = button.dataset.day;
            this.navigation.setCurrentDay(day);
            
            // Update top bar hint
            this.updateTopBarHintForDay(day);
         });
         });

         // Itinerary day tabs
         const dayTabs = document.querySelectorAll('.day-tab');
         const timelineSteps = document.querySelectorAll('.timeline-step');
         if (dayTabs.length) {
         dayTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                dayTabs.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                const day = tab.dataset.day || 'all';
                this.navigation.setCurrentDay(day);
                this.updateTopBarHintForDay(day);
                
                timelineSteps.forEach(step => {
                    step.style.display = (day === 'all' || step.dataset.day === day) ? 'grid' : 'none';
                });
            });
         });
         }
         
         // Traveler selector
         const travelerSelect = document.getElementById('travelerSelect');
         if (travelerSelect) {
         travelerSelect.addEventListener('change', (e) => {
            this.navigation.setTravelerView(e.target.value);
         });
         }

         // Room view toggle
         const viewToggleButtons = document.querySelectorAll('.view-toggle__btn');
         const roomCardsView = document.getElementById('roomCardsView');
         const roomTableView = document.getElementById('roomTableView');
         if (viewToggleButtons.length && roomCardsView && roomTableView) {
         viewToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view || 'cards';
                viewToggleButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                if (view === 'table') {
                    roomCardsView.classList.remove('active');
                    roomTableView.classList.add('active');
                } else {
                    roomTableView.classList.remove('active');
                    roomCardsView.classList.add('active');
                }
            });
         });
         }

         // Itinerary detail toggles
         document.querySelectorAll('.step-expand').forEach(button => {
         button.setAttribute('aria-expanded', 'false');
         button.addEventListener('click', () => {
            const details = button.closest('.step-details');
            if (!details) return;
            const expanded = details.classList.toggle('is-expanded');
            button.setAttribute('aria-expanded', expanded.toString());
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
         });
         });
         
         // Search functionality
         this.initializeSearchListeners();
         
         // Card toggles
         document.querySelectorAll('.card__toggle').forEach(toggle => {
         toggle.addEventListener('click', () => {
            const card = toggle.closest('.card');
            const content = card.querySelector('.card__content');
            
            if (content.classList.contains('collapsed')) {
                // Expand
                content.classList.remove('collapsed');
                content.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.setAttribute('aria-expanded', 'true');
                toggle.querySelector('i').className = 'fas fa-chevron-up';
                
                // After transition, set to auto
                setTimeout(() => {
                    if (content.classList.contains('expanded')) {
                        content.style.maxHeight = 'none';
                    }
                }, 300);
            } else {
                // Collapse
                content.classList.remove('expanded');
                content.classList.add('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // Trigger reflow
                content.offsetHeight;
                
                // Animate collapse
                content.style.maxHeight = '0';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.querySelector('i').className = 'fas fa-chevron-down';
            }
         });
         });
         
         // Critical filter toggle
         const criticalToggleBtn = document.getElementById('criticalToggleBtn');
         if (criticalToggleBtn) {
         criticalToggleBtn.addEventListener('click', () => {
            const isActive = criticalToggleBtn.getAttribute('aria-pressed') === 'true';
            this.toggleCriticalFilter(!isActive);
         });
         }

         // View mode toggle
         const modeButtons = document.querySelectorAll('.nav-view-btn');
         const viewTargets = document.querySelectorAll('[data-view]');
         const applyViewMode = (mode) => {
         const normalizedMode = mode || 'today';
         document.body.dataset.viewMode = normalizedMode;
         viewTargets.forEach(target => {
            const modes = (target.dataset.view || '').split(/\s+/).filter(Boolean);
            const isVisible = modes.includes(normalizedMode);
            target.toggleAttribute('hidden', !isVisible);
         });
         };
         if (modeButtons.length) {
         modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modeButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                    btn.setAttribute('tabindex', '-1');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                button.setAttribute('tabindex', '0');
                applyViewMode(button.dataset.view);
            });
         });
         const initialModeButton = document.querySelector('.nav-view-btn.active');
         if (initialModeButton) {
         initialModeButton.setAttribute('aria-selected', 'true');
         initialModeButton.setAttribute('tabindex', '0');
         }
         applyViewMode(initialModeButton?.dataset.view);
         }
         
         // Compact mode toggle
         const compactToggleBtn = document.getElementById('compactToggleBtn');
         if (compactToggleBtn) {
         compactToggleBtn.addEventListener('click', () => {
            const isActive = compactToggleBtn.getAttribute('aria-pressed') === 'true';
            this.toggleCompactMode(!isActive);
         });
         }
         
         // Jump to critical button
         const jumpToCriticalBtn = document.getElementById('jumpToCriticalBtn');
         if (jumpToCriticalBtn) {
         jumpToCriticalBtn.addEventListener('click', () => {
            this.navigation.navigateToSection('operations');
         });
         }

         // Hero critical checklist button
         const criticalChecklistBtn = document.getElementById('criticalChecklistBtn');
         if (criticalChecklistBtn) {
         criticalChecklistBtn.addEventListener('click', () => {
            this.navigation.navigateToSection('operations');
            const checklistAnchor = document.getElementById('critical-checklist') || document.getElementById('criticalChecklist');
            if (checklistAnchor) {
                setTimeout(() => {
                    checklistAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    checklistAnchor.focus({ preventScroll: true });
                }, 350);
            }
         });
         }
         
         // Top bar hint close
         const topBarHintClose = document.getElementById('topBarHintClose');
         if (topBarHintClose) {
         topBarHintClose.addEventListener('click', () => {
            this.hideTopBarHint();
            this.storage.set(CONFIG.STORAGE_KEYS.HINT_DISMISSED, true);
         });
         }
         
         // Quick action buttons
         const printBtn = document.getElementById('printBtn');
         if (printBtn) {
         printBtn.addEventListener('click', () => {
            this.printItinerary();
         });
         }
         
         const offlineBtn = document.getElementById('offlineBtn');
         if (offlineBtn) {
         offlineBtn.addEventListener('click', () => {
            this.saveOffline();
         });
         }
         
         const shareBtn = document.getElementById('shareBtn');
         if (shareBtn) {
         shareBtn.addEventListener('click', () => {
            this.shareItinerary();
         });
         }
         
         // Mobile menu
         const mobileMenuBtn = document.getElementById('mobileMenuBtn');
         const mobileMoreBtn = document.getElementById('mobileMoreBtn');
         const sectionDrawerClose = document.getElementById('navMobileClose');
         const sectionDrawerOverlay = document.getElementById('navOverlay');
         
         if (mobileMenuBtn) {
         mobileMenuBtn.addEventListener('click', () => {
            this.openSectionDrawer();
         });
         }
         
         if (mobileMoreBtn) {
         mobileMoreBtn.addEventListener('click', () => {
            this.openSectionDrawer();
         });
         }
         
         if (sectionDrawerClose) {
         sectionDrawerClose.addEventListener('click', () => {
            this.closeSectionDrawer();
         });
         }
         
         if (sectionDrawerOverlay) {
         sectionDrawerOverlay.addEventListener('click', () => {
            this.closeSectionDrawer();
         });
         }
         
         // Online/offline detection
         window.addEventListener('online', this.handleOnlineStatus);
         window.addEventListener('offline', this.handleOnlineStatus);
         
         // Keyboard shortcuts
         document.addEventListener('keydown', (e) => {
         this.handleKeyboardShortcuts(e);
         });
         }
         
         initializeSearchListeners() {
         const searchBtn = document.getElementById('searchBtn');
         const searchClose = document.getElementById('searchClose');
         const searchOverlay = document.getElementById('searchOverlay');
         const searchForm = document.getElementById('searchForm');
         const searchInput = document.getElementById('searchInput');
         const searchChips = document.querySelectorAll('.search-chip');
         
         if (searchBtn) {
         searchBtn.addEventListener('click', () => {
            this.openSearch();
         });
         }
         
         if (searchClose) {
         searchClose.addEventListener('click', () => {
            this.closeSearch();
         });
         }
         
         if (searchOverlay) {
         searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                this.closeSearch();
            }
         });
         }
         
         if (searchForm) {
         searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query);
            }
         });
         }
         
         // Search chips
         searchChips.forEach(chip => {
         chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            if (query) {
                searchInput.value = query;
                this.performSearch(query);
            }
         });
         });
         
         // Search input events
         if (searchInput) {
         // Clear results when input is cleared
         searchInput.addEventListener('input', PerformanceUtils.debounce(() => {
            if (!searchInput.value.trim()) {
                this.clearSearchResults();
            }
         }, 300));
         
         // Handle Escape key
         searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchInput.value) {
                    searchInput.value = '';
                    this.clearSearchResults();
                } else {
                    this.closeSearch();
                }
            }
         });
         }
         }
         
         async initializeDeckPlans() {
         const deckPlansGrid = document.getElementById('deckPlansGrid');
         const deckPlanUpload = document.getElementById('deckPlanUpload');
         const deckPlanClearBtn = document.getElementById('deckPlanClearBtn');
         
         if (!deckPlansGrid) return;
         
         const sharedPlans = await this.fetchSharedDeckPlans();
         let localPlans = this.storage.loadDeckPlans();
         let currentPlans = this.mergeDeckPlanCollections(sharedPlans, localPlans);
         this.renderDeckPlans(currentPlans, deckPlansGrid);
         
         if (deckPlanUpload) {
         deckPlanUpload.addEventListener('change', async (event) => {
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;
            
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length === 0) {
                this.ui.showToast('Please upload image files for deck plans.', {
                    type: 'warning',
                    duration: 3000
                });
                deckPlanUpload.value = '';
                return;
            }
            
            const uploadedPlans = [];
            
            for (const file of imageFiles) {
                const dataUrl = await this.readFileAsDataUrl(file);
                uploadedPlans.push({
                    name: file.name,
                    dataUrl: dataUrl,
                    updatedAt: new Date().toISOString()
                });
            }
            
            localPlans = [...localPlans, ...uploadedPlans].slice(0, 10);
            this.storage.saveDeckPlans(localPlans);
            currentPlans = this.mergeDeckPlanCollections(sharedPlans, localPlans);
            this.renderDeckPlans(currentPlans, deckPlansGrid);
            
            this.ui.showToast(`${uploadedPlans.length} deck plan(s) saved on this device. Add shared files to deck-plans/index.json for everyone.`, {
                type: 'success',
                duration: 3000
            });
            
            deckPlanUpload.value = '';
         });
         }
         
         if (deckPlanClearBtn) {
         deckPlanClearBtn.addEventListener('click', () => {
            const confirmed = window.confirm('Clear all saved deck plans from this device?');
            if (!confirmed) return;
            
            this.storage.clearDeckPlans();
            localPlans = [];
            currentPlans = this.mergeDeckPlanCollections(sharedPlans, localPlans);
            this.renderDeckPlans(currentPlans, deckPlansGrid);
            
            this.ui.showToast('Saved deck plans cleared.', {
                type: 'info',
                duration: 3000
            });
         });
         }
         }

         async fetchSharedDeckPlans() {
         try {
            const response = await fetch(CONFIG.SHARED_DECK_PLANS_MANIFEST, {
                cache: 'no-store'
            });

            if (!response.ok) {
                if (response.status !== 404) {
                    console.warn('Unable to load shared deck plans manifest:', response.status);
                }
                return [];
            }

            const manifest = await response.json();
            const plans = Array.isArray(manifest?.plans) ? manifest.plans : [];

            return plans
                .filter(plan => typeof plan?.src === 'string')
                .map((plan, index) => ({
                    name: plan.name || `Deck Plan ${index + 1}`,
                    dataUrl: encodeURI(plan.src),
                    updatedAt: plan.updatedAt || new Date().toISOString(),
                    source: 'shared'
                }));
         } catch (error) {
            this.errorHandler.log(error, 'CruiseApp.fetchSharedDeckPlans');
            return [];
         }
         }

         mergeDeckPlanCollections(sharedPlans = [], localPlans = []) {
         const mergedPlans = [...sharedPlans, ...localPlans].slice(0, 20);
         return mergedPlans;
         }
         
         renderDeckPlans(plans, deckPlansGrid) {
         if (!deckPlansGrid) return;
         
         if (!plans || plans.length === 0) {
         deckPlansGrid.innerHTML = `
            <div class="deck-plan-card deck-plan-card--placeholder">
                <strong>No deck plans saved yet.</strong>
                <p class="mb-0">Upload deck plans for this device, or publish shared files in <code>deck-plans/index.json</code> so everyone sees the same images.</p>
            </div>
         `;
         return;
         }
         
         deckPlansGrid.innerHTML = '';
         
         plans.forEach((plan, index) => {
         const card = document.createElement('div');
         card.className = 'deck-plan-card';
         card.innerHTML = `
            <a href="${plan.dataUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${plan.dataUrl}" alt="Deck plan ${index + 1} - ${plan.name}">
            </a>
            <strong>${plan.name}</strong>
            <span class="deck-plan-meta">Saved ${new Date(plan.updatedAt).toLocaleDateString()}</span>
            ${plan.source === 'shared' ? '<span class="deck-plan-meta">Shared via GitHub Pages</span>' : ''}
         `;
         deckPlansGrid.appendChild(card);
         });
         }
         
         readFileAsDataUrl(file) {
         return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
         });
         }
         
         async initializeServiceWorker() {
         if ('serviceWorker' in navigator) {
         try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('ServiceWorker registration successful with scope:', registration.scope);
         } catch (error) {
            console.warn('ServiceWorker registration failed:', error);
         }
         }
         }
         
         async finalizeInitialization() {
         // Update critical count badge
         this.updateCriticalCountBadge();
         
         // Update day selector visibility
         this.updateDaySelectorVisibility(this.navigation.currentSection);
         
         // Update navigation context
         this.updateNavContext(this.navigation.currentSection);
         
         // Update top bar hint
         this.updateTopBarHint();
         
         // Check online status
         this.handleOnlineStatus();
         
         // Update offline button state
         this.updateOfflineButtonState();
         
         // Announce to screen readers
         this.ui.announceToScreenReader('Cruise Companion loaded successfully');
         }
         
         updateDaySelectorVisibility(section) {
         const daySelector = document.getElementById('navDaySelector');
         const viewToggle = document.querySelector('.nav-view-toggle');
         if (!daySelector && !viewToggle) return;
         
         if (section === 'itinerary') {
         if (daySelector) {
            daySelector.style.display = 'flex';
            daySelector.removeAttribute('aria-hidden');
         }
         if (viewToggle) {
            viewToggle.style.display = 'none';
            viewToggle.setAttribute('aria-hidden', 'true');
         }
         } else {
         if (daySelector) {
            daySelector.style.display = 'none';
            daySelector.setAttribute('aria-hidden', 'true');
         }
         if (viewToggle) {
            viewToggle.style.display = 'flex';
            viewToggle.removeAttribute('aria-hidden');
         }
         }
         }
         
         updateNavContext(section) {
         const contextTitle = document.getElementById('navContextTitle');
         const contextBadge = document.getElementById('navContextBadge');
         if (!contextTitle || !contextBadge) return;
         
         const labels = {
         overview: { title: 'Dashboard', badge: 'Overview' },
         itinerary: { title: 'Itinerary', badge: 'Daily Schedule' },
         operations: { title: 'Checklist', badge: 'Critical' },
         rooms: { title: 'Rooms & Muster', badge: 'Staterooms' },
         dining: { title: 'Dining', badge: 'Reservations' },
         tips: { title: 'Pro Tips', badge: 'Expert Advice' },
         'deck-plans': { title: 'Deck Plans', badge: 'Maps' },
         communication: { title: 'Comms & Budget', badge: 'Money' },
         integrate: { title: 'VIP Upgrades', badge: 'Premium' }
         };
         
         const active = labels[section] || labels.overview;
         const titleSpan = contextTitle.querySelector('span:first-child');
         if (titleSpan) {
         titleSpan.textContent = active.title;
         }
         contextBadge.textContent = active.badge;
         
        const badgeColors = {
        operations: { bg: 'rgba(201, 68, 79, 0.15)', color: '#8b1f2d' },
        itinerary: { bg: 'rgba(43, 141, 191, 0.15)', color: '#1f4d6a' },
        dining: { bg: 'rgba(210, 162, 58, 0.2)', color: '#7c5a1e' },
        rooms: { bg: 'rgba(31, 138, 143, 0.18)', color: '#19595c' },
        tips: { bg: 'rgba(112, 132, 152, 0.18)', color: '#2d3d4f' },
        default: { bg: 'rgba(43, 141, 191, 0.15)', color: '#1f4d6a' }
        };
         
         const styles = badgeColors[section] || badgeColors.default;
         contextBadge.style.background = styles.bg;
         contextBadge.style.color = styles.color;
         }
         
         updateCriticalCountBadge() {
         const criticalCount = document.querySelectorAll('.critical-item').length;
         const criticalBadges = document.querySelectorAll('[data-critical-badge]');
         
         criticalBadges.forEach((badge) => {
         badge.textContent = criticalCount.toString();
         badge.style.display = criticalCount > 0 ? 'grid' : 'none';
         });
         }
         
         updateTopBarHint(day = null) {
         const topBarHint = document.getElementById('topBarHint');
         const topBarHintTitle = document.getElementById('topBarHintTitle');
         const topBarHintDetail = document.getElementById('topBarHintDetail');
         const topBarHintBadge = document.getElementById('topBarHintBadge');
         
         if (!topBarHint || !topBarHintTitle || !topBarHintDetail) return;
         
         const currentDay = day || this.navigation.currentDay;
         let title = 'Today: Preparation';
         let detail = 'Tap a day to see port highlights and all-aboard times.';
         let badge = 'LIVE';
         
         if (currentDay !== 'all') {
         const dayNumber = parseInt(currentDay);
         const dayNames = [
            '', // Index 0 not used
            'Day 1: Port Canaveral',
            'Day 2: Cruising',
            'Day 3: George Town',
            'Day 4: Falmouth',
            'Day 5: Cruising',
            'Day 6: Perfect Day at CocoCay',
            'Day 7: Return'
         ];
         
         if (dayNumber >= 1 && dayNumber <= 7) {
            title = dayNames[dayNumber];
            
            // Add specific details for each day
            const dayDetails = {
                1: 'Depart Port Canaveral at 2:00 PM',
                2: 'Cruising day with onboard highlights',
                3: 'George Town, Grand Cayman gangway 11:00 AM - 5:15 PM',
                4: 'Falmouth, Jamaica gangway 8:30 AM - 4:30 PM',
                5: 'Cruising day for formal night and gala',
                6: 'Perfect Day at CocoCay gangway 7:30 AM - 4:30 PM',
                7: 'Return morning, departure 7:30 AM'
            };
            
            detail = dayDetails[dayNumber] || detail;
            badge = 'DAY ' + dayNumber;
         }
         }
         
         topBarHintTitle.textContent = title;
         topBarHintDetail.textContent = detail;
         
         if (topBarHintBadge) {
         topBarHintBadge.textContent = badge;
         }
         
         // Show hint if not dismissed
         const hintDismissed = this.storage.get(CONFIG.STORAGE_KEYS.HINT_DISMISSED, false);
         if (!hintDismissed) {
         topBarHint.classList.remove('is-hidden');
         }
         }
         
         updateTopBarHintForDay(day) {
         this.updateTopBarHint(day);
         }
         
         hideTopBarHint() {
         const topBarHint = document.getElementById('topBarHint');
         if (topBarHint) {
         topBarHint.classList.add('is-hidden');
         }
         }
         
         toggleCriticalFilter(enable) {
         const criticalToggleBtn = document.getElementById('criticalToggleBtn');
         const criticalToggleStatus = document.getElementById('criticalToggleStatus');
         
         if (!criticalToggleBtn || !criticalToggleStatus) return;
         
         // Update button state
         criticalToggleBtn.setAttribute('aria-pressed', enable.toString());
         
         // Update status text
         criticalToggleStatus.textContent = enable ? 
         'Showing critical sections only' : 
         'Showing all sections';
         
         // Show/hide non-critical sections
         const nonCriticalSections = document.querySelectorAll('section:not(.section--critical)');
         nonCriticalSections.forEach(section => {
         if (enable) {
            section.style.display = 'none';
            section.setAttribute('aria-hidden', 'true');
         } else {
            section.style.display = 'block';
            section.removeAttribute('aria-hidden');
         }
         });
         
         // Save preference
         this.storage.set(CONFIG.STORAGE_KEYS.CRITICAL_FILTER, enable);
         }
         
         toggleCompactMode(enable) {
         const compactToggleBtn = document.getElementById('compactToggleBtn');
         const body = document.body;
         
         if (!compactToggleBtn) return;
         
         // Update button state
         compactToggleBtn.setAttribute('aria-pressed', enable.toString());
         
         // Toggle class on body
         body.classList.toggle('compact-mode', enable);
         
         // Save preference
         this.storage.set(CONFIG.STORAGE_KEYS.COMPACT_MODE, enable);
         }
         
         async openSearch() {
         const searchOverlay = document.getElementById('searchOverlay');
         const searchInput = document.getElementById('searchInput');
         
         if (!searchOverlay || !searchInput) return;
         
         // Open overlay
         searchOverlay.classList.add('open');
         searchOverlay.setAttribute('aria-hidden', 'false');
         
         // Focus input
         setTimeout(() => {
         searchInput.focus();
         searchInput.select();
         }, 100);
         
         // Load recent searches
         this.loadRecentSearches();
         
         // Update search results with popular searches
         this.clearSearchResults();
         
         this.ui.announceToScreenReader('Search opened. Type to search cruise information.');
         }
         
         async closeSearch() {
         const searchOverlay = document.getElementById('searchOverlay');
         const searchInput = document.getElementById('searchInput');
         
         if (!searchOverlay || !searchInput) return;
         
         // Clear input
         searchInput.value = '';
         
         // Clear results
         this.clearSearchResults();
         
         // Close overlay
         searchOverlay.classList.remove('open');
         searchOverlay.setAttribute('aria-hidden', 'true');
         
         // Return focus to search button
         const searchBtn = document.getElementById('searchBtn');
         if (searchBtn) {
         searchBtn.focus();
         }
         
         this.ui.announceToScreenReader('Search closed');
         }
         
         async performSearch(query) {
         const searchInput = document.getElementById('searchInput');
         const searchResults = document.getElementById('searchResults');
         
         if (!searchInput || !searchResults) return;
         
         // Show loading state
         this.showSearchLoading();
         
         try {
         // Perform search
         const searchResult = await this.search.search(query);
         
         // Display results
         this.displaySearchResults(searchResult);
         
         // Add to history
         this.search.addToHistory(query);
         
         // Update recent searches display
         this.loadRecentSearches();
         
         } catch (error) {
         this.errorHandler.log(error, 'CruiseCompanionApp.performSearch');
         this.showSearchError('Failed to perform search');
         }
         }
         
         showSearchLoading() {
         const searchResults = document.getElementById('searchResults');
         if (!searchResults) return;
         
         searchResults.innerHTML = `
         <div class="search-loading">
            <div class="loading-spinner"></div>
            <p>Searching cruise information...</p>
         </div>
         `;
         }
         
         showSearchError(message) {
         const searchResults = document.getElementById('searchResults');
         if (!searchResults) return;
         
         searchResults.innerHTML = `
         <div class="no-results">
            <p><i class="fas fa-exclamation-circle"></i> ${message}</p>
            <p>Please try again or check your connection.</p>
         </div>
         `;
         }
         
         displaySearchResults(searchResult) {
         const searchResults = document.getElementById('searchResults');
         if (!searchResults) return;
         
         if (searchResult.count === 0) {
         searchResults.innerHTML = `
            <div class="no-results">
                <p>No results found for "${searchResult.query}"</p>
                <p>Try different keywords or check the quick search chips above.</p>
            </div>
         `;
         return;
         }
         
         let resultsHTML = '';
         
         searchResult.results.forEach((result, index) => {
         const highlightedTitle = this.search.highlightText(result.title, searchResult.query);
         const highlightedContent = this.search.highlightText(
            result.content.substring(0, 200) + '...', 
            searchResult.query
         );
         
         resultsHTML += `
            <div class="search-result ${result.critical ? 'critical' : ''}" 
                 data-result-index="${index}"
                 data-target="${result.id}">
                <div class="search-result-header">
                    <div class="search-result-category">
                        <i class="fas fa-${this.getResultIcon(result.type)}"></i>
                        ${result.category || result.type}
                    </div>
                    ${result.critical ? '<span class="search-result-badge">Critical</span>' : ''}
                </div>
                <h3 class="search-result-title">${highlightedTitle}</h3>
                <p class="search-result-snippet">${highlightedContent}</p>
                <div class="search-result-footer">
                    <div class="search-result-priority">
                        <i class="fas fa-star"></i>
                        Priority: ${result.priority}/5
                    </div>
                    <button class="search-result-action" data-target="${result.id}">
                        <i class="fas fa-arrow-right"></i>
                        Go to ${result.type}
                    </button>
                </div>
            </div>
         `;
         });
         
         searchResults.innerHTML = resultsHTML;
         
         // Add click handlers to result items
         searchResults.querySelectorAll('.search-result').forEach(result => {
         result.addEventListener('click', (e) => {
            if (!e.target.closest('.search-result-action')) {
                const target = result.dataset.target;
                this.navigateToSearchResult(target);
                this.closeSearch();
            }
         });
         });
         
         // Add click handlers to action buttons
         searchResults.querySelectorAll('.search-result-action').forEach(button => {
         button.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = button.dataset.target;
            this.navigateToSearchResult(target);
            this.closeSearch();
         });
         });
         }
         
         getResultIcon(type) {
         const iconMap = {
         'section': 'file-alt',
         'feature': 'star',
         'port': 'umbrella-beach',
         'excursion': 'hiking',
         'activity': 'gamepad',
         'safety': 'shield-alt',
         'tool': 'mobile-alt',
         'service': 'wifi'
         };
         
         return iconMap[type] || 'search';
         }
         
         navigateToSearchResult(target) {
         // Try to find the target element
         const targetElement = document.getElementById(target);
         
         if (targetElement) {
         // Navigate to the section containing this element
         const section = targetElement.closest('section[id]');
         if (section) {
            this.navigation.navigateToSection(section.id);
            
            // Scroll to the specific element
            setTimeout(() => {
                DOMUtils.scrollToElement(targetElement, 100);
                
                // Highlight the element
                targetElement.classList.add('search-result-highlight');
                setTimeout(() => {
                    targetElement.classList.remove('search-result-highlight');
                }, 2000);
            }, 300);
         }
         } else {
         // Fallback: search in sections
         const sections = document.querySelectorAll('section[id]');
         for (const section of sections) {
            if (section.textContent.includes(target)) {
                this.navigation.navigateToSection(section.id);
                break;
            }
         }
         }
         }
         
         loadRecentSearches() {
         const recentSearchesGroup = document.getElementById('recentSearchesGroup');
         const recentSearchChips = document.getElementById('recentSearchChips');
         
         if (!recentSearchesGroup || !recentSearchChips) return;
         
         const history = this.search.history;
         
         if (history.length === 0) {
         recentSearchesGroup.setAttribute('hidden', 'true');
         return;
         }
         
         recentSearchesGroup.removeAttribute('hidden');
         
         let chipsHTML = '';
         history.slice(0, 5).forEach(query => {
         chipsHTML += `
            <button type="button" class="search-chip" data-query="${query}">
                <i class="fas fa-history"></i>
                ${query}
            </button>
         `;
         });
         
         recentSearchChips.innerHTML = chipsHTML;
         
         // Add click handlers to recent search chips
         recentSearchChips.querySelectorAll('.search-chip').forEach(chip => {
         chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            const searchInput = document.getElementById('searchInput');
            if (searchInput && query) {
                searchInput.value = query;
                this.performSearch(query);
            }
         });
         });
         }
         
         clearSearchResults() {
         const searchResults = document.getElementById('searchResults');
         if (!searchResults) return;
         
         searchResults.innerHTML = `
         <div class="no-results">
            <p>Type to search for cruise information…</p>
            <p>Try: "eMuster", "dining", "excursions", or "Wi-Fi"</p>
         </div>
         `;
         }
         
         openSectionDrawer() {
         const mobileMenu = document.getElementById('navMobileMenu');
         const overlay = document.getElementById('navOverlay');
         const closeBtn = document.getElementById('navMobileClose');
         
         if (!mobileMenu || !overlay) return;
         
         mobileMenu.classList.add('active');
         overlay.classList.add('active');
         mobileMenu.setAttribute('aria-hidden', 'false');
         
         document.body.style.overflow = 'hidden';
         document.documentElement.style.overflow = 'hidden';
         
         setTimeout(() => {
         closeBtn?.focus();
         }, 100);
         }
         
         closeSectionDrawer() {
         const mobileMenu = document.getElementById('navMobileMenu');
         const overlay = document.getElementById('navOverlay');
         
         if (!mobileMenu || !overlay) return;
         
         mobileMenu.classList.remove('active');
         overlay.classList.remove('active');
         mobileMenu.setAttribute('aria-hidden', 'true');
         
         document.body.style.overflow = '';
         document.documentElement.style.overflow = '';
         
         const mobileMenuBtn = document.getElementById('mobileMenuBtn');
         const mobileMoreBtn = document.getElementById('mobileMoreBtn');
         const lastFocused = mobileMenuBtn || mobileMoreBtn;
         if (lastFocused) {
         lastFocused.focus();
         }
         }
         
         printItinerary() {
         this.ui.showToast('Preparing itinerary for printing...', {
         type: 'info',
         duration: 2000
         });
         
         setTimeout(() => {
         window.print();
         }, 500);
         }
         
         updateOfflineButtonState() {
         if (this.offlineSaveInProgress) return;
         
         const isOfflineReady = this.storage.get(CONFIG.STORAGE_KEYS.OFFLINE_READY, false);
         if (isOfflineReady) {
         this.setOfflineButtonState('saved');
         } else {
         this.setOfflineButtonState('default');
         }
         }
         
         setOfflineButtonState(state, { progress = 0, total = 0 } = {}) {
         const offlineBtn = document.getElementById('offlineBtn');
         if (!offlineBtn) return;
         
         if (!offlineBtn.dataset.defaultLabel) {
         offlineBtn.dataset.defaultLabel = offlineBtn.innerHTML;
         }
         
         switch (state) {
            case 'saving': {
                const progressLabel = total > 0 ? ` (${progress}/${total})` : '';
                offlineBtn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving${progressLabel}`;
                offlineBtn.setAttribute('aria-busy', 'true');
                offlineBtn.setAttribute('aria-pressed', 'false');
                offlineBtn.disabled = true;
                break;
            }
            case 'saved':
                offlineBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Offline Ready';
                offlineBtn.removeAttribute('aria-busy');
                offlineBtn.setAttribute('aria-pressed', 'true');
                offlineBtn.disabled = false;
                break;
            case 'default':
            default:
                offlineBtn.innerHTML = offlineBtn.dataset.defaultLabel;
                offlineBtn.removeAttribute('aria-busy');
                offlineBtn.setAttribute('aria-pressed', 'false');
                offlineBtn.disabled = false;
                break;
         }
         }
         
         getOfflineAssetUrls() {
         const urls = new Set();
         const baseUrl = new URL('/', window.location.href);
         const currentUrl = new URL(window.location.href);
         currentUrl.hash = '';
         currentUrl.search = '';
         
         urls.add(currentUrl.href);
         urls.add(new URL('index.html', baseUrl).href);
         urls.add(new URL('sw.js', baseUrl).href);
         
         document.querySelectorAll('link[rel="stylesheet"], link[rel="icon"], script[src], img[src], source[src]').forEach((el) => {
         const attr = el.getAttribute('href') || el.getAttribute('src');
         if (!attr || attr.startsWith('data:')) return;
         urls.add(new URL(attr, window.location.href).href);
         });
         
         return Array.from(urls);
         }

         async fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
         const controller = new AbortController();
         const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

         try {
            return await fetch(url, { ...options, signal: controller.signal });
         } finally {
            window.clearTimeout(timeoutId);
         }
         }
         
         async cacheOfflineAssets(urls, onProgress) {
         const cache = await caches.open(CONFIG.OFFLINE_CACHE_NAME);
         let completed = 0;
         let cachedCount = 0;
         const failed = [];
         
         for (const url of urls) {
         try {
            const resolvedUrl = new URL(url, window.location.href);
            const isSameOrigin = resolvedUrl.origin === window.location.origin;
            const response = await this.fetchWithTimeout(resolvedUrl.href, {
                mode: isSameOrigin ? 'cors' : 'no-cors',
                cache: 'reload'
            });
            
            if (response.ok || response.type === 'opaque') {
                await cache.put(resolvedUrl.href, response.clone());
                cachedCount += 1;
            } else {
                failed.push(resolvedUrl.href);
            }
         } catch (error) {
            failed.push(url);
         }
         
         completed += 1;
         onProgress?.(completed, urls.length);
         }
         
         return { cachedCount, failed };
         }
         
         async saveOffline() {
         if (this.offlineSaveInProgress) return;
         
         if (!('serviceWorker' in navigator) || !('caches' in window)) {
         this.ui.showToast('Offline saving is not supported in this browser.', {
            type: 'error',
            duration: 4000
         });
         return;
         }
         
         const wasOfflineReady = this.storage.get(CONFIG.STORAGE_KEYS.OFFLINE_READY, false);
         if (!navigator.onLine && !wasOfflineReady) {
         this.ui.showToast('Connect to the internet to save for offline use.', {
            type: 'warning',
            duration: 4000
         });
         return;
         }
         
         const toastId = this.ui.showToast('Saving for offline access...', {
         type: 'info',
         duration: 0
         });
         
         this.offlineSaveInProgress = true;
         const assets = this.getOfflineAssetUrls();
         this.setOfflineButtonState('saving', { progress: 0, total: assets.length });
         
         try {
         await this.initializeServiceWorker();
         await navigator.serviceWorker.ready;
         
         const { cachedCount, failed } = await this.cacheOfflineAssets(
            assets,
            (completed, total) => {
                this.setOfflineButtonState('saving', { progress: completed, total });
            }
         );
         
         const isOfflineReady = cachedCount > 0;
         this.storage.set(CONFIG.STORAGE_KEYS.OFFLINE_READY, isOfflineReady);
         
         this.ui.hideToast(toastId);
         
         if (failed.length > 0) {
            this.ui.showToast(
                `Saved ${cachedCount} items for offline use. ${failed.length} file(s) could not be cached.`,
                {
                    type: 'warning',
                    duration: 5000
                }
            );
         } else {
            this.ui.showToast('Cruise guide saved for offline access!', {
                type: 'success',
                duration: 3000
            });
         }
         
         if (isOfflineReady) {
            this.setOfflineButtonState('saved');
         } else {
            this.setOfflineButtonState('default');
         }
         } catch (error) {
         console.error('Offline save failed:', error);
         this.storage.set(CONFIG.STORAGE_KEYS.OFFLINE_READY, false);
         this.ui.hideToast(toastId);
         this.ui.showToast('Unable to save offline. Please try again.', {
            type: 'error',
            duration: 4000
         });
         this.setOfflineButtonState('default');
         } finally {
         this.offlineSaveInProgress = false;
         }
         }
         
         async shareItinerary() {
         if (navigator.share) {
         try {
            await navigator.share({
                title: 'My Caribbean Cruise Itinerary',
                text: 'Check out my cruise itinerary for Adventure of the Seas!',
                url: window.location.href
            });
            
            this.ui.showToast('Itinerary shared successfully!', {
                type: 'success',
                duration: 3000
            });
         } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                this.ui.showToast('Could not share itinerary', {
                    type: 'error',
                    duration: 3000
                });
            }
         }
         } else {
         // Fallback: copy to clipboard
         try {
            await navigator.clipboard.writeText(window.location.href);
            this.ui.showToast('Link copied to clipboard!', {
                type: 'success',
                duration: 3000
            });
         } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.ui.showToast('Could not copy link', {
                type: 'error',
                duration: 3000
            });
         }
         }
         }
         
         handleError(error) {
         const errorObj = this.errorHandler.log(error, 'GlobalErrorHandler');
         
         // Show user-friendly error
         this.ui.showToast('An error occurred. The app may not function correctly.', {
         type: 'error',
         duration: 5000
         });
         
         // Log to console in development
         if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
         console.error('Application error:', errorObj);
         }
         
         return false;
         }
         
         handleOnlineStatus() {
         const isOnline = navigator.onLine;
         
         if (isOnline) {
         this.ui.showToast('Back online! Syncing updates...', {
            type: 'success',
            duration: 3000
         });
         
         // Refresh data that may have changed
         setTimeout(() => {
            this.weather.fetchWeather();
         }, 1000);
         } else {
         this.ui.showToast('You are offline. Some features may be limited.', {
            type: 'warning',
            duration: 5000
         });
         }
         }
         
         handleKeyboardShortcuts(e) {
         // Don't trigger shortcuts when typing in inputs
         if (e.target.tagName === 'INPUT' || 
         e.target.tagName === 'TEXTAREA' || 
         e.target.isContentEditable) {
         return;
         }
         
         // Check for modifier keys
         const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
         
         // Global shortcuts (with modifier)
         if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         this.openSearch();
         return;
         }
         
         if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         this.printItinerary();
         return;
         }
         
         // Navigation shortcuts (without modifier)
         if (!hasModifier) {
         switch (e.key) {
            case '1':
                e.preventDefault();
                if (this.navigation.availableSections.length) {
                  this.navigation.navigateToSection(this.navigation.availableSections[0]);
                }
                break;
            case '2':
                e.preventDefault();
                this.navigation.navigateToSection('operations');
                break;
            case '3':
                e.preventDefault();
                this.navigation.navigateToSection('itinerary');
                break;
            case '4':
                e.preventDefault();
                this.navigation.navigateToSection('rooms');
                break;
            case '5':
                e.preventDefault();
                this.navigation.navigateToSection('dining');
                break;
            case '6':
                e.preventDefault();
                this.navigation.navigateToSection('communication');
                break;
            case '7':
                e.preventDefault();
                this.navigation.navigateToSection('tips');
                break;
            case '8':
                e.preventDefault();
                this.navigation.navigateToSection('integrate');
                break;
            case '?':
                e.preventDefault();
                this.showKeyboardShortcutsHelp();
                break;
            case 'Escape':
                // Close any open modals or drawers
                this.closeSearch();
                this.closeSectionDrawer();
                break;
         }
         }
         
         // Day navigation (when on itinerary)
         if (this.navigation.currentSection === 'itinerary' && !hasModifier) {
         switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                const currentDayIndex = this.navigation.availableDays.indexOf(this.navigation.currentDay);
                const prevDay = currentDayIndex > 0 ? 
                    this.navigation.availableDays[currentDayIndex - 1] : 
                    this.navigation.availableDays[this.navigation.availableDays.length - 1];
                this.navigation.setCurrentDay(prevDay);
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                const currentDayIndex2 = this.navigation.availableDays.indexOf(this.navigation.currentDay);
                const nextDay = currentDayIndex2 < this.navigation.availableDays.length - 1 ? 
                    this.navigation.availableDays[currentDayIndex2 + 1] : 
                    this.navigation.availableDays[0];
                this.navigation.setCurrentDay(nextDay);
                break;
         }
         }
         }
         
         showKeyboardShortcutsHelp() {
         const shortcuts = [
         { key: 'Ctrl/Cmd + K', action: 'Open search' },
         { key: 'Ctrl/Cmd + P', action: 'Print itinerary' },
         { key: '1-8', action: 'Jump to sections 1-8' },
         { key: '?', action: 'Show this help' },
         { key: 'Escape', action: 'Close modals/search' },
         { key: '← →', action: 'Navigate days (on itinerary)' }
         ];
         
         let helpHTML = '<div class="keyboard-shortcuts">';
         helpHTML += '<h4>Keyboard Shortcuts</h4>';
         
         shortcuts.forEach(shortcut => {
         helpHTML += `
            <div class="shortcut-item">
                <span>${shortcut.action}</span>
                <kbd>${shortcut.key}</kbd>
            </div>
         `;
         });
         
         helpHTML += '</div>';
         
         this.ui.showToast(helpHTML, {
         type: 'info',
         duration: 8000,
         position: 'bottom-right'
         });
         }
         
         showErrorScreen(message) {
         const errorScreen = document.createElement('div');
         errorScreen.className = 'error-screen';
         errorScreen.innerHTML = `
         <div class="error-content">
            <h1>⚠️ Oops!</h1>
            <p>${message}</p>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
            <button id="refreshBtn" class="rc-btn">
                <i class="fas fa-redo"></i> Refresh Page
            </button>
         </div>
         `;
         
         document.body.appendChild(errorScreen);
         
         // Add refresh button handler
         const refreshBtn = document.getElementById('refreshBtn');
         if (refreshBtn) {
         refreshBtn.addEventListener('click', () => {
            window.location.reload();
         });
         }
         }
         
         destroy() {
         // Stop all managers
         this.countdown?.stop();
         this.countdown?.destroy();
         this.weather?.destroy();
         
         // Clean up UI components
         this.ui?.destroyAllComponents();
         
         // Remove event listeners
         window.removeEventListener('error', this.handleError);
         window.removeEventListener('unhandledrejection', this.handleError);
         window.removeEventListener('online', this.handleOnlineStatus);
         window.removeEventListener('offline', this.handleOnlineStatus);
         
         // Clear all intervals and timeouts
         // Note: This is a brute-force approach. In production, you'd track all timeouts.
         const highestTimeoutId = setTimeout(() => {}, 0);
         for (let i = 0; i < highestTimeoutId; i++) {
         clearTimeout(i);
         }
         
         this.isInitialized = false;
         console.log(`${CONFIG.APP_NAME} destroyed`);
         }
         }
         
         class MobileUXEnhancements {
         static init() {
         let lastTouchEnd = 0;
         document.addEventListener('touchend', (event) => {
         const now = Date.now();
         if (now - lastTouchEnd <= 300) {
         event.preventDefault();
         }
         lastTouchEnd = now;
         }, false);
         
         document.addEventListener('touchmove', (event) => {
         if (event.scale !== 1) {
         event.preventDefault();
         }
         }, { passive: false });
         
         this.addHapticFeedback();
         }
         
         static addHapticFeedback() {
         if ('vibrate' in navigator) {
         const elements = document.querySelectorAll('.btn--primary, .nav-item, .nav-bottom-item, .nav-primary-link, .nav-mobile-link, .fab');
         elements.forEach(element => {
         element.addEventListener('touchstart', () => {
         navigator.vibrate(10);
         });
         });
         }
         }
         }
         
         // ============================================================================
         // APPLICATION INITIALIZATION
         // ============================================================================
         
         // Create and initialize the application
         document.addEventListener('DOMContentLoaded', async () => {
         try {
         // Create app instance
         const app = new CruiseCompanionApp();
         
         // Make app globally available for debugging
         window.cruiseApp = app;
         
         // Initialize app
         await app.initialize();
         
         MobileUXEnhancements.init();
         
         // Add beforeunload handler for cleanup
         window.addEventListener('beforeunload', () => {
         app.destroy();
         });
         
         } catch (error) {
         console.error('Failed to initialize Cruise Companion:', error);
         
         // Show error screen
         const errorScreen = document.createElement('div');
         errorScreen.className = 'error-screen';
         errorScreen.innerHTML = `
         <div class="error-content">
            <h1>🚨 Critical Error</h1>
            <p>Failed to initialize the Cruise Companion application.</p>
            <p>Error: ${error.message}</p>
            <button onclick="window.location.reload()" class="rc-btn">
                <i class="fas fa-redo"></i> Reload Application
            </button>
         </div>
         `;
         
         document.body.appendChild(errorScreen);
         }
         });
         
         // Service Worker registration (simplified)
         if ('serviceWorker' in navigator) {
         window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(error => {
         console.log('ServiceWorker registration failed:', error);
         });
         });
         }
         
         // Add polyfills for older browsers
         if (!window.Promise) {
         console.warn('Promises not supported - loading polyfill');
         const script = document.createElement('script');
         script.src = 'https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js';
         document.head.appendChild(script);
         }
         
         // Console welcome message
         console.log(`
         ╔══════════════════════════════════════════════════════════╗
         ║                CRUISE COMPANION v2.0.0                   ║
         ║          Adventure of the Seas • Feb 14-20, 2026         ║
         ║                                                          ║
         ║   Type 'cruiseApp' in console for debugging controls.    ║
         ║   Press '?' to view keyboard shortcuts.                  ║
         ╚══════════════════════════════════════════════════════════╝
         `);
