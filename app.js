/* ==========================================================================
   Mission Control 3.0 JS — AI Enhanced with Real-time Features
   ========================================================================== */

// Enhanced utilities with modern JavaScript features
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const on = (el, event, handler, options) => {
  if (!el) return;
  el.addEventListener(event, handler, options);
};

// Enhanced debounce utility
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

// Enhanced toast system with multiple types and auto-hide
class ToastSystem {
  constructor() {
    this.container = $('#toast-container');
    this.template = $('#toast');
    this.queue = [];
    this.isShowing = false;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = this.template.cloneNode(true);
    toast.id = `toast-${Date.now()}`;
    toast.classList.add(`toast--${type}`);
    toast.setAttribute('aria-hidden', 'false');
    
    const titleMap = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };

    $('.toast__title', toast).textContent = titleMap[type] || 'Notification';
    $('.toast__message', toast).textContent = message;
    
    const closeBtn = $('.toast__close', toast);
    on(closeBtn, 'click', () => this.hide(toast));
    
    this.container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast--show'), 10);
    
    const hideTimer = setTimeout(() => this.hide(toast), duration);
    toast._hideTimer = hideTimer;
    
    return toast;
  }

  hide(toast) {
    if (!toast) return;
    clearTimeout(toast._hideTimer);
    toast.classList.remove('toast--show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }
}

// Global toast instance
const toast = new ToastSystem();

// Performance optimization utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 60,
      memory: null,
      connection: 'unknown'
    };
    this.lastTime = performance.now();
    this.frames = 0;
  }

  init() {
    if ('performance' in window) {
      setInterval(() => this.updateFPS(), 1000);
    }
    
    if ('connection' in navigator) {
      this.metrics.connection = navigator.connection.effectiveType;
      on(navigator.connection, 'change', () => {
        this.metrics.connection = navigator.connection.effectiveType;
        document.dispatchEvent(new CustomEvent('perf:connection', { 
          detail: this.metrics.connection 
        }));
      });
    }
  }

  updateFPS() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.frames++;
    
    if (delta >= 1000) {
      this.metrics.fps = Math.round((this.frames * 1000) / delta);
      this.frames = 0;
      this.lastTime = now;
      
      // Auto-enable reduced effects if FPS drops
      if (this.metrics.fps < 30 && !document.documentElement.classList.contains('reduced-effects')) {
        document.documentElement.classList.add('reduced-effects');
        toast.show('Reduced effects enabled for better performance', 'info');
      }
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Enhanced theme system with system preference detection
class ThemeSystem {
  constructor() {
    this.store = new Store('mc-theme-v3');
    this.root = document.documentElement;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  init() {
    on($('#toggle-theme'), 'click', () => this.cycle());
    on(this.mediaQuery, 'change', () => {
      if (this.store.get('theme') === 'auto') {
        this.apply('auto');
      }
    });
    
    this.apply(this.store.get('theme', 'auto'));
  }

  apply(mode) {
    this.root.classList.remove('theme--light', 'theme--dark');
    
    if (mode === 'auto') {
      const systemPref = this.mediaQuery.matches ? 'dark' : 'light';
      this.root.classList.add(`theme--${systemPref}`);
    } else if (mode === 'light' || mode === 'dark') {
      this.root.classList.add(`theme--${mode}`);
    }
    
    this.store.set('theme', mode);
    
    // Update theme color meta tag
    const themeColor = mode === 'dark' ? '#0f172a' : '#f8fafc';
    $('meta[name="theme-color"]').setAttribute('content', themeColor);
    
    toast.show(`Theme: ${mode}`, 'info');
  }

  cycle() {
    const cur = this.store.get('theme', 'auto');
    const modes = ['auto', 'dark', 'light'];
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    this.apply(next);
  }
}

// Enhanced effects system with intelligent detection
class EffectsSystem {
  constructor() {
    this.store = new Store('mc-effects-v2');
    this.root = document.documentElement;
    this.performance = new PerformanceMonitor();
  }

  init() {
    this.toggle = $('#effects-mode');
    if (!this.toggle) return;
    
    on(this.toggle, 'change', () => this.toggleEffects(this.toggle.checked));
    
    // Auto-detect conditions
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = navigator.connection;
    const saveData = connection ? connection.saveData : false;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    const shouldReduce = prefersReduced || saveData || isMobile || 
                       this.performance.getMetrics().connection === 'slow-2g' ||
                       this.performance.getMetrics().connection === '2g';
    
    if (shouldReduce) {
      this.toggle.checked = true;
      this.toggleEffects(true);
    } else {
      const stored = this.store.get('reduced', false);
      this.toggle.checked = stored;
      this.toggleEffects(stored);
    }
  }

  toggleEffects(enabled) {
    this.root.classList.toggle('reduced-effects', enabled);
    this.store.set('reduced', enabled);
    
    // Dispatch event for other components to react
    document.dispatchEvent(new CustomEvent('effects:toggled', { 
      detail: { reduced: enabled } 
    }));
    
    toast.show(`Performance mode: ${enabled ? 'on' : 'off'}`, 'info');
  }
}

// AI Assistant System
class AIAssistant {
  constructor() {
    this.panel = $('#ai-panel');
    this.toggle = $('#ai-toggle');
    this.messages = $('#ai-messages');
    this.input = $('#ai-input');
    this.sendBtn = $('#ai-send');
    this.badge = $('#ai-badge');
    this.conversation = [];
  }

  init() {
    if (!this.panel || !this.toggle) return;

    on(this.toggle, 'click', () => this.togglePanel());
    on($('#ai-close'), 'click', () => this.closePanel());
    on(this.sendBtn, 'click', () => this.sendMessage());
    on(this.input, 'keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Welcome message
    this.addMessage('assistant', 'Hello! I\'m your Cruise AI Assistant. Ask me anything about your itinerary, tasks, or cruise planning!');
    
    // Simulate incoming notifications
    setInterval(() => {
      const notifications = Math.floor(Math.random() * 3);
      if (notifications > 0 && this.panel.getAttribute('aria-hidden') === 'true') {
        this.badge.textContent = notifications;
        this.badge.style.display = 'inline-block';
      }
    }, 30000);
  }

  togglePanel() {
    const isHidden = this.panel.getAttribute('aria-hidden') === 'true';
    this.panel.setAttribute('aria-hidden', !isHidden);
    this.toggle.setAttribute('aria-expanded', isHidden);
    
    if (isHidden) {
      this.input.focus();
      this.badge.style.display = 'none';
      this.badge.textContent = '0';
    }
  }

  closePanel() {
    this.panel.setAttribute('aria-hidden', 'true');
    this.toggle.setAttribute('aria-expanded', 'false');
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    this.addMessage('user', message);
    this.input.value = '';
    
    // Show typing indicator
    const typing = this.addMessage('assistant', '...', true);
    
    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const response = this.generateResponse(message);
      typing.remove();
      this.addMessage('assistant', response);
    }, 1000 + Math.random() * 2000);
  }

  addMessage(role, content, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-message--${role} ${isTyping ? 'ai-message--typing' : ''}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message__content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    this.messages.appendChild(messageDiv);
    this.messages.scrollTop = this.messages.scrollHeight;
    
    this.conversation.push({ role, content, timestamp: new Date() });
    
    return messageDiv;
  }

  generateResponse(message) {
    const lower = message.toLowerCase();
    const responses = {
      muster: 'Muster drill is critical. Complete it immediately after boarding. Your stations are D22 for most of your group, and A2 for Karin.',
      dining: 'Your 3-night specialty dining package includes Chops Grille, Giovanni\'s Table, and Izumi. Book these on embarkation day via the Royal app.',
      cococay: 'Perfect Day at CocoCay: Disembark by 8 AM for prime spots. Your drink package works here. Don\'t miss the Oasis Lagoon pool!',
      packing: 'Essential items: swimwear, sunscreen, medication, SeaPass, passport, comfortable shoes. Pack a "go bag" for each day.',
      weather: 'Current forecast: Mostly sunny with highs around 82°F. Evening breezes can be cool. Pack a light jacket.',
      tasks: `You have ${$$('.task:not(.task--done)').length} pending tasks. Focus on critical items first, then recommendations.`,
      itinerary: 'Your itinerary: Day 1 - Departure, Day 2 - At Sea, Day 3 - Grand Cayman, Day 4 - Jamaica, Day 5 - At Sea, Day 6 - CocoCay, Day 7 - Return.',
      kids: 'Adventure Ocean is available for kids ages 3-17. Check the daily schedule for themed activities and evening programs.'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lower.includes(key)) {
        return response;
      }
    }

    // Default responses
    const defaults = [
      'I can help with muster information, dining reservations, port guidance, packing tips, and task management.',
      'For detailed itinerary information, check the Smart Itinerary panel in your dashboard.',
      'Remember to complete critical tasks (marked with 🔴) as soon as possible.',
      'Your designated meeting point is R Bar on Deck 5 Promenade at 6:45 PM daily.',
      'For urgent matters, contact Guest Services on Deck 5 or dial 7000 from your cabin phone.'
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }
}

// Real-time Sync System with Offline Support
class SyncSystem {
  constructor() {
    this.store = new Store('mc-sync-v1');
    this.isOnline = navigator.onLine;
    this.lastSync = this.store.get('lastSync', null);
    this.pendingChanges = [];
  }

  init() {
    on(window, 'online', () => this.handleOnline());
    on(window, 'offline', () => this.handleOffline());
    
    // Periodic sync check
    setInterval(() => this.checkSync(), 30000);
    
    // Listen for data changes
    document.addEventListener('task:updated', (e) => this.queueChange('task', e.detail));
    document.addEventListener('progress:updated', (e) => this.queueChange('progress', e.detail));
    
    this.updateUI();
  }

  handleOnline() {
    this.isOnline = true;
    $('#offline-indicator').setAttribute('aria-hidden', 'true');
    toast.show('Back online. Syncing changes...', 'success');
    this.syncPending();
  }

  handleOffline() {
    this.isOnline = false;
    $('#offline-indicator').setAttribute('aria-hidden', 'false');
    toast.show('Working offline. Changes will sync when connection is restored.', 'warning');
  }

  queueChange(type, data) {
    this.pendingChanges.push({ type, data, timestamp: Date.now() });
    this.store.set('pendingChanges', this.pendingChanges.slice(-50)); // Keep last 50 changes
  }

  async syncPending() {
    if (!this.isOnline || this.pendingChanges.length === 0) return;
    
    // In a real app, this would send to a server
    // For now, we'll simulate sync
    toast.show(`Syncing ${this.pendingChanges.length} changes...`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.pendingChanges = [];
    this.store.set('pendingChanges', []);
    this.lastSync = new Date().toISOString();
    this.store.set('lastSync', this.lastSync);
    
    toast.show('Sync complete', 'success');
    this.updateUI();
  }

  checkSync() {
    if (this.isOnline && this.pendingChanges.length > 0) {
      this.syncPending();
    }
    this.updateUI();
  }

  updateUI() {
    const syncStatus = $('#sync-status');
    const lastUpdated = $('#last-updated');
    const storageStatus = $('#storage-status');
    
    if (syncStatus) {
      syncStatus.textContent = this.isOnline ? 'Online' : 'Offline';
      syncStatus.className = `status-indicator status-indicator--${this.isOnline ? 'online' : 'offline'}`;
    }
    
    if (lastUpdated) {
      if (this.lastSync) {
        const timeAgo = this.getTimeAgo(new Date(this.lastSync));
        lastUpdated.textContent = timeAgo;
      } else {
        lastUpdated.textContent = 'Never';
      }
    }
    
    if (storageStatus) {
      const used = JSON.stringify(localStorage).length;
      const quota = 5 * 1024 * 1024; // 5MB estimate
      const percent = Math.round((used / quota) * 100);
      storageStatus.textContent = `${percent}% used`;
    }
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'just now';
  }
}

// Enhanced App State with real-time updates
class AppState {
  constructor() {
    this.itinerary = [
      { 
        day: 1, 
        date: '2026-02-14', 
        label: 'Sat, Feb 14', 
        port: 'Port Canaveral', 
        time: 'Depart 4:00 PM', 
        icon: '🚢',
        status: 'upcoming',
        weather: '☀️ 82°F',
        notes: 'Embarkation day - Golden Hour Protocol'
      },
      { 
        day: 2, 
        date: '2026-02-15', 
        label: 'Sun, Feb 15', 
        port: 'At Sea', 
        time: 'All Day', 
        icon: '🌊',
        status: 'upcoming',
        weather: '⛅ 80°F',
        notes: 'Formal Night #1'
      },
      { 
        day: 3, 
        date: '2026-02-16', 
        label: 'Mon, Feb 16', 
        port: 'George Town, Grand Cayman (Tender)', 
        time: '10:30 AM–6:00 PM', 
        icon: '🏝️',
        status: 'upcoming',
        weather: '☀️ 84°F',
        notes: 'Stingray City or Seven Mile Beach'
      },
      { 
        day: 4, 
        date: '2026-02-17', 
        label: 'Tue, Feb 17', 
        port: 'Falmouth, Jamaica', 
        time: '8:00 AM–5:00 PM', 
        icon: '🌴',
        status: 'upcoming',
        weather: '🌤️ 86°F',
        notes: 'Dunn\'s River Falls or resort day pass'
      },
      { 
        day: 5, 
        date: '2026-02-18', 
        label: 'Wed, Feb 18', 
        port: 'At Sea', 
        time: 'All Day', 
        icon: '🌊',
        status: 'upcoming',
        weather: '🌦️ 79°F',
        notes: 'Formal Night #2 - Lobster night'
      },
      { 
        day: 6, 
        date: '2026-02-19', 
        label: 'Thu, Feb 19', 
        port: 'Perfect Day at CocoCay', 
        time: '7:00 AM–5:00 PM', 
        icon: '☀️',
        status: 'upcoming',
        weather: '☀️ 85°F',
        notes: 'Thrill Waterpark or Chill Island'
      },
      { 
        day: 7, 
        date: '2026-02-20', 
        label: 'Fri, Feb 20', 
        port: 'Port Canaveral', 
        time: 'Arrive 7:00 AM', 
        icon: '🏁',
        status: 'upcoming',
        weather: '☁️ 75°F',
        notes: 'Debarkation - Self-assist recommended'
      },
    ];
    
    this.chapters = this.getChapters();
    this.metrics = {
      tasks: {
        total: 0,
        completed: 0,
        critical: 0,
        warning: 0
      },
      progress: 0,
      streak: 0
    };
  }

  getChapters() {
    // This would load from a more sophisticated data structure
    // For now, returning enhanced chapters
    return [
      {
        id: 'executive',
        num: 1,
        title: 'Executive Summary · Run the Cruise Like Software',
        color: 'primary',
        icon: '🚢',
        sections: [
          {
            title: 'Operating rules',
            icon: '🧭',
            type: 'Principles',
            color: 'blue',
            content: `
              <div class="insight-card">
                <div class="insight-card__header">
                  <i class="fas fa-brain"></i>
                  <h4>Cruise Operating System</h4>
                </div>
                <p class="p">This manual is a <b>human-friendly operations playbook</b>. It assumes real life: small humans, hunger, time windows, and surprise chaos.</p>
                <ul class="list list--check">
                  <li><i class="fas fa-check-circle"></i> <b>Default calm.</b> Fewer decisions. More rhythm.</li>
                  <li><i class="fas fa-check-circle"></i> <b>Do irreversible things early.</b> Muster, reservations, key logistics.</li>
                  <li><i class="fas fa-check-circle"></i> <b>One rendezvous point.</b> Everyone knows where to return.</li>
                  <li><i class="fas fa-check-circle"></i> <b>Red tasks first.</b> Then yellow. Then enjoy being alive.</li>
                </ul>
              </div>
            `,
            tasks: [
              { 
                id: 'exec-muster', 
                emoji: '🔴', 
                text: '<strong>Muster:</strong> complete immediately after boarding. Future-you will thank you.', 
                type: 'crit',
                estimatedTime: '15 min',
                priority: 1
              },
              { 
                id: 'exec-dining', 
                emoji: '🟡', 
                text: '<strong>Dining plan:</strong> lock specialty nights early so you don\'t end up eating sadness at 9:45 PM.', 
                type: 'warn',
                estimatedTime: '30 min',
                priority: 2
              },
              { 
                id: 'exec-rally', 
                emoji: '🟢', 
                text: '<strong>Rendezvous:</strong> pick a default meetup spot + time window. Make it boring. Boring wins.', 
                type: 'ok',
                estimatedTime: '5 min',
                priority: 3
              }
            ]
          }
        ]
      },
      // Additional chapters would follow...
    ];
  }

  todayISO() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  parse(iso) {
    return new Date(iso);
  }

  updateMetrics() {
    const tasks = $$('.task');
    const completed = $$('.task--done');
    const critical = $$('.task--crit');
    const warning = $$('.task--warn');
    
    this.metrics.tasks = {
      total: tasks.length,
      completed: completed.length,
      critical: critical.length,
      warning: warning.length
    };
    
    this.metrics.progress = tasks.length ? 
      Math.round((completed.length / tasks.length) * 100) : 0;
    
    document.dispatchEvent(new CustomEvent('metrics:updated', { 
      detail: this.metrics 
    }));
  }
}

// Enhanced Store with compression and backup
class EnhancedStore {
  constructor(key) { 
    this.key = key; 
    this.state = this.load(); 
  }
  
  load() { 
    try { 
      const data = localStorage.getItem(this.key);
      if (!data) return {};
      
      // Check if data is compressed (starts with {)
      if (data.startsWith('{')) {
        return JSON.parse(data);
      }
      
      // Try to parse as regular JSON
      return JSON.parse(data);
    } catch (e) { 
      console.warn('Failed to load store:', e);
      return {}; 
    } 
  }
  
  save() { 
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
      
      // Create backup every 10 saves
      const saveCount = parseInt(localStorage.getItem(`${this.key}_saveCount`) || '0') + 1;
      localStorage.setItem(`${this.key}_saveCount`, saveCount.toString());
      
      if (saveCount % 10 === 0) {
        localStorage.setItem(`${this.key}_backup`, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Failed to save store:', e);
      
      // If storage is full, try to clear old data
      if (e.name === 'QuotaExceededError') {
        this.cleanup();
        toast.show('Storage full, cleaning up...', 'warning');
      }
    }
  }
  
  cleanup() {
    // Remove oldest backups
    const backupKeys = Object.keys(localStorage).filter(k => k.includes('_backup'));
    if (backupKeys.length > 3) {
      backupKeys.sort().slice(0, backupKeys.length - 3).forEach(k => {
        localStorage.removeItem(k);
      });
    }
  }
  
  get(k, def = null) { 
    return (k in this.state) ? this.state[k] : def; 
  }
  
  set(k, v) { 
    this.state[k] = v; 
    this.save();
    
    // Dispatch change event
    document.dispatchEvent(new CustomEvent('store:updated', { 
      detail: { key: k, value: v } 
    }));
  }
  
  delete(k) {
    delete this.state[k];
    this.save();
  }
  
  clear() {
    this.state = {};
    this.save();
  }
  
  export() {
    return JSON.stringify(this.state, null, 2);
  }
  
  import(data) {
    try {
      const parsed = JSON.parse(data);
      this.state = { ...this.state, ...parsed };
      this.save();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

// Enhanced Task System with categories and priorities
class EnhancedTaskSystem {
  constructor() {
    this.store = new EnhancedStore('mc-tasks-v4');
    this.categories = {
      crit: { icon: '🔴', label: 'Critical', color: 'red' },
      warn: { icon: '🟡', label: 'Recommended', color: 'yellow' },
      ok: { icon: '🟢', label: 'Info', color: 'green' },
      info: { icon: '🔵', label: 'Secondary', color: 'blue' }
    };
  }
  
  init() {
    this.bindCheckboxes();
    this.bindQuickActions();
    
    document.addEventListener('filters:applied', () => this.updateAllProgress());
    document.addEventListener('mc:today', () => this.updateAllProgress());
    
    this.updateAllProgress();
    this.updateCategoryCounts();
  }

  bindCheckboxes() {
    $$('.task[data-task-id]').forEach(task => {
      const id = task.getAttribute('data-task-id');
      const cb = $('.task__check', task);
      if (!id || !cb) return;

      cb.checked = !!this.store.get(id, false);
      task.classList.toggle('task--done', cb.checked);

      on(cb, 'change', () => {
        this.store.set(id, cb.checked);
        task.classList.toggle('task--done', cb.checked);
        
        // Add animation
        if (cb.checked) {
          task.classList.add('task--completed-now');
          setTimeout(() => task.classList.remove('task--completed-now'), 1000);
        }
        
        this.updateAllProgress();
        this.updateCategoryCounts();
        
        // Dispatch event for sync
        document.dispatchEvent(new CustomEvent('task:updated', { 
          detail: { id, completed: cb.checked } 
        }));
        
        // Celebrate when all tasks in a chapter are complete
        const chapter = task.closest('.chapter');
        if (chapter) {
          const chapterProgress = this.chapterProgress(chapter);
          if (chapterProgress.pct === 100) {
            this.createCelebration(chapter);
            toast.show(`Chapter ${chapter.dataset.chapter} complete!`, 'success');
          }
        }
      });
    });
  }

  bindQuickActions() {
    $$('.quick-action').forEach(btn => {
      on(btn, 'click', () => {
        const action = btn.dataset.action;
        this.handleQuickAction(action);
      });
    });
    
    on($('#quick-add'), 'click', () => this.showAddTaskModal());
    on($('#mark-all-done'), 'click', () => this.markAllVisibleDone());
  }

  handleQuickAction(action) {
    const actions = {
      muster: () => {
        const task = $('[data-task-id="exec-muster"]');
        if (task) {
          const cb = $('.task__check', task);
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
        toast.show('Muster drill marked as completed', 'success');
      },
      dining: () => {
        smoothTo($('#dining'));
        toast.show('Navigated to dining section', 'info');
      },
      excursions: () => {
        smoothTo($('#port-days'));
        toast.show('Navigated to excursions', 'info');
      },
      packing: () => {
        this.showPackingList();
      },
      expenses: () => {
        this.showExpenseTracker();
      },
      weather: () => {
        this.showWeatherForecast();
      },
      notes: () => {
        this.showQuickNotes();
      },
      emergency: () => {
        this.showEmergencyInfo();
      }
    };

    if (actions[action]) {
      actions[action]();
    }
  }

  showAddTaskModal() {
    // This would show a modal for adding custom tasks
    toast.show('Custom task feature coming soon!', 'info');
  }

  markAllVisibleDone() {
    const visibleTasks = $$('.task:not(.task--done)').filter(t => t.style.display !== 'none');
    
    if (visibleTasks.length === 0) {
      toast.show('No visible tasks to mark as done', 'info');
      return;
    }
    
    if (!confirm(`Mark all ${visibleTasks.length} visible tasks as complete?`)) {
      return;
    }
    
    visibleTasks.forEach(task => {
      const id = task.getAttribute('data-task-id');
      if (id) {
        this.store.set(id, true);
        task.classList.add('task--done');
        $('.task__check', task).checked = true;
      }
    });
    
    toast.show(`Marked ${visibleTasks.length} tasks as complete`, 'success');
    this.updateAllProgress();
    this.updateCategoryCounts();
  }

  chapterProgress(chapterEl) {
    const tasks = $$('.task[data-task-id]', chapterEl).filter(t => t.style.display !== 'none');
    const total = tasks.length;
    if (!total) return { done: 0, total: 0, pct: 100 };
    
    let done = 0;
    tasks.forEach(t => {
      const id = t.getAttribute('data-task-id');
      if (id && this.store.get(id, false)) done++;
    });
    
    const pct = Math.round((done / total) * 100);
    return { done, total, pct };
  }

  updateAllProgress() {
    // Update per chapter progress
    $$('.chapter').forEach(ch => {
      const chip = $('[data-chapter-progress]', ch);
      if (!chip) return;
      const p = this.chapterProgress(ch);
      chip.innerHTML = `<b>${p.pct}%</b> done`;
      
      // Update chapter progress bar if exists
      const progressBar = $('.chapter__progress', ch);
      if (progressBar) {
        progressBar.style.width = `${p.pct}%`;
      }
    });

    // Update overall progress
    const all = $$('.task[data-task-id]').filter(t => t.style.display !== 'none');
    const total = all.length;
    let done = 0;
    all.forEach(t => {
      const id = t.getAttribute('data-task-id');
      if (id && this.store.get(id, false)) done++;
    });
    
    const pct = total ? Math.round((done / total) * 100) : 100;
    const overallProgress = $('#overall-progress');
    if (overallProgress) {
      overallProgress.textContent = `${pct}%`;
      overallProgress.classList.remove('pill--low', 'pill--medium', 'pill--high');
      
      if (pct < 33) overallProgress.classList.add('pill--low');
      else if (pct < 66) overallProgress.classList.add('pill--medium');
      else overallProgress.classList.add('pill--high');
    }
    
    // Update metrics
    const metrics = {
      tasks: {
        total: $$('.task[data-task-id]').length,
        completed: done,
        pending: total - done
      },
      progress: pct
    };
    
    document.dispatchEvent(new CustomEvent('progress:updated', { detail: metrics }));
  }

  updateCategoryCounts() {
    Object.keys(this.categories).forEach(cat => {
      const countEl = $(`#filter-${cat}-count`);
      if (!countEl) return;
      
      const tasks = $$(`.task--${cat}[data-task-id]`);
      const completed = tasks.filter(t => {
        const id = t.getAttribute('data-task-id');
        return id && this.store.get(id, false);
      }).length;
      
      countEl.textContent = `${completed}/${tasks.length}`;
    });
  }

  createCelebration(element) {
    if (document.documentElement.classList.contains('reduced-effects')) return;
    
    const colors = ['#7dd3fc', '#60a5fa', '#a78bfa', '#a7f3d0', '#fbbf24', '#fb7185'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.position = 'fixed';
      confetti.style.left = rect.left + (rect.width / 2) + 'px';
      confetti.style.top = rect.top + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 12 + 6 + 'px';
      confetti.style.height = Math.random() * 12 + 6 + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.zIndex = '9999';
      document.body.appendChild(confetti);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      let x = 0, y = 0;
      const animate = () => {
        x += vx;
        y += vy;
        vy += 0.1; // gravity
        
        confetti.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;
        confetti.style.opacity = 1 - (y / 300);
        
        if (y < 300) {
          requestAnimationFrame(animate);
        } else {
          confetti.remove();
        }
      };
      
      animate();
    }
  }

  nextMustDo() {
    // Prioritize: critical > warning > other visible tasks
    const pick = (sel) => $$(sel).find(t => {
      if (t.style.display === 'none') return false;
      const id = t.getAttribute('data-task-id');
      return id ? !this.store.get(id, false) : false;
    });

    return pick('.task.task--crit') || pick('.task.task--warn') || pick('.task[data-task-id]');
  }

  showPackingList() {
    // This would show a packing list modal
    const packingList = [
      '✓ Passports & travel documents',
      '✓ SetSail passes (printed backup)',
      '✓ Credit cards & cash',
      '✓ Medications & first aid',
      '✓ Swimwear (2 sets per person)',
      '✓ Sunscreen & sunglasses',
      '✓ Formal night attire',
      '✓ Comfortable walking shoes',
      '✓ Phone chargers & power bank',
      '✓ Waterproof phone case',
      '✓ Small backpack for port days'
    ];
    
    toast.show('Packing list available in full manual', 'info');
  }
}

// Enhanced Itinerary with real-time updates
class EnhancedItinerary {
  constructor(state) { 
    this.state = state; 
    this.currentDay = null;
  }
  
  init() {
    this.daystrip = $('#daystrip');
    this.body = $('#itinerary-body');
    this.banner = $('#today-banner .mono');
    this.progress = $('#daystrip-progress');
    
    this.renderDaystrip();
    this.renderTable();
    this.updateBanner();
    this.updateProgress();
    
    on($('#jump-today'), 'click', () => this.jumpToToday());
    on($('#copy-itin'), 'click', () => this.copyItin());
    on($('#share-itin'), 'click', () => this.shareItin());
    on($('#expand-itin'), 'click', () => this.toggleExpand());
    
    // Update every minute for real-time features
    setInterval(() => {
      this.updateBanner();
      this.updateProgress();
    }, 60000);
  }

  renderDaystrip() {
    if (!this.daystrip) return;
    this.daystrip.innerHTML = '';
    const today = this.state.todayISO();
    this.currentDay = null;

    this.state.itinerary.forEach((d, i) => {
      const b = document.createElement('button');
      b.className = 'daychip';
      b.type = 'button';
      b.innerHTML = `
        <div class="daychip__num">${d.icon} Day ${d.day}</div>
        <div class="daychip__day">${d.label}</div>
        <div class="daychip__port">${d.port}</div>
        <div class="daychip__weather">${d.weather}</div>
      `;
      
      if (d.date === today) {
        b.classList.add('daychip--today');
        b.setAttribute('aria-current', 'true');
        this.currentDay = i;
      } else if (new Date(d.date) < new Date(today)) {
        b.classList.add('daychip--past');
      }
      
      on(b, 'click', () => this.scrollToDay(d.day));
      this.daystrip.appendChild(b);
    });

    // Scroll current day into view
    if (this.currentDay !== null) {
      const chips = $$('.daychip');
      if (chips[this.currentDay]) {
        chips[this.currentDay].scrollIntoView({ 
          behavior: 'smooth', 
          inline: 'center', 
          block: 'nearest' 
        });
      }
    }
  }

  updateProgress() {
    if (!this.progress) return;
    
    const today = new Date(this.state.todayISO());
    const start = new Date(this.state.itinerary[0].date);
    const end = new Date(this.state.itinerary[this.state.itinerary.length - 1].date);
    
    const total = end - start;
    const elapsed = today - start;
    
    let progress = 0;
    if (today < start) {
      progress = 0;
    } else if (today > end) {
      progress = 100;
    } else {
      progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
    
    this.progress.style.width = `${progress}%`;
  }

  renderTable() {
    if (!this.body) return;
    this.body.innerHTML = '';
    const today = this.state.todayISO();

    this.state.itinerary.forEach(d => {
      const tr = document.createElement('tr');
      if (d.date === today) tr.className = 'timeline__row--today';
      else if (new Date(d.date) < new Date(today)) tr.className = 'timeline__row--past';
      
      tr.innerHTML = `
        <td>
          <div class="timeline__day">
            <span class="timeline__day-num">${d.icon} Day ${d.day}</span>
            <span class="timeline__day-label">${d.label}</span>
          </div>
        </td>
        <td>
          <div class="timeline__port">
            <strong>${d.port}</strong>
            <div class="timeline__notes">${d.notes}</div>
          </div>
        </td>
        <td>
          <div class="timeline__time">${d.time}</div>
          <div class="timeline__weather">${d.weather}</div>
        </td>
        <td>
          <span class="status-badge status-badge--${d.status}">${d.status}</span>
        </td>
        <td>
          <div class="timeline__actions">
            <button class="icon-btn icon-btn--small" data-day="${d.day}" title="Jump to day">
              <i class="fas fa-location-arrow"></i>
            </button>
            <button class="icon-btn icon-btn--small" data-day-note="${d.day}" title="Add note">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn icon-btn--small" data-day-share="${d.day}" title="Share">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </td>
      `;
      this.body.appendChild(tr);
    });
    
    // Add event listeners
    $$('[data-day]', this.body).forEach(btn => {
      on(btn, 'click', (e) => {
        const day = e.target.closest('[data-day]').dataset.day;
        this.scrollToDay(day);
      });
    });
  }

  updateBanner() {
    const today = new Date();
    const todayISO = this.state.todayISO();
    const first = this.state.parse(this.state.itinerary[0].date);
    const last = this.state.parse(this.state.itinerary[this.state.itinerary.length - 1].date);

    let status = 'Pre-cruise';
    let icon = '⏳';
    
    const item = this.state.itinerary.find(x => x.date === todayISO);
    if (item) {
      status = `${item.icon} Day ${item.day}: ${item.port}`;
      icon = item.icon;
    } else if (today > last) {
      status = 'Post-cruise';
      icon = '✅';
    } else if (today >= first && today <= last) {
      // Find current day based on date comparison
      for (let i = 0; i < this.state.itinerary.length - 1; i++) {
        const current = new Date(this.state.itinerary[i].date);
        const next = new Date(this.state.itinerary[i + 1].date);
        if (today >= current && today < next) {
          status = `${this.state.itinerary[i].icon} Day ${this.state.itinerary[i].day}: ${this.state.itinerary[i].port}`;
          icon = this.state.itinerary[i].icon;
          break;
        }
      }
    }

    if (this.banner) {
      this.banner.textContent = status;
      const chip = $('#today-banner');
      if (chip) {
        $('strong i', chip).className = icon.includes('fa-') ? `fas ${icon}` : '';
        $('strong i', chip).textContent = !icon.includes('fa-') ? icon : '';
      }
    }
    
    document.dispatchEvent(new CustomEvent('mc:today', { 
      detail: { status, icon, date: todayISO } 
    }));
  }

  jumpToToday() {
    const iso = this.state.todayISO();
    const item = this.state.itinerary.find(x => x.date === iso);
    if (!item) {
      smoothTo($('#top'));
      toast.show('Today is not within sail dates', 'info');
      return;
    }
    
    this.scrollToDay(item.day);
    toast.show(`Jumped to Day ${item.day}: ${item.port}`, 'success');
  }

  scrollToDay(day) {
    const map = {
      1: '#embarkation', 2: '#sea-days', 3: '#port-days', 4: '#port-days',
      5: '#sea-days', 6: '#port-days', 7: '#disembarkation'
    };
    const id = map[day] || '#top';
    const target = $(id) || $('#manual') || $('#top');
    if (!target) return;
    
    smoothTo(target, { behavior: 'smooth', block: 'start' });
    if (target.id) {
      history.replaceState(null, '', `#${target.id}`);
    }
    
    // Highlight the day chip
    $$('.daychip').forEach(chip => chip.classList.remove('daychip--active'));
    const activeChip = $(`.daychip:nth-child(${day})`);
    if (activeChip) {
      activeChip.classList.add('daychip--active');
    }
  }

  async copyItin() {
    const lines = this.state.itinerary.map(d => 
      `Day ${d.day} (${d.label}): ${d.port} — ${d.time} — ${d.weather}`
    );
    const text = `Cruise Itinerary\n${lines.join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.show('Itinerary copied to clipboard', 'success');
    } catch (err) {
      toast.show('Failed to copy itinerary', 'error');
    }
  }

  async shareItin() {
    const text = `Check out our cruise itinerary! ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Our Cruise Itinerary',
          text: text,
          url: window.location.href,
        });
        toast.show('Itinerary shared successfully', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.show('Sharing failed', 'error');
        }
      }
    } else {
      // Fallback to clipboard
      this.copyItin();
    }
  }

  toggleExpand() {
    const panel = $('.panel--itinerary');
    if (!panel) return;
    
    const isExpanded = panel.classList.toggle('panel--expanded');
    const btn = $('#expand-itin');
    if (btn) {
      $('i', btn).className = isExpanded ? 'fas fa-compress' : 'fas fa-expand';
      btn.setAttribute('title', isExpanded ? 'Collapse view' : 'Expand view');
    }
    
    toast.show(`Itinerary view ${isExpanded ? 'expanded' : 'collapsed'}`, 'info');
  }
}

// Enhanced Command Palette
class EnhancedPalette {
  constructor() {
    this.el = $('#palette');
    this.input = $('#palette-input');
    this.list = $('#palette-list');
    this.suggestions = $('#palette-suggestions');
    this.overlay = $('#palette-overlay');
    this.commands = [];
    this.filteredCommands = [];
  }

  init() {
    if (!this.el || !this.input || !this.list) return;

    on($('#open-palette'), 'click', () => this.open());
    on($('#fab-command'), 'click', () => this.open());

    this.input.addEventListener('input', () => this.render());
    this.input.addEventListener('keydown', (e) => this.onKey(e));

    if (this.overlay) {
      on(this.overlay, 'click', () => this.close());
    }

    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { 
        e.preventDefault(); 
        this.open(); 
      }
      if (e.key === 'Escape' && this.el.getAttribute('aria-hidden') === 'false') { 
        e.preventDefault(); 
        this.close(); 
      }
    });

    this.buildCommands();
  }

  buildCommands() {
    const base = [
      { 
        id: 'today', 
        icon: '📍', 
        title: 'Jump to Today', 
        description: 'Auto-scroll to today\'s relevant section', 
        category: 'Navigation',
        shortcut: 'T',
        action: () => { $('#jump-today').click(); }
      },
      { 
        id: 'focus', 
        icon: '🎯', 
        title: 'Toggle Focus Mode', 
        description: 'Show tasks only, hide informational content', 
        category: 'View',
        shortcut: 'F',
        action: () => { 
          const t = $('#focus-mode'); 
          if (t) { 
            t.checked = !t.checked; 
            t.dispatchEvent(new Event('change')); 
          } 
        }
      },
      { 
        id: 'expand', 
        icon: '↕️', 
        title: 'Expand All', 
        description: 'Open all sections and chapter bodies', 
        category: 'View',
        shortcut: 'E',
        action: () => { $('#expand-all').click(); }
      },
      { 
        id: 'collapse', 
        icon: '↕️', 
        title: 'Collapse All', 
        description: 'Hide bodies and close all sections', 
        category: 'View',
        shortcut: 'C',
        action: () => { $('#collapse-all').click(); }
      },
      { 
        id: 'print', 
        icon: '🖨️', 
        title: 'Print / Export PDF', 
        description: 'Open print dialog or generate PDF', 
        category: 'Export',
        shortcut: 'P',
        action: () => window.print()
      },
      { 
        id: 'theme', 
        icon: '🌓', 
        title: 'Cycle Theme', 
        description: 'Switch between auto, dark, and light modes', 
        category: 'Settings',
        shortcut: 'M',
        action: () => { $('#toggle-theme').click(); }
      },
      { 
        id: 'confetti', 
        icon: '🎉', 
        title: 'Celebrate!', 
        description: 'Trigger celebration effect', 
        category: 'Fun',
        shortcut: '🎊',
        action: () => { 
          createConfetti(); 
          toast.show('Celebration!', 'success'); 
        }
      },
      { 
        id: 'export', 
        icon: '📤', 
        title: 'Export All Data', 
        description: 'Export tasks and progress as JSON', 
        category: 'Export',
        shortcut: 'X',
        action: () => this.exportData()
      },
      { 
        id: 'import', 
        icon: '📥', 
        title: 'Import Data', 
        description: 'Import from backup file', 
        category: 'Import',
        shortcut: 'I',
        action: () => this.importData()
      },
      { 
        id: 'stats', 
        icon: '📊', 
        title: 'Show Statistics', 
        description: 'View cruise planning statistics', 
        category: 'Analytics',
        shortcut: 'S',
        action: () => this.showStats()
      }
    ];

    const chapters = $$('.chapter').map(ch => {
      const id = ch.id;
      const num = ch.dataset.chapter || '?';
      const titleEl = $('.chapter__title', ch);
      const title = titleEl && titleEl.textContent ? titleEl.textContent.trim() : 'Section';
      return { 
        id: `ch-${id}`, 
        icon: '§', 
        title: `${num} · ${title}`, 
        description: 'Jump to this section', 
        category: 'Navigation',
        shortcut: '#',
        action: () => smoothTo(ch)
      };
    });

    this.commands = [...base, ...chapters];
  }

  open() {
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.input.value = '';
    this.render();
    
    setTimeout(() => { 
      this.input.focus(); 
      this.input.select(); 
    }, 10);
  }

  close() {
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.input.blur();
  }

  render() {
    const q = this.input.value.trim().toLowerCase();
    
    if (!q) {
      this.showCategories();
      return;
    }

    this.filteredCommands = this.commands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );

    this.list.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      this.list.innerHTML = `
        <div class="palette__empty">
          <div class="palette__empty-icon">🧭</div>
          <div class="palette__empty-title">No matches found</div>
          <div class="palette__empty-desc">Try a different command</div>
        </div>
      `;
      return;
    }

    // Group by category
    const byCategory = {};
    this.filteredCommands.forEach(cmd => {
      if (!byCategory[cmd.category]) byCategory[cmd.category] = [];
      byCategory[cmd.category].push(cmd);
    });

    Object.entries(byCategory).forEach(([category, cmds]) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'palette__category-group';
      categoryEl.innerHTML = `
        <div class="palette__category-header">${category}</div>
      `;

      const list = document.createElement('ul');
      list.className = 'palette__category-list';
      
      cmds.forEach((cmd, idx) => {
        const li = document.createElement('li');
        li.className = 'cmd';
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', idx);
        li.innerHTML = `
          <div class="cmd__left">
            <div class="cmd__ic" aria-hidden="true">${cmd.icon}</div>
            <div class="cmd__text">
              <div class="cmd__title">${cmd.title}</div>
              <div class="cmd__desc">${cmd.description}</div>
            </div>
          </div>
          <div class="cmd__kbd">${cmd.shortcut}</div>
        `;
        
        on(li, 'click', () => { 
          this.close(); 
          cmd.action(); 
        });
        
        on(li, 'keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            this.close(); 
            cmd.action(); 
          }
        });
        
        list.appendChild(li);
      });
      
      categoryEl.appendChild(list);
      this.list.appendChild(categoryEl);
    });

    // Set first item as selected
    const firstItem = $('.cmd', this.list);
    if (firstItem) {
      firstItem.setAttribute('aria-selected', 'true');
      firstItem.tabIndex = 0;
    }
  }

  showCategories() {
    this.list.innerHTML = '';
    
    const categories = {};
    this.commands.forEach(cmd => {
      if (!categories[cmd.category]) categories[cmd.category] = 0;
      categories[cmd.category]++;
    });

    Object.entries(categories).forEach(([category, count]) => {
      const div = document.createElement('div');
      div.className = 'palette__category-preview';
      div.innerHTML = `
        <div class="palette__category-preview-icon">${this.getCategoryIcon(category)}</div>
        <div class="palette__category-preview-content">
          <div class="palette__category-preview-title">${category}</div>
          <div class="palette__category-preview-count">${count} commands</div>
        </div>
        <div class="palette__category-preview-arrow">→</div>
      `;
      
      on(div, 'click', () => {
        this.input.value = category.toLowerCase();
        this.render();
      });
      
      this.list.appendChild(div);
    });
  }

  getCategoryIcon(category) {
    const icons = {
      Navigation: '📍',
      View: '👁️',
      Export: '📤',
      Import: '📥',
      Settings: '⚙️',
      Analytics: '📊',
      Fun: '🎉'
    };
    return icons[category] || '📋';
  }

  onKey(e) {
    if (e.key === 'Escape') { 
      e.preventDefault(); 
      this.close(); 
      return; 
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = $('.cmd[aria-selected="true"]', this.list);
      if (selected) selected.click();
      return;
    }
    
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      this.nav(1); 
      return; 
    }
    
    if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      this.nav(-1); 
      return; 
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const selected = $('.cmd[aria-selected="true"]', this.list);
      if (selected) {
        const index = parseInt(selected.dataset.index || '0');
        const categoryGroup = selected.closest('.palette__category-list');
        const nextIndex = (index + 1) % categoryGroup.children.length;
        
        selected.removeAttribute('aria-selected');
        selected.tabIndex = -1;
        
        const nextItem = categoryGroup.children[nextIndex];
        nextItem.setAttribute('aria-selected', 'true');
        nextItem.tabIndex = 0;
        nextItem.focus();
      }
    }
  }

  nav(dir) {
    const items = $$('.cmd', this.list);
    if (!items.length) return;
    
    const cur = items.findIndex(x => x.getAttribute('aria-selected') === 'true');
    let next = cur + dir;
    
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    
    items.forEach((it, i) => {
      it.setAttribute('aria-selected', i === next ? 'true' : 'false');
      it.tabIndex = i === next ? 0 : -1;
    });
    
    items[next].scrollIntoView({ block: 'nearest' });
  }

  exportData() {
    const tasks = {};
    $$('.task[data-task-id]').forEach(task => {
      const id = task.getAttribute('data-task-id');
      const store = new EnhancedStore('mc-tasks-v4');
      tasks[id] = store.get(id, false);
    });
    
    const data = {
      tasks,
      exportDate: new Date().toISOString(),
      version: '3.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruise-companion-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.show('Data exported successfully', 'success');
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks) {
            const store = new EnhancedStore('mc-tasks-v4');
            Object.entries(data.tasks).forEach(([id, completed]) => {
              store.set(id, completed);
            });
            
            // Refresh task display
            $$('.task[data-task-id]').forEach(task => {
              const id = task.getAttribute('data-task-id');
              const cb = $('.task__check', task);
              if (id && cb) {
                cb.checked = !!store.get(id, false);
                task.classList.toggle('task--done', cb.checked);
              }
            });
            
            toast.show('Data imported successfully', 'success');
            document.dispatchEvent(new CustomEvent('tasks:reloaded'));
          }
        } catch (err) {
          toast.show('Failed to import data', 'error');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  showStats() {
    const tasks = $$('.task[data-task-id]');
    const completed = $$('.task--done');
    const critical = $$('.task--crit');
    const warning = $$('.task--warn');
    
    const stats = {
      total: tasks.length,
      completed: completed.length,
      pending: tasks.length - completed.length,
      completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
      critical: critical.length,
      warning: warning.length
    };
    
    const message = `
      📊 Cruise Stats:
      • Total tasks: ${stats.total}
      • Completed: ${stats.completed}
      • Pending: ${stats.pending}
      • Completion: ${stats.completionRate}%
      • Critical: ${stats.critical}
      • Recommended: ${stats.warning}
    `;
    
    toast.show(message, 'info');
  }
}

