/**
 * Cruise Companion - Shared Configuration
 * 
 * Centralized configuration for cruise metadata, storage keys, and app settings.
 * This file serves as the single source of truth for cruise-specific data.
 * 
 * Import this in page-specific scripts (index.js, itinerary.js, etc.) to ensure
 * consistency across the application.
 * 
 * Location: js/config.js
 */

export const CONFIG = {
    // Application
    APP_NAME: 'Cruise Companion',
    APP_VERSION: '2.0.0',
    
    // Cruise Details - Single source of truth
    CRUISE_DATE: '2026-02-14T14:00:00-05:00',
    CRUISE_DURATION: 6,
    SHIP_NAME: 'Adventure of the Seas',
    SAILING_NUMBER: '12345678',
    MUSTER_STATION: 'F6',
    EMBARKATION_TIME: '2:00 PM',
    
    // Ports - Authoritative port list
    PORTS: [
        { 
            id: 'georgetown', 
            name: 'George Town, Grand Cayman', 
            day: 3, 
            arrival: '11:00 AM', 
            departure: '5:15 PM', 
            latitude: 19.2866, 
            longitude: -81.3744 
        },
        { 
            id: 'falmouth', 
            name: 'Falmouth, Jamaica', 
            day: 4, 
            arrival: '8:30 AM', 
            departure: '4:30 PM', 
            latitude: 18.4937, 
            longitude: -77.6559 
        },
        { 
            id: 'cococay', 
            name: 'Perfect Day at CocoCay', 
            day: 6, 
            arrival: '7:30 AM', 
            departure: '4:30 PM', 
            latitude: 25.8186, 
            longitude: -77.9520 
        }
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
    
    // Storage Keys - Centralized to avoid conflicts
    STORAGE_KEYS: {
        PREFERENCES: 'cruise_preferences_v2',
        SEARCH_HISTORY: 'cruise_search_history_v2',
        COMPACT_MODE: 'cruise_compact_mode',
        CRITICAL_FILTER: 'cruise_critical_filter',
        HINT_DISMISSED: 'cruise_hint_dismissed',
        DECK_PLANS: 'cruise_deck_plans_v1',
        OFFLINE_READY: 'cruise_offline_ready_v1',
        // Page-specific keys (for reference - actual usage in page scripts)
        NOTES: 'cruiseNotes',
        SCROLL_POSITION: 'itineraryScrollPosition',
        WELCOME_SHOWN: 'itinerary-welcome-shown'
    },
    
    // API Endpoints
    // Note: Weather service currently uses Open-Meteo directly
    // These are placeholders for future API integration
    API_ENDPOINTS: {
        WEATHER: 'https://api.example.com/weather',  // Placeholder - not currently used
        UPDATES: 'https://api.example.com/cruise-updates',
        SYNC: 'https://api.example.com/sync'
    }
};

// Export cruise metadata separately for convenience
export const CRUISE_METADATA = {
    ship: CONFIG.SHIP_NAME,
    sailing: CONFIG.SAILING_NUMBER,
    startDate: CONFIG.CRUISE_DATE,
    duration: CONFIG.CRUISE_DURATION,
    ports: CONFIG.PORTS,
    musterStation: CONFIG.MUSTER_STATION,
    embarkationTime: CONFIG.EMBARKATION_TIME
};
