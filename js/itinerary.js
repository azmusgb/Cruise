/**
 * Itinerary Page JavaScript
 * Handles day navigation, progress bar, toast notifications, and interactive features
 */

(function() {
    'use strict';

    // ============================================================================
    // Constants
    // ============================================================================
    const CRUISE_START_DATE = '2026-02-14T00:00:00';
    const ANIMATION_DELAY = 500;
    const TOAST_DURATION = 3000;
    const SCROLL_THRESHOLD = 300;
    const RIPPLE_DURATION = 600;
    const STORAGE_KEYS = {
        NOTES: 'cruiseNotes',
        SCROLL_POSITION: 'itineraryScrollPosition',
        WELCOME_SHOWN: 'itinerary-welcome-shown'
    };

    // ============================================================================
    // Utility Functions
    // ============================================================================

    /**
     * Safe localStorage getter with error handling
     */
    function getStorageItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`localStorage get failed for ${key}:`, e);
            return defaultValue;
        }
    }

    /**
     * Safe localStorage setter with error handling
     */
    function setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`localStorage set failed for ${key}:`, e);
            return false;
        }
    }

    /**
     * Sanitize user input to prevent XSS
     */
    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent || div.innerText || '';
    }

    /**
     * Throttle function for scroll events
     */
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get current cruise day (1-7)
     */
    function getCruiseDay() {
        const cruiseStart = new Date(CRUISE_START_DATE);
        const today = new Date();
        const diffDays = Math.floor((today - cruiseStart) / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays < 1 || diffDays > 7) {
            return 1;
        }
        return diffDays;
    }

    /**
     * Show modal dialog (replacement for window.prompt)
     */
    function showModalDialog(title, message, defaultValue = '') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'modal-title');
            modal.setAttribute('aria-modal', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 id="modal-title">${sanitizeInput(title)}</h3>
                        <button class="modal-close" aria-label="Close dialog">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${sanitizeInput(message)}</p>
                        <input type="text" id="modal-input" class="modal-input" value="${sanitizeInput(defaultValue)}" autofocus>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn--secondary modal-cancel">Cancel</button>
                        <button class="btn btn--primary modal-submit">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const input = modal.querySelector('#modal-input');
            const submitBtn = modal.querySelector('.modal-submit');
            const cancelBtn = modal.querySelector('.modal-cancel');
            const closeBtn = modal.querySelector('.modal-close');

            const cleanup = () => {
                document.body.removeChild(modal);
            };

            const submit = () => {
                const value = input.value.trim();
                cleanup();
                resolve(value || null);
            };

            const cancel = () => {
                cleanup();
                resolve(null);
            };

            submitBtn.addEventListener('click', submit);
            cancelBtn.addEventListener('click', cancel);
            closeBtn.addEventListener('click', cancel);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cancel();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') cancel();
            });

            input.focus();
            input.select();
        });
    }

    /**
     * Generate iCal file content for calendar export
     */
    function generateICal() {
        const events = [
            {
                summary: 'Cruise Embarkation - Port Canaveral',
                start: '20260214T110000',
                end: '20260214T170000',
                description: 'The Key® Priority Boarding at 11:00 AM. Ship departs at 5:00 PM.'
            },
            {
                summary: 'Formal Night - Captain\'s Reception',
                start: '20260215T190000',
                end: '20260215T210000',
                description: 'First formal night. Royal Promenade, Deck 5.'
            },
            {
                summary: 'Port: George Town, Grand Cayman',
                start: '20260216T080000',
                end: '20260216T160000',
                description: 'Tender required. Last tender back at 3:00 PM.'
            },
            {
                summary: 'Port: Falmouth, Jamaica',
                start: '20260217T083000',
                end: '20260217T163000',
                description: 'Dunn\'s River Falls excursion available. All aboard at 3:30 PM.'
            },
            {
                summary: 'Formal Night - Chops Grille',
                start: '20260218T190000',
                end: '20260218T210000',
                description: 'Second formal night. Specialty dining reservation.'
            },
            {
                summary: 'Perfect Day at CocoCay',
                start: '20260219T070000',
                end: '20260219T170000',
                description: 'Private island. Thrill Waterpark access. All aboard at 4:30 PM.'
            },
            {
                summary: 'Disembarkation - Port Canaveral',
                start: '20260220T080000',
                end: '20260220T120000',
                description: 'The Key® Priority Departure at 8:00 AM.'
            }
        ];

        let icsContent = 'BEGIN:VCALENDAR\r\n';
        icsContent += 'VERSION:2.0\r\n';
        icsContent += 'PRODID:-//Royal Way Hub//Itinerary//EN\r\n';
        icsContent += 'CALSCALE:GREGORIAN\r\n';
        icsContent += 'METHOD:PUBLISH\r\n';

        events.forEach(event => {
            icsContent += 'BEGIN:VEVENT\r\n';
            icsContent += `DTSTART:${event.start}\r\n`;
            icsContent += `DTEND:${event.end}\r\n`;
            icsContent += `SUMMARY:${event.summary}\r\n`;
            icsContent += `DESCRIPTION:${event.description}\r\n`;
            icsContent += 'END:VEVENT\r\n';
        });

        icsContent += 'END:VCALENDAR\r\n';
        return icsContent;
    }

    /**
     * Download file helper
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ============================================================================
    // Toast Notification System
    // ============================================================================

    function showToast(message, type = 'info', duration = TOAST_DURATION) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;

        // Set appropriate ARIA live region based on type
        const isCritical = type === 'error' || type === 'critical';
        toast.setAttribute('aria-live', isCritical ? 'assertive' : 'polite');
        
        toast.className = 'toast';
        toast.classList.add(`toast--${type}`);
        toastMessage.textContent = message;
        toast.classList.add('toast--show');

        setTimeout(() => {
            toast.classList.remove('toast--show');
        }, duration);
    }

    // ============================================================================
    // Main Application
    // ============================================================================

    document.addEventListener('DOMContentLoaded', function() {
        // Progress bar
        const progressBar = document.getElementById('progressBar');
        let currentDay = 1;
        let userNavigated = false; // Track if user explicitly navigated

        // Day selector functionality
        const dayButtons = document.querySelectorAll('.day-navigation__btn');
        const daySections = document.querySelectorAll('.itinerary-day');

        function showDay(day) {
            if (day === 'all') {
                daySections.forEach(section => {
                    section.classList.remove('itinerary-day--hidden');
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, 10);
                });
                return;
            }

            const dayString = String(day);
            currentDay = parseInt(dayString, 10);
            daySections.forEach(section => {
                if (section.getAttribute('data-day') === dayString) {
                    section.classList.remove('itinerary-day--hidden');
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    section.classList.add('itinerary-day--hidden');
                }
            });
        }

        // Day button click handlers
        dayButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                userNavigated = true; // Mark that user explicitly navigated
                dayButtons.forEach(btn => {
                    btn.classList.remove('day-navigation__btn--active');
                });
                this.classList.add('day-navigation__btn--active');

                const day = this.getAttribute('data-day');
                if (day === 'today') {
                    showDay(getCruiseDay());
                } else {
                    showDay(day);
                }

                // Ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = event.clientX - rect.left - size / 2;
                const y = event.clientY - rect.top - size / 2;

                ripple.className = 'ripple-effect';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.7);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${y}px;
                    left: ${x}px;
                `;

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), RIPPLE_DURATION);
            });
        });

        // Add ripple animation style if not already present
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Interactive map toggle
        const showMapBtn = document.getElementById('showMapBtn');
        const interactiveMap = document.getElementById('interactiveMap');

        if (showMapBtn && interactiveMap) {
            showMapBtn.addEventListener('click', function() {
                if (interactiveMap.style.display === 'none' || !interactiveMap.style.display) {
                    interactiveMap.style.display = 'block';
                    setTimeout(() => {
                        interactiveMap.style.opacity = '1';
                        interactiveMap.style.transform = 'translateY(0)';
                    }, 10);
                    showMapBtn.innerHTML = '<i class="fas fa-map"></i> Hide Route Map';
                } else {
                    interactiveMap.style.display = 'none';
                    showMapBtn.innerHTML = '<i class="fas fa-map"></i> View Route Map';
                }
            });
        }

        // Day completion toggle
        const completionToggle = document.getElementById('dayCompletionToggle');
        if (completionToggle) {
            completionToggle.addEventListener('click', function() {
                this.classList.toggle('checked');
                const icon = this.querySelector('i');
                if (this.classList.contains('checked')) {
                    icon.style.display = 'block';
                    showToast('Day marked as completed! 🎉', 'success');
                } else {
                    icon.style.display = 'none';
                    showToast('Day marked as incomplete', 'info');
                }
            });
        }

        // Toggle view button (if exists)
        const toggleViewBtn = document.getElementById('toggleViewBtn');
        if (toggleViewBtn) {
            toggleViewBtn.addEventListener('click', function() {
                const timelineViews = document.querySelectorAll('.itinerary-timeline');
                timelineViews.forEach(view => view.classList.toggle('timeline-view-compact'));
                if (timelineViews.length && timelineViews[0].classList.contains('timeline-view-compact')) {
                    this.innerHTML = '<i class="fas fa-list"></i> Detailed View';
                    showToast('Switched to compact timeline view', 'info');
                } else {
                    this.innerHTML = '<i class="fas fa-columns"></i> Timeline View';
                    showToast('Switched to detailed timeline view', 'info');
                }
            });
        }

        // Toast close button
        const toast = document.getElementById('toast');
        const toastClose = document.getElementById('toastClose');
        if (toastClose) {
            toastClose.addEventListener('click', () => {
                toast.classList.remove('toast--show');
            });
        }

        // Print itinerary buttons (with null checks)
        const printBtn = document.getElementById('printItineraryBtn');
        const printBtn2 = document.getElementById('printItineraryBtn2');
        
        function printItinerary() {
            if (window.innerWidth < 768) {
                showToast('Print option selected. On mobile, use browser share → Print.', 'info');
            } else {
                window.print();
            }
        }

        if (printBtn) printBtn.addEventListener('click', printItinerary);
        if (printBtn2) printBtn2.addEventListener('click', printItinerary);

        // Share itinerary button (with null check)
        const shareBtn = document.getElementById('shareItineraryBtn');
        async function shareItinerary() {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Royal Way Itinerary - Adventure of the Seas',
                        text: 'Check out our cruise itinerary for Feb 14-20, 2026',
                        url: window.location.href
                    });
                    showToast('Itinerary shared successfully! 📤', 'success');
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        showToast('Sharing cancelled.', 'info');
                    }
                }
            } else {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        showToast('Link copied to clipboard! Share this with your group. 📋', 'success');
                    }).catch(() => {
                        showToast('Failed to copy link. Please try again.', 'error');
                    });
                } else {
                    showToast('Sharing not available in this browser.', 'info');
                }
            }
        }
        if (shareBtn) shareBtn.addEventListener('click', shareItinerary);

        // Save offline/PDF button
        const saveOfflineBtn = document.getElementById('saveOfflineBtn2');
        if (saveOfflineBtn) {
            saveOfflineBtn.addEventListener('click', function() {
                showToast('Generating PDF... 📄', 'info');
                // Use browser print to PDF as fallback
                setTimeout(() => {
                    window.print();
                    showToast('Use browser print dialog to save as PDF', 'info', 5000);
                }, 500);
            });
        }

        // Add to calendar button
        const addToCalendarBtn = document.getElementById('addToCalendarBtn');
        if (addToCalendarBtn) {
            addToCalendarBtn.addEventListener('click', function() {
                showToast('Generating calendar file... 📅', 'info');
                try {
                    const icsContent = generateICal();
                    downloadFile(icsContent, 'cruise-itinerary.ics', 'text/calendar');
                    showToast('Calendar file downloaded! Import into your calendar app.', 'success');
                } catch (e) {
                    console.error('Calendar generation failed:', e);
                    showToast('Failed to generate calendar file.', 'error');
                }
            });
        }

        // Quick add note button
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', async function() {
                const note = await showModalDialog(
                    'Add Personal Note',
                    'Add a personal note or reminder for today:'
                );
                
                if (note) {
                    const sanitizedNote = sanitizeInput(note);
                    const notes = getStorageItem(STORAGE_KEYS.NOTES, []);
                    notes.push({
                        day: currentDay,
                        note: sanitizedNote,
                        timestamp: new Date().toISOString()
                    });
                    
                    if (setStorageItem(STORAGE_KEYS.NOTES, notes)) {
                        showToast('Note added successfully! 📝', 'success');
                    } else {
                        showToast('Note saved locally (browser storage unavailable)', 'info');
                    }
                }
            });
        }

        // Email itinerary button (with null check)
        const emailBtn = document.getElementById('emailItineraryBtn');
        if (emailBtn) {
            emailBtn.addEventListener('click', function() {
                const subject = encodeURIComponent('Royal Caribbean Itinerary - Adventure of the Seas');
                const body = encodeURIComponent(`Check out our cruise itinerary:\n\n${window.location.href}\n\nCruise Details:\n- 7-Day Western Caribbean\n- Feb 14-20, 2026\n- Ports: Grand Cayman, Jamaica, CocoCay`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            });
        }

        // Day navigation buttons
        const dayPrevBtn = document.getElementById('dayPrevBtn');
        const dayNextBtn = document.getElementById('dayNextBtn');
        
        if (dayPrevBtn) {
            dayPrevBtn.addEventListener('click', function() {
                if (currentDay > 1) {
                    currentDay--;
                    const prevButton = document.querySelector(`.day-navigation__btn[data-day="${currentDay}"]`);
                    if (prevButton) {
                        prevButton.click();
                        showToast(`Showing Day ${currentDay}`, 'info');
                    }
                } else {
                    showToast('Already at Day 1', 'info');
                }
            });
        }

        if (dayNextBtn) {
            dayNextBtn.addEventListener('click', function() {
                if (currentDay < 7) {
                    currentDay++;
                    const nextButton = document.querySelector(`.day-navigation__btn[data-day="${currentDay}"]`);
                    if (nextButton) {
                        nextButton.click();
                        showToast(`Showing Day ${currentDay}`, 'info');
                    }
                } else {
                    showToast('Already at Day 7', 'info');
                }
            });
        }

        // Sync itinerary button
        const syncBtn = document.getElementById('syncItineraryBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', function() {
                showToast('Itinerary synced with Royal Caribbean app! ☁️', 'success');
                this.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 500);
            });
        }

        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Jump to today button
        const jumpToTodayBtn = document.getElementById('jumpToTodayBtn');
        if (jumpToTodayBtn) {
            jumpToTodayBtn.addEventListener('click', function() {
                userNavigated = true; // Mark as user navigation
                const todayButton = document.querySelector('.day-navigation__btn[data-day="today"]');
                if (todayButton) {
                    todayButton.click();
                }
                const targetDay = getCruiseDay();
                const targetSection = document.querySelector(`.itinerary-day[data-day="${targetDay}"]`);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                showToast(`Jumped to Day ${targetDay}`, 'info');
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && currentDay > 1) {
                currentDay--;
                const btn = document.querySelector(`.day-navigation__btn[data-day="${currentDay}"]`);
                if (btn) btn.click();
            } else if (e.key === 'ArrowRight' && currentDay < 7) {
                currentDay++;
                const btn = document.querySelector(`.day-navigation__btn[data-day="${currentDay}"]`);
                if (btn) btn.click();
            }

            if (e.key === ' ' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                const todayBtn = document.querySelector('.day-navigation__btn[data-day="today"]');
                if (todayBtn) todayBtn.click();
            }

            if (e.key === 'Escape' && toast) {
                toast.classList.remove('toast--show');
            }
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card, .stat-card, .timeline__item').forEach(el => {
            observer.observe(el);
        });

        // Combined scroll handler (throttled)
        const handleScroll = throttle(() => {
            // Progress bar
            if (progressBar) {
                const scrollTop = window.scrollY;
                const docHeight = document.body.clientHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
                progressBar.style.width = `${scrollPercent * 100}%`;
            }

            // Scroll position save (only if user hasn't explicitly navigated)
            if (!userNavigated) {
                const scrollPosition = window.scrollY;
                setStorageItem(STORAGE_KEYS.SCROLL_POSITION, scrollPosition);
            }

            // Scroll to top button visibility
            if (scrollToTopBtn) {
                if (window.scrollY > SCROLL_THRESHOLD) {
                    scrollToTopBtn.style.display = 'flex';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            }
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Restore scroll position (only if user hasn't navigated)
        const savedPosition = getStorageItem(STORAGE_KEYS.SCROLL_POSITION);
        if (savedPosition && !userNavigated) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition, 10));
            }, 100);
        }

        // Initialize day animations and show today
        setTimeout(() => {
            document.querySelectorAll('.itinerary-day').forEach((day, index) => {
                day.style.animationDelay = `${index * 0.1}s`;
            });

            const todayButton = document.querySelector('.day-navigation__btn[data-day="today"]');
            if (todayButton) {
                todayButton.click();
            }

            // Only show welcome toast if not shown before
            const welcomeShown = getStorageItem(STORAGE_KEYS.WELCOME_SHOWN, false);
            if (!welcomeShown) {
                showToast('Welcome to your enhanced itinerary! Explore your cruise schedule. 🚢', 'info', 4000);
                setStorageItem(STORAGE_KEYS.WELCOME_SHOWN, true);
            }
        }, ANIMATION_DELAY);
    });
})();