// Enhanced KPIs with real-time updates
class EnhancedKPIs {
  constructor(state, tasks) { 
    this.state = state; 
    this.tasks = tasks;
    this.metrics = {
      nextTask: null,
      countdown: '',
      today: '',
      visible: '',
      weather: '',
      time: ''
    };
  }
  
  init() {
    this.kNext = $('#kpi-next');
    this.kNextTime = $('#kpi-next-time');
    this.kCountdown = $('#kpi-countdown');
    this.kToday = $('#kpi-today');
    this.kTodayDate = $('#kpi-today-date');
    this.kVisible = $('#kpi-visible');
    this.metricTasks = $('#metric-tasks');
    this.metricTime = $('#metric-time');
    this.metricWeather = $('#metric-weather');
    this.metricProgress = $('#metric-progress');
    this.aiInsight = $('#ai-insight');

    this.updateAll();
    
    document.addEventListener('filters:applied', () => this.updateAll());
    document.addEventListener('mc:today', () => this.updateAll());
    document.addEventListener('task:updated', () => this.updateAll());
    document.addEventListener('progress:updated', (e) => this.updateProgress(e.detail));
    
    setInterval(() => {
      this.updateCountdown();
      this.updateTime();
    }, 60000);
    
    setInterval(() => {
      this.updateWeather();
      this.updateInsight();
    }, 300000);
    
    if ($('#refresh-analytics')) {
      on($('#refresh-analytics'), 'click', () => this.updateAll());
    }
  }

