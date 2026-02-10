/**
 * Cruise Companion - Storage Manager Module
 * 
 * Wraps localStorage with availability checks, error handling, and app-specific
 * convenience methods. Can be imported by any page script or module.
 */

import { CONFIG } from './config.js';
import { ErrorHandler } from './errors.js';

// Note: This file is in js/ directory

export class StorageManager {
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
            Object.values(CONFIG.STORAGE_KEYS).forEach((key) => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            this.errorHandler.log(e, 'StorageManager.clear');
            return false;
        }
    }
    
    // Application-specific convenience methods
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
