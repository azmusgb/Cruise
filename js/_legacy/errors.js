/**
 * Cruise Companion - Error Handler Module
 * 
 * Centralized error handling with logging, analytics integration, and user-friendly
 * error display. Can be imported by any page script or module.
 */

import { CONFIG } from './config.js';

// Note: This file is in js/ directory

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
    }
    
    log(error, context = 'Unknown') {
        const safeError = error ?? new Error('Unknown error');
        const message = safeError instanceof Error
            ? safeError.message
            : (typeof safeError?.message === 'string' && safeError.message) || String(safeError);
        const stack = safeError instanceof Error
            ? safeError.stack
            : (typeof safeError?.stack === 'string' ? safeError.stack : undefined);

        const errorObj = {
            timestamp: new Date().toISOString(),
            context: context,
            message,
            stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error(`[${context}]`, safeError);
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
        const content = document.createElement('div');
        content.className = 'error-content';

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';

        const text = document.createElement('span');
        text.textContent = String(message ?? 'Something went wrong.');

        const close = document.createElement('button');
        close.className = 'error-close';
        close.setAttribute('aria-label', 'Close error message');

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fas fa-times';
        close.appendChild(closeIcon);

        content.appendChild(icon);
        content.appendChild(text);
        content.appendChild(close);
        errorDiv.appendChild(content);
        
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