  updateAll() {
    this.updateNext();
    this.updateCountdown();
    this.updateToday();
    this.updateVisible();
    this.updateTime();
    this.updateWeather();
    this.updateInsight();
  }

  updateNext() {
    if (!this.kNext) return;
    const t = this.tasks.nextMustDo();
    
    if (t) {
      const text = t.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) + '...';
      this.kNext.textContent = text;
      
      // Estimate time
      const type = t.classList.contains('task--crit') ? 'Critical' : 
                   t.classList.contains('task--warn') ? 'Recommended' : 'Info';
      this.kNextTime.textContent = `${type} task`;
      
      this.metrics.nextTask = text;
    } else {
      this.kNext.textContent = 'All caught up!';
      this.kNextTime.textContent = 'No pending tasks';
      this.metrics.nextTask = null;
    }
  }

  updateCountdown() {
    if (!this.kCountdown) return;
    const sail = this.state.parse(this.state.itinerary[0].date);
    const now = new Date();
    const ms = sail - now;
    
    if (ms <= 0) { 
      this.kCountdown.textContent = 'Sailing now!';
      this.metrics.countdown = 'Active';
      return; 
    }
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    this.kCountdown.textContent = `${days}d ${hours}h ${mins}m`;
    this.metrics.countdown = `${days} days`;
  }

  updateToday() {
    if (!this.kToday) return;
    const iso = this.state.todayISO();
    const item = this.state.itinerary.find(d => d.date === iso);
    
    if (item) {
      this.kToday.textContent = `Day ${item.day}`;
      this.kTodayDate.textContent = item.label;
      this.metrics.today = `Day ${item.day}: ${item.port}`;
    } else {
      const today = new Date();
      const first = new Date(this.state.itinerary[0].date);
      const last = new Date(this.state.itinerary[this.state.itinerary.length - 1].date);
      
      if (today < first) {
        this.kToday.textContent = 'Pre-cruise';
        this.kTodayDate.textContent = 'Getting ready';
        this.metrics.today = 'Pre-cruise';
      } else if (today > last) {
        this.kToday.textContent = 'Post-cruise';
        this.kTodayDate.textContent = 'Memories made';
        this.metrics.today = 'Post-cruise';
      } else {
        this.kToday.textContent = 'Cruising';
        this.kTodayDate.textContent = 'Enjoying the voyage';
        this.metrics.today = 'At sea';
      }
    }
  }

  updateVisible() {
    if (!this.kVisible) return;
    const visible = $$('.task').filter(t => t.style.display !== 'none').length;
    const total = $$('.task').length;
    const completed = $$('.task--done').filter(t => t.style.display !== 'none').length;
    
    this.kVisible.textContent = `${completed}/${visible} of ${total}`;
    this.metrics.visible = `${completed}/${visible}`;
  }

  updateProgress(metrics) {
    if (!this.metricProgress || !this.metricTasks) return;
    
    if (metrics) {
      this.metricTasks.textContent = metrics.tasks.pending;
      this.metricProgress.textContent = `${metrics.progress}%`;
    }
  }

  updateTime() {
    if (!this.metricTime) return;
    
    // Simulate ship time (EST for Caribbean)
    const now = new Date();
    const shipTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = shipTime.getHours().toString().padStart(2, '0');
    const minutes = shipTime.getMinutes().toString().padStart(2, '0');
    
    this.metricTime.textContent = `${hours}:${minutes}`;
    this.metrics.time = `${hours}:${minutes}`;
  }

  updateWeather() {
    if (!this.metricWeather) return;
    
    // Simulate weather data
    const conditions = ['☀️', '⛅', '🌤️', '🌦️', '🌧️', '⛈️'];
    const temps = [78, 79, 80, 81, 82, 83, 84, 85, 86];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = temps[Math.floor(Math.random() * temps.length)];
    
    this.metricWeather.textContent = `${condition} ${temp}°`;
    this.metrics.weather = `${temp}°F`;
  }

  updateInsight() {
    if (!this.aiInsight) return;
    
    const insights = [
      "Complete critical tasks early. One meeting point reduces confusion. Keep snacks accessible.",
      "Book specialty dining on embarkation day for best times. Check the app daily for last-minute openings.",
      "At tender ports, go early or late to avoid lines. Consider ship excursions for priority tendering.",
      "Use the ship's quiet hours (usually 10 PM - 7 AM) for the best pool and hot tub access.",
      "Take photos early in the cruise when everyone looks fresh. Formal nights are perfect for family portraits.",
      "Keep a small 'go bag' ready with sunscreen, hats, and water bottles for quick port adventures.",
      "Check the daily Cruise Compass the night before to plan your next day's activities.",
      "Use the ship's app for real-time updates on restaurant wait times and activity schedules.",
      "Designate a 'home base' spot on the ship where your group can always meet if separated.",
      "Pack a power strip for extra outlets, but check cruise line policies first."
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    this.aiInsight.textContent = randomInsight;
  }
}

// Enhanced Chapter Renderer with animations
class EnhancedChapterRenderer {
  constructor(state) {
    this.state = state;
    this.observer = null;
  }
  
  init() {
    this.renderChapters();
    this.bindChapterToggles();
    this.setupIntersectionObserver();
  }
  
  renderChapters() {
    const container = $('#chapters');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.state.chapters.forEach((chapter, index) => {
      const chapterEl = document.createElement('article');
      chapterEl.className = 'chapter';
      chapterEl.id = chapter.id;
      chapterEl.dataset.chapter = chapter.num;
      chapterEl.style.opacity = '0';
      chapterEl.style.transform = 'translateY(20px)';
      
      // Build sections HTML
      let sectionsHTML = '';
      chapter.sections.forEach(section => {
        let tasksHTML = '';
        if (section.tasks && section.tasks.length) {
          tasksHTML = section.tasks.map(task => `
            <div class="task task--${task.type}" data-task-id="${task.id}">
              <div class="task__header">
                <input class="task__check" type="checkbox" aria-label="Mark task done">
                <div class="task__emoji">${task.emoji}</div>
                <div class="task__text">${task.text}</div>
              </div>
              <div class="task__meta">
                <span class="task__time">${task.estimatedTime}</span>
                <span class="task__priority">Priority: ${task.priority}</span>
              </div>
            </div>
          `).join('');
        }
        
        sectionsHTML += `
          <details class="section" open>
            <summary class="section__summary">
              <div class="section__header">
                <span class="section__type" style="background: var(--color-${section.color})">${section.type}</span>
                <h4 class="section__title">${section.title}</h4>
              </div>
              <div class="section__actions">
                <span class="section__icon">${section.icon}</span>
                <svg class="section__chevron" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </summary>
            <div class="section__body">
              ${section.content}
              ${tasksHTML ? `<div class="tasks-grid">${tasksHTML}</div>` : ''}
            </div>
          </details>
        `;
      });
      
      chapterEl.innerHTML = `
        <header class="chapter__header">
          <div class="chapter__header-left">
            <div class="chapter__badge">
              <span class="chapter__number">${/^\d+$/.test(String(chapter.num)) ? String(chapter.num).padStart(2, '0') : String(chapter.num)}</span>
              <span class="chapter__icon">${chapter.icon}</span>
            </div>
            <div class="chapter__title-container">
              <h3 class="chapter__title">${chapter.title}</h3>
              ${chapter.blurb ? `<p class="chapter__blurb">${chapter.blurb}</p>` : ''}
            </div>
          </div>
          <div class="chapter__header-right">
            <div class="chapter__progress">
              <div class="chapter__progress-bar">
                <div class="chapter__progress-fill" style="width: 0%"></div>
              </div>
              <span class="chapter__progress-text" data-chapter-progress>0%</span>
            </div>
            <button class="chapter__toggle" data-chapter-toggle aria-label="Toggle chapter body" title="Collapse/Expand">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </header>
        <div class="chapter__body">
          ${sectionsHTML}
        </div>
      `;
      
      container.appendChild(chapterEl);
      
      // Animate in
      setTimeout(() => {
        chapterEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        chapterEl.style.opacity = '1';
        chapterEl.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
    // Hide loading state
    const loading = $('#chapters-loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }
  
  bindChapterToggles() {
    $$('.chapter').forEach(ch => {
      const btn = $('.chapter__toggle', ch);
      const body = $('.chapter__body', ch);
      if (!btn || !body) return;
      
      on(btn, 'click', () => {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? '' : 'none';
        btn.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        btn.setAttribute('aria-label', isHidden ? 'Collapse chapter' : 'Expand chapter');
      });
    });
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('chapter--visible');
        }
      });
    }, options);
    
    $$('.chapter').forEach(chapter => {
      this.observer.observe(chapter);
    });
  }
}

// Filters and presets for task visibility
class Filters {
  constructor() {
    this.filters = {
      crit: $('#filter-crit'),
      warn: $('#filter-warn'),
      ok: $('#filter-ok'),
      info: $('#filter-info')
    };
    this.focusToggle = $('#focus-mode');
    this.presets = $$('.filter-preset');
    this.expandBtn = $('#expand-all');
    this.collapseBtn = $('#collapse-all');
    this.tasksOnly = false;
  }

  init() {
    Object.values(this.filters).forEach(input => {
      on(input, 'change', () => this.applyFilters());
    });

    on(this.focusToggle, 'change', () => this.applyFilters());

    this.presets.forEach(btn => {
      on(btn, 'click', () => this.applyPreset(btn.dataset.preset));
    });

    on(this.expandBtn, 'click', () => this.toggleAll(true));
    on(this.collapseBtn, 'click', () => this.toggleAll(false));

    this.applyFilters();
  }

  applyPreset(preset) {
    if (preset === 'all') {
      this.setAllFilters(true);
      this.tasksOnly = false;
      if (this.focusToggle) this.focusToggle.checked = false;
      toast.show('Showing all items', 'info');
    } else if (preset === 'tasks') {
      this.setAllFilters(true);
      this.tasksOnly = true;
      if (this.focusToggle) this.focusToggle.checked = false;
      toast.show('Showing task-focused view', 'info');
    } else if (preset === 'today') {
      if (this.filters.crit) this.filters.crit.checked = true;
      if (this.filters.warn) this.filters.warn.checked = true;
      if (this.filters.ok) this.filters.ok.checked = false;
      if (this.filters.info) this.filters.info.checked = false;
      this.tasksOnly = true;
      if (this.focusToggle) this.focusToggle.checked = true;
      toast.show('Showing today’s priorities', 'info');
    }

    this.applyFilters();
  }

  setAllFilters(value) {
    Object.values(this.filters).forEach(input => {
      if (input) input.checked = value;
    });
  }

  applyFilters() {
    const active = {
      crit: this.filters.crit ? this.filters.crit.checked : true,
      warn: this.filters.warn ? this.filters.warn.checked : true,
      ok: this.filters.ok ? this.filters.ok.checked : true,
      info: this.filters.info ? this.filters.info.checked : true
    };
    const focusMode = this.focusToggle ? this.focusToggle.checked : false;

    $$('.task').forEach(task => {
      const matchesType = Object.keys(active).some(type => 
        task.classList.contains(`task--${type}`) && active[type]
      );
      const isDone = task.classList.contains('task--done');
      const visible = matchesType && (!focusMode || !isDone);
      task.style.display = visible ? '' : 'none';
    });

    // Hide sections with no visible tasks when in task-only mode
    $$('.section').forEach(section => {
      const tasks = $$('.task', section);
      if (!tasks.length) {
        section.style.display = this.tasksOnly ? 'none' : '';
        return;
      }
      const hasVisible = tasks.some(task => task.style.display !== 'none');
      section.style.display = hasVisible ? '' : 'none';
    });

    document.dispatchEvent(new CustomEvent('filters:applied'));
  }

  toggleAll(expand) {
    $$('.chapter').forEach(ch => {
      const body = $('.chapter__body', ch);
      const btn = $('.chapter__toggle', ch);
      if (body) body.style.display = expand ? '' : 'none';
      if (btn) {
        btn.style.transform = expand ? 'rotate(0deg)' : 'rotate(180deg)';
        btn.setAttribute('aria-label', expand ? 'Collapse chapter' : 'Expand chapter');
      }
    });

    $$('.section').forEach(section => {
      section.open = expand;
    });

    toast.show(expand ? 'Expanded all chapters' : 'Collapsed all chapters', 'info');
  }
}

// Table of contents helper
class TOC {
  constructor() {
    this.tocEl = $('#toc');
    this.chapterCount = $('#toc-chapter-count');
    this.taskCount = $('#toc-task-count');
    this.items = [];
    this.observer = null;
  }

  init() {
    if (!this.tocEl) return;
    this.build();
    this.observeChapters();
  }

  build() {
    const chapters = $$('.chapter');
    this.tocEl.innerHTML = '';
    this.items = chapters.map(ch => {
      const title = $('.chapter__title', ch)?.textContent || ch.id;
      const num = ch.dataset.chapter ? `Chapter ${ch.dataset.chapter}` : 'Chapter';
      const li = document.createElement('li');
      li.className = 'toc__item';
      li.innerHTML = `
        <button class="toc__link" type="button" data-target="${ch.id}">
          <span class="toc__title">${num} · ${title}</span>
        </button>
      `;
      const btn = $('button', li);
      on(btn, 'click', () => {
        smoothTo(ch, { behavior: 'smooth', block: 'start' });
      });
      this.tocEl.appendChild(li);
      return { chapter: ch, element: li, title: `${num} ${title}`.toLowerCase() };
    });

    if (this.chapterCount) this.chapterCount.textContent = chapters.length;
    if (this.taskCount) this.taskCount.textContent = $$('.task').length;
  }

  observeChapters() {
    if (this.observer) this.observer.disconnect();

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = this.items.find(i => i.chapter === entry.target);
        if (!item) return;
        item.element.classList.toggle('toc__item--active', entry.isIntersecting);
      });
    }, { threshold: 0.25 });

    this.items.forEach(item => this.observer.observe(item.chapter));
  }
}

// Progress bar at top
class ProgressBar {
  constructor() {
    this.el = $('#progress');
  }

  init() {
    if (!this.el) return;
    const update = () => this.update();
    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
    update();
  }

  update() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.el.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
  }
}

// Enhanced FAB with more actions
class EnhancedFAB {
  constructor() {
    this.fab = $('#fab');
    this.mainBtn = $('#fab-main');
    this.items = $$('.fab__btn:not(#fab-main)');
    this.isOpen = false;
  }

  init() {
    if (!this.fab || !this.mainBtn) return;

    on(this.mainBtn, 'click', () => this.toggle());
    on(document, 'click', (e) => {
      if (!this.fab.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Bind individual FAB buttons
    on($('#fab-top'), 'click', () => {
      smoothTo($('#top'));
      toast.show('Back to top', 'info');
      this.close();
    });
    
    on($('#fab-command'), 'click', () => {
      $('#open-palette').click();
      this.close();
    });
    
    on($('#fab-help'), 'click', () => {
      toast.show('Press Ctrl/⌘K for commands, Enter to confirm', 'info');
      this.close();
    });
    
    on($('#fab-settings'), 'click', () => {
      toast.show('Settings panel coming soon!', 'info');
      this.close();
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.fab.classList.add('fab--open');
    this.mainBtn.setAttribute('aria-expanded', 'true');
    this.items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 50}ms`;
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
      item.removeAttribute('tabindex');
    });
    this.isOpen = true;
  }

  close() {
    this.fab.classList.remove('fab--open');
    this.mainBtn.setAttribute('aria-expanded', 'false');
    this.items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'scale(0)';
      item.setAttribute('tabindex', '-1');
    });
    this.isOpen = false;
  }
}

// Main application boot
document.addEventListener('DOMContentLoaded', () => {
  // Enhanced loading screen
  const loading = $('#loading');
  const loadingProgress = $('#loading-progress');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (loadingProgress) {
      loadingProgress.style.width = `${Math.min(progress, 100)}%`;
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      loading.classList.add('loading--complete');
      
      setTimeout(() => {
        loading.style.display = 'none';
        document.body.style.overflow = '';
        initApp();
      }, 500);
    }
  }, 100);
});

function initApp() {
  // Initialize performance monitor
  const performanceMonitor = new PerformanceMonitor();
  performanceMonitor.init();
  
  // Initialize all components
  const state = new AppState();
  const theme = new ThemeSystem(); 
  theme.init();
  
  const effects = new EffectsSystem(); 
  effects.init();
  
  const sync = new SyncSystem(); 
  sync.init();
  
  const ai = new AIAssistant(); 
  ai.init();
  
  const itin = new EnhancedItinerary(state); 
  itin.init();
  
  const chapterRenderer = new EnhancedChapterRenderer(state); 
  chapterRenderer.init();
  
  const tasks = new EnhancedTaskSystem(); 
  tasks.init();
  
  
  const palette = new EnhancedPalette(); 
  palette.init();
  
  const kpi = new EnhancedKPIs(state, tasks); 
  kpi.init();
  
  const fab = new EnhancedFAB(); 
  fab.init();
  
  // Initialize filters
  const filters = new Filters(); 
  filters.init();
  
  // Initialize TOC
  const toc = new TOC(); 
  toc.init();
  
  // Initialize progress bar
  const pb = new ProgressBar(); 
  pb.init();
  
  // Apply icon fallback
  applyIconFallback();
  
  // Bind additional events
  bindPrint();
  bindFeedback();
  bindExport();
  bindReset();
  
  // Welcome
  setTimeout(() => {
    toast.show('Mission Control 3.0 Ready 🚢', 'success');
    
    // Animate badges
    document.querySelectorAll('.hero__badges .badge').forEach((badge, i) => {
      setTimeout(() => {
        badge.style.transform = 'translateY(0)';
        badge.style.opacity = '1';
      }, i * 100);
    });
  }, 500);
}

// Helper functions
function bindPrint() {
  on($('#print-btn'), 'click', () => {
    toast.show('Opening print dialog...', 'info');
    setTimeout(() => window.print(), 300);
  });
}

function bindFeedback() {
  on($('#feedback-btn'), 'click', () => {
    toast.show('Feedback feature coming soon!', 'info');
  });
}

function bindExport() {
  on($('#export-btn'), 'click', () => {
    palette.exportData();
  });
}

function bindReset() {
  on($('#reset-btn'), 'click', () => {
    if (confirm('Reset all progress and data? This cannot be undone.')) {
      localStorage.clear();
      toast.show('All data reset. Refreshing...', 'warning');
      setTimeout(() => location.reload(), 1500);
    }
  });
}

function applyIconFallback() {
  const root = document.documentElement;
  if (!document.fonts || !document.fonts.load) {
    root.classList.add('fa-missing');
    return;
  }
  
  document.fonts.load('1em "Font Awesome 6 Free"')
    .then(() => {
      if (!document.fonts.check('1em "Font Awesome 6 Free"')) {
        root.classList.add('fa-missing');
      }
    })
    .catch(() => root.classList.add('fa-missing'));
}

function smoothTo(el, opts = {}) {
  if (!el) return;
  el.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start', 
    ...opts 
  });
}

function createConfetti() {
  if (document.documentElement.classList.contains('reduced-effects')) return;
  
  const colors = ['#7dd3fc', '#60a5fa', '#a78bfa', '#a7f3d0', '#fbbf24', '#fb7185'];
  
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-20px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 12 + 6 + 'px';
    confetti.style.height = Math.random() * 12 + 6 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
      { 
        transform: 'translateY(0) rotate(0deg)', 
        opacity: 1 
      },
      { 
        transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg)`, 
        opacity: 0 
      }
    ], {
      duration: Math.random() * 3000 + 2000,
      easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
    });
    
    animation.onfinish = () => confetti.remove();
  }
}
